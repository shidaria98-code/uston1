const lines=[
{scene:1,who:'Рассказчик',text:'Автомобиль едет по летней дороге. Рядом устроился рыжий кот. Впереди — целое лето у бабушки и дедушки.'},
{scene:1,who:'Кот',text:'Ӟечбур! Так по-удмуртски говорят «здравствуй»!'},
{scene:1,who:'Ты',text:'Кот разговаривает?! Да ещё и по-удмуртски?'},
{scene:2,who:'Кот',text:'Попробуй поздороваться со мной. Как будет «здравствуй»?',choice:[['Ӟечбур!',4],['Тау!',3],['Гурт!',3]]},
{scene:2,who:'Кот',text:'Верно! Ӟечбур! А теперь давай знакомиться.',next:5},
{scene:2,who:'Кот',text:'«Кызьы тынад нимыд?» — так по-удмуртски спрашивают: «Как тебя зовут?»'},
{scene:2,who:'Кот',text:'Чтобы ответить, скажи по-удмуртски: «Мынам нимы…». Это значит «Меня зовут…».',next:7},
{scene:2,who:'Ты',text:'Мынам нимы {name}!',next:8},
{scene:2,who:'Кот',text:'Очень приятно, {name}! А мы как раз едем в нашу деревню. «Гурт» — это деревня на удмуртском языке. А целиком можно сказать: «Ми мыниськом гуртэ». Это значит «Мы едем в деревню».',choice:[['Погладить кота',9],['Посмотреть в окно',10]]},
{scene:2,who:'Рассказчик',text:'Кот довольно мурлычет и устраивается поближе.',next:11,flag:'catPet'},
{scene:3,who:'Рассказчик',text:'За окном мелькают деревья. Кот тоже внимательно смотрит на дорогу.',next:11,flag:'catWindow'},
{scene:3,who:'Кот',text:'Посмотри в окно! Видишь дерево? По-удмуртски растущее дерево называется «писпу». А слово «пу» обозначает древесину — материал.'},
{scene:3,who:'Ты',text:'Теперь я понимаю: «писпу» — живое дерево, а «пу» — древесина!',next:13},
{scene:3,who:'Кот',text:'Именно! А впереди уже виднеется наша деревня. Помнишь слово «гурт»?',quiz:'tree',next:14},
{scene:4,who:'Рассказчик',text:'Машина въезжает в деревню. На улице стоят деревянные дома с резными наличниками.'},
{scene:4,who:'Кот',text:'Видишь дом с голубыми наличниками? По-удмуртски «корка» означает «дом». Там живут твои бабушка и дедушка.'},
{scene:4,who:'Ты',text:'Вот и наш дом! Я запомню: «корка» — это дом по-удмуртски. Скорее бы всех увидеть!',quiz:'village',next:17},
{scene:5,who:'Рассказчик',text:'Калитка открывается. Навстречу выходит бабушка.'},
{scene:5,who:'Бабушка',text:'Ӟечбур, {name}! Как же я рада тебя видеть! А знаешь, как будет «бабушка» по-удмуртски? «Песянай»!'},
{scene:5,who:'Кот',text:'Ты уже знаешь, как ответить на приветствие!',choice:[['Ӟечбур!',20],['Мынам нимы…',19],['Писпу!',19]]},
{scene:5,who:'Ты',text:'Ӟечбур! Я так соскучился! Теперь я знаю, что «песянай» — это бабушка.',next:21},
{scene:5,who:'Бабушка',text:'И я соскучилась! Расскажешь о дороге?',choice:[['Расскажу про кота',22],['Сначала обниму бабушку',23]]},
{scene:5,who:'Ты',text:'Кот научил меня новым словам! «Гурт» — деревня, а «корка» — дом.',next:24,flag:'toldCat'},
{scene:5,who:'Рассказчик',text:'Ты крепко обнимаешь бабушку. Кот ласково трётся о её ноги.',next:24,flag:'hug'},
{scene:6,who:'Рассказчик',text:'На крыльцо выходит дедушка. Он улыбается и машет рукой.'},
{scene:6,who:'Дедушка',text:'Ӟечбур! А слово «песятай» означает «дедушка». Ну-ка, попробуй представиться мне по-удмуртски!',choice:[['Мынам нимы {name}.',26],['Кызьы тынад нимыд?',25],['Тау!',25]]},
{scene:6,who:'Ты',text:'Мынам нимы {name}!',next:27},
{scene:6,who:'Дедушка',text:'Отлично! Ты уже умеешь здороваться и представляться. Молодец!',quiz:'family',next:28},
{scene:6,who:'Дедушка',text:'Завтра я покажу тебе огород, а бабушка приготовит вкусный завтрак. С чего начнём?',choice:[['Сначала помогу бабушке на кухне',29],['Сначала пойду с дедушкой во двор',30]]},
{scene:6,who:'Бабушка',text:'Договорились! Завтра начнём с кухни. Я покажу тебе, как готовить завтрак.',next:31,flag:'kitchen'},
{scene:6,who:'Дедушка',text:'Договорились! Завтра начнём с огорода. Там нас ждёт много интересного.',next:31,flag:'garden'},
{scene:6,who:'Рассказчик',text:'Первый день в деревне подходит к концу. Завтра тебя ждут новые открытия. Спокойной ночи!',next:'c2_start'}
];

