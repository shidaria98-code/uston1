"""Create an isolated CMS preview; never edit the real source content."""
from pathlib import Path
import importlib.util,json,shutil,tempfile
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('fixture_builder',ROOT/'tools/build_content.py');b=importlib.util.module_from_spec(spec);spec.loader.exec_module(b)
spec=importlib.util.spec_from_file_location('fixture_plugin',ROOT/'tools/conjugation_content.py');plugin=importlib.util.module_from_spec(spec);spec.loader.exec_module(plugin)
with tempfile.TemporaryDirectory(prefix='conjugation-preview-')as directory:
 root=Path(directory);shutil.copytree(ROOT/'games/conjugation-lock',root/'games/conjugation-lock')
 (root/'content').mkdir();(root/'tools').mkdir();shutil.copyfile(ROOT/'tools/conjugation-contract.json',root/'tools/conjugation-contract.json')
 data=json.loads((ROOT/'content/conjugation-lock.json').read_text())
 for path in data['media'].values():
  if not path.startswith(('https://','games/conjugation-lock/')):
   local=path.removeprefix('/uston1/');target=root/local;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(ROOT/local,target)
 data['copy']['title']='Проверка CMS';data['verbs'][0]['forms'][0]['occurrence']['text']='ПРОВЕРКА ФОРМЫ';data['lexemes'][6]['lemma']='ПРОВЕРКА ИНФИНИТИВА'
 (root/'content/conjugation-lock.json').write_text(json.dumps(data,ensure_ascii=False));b.ROOT=root
 output=plugin.compile_game(root,b.need,b.text,b.asset,b.js)
 target=ROOT/'tests/fixtures/cms-conjugation.html';target.parent.mkdir(exist_ok=True);target.write_text(output[root/'games/conjugation-lock/index.html'])
