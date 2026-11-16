const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const root = path.resolve(__dirname, '..');
const dest = path.join(root, 'dist-android');
fs.rmSync(dest, {recursive:true, force:true});
fs.mkdirSync(dest, {recursive:true});
// Preserve every tracked web file and its relative path, including data and licenses.
for (const file of cp.execFileSync('git', ['ls-files', '-z'], {cwd:root}).toString().split('\0').filter(Boolean)) {
  if (file.startsWith('.') || /^(android|scripts|tests|docs)\//.test(file) || /^(package(-lock)?\.json|capacitor\.config\.json)$/.test(file)) continue;
  fs.mkdirSync(path.dirname(path.join(dest,file)), {recursive:true});
  fs.copyFileSync(path.join(root,file), path.join(dest,file));
}
// Only the Android copy uses bundled archive photos. Website source stays unchanged.
const multan = path.join(dest,'apps/multan/game.js');
let source = fs.readFileSync(multan,'utf8');
source = source.replace(/https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/4\/48\/FUDSS-Q7337\.jpg/g,'assets/archive/FUDSS-Q7337.jpg')
 .replace(/https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/c\/c8\/Udmurt_women_1907\.jpg/g,'assets/archive/Udmurt_women_1907.jpg')
 .replace(/https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/3\/3f\/FUDSS-Q7334\.jpg/g,'assets/archive/FUDSS-Q7334.jpg')
 .replace('Фотографии загружаются с Wikimedia Commons при наличии интернета; для автономной демонстрации нужен доступ к сети.','Фотографии включены в приложение для просмотра без интернета. Ссылки на источники открываются при наличии сети.');
fs.writeFileSync(multan,source);
console.log('Android web bundle prepared with original resource paths.');