const chapter2={
 c2_start:{chapter:2,scene:1,who:'Рассказчик',text:'Солнечные лучи пробираются в комнату. На подоконнике сидит рыжий кот, а за окном поют птицы.',next:'c2_cat'},
 c2_cat:{chapter:2,scene:1,who:'Кот',text:'Просыпайся, {name}! По-удмуртски «утро» — «ӵукна». А чтобы пожелать доброго утра, говорят: «Бур ӵукнаен!»',next:'c2_greet'},
 c2_greet:{chapter:2,scene:1,who:'Кот',text:'Как ты пожелаешь мне доброго утра?',choice:[['Бур ӵукнаен!','c2_greet_ok'],['Ӟеч ӝыт!','c2_greet_ok'],['Тау!','c2_greet_ok']],correct:0,wrong:['','Это пожелание доброго вечера. Сейчас утро — попробуй ещё раз!','Это слово благодарности. А как пожелать доброго утра?']},
 c2_greet_ok:{chapter:2,scene:1,who:'Кот',text:'Правильно! Бур ӵукнаен! Слышишь? Бабушка зовёт с кухни, а дедушка уже во дворе.',next:'c2_choice'},
 c2_choice:{chapter:2,scene:1,who:'Кот',text:'Кому поможем сначала? От твоего выбора зависит, куда мы отправимся прямо сейчас.',choice:[['К бабушке на кухню','c2_kitchen_1'],['К дедушке во двор','c2_garden_1']],flagChoice:['kitchen','garden']},
 c2_kitchen_1:{chapter:2,scene:2,who:'Рассказчик',text:'На кухне пахнет свежим хлебом. Бабушка замешивает тесто и улыбается тебе.',next:'c2_kitchen_2'},
 c2_kitchen_2:{chapter:2,scene:2,who:'Бабушка',text:'Бур ӵукнаен, {name}! Поможешь накрыть на стол? По-удмуртски «стол» — «ӝӧк».',next:'c2_kitchen_3'},
 c2_kitchen_3:{chapter:2,scene:2,who:'Бабушка',text:'Вот свежий хлеб. «Нянь» — это хлеб. А «пуньы» — ложка. Запомни эти слова: сейчас они нам пригодятся.',next:'c2_kitchen_q1'},
 c2_kitchen_q1:{chapter:2,scene:2,who:'Бабушка',text:'Для начала найди хлеб. Какой предмет означает слово «нянь»?',quiz:'bread',next:'c2_kitchen_q2'},
 c2_kitchen_q2:{chapter:2,scene:2,who:'Бабушка',text:'Отлично! Теперь найдём ложку. Где «пуньы»?',quiz:'spoon',next:'c2_kitchen_q3'},
 c2_kitchen_q3:{chapter:2,scene:2,who:'Бабушка',text:'И последнее: выбери «ӝӧк».',quiz:'table',next:'c2_kitchen_done'},
 c2_kitchen_done:{chapter:2,scene:2,who:'Бабушка',text:'Тау! Это значит «спасибо». С твоей помощью мы быстро накрыли на стол.',next:'c2_after_kitchen'},
 c2_after_kitchen:{chapter:2,scene:2,who:'Кот',text:'С бабушкой справились! А дедушка всё ещё ждёт нас во дворе.',next:'c2_garden_1'},
 c2_garden_1:{chapter:2,scene:3,who:'Рассказчик',text:'Во дворе солнечно. Дедушка осматривает клумбу, а рядом стоит лейка. Рыжий кот устраивается в траве.',next:'c2_garden_2'},
 c2_garden_2:{chapter:2,scene:3,who:'Дедушка',text:'Бур ӵукнаен, {name}! Посмотри, как ярко светит солнце. «Шунды» — это солнце по-удмуртски.',next:'c2_garden_3'},
 c2_garden_3:{chapter:2,scene:3,who:'Дедушка',text:'А вот наши цветы. «Сяська» означает «цветок». Сегодня им нужна вода.',next:'c2_garden_q1'},
 c2_garden_q1:{chapter:2,scene:3,who:'Дедушка',text:'Найди цветок. Какая картинка подходит к слову «сяська»?',quiz:'flower',next:'c2_garden_q2'},
 c2_garden_q2:{chapter:2,scene:3,who:'Дедушка',text:'Теперь найди солнце. Где «шунды»?',quiz:'sun',next:'c2_garden_4'},
 c2_garden_4:{chapter:2,scene:3,who:'Дедушка',text:'А теперь скажу целую фразу: «Ойдо сяськаосты кисьтом». Это значит «Давай польём цветы».',next:'c2_garden_q3'},
 c2_garden_q3:{chapter:2,scene:3,who:'Дедушка',text:'Чтобы полить цветы, нам нужен один предмет. Выбери лейку!',quiz:'wateringcan',next:'c2_garden_done'},
 c2_garden_done:{chapter:2,scene:3,who:'Рассказчик',text:'Ты осторожно поливаешь цветы. На лепестки садится бабочка. Дедушка довольно кивает.',next:'c2_garden_thanks'},
 c2_garden_thanks:{chapter:2,scene:3,who:'Дедушка',text:'Спасибо за помощь! По-удмуртски можно сказать: «Тау!»',next:'c2_after_garden'},
 c2_after_garden:{chapter:2,scene:3,who:'Кот',text:'Дедушке помогли! Бабушка, кажется, уже приготовила завтрак.',next:'c2_kitchen_1'},
 c2_breakfast_1:{chapter:2,scene:4,who:'Рассказчик',text:'Вся семья собирается за столом. Пахнет свежим хлебом, на столе стоят молоко и горячий чай.',next:'c2_breakfast_2'},
 c2_breakfast_2:{chapter:2,scene:4,who:'Бабушка',text:'Как тебе первое утро в деревне, {name}? Что понравилось больше всего?',choice:[['Готовить завтрак с бабушкой','c2_react_kitchen'],['Поливать цветы с дедушкой','c2_react_garden'],['Гулять вместе с котом','c2_react_cat']]},
 c2_react_kitchen:{chapter:2,scene:4,who:'Бабушка',text:'Мне тоже было приятно готовить вместе! Ты уже знаешь, что «нянь» — хлеб, а «пуньы» — ложка.',next:'c2_breakfast_3'},
 c2_react_garden:{chapter:2,scene:4,who:'Дедушка',text:'А наши цветы теперь точно не засохнут! Ты запомнил, что «сяська» — цветок.',next:'c2_breakfast_3'},
 c2_react_cat:{chapter:2,scene:4,who:'Кот',text:'Мяу! Хорошая компания — самое важное в любом приключении!',next:'c2_breakfast_3'},
 c2_breakfast_3:{chapter:2,scene:4,who:'Бабушка',text:'После завтрака я покажу тебе одну старую вещь. Она хранится у нас много лет…',next:'c2_chest_1'},
 c2_chest_1:{chapter:2,scene:5,who:'Рассказчик',text:'Бабушка ведёт тебя к старому деревянному сундуку. Кот тут же подбегает поближе.',next:'c2_chest_2'},
 c2_chest_2:{chapter:2,scene:5,who:'Бабушка',text:'По-удмуртски «сундук» — «шыкыс». В нём хранятся старые фотографии и вещи нашей семьи.',next:'c2_chest_3'},
 c2_chest_3:{chapter:2,scene:5,who:'Кот',text:'Интересно, что там внутри? Кажется, у нас начинается новое приключение!',next:'c2_end'},
 c2_end:{chapter:2,scene:5,who:'Рассказчик',text:'Глава 2 завершена. Ты помог бабушке и дедушке, выучил новые слова и нашёл загадочный сундук. Продолжение — в следующей главе!',end:true}
};


