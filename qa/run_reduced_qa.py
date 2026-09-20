from pathlib import Path
import base64,re,asyncio,json
from playwright.async_api import async_playwright
ROOT=Path('/mnt/data/theace9-final-polish/theace9-build-engine-portfolio')
html=(ROOT/'preview/index.html').read_text();css=(ROOT/'preview/style.css').read_text();js=(ROOT/'preview/preview.js').read_text()
html=re.sub(r'<link[^>]+href="style\\.css"[^>]*>','',html);html=html.replace('<script src="preview.js"></script>','')
for svg in (ROOT/'preview/images').glob('*.svg'):
 d='data:image/svg+xml;base64,'+base64.b64encode(svg.read_bytes()).decode();html=html.replace(f'images/{svg.name}',d)
async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
  ctx=await b.new_context(viewport={'width':1440,'height':900}, reduced_motion='reduce')
  page=await ctx.new_page();errs=[];page.on('pageerror',lambda e:errs.append(str(e)));page.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
  await page.set_content(html);await page.add_style_tag(content=css);await page.add_script_tag(content=js);await page.wait_for_timeout(250)
  checks=await page.evaluate('''() => {const ring=document.querySelector('.preview-engine .ring');const pg=document.querySelector('.page-progress');return {ringAnimation:getComputedStyle(ring).animationName,pageProgress:getComputedStyle(pg).display,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}}''')
  result={'checks':checks,'errors':errs}
  (ROOT/'qa'/'reduced_motion_qa.json').write_text(json.dumps(result,indent=2))
  print(json.dumps(result,indent=2)); await b.close()
  if checks['ringAnimation']!='none' or checks['pageProgress']!='none' or checks['overflow']>0 or errs: raise SystemExit(1)
asyncio.run(main())