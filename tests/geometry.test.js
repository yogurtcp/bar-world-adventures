import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {countries} from '../src/countries.js';
const result=await build({entryPoints:['src/globe.js'],bundle:true,platform:'node',format:'cjs',write:false});
const mod={exports:{}};new Function('module','exports',result.outputFiles[0].text)(mod,mod.exports);
const{geoById,countryShape}=mod.exports;
test('Duplicate map IDs select the main country, including Australia',()=>{assert.equal(geoById[36].properties.name,'Australia');assert.ok(countryShape(36).length>1000,'Australia must be a real mainland contour, not a tiny offshore rectangle');});
test('Every country has a distinct, finite quiz silhouette',()=>{const paths=countries.map(c=>countryShape(c.id));assert.equal(new Set(paths).size,36);for(let i=0;i<paths.length;i++){assert.ok(!/NaN|Infinity|undefined/.test(paths[i]),countries[i].en);assert.ok(paths[i].length>100,countries[i].en);}});