const chapter3={
 c3_start:{chapter:3,scene:1,who:'Бабушка',text:'Перед тобой старый сундук — «шыкыс». Здесь мы храним семейные вещи. Что посмотрим сначала?',choice:[['Старинную одежду','c3_clothes'],['Семейные фотографии','c3_photo_intro']]},
 c3_clothes:{chapter:3,scene:1,who:'Бабушка',text:'Это «дэрем» — традиционная рубашка или платье. «Йыркышет» — головной платок. «Кускерттон» — пояс. А нагрудное украшение из монет называется «чыртывесь».',next:'c3_objects'},
 c3_objects:{chapter:3,scene:2,who:'Бабушка',text:'Теперь попробуй найти каждую вещь. Мы уже познакомились с названиями!',activity:'objects',next:'c3_dress'},
 c3_dress:{chapter:3,scene:3,who:'Бабушка',text:'Ты узнал все четыре предмета! Теперь посмотри, как они дополняют друг друга в традиционном наряде: дэрем, кускерттон, йыркышет и чыртывесь. А в сундуке есть ещё семейные фотографии.',next:'c3_photo_intro'},
 c3_photo_intro:{chapter:3,scene:4,who:'Бабушка',text:'Посмотри на эту семейную фотографию. Здесь наши родственники. А рядом лежит письмо, которое пришло с фронта во время Великой Отечественной войны.',choice:[['Прочитать письмо','c3_letter'],['Сначала рассмотреть фотографию','c3_photo']]},
 c3_photo:{chapter:3,scene:4,who:'Бабушка',text:'На снимке молодые члены нашей семьи. Их одежда и лица помогают нам представить, как жили люди раньше.',next:'c3_letter'},
 c3_letter:{chapter:3,scene:5,who:'Бабушка',text:'Это письмо с фронта. Наш родственник писал, что скучает по дому и родным. Мы бережно храним его много лет.',next:'c3_letter_choice'},
 c3_letter_choice:{chapter:3,scene:5,who:'Ты',text:'Письмо — настоящая семейная память. Что сделаем?',choice:[['Осторожно положить письмо обратно','c3_after_letter'],['Попросить бабушку рассказать ещё','c3_more']]},
 c3_more:{chapter:3,scene:5,who:'Бабушка',text:'В годы войны семьи ждали писем неделями. Каждая весточка была очень важна. А после войны люди снова строили мирную жизнь.',next:'c3_after_letter'},
 c3_after_letter:{chapter:3,scene:5,who:'Рассказчик',text:'Ты аккуратно возвращаешь письмо на место. На обороте семейной фотографии виднеется надпись.',next:'c3_vuzhgurt'},
 c3_vuzhgurt:{chapter:3,scene:6,who:'Бабушка',text:'«Вужгурт. 1952 год». Там раньше жили наши родственники. Может быть, мы узнаем ещё больше об истории нашей семьи.',next:'c3_end'},
 c3_end:{chapter:3,scene:6,who:'Ты',text:'Давай съездим в Вужгурт! Я хочу увидеть деревню, где раньше жили наши родственники.',end:true}
};
const objectWords=[['дэрем','платье / рубашка'],['кускерттон','пояс'],['йыркышет','платок'],['чыртывесь','монисто']];
let activityStep=0;
function activity(type){quizOpen=true;activityStep=0;$('quiz').classList.remove('hide');$('quizContinue').classList.add('hide');$('quizCards').replaceChildren();$('quizFeedback').textContent='';$('quizFeedback').className='quizfeedback';
 const order=type==='dress'?[0,1,2,3]:[2,0,3,1];
 function draw(){const target=order[activityStep];$('quizWord').textContent=objectWords[target][0];$('quizPrompt').textContent=type==='dress'?'Выбери следующий элемент традиционного наряда.':'Найди предмет, который назвала бабушка.';$('quizCards').replaceChildren();
 for(let i=0;i<4;i++){const b=document.createElement('button');b.type='button';b.className='quizcard';b.style.cssText='min-height:120px;background:#fff6e5;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;font-size:15px;color:#5c291a';
 const pictures=['derem','belt','scarf','monisto'];const pic=document.createElement('img');pic.src=`assets/object_${pictures[i]}.jpg`;pic.alt=objectWords[i][1];pic.style.cssText='width:100%;height:100%;object-fit:contain;border-radius:9px';b.append(pic);b.setAttribute('aria-label',objectWords[i][1]);b.addEventListener('click',()=>{if(i!==target){$('quizFeedback').textContent='Не совсем! Вспомни объяснение бабушки и попробуй ещё раз.';$('quizFeedback').className='quizfeedback bad';return;}activityStep++;$('quizFeedback').textContent='Верно! '+objectWords[i][0]+' — '+objectWords[i][1]+'.';$('quizFeedback').className='quizfeedback good';if(activityStep===4){passed[at]=true;$('quizContinue').classList.remove('hide');$('quizCards').replaceChildren();$('quizWord').textContent='Все четыре предмета найдены!';$('quizPrompt').textContent='Молодец! Можно продолжать историю.';}else draw()});$('quizCards').append(b)}}draw();}

const $=id=>document.getElementById(id);

