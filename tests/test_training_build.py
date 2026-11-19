import importlib.util,json,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('training_builder',ROOT/'tools/build_content.py');b=importlib.util.module_from_spec(spec);spec.loader.exec_module(b)
class TrainingBuild(unittest.TestCase):
 def compile(self):
  c=b.load('tools/content-contract.json');d={n:b.load('content/'+n+'.json')for n in ['my-seem','kin-ta','family','case-lock','districts','methodology']};b.normalize(d);b.validate(d,c);return b.compile_all(d,c)
 def test_quiz_20_questions_reuses_ids(self):
  fixture=ROOT/'content/_test_quiz.json'
  try:
   fixture.write_text(json.dumps({'gameId':'history-quiz','questions':[{'id':f'q{i}','vocabulary':[{'u':'Кион','ru':'Волк'},{'u':'Пример нового слова','ru':'Тестовый перевод'}]}for i in range(20)]},ensure_ascii=False))
   output=self.compile();extra=json.loads(output[ROOT/'assets/vocabulary-extra.js'].split('=',1)[1].rstrip(';\n'));bank=json.loads(output[ROOT/'assets/lexicon-v18.js'].split('window.UstonLexicon=',1)[1].rstrip(';\n'));wolf=next(w for w in bank if w['id']=='seem:animals:7')
   self.assertEqual(len(extra),40);self.assertEqual(len({w['canonicalId']for w in extra}),2);self.assertTrue(all(w['canonicalId']==wolf['canonicalId']for w in extra if w['u']=='Кион'))
   fixture.write_text(json.dumps({'gameId':'history-quiz','questions':[{'id':'q0','vocabulary':[{'u':'а','ru':'а'}]*3}]}))
   with self.assertRaises(b.ContentError):self.compile()
  finally:fixture.unlink(missing_ok=True)
 def test_invalid_intervals_rejected(self):
  f=ROOT/'content/training.json';original=f.read_text()
  try:
   d=json.loads(original);d['intervalDays']=[3,1];f.write_text(json.dumps(d))
   with self.assertRaises(b.ContentError):self.compile()
  finally:f.write_text(original)
if __name__=='__main__':unittest.main()
