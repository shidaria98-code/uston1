"""Compile the conjugation game from one editable content source."""
import base64, json, mimetypes, re, unicodedata

def compile_game(root, need, text, asset, js):
 data=json.loads((root/'content/conjugation-lock.json').read_text(encoding='utf-8'))
 contract=json.loads((root/'tools/conjugation-contract.json').read_text(encoding='utf-8'))
 for key in ['gameId','portalGameId','schemaVersion','finalTestId']:need(data.get(key)==contract[key],f'Замок спряжения: нельзя менять {key}')
 text(data.get('contentVersion'),'Версия материалов',True,100)
 need(type(data.get('testLimit'))is int and 1<=data['testLimit']<=20,'Число вопросов: от 1 до 20')
 def indexed(items,label):
  need(isinstance(items,list)and all(isinstance(x,dict)and isinstance(x.get('id'),str)and 0<len(x['id'])<=150 for x in items),label+': нужны постоянные ID')
  result={x['id']:x for x in items};need(len(result)==len(items),label+': повтор ID');return result
 lex=indexed(data.get('lexemes'),'Лексика');verbs=indexed(data.get('verbs'),'Глаголы');persons=indexed(data.get('pronouns'),'Местоимения');questions=indexed(data.get('sentences'),'Предложения');sources=indexed(data.get('sources'),'Источники')
 need(set(contract['lexemes']).issubset(lex),'Нельзя удалять прежние словарные ID')
 need(set(persons)==set(contract['pronouns'])and set(verbs)==set(contract['verbs'])and set(questions)==set(contract['sentences']),'Нельзя удалять или менять ID существующих заданий')
 for key,parameters in contract['copy'].items():
  value=data.get('copy',{}).get(key);text(value,'Текст интерфейса: '+key,True,4000)
  need(sorted(re.findall(r'\{(\w+)\}',value))==sorted(parameters),'Сохраните параметры шаблона: '+key)
 for entry in lex.values():
  text(entry.get('lemma'),'Словарная форма',True,300);text(entry.get('ru')or'','Перевод',False,1000)
  need(entry.get('status')in ['approved','review'],'Неверный статус лексемы')
  need(entry.get('sourceId')in sources,'Не найден источник лексемы')
  need(entry['status']!='approved'or bool(entry.get('ru')),'У утверждённого слова должен быть перевод')
  need('dictionary'not in entry or type(entry['dictionary'])is bool,'Признак включения в словарь должен быть логическим')
 def occurrence(value):
  need(isinstance(value,dict)and value.get('lexemeId')in lex,'Не найдена словарная единица употребления');text(value.get('text'),'Форма в тексте',True,500)
  need(value.get('unlock')in ['wheel-view','study-aligned','sentence-view','sentence-options'],'Неизвестный момент открытия')
 for p in persons.values():occurrence(p.get('occurrence'))
 form_ids={}
 for id,verb in verbs.items():
  expected=contract['verbs'][id]
  for key in ['studyId','practiceId']:need(verb.get(key)==expected[key],'Нельзя менять ID режима')
  need(verb.get('status')in ['approved','review']and verb.get('sourceId')in sources,'Неизвестный статус/источник глагола')
  occurrence(verb.get('occurrence'));verb['occurrence']['text']=lex[verb['occurrence']['lexemeId']]['lemma'];forms=indexed(verb.get('forms'),'Формы глагола')
  need(set(forms)==set(expected['forms']),'Нельзя менять ID форм')
  need({f.get('personId')for f in forms.values()}==set(persons),'Нужна форма каждого из шести лиц')
  for fid,f in forms.items():
   need(f['personId']==expected['forms'][fid],'Нельзя менять лицо у постоянного ID формы');occurrence(f.get('occurrence'));need(f['occurrence']['lexemeId']==verb['occurrence']['lexemeId'],'Формы должны ссылаться на инфинитив своего глагола');form_ids[fid]=f
 for question in questions.values():
  need(question.get('verbId')in verbs and question.get('sourceId')in sources,'Неизвестный глагол/источник вопроса')
  need(question.get('status')in ['approved','review'],'Неизвестный статус вопроса')
  for key in ['udm','ru']:text(question.get(key),'Предложение: '+key,True,4000)
  text(question.get('explanation',''),'Пояснение',False,4000)
  need(question['udm'].count('____')==1,'В предложении нужен ровно один пропуск ____')
  ids=question.get('optionIds');allowed={f['id']for f in verbs[question['verbId']]['forms']}
  need(isinstance(ids,list)and len(ids)==4 and len(set(ids))==4 and set(ids).issubset(allowed)and question.get('answerId')in ids,'Нужны четыре разные формы своего глагола и правильный ответ среди них')
  need(isinstance(question.get('occurrences'),list),'Нужна разметка слов предложения')
  for value in question['occurrences']:occurrence(value)
  if question['status']=='approved':
   tokenize=lambda value:re.findall(r'[^\W_]+',unicodedata.normalize('NFC',value).lower())
   words=tokenize(question['udm']);covered=set()
   for value in question['occurrences']:
    need(lex[value['lexemeId']]['status']=='approved','В утверждённом предложении есть неутверждённая лексика: '+question['id'])
    phrase=tokenize(value['text']);matched=False
    for start in range(len(words)-len(phrase)+1):
     if phrase and words[start:start+len(phrase)]==phrase:covered.update(range(start,start+len(phrase)));matched=True
    need(matched,'Разметка не совпадает с текстом: '+question['id']+' / '+value['text'])
   need(len(covered)==len(words),'Разметьте все слова утверждённого предложения: '+question['id'])
 # Compile both consumers from the same source; the copies are generated, not editable.
 game=root/'games/conjugation-lock';page=(game/'page.html').read_text(encoding='utf-8');images={}
 need(set(data.get('media',{}))==set(contract['media']),'Сохраните шесть изображений замка')
 for key,path in data['media'].items():
  checked=asset(path,'Иллюстрация замка: '+key,{'.png','.jpg','.jpeg','.webp','.svg'})
  need(bool(checked),'Укажите изображение: '+key)
  if checked.startswith('https://'):images[key]=checked;continue
  # Existing archives use paths relative to the game, CMS uploads relative to the portal.
  file=root/checked
  images[key]='data:'+ (mimetypes.guess_type(file.name)[0]or'image/png')+';base64,'+base64.b64encode(file.read_bytes()).decode('ascii')
 replacements={'STYLES':(game/'style.css').read_text(encoding='utf-8'),'DATA':js(data),'ART':js(images),'CORE':(game/'core.js').read_text(encoding='utf-8'),'APP':(game/'app.js').read_text(encoding='utf-8'),'BRIDGE':(game/'bridge.js').read_text(encoding='utf-8')}
 for marker,value in replacements.items():page=page.replace('/* '+marker+' */',value)
 return {game/'index.html':page,game/'data.json':json.dumps(data,ensure_ascii=False,indent=2)+'\n',root/'assets/conjugation-data.js':'window.UstonConjugationData='+js(data)+';\n'}
