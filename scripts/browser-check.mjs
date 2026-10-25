import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {writeFileSync,rmSync,readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {audioManifest} from '../src/audio-manifest.js';
import {modeKeys} from '../src/i18n.js';
const expectedFiles=JSON.parse(readFileSync('dist/version.json','utf8')).files;
const clipCount=Object.values(audioManifest).flatMap(Object.values).length;
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
const context=await browser.newContext({viewport:{width:1024,height:768},hasTouch:true});
const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
const save=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('bar-world-v1')));
const version=()=>page.evaluate(()=>new Promise(resolve=>{const channel=new MessageChannel();channel.port1.onmessage=e=>resolve(e.data.version);navigator.serviceWorker.controller.postMessage({type:'VERSION'},[channel.port2]);}));
const check=(condition,label)=>{assert.ok(condition,label);console.log('PASS',label);};
const wait=async()=>{await page.waitForFunction(()=>!!navigator.serviceWorker.controller);await page.locator('.topbar').waitFor();};
async function choose(id){const map=await page.locator(`[data-pin="${id}"]`).count();if(map){await page.locator(`[data-focus="${id}"]`).click();await page.locator(`[data-pin="${id}"]`).click();}else await page.locator(`[data-answer="${id}"]`).click();}
try{
 await page.goto('http://127.0.0.1:4186');await wait();
 await expect.poll(()=>page.evaluate(async expected=>{const keys=await caches.keys();const c=await caches.open(keys.find(k=>k.startsWith('bar-world-')));return(await c.keys()).length>=expected;},expectedFiles),{timeout:90000}).toBeTruthy();
 check(await page.locator('html').getAttribute('lang')==='he','Hebrew is the default');check((await save()).visited.includes(376),'Israel is the first passport stamp');
 check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight),'Explorer fits landscape tablet without scrolling');
 const before=await page.locator('.land').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('d')).join(''));
 const g=await page.locator('.globe').boundingBox();await page.mouse.move(g.x+g.width*.45,g.y+g.height*.4);await page.mouse.down();await page.mouse.move(g.x+g.width*.7,g.y+g.height*.53,{steps:10});await page.mouse.up();
 check(before!==await page.locator('.land').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('d')).join('')),'Globe really rotates with pointer dragging');
 await page.locator('[data-action=search]').click();await page.locator('#search').fill('יפן');await page.locator('dialog [data-country-select="392"]').click();
 check(await page.locator('.country-heading h2').innerText().then(t=>t.includes('יפן')),'Country selection opens Japan scene');
 await page.locator('[data-action=hello]').click();await page.waitForTimeout(4200);
 const audioResults=await page.evaluate(async paths=>{const audio=new OfflineAudioContext(1,1,24000);const failed=[];for(let i=0;i<paths.length;i+=20)await Promise.all(paths.slice(i,i+20).map(async path=>{try{const response=await fetch(path);const decoded=await audio.decodeAudioData(await response.arrayBuffer());if(decoded.duration<.15)failed.push(path);}catch{failed.push(path);}}));return failed;},[...new Set(Object.values(audioManifest).flatMap(Object.values))]);
 check(audioResults.length===0,`All ${clipCount} Hebrew, English and greeting recordings decode (${audioResults.length} failures)`);
 await page.locator('[data-action=locale]').first().click();check(await page.locator('html').getAttribute('dir')==='ltr','English switches the full interface to LTR');
 await page.locator('[data-action=mute]').first().click();check((await save()).muted,'Mute preference saves');
 for(const mode of modeKeys){
  await page.locator('[data-action=games]').first().click();await page.locator(`[data-mode="${mode}"]`).click();
  let s=await save(),q=s.round.deck[0];const original=JSON.stringify(s.round);
  await page.reload();await page.locator('.question-page').waitFor();check(JSON.stringify((await save()).round)===original,`${mode}: exact question resumes after reload`);
  const stars=s.stars;await choose(q.options.find(id=>id!==q.target));check((await save()).stars===stars,`${mode}: mistake leaves stars and question intact`);
  await page.waitForTimeout(950);
  for(let i=0;i<8;i++){s=await save();q=s.round.deck[i];await choose(q.target);check((await save()).round.answered,`${mode}: answer ${i+1} accepted`);const earned=(await save()).stars;
   // A repeated click on the same answer is idempotent.
   if(await page.locator(`[data-answer="${q.target}"]`).count())await page.locator(`[data-answer="${q.target}"]`).dispatchEvent('click');
   check((await save()).stars===earned,`${mode}: no duplicate reward ${i+1}`);
   await page.locator('[data-action=next]').click();
  }
  check((await save()).stars===stars+8&&await page.locator('.result-page').count()===1,`${mode}: completes an eight-country journey`);
 }
 await page.locator('[data-action=explore]').first().click();await page.locator('[data-action=install]').click();check(await page.locator('dialog').evaluate(el=>el.open),'Install action offers browser/platform instructions');await page.locator('dialog [data-action=close]').click();
 const manifest=await page.evaluate(async()=>await(await fetch('manifest.webmanifest')).json());check(manifest.display==='standalone'&&manifest.icons.length===3,'Standalone installation manifest and icons are present');
 await page.locator('[data-action=games]').first().click();await page.locator('[data-mode=shapeName]').click();const roundBeforeUpdate=(await save()).round;
 const oldVersion=await version();writeFileSync('public/release-probe.txt','Upgrade QA only');execFileSync('npm',['run','build'],{stdio:'pipe'});
 await page.reload();await page.locator('[data-action=replay]').click();
 await expect.poll(()=>page.evaluate(async()=>!!(await navigator.serviceWorker.getRegistration()).waiting),{timeout:90000}).toBeTruthy();
 check(await version()===oldVersion,'New release waits while a question is active');
 check(JSON.stringify((await save()).round)===JSON.stringify(roundBeforeUpdate),'Update download preserves exact active question');
 let s=await save();await Promise.all([page.waitForNavigation({waitUntil:'load'}),(async()=>{await choose(s.round.deck[0].target);await page.locator('[data-action=next]').click({noWaitAfter:true});})()]);
 await expect.poll(version,{timeout:90000}).not.toBe(oldVersion);
 await page.locator('.question-page').waitFor();s=await save();check(s.round.index===1&&s.round.mode==='shapeName','Automatic upgrade resumes at the next question');check(s.locale==='en'&&s.muted&&s.view==='question','Upgrade preserves language, sound and current screen');
 const savedStars=s.stars,question=JSON.stringify(s.round);
 await context.setOffline(true);await page.reload();await page.locator('.question-page').waitFor();check((await save()).stars===savedStars&&JSON.stringify((await save()).round)===question,'Offline launch preserves progress and active work');
 await page.locator('[data-action=explore]').first().click();await page.locator('[data-action=search]').click();await page.locator('#search').fill('Peru');await page.locator('dialog [data-country-select="604"]').click();check(await page.locator('.country-scene').evaluate(el=>el.complete&&el.naturalWidth>0),'Previously unseen country art works offline');
 const response=await page.evaluate(async path=>{const r=await fetch(path);return r.ok&&(await r.arrayBuffer()).byteLength>1000;},audioManifest.es.Hola);check(response,'Native greeting recordings work offline');
 await page.screenshot({path:'artifacts/offline-tablet.png',fullPage:true});
 await context.setOffline(false);check(errors.length===0,'No runtime exceptions: '+errors.join('; '));
 console.log('ALL BROWSER CHECKS PASSED');
}finally{rmSync('public/release-probe.txt',{force:true});execFileSync('npm',['run','build'],{stdio:'pipe'});await browser.close();}
