const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=process.env.USTON_TEST_URL||'http://127.0.0.1:8787/';
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||(process.platform==='darwin'?'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome':'/usr/bin/chromium'),args:['--no-sandbox']});const results=[];
async function test(name,fn){const ctx=await browser.newContext(),p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));try{await fn(p,ctx);assert.deepEqual(errors,[]);results.push({name,pass:true});}catch(e){results.push({name,pass:false,error:e.stack});}finally{await ctx.close();}console.log(name,results.at(-1).pass);}
for(const hash of ['', '#conjugation-lock','#cheskyt','#guide','#map'])await test('First visit '+(hash||'root')+' opens welcome, tour and catalogue without a game',async p=>{
 await p.goto(base+hash);await p.locator('#welcome-start').waitFor();
 assert.equal(await p.evaluate(()=>activeGame),null);assert.equal(await p.locator('#game-frame').getAttribute('src'),null);
 await p.locator('#welcome-start').click();await p.locator('#learning-help[open]').waitFor();
 assert.equal(await p.evaluate(()=>activeGame),null);assert.equal(new URL(p.url()).hash,'#games');
 for(let i=0;i<3;i++)await p.locator('#learning-tour-next').click();
 assert.equal(await p.locator('.learning-tour-dismiss').innerText(),'Вернуться к играм');await p.locator('.learning-tour-dismiss').click();
 assert(await p.locator('#hub').isVisible());assert.equal(await p.evaluate(()=>activeGame),null);
 assert.equal(await p.evaluate(()=>localStorage.getItem(VISITS_KEY)),null);
});
for(const id of ['conjugation-lock','cheskyt','kin-ta'])await test('Saved '+id+' is resumed only by explicit button',async p=>{
 await p.addInitScript(id=>{sessionStorage.setItem('uston-welcome-v2','1');localStorage.setItem('uston-learning-journey-v1',JSON.stringify({tourSeen:true}));if(!localStorage.getItem('udm-hub-last-v1'))localStorage.setItem('udm-hub-last-v1',JSON.stringify({id}));},id);
 await p.goto(base+'#'+id);assert.equal(await p.evaluate(()=>activeGame),null);assert(await p.locator('#hub').isVisible());
 assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem(LAST_KEY)).id),id);
 await p.locator('#header-resume').click();await p.waitForFunction(id=>activeGame===id,id);
 assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem(LAST_KEY)).id),id);
 await p.locator('#return-hub').click();assert.equal(await p.evaluate(()=>activeGame),null);
 await p.reload();assert.equal(await p.evaluate(()=>activeGame),null);
 await p.locator('#welcome-reopen').click();await p.locator('#welcome-start').click();assert.equal(await p.evaluate(()=>activeGame),null);
 await p.locator('#resume-action').click();await p.waitForFunction(id=>activeGame===id,id);
});
await test('Shop card has image and shared start label; launch works on phone',async p=>{
 await p.setViewportSize({width:390,height:844});await p.goto(base);await p.locator('#welcome-start').click();await p.locator('#learning-help[open]').waitFor();await p.locator('.learning-tour-dismiss').click();
 const card=p.locator('[data-open="cheskyt"]');assert.equal(await card.locator('h2').innerText(),'Магазин «Ческыт»');assert.equal(await card.locator('.launch [lang="udm"]').innerText(),'Кутскыны');assert.equal(await card.locator('.launch [lang="ru"]').innerText(),'Начать');
 await card.scrollIntoViewIfNeeded();await p.waitForFunction(()=>document.querySelector('[data-open="cheskyt"] img').naturalWidth>0);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await card.click();
 const frame=p.frameLocator('#game-frame');await frame.locator('#shelf button').first().waitFor();assert.equal(await frame.locator('h1').innerText(),'Магазин «Ческыт»');assert.equal(await p.locator('#player-title').innerText(),'Магазин «Ческыт»');
});
await test('Information-page links keep their destination',async p=>{for(const page of ['authors','methods','profile']){await p.goto(base+'?info='+page+'#'+page);assert(await p.locator('#page-'+page).isVisible());assert.equal(await p.evaluate(()=>activeGame),null);}});
fs.writeFileSync(path.join(__dirname,'landing-shop-results.json'),JSON.stringify(results,null,2));await browser.close();if(results.some(x=>!x.pass))process.exitCode=1;})();
