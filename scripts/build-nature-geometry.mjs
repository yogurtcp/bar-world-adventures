// Natural Earth public-domain physical features, kept separate from country borders.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {geoArea,geoCircle} from 'd3-geo';
import {naturePlaces} from '../src/nature.js';
const metadata=JSON.parse(await readFile(new URL('./nature-sources.json',import.meta.url),'utf8'));
const source={};
for(const {layer,url,sha256} of metadata.files){const path=`/tmp/ne_${layer}.json`;let raw;try{raw=await readFile(path,'utf8');}catch{const response=await fetch(url);if(!response.ok)throw Error(response.status);raw=await response.text();}if(createHash('sha256').update(raw).digest('hex')!==sha256)throw Error(`Source hash mismatch: ${layer}`);for(const f of JSON.parse(raw).features){const key=f.properties.name||f.properties.NAME;if(key)(source[key]??=[]).push(f.geometry);}}
function normalize(g){if(g.type==='GeometryCollection')return {...g,geometries:g.geometries.map(normalize)};const round=c=>typeof c==='number'?Math.round(c*1000)/1000:c.map(round);const coordinates=round(g.coordinates);const wind=poly=>geoArea({type:'Polygon',coordinates:poly})>2*Math.PI?poly.map(ring=>ring.reverse()):poly;if(g.type==='Polygon')return {type:g.type,coordinates:wind(coordinates)};if(g.type==='MultiPolygon')return {type:g.type,coordinates:coordinates.map(wind)};return {type:g.type,coordinates};}
source['Pacific Ocean']=[...(source['North Pacific Ocean']||[]),...(source['South Pacific Ocean']||[])];source['Atlantic Ocean']=[...(source['North Atlantic Ocean']||[]),...(source['South Atlantic Ocean']||[])];
source.Arctic=[geoCircle().center([0,90]).radius(23.44)()];
const output={};for(const p of naturePlaces){if(!p.geometryKey)continue;const list=source[p.geometryKey];if(!list?.length)throw Error(`Missing ${p.geometryKey}`);output[p.id]=normalize(list.length===1?list[0]:{type:'GeometryCollection',geometries:list});}
await writeFile(new URL('../src/nature-geometry.json',import.meta.url),JSON.stringify(output));console.log(`${Object.keys(output).length} physical outlines saved`);
