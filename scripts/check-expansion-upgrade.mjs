// Requires a running local preview and the original release under artifacts/original-release/dist.
// Uses disposable browser storage and restores the expanded build when finished.
import{chromium,expect}from'@playwright/test';
import assert from'node:assert/strict';
import{cpSync,rmSync}from'node:fs';
import{execFileSync}from'node:child_process';
import{countries,byId}from'../src/countries.js';
import{audioManifest}from'../src/audio-manifest.js';
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:1024,height:768},hasTouch:true}),page=await context.newPage(),errors=[];
page.on('pageerror',error=>errors.push(error.message));
page.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text());});
page.on('framenavigated',f=>{if(f===page.mainFrame())console.log('NAVIGATED',f.url());});
const check=(truth,label)=>{assert.ok(truth,label);console.log('PASS',label);};
const stored=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('bar-world-v1')));
const version=()=>page.evaluate(()=>new Promise(resolve=>{const c=new MessageChannel();c.port1.onmessage=e=>resolve(e.data.version);navigator.serviceWorker.controller.postMessage({type:'VERSION'},[c.port2]);}));
const ids=[376,250,380,300,724,826,276,528];
const original={schema:1,view:'question',locale:'he',muted:true,volume:.42,gentle:true,visited:[376,36,250],stars:31,completed:2,selected:36,region:'all',round:{mode:'findName',index:3,answered:false,hinted:false,deck:ids.map(target=>({target,options:[target,...ids.filter(id=>id!==target).slice(0,3)]}))}};
try{
 rmSync('dist',{recursive:true,force:true});cpSync('artifacts/original-release/dist','dist',{recursive:true});
 await page.goto('http://127.0.0.1:4186');await page.waitForFunction(()=>!!navigator.serviceWorker.controller);await page.locator('.topbar').waitFor();
 await page.addInitScript(save=>{if(!sessionStorage.getItem('expansion-seed')){localStorage.setItem('bar-world-v1',JSON.stringify(save));sessionStorage.setItem('expansion-seed','done');}},original);
 await page.evaluate(async()=>{localStorage.setItem('other-bar-game','keep-me');const cache=await caches.open('other-bar-game');await cache.put('/unrelated-game',new Response('keep-me'));});
 await page.reload();await page.locator('.question-page').waitFor();check(JSON.stringify((await stored()).round)===JSON.stringify(original.round),'Original 36-country release resumes an existing journey');
 const oldVersion=await version();execFileSync('npm',['run','build'],{stdio:'pipe'});
 await page.reload();await page.locator('[data-action=replay]').click();
 await expect.poll(()=>page.evaluate(async()=>!!(await navigator.serviceWorker.getRegistration()).waiting),{timeout:90000}).toBeTruthy();
 check(await version()===oldVersion,'99-country expansion waits while the old question is active');
 check(JSON.stringify((await stored()).round)===JSON.stringify(original.round),'Expansion download does not rewrite old question choices');
 const target=original.round.deck[3].target;
 await Promise.all([page.waitForNavigation({waitUntil:'load',timeout:45000}),(async()=>{await page.locator(`[data-focus="${target}"]`).click();await page.locator(`[data-pin="${target}"]`).click();await page.locator('[data-action=next]').click({noWaitAfter:true});await page.locator('[data-action=explore]').first().click({noWaitAfter:true});})()]);
 await expect.poll(version,{timeout:90000}).not.toBe(oldVersion);
 await page.locator('.country-panel').waitFor();const upgraded=await stored();
 check(upgraded.stars===32&&upgraded.round.index===4,'Upgrade applies at a safe navigation and preserves the next original question');
 check(upgraded.visited.includes(36)&&upgraded.visited.includes(376)&&upgraded.visited.includes(250),'Original passport stamps survive');
 check(upgraded.locale==='he'&&upgraded.muted&&upgraded.volume===.42&&upgraded.gentle,'Language, mute, volume and gentle motion survive');
 check(await page.evaluate(async()=>localStorage.getItem('other-bar-game')==='keep-me'&&!!await(await caches.open('other-bar-game')).match('/unrelated-game')),'Other games’ saves and caches remain intact');
 check((await page.locator('.counters small').innerText()).includes('/ 99'),'Passport total expands to 99 without resetting stamps');
 // Review every newly supported country, its local names, its final art and card size.
 for(const c of countries.slice(36)){
  await page.locator('[data-action=search]').click({noWaitAfter:true});await page.locator('#search').fill(c.en);await page.locator(`dialog [data-country-select="${c.id}"]`).click({noWaitAfter:true});
  await page.waitForFunction(()=>{const i=document.querySelector('.country-scene');return i?.complete&&i.naturalWidth>0;});
  check((await page.locator('.country-heading h2').innerText()).includes(c.he),`${c.iso}: Hebrew country scene opens`);
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight),`${c.iso}: country fits a landscape tablet`);
 }
 await page.locator('[data-action=search]').click({noWaitAfter:true});await page.locator('#search').fill('Nigeria');await page.locator('dialog [data-country-select="566"]').click();await page.screenshot({path:'artifacts/expanded-africa-tablet.png',fullPage:true});
 await page.locator('[data-action=search]').click({noWaitAfter:true});await page.locator('#search').fill('Ukraine');await page.locator('dialog [data-country-select="804"]').click();await page.screenshot({path:'artifacts/expanded-europe-tablet.png',fullPage:true});
 await page.locator('[data-action=locale]').first().click();await page.locator('[data-action=search]').click({noWaitAfter:true});await page.locator('#search').fill('Democratic');await page.locator('dialog [data-country-select="180"]').click();check(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight),'Long English country names fit the tablet');
 await context.setOffline(true);await page.reload();await page.locator('.country-panel').waitFor();
 for(const id of [466,804,706,140]){const c=byId[id];await page.locator('[data-action=search]').click({noWaitAfter:true});await page.locator('#search').fill(c.en);await page.locator(`dialog [data-country-select="${id}"]`).click();check(await page.locator('.country-scene').evaluate(i=>i.complete&&i.naturalWidth>0),`${c.iso}: expanded artwork works offline`);}
 const greeting=await page.evaluate(async path=>{const audio=new OfflineAudioContext(1,1,24000);const r=await fetch(path);return(await audio.decodeAudioData(await r.arrayBuffer())).duration>0;},audioManifest.so.Salaan);check(greeting,'New Somali greeting is recorded and works offline');
 check(errors.length===0,'No runtime exceptions in the old-to-expanded upgrade');console.log('EXPANSION UPGRADE CHECKS PASSED');
}catch(error){console.log('UPGRADE DIAGNOSTIC',JSON.stringify(await page.evaluate(async()=>({saved:JSON.parse(localStorage.getItem('bar-world-v1')),heading:document.querySelector('h1')?.textContent,dialogOpen:document.querySelector('dialog')?.open,counter:document.querySelector('.counters small')?.textContent,controller:navigator.serviceWorker.controller?.state,registrations:(await navigator.serviceWorker.getRegistrations()).map(r=>({active:r.active?.state,waiting:r.waiting?.state,installing:r.installing?.state,scope:r.scope})),cacheKeys:await caches.keys()}))));throw error;}finally{await browser.close();execFileSync('npm',['run','build'],{stdio:'pipe'});}
