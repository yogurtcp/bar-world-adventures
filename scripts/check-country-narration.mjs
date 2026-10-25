import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {countries} from '../src/countries.js';
import {audioManifest} from '../src/audio-manifest.js';
const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
const context=await browser.newContext({viewport:{width:1024,height:768},hasTouch:true,serviceWorkers:'block'}),page=await context.newPage();
await page.addInitScript(()=>{const OriginalAudio=window.Audio;window.spoken=[];window.Audio=function(src){const audio=new OriginalAudio(src);window.spoken.push(src);return audio;};});
const errors=[];page.on('pageerror',e=>errors.push(e.message));let checks=0;
try{
 await page.goto(process.env.BASE_URL||'http://127.0.0.1:4186');await page.locator('.globe-home').waitFor();
 for(const locale of ['he','en']){
  if(locale==='en'){await page.locator('[data-action=menu]').click();await page.locator('dialog [data-action=locale]').click();await page.locator('dialog [data-action=close]').click();}
  for(const input of ['tap','click']){
   const used=new Set();
   for(let i=0;i<6;i++){
    const ids=await page.locator('.globe-pin[tabindex="0"]').evaluateAll(nodes=>nodes.filter(n=>{const r=n.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('[data-pin]')===n;}).map(n=>+n.dataset.pin));
    const id=ids.find(id=>!used.has(id));assert.ok(id);used.add(id);
    await page.evaluate(()=>window.spoken.length=0);
    await page.locator(`[data-pin="${id}"]`)[input]();
    await page.locator('dialog.country-dialog').waitFor();await page.waitForTimeout(250);
    const country=countries.find(c=>c.id===id);
    assert.deepEqual(await page.evaluate(()=>window.spoken),[audioManifest[locale][country[locale]]],`${locale}/${input}: ${country.en} speaks only its name`);
    checks++;await page.locator('dialog .popup-close').click();
   }
  }
 }
 await page.locator('[data-pin="376"]').click();await page.evaluate(()=>window.spoken.length=0);await page.locator('dialog [data-action=barWave]').click();await page.waitForTimeout(100);
 assert.deepEqual(await page.evaluate(()=>window.spoken),[audioManifest.en.Israel]);checks++;
 await page.evaluate(()=>window.spoken.length=0);await page.locator('dialog [data-action=hello]').click();
 await expect.poll(()=>page.evaluate(()=>window.spoken.length),{timeout:6000}).toBe(2);
 assert.deepEqual(await page.evaluate(()=>window.spoken),[audioManifest.en['How do we say hello?'],audioManifest.he['שלום']]);checks++;
 assert.deepEqual(errors,[]);console.log(JSON.stringify({countryNarrationChecks:checks,languages:['he','en'],inputs:['touch','mouse'],countryTap:'name only',barTap:'country name',greetingButton:'greeting only when requested',runtimeErrors:errors}));
}finally{await browser.close();}
