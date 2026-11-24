import copy,hashlib,importlib.util,io,json,shutil,tempfile,unittest
from contextlib import redirect_stdout,redirect_stderr
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('cms_builder',ROOT/'tools/build_content.py');build=importlib.util.module_from_spec(spec);spec.loader.exec_module(build)
class ContentBuildTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.temp=tempfile.TemporaryDirectory(prefix='uston-cms-');cls.root=Path(cls.temp.name)/'site';cls.root.mkdir()
  files=['assets/conjugation-cover.png','assets/programs/shared.js','index.html','tools/content-contract.json','assets/lexicon-v18.js','assets/case-lock-dictionary.js','games/case-lock/data.js','games/case-lock/dictionary.js','games/case-lock/game.js','games/family-tree/family-tree.html','games/udmurtia/index.html']
  files += [str(p.relative_to(ROOT))for p in (ROOT/'content').glob('*.json')]
  files += ['games/cheskyt/index.html']+[str(p.relative_to(ROOT))for p in (ROOT/'content/cheskyt').glob('*')if p.is_file()]
  files += ['tools/conjugation-contract.json']+[str(p.relative_to(ROOT))for p in (ROOT/'games/conjugation-lock').rglob('*')if p.is_file()]
  files += [str(p.relative_to(ROOT))for name in ['my-seem','kin-ta','udmurtia']for p in (ROOT/'assets/programs').glob(name+'-*.js')]
  for name in files:
   dest=cls.root/name;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(ROOT/name,dest)
  cls.contract=json.loads((cls.root/'tools/content-contract.json').read_text());cls.original={n:json.loads((cls.root/'content'/f'{n}.json').read_text())for n in ['my-seem','kin-ta','family','case-lock','districts','methodology']};build.ROOT=cls.root
 @classmethod
 def tearDownClass(cls):build.ROOT=ROOT;cls.temp.cleanup()
 def setUp(self):self.data=copy.deepcopy(self.original)
 def compile(self):build.normalize(self.data);build.validate(self.data,self.contract);return build.compile_all(self.data,self.contract)
 def test_reordered_lists_preserve_progress_slots(self):
  self.data['my-seem']['categories'].reverse()
  for c in self.data['my-seem']['categories']:c['words'].reverse()
  self.data['case-lock']['groups'].reverse();self.data['kin-ta']['episodes'].reverse();output=self.compile()
  # The compiler canonicalizes order from immutable IDs, rather than list position in the CMS.
  self.assertIn(self.root/'games/case-lock/data.js',output);groups=build.read_assignment(output[self.root/'games/case-lock/data.js'],'window.CASE_GROUPS = ');self.assertEqual([g['id']for g in groups],self.contract['caseIds'])
 def test_invalid_identity_is_rejected_before_any_write(self):
  key=self.root/'content/my-seem.json';old=key.read_text();self.data['my-seem']['categories'][0]['words'][0]['id']='unknown';key.write_text(json.dumps(self.data['my-seem']));before={str(p):p.read_bytes()for p in self.root.rglob('*')if p.is_file()and'content'not in p.relative_to(self.root).parts}
  try:
   with redirect_stderr(io.StringIO()):status=build.main([])
   self.assertEqual(status,1);self.assertEqual(before,{str(p):p.read_bytes()for p in self.root.rglob('*')if p.is_file()and'content'not in p.relative_to(self.root).parts})
  finally:key.write_text(old)
 def test_grammar_form_must_match_sentence(self):
  self.data['case-lock']['groups'][0]['where']['form']='коркаINVALID'
  with self.assertRaises(build.ContentError):self.compile()
 def test_edited_lemma_does_not_rename_another_games_word(self):
  g=self.data['case-lock']['groups'][0];g['word']='тест';g['meaning']='Проверка'
  for key in ['where','to','from']:g[key]['form']=g[key]['form'].replace('корка','тест');g[key]['udm']=g[key]['udm'].replace('корка','тест')
  output=self.compile();bank=build.read_assignment(output[self.root/'assets/lexicon-v18.js'],'window.UstonLexicon=');byid={w['id']:w for w in bank};self.assertEqual(byid['guide:korka']['u'],'корка');self.assertEqual(byid['case-lock:korka']['u'],'тест');entries=build.read_assignment(output[self.root/'assets/case-lock-dictionary.js'],'const entries=');self.assertEqual(entries[0]['aliases'],['case-lock:korka'])
 def test_plain_text_cannot_end_an_inline_script(self):
  attack='</script><script>throw new Error("injected")</script>'
  self.data['kin-ta']['episodes'][0]['description']=attack;self.data['methodology']['sections'][0]['paragraphs'][0]=attack;output=self.compile();self.assertIn('&lt;/script&gt;',output[self.root/'index.html']);self.assertNotIn(attack,output[self.root/'index.html'])
 def test_optional_cms_null_values_are_accepted(self):
  self.data['my-seem']['categories'][0]['words'][0]['image']=None;self.data['kin-ta']['episodes'][0]['audio']=None;self.data['methodology']['sections'][0]['blocks']=None;self.compile()
 def test_uploaded_media_is_project_relative_and_traversal_is_rejected(self):
  media=self.root/'media';media.mkdir(exist_ok=True);(media/'test.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg"/>');w=self.data['my-seem']['categories'][0]['words'][0];w['image']='/uston1/media/test.svg';self.compile();self.assertEqual(build.asset(w['image'],'test',{'.svg'}),'media/test.svg');w['image']='../private.svg'
  with self.assertRaises(build.ContentError):self.compile()
 def test_unsafe_source_url_is_rejected(self):
  self.data['districts']['regions'][0]['sources'][0]['url']='javascript:alert(1)'
  with self.assertRaises(build.ContentError):self.compile()
 def test_publication_is_idempotent(self):
  with redirect_stdout(io.StringIO()):self.assertEqual(build.main([]),0)
  before={str(p):p.read_bytes()for p in self.root.rglob('*')if p.is_file()}
  with redirect_stdout(io.StringIO())as log:self.assertEqual(build.main([]),0)
  self.assertIn('0 файлов',log.getvalue());self.assertEqual(before,{str(p):p.read_bytes()for p in self.root.rglob('*')if p.is_file()})
if __name__=='__main__':unittest.main()
