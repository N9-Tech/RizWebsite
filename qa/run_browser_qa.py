from pathlib import Path
import base64, re, json, asyncio
from playwright.async_api import async_playwright

ROOT=Path('/mnt/data/theace9-final-polish/theace9-build-engine-portfolio')
html=(ROOT/'preview/index.html').read_text()
css=(ROOT/'preview/style.css').read_text()
js=(ROOT/'preview/preview.js').read_text()
html=re.sub(r'<link[^>]+href="style\.css"[^>]*>', '', html)
html=re.sub(r'<script src="preview\.js"></script>', '', html)
for svg in (ROOT/'preview/images').glob('*.svg'):
    data='data:image/svg+xml;base64,'+base64.b64encode(svg.read_bytes()).decode()
    html=html.replace(f'images/{svg.name}', data)

async def run_case(browser, name, width, height, mobile=False):
    page=await browser.new_page(viewport={"width":width,"height":height}, is_mobile=mobile)
    errors=[]
    page.on('console', lambda m: errors.append(f'console:{m.type}:{m.text}') if m.type=='error' else None)
    page.on('pageerror', lambda e: errors.append(f'page:{e}'))
    await page.set_content(html, wait_until='domcontentloaded')
    await page.add_style_tag(content=css)
    await page.add_script_tag(content=js)
    await page.wait_for_timeout(900)
    dims=await page.evaluate('''() => ({
      sw:document.documentElement.scrollWidth,
      cw:document.documentElement.clientWidth,
      h1:document.querySelectorAll('h1').length,
      body:document.body.scrollHeight,
      duplicateIds:[...document.querySelectorAll('[id]')].map(e=>e.id).filter((id,i,a)=>a.indexOf(id)!==i),
      imagesOk:[...document.images].every(img=>img.complete && img.naturalWidth>0),
      ringAnimated:getComputedStyle(document.querySelector('.preview-engine .ring')).animationName !== 'none'
    })''')
    hero=ROOT/'qa'/f'{name}-hero.png'
    await page.screenshot(path=str(hero), full_page=False)
    menu_ok=True
    menu_a11y_ok=True
    if width<=1023:
        closed_tabs=await page.locator('.mobile-menu a').evaluate_all("els=>els.every(e=>e.tabIndex===-1)")
        await page.click('.menu-button')
        menu_ok=await page.locator('.mobile-menu').evaluate("e=>e.classList.contains('open') && getComputedStyle(e).pointerEvents==='auto'")
        open_tabs=await page.locator('.mobile-menu a').evaluate_all("els=>els.every(e=>e.tabIndex===0)")
        await page.screenshot(path=str(ROOT/'qa'/f'{name}-menu.png'), full_page=False)
        await page.click('.menu-button')
        reclosed_tabs=await page.locator('.mobile-menu a').evaluate_all("els=>els.every(e=>e.tabIndex===-1)")
        menu_a11y_ok=closed_tabs and open_tabs and reclosed_tabs
    await page.locator('#work').scroll_into_view_if_needed()
    await page.wait_for_timeout(350)
    work=ROOT/'qa'/f'{name}-work.png'
    await page.screenshot(path=str(work), full_page=False)
    await page.locator('.console-section').scroll_into_view_if_needed()
    await page.wait_for_timeout(250)
    await page.locator('.console-tabs button').nth(1).click()
    console_text=await page.locator('#console-output').inner_text()
    console_ok='automation ready' in console_text
    await page.locator('.stack-section').scroll_into_view_if_needed()
    await page.wait_for_timeout(220)
    await page.locator('.stack-plane').nth(3).click()
    stack_ok=await page.locator('.stack-plane').nth(3).evaluate("e=>e.classList.contains('active')")
    scroll_progress=float(await page.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--page-progress') || 0"))
    await page.close()
    return {"name":name,"viewport":[width,height],"overflow":dims['sw']-dims['cw'],"h1":dims['h1'],"duplicate_ids":dims['duplicateIds'],"images_ok":dims['imagesOk'],"motion_active":dims['ringAnimated'],"menu_ok":menu_ok,"menu_a11y_ok":menu_a11y_ok,"console_ok":console_ok,"stack_ok":stack_ok,"scroll_progress":scroll_progress,"errors":errors}

async def main():
    async with async_playwright() as p:
        browser=await p.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu-sandbox'])
        results=[]
        for case in [('mobile-390',390,844,True),('mobile-430',430,932,True),('tablet-768',768,1024,False),('tablet-1024',1024,768,False),('desktop-1280',1280,800,False),('desktop-1440',1440,900,False),('desktop-1920',1920,1080,False)]:
            results.append(await run_case(browser,*case))
        await browser.close()
    (ROOT/'qa'/'cinematic_qa.json').write_text(json.dumps(results,indent=2))
    print(json.dumps(results,indent=2))
    if any(r['overflow']>0 or r['h1']!=1 or r['duplicate_ids'] or not r['images_ok'] or not r['motion_active'] or not r['menu_ok'] or not r['menu_a11y_ok'] or not r['console_ok'] or not r['stack_ok'] or r['errors'] for r in results):
        raise SystemExit(1)

asyncio.run(main())