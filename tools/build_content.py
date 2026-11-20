#!/usr/bin/env python3
"""Compile editable JSON into the existing static portal. No third-party dependencies."""
from pathlib import Path
import argparse,copy,html,json,os,re,sys,tempfile,hashlib,shutil,unicodedata
from urllib.parse import urlsplit
ROOT=Path(__file__).resolve().parents[1]
def lexkey(value):return ' '.join(unicodedata.normalize('NFC',value).lower().split())
class ContentError(ValueError):pass
def need(ok,message):
 if not ok:raise ContentError(message)
def load(path):
 try:
  value=json.loads((ROOT/path).read_text(encoding='utf-8'));need(isinstance(value,dict),f'{path}: верхний уровень должен быть объектом');return value
 except (OSError,ValueError)as e:raise ContentError(f'{path}: {e}')from e
def js(value):
 return json.dumps(value,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c').replace('>','\\u003e').replace('\u2028','\\u2028').replace('\u2029','\\u2029')
def text(v,label,required=True,limit=20000):
 need(isinstance(v,str),f'{label}: требуется текст')
 need(len(v)<=limit,f'{label}: текст длиннее {limit} символов')
 need(not required or bool(v.strip()),f'{label}: поле не должно быть пустым')
 need(not any(ord(c)<32 and c not in '\n\r\t'for c in v),f'{label}: недопустимые управляющие символы')
 return v
# Stable IDs are used to restore canonical order even if an editor reorders list items.
def records(items,expected,label):
 need(isinstance(items,list),f'{label}: требуется список')
 need(all(isinstance(x,dict)and'id'in x for x in items),f'{label}: у каждого элемента должен быть служебный ID')
 ids=[x['id']for x in items]
 need(len(ids)==len(set(ids))and set(ids)==set(expected),f'{label}: нельзя добавлять, удалять или менять служебные ID заданий')
 return {x['id']:x for x in items}
def asset(value,label,extensions):
 text(value,label,False,2000)
 if not value:return ''
 u=urlsplit(value)
 need(not u.fragment,f'{label}: фрагмент адреса не поддерживается')
 if u.scheme:
  need(u.scheme=='https'and bool(u.netloc),f'{label}: разрешены локальные файлы и адреса HTTPS')
  return value
 need(not u.netloc and not u.query,f'{label}: неверный путь файла')
 path=u.path
 if path.startswith('/uston1/'):path=path[len('/uston1/'):]
 need(not path.startswith('/')and'..'not in Path(path).parts and'\\'not in path,f'{label}: файл должен находиться внутри репозитория')
 need(Path(path).suffix.lower()in extensions,f'{label}: неподдерживаемый формат файла')
 f=(ROOT/path).resolve();need(f.is_relative_to(ROOT.resolve())and f.is_file(),f'{label}: файл {path} не найден в репозитории')
 return path
def url(value,label,optional=False):
 text(value,label,not optional,2000)
 if not value:return ''
 u=urlsplit(value);need(u.scheme in ['http','https']and bool(u.netloc),f'{label}: укажите полный адрес HTTP или HTTPS')
 return value
def span(source,marker):
 start=source.find(marker);need(start>=0,f'Не найден участок программы: {marker}')
 a=start+len(marker);depth=0;quote='';escape=False
 for i in range(a,len(source)):
  c=source[i]
  if quote:
   if escape:escape=False
   elif c=='\\':escape=True
   elif c==quote:quote=''
   continue
  if c in '\"\'`':quote=c;continue
  if c in '([{':depth+=1
  elif c in ')]}':depth-=1
  elif c==';'and depth==0:return a,i
 raise ContentError(f'Незаконченный участок программы: {marker}')
def read_assignment(source,marker):
 a,b=span(source,marker)
 try:return json.loads(source[a:b])
 except ValueError as e:raise ContentError(f'{marker}: ожидались данные JSON')from e
def assign(source,marker,value):
 a,b=span(source,marker);return source[:a]+js(value)+source[b:]
class Packed:
 def __init__(self,name):
  self.files=sorted((ROOT/'assets/programs').glob(name+'-*.js'),key=lambda f:int(f.stem.split('-')[-1]));need(bool(self.files),f'Нет программы {name}');self.bounds=[0];self.heads=[];self.chunks=[];self.source=''
  for f in self.files:
   raw=f.read_text(encoding='utf-8');i=raw.index(')+')+2;c=json.loads(raw[i:].strip().rstrip(';'));self.heads.append(raw[:i]);self.chunks.append(c);self.source+=c;self.bounds.append(len(self.source))
 def replace(self,old,new):
  need(self.source.count(old)==1,f'Неоднозначный участок программы: {old[:100]}')
  start=self.source.index(old);end=start+len(old);delta=len(new)-len(old);self.source=self.source[:start]+new+self.source[end:];self.bounds=[x if x<=start else x+delta if x>=end else start+len(new)for x in self.bounds]
 def assignment(self,marker,value):
  a,b=span(self.source,marker);self.replace(self.source[a:b],js(value))
 def output(self):
  return {f:self.heads[i]+js(self.source[self.bounds[i]:self.bounds[i+1]])+';\n'for i,f in enumerate(self.files)}
def normalize(data):
 def blank(obj,key):
  if obj.get(key)is None:obj[key]=''
 def listing(obj,key,label):
  if obj.get(key)is None:obj[key]=[]
  need(isinstance(obj[key],list),f'{label}: требуется список')
 for category in data['my-seem'].get('categories',[]):
  for word in category.get('words',[]):
   for key in ['hint','note','image']:blank(word,key)
 for person in data['kin-ta'].get('people',[]):
  for key in ['image','audio']:blank(person,key)
 for episode in data['kin-ta'].get('episodes',[]):blank(episode,'audio')
 for person in data['family'].get('people',[]):blank(person,'description')
 for group in data['case-lock'].get('groups',[]):
  for key in ['where','to','from']:
   if isinstance(group.get(key),dict):blank(group[key],'explanation')
 for region in data['districts'].get('regions',[]):
  for key in ['location','history','nature','culture','visit']:blank(region,key)
  listing(region,'sources','Источники района')
  for source in region['sources']:blank(source,'url')
 for section in data['methodology'].get('sections',[]):
  for key in ['paragraphs','blocks','sources']:listing(section,key,'Методика '+key)
  for block in section['blocks']:listing(block,'paragraphs','Абзацы карточки')
  for source in section['sources']:listing(source,'links','Ссылки источника')
 return data

def validate(data,contract):
 images={'.png','.jpg','.jpeg','.webp','.gif','.svg'};audio={'.ogg','.mp3','.m4a','.wav'}
 seem=data['my-seem'];text(seem.get('title'),'Мы сеем — название');text(seem.get('subtitle'),'Мы сеем — подзаголовок',False)
 cats=records(seem.get('categories'),contract['seemIds'],'Мы сеем — категории');translations=[]
 alphabet=set('АБВГДЕЁЖӜЗӞИӤЙКЛМНОӦПРСТУФХЦЧӴШЩЪЫЬЭЮЯ')
 for id,ids in contract['seemIds'].items():
  c=cats[id];text(c.get('ru'),f'{id} — название по-русски');text(c.get('ud'),f'{id} — название по-удмуртски');words=records(c.get('words'),ids,f'{id} — слова')
  for wid in ids:
   w=words[wid];text(w.get('ru'),f'{wid} — перевод');ud=text(w.get('ud'),f'{wid} — удмуртское слово',limit=80)
   need(set(ud.upper())<=alphabet,f'{wid}: слово должно состоять из букв игровой клавиатуры, без пробелов и знаков')
   translations.append(w['ru']);text(w.get('hint',''),f'{wid} — подсказка',False);text(w.get('note',''),f'{wid} — справка',False);asset(w.get('image',''),f'{wid} — изображение',images)
 need(len(translations)==len(set(translations)),'Мы сеем: переводы карточек должны различаться, чтобы не перепутались иллюстрации')
 kin=data['kin-ta'];text(kin.get('subtitle'),'Кин та — подзаголовок');people=records(kin.get('people'),[x['id']for x in contract['kinPeople']],'Кин та — персонажи')
 for id,p in people.items():text(p.get('name'),f'Персонаж {id} — имя');asset(p.get('image',''),f'Персонаж {id} — картинка',images);asset(p.get('audio',''),f'Персонаж {id} — запись имени',audio)
 for id,s in records(kin.get('episodes'),contract['kinStageIds'],'Кин та — эпизоды').items():text(s.get('description'),f'Эпизод {id} — описание');asset(s.get('audio',''),f'Эпизод {id} — озвучка',audio)
 family=data['family'];people=records(family.get('people'),contract['familyPeople'],'Семья — персонажи')
 for id,p in people.items():
  text(p.get('name'),f'{id} — имя');text(p.get('description',''),f'{id} — описание',False);need(type(p.get('age'))is int and 0<=p['age']<=120,f'{id} — возраст от 0 до 120')
 stories=records(family.get('stories'),contract['familyStories'],'Семья — истории')
 for id,ids in contract['familyStories'].items():
  story=stories[id]
  for key in ['title','text','ruTitle','ruText']:text(story.get(key),f'История {id} — {key}')
  for person,role in records(story.get('roles'),ids,f'История {id} — подписи').items():text(role.get('ud'),f'{id}/{person} — подпись по-удмуртски');text(role.get('ru'),f'{id}/{person} — подпись по-русски')
 groups=records(data['case-lock'].get('groups'),contract['caseIds'],'Кытын — группы слов')
 need(len({g.get('word','').casefold()for g in groups.values()})==len(groups),'Кытын: начальные формы десяти групп должны различаться')
 for id,g in groups.items():
  word=text(g.get('word'),f'{id} — начальная форма',limit=80);need(word==word.strip()and all(c.isalpha()or c=='-'for c in word),f'{id}: начальная форма должна быть одним словом');text(g.get('meaning'),f'{id} — перевод')
  for key,label in [('where','Где'),('to','Куда'),('from','Откуда')]:
   q=g.get(key);need(isinstance(q,dict),f'{id}/{label}: нет задания');form=text(q.get('form'),f'{id}/{label} — форма');text(q.get('ru'),f'{id}/{label} — русское предложение');sentence=text(q.get('udm'),f'{id}/{label} — удмуртское предложение');text(q.get('explanation',''),f'{id}/{label} — объяснение',False)
   need(form.startswith(word),f'{id}/{label}: форма должна начинаться с основы «{word}»')
   need(sentence.count(form)==1,f'{id}/{label}: в удмуртском предложении форма «{form}» должна встретиться ровно один раз')
   if id in ['syures','puzhym']:need(len(form.split())==2 and form.split()[0]==word,f'{id}/{label}: требуется основа и отдельный послелог')
   else:need(' 'not in form and len(form)>len(word),f'{id}/{label}: требуется основа с окончанием')
 districts=data['districts'];text(districts.get('verifiedDate'),'Районы — дата сверки');regions=records(districts.get('regions'),[int(x)for x in contract['districtNames']],'Районы')
 for id,r in regions.items():
  need(r.get('name')==contract['districtNames'][str(id)],f'Район {id}: название используется для связи с картой и не должно меняться')
  for k in ['location','history','nature','culture','visit']:text(r.get(k,''),f'{r["name"]}/{k}',False)
  need(isinstance(r.get('sources'),list)and len(r['sources'])<=100,f'{r["name"]}: неверный список источников')
  for src in r['sources']:text(src.get('label'),f'{r["name"]} — название источника');url(src.get('url',''),f'{r["name"]} — ссылка',True)
  for number in re.findall(r'\d+',','.join(re.findall(r'\[([\d,\s]+)\]',' '.join(r.get(k,'')for k in ['location','history','nature','culture','visit'])))):
   need(1<=int(number)<=len(r['sources']),f'{r["name"]}: ссылка [{number}] не имеет источника')
 methods=data['methodology'];text(methods.get('title'),'Методика — заголовок');sections=records(methods.get('sections'),contract['methodIds'],'Методика — разделы')
 for id,s in sections.items():
  text(s.get('title'),f'{id} — заголовок')
  for p in s.get('paragraphs',[]):text(p,f'{id} — абзац',False)
  for b in s.get('blocks',[]):
   text(b.get('title'),f'{id} — заголовок блока')
   for p in b.get('paragraphs',[]):text(p,f'{id} — абзац блока',False)
  for src in s.get('sources',[]):
   text(src.get('text'),f'{id} — источник')
   for link in src.get('links',[]):text(link.get('label'),f'{id} — подпись ссылки');url(link.get('url'),f'{id} — адрес источника')
 return True

def compile_all(data,c):
 output={};seem=data['my-seem'];p=Packed('my-seem');categories=[];art={}
 bycat={x['id']:x for x in seem['categories']}
 for cid,ids in c['seemIds'].items():
  category=bycat[cid];words={w['id']:w for w in category['words']};compiled=[]
  for id in ids:
   w=words[id];compiled.append([w['ru'],w['ud'],w.get('hint',''),w.get('note','')]);image=asset(w.get('image',''),id,{'.png','.jpg','.jpeg','.webp','.gif','.svg'});art[w['ru']]={'src':image}if image else c['seemArt'][id]
  categories.append({'id':cid,'ru':category['ru'],'ud':category['ud'],'words':compiled})
 p.assignment('const categories=',categories);p.assignment('const WORD_ART=',art)
 training_atlas=read_assignment(p.source,'const WORD_ATLAS=');training_shared=read_assignment((ROOT/'assets/programs/shared.js').read_text(encoding='utf-8'),'window.UDM_SHARED=')
 # Only presentation text is changed; game IDs, storage keys and scoring stay untouched.
 if 'function wordHint()'not in p.source:
  p.replace('function loadWord(i){',"function wordHint(){return active.words[idx][2]||('👩 По-русски: «'+active.words[idx][0]+'».')}\nfunction loadWord(i){")
  p.replace("$('dialectNote').hidden=active.words[idx][0]!=='Кошка';","$('dialectNote').textContent=active.words[idx][3]||'';$('dialectNote').hidden=!active.words[idx][3];")
  # There are three hint templates; replace them together without changing original chunk boundaries.
  needle='👩 По-русски: «${active.words[idx][0]}».'
  while needle in p.source:
   at=p.source.index(needle);before=p.source[max(0,at-60):at];after=p.source[at:at+len(needle)+60];full=before+after
   # Use a unique context around the occurrence so a partial chunk replacement is well-defined.
   p.replace(full,full.replace(needle,'${wordHint()}',1))
 # Category labels are plain text even when an editor includes < or &.
 if 'function escapeCopy('not in p.source:
  p.replace('function map(){',"function escapeCopy(v){return String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')}\nfunction map(){")
  p.replace('<span class="plotname">${cat.ru}</span><span class="udm">${cat.ud}</span>','<span class="plotname">${escapeCopy(cat.ru)}</span><span class="udm">${escapeCopy(cat.ud)}</span>')
 h1=re.search(r'<h1>.*?</h1>',p.source);p.replace(h1.group(),'<h1>'+html.escape(seem['title'])+'</h1>')
 subtitle=re.search(r'<p class="subtitle">.*?</p>',p.source);p.replace(subtitle.group(),'<p class="subtitle">'+html.escape(seem['subtitle'])+'</p>');output.update(p.output())
 # Identity and media stay attached to the existing episode IDs.
 kin=data['kin-ta'];people={x['id']:x for x in kin['people']};episodes={x['id']:x for x in kin['episodes']};p=Packed('kin-ta');game=read_assignment(p.source,'const GAME=');game['cmsAudio']={};game['cmsImages']={};game['cmsHomeImages']={}
 for stage in game['stages']:
  e=episodes[stage['id']];stage['description']=e['description']
  if e.get('audio'):game['cmsAudio'][str(stage['id'])]=asset(e['audio'],'Озвучка',{'.ogg','.mp3','.m4a','.wav'})
  for card in stage['cards']:
   card['name']=people[card['id']]['name'];person=people[card['id']]
   if person.get('image'):game['cmsImages'][str(card['id'])]=asset(person['image'],'Изображение',{'.png','.jpg','.jpeg','.webp','.gif','.svg'})
  need(len({x['name'].casefold()for x in stage['cards']})==len(stage['cards']),f'Эпизод {stage["id"]}: имена вариантов ответа должны различаться')
 game['home']=[];oldpeople={x['id']:x for x in c['kinPeople']}
 for i,record in enumerate(c['kinHome']):
  home=copy.deepcopy(record['original']);person=people.get(record['person'])
  if person:
   if person['name']!=oldpeople[person['id']]['name']:home['name']=person['name'];home['audio']=None
   if person.get('audio'):
    home['audio']='cms-person-'+str(person['id']);game['cmsAudio'][home['audio']]=asset(person['audio'],'Имя',{'.ogg','.mp3','.m4a','.wav'})
   if person.get('image'):game['cmsHomeImages'][str(i)]=asset(person['image'],'Портрет',{'.png','.jpg','.jpeg','.webp','.gif','.svg'})
  game['home'].append(home)
 p.assignment('const GAME=',game)
 if "const src=GAME.cmsAudio?.[name]||"not in p.source:p.replace("const src=asset('media/'+name+'.ogg')", "const src=GAME.cmsAudio?.[name]||asset('media/'+name+'.ogg')")
 if 'img.src=GAME.cmsImages'not in p.source:p.replace('img.src=asset(card.image);','img.src=GAME.cmsImages?.[card.id]||asset(card.image);')
 if 'img.src=GAME.cmsHomeImages'not in p.source:p.replace('img.src=asset(person.image);','img.src=GAME.cmsHomeImages?.[i]||asset(person.image);')
 # A stable marker allows repeated builds after the subtitle changes.
 if '<!--cms:kin-subtitle-->'not in p.source:
  p.replace('<p>шонер нимез бырйы</p>','<p data-cms="kin-subtitle">шонер нимез бырйы</p><!--cms:kin-subtitle-->')
  p.replace('<h2>шонер нимез бырйы</h2>','<h2 data-cms="kin-subtitle">шонер нимез бырйы</h2>')
 for tag in ['p','h2']:
  match=re.search('<'+tag+' data-cms="kin-subtitle">.*?</'+tag+'>',p.source);p.replace(match.group(),'<'+tag+' data-cms="kin-subtitle">'+html.escape(kin['subtitle'])+'</'+tag+'>')
 output.update(p.output())
 # Family structure and completion IDs are left in their original data object.
 f=ROOT/'games/family-tree/family-tree.html';source=f.read_text(encoding='utf-8');family=read_assignment(source,'const DATA=');people={p['id']:p for p in data['family']['people']};stories={r['id']:r for r in data['family']['stories']}
 for person in family['people']:
  for key in ['name','age','description']:person[key]=people[person['id']][key]
 for story in family['rounds']:
  r=stories[story['id']];story.update(title=r['title'],text=r['text']);story['ru'].update(title=r['ruTitle'],text=r['ruText']);roles={x['id']:x for x in r['roles']}
  for id in story['ids']:story['roles'][id]=roles[id]['ud'];story['ru']['roles'][id]=roles[id]['ru']
 output[f]=assign(source,'const DATA=',family)
 # Grammar targets, examples and dictionary lemmas are all compiled from the same records.
 groups={g['id']:g for g in data['case-lock']['groups']};compiled=[]
 for id in c['caseIds']:
  g=groups[id];compiled.append({'id':id,'word':g['word'],'meaning':g['meaning'],'forms':[g[k]['form']for k in ['where','to','from']],'ru':[g[k]['ru']for k in ['where','to','from']],'udm':[g[k]['udm']for k in ['where','to','from']],'explanations':[g[k].get('explanation','')for k in ['where','to','from']]})
 output[ROOT/'games/case-lock/data.js']='window.CASE_GROUPS = '+js(compiled)+';\n'
 f=ROOT/'games/case-lock/game.js';source=f.read_text(encoding='utf-8')
 if 'g.explanations?.[level]'not in source:source=source.replace('function explanation(g,level=s.level){return ',"function explanation(g,level=s.level){if(g.explanations?.[level])return g.explanations[level];return ",1)
 if 'function escCopy('not in source:
  source=source.replace("const $=id=>document.getElementById(id)","function escCopy(v){return String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')}\nconst $=id=>document.getElementById(id)",1)
  source=source.replace('<h2>${g.ru[s.level]}</h2>','<h2>${escCopy(g.ru[s.level])}</h2>').replace('Собери форму: ${g.word} — ${g.meaning}','Собери форму: ${escCopy(g.word)} — ${escCopy(g.meaning)}').replace('<th lang="udm">${g.word}<small>${g.meaning}</small>','<th lang="udm">${escCopy(g.word)}<small>${escCopy(g.meaning)}</small>').replace('<td lang="udm">${f}</td>','<td lang="udm">${escCopy(f)}</td>')
 output[f]=source
 # Start from the stable source lexicon: editing a word in one game must not rename it in another.
 bank=copy.deepcopy(c['lexicon']);byid={w['id']:w for w in bank}
 for category in seem['categories']:
  for w in category['words']:
   id='seem:'+w['id'];byid[id].update(u=w['ud'],ru=w['ru'])
 entries=[]
 for index,id in enumerate(c['caseIds']):
  g=groups[id];old=c['caseEntries'][index];entry={'index':index,'id':old['id'],'u':g['word'],'ru':g['meaning'],'aliases':[]}
  # Reuse existing IDs only where their current lemma still matches the edited target.
  for alias in old['aliases']:
   if alias in byid and byid[alias]['u'].strip().casefold()==g['word'].strip().casefold():entry['aliases'].append(alias)
  if old['id']not in entry['aliases']:
   entry['id']='case-lock:'+id
   existing=byid.get(entry['id'])
   if existing:existing.update(u=g['word'],ru=g['meaning'])
   else:
    existing={'id':entry['id'],'u':g['word'],'ru':g['meaning'],'game':'case-lock','kind':'case','ref':index};bank.append(existing);byid[existing['id']]=existing
   entry['aliases'].insert(0,entry['id'])
  elif entry['id']in byid and byid[entry['id']]['game']=='case-lock':byid[entry['id']].update(u=g['word'],ru=g['meaning'])
  entries.append(entry)
 # Persistent lexical IDs are separate from game indices and editable spelling.
 identities=load('content/vocabulary-identities.json')['units'];canonical={};byform={}
 for unit in identities:
  need(isinstance(unit,dict)and isinstance(unit.get('id'),str)and isinstance(unit.get('sourceIds'),list),'Неверный реестр постоянных ID')
  for source in unit['sourceIds']:
   need(source not in canonical,'Повтор source ID в реестре');canonical[source]=unit['id']
  byform[lexkey(unit['form'])]=unit['id']
 for w in bank:w['canonicalId']=canonical.get(w['id'])or byform.get(lexkey(w['u']))or'lex-'+hashlib.sha256(lexkey(w['u']).encode()).hexdigest()[:16]
 output[ROOT/'assets/lexicon-v18.js']='/* Compiled from content/*.json. Edit with Pages CMS. */\nwindow.UstonLexicon='+js(bank)+';\n'
 training_art={};image_recall={'seem:'+category['id']+':'+str(i):next(word for word in category['words']if word['id']==source_id).get('imageRecall',True) for category in seem['categories']for i,source_id in enumerate(c['seemIds'][category['id']])}
 for w in bank:
  if w.get('kind')!='seem':continue
  picture=copy.deepcopy(art.get(w['ru'],{}))
  if 'src'in picture:
   match=re.fullmatch(r'__UDM_ASSET_(\d+)__',picture['src'])
   if match:picture['src']=training_shared[int(match.group(1))]
  if picture:
   need(image_recall[w['id']]is None or type(image_recall[w['id']])is bool,'Режим картинки должен быть включён или выключен');picture['recall']=image_recall[w['id']]is True;training_art[w['canonicalId']]=picture
 output[ROOT/'assets/training-art.js']='/* Reuses approved My Seem illustrations; no answer labels. */\nwindow.UstonTrainingArt='+js({'byUnit':training_art,'atlas':training_atlas})+';\n'

 training=load('content/training.json')
 for key,lo,hi in [('minutes',3,5),('maxMinutes',3,5),('maxQuestions',2,20),('retryMinutes',1,1440)]:need(type(training.get(key))is int and lo<=training[key]<=hi,'Тренировка: неверное '+key)
 need(training['minutes']<=training['maxMinutes'],'Длительность тренировки превышает предел')
 need(isinstance(training.get('intervalDays'),list)and 1<=len(training['intervalDays'])<=12 and all(type(n)is int and 1<=n<=365 for n in training['intervalDays'])and training['intervalDays']==sorted(set(training['intervalDays'])),'Интервалы: нужны возрастающие целые дни')
 text(training.get('title'),'Заголовок тренировки',True,200);text(training.get('intro'),'Введение тренировки',True,2000)
 extra=load('content/vocabulary-extra.json');need(isinstance(extra.get('words'),list),'Нужен список дополнительных слов')
 # New games own their vocabulary. No separate pre-population of a global dictionary.
 for source in sorted((ROOT/'content').rglob('*.json')):
  if source.name in ['vocabulary-extra.json','vocabulary-identities.json']:continue
  declared=json.loads(source.read_text(encoding='utf-8'))
  if not isinstance(declared,dict)or'gameId'not in declared:continue
  game=declared.get('portalGameId',declared['gameId']);text(game,'ID игры',True,100)
  blocks=[('vocabulary',declared.get('vocabulary',[]))]
  if isinstance(declared.get('lexemes'),list):
   blocks.append(('lexemes',[{'id':game+':'+entry['id'],'u':entry['lemma'],'ru':entry['ru']}for entry in declared['lexemes']if entry.get('status')=='approved'and entry.get('ru')and entry.get('dictionary',True)]))
  for question in declared.get('questions',[]):
   need(isinstance(question,dict)and isinstance(question.get('id'),str),'Вопросу нужен постоянный ID')
   words=question.get('vocabulary',[]);need(isinstance(words,list)and len(words)<=2,'В вопросе допускается до двух слов')
   blocks.append((question['id'],words))
  for item,words in blocks:
   need(isinstance(words,list),'Нужен список vocabulary')
   for index,word in enumerate(words):
    need(isinstance(word,dict),'Неверная словарная единица игры')
    extra['words'].append({**word,'id':word.get('id',game+':'+item+':'+hashlib.sha256(lexkey(word.get('u','')).encode()).hexdigest()[:16]),'game':game})
 extra_ids={}
 for w in extra['words']:
  need(isinstance(w,dict),'Некорректная словарная запись')
  for key in ['id','u','ru','game']:text(w.get(key),'Словарь: '+key,True,300)
  need(w['id']not in byid and(w['id']not in extra_ids or extra_ids[w['id']]==(w['game'],lexkey(w['u']))),'Игровой ID используется для разных слов');extra_ids[w['id']]=(w['game'],lexkey(w['u']))
  need(isinstance(w.get('forms',[]),list)and all(isinstance(f,str)and len(f)<=300 for f in w.get('forms',[])),'Неверные словоформы')
 output[ROOT/'assets/training-config.js']='window.UstonTrainingConfig='+js(training)+';\n'
 for w in extra['words']:w['canonicalId']=canonical.get(w['id'])or byform.get(lexkey(w['u']))or next((x['canonicalId']for x in bank if lexkey(x['u'])==lexkey(w['u'])),None)or'lex-'+hashlib.sha256(lexkey(w['u']).encode()).hexdigest()[:16]
 for w in extra['words']:
  if w['id']not in canonical:
   existing=next((u for u in identities if u['id']==w['canonicalId']),None)
   if existing:existing['sourceIds'].append(w['id'])
   else:identities.append({'id':w['canonicalId'],'form':w['u'],'sourceIds':[w['id']]})
   canonical[w['id']]=w['canonicalId']
 output[ROOT/'content/vocabulary-identities.json']=json.dumps({'units':identities},ensure_ascii=False,indent=2)+'\n'
 output[ROOT/'assets/vocabulary-extra.js']='window.UstonVocabularyExtra='+js(extra['words'])+';\n'

 for name in ['assets/case-lock-dictionary.js','games/case-lock/dictionary.js']:
  f=ROOT/name;output[f]=assign(f.read_text(encoding='utf-8'),'const entries=',entries)
 # District field names are editor-friendly; the rendered shape stays compatible with the map.
 districts={};keymap={'location':'Расположение и центр','history':'История','nature':'Природа','culture':'Культура','visit':'Что посмотреть'}
 for r in sorted(data['districts']['regions'],key=lambda x:x['id']):
  sections={label:[p for p in r[k].split('\n\n')if p.strip()]for k,label in keymap.items()};sections['Источники']=[]
  sources=[{'text':f'[{i+1}] '+s['label'],'links':[{'text':s['label'],'url':s['url']}]if s.get('url')else[]}for i,s in enumerate(r['sources'])];districts[r['name']]={'sections':sections,'sources':sources}
 output[ROOT/'assets/district-cards-ru.js']='window.UstonDistrictCardsRu='+js(districts)+';\nwindow.UstonDistrictVerifiedDate='+js(data['districts']['verifiedDate'])+';\n'
 date="'+esc(window.UstonDistrictVerifiedDate)+'"
 for f in [ROOT/'games/udmurtia/index.html']:
  source=f.read_text(encoding='utf-8');source=re.sub(r'Дата сверки материалов: .*?</p>',lambda m:'Дата сверки материалов: '+date+'.</p>',source);output[f]=source
 p=Packed('udmurtia');match=re.search(r'Дата сверки материалов: .*?</p>',p.source)
 if match:p.replace(match.group(),'Дата сверки материалов: '+date+'.</p>')
 output.update(p.output())
 # Render plain text safely into the existing methodology card styles.
 def paragraph(p):
  body=html.escape(p)
  if p.startswith('Электронная почта:'):
   match=re.search(r'[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}',p)
   if match:mail=html.escape(match.group());body=body.replace(mail,'<a href="mailto:'+mail+'">'+mail+'</a>')
  return '<p>'+body+'</p>'
 methods=data['methodology'];sections={x['id']:x for x in methods['sections']};rendered='<section id="page-methods" class="info-page" hidden><header class="info-intro"><h1>'+html.escape(methods['title'])+'</h1></header>'
 for id in c['methodIds']:
  s=sections[id];rendered+='<article class="info-card prose method-section"><h2>'+html.escape(s['title'])+'</h2>'+''.join(paragraph(p)for p in s['paragraphs'])
  if s['blocks']:rendered+='<div class="method-grid">'+''.join('<div><h3>'+html.escape(b['title'])+'</h3>'+''.join(paragraph(p)for p in b['paragraphs'])+'</div>'for b in s['blocks'])+'</div>'
  if s['sources']:
   rendered+='<ol class="sources">'
   for src in s['sources']:rendered+='<li>'+html.escape(src['text'])+' '+ ' '.join('<a href="'+html.escape(link['url'],quote=True)+'" target="_blank" rel="noopener noreferrer">'+html.escape(link['label'])+'</a>'for link in src['links'])+'</li>'
   rendered+='</ol>'
  rendered+='</article>'
 rendered+='</section>\n';f=ROOT/'index.html';source=f.read_text(encoding='utf-8');a=source.index('<section id="page-methods"');b=source.index('<section id="page-profile"',a);output[f]=source[:a]+rendered+source[b:]
 import importlib.util
 spec=importlib.util.spec_from_file_location('uston_conjugation_content',Path(__file__).with_name('conjugation_content.py'));module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
 output.update(module.compile_game(ROOT,need,text,asset,js))
 manifest_path=ROOT/'MANIFEST_v18.json'
 if manifest_path.exists():
  manifest=load('MANIFEST_v18.json');manifest['release']='v18-cms-20261116';manifest['base_commit']=c['baseCommit'];files={}
  for path in sorted(ROOT.rglob('*')):
   if not path.is_file():continue
   rel=path.relative_to(ROOT)
   if path==manifest_path or any(x in ['.git','_site','__pycache__']for x in rel.parts)or str(rel)=='tests/results.json':continue
   raw=output[path].encode('utf-8')if path in output else path.read_bytes();files[str(rel)]=hashlib.sha256(raw).hexdigest()
  manifest['files']=files;output[manifest_path]=json.dumps(manifest,ensure_ascii=False,indent=2)+'\n'
 return output

def main(argv=None):
 parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--check',action='store_true',help='Validate all content and compilation without writing output');parser.add_argument('--publish',action='store_true',help='Also create a static-only _site folder for GitHub Pages');args=parser.parse_args(argv)
 try:
  contract=load('tools/content-contract.json');data={name:load('content/'+name+'.json')for name in ['my-seem','kin-ta','family','case-lock','districts','methodology']};normalize(data);validate(data,contract);output=compile_all(data,contract)
  changed=[(path,value)for path,value in output.items()if not path.exists()or path.read_text(encoding='utf-8')!=value]
  if not args.check:
   for path,value in changed:
    with tempfile.NamedTemporaryFile('w',encoding='utf-8',dir=path.parent,delete=False)as tmp:tmp.write(value);temp=tmp.name
    os.replace(temp,path)
  if args.publish and not args.check:
   destination=ROOT/'_site';marker=destination/'.uston-build-output'
   if destination.exists():
    need(marker.is_file(),'Папка _site уже существует и не помечена как результат сборки');shutil.rmtree(destination)
   destination.mkdir();marker.write_text('Generated static publication.\n',encoding='utf-8')
   for name in ['assets','games','apps','media']:
    if (ROOT/name).is_dir():shutil.copytree(ROOT/name,destination/name,ignore=shutil.ignore_patterns('__pycache__','*.pyc','tests'))
   for name in ['index.html','.nojekyll']:
    if (ROOT/name).is_file():shutil.copyfile(ROOT/name,destination/name)
  print(('Проверено'if args.check else'Собрано')+': 9 разделов CMS; '+str(len(changed))+' файлов '+('требуют обновления'if args.check else'обновлено')+'.')
  return 0
 except (ContentError,KeyError,TypeError,AttributeError)as e:
  print('Ошибка в материалах CMS: '+str(e),file=sys.stderr);return 1
if __name__=='__main__':raise SystemExit(main())
