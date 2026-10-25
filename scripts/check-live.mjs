import{chromium}from'@playwright/test';import{readFileSync}from'node:fs';import assert from'node:assert/strict';
const expectedRelease=JSON.parse(readFileSync('dist/version.json','utf8'));
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:1024,height:768}}),page=await context.newPage();const errors=[],bad=[];
context.on('requestfailed',r=>console.log('REQUEST FAILED',r.url(),r.failure()?.errorText));context.on('response',r=>{if(r.status()>=400)console.log('HTTP ERROR',r.status(),r.url());});
page.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text());});
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)bad.push([r.status(),r.url()]);});
try{
 await page.goto('https://yogurtcp.github.io/bar-world-adventures/',{waitUntil:'domcontentloaded'});await page.locator('.country-scene').waitFor();
 await page.waitForFunction(()=>!!navigator.serviceWorker.controller,{},{timeout:360000});await page.locator('.country-scene').waitFor();
 assert.equal(await page.locator('html').getAttribute('lang'),'he');assert.ok(await page.locator('.country-scene').evaluate(n=>n.complete&&n.naturalWidth>0));
 assert.equal(await page.locator('.country-chip').count(),99);
 await page.locator('[data-action=search]').click({noWaitAfter:true});await page.locator('#search').fill('ניגריה');await page.locator('dialog [data-country-select="566"]').click({noWaitAfter:true});await page.waitForFunction(()=>{const i=document.querySelector('.country-scene');return i?.complete&&i.naturalWidth>0;});
 await page.screenshot({path:'artifacts/live-expanded-africa.png',fullPage:true});
 const manifest=await page.evaluate(async()=>await(await fetch('manifest.webmanifest')).json());assert.equal(manifest.display,'standalone');
 const release=await page.evaluate(async()=>await(await fetch('version.json',{cache:'no-store'})).json());assert.equal(release.version,expectedRelease.version);
 const count=await page.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();const cache=await caches.open((await caches.keys()).find(k=>k.startsWith('bar-world-')));return {scope:r.scope,files:(await cache.keys()).length};});assert.equal(count.files,release.files);assert.equal(count.scope,'https://yogurtcp.github.io/bar-world-adventures/');
 await page.locator('[data-action=locale]').first().click();await page.locator('[data-action=games]').first().click();assert.equal(await page.locator('.game-card').count(),5);await page.screenshot({path:'artifacts/live-games-tablet.png',fullPage:true});
 await page.locator('[data-action=explore]').first().click();await page.locator('[data-action=search]').click({noWaitAfter:true});await page.locator('#search').fill('Ukraine');await page.locator('dialog [data-country-select="804"]').click({noWaitAfter:true});await page.waitForFunction(()=>{const i=document.querySelector('.country-scene');return i?.complete&&i.naturalWidth>0;});await page.screenshot({path:'artifacts/live-explore-tablet.png',fullPage:true});
 await context.setOffline(true);await page.reload();await page.locator('.country-scene').waitFor();assert.equal(await page.locator('html').getAttribute('lang'),'en');assert.ok(await page.locator('.country-scene').evaluate(n=>n.complete&&n.naturalWidth>0));
 assert.equal(errors.length,0);assert.equal(bad.length,0);console.log(JSON.stringify({url:page.url(),offlineFiles:count.files,scope:count.scope,runtimeErrors:errors,httpErrors:bad,offlineReload:'passed',games:5,countries:99,version:release.version}));
}catch(error){console.log('DIAGNOSTIC',JSON.stringify(await page.evaluate(async()=>({online:navigator.onLine,secure:isSecureContext,toast:document.querySelector('#toast')?.textContent,registrations:await Promise.all((await navigator.serviceWorker.getRegistrations()).map(async r=>({scope:r.scope,active:r.active?.state,waiting:r.waiting?.state,installing:r.installing?.state}))),caches:await Promise.all((await caches.keys()).map(async key=>({key,files:(await(await caches.open(key)).keys()).length})))}))));throw error;}finally{await browser.close();}
