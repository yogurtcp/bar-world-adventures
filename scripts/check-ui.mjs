import{chromium,expect}from'@playwright/test';
import assert from'node:assert/strict';
const base=process.env.BASE_URL||'http://127.0.0.1:4186';
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
const context=await browser.newContext({viewport:{width:1024,height:768},hasTouch:true});
const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));let checks=0;
await page.addInitScript(()=>{const OriginalAudio=window.Audio;window.Audio=function(src){const audio=new OriginalAudio(src);window.__latestAudio=audio;return audio;};});
const check=(truth,label)=>{assert.ok(truth,label);checks++;console.log('PASS',label);};
const close=async()=>{if(await page.locator('dialog[open]').count())await page.locator('dialog [data-action=close]').click({noWaitAfter:true});};
const menu=async(action)=>{if(await page.locator('dialog[open][data-kind=menu]').count()===0){await close();await page.locator('[data-action=menu]').click({noWaitAfter:true});}if(action)await page.locator(`dialog [data-action=${action}]`).click({noWaitAfter:true});};
const fits=()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight);
try{
 await page.goto(base);await page.locator('.globe-home').waitFor();await page.waitForFunction(()=>!!navigator.serviceWorker.controller);await page.waitForLoadState('load');await expect(page.locator('.world-dock button')).toHaveCount(3);
 check(await page.locator('dialog[open]').count()===0,'Home opens directly on the world');
 check(await page.locator('.country-panel,.country-picker,.world-heading,.toolbar').count()===0,'No permanent country card, stats strip or toolbar');
 check(await page.locator('.world-dock button').count()===3,'Only three large main actions');
 for(const[width,height,label]of[[1366,900,'desktop'],[1024,768,'tablet-landscape'],[768,1024,'tablet-portrait'],[390,844,'phone'],[896,414,'phone-landscape']]){
  await page.setViewportSize({width,height});check(await fits(),`${label}: home fits without scrolling`);
  const size=await page.locator('.world-stage .globe>path').first().boundingBox();check(Math.min(size.width,size.height)>=Math.min(width,height)*.88,`${label}: globe fills the available screen`);
  await page.screenshot({path:`artifacts/globe-home-${label}.png`,fullPage:true});
 }
 await page.setViewportSize({width:1024,height:768});await page.locator('[data-action=zoomIn]').tap();
 const before=await page.locator('.land').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('d')).join(''));
 const svg=await page.locator('.globe').boundingBox();await page.mouse.move(svg.x+svg.width*.45,svg.y+svg.height*.4);await page.mouse.down();await page.mouse.move(svg.x+svg.width*.55,svg.y+svg.height*.46,{steps:8});await page.mouse.up();
 const rotated=await page.locator('.land').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('d')).join(''));check(before!==rotated,'Large globe rotates with dragging');
 await page.locator('[data-pin="376"]').tap();await page.locator('dialog.country-dialog').waitFor();check((await page.locator('.country-heading h2').innerText()).includes('ישראל'),'Country tap opens its details in a modal');
 await page.locator('[data-action=hello]').click({noWaitAfter:true});await page.waitForTimeout(700);await page.keyboard.press('Escape');await expect(page.locator('dialog')).not.toBeVisible();
 check(await page.locator('.land').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('d')).join(''))===rotated,'Closing a country preserves rotation and zoom');
 await page.reload();await page.locator('.globe-home').waitFor();check(await page.locator('.land').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('d')).join(''))===rotated,'Reload preserves the current globe camera');
 await page.locator('[data-action=games]').click({noWaitAfter:true});await page.locator('dialog [data-mode=shapeName]').click({noWaitAfter:true});await expect.poll(()=>page.evaluate(()=>!!window.__latestAudio&&!window.__latestAudio.paused&&window.__latestAudio.currentTime>.1),{timeout:3000}).toBeTruthy();check(true,'Starting a game from its popup keeps the spoken prompt playing');await page.locator('[data-action=explore]').first().click({noWaitAfter:true});
 await menu();check(await page.locator('dialog .menu-grid').count()===1,'Other navigation lives in a menu popup');await page.screenshot({path:'artifacts/globe-menu.png',fullPage:true});
 await page.locator('dialog [data-action=locale]').click({noWaitAfter:true});check(await page.locator('html').getAttribute('lang')==='en','Language switches from the menu');await page.locator('dialog [data-action=mute]').click({noWaitAfter:true});
 await page.locator('dialog [data-action=settings]').click({noWaitAfter:true});await page.locator('#volume').evaluate(el=>{el.value='42';el.dispatchEvent(new Event('input',{bubbles:true}));});await page.locator('#gentle').check();await close();
 await page.locator('[data-action=search]').tap();check(await page.locator('dialog .search-results button').count()===99,'Country picker contains all 99 countries');
 await page.locator('dialog [data-region=africa]').click({noWaitAfter:true});check(await page.locator('dialog .search-results button').count()===32,'Country picker filters to 32 African destinations');
 await page.locator('dialog [data-region=all]').click({noWaitAfter:true});await page.locator('#search').fill('Nigeria');await page.locator('dialog [data-country-select="566"]').click({noWaitAfter:true});await page.locator('dialog.country-dialog').waitFor();check((await page.locator('.country-heading h2').innerText()).includes('Nigeria'),'Search opens the chosen country popup');
 for(const[width,height,label]of[[1024,768,'tablet-landscape'],[768,1024,'tablet-portrait'],[390,844,'phone'],[896,414,'phone-landscape']]){await page.setViewportSize({width,height});const box=await page.locator('dialog').boundingBox();check(box.x>=0&&box.y>=0&&box.x+box.width<=width+1&&box.y+box.height<=height+1,`${label}: country popup fits`);check(await page.locator('dialog [data-action=close]').isVisible(),`${label}: close button remains visible`);await page.screenshot({path:`artifacts/country-popup-${label}.png`,fullPage:true});}
 await close();await page.setViewportSize({width:1024,height:768});await page.locator('[data-action=games]').tap();check(await page.locator('dialog.games-dialog .game-card').count()===5,'All five games are in a popup over the world');await page.screenshot({path:'artifacts/globe-games.png',fullPage:true});
 await page.keyboard.press('Escape');check(await page.locator('dialog[open]').count()===0&&await page.locator('.globe-home').count()===1,'Escape returns from games to the world');
 await menu('passport');check(await page.locator('dialog.passport-dialog .passport-stamp').count()===99,'Passport opens over the world with all 99 stamps');await close();
 await menu('install');check(await page.locator('dialog[open]').count()===1,'Installation remains discoverable from the menu');await close();
 await context.setOffline(true);await page.reload();await page.locator('.globe-home').waitFor();await page.locator('[data-action=search]').click({noWaitAfter:true});await page.locator('#search').fill('Ukraine');await page.locator('dialog [data-country-select="804"]').click({noWaitAfter:true});await page.waitForFunction(()=>{const i=document.querySelector('.country-scene');return i?.complete&&i.naturalWidth>0;});
 check((await page.locator('.country-heading h2').innerText()).includes('Ukraine'),'Offline country selection and popup artwork work');const save=await page.evaluate(()=>JSON.parse(localStorage.getItem('bar-world-v1')));check(save.locale==='en'&&save.muted&&save.volume===.42&&save.gentle,'Settings and progress survive the UI change and offline reload');check(errors.length===0,'No runtime exceptions');console.log(`GLOBE UI CHECKS PASSED: ${checks}`);
}finally{await browser.close();}
