import copy,importlib.util,json,shutil,tempfile,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('conjugation_build_test',ROOT/'tools/build_content.py');b=importlib.util.module_from_spec(spec);spec.loader.exec_module(b)
spec=importlib.util.spec_from_file_location('conjugation_plugin_test',ROOT/'tools/conjugation_content.py');plugin=importlib.util.module_from_spec(spec);spec.loader.exec_module(plugin)

class ConjugationBuild(unittest.TestCase):
 def setUp(self):
  self.temp=tempfile.TemporaryDirectory(prefix='conjugation-cms-');self.root=Path(self.temp.name)
  for name in ['games/conjugation-lock','content','tools']:
   shutil.copytree(ROOT/name,self.root/name,ignore=shutil.ignore_patterns('__pycache__'))
  self.previous=b.ROOT;b.ROOT=self.root
  self.source=self.root/'content/conjugation-lock.json';self.data=json.loads(self.source.read_text())
 def tearDown(self):b.ROOT=self.previous;self.temp.cleanup()
 def compile(self):
  self.source.write_text(json.dumps(self.data,ensure_ascii=False))
  return plugin.compile_game(self.root,b.need,b.text,b.asset,b.js)
 def test_cms_title_forms_and_lemma_reach_generated_game(self):
  self.data['copy']['title']='Проверочный заголовок'
  self.data['verbs'][0]['forms'][0]['occurrence']['text']='ПРОВЕРКА'
  self.data['lexemes'][6]['lemma']='ПРОВЕРОЧНЫЙ ИНФИНИТИВ'
  output=self.compile();d=json.loads(output[self.root/'games/conjugation-lock/data.json'])
  self.assertEqual(d['copy']['title'],'Проверочный заголовок')
  self.assertEqual(d['verbs'][0]['forms'][0]['occurrence']['text'],'ПРОВЕРКА')
  self.assertEqual(d['verbs'][0]['occurrence']['text'],'ПРОВЕРОЧНЫЙ ИНФИНИТИВ')
  self.assertIn('Проверочный заголовок',output[self.root/'games/conjugation-lock/index.html'])
 def test_media_upload_used_and_traversal_rejected(self):
  (self.root/'media').mkdir(exist_ok=True);(self.root/'media/example.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg"/>')
  self.data['media']['lock_open']='media/example.svg';output=self.compile()
  self.assertIn('data:image/svg+xml;base64,',output[self.root/'games/conjugation-lock/index.html'])
  self.data['media']['lock_open']='../private.svg'
  with self.assertRaises(b.ContentError):self.compile()
 def test_reordering_preserves_ids_and_form_person_mapping(self):
  original={v['id']:{f['id']:f['personId']for f in v['forms']}for v in self.data['verbs']}
  self.data['verbs'].reverse();self.data['sentences'].reverse();self.data['pronouns'].reverse()
  for verb in self.data['verbs']:verb['forms'].reverse()
  output=self.compile();d=json.loads(output[self.root/'games/conjugation-lock/data.json'])
  self.assertEqual(original,{v['id']:{f['id']:f['personId']for f in v['forms']}for v in d['verbs']})
 def test_invalid_reference_and_template_rejected(self):
  self.data['sentences'][0]['answerId']='unknown'
  with self.assertRaises(b.ContentError):self.compile()
  self.data=json.loads((ROOT/'content/conjugation-lock.json').read_text());self.data['copy']['wrong']='Нет параметра'
  with self.assertRaises(b.ContentError):self.compile()
 def test_unmapped_word_in_approved_sentence_rejected(self):
  self.data['sentences'][0]['udm']='НОВОЕСЛОВО '+self.data['sentences'][0]['udm']
  with self.assertRaises(b.ContentError):self.compile()
 def test_script_ending_is_escaped(self):
  self.data['copy']['title']='</script><script>alert(1)</script>'
  output=self.compile();html=output[self.root/'games/conjugation-lock/index.html']
  self.assertNotIn(self.data['copy']['title'],html)
  self.assertIn('\\u003c/script\\u003e',html)

if __name__=='__main__':unittest.main()
