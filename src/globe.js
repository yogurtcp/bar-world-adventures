import {geoOrthographic,geoPath,geoDistance,geoCentroid,geoArea} from 'd3-geo';
import {feature} from 'topojson-client';
import atlas from 'world-atlas/countries-50m.json' with {type:'json'};
import rotationAtlas from 'world-atlas/countries-110m.json' with {type:'json'};
import smallAtlas from 'world-atlas/land-110m.json' with {type:'json'};
const illustrationLand=feature(smallAtlas,smallAtlas.objects.land);
import {countries,byId} from './countries.js';
import {naturePlaces,natureById} from './nature.js';
import natureGeometry from './nature-geometry.json' with {type:'json'};
export {natureGeometry};
export const globePlace=id=>natureById[id]||byId[id];
export function globeSelection(raw,nature=false,gameIds=null){const id=nature?raw:Number(raw);return Object.hasOwn(nature?natureById:byId,id)&&(!gameIds||gameIds.includes(id))?id:null;}
export const features=feature(atlas,atlas.objects.countries).features;
// Keep fine geography for static quiz silhouettes; redraw the smaller atlas when rotating.
export const rotationFeatures=feature(rotationAtlas,rotationAtlas.objects.countries).features;
// Natural Earth can give a small dependency the same ISO ID as its parent.
// Prefer the largest primary feature (Australia, rather than Ashmore and Cartier Islands).
export const geoById=features.reduce((lookup,f)=>{const id=+f.id;if(!lookup[id]||geoArea(f)>geoArea(lookup[id]))lookup[id]=f;return lookup;},{});
const NS='http://www.w3.org/2000/svg';
function node(name,attrs={},parent){const n=document.createElementNS(NS,name);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);parent?.append(n);return n;}
const colors=['#a9d88b','#f7d27a','#b6cae8','#efb1a1','#c3bded','#90d3bc'];
export function countryShape(id){const c=byId[id],original=geoById[id];if(!original)return '';let geometry=original.geometry;
 const localRadius=['PT','EC','NO','ES'].includes(c.iso)?.18:.65;
 if(geometry.type==='MultiPolygon') {const largest=Math.max(...geometry.coordinates.map(poly=>geoArea({type:'Polygon',coordinates:poly})));const filtered=geometry.coordinates.filter(poly=>geoArea({type:'Polygon',coordinates:poly})>largest*.003&&geoDistance(geoCentroid({type:'Polygon',coordinates:poly}),[c.lon,c.lat])<localRadius);if(filtered.length)geometry={type:'MultiPolygon',coordinates:filtered};}
 // Local rotation avoids an antimeridian seam for Russia and Pacific islands.
 const p=geoOrthographic().rotate([-c.lon,-c.lat]).clipAngle(179).fitExtent([[16,12],[224,168]],geometry);
 return `<svg class="country-shape" viewBox="0 0 240 180" aria-hidden="true"><path d="${geoPath(p)(geometry)||''}"/></svg>`;
}
// A geographic illustration uses the same real coastlines and feature outline as the globe.
export function natureShape(id){const c=natureById[id];if(!c)return '';const p=geoOrthographic().rotate([-c.lon,-c.lat]).translate([160,160]).scale(148),path=geoPath(p);const point=p([c.lon,c.lat]);return `<svg class="nature-shape" viewBox="0 0 320 320" aria-hidden="true"><circle cx="160" cy="160" r="148" fill="#69c9de"/><path d="${path(illustrationLand)||''}" fill="#b2d798" stroke="#f8ffed" stroke-width=".5"/>${natureGeometry[id]?`<path d="${path(natureGeometry[id])||''}" fill="${c.category==='river'?'none':'#ffd977'}" fill-opacity=".7" stroke="#bb702a" stroke-width="2"/>`:''}<circle cx="${point[0]}" cy="${point[1]}" r="8" fill="#fff6be" stroke="#995c23" stroke-width="3"/></svg>`;}
// Keep neighboring quiz markers separate while leader lines retain their true locations.
export function quizPinPosition(anchor,r,occupied){
 const clear=p=>p[0]>=r+8&&p[0]<=592-r&&p[1]>=r+8&&p[1]<=592-r&&occupied.every(o=>Math.hypot(o[0]-p[0],o[1]-p[1])>=r+o[2]+10);
 if(clear(anchor))return [...anchor];
 for(let ring=1;ring<=5;ring++)for(let step=0;step<24;step++){const angle=step*Math.PI/12,distance=ring*(2*r+10),candidate=[anchor[0]+Math.cos(angle)*distance,anchor[1]+Math.sin(angle)*distance];if(clear(candidate))return candidate;}
 return [...anchor];
}
export class Globe {
 constructor(container,{selected=376,locale='he',onSelect,gameIds=null,hint=null,gentle=false,rotation=null,size=246,nature=false,category='all'}={}){
 this.nature=nature;this.category=category;this.container=container;this.selected=selected;this.locale=locale;this.onSelect=onSelect;this.gameIds=gameIds;this.hint=hint;this.gentle=gentle;this.size=size;this.rotation=rotation||[-25,-18,0];this.destroyed=false;this.frame=0;this.drawnSize=null;
 this.svg=node('svg',{viewBox:'0 0 600 600',class:'globe',role:'group','aria-label':locale==='he'?'גלובוס אינטראקטיבי':'Interactive globe',tabindex:0});container.append(this.svg);
 const defs=node('defs',{},this.svg),gradient=node('radialGradient',{id:'ocean',cx:'34%',cy:'24%',r:'75%'},defs);node('stop',{offset:'0%','stop-color':'#85e4e6'},gradient);node('stop',{offset:'65%','stop-color':'#51bfcf'},gradient);node('stop',{offset:'100%','stop-color':'#2891b3'},gradient);
 const shade=node('radialGradient',{id:'shade',cx:'32%',cy:'25%',r:'75%'},defs);node('stop',{offset:'65%','stop-color':'#083e63','stop-opacity':0},shade);node('stop',{offset:'100%','stop-color':'#083e63','stop-opacity':.24},shade);
 this.p=geoOrthographic().translate([300,300]).scale(this.size).rotate(this.rotation);this.path=geoPath(this.p);
 node('ellipse',{cx:300,cy:569,rx:166,ry:14,fill:'#2e786b',opacity:.10},this.svg);
 this.ocean=node('path',{fill:'url(#ocean)',stroke:'#fff','stroke-width':6},this.svg);
 this.paths=rotationFeatures.map(f=>{const c=byId[+f.id],selectable=c&&!nature&&(!gameIds||gameIds.includes(c.id));const n=node('path',{fill:c?colors[c.index%colors.length]:'#b8d4a5',stroke:'#faffee','stroke-width':c?1.2:.6,'stroke-linejoin':'round',class:'land',...(selectable?{'data-country':c.id,role:'button',tabindex:-1,'aria-label':c[locale]}:{})},this.svg);if(c){const title=node('title',{},n);title.textContent=c[locale];}if(selectable)n.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();this.onSelect?.(c.id);}});return {f,n,c,selectable};});
 this.natureOutline=node('path',{fill:'#ffdb73','fill-opacity':.58,stroke:'#c68136','stroke-width':2,'pointer-events':'none'},this.svg);
 this.shade=node('path',{fill:'url(#shade)','pointer-events':'none'},this.svg);this.leaders=node('g',{'pointer-events':'none'},this.svg);this.pins=node('g',{},this.svg);this.pinNodes=[];
 // Small countries retain invisible enlarged tap targets. Country pictures no longer rotate.
 const places=nature?naturePlaces:countries.filter(c=>geoArea(geoById[c.id])<.0015);const pool=gameIds?gameIds.map(globePlace):[...places.filter(c=>c.id===selected),...places.filter(c=>c.id!==selected)].filter(c=>c&&(!nature||category==='all'||c.category===category));
 for(const c of pool){const g=node('g',{class:`${!gameIds&&!nature?'country-hit':'globe-pin'} ${c.id===selected?'selected':''}`,'data-pin':c.id,role:'button',tabindex:-1,'aria-label':gameIds?String(gameIds.indexOf(c.id)+1):c[locale]},this.pins);const active=c.id===selected;const r=gameIds?22:active?23:17;
 const leader=gameIds?node('line',{stroke:'#fffdf3','stroke-width':2,'pointer-events':'none'},this.leaders):null;
 const anchorDot=gameIds?node('circle',{r:3,fill:'#fffdf3','pointer-events':'none'},this.leaders):null;
 if(gameIds){node('circle',{r,fill:c.id===hint?'#ffe66b':'#fffaf0',stroke:c.id===hint?'#e59b22':'#fff','stroke-width':2},g);const t=node('text',{'text-anchor':'middle',dy:6,'font-size':19,'font-weight':900,fill:'#29494d'},g);t.textContent=gameIds.indexOf(c.id)+1;}
 else if(nature){node('rect',{x:-r,y:-r,width:r*2,height:r*2,fill:'transparent'},g);const text=node('text',{'text-anchor':'middle',dy:8,'font-size':active?29:25,'pointer-events':'none'},g);text.textContent=c.icon;}
 else node('circle',{r:12,fill:'transparent','pointer-events':'all'},g);
 const title=node('title',{},g);title.textContent=gameIds?String(gameIds.indexOf(c.id)+1):c[locale];g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();this.onSelect?.(c.id);}});this.pinNodes.push({c,g,r,leader,anchorDot});}
 this.draw();this.bind();
 }
 requestDraw(){if(this.destroyed||this.frame)return;this.frame=requestAnimationFrame(()=>{this.frame=0;if(!this.destroyed)this.draw();});}
 bind(){let start=null,moved=false,pendingId=null;
 this.svg.addEventListener('pointerdown',e=>{if(e.button&&e.button!==0)return;pendingId=null;start={x:e.clientX,y:e.clientY,r:[...this.rotation]};moved=false;this.svg.setPointerCapture(e.pointerId);this.svg.classList.add('dragging');});
 this.svg.addEventListener('pointermove',e=>{if(!start)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;if(Math.hypot(dx,dy)>6)moved=true;if(!moved)return;this.rotation=[start.r[0]+dx*.33,Math.max(-90,Math.min(90,start.r[1]-dy*.33)),0];this.requestDraw();});
 this.svg.addEventListener('pointerup',e=>{this.svg.classList.remove('dragging');if(!moved&&start){const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-pin],[data-country]');const id=globeSelection(target?.getAttribute('data-pin')||target?.getAttribute('data-country'),this.nature,this.gameIds);if(id!==null)pendingId=id;}start=null;});
 // Open the next view on click, after pointerup has finished. Opening during
 // pointerup lets the same tap click a picture/greeting in the new country view.
 this.svg.addEventListener('click',e=>{if(!pendingId)return;const id=pendingId;pendingId=null;e.preventDefault();e.stopPropagation();this.onSelect?.(id);});
 this.svg.addEventListener('pointercancel',()=>{start=null;pendingId=null;this.svg.classList.remove('dragging');});
 this.svg.addEventListener('keydown',e=>{const dirs={ArrowLeft:[-15,0],ArrowRight:[15,0],ArrowUp:[0,12],ArrowDown:[0,-12]};if(dirs[e.key]){e.preventDefault();this.spin(...dirs[e.key]);}});
 }
 draw(){this.p.scale(this.size).rotate(this.rotation);
 // The sphere and its lighting do not change while rotating.
 if(this.drawnSize!==this.size){const sphere=this.path({type:'Sphere'});this.ocean.setAttribute('d',sphere);this.shade.setAttribute('d',sphere);this.drawnSize=this.size;}
 for(const {f,n,c,selectable}of this.paths){n.setAttribute('d',this.path(f)||'');if(+f.id===this.hint)n.setAttribute('fill','#ffe46e');if(selectable)n.setAttribute('tabindex',geoDistance([c.lon,c.lat],[-this.rotation[0],-this.rotation[1]])<1.43?'0':'-1');}
 const outlineId=this.gameIds?this.hint:this.selected;const outline=this.nature&&(this.gameIds||this.category==='all'||natureById[outlineId]?.category===this.category)&&natureGeometry[outlineId];this.natureOutline.setAttribute('d',outline?this.path(outline)||'':'');this.natureOutline.setAttribute('fill',natureById[this.gameIds?this.hint:this.selected]?.category==='river'?'none':'#ffdb73');
 const occupied=[];for(const {c,g,r,leader,anchorDot}of this.pinNodes){const pt=this.p([c.lon,c.lat]);const front=geoDistance([c.lon,c.lat],[-this.rotation[0],-this.rotation[1]])<1.43;const crowded=!this.gameIds&&occupied.some(o=>Math.hypot(o[0]-pt[0],o[1]-pt[1])<r+o[2]+3);const visible=front&&!crowded&&pt[0]>25&&pt[0]<575&&pt[1]>25&&pt[1]<575;g.style.display=visible?'':'none';if(leader&&!visible){leader.style.display=anchorDot.style.display='none';}g.setAttribute('tabindex',visible?'0':'-1');if(visible){const pin=this.gameIds?quizPinPosition(pt,r,occupied):pt;occupied.push([...pin,r]);g.setAttribute('transform',`translate(${pin})`);if(leader){const dx=pt[0]-pin[0],dy=pt[1]-pin[1],moved=Math.hypot(dx,dy)>2;leader.style.display=anchorDot.style.display=moved?'':'none';leader.setAttribute('x1',pt[0]);leader.setAttribute('y1',pt[1]);leader.setAttribute('x2',pin[0]);leader.setAttribute('y2',pin[1]);anchorDot.setAttribute('cx',pt[0]);anchorDot.setAttribute('cy',pt[1]);}}}
 }
 focus(id){const c=globePlace(id);if(c){this.rotation=[-c.lon,-c.lat,0];this.draw();}}
 focusOptions(){if(!this.gameIds)return;const centroid=geoCentroid({type:'MultiPoint',coordinates:this.gameIds.map(id=>[globePlace(id).lon,globePlace(id).lat])});this.rotation=[-centroid[0],-centroid[1],0];this.draw();}
 spin(lon,lat=0){this.rotation=[this.rotation[0]+lon,Math.max(-90,Math.min(90,this.rotation[1]+lat)),0];this.draw();}
 zoom(delta){this.size=Math.max(190,Math.min(430,this.size+delta));this.draw();}
 destroy(){this.destroyed=true;if(this.frame)cancelAnimationFrame(this.frame);this.frame=0;this.container.replaceChildren();}
}
