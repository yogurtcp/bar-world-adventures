import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {countries} from '../src/countries.js';
const result=await build({entryPoints:['src/globe.js'],bundle:true,platform:'node',format:'cjs',write:false});
const mod={exports:{}};new Function('module','exports',result.outputFiles[0].text)(mod,mod.exports);
const{geoById,countryShape,quizPinPosition}=mod.exports;
test('Duplicate map IDs select the main country, including Australia',()=>{assert.equal(geoById[36].properties.name,'Australia');assert.ok(countryShape(36).length>1000,'Australia must be a real mainland contour, not a tiny offshore rectangle');});
test('Every country has a distinct, finite quiz silhouette',()=>{const paths=countries.map(c=>countryShape(c.id));assert.equal(new Set(paths).size,countries.length);for(let i=0;i<paths.length;i++){assert.ok(!/NaN|Infinity|undefined/.test(paths[i]),countries[i].en);assert.ok(paths[i].length>100,countries[i].en);}});

test('Adjacent-country quiz markers stay separated and inside the globe viewport',()=>{for(const anchor of [[300,300],[540,300],[60,60]]){const occupied=[];for(let i=0;i<4;i++){const point=quizPinPosition([anchor[0]+i,anchor[1]+i],22,occupied);assert.ok(point[0]>=30&&point[0]<=570&&point[1]>=30&&point[1]<=570);for(const prior of occupied)assert.ok(Math.hypot(point[0]-prior[0],point[1]-prior[1])>=54);occupied.push([...point,22]);}}});
test('Rotation geometry is much smaller while retaining every country and detailed silhouettes',()=>{const count=g=>g.type==='Feature'?count(g.geometry):g.type==='FeatureCollection'?g.features.reduce((n,f)=>n+count(f),0):g.type==='GeometryCollection'?g.geometries.reduce((n,f)=>n+count(f),0):(function points(a){return typeof a[0]==='number'?1:a.reduce((n,c)=>n+points(c),0);})(g.coordinates);const {features,rotationFeatures}=mod.exports;assert.ok(count({type:'FeatureCollection',features:rotationFeatures})<count({type:'FeatureCollection',features})/8);for(const c of countries)assert.ok(rotationFeatures.some(f=>+f.id===c.id),c.en);});
