import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {webcrypto,createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
const template=readFileSync('sw.js','utf8');
const scope='https://example.test/bar-world-adventures/';
const hash=data=>createHash('sha256').update(data).digest('hex');
function worker({fail=false}={}){
 const files={'index.html':'new shell','app-new.js':'nature game','audio/he/new.mp3':'new free Hebrew voice','audio/en/existing.mp3':'existing voice'};
 const stores=new Map(),requested=[],handlers={};
 const prefix='bar-world-_bar_world_adventures_-';
 const oldName=prefix+'old',newName=prefix+'new';
 function cache(name){if(!stores.has(name))stores.set(name,new Map());const entries=stores.get(name);return {match:async key=>entries.get(String(key))?.clone(),put:async(key,response)=>entries.set(String(key),response.clone()),addAll:async requests=>{const replies=[];for(const request of requests){const path=new URL(request.url).pathname.replace('/bar-world-adventures/','');requested.push(path);if(fail&&path==='audio/he/new.mp3')throw Error('interrupted');replies.push([request.url,new Response(files[path])]);}for(const [key,value]of replies)entries.set(key,value);}};}
 stores.set(oldName,new Map([[scope+'index.html',new Response('old shell')],[scope+'audio/en/existing.mp3',new Response('existing voice')],[scope+'app-new.js',new Response('corrupt bytes')]]));stores.set('another-app-cache',new Map());
 const caches={keys:async()=>[...stores.keys()],open:async name=>cache(name),delete:async name=>stores.delete(name)};
 const code=template.replace('__VERSION__','new').replace('__FILES__',JSON.stringify(Object.keys(files))).replace('__HASHES__',JSON.stringify(Object.fromEntries(Object.entries(files).map(([key,value])=>[key,hash(value)]))));
 vm.runInNewContext(code,{URL,Request,crypto:webcrypto,caches,self:{registration:{scope},clients:{claim:async()=>{}},addEventListener:(name,handler)=>handlers[name]=handler}});
 const run=async event=>{let done;handlers[event]({waitUntil:value=>done=value});await done;};return {stores,requested,oldName,newName,run,files};
}
test('An upgrade reuses verified audio, downloads nature additions and replaces corrupt cached bytes',async()=>{const w=worker();await w.run('install');assert.ok(!w.requested.includes('audio/en/existing.mp3'));assert.ok(w.requested.includes('audio/he/new.mp3'));assert.ok(w.requested.includes('app-new.js'));const cache=w.stores.get(w.newName);assert.equal(cache.size,Object.keys(w.files).length);for(const [path,text]of Object.entries(w.files))assert.equal(await cache.get(scope+path).clone().text(),text);await w.run('activate');assert.ok(w.stores.has(w.oldName));assert.ok(w.stores.has('another-app-cache'));});
test('An interrupted nature update discards the incomplete release and keeps the previous offline app',async()=>{const w=worker({fail:true});await assert.rejects(w.run('install'),/interrupted/);assert.ok(!w.stores.has(w.newName));assert.ok(w.stores.has(w.oldName));assert.equal(await w.stores.get(w.oldName).get(scope+'index.html').text(),'old shell');assert.ok(w.stores.has('another-app-cache'));});
