import {chromium,expect} from '@playwright/test';
import {execFileSync} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import http from 'node:http';
import assert from 'node:assert/strict';
import {emptySave} from '../src/model.js';

// Use the actual published split-screen release, with its pre-hash service worker.
const legacyRevision='7f9300f';
const oldFile=path=>execFileSync('git',['show',`${legacyRevision}:${path}`],{maxBuffer:4*1024*1024});
const html=oldFile('index.html');
const bundles=[...html.toString().matchAll(/\.\/(app-[a-f0-9]+\.(?:js|css))/g)].map(m=>m[1]);
const legacy=new Map(['index.html','sw.js',...bundles].map(path=>[path,oldFile(path)]));
const types={html:'text/html',js:'text/javascript',css:'text/css',json:'application/json',webmanifest:'application/manifest+json',webp:'image/webp',png:'image/png',mp3:'audio/mpeg'};
let published=false;const fetched=[];
const server=http.createServer(async(req,res)=>{
 const path=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';
 if(published)fetched.push(path);
 try{
  const body=(!published||bundles.includes(path))&&legacy.has(path)?legacy.get(path):await readFile(new URL(`../dist/${path}`,import.meta.url));
  res.writeHead(200,{'Content-Type':types[path.split('.').pop()]||'application/octet-stream','Cache-Control':'no-cache'});res.end(body);
 }catch{res.writeHead(404);res.end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:1024,height:768}}),page=await context.newPage();
await page.addInitScript(save=>{if(!localStorage.getItem('bar-world-v1'))localStorage.setItem('bar-world-v1',JSON.stringify(save));},{...emptySave(),stars:27,visited:[376,804],locale:'en',muted:true});
const errors=[];page.on('pageerror',error=>errors.push(error.message));
const version=async()=>page.evaluate(()=>new Promise(resolve=>{const channel=new MessageChannel();channel.port1.onmessage=e=>resolve(e.data.version);navigator.serviceWorker.controller.postMessage({type:'VERSION'},[channel.port2]);}));
try{
 await page.goto(`http://127.0.0.1:${server.address().port}/`);
 await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
 await page.locator('.explore-layout > .country-panel').waitFor();
 const previous=await version();
 await page.evaluate(async()=>{
  // A bad old response must be fetched again, rather than copied into the new release.
  const cache=await caches.open((await caches.keys()).find(key=>key.startsWith('bar-world-')));await cache.put(new URL('assets/bar-traveler.webp',location.href),new Response('corrupt',{headers:{'Content-Type':'image/webp'}}));
 });
 published=true;const started=Date.now();await page.reload();
 await page.locator('.globe-home').waitFor({timeout:60000});
 await expect.poll(version,{timeout:60000}).not.toBe(previous);
 const elapsed=Date.now()-started;
 assert.equal(await page.locator('.country-panel,dialog[open]').count(),0);
 const save=await page.evaluate(()=>JSON.parse(localStorage.getItem('bar-world-v1')));
 assert.equal(save.stars,27);assert.deepEqual(save.visited,[376,804]);assert.equal(save.locale,'en');assert.equal(save.muted,true);
 const downloads=fetched.filter(path=>/\.(?:webp|png|mp3)$/.test(path));assert.deepEqual(downloads,['assets/bar-traveler.webp']);
 await page.screenshot({path:'artifacts/upgraded-globe-only.png'});
 await context.setOffline(true);await page.reload();await page.locator('.globe-home').waitFor();
 await page.locator('[data-pin="376"]').click({noWaitAfter:true});await page.locator('dialog.country-dialog').waitFor();
 const box=await page.locator('dialog').boundingBox();assert.deepEqual(box,{x:0,y:0,width:1024,height:768});
 const close=page.locator('dialog .popup-close');const size=await close.boundingBox();assert.ok(size.width>=64&&size.height>=64);
 await close.click();assert.equal(await page.locator('.country-panel').count(),0);
 assert.deepEqual(errors,[]);
 console.log(JSON.stringify({legacySplitView:'reproduced',upgradedGlobeOnly:true,upgradeMs:elapsed,mediaDownloads:downloads,savedProgress:'preserved',offlineCountryView:'passed',largeClose:'passed',runtimeErrors:errors}));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
