"""Compile the author's v0.41 course and explicit portal dictionary links."""
import json

def compile_guide(root,need,js):
 course=json.loads((root/'content/guide-course.json').read_text())
 vocab=json.loads((root/'content/guide-vocabulary.json').read_text())
 scenes=course['scenes'];need(len(scenes)==68,'Самоучитель: ожидаются 68 сцен')
 need(len({s['ID'] for s in scenes})==68,'Самоучитель: повтор ID сцены')
 tasks=[t for s in scenes for t in s['tasks']];need(len(tasks)==95 and len({t['id'] for t in tasks})==95,'Самоучитель: неверные ID заданий')
 for s in scenes:
  need(isinstance(s['lines'],list)and all(isinstance(l.get('who'),str)and isinstance(l.get('text'),str) for l in s['lines']),'Самоучитель: неверная реплика')
  for row in s['learn']:need(isinstance(row,list)and len(row)==2 and all(isinstance(x,str)for x in row),'Самоучитель: неверная словарная пара')
 entries=vocab['entries'];ids={e['id']for e in entries};need(len(ids)==len(entries),'Самоучитель: повтор словарного ID')
 for e in entries:need(e.get('game')=='guide'and all(isinstance(e.get(k),str)and e[k] for k in ['id','canonicalId','u','ru']),'Самоучитель: неверная словарная единица')
 for o in vocab['occurrences']:need(o['entryId']in ids and isinstance(o['surface'],str),'Самоучитель: форма без словарной единицы')
 return {root/'apps/guide/course.js':'window.COURSE='+js(course)+';\n',root/'assets/guide-vocabulary.js':'/* Explicit author-reviewed entries and lemma links. No suffix inference. */\nwindow.UstonGuideVocabulary='+js(vocab)+';\n'}
