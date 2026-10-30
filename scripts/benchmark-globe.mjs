// Geometry-only CPU comparison; device/browser frame rates also depend on SVG painting.
import {build} from 'esbuild';
import {geoOrthographic,geoPath} from 'd3-geo';
import {performance} from 'node:perf_hooks';
const bundle=await build({entryPoints:['src/globe.js'],bundle:true,platform:'node',format:'cjs',write:false});
const mod={exports:{}};new Function('module','exports',bundle.outputFiles[0].text)(mod,mod.exports);
const {features,rotationFeatures}=mod.exports;
function measure(list){const p=geoOrthographic().translate([300,300]).scale(285),path=geoPath(p),samples=[];for(let i=0;i<48;i++){p.rotate([i*7-150,-25,0]);const start=performance.now();for(const f of list)path(f);if(i>=8)samples.push(performance.now()-start);}samples.sort((a,b)=>a-b);return {medianMs:+samples[Math.floor(samples.length/2)].toFixed(2),p95Ms:+samples[Math.floor(samples.length*.95)].toFixed(2)};}
console.log(JSON.stringify({previousDetailedMap:measure(features),lighterRotationMap:measure(rotationFeatures)},null,2));