const chapter4={
 c4_start:{chapter:4,scene:1,who:'Рассказчик',text:'Утро перед поездкой в Вужгурт. На столе лежат вещи для дороги. Бабушка помогает тебе собраться.',next:'c4_my'},
 c4_my:{chapter:4,scene:1,who:'Бабушка',text:'Сегодня узнаем, как сказать «мой» и «твой». «Мынам» — мой, моя, моё. «Тынад» — твой, твоя, твоё.',next:'c4_house'},
 c4_house:{chapter:4,scene:1,who:'Бабушка',text:'Помнишь «корка» — дом? «Мынам коркае» — мой дом, а «тынад коркаед» — твой дом. В удмуртском языке принадлежность выражается и суффиксом: корка + е → коркае; корка + ед → коркаед.',next:'c4_house_task'},
 c4_house_task:{chapter:4,scene:1,who:'Бабушка',text:'Собери выражение «мой дом». Выбирай части по порядку.',build:['Мынам','корка','е'],buildRu:'мой дом',next:'c4_your_task'},
 c4_your_task:{chapter:4,scene:1,who:'Бабушка',text:'Теперь попробуй составить «твой дом».',build:['Тынад','корка','ед'],buildRu:'твой дом',next:'c4_village'},
 c4_village:{chapter:4,scene:1,who:'Бабушка',text:'Ты уже знаешь слово «гурт» — деревня. Сравни: «мынам гуртэ» — моя деревня; «тынад гуртэд» — твоя деревня. Здесь суффиксы выглядят как -э и -эд.',next:'c4_village_task'},
 c4_village_task:{chapter:4,scene:1,who:'Бабушка',text:'Собери выражение «моя деревня».',build:['Мынам','гурт','э'],buildRu:'моя деревня',next:'c4_village_task2'},
 c4_village_task2:{chapter:4,scene:1,who:'Бабушка',text:'А теперь — «твоя деревня».',build:['Тынад','гурт','эд'],buildRu:'твоя деревня',next:'c4_depart'},
 c4_depart:{chapter:4,scene:2,who:'Рассказчик',text:'Вы отправляетесь в Вужгурт. За окном тянутся летние поля и деревья. Бабушка предлагает научиться задавать вопрос.',next:'c4_what'},
 c4_what:{chapter:4,scene:2,who:'Бабушка',text:'Если хочешь спросить «Что это?», скажи «Мар та?». «Мар» — что, «та» — это. Попробуй спросить меня!',choice:[['Мар та?','c4_what_ok'],['Мынам коркае','c4_what_ok'],['Тынад коркаед','c4_what_ok']],correct:0,wrong:['','Это «мой дом». А как спросить «Что это?»','Это «твой дом». А как спросить «Что это?»']},
 c4_what_ok:{chapter:4,scene:2,who:'Бабушка',text:'Правильно! «Мар та?» — «Что это?» Посмотри на дерево за окном. Можно ответить: «Та писпу» — «Это дерево».',next:'c4_what_task'},
 c4_what_task:{chapter:4,scene:2,who:'Кот',text:'Собери ответ «Это дерево».',build:['Та','писпу'],buildRu:'это дерево',next:'c4_river'},
 c4_river:{chapter:4,scene:3,who:'Рассказчик',text:'Дорога ведёт дальше, и вдали появляется река. По-удмуртски «шур» — река, а «сюрес» — дорога.',next:'c4_question'},
 c4_question:{chapter:4,scene:3,who:'Кот',text:'А теперь выбери вопрос, который поможет узнать название незнакомого предмета.',choice:[['Мар та?','c4_answer'],['Тынад коркаед','c4_answer'],['Мынам гуртэ','c4_answer']],correct:0,wrong:['','Это выражение означает «твой дом».','Это выражение означает «моя деревня».']},
 c4_answer:{chapter:4,scene:3,who:'Бабушка',text:'Молодец! «Мар та?» пригодится нам и в Вужгурте. А «мынам» и «тынад» помогут рассказывать о своих вещах и знакомых местах.',next:'c4_arrive'},
 c4_arrive:{chapter:4,scene:4,who:'Рассказчик',text:'За поворотом показался указатель «Вужгурт». Дедушка остановил машину. Вдоль дороги стояли деревянные дома, за заборами цвели цветы. Бабушка бережно достала фотографию 1952 года.',next:'c4_arrive_talk'},
 c4_arrive_talk:{chapter:4,scene:4,who:'Бабушка',text:'Когда-то я знала здесь каждый дом. А теперь многое изменилось. Интересно, сохранился ли наш?',next:'c4_where_intro'},
 c4_where_intro:{chapter:4,scene:5,who:'Бабушка',text:'«Кытын?» по-удмуртски значит «где?». Ты уже знаешь «тынад коркаед» — «твой дом». Попробуй спросить: «Кытын коркаед?» — «Где твой дом?»',choice:[['Кытын коркаед?','c4_where_ok'],['Мар та?','c4_where_ok'],['Мынам коркае','c4_where_ok']],correct:0,wrong:['','«Мар та?» означает «Что это?». Нам нужно спросить «Где?».','Это «мой дом». Вспомни вопрос «Кытын?».']},
 c4_where_ok:{chapter:4,scene:5,who:'Бабушка',text:'Правильно! «Кытын коркаед?» — «Где твой дом?». Смотри: на старой фотографии у дома три окна и большая берёза у забора.',next:'c4_search_intro'},
 c4_search_intro:{chapter:4,scene:5,who:'Рассказчик',text:'Вы проходите по деревенской улице. Один дом похож на тот, что на фотографии, но у него два окна. У другого три окна, а рядом растёт старая берёза.',choice:[['Осмотреть дом с тремя окнами и берёзой','c4_search_found'],['Сначала проверить дом с двумя окнами','c4_search_other']]},
 c4_search_other:{chapter:4,scene:5,who:'Дедушка',text:'Похожий дом, но сравни его с фотографией: там было три окна. Давай поищем внимательнее.',next:'c4_search_found'},
 c4_search_found:{chapter:4,scene:5,who:'Бабушка',text:'Вот он! «Шедьты коркаез!» означает «Найди дом!». Ты справился с поиском. Дом немного перестроили, но берёза всё та же.',next:'c4_meet'},
 c4_meet:{chapter:4,scene:6,who:'Рассказчик',text:'Калитка скрипнула. Из двора вышла пожилая женщина в простом платье и платке. Увидев бабушку, она широко улыбнулась. Сёстры обнялись.',next:'c4_who'},
 c4_who:{chapter:4,scene:6,who:'Бабушка',text:'Хочешь спросить, кто это? «Кин та?» — «Кто это?». Спроси меня!',choice:[['Кин та?','c4_sister'],['Кытын коркаед?','c4_sister'],['Мар та?','c4_sister']],correct:0,wrong:['','Так спрашивают «Где твой дом?». А нам нужно «Кто это?».','Так спрашивают о предмете: «Что это?».']},
 c4_sister:{chapter:4,scene:6,who:'Бабушка',text:'Мынам апае. Это моя старшая сестра! «Апай» — старшая сестра, а «мынам апае» — моя старшая сестра.',next:'c4_sister_joke'},
 c4_sister_joke:{chapter:4,scene:6,who:'Старшая сестра бабушки',text:'Наконец-то приехали! Столько лет не виделись — и вы чуть не прошли мимо нашего дома! Заходите, я покажу вам семейный альбом.',next:'c4_album'},
 c4_album:{chapter:4,scene:7,who:'Рассказчик',text:'В доме пахло свежим чаем. На стол легли старые фотографии. Среди них оказался ещё один снимок того же дома — с большой семьёй на крыльце.',next:'c4_family_intro'},
 c4_family_intro:{chapter:4,scene:7,who:'Старшая сестра бабушки',text:'Давай вспомним родных: «анай» — мама, «атай» — папа, «апай» — старшая сестра, «агай» — старший брат. «Песянай» — бабушка, «песятай» — дедушка.',next:'c4_family_possessive'},
 c4_family_possessive:{chapter:4,scene:7,who:'Бабушка',text:'С родными тоже можно сказать «мой» и «твой»: «мынам анае» — моя мама, «тынад анаед» — твоя мама. А «мынам апае» — моя старшая сестра. Замечаешь, как изменяются слова?',next:'c4_family_task'},
 c4_family_task:{chapter:4,scene:7,who:'Кот',text:'Собери выражение «моя мама».',build:['Мынам','анае'],buildRu:'моя мама',next:'c4_family_task2'},
 c4_family_task2:{chapter:4,scene:7,who:'Кот',text:'Теперь собери выражение «твоя мама».',build:['Тынад','анаед'],buildRu:'твоя мама',next:'c4_find_family'},
 c4_find_family:{chapter:4,scene:7,who:'Старшая сестра бабушки',text:'Поиграем в поиск! «Шедьты» — «найди». «Шедьты анаез!» — «Найди маму!». На фотографии моя мама стоит возле двери. Кто она для меня?',choice:[['Моя мама — мынам анае','c4_find_sister'],['Моя старшая сестра — мынам апае','c4_find_sister'],['Мой дом — мынам коркае','c4_find_sister']],correct:0,wrong:['','Это старшая сестра. Нам нужна мама — «анай».','Это дом. А мы ищем человека.']},
 c4_find_sister:{chapter:4,scene:7,who:'Старшая сестра бабушки',text:'А теперь «Шедьты апаез!» — «Найди старшую сестру!». На фотографии я стою рядом с бабушкой, когда мы были молодыми. Как бабушка скажет «моя старшая сестра»?',choice:[['Мынам апае','c4_clue'],['Тынад анаед','c4_clue'],['Мынам коркае','c4_clue']],correct:0,wrong:['','Это «твоя мама».','Это «мой дом».']},
 c4_clue:{chapter:4,scene:7,who:'Рассказчик',text:'Перелистывая альбом, ты замечаешь ещё один снимок. На нём — тот же дом, но рядом стоит незнакомый человек с деревянным ящиком в руках.',next:'c4_clue_choice'},
 c4_clue_choice:{chapter:4,scene:7,who:'Ты',text:'Интересно, кто это? И что у него в ящике?',choice:[['Спросить о незнакомом человеке','c4_clue_person'],['Сначала рассмотреть ящик','c4_clue_box']]},
 c4_clue_person:{chapter:4,scene:7,who:'Старшая сестра бабушки',text:'Он был нашим родственником и много помогал деревне. Его историю я расскажу тебе, когда мы найдём одну вещь, которую он оставил.',next:'c4_end'},
 c4_clue_box:{chapter:4,scene:7,who:'Старшая сестра бабушки',text:'Хорошо, что заметил ящик. В нём когда-то хранилась важная для нашей семьи вещь. Но где теперь сам ящик?',next:'c4_end'},
 c4_end:{chapter:4,scene:7,who:'Бабушка',text:'Сегодня мы нашли дом и встретились с семьёй. А завтра попробуем разгадать историю старого ящика. Не забудь заглянуть в словарь и повторить новые слова!',end:true}
};


