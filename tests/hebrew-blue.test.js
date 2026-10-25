import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync,existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const root=new URL('../',import.meta.url);
const metadata=JSON.parse(readFileSync(new URL('scripts/hebrew/blue-recordings.json',root)));
const isWorld=existsSync(new URL('src/audio-manifest.js',root));
const {audioManifest}=await import(isWorld?'../src/audio-manifest.js':'../src/core/audio-manifest.js');
const catalog=JSON.parse(execFileSync('node',['scripts/audio-catalog.js'],{cwd:root,encoding:'utf8'})).he;
test('every Hebrew line uses the approved free female voice with complete audio and provenance',()=>{
 assert.equal(metadata.voice,'libri_female_6147');assert.equal(metadata.engine,'BlueTTS 2.5');
 assert.equal(metadata.speed,.8);assert.equal(metadata.steps,16);assert.equal(metadata.cfgScale,4);
 assert.deepEqual(Object.keys(audioManifest.he).sort(),catalog.slice().sort());
 for(const text of catalog){
  const record=metadata.records[text],path=audioManifest.he[text];
  assert.equal(record.input,text.normalize('NFC'));assert.equal(record.path,path);
  assert.match(path,/^audio\/he\/blue-[a-f0-9]{20}\.mp3$/);assert.ok(record.ipa.trim());
  assert.doesNotMatch(record.ipa,/[\u0590-\u05ff]/);
  assert.ok(record.seconds>.15&&record.seconds<20);assert.ok(record.peak>.02&&record.peak<=1);
  assert.ok(statSync(new URL((isWorld?'public/':'')+path,root)).size>1000,path);
 }
 assert.ok(metadata.previousPaths.length>0,'retain the previous Hebrew URLs for in-progress upgrades');
 for(const path of metadata.previousPaths)assert.ok(statSync(new URL((isWorld?'public/':'')+path,root)).size>1000,path);
});
