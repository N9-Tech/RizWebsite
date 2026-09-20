const fs = require('fs');
const path = require('path');
const ts = require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js');

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const files = walk(path.resolve('src')).filter((file) => /\.(ts|tsx)$/.test(file));
let failures = 0;
for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  const result = ts.transpileModule(source, {
    fileName: file,
    reportDiagnostics: true,
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.ReactJSX,
      isolatedModules: true,
    },
  });
  const diagnostics = (result.diagnostics || []).filter((d) => d.category === ts.DiagnosticCategory.Error);
  if (diagnostics.length) {
    failures += diagnostics.length;
    for (const diagnostic of diagnostics) {
      const msg = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      console.error(`${file}: ${msg}`);
    }
  }
}
console.log(`Parsed ${files.length} TS/TSX files; syntax errors: ${failures}`);
process.exitCode = failures ? 1 : 0;