const revised={"intro_mon":{"chapter":1,"scene":1,"who":"Бабушка","text":"Пока едем, познакомимся: мон — я, тон — ты. Говоря о себе, выбирай «мон», обращаясь к собеседнику — «тон».","art":"assets/scene2.jpg","next":"intro_mon_q"},"intro_mon_q":{"chapter":1,"scene":1,"who":"Бабушка","text":"Ты представляешься. Какое местоимение означает «я»?","choice":[["мон","intro_ton_q"],["тон","intro_ton_q"]],"correct":0,"art":"assets/scene2.jpg"},"intro_ton_q":{"chapter":1,"scene":1,"who":"Бабушка","text":"Кот обращается к тебе. Как сказать «ты»?","choice":[["тон",8],["мон",8]],"correct":0,"art":"assets/scene2.jpg"},"doll_start":{"chapter":2,"scene":5,"who":"Бабушка","text":"После завтрака бабушка достаёт старый журнал с бумажной куклой. «Сначала выберем одежду, а потом я покажу семейные фотографии».","next":"doll_words"},"doll_words":{"chapter":2,"scene":5,"who":"Бабушка","text":"Вспомним вещи из сундука: дэрем — платье / рубашка; йыркышет — платок; кускерттон — пояс; чыртывесь — монисто.","next":"doll_play"},"doll_play":{"chapter":2,"scene":5,"who":"Бабушка","text":"Одень бумажную куклу: выбери платье и платок, затем цвет платья. Это временный макет игры; названия цветов пока на русском.","doll":true,"next":"doll_find"},"doll_find":{"chapter":2,"scene":5,"who":"Бабушка","text":"Теперь найди знакомые вещи по удмуртскому названию.","activity":"objects","next":"doll_end"},"doll_end":{"chapter":2,"scene":5,"who":"Бабушка","text":"Кукла готова! Бабушка откладывает журнал и достаёт семейные фотографии. Кто изображён на них?","end":true,"exit":"family_start"},"family_start":{"chapter":3,"scene":1,"who":"Бабушка","text":"За столом собралась семья. Анай — мама, атай — папа, песянай — бабушка, песятай — дедушка, апай — старшая сестра, агай — старший брат.","art":"assets/ch3_photo.jpg","next":"family_pronouns"},"family_pronouns":{"chapter":3,"scene":1,"who":"Бабушка","text":"Мон — я, тон — ты. А теперь: со — он / она, ми — мы, тӥ — вы, соос — они. Бабушка показывает одного человека, затем всю семью.","art":"assets/ch3_photo.jpg","next":"family_so"},"album_intro":{"chapter":5,"scene":1,"who":"Бабушка","text":"Старшая сестра бабушки раскрывает семейный альбом. Вспомним родных, затем разберём, как указать владельца вещи.","art":"assets/ch3_family_relics.jpg","next":"c4_family_intro"},"album_len":{"chapter":5,"scene":1,"who":"Бабушка","text":"В этой главе знакомимся с показателем принадлежности -лэн: он помогает указать, кому принадлежит предмет. Полные удмуртские примеры пока ждут языковой проверки. Потренируем смысл на русском.","art":"assets/ch3_family_relics.jpg","next":"album_q"},"album_q":{"chapter":5,"scene":1,"who":"Бабушка","text":"«Бабушкин альбом»: кто владелец?","choice":[["Бабушка","album_q2"],["Альбом","album_q2"]],"correct":0,"art":"assets/ch3_family_relics.jpg"},"album_q2":{"chapter":5,"scene":1,"who":"Бабушка","text":"Что обозначает -лэн в теме этой главы?","choice":[["Принадлежность","c4_clue"],["Цвет предмета","c4_clue"]],"correct":0,"art":"assets/ch3_family_relics.jpg"},"family_so":{"chapter":3,"scene":1,"who":"Бабушка","text":"Какое местоимение подходит к одному человеку на фотографии?","choice":[["со","family_mi"],["соос","family_mi"]],"correct":0,"art":"assets/ch3_photo.jpg"},"family_mi":{"chapter":3,"scene":1,"who":"Бабушка","text":"Как сказать «мы»?","choice":[["ми","family_ti"],["тӥ","family_ti"]],"correct":0,"art":"assets/ch3_photo.jpg"},"family_ti":{"chapter":3,"scene":1,"who":"Бабушка","text":"Как сказать «вы»?","choice":[["тӥ","family_soos"],["ми","family_soos"]],"correct":0,"art":"assets/ch3_photo.jpg"},"family_soos":{"chapter":3,"scene":1,"who":"Бабушка","text":"Как сказать «они»?","choice":[["соос","c3_photo_intro"],["со","c3_photo_intro"]],"correct":0,"art":"assets/ch3_photo.jpg"}};

