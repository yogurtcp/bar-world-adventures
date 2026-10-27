import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {parseHTML} from 'linkedom';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {emptySave,makeRound,SAVE_KEY} from '../src/model.js';
const source=readFileSync('src/app.js','utf8');
const bundle=await build({stdin:{contents:source,resolveDir:new URL('../src/',import.meta.url).pathname,loader:'js'},bundle:true,format:'iife',write:false,plugins:[{name:'browser-services',setup(b){b.onResolve({filter:/\/(audio|pwa)\.js$/},args=>({path:args.path,namespace:'test-services'}));b.onLoad({filter:/.*/,namespace:'test-services'},args=>({contents:args.path.includes('audio')?`export const stop=()=>{},unlock=()=>{},effect=()=>{};export const speak=(locale,text)=>globalThis.speech.push([locale,text]);export const speakSequence=parts=>globalThis.speech.push(...parts);`:`export const setupPWA=options=>globalThis.pwa=options,safeUpdate=()=>{},installApp=()=>{},isInstalled=()=>false;`,loader:'js'}));b.onLoad({filter:/\.css$/},()=>({contents:'',loader:'js'}));}}]});
function launch(initial=emptySave()){
 const {window,document}=parseHTML('<!doctype html><html><body><div id="app"></div><div id="toast"></div><dialog id="dialog"></dialog></body></html>');
 const data=new Map([[SAVE_KEY,JSON.stringify(initial)]]),session=new Map(),store=map=>({getItem:key=>map.get(key)||null,setItem:(key,value)=>map.set(key,value)});
 const dialog=document.querySelector('#dialog');dialog.showModal=function(){this.open=true;};dialog.close=function(){this.open=false;};
 window.scrollTo=()=>{};window.HTMLElement.prototype.focus=function(){};window.Element.prototype.setPointerCapture=()=>{};
 const context={window,document,localStorage:store(data),sessionStorage:store(session),speech:[],matchMedia:()=>({matches:false}),setTimeout:()=>1,clearTimeout:()=>{},requestAnimationFrame:fn=>{fn();return 1;},console};
 vm.runInNewContext(bundle.outputFiles[0].text,context);
 const click=selector=>{const el=document.querySelector(selector);assert.ok(el,selector);el.dispatchEvent(new window.Event('click',{bubbles:true,cancelable:true}));};
 return {document,window,dialog,context,click,state:()=>JSON.parse(data.get(SAVE_KEY))};
}
test('Child can switch to nature, filter and search, hear facts, collect stamps and return to countries',()=>{
 const ui=launch({...emptySave(),visited:[376,36],stars:7});
 ui.click('[data-layer="nature"]');assert.equal(ui.state().mapLayer,'nature');assert.ok(ui.document.querySelector('[data-category="ocean"]'));ui.click('[data-action="search"]');assert.equal(ui.dialog.dataset.kind,'search');assert.equal(ui.document.querySelectorAll('[data-nature-select]').length,51);
 ui.click('[data-category="ocean"]');assert.equal(ui.document.querySelectorAll('[data-nature-select]').length,5);
 ui.click('[data-category="all"]');const input=ui.document.querySelector('#search');input.value='Himmalaya';input.dispatchEvent(new ui.window.Event('input'));assert.equal(ui.document.querySelectorAll('[data-nature-select]').length,1);
 ui.click('[data-nature-select="geo-himalayas"]');assert.equal(ui.dialog.dataset.kind,'nature');assert.match(ui.document.querySelector('#popup-title').textContent,/הימלאיה/);assert.ok(ui.document.querySelector('.nature-shape'));assert.deepEqual(ui.state().natureVisited,['geo-himalayas']);assert.deepEqual(ui.state().visited,[376,36]);assert.equal(ui.state().stars,7);assert.ok(ui.context.speech.some(([lang,text])=>lang==='he'&&text.includes('רכס הרים גבוה')));
 ui.click('[data-action="close"]');ui.click('[data-action="menu"]');ui.click('[data-action="locale"]');ui.click('[data-action="close"]');ui.click('[data-action="search"]');ui.click('[data-nature-select="geo-himalayas"]');assert.match(ui.document.querySelector('#popup-title').textContent,/Himalayas/);assert.ok(ui.context.speech.some(([lang,text])=>lang==='en'&&text.includes('high mountain range')));
 ui.click('[data-action="close"]');ui.click('[data-layer="countries"]');ui.click('[data-action="search"]');assert.equal(ui.document.querySelectorAll('[data-country-select]').length,99);assert.equal(ui.state().natureVisited.length,1);
});
test('Nature quiz supports jump buttons, hints, correct taps, eight questions and a separate passport',()=>{
 const ui=launch({...emptySave(),visited:[376,36]});ui.click('[data-action="games"]');ui.click('[data-mode="natureGame"]');
 for(let i=0;i<8;i++){const r=ui.state().round,q=r.deck[i];assert.equal(r.mode,'natureGame');assert.equal(r.index,i);assert.equal(ui.document.querySelectorAll('.pin-jumps button').length,4);ui.click(`[data-focus="${q.target}"]`);ui.click('[data-action="hint"]');assert.equal(ui.state().round.hinted,true);const pin=ui.document.querySelector(`[data-pin="${q.target}"]`);assert.ok(pin);const key=new ui.window.Event('keydown',{bubbles:true,cancelable:true});key.key='Enter';pin.dispatchEvent(key);assert.equal(ui.state().round.answered,true);assert.equal(ui.state().stars,i+1);pin.dispatchEvent(key);assert.equal(ui.state().stars,i+1);ui.click('[data-action="next"]');}
 assert.equal(ui.state().completed,1);assert.equal(ui.state().natureVisited.length,8);assert.deepEqual(ui.state().visited,[376,36]);assert.equal(ui.document.querySelectorAll('.result-stamps span').length,8);ui.click('[data-action="passport"]');ui.click('[data-layer="nature"]');assert.equal(ui.document.querySelectorAll('.passport-stamp').length,51);assert.equal(ui.document.querySelectorAll('.passport-stamp.collected').length,8);
});
test('A saved country journey resumes unchanged; a saved polar visit is reachable and reloadable',()=>{
 const old={...emptySave(),view:'question',round:makeRound('findName'),visited:[376,36],stars:10};old.round.index=3;old.round.hinted=true;const a=launch(old);assert.equal(a.state().round.index,3);assert.deepEqual(a.state().round.deck,old.round.deck);assert.ok(a.document.querySelector(`[data-pin="${old.round.deck[3].target}"]`));
 const nature={...emptySave(),mapLayer:'nature',natureCategory:'polar',selectedNature:'geo-antarctica',natureVisited:['geo-antarctica'],visited:[376,36]};const b=launch(nature);b.click('[data-action="search"]');assert.equal(b.document.querySelectorAll('[data-nature-select]').length,2);b.click('[data-nature-select="geo-antarctica"]');assert.match(b.document.querySelector('.nature-story').textContent,/יבשת/);assert.deepEqual(b.state().natureVisited,['geo-antarctica']);assert.ok(!/NaN|undefined/.test(b.document.querySelector('#globe').innerHTML));
});
test('A nature marker opens on click after pointerup, with no tap-through onto the new card',()=>{
 const ui=launch();ui.click('[data-layer="nature"]');const pin=ui.document.querySelector('[data-pin][tabindex="0"]'),svg=ui.document.querySelector('.globe');assert.ok(pin);ui.document.elementFromPoint=()=>pin;
 for(const type of ['pointerdown','pointerup']){const e=new ui.window.Event(type,{bubbles:true,cancelable:true});Object.assign(e,{clientX:300,clientY:300,pointerId:1,button:0});svg.dispatchEvent(e);assert.ok(!ui.dialog.open);}
 svg.dispatchEvent(new ui.window.Event('click',{bubbles:true,cancelable:true}));assert.equal(ui.dialog.dataset.kind,'nature');assert.equal(ui.context.speech.length,2);assert.equal(ui.state().natureVisited.length,1);
});