lines[7].next='intro_mon';
lines[8].text='Очень приятно, {name}! Впереди наша деревня — «гурт». Что сделаем по дороге?';
chapter2.c2_chest_1.next='doll_start';
chapter2.c2_end.exit='family_start';
chapter3.c3_end.exit='c4_start';
chapter4.c4_start.next='c4_depart';
chapter4.c4_start.text='Бабушка кладёт в сумку фотографию «Вужгурт. 1952 год». Сегодня мы поедем искать дом с этого снимка.';
chapter4.c4_sister_joke.next='trip_end';
revised.trip_end={chapter:4,scene:6,who:'Рассказчик',text:'Дом найден! Сёстры приглашают тебя зайти и посмотреть семейный альбом.',end:true,exit:'album_intro'};
chapter4.c4_family_intro.next='album_len';
for(const [key,l] of Object.entries(chapter4)){if(['c4_album','c4_family_intro','c4_family_possessive','c4_family_task','c4_family_task2','c4_find_family','c4_find_sister','c4_clue','c4_clue_choice','c4_clue_person','c4_clue_box','c4_end'].includes(key)){l.chapter=5;l.art='assets/ch3_family_relics.jpg';}}

let gender='girl',name='Герой',at=0,trail=[],flags={},passed={},quizOpen=false;
const SAVE_KEY='udmurt_story_progress_v031';
function saveStory(){try{localStorage.setItem(SAVE_KEY,JSON.stringify({gender,name,at,trail,flags,passed}))}catch(e){}}
function loadStory(){try{const data=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');if(!data||!['girl','boy'].includes(data.gender)||!(typeof data.at==='number'||typeof data.at==='string')||!node(data.at))return false;gender=data.gender;name=String(data.name||'Герой').slice(0,24);at=data.at;trail=Array.isArray(data.trail)?data.trail.filter(x=>node(x)).slice(-500):[];flags=data.flags||{};passed=data.passed||{};document.querySelectorAll('[data-gender]').forEach(b=>b.classList.toggle('selected',b.dataset.gender===gender));$('heroName').value=name;render();return true}catch(e){return false}}
function clearStory(){try{localStorage.removeItem(SAVE_KEY)}catch(e){}}

const cards={
 tree:{word:'писпу',options:['tree','house','car'],answer:'tree'},
 village:{word:'гурт',options:['village','car','house'],answer:'village'},
 family:{word:'песятай',options:['grandma','grandpa','house'],answer:'grandpa'},
 bread:{word:'нянь',options:['bread','spoon','table'],answer:'bread'},
 spoon:{word:'пуньы',options:['table','spoon','bread'],answer:'spoon'},
 table:{word:'ӝӧк',options:['spoon','bread','table'],answer:'table'},
 flower:{word:'сяська',options:['flower','sun','wateringcan'],answer:'flower'},
 sun:{word:'шунды',options:['wateringcan','sun','flower'],answer:'sun'},
 wateringcan:{word:'лейка',options:['sun','flower','wateringcan'],answer:'wateringcan'}
};
const labels={tree:'дерево',house:'дом',car:'машина',village:'деревня',grandma:'бабушка',grandpa:'дедушка',bread:'хлеб',spoon:'ложка',table:'стол',flower:'цветок',sun:'солнце',wateringcan:'лейка'};
function node(id=at){return typeof id==='number'?lines[id]:(revised[id]||chapter2[id]||chapter3[id]||chapter4[id])}
function chapter(l){return l.chapter||1}
function bg(l){
 if(l.art)return l.art;
 if(chapter(l)===1){let s=l.scene;return s===1?`assets/scene1_${gender}.jpg`:s===4?`assets/scene4_${gender}.jpg`:s>=5?`assets/scene${s}_${gender}.webp`:`assets/scene${s}.jpg`}
 if(chapter(l)===4){return l.scene===1?`assets/kitchen_${gender}.jpg`:l.scene===2?`assets/ch4_road_${gender}.jpg`:l.scene===3?'assets/ch4_forest_road.jpg':'assets/ch4_vuzhgurt_panorama.jpg'}
 if(chapter(l)===3){
   // Never show a girl on the boy route: gendered scenes use matching assets.
   if(l.scene<=3)return `assets/chest_${gender}.jpg`;
   if(l.scene===4||l.scene===5)return 'assets/ch3_family_relics.jpg';
   return 'assets/ch3_vuzhgurt_detail.jpg';
 }
 if(l.scene===1)return `assets/wake_${gender}.jpg`;
 if(l.scene===2)return `assets/kitchen_${gender}.jpg`;
 if(l.scene===3)return `assets/garden_${gender}.jpg`;
 if(l.scene===4)return `assets/breakfast_${gender}.jpg`;
 return `assets/chest_${gender}.jpg`;
}
function showRetry(message){const box=$('retry');box.textContent='↻ '+message;box.classList.remove('hide');box.setAttribute('role','alert')}
function render(){const l=node();saveStory(); if(window.GameDictionary) GameDictionary.encounter(l);$('retry').classList.add('hide');$('retry').textContent='';$('intro').classList.add('hide');$('dialog').classList.remove('hide');$('scene').style.backgroundImage=`url("${bg(l)}")`;
 $('counter').textContent=`Глава ${chapter(l)} из 5 · ${['','Знакомство','Бумажная кукла','Семья и фотография','Дорога в Вужгурт','Семейный альбом'][chapter(l)]}`;
 $('speaker').textContent=l.who==='Ты'?name:l.who;
 $('text').textContent=l.text.replaceAll('{name}',name).replaceAll('соскучился',gender==='girl'?'соскучилась':'соскучился');
 GameAudio.story(l.text);
 $('meta').textContent=chapter(l)===1?'Сначала знакомимся со словом — затем закрепляем его в игре.':'Новые слова появляются в диалоге, а затем в заданиях.';
 $('choices').replaceChildren();const choice=!!l.choice;$('choices').classList.toggle('hide',!choice);$('actions').classList.toggle('hide',choice||(!passed[at]&&(!!l.quiz||!!l.activity||!!l.build||!!l.doll)));$('prev').disabled=trail.length===0;$('next').textContent=at==='c2_end'?'Завершить главу 2 →':at==='c3_end'?'Завершить главу 3 →':l.end?'Завершить главу →':'Далее →';
 if(choice){l.choice.forEach(([label,to],i)=>{const b=document.createElement('button');b.className='btn primary';b.textContent=label.replaceAll('{name}',name);b.addEventListener('click',()=>{
 if(chapter(l)===1){if(at===3&&i!==0){showRetry('Вспомни, как кот поздоровался с тобой. Попробуй ещё раз!');return}if(at===19&&i!==0){showRetry('Бабушка поздоровалась с тобой. Как ответить на приветствие?');return}if(at===25&&i!==0){showRetry('Чтобы назвать своё имя, начни со слов «Мынам нимы…».');return}}
 if(l.correct!==undefined&&i!==l.correct){showRetry(l.wrong?.[i]||'Это другое выражение. Попробуй ещё раз!');return}
 if(l.flagChoice)flags.firstHelp=l.flagChoice[i];forward(to);
 });$('choices').append(b)});const back=document.createElement('button');back.className='btn';back.textContent='← Назад';back.disabled=!trail.length;back.addEventListener('click',backward);$('choices').append(back)}
 if(l.doll&&!passed[at])dollGame();if(l.build&&!passed[at])buildPhrase(l);if(l.quiz&&!passed[at])quiz(l.quiz);if(l.activity&&!passed[at])activity(l.activity);
}
function nextId(l){
 if(at==='c2_after_kitchen' && flags.gardenDone)return 'c2_breakfast_1';
 if(at==='c2_after_garden' && flags.kitchenDone)return 'c2_breakfast_1';
 if(at==='c2_end')return 'c3_start';
 if(at==='c3_end')return 'c4_start';
 if(l.next!==undefined)return l.next;
 if(typeof at==='number')return at+1;
 return null;
}
function forward(to){if(to===undefined||to===null)return;if(window.GameDictionary && ((typeof at==='number' && to==='c2_start') || (at==='c2_end' && to==='c3_start'))){GameDictionary.chapterEnd(chapter(node()),()=>forwardDirect(to));return;}forwardDirect(to)}
function forwardDirect(to){trail.push(at);at=to;const l=node();if(l.flag)flags[l.flag]=true;if(to==='c2_kitchen_done')flags.kitchenDone=true;if(to==='c2_garden_done')flags.gardenDone=true;render()}
function backward(){if(!trail.length)return;$('quiz').classList.add('hide');quizOpen=false;at=trail.pop();render()}
$('next').addEventListener('click',()=>{const l=node();if(l.end){if(l.exit){GameDictionary.chapterEnd(chapter(l),()=>forwardDirect(l.exit));return;}if(chapter(l)===5){GameDictionary.chapterEnd(5,()=>{ $('intro').classList.remove('hide');$('dialog').classList.add('hide');$('resumeGame').classList.remove('hide');});return;}if(at==='c2_end'){if(window.GameDictionary)GameDictionary.chapterEnd(2,()=>forwardDirect('c3_start'));else forwardDirect('c3_start');return;}if(at==='c3_end'){if(window.GameDictionary)GameDictionary.chapterEnd(3,()=>forwardDirect('c4_start'));else forwardDirect('c4_start');return;}if(at==='c4_end' && window.GameDictionary){GameDictionary.chapterEnd(4,()=>reset());return;}reset();return}if((l.quiz||l.activity||l.build)&&!passed[at])return;forward(nextId(l))});$('prev').addEventListener('click',backward);
function reset(clear=true){GameAudio.stop();if(clear)clearStory();at=0;trail=[];flags={};passed={};quizOpen=false;$('quiz').classList.add('hide');$('intro').classList.remove('hide');$('dialog').classList.add('hide');$('scene').style.backgroundImage='url("assets/scene3.jpg")';$('counter').textContent='Глава 1'}
$('restart').addEventListener('click',()=>reset(true));
document.querySelectorAll('[data-gender]').forEach(b=>b.addEventListener('click',()=>{gender=b.dataset.gender;document.querySelectorAll('[data-gender]').forEach(x=>x.classList.toggle('selected',x===b))}));
$('testChapter4').addEventListener('click',()=>{name=$('heroName').value.trim().slice(0,24)||'Герой';at='c4_start';trail=[];flags={};passed={};render()});
$('startGame').addEventListener('click',()=>{clearStory();if(window.GameDictionary)GameDictionary.newRun();name=$('heroName').value.trim().slice(0,24)||'Герой';at=0;trail=[];flags={};passed={};render()});
function quiz(id){const q=cards[id];if(!q)return;quizOpen=true;$('quizWord').textContent=q.word;$('quizPrompt').textContent='Выбери картинку, которая подходит к слову.';$('quizFeedback').textContent='';$('quizFeedback').className='quizfeedback';$('quizContinue').classList.add('hide');$('quizCards').replaceChildren();
 for(const key of q.options){const b=document.createElement('button');b.className='quizcard';b.type='button';b.setAttribute('aria-label',`Изображение: ${labels[key]}`);const img=document.createElement('img');img.src=`assets/card_${key}.jpg`;img.alt=labels[key];b.append(img);b.addEventListener('click',()=>{if(key===q.answer){b.classList.add('correct');passed[at]=true;$('quizFeedback').textContent='Правильно! Отлично получилось!';$('quizFeedback').className='quizfeedback good';$('quizContinue').classList.remove('hide');$('quizCards').querySelectorAll('button').forEach(x=>x.disabled=true)}else{$('quizFeedback').textContent='Это не тот предмет. Вспомни подсказку персонажа и попробуй ещё раз!';$('quizFeedback').className='quizfeedback bad';b.classList.add('incorrect')}});$('quizCards').append(b)}$('quiz').classList.remove('hide');}

function buildPhrase(l){
 quizOpen=true;$('quiz').classList.remove('hide');$('quizWord').textContent='Собери: '+l.buildRu;
 $('quizPrompt').textContent='Нажимай на части выражения в правильном порядке.';
 $('quizFeedback').textContent='';$('quizFeedback').className='quizfeedback';$('quizContinue').classList.add('hide');
 const box=$('quizCards');box.replaceChildren();let chosen=[];let errors=0;
 const answer=document.createElement('div');answer.style.cssText='width:100%;text-align:center;font-size:1.3rem;font-weight:bold;padding:12px;min-height:48px';box.append(answer);
 function draw(){box.querySelectorAll('button').forEach(b=>b.remove());const remaining=l.build.map((part,i)=>({part,i})).filter(x=>!chosen.includes(x.i));
  for(const x of remaining.sort(()=>Math.random()-.5)){const b=document.createElement('button');b.className='btn primary';b.textContent=x.part;b.onclick=()=>{if(x.i!==chosen.length){errors++;$('quizFeedback').textContent='Попробуй другую часть. Начни с первого слова выражения.';$('quizFeedback').className='quizfeedback bad';return;}chosen.push(x.i);answer.textContent=chosen.map(i=>l.build[i]).join(' + ');$('quizFeedback').textContent='';if(chosen.length===l.build.length){passed[at]=true;answer.textContent=l.build.join(' ').replace(/ (е|ед|э|эд)$/,'$1').replace(/(корка|гурт) (е|ед|э|эд)/,'$1$2');$('quizFeedback').textContent=errors?'Собрано! Молодец, ты справился!':'Отлично! Всё правильно!';$('quizFeedback').className='quizfeedback good';$('quizContinue').classList.remove('hide');box.querySelectorAll('button').forEach(z=>z.remove());}else draw();};box.append(b)}
 }draw();
}

$('quizContinue').addEventListener('click',()=>{$('quiz').classList.add('hide');quizOpen=false;const l=node();if(l.quiz||l.activity||l.build||l.doll)forward(nextId(l))});
reset(false);

$('resumeGame').addEventListener('click',()=>{if(!loadStory()){$('resumeGame').classList.add('hide')}});
try{const d=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');if(d&&node(d.at))$('resumeGame').classList.remove('hide')}catch(e){}

function dollGame(){
 quizOpen=true;const overlay=$('quiz');overlay.classList.remove('hide');$('quizWord').textContent='Бумажная кукла';$('quizPrompt').textContent='Выбери платье, платок и цвет. Цвета пока на русском — перевод ждёт проверки.';$('quizContinue').classList.add('hide');const box=$('quizCards');box.replaceChildren();$('quizFeedback').textContent='';
 const paper=document.createElement('div');paper.style.cssText='width:150px;height:230px;position:relative;background:#ead7b5;border-radius:12px';paper.innerHTML='<div style="position:absolute;top:10px;left:50px;width:50px;height:50px;border-radius:50%;background:#f4bf91"></div><div id="paperDress" style="position:absolute;top:66px;left:25px;width:100px;height:120px;clip-path:polygon(30% 0,70% 0,100% 100%,0 100%);background:#aaa"></div><div id="paperScarf" style="position:absolute;top:4px;left:40px;width:70px;height:30px;background:transparent;clip-path:polygon(50% 0,100% 100%,0 100%)"></div>';box.append(paper);
 const controls=document.createElement('div');controls.style.cssText='display:grid;gap:8px';box.append(controls);let dress=false,scarf=false,color=false;
 function check(){if(dress&&scarf&&color){passed[at]=true;$('quizFeedback').textContent='Кукла одета! Дэрем и йыркышет выбраны.';$('quizContinue').classList.remove('hide');}}
 for(const [label,action] of [['Дэрем · платье',()=>{dress=true;paper.querySelector('#paperDress').style.outline='3px solid #fff';}],['Йыркышет · платок',()=>{scarf=true;paper.querySelector('#paperScarf').style.background='#f4eee0';}],['Красный',()=>paint('#a83e35')],['Синий',()=>paint('#3c679d')],['Зелёный',()=>paint('#54815a')]]){const b=document.createElement('button');b.className='btn';b.textContent=label;b.onclick=()=>{action();b.setAttribute('aria-pressed','true');check();};controls.append(b);}
 function paint(c){color=true;paper.querySelector('#paperDress').style.background=c;}
}
