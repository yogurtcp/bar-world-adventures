import {geoOrthographic,geoPath,geoGraticule10,geoDistance,geoCentroid,geoArea} from 'd3-geo';
import {feature} from 'topojson-client';
import atlas from 'world-atlas/countries-50m.json' with {type:'json'};
import {countries,byId} from './countries.js';
export const features=feature(atlas,atlas.objects.countries).features;
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
// Keep neighboring quiz markers separate while leader lines retain their true locations.
export function quizPinPosition(anchor,r,occupied){
 const clear=p=>p[0]>=r+8&&p[0]<=592-r&&p[1]>=r+8&&p[1]<=592-r&&occupied.every(o=>Math.hypot(o[0]-p[0],o[1]-p[1])>=r+o[2]+10);
 if(clear(anchor))return [...anchor];
 for(let ring=1;ring<=5;ring++)for(let step=0;step<24;step++){const angle=step*Math.PI/12,distance=ring*(2*r+10),candidate=[anchor[0]+Math.cos(angle)*distance,anchor[1]+Math.sin(angle)*distance];if(clear(candidate))return candidate;}
 return [...anchor];
}
export class Globe {
 constructor(container,{selected=376,locale='he',onSelect,gameIds=null,hint=null,gentle=false,rotation=null,size=246}={}){
 this.container=container;this.selected=selected;this.locale=locale;this.onSelect=onSelect;this.gameIds=gameIds;this.hint=hint;this.gentle=gentle;this.size=size;this.rotation=rotation||[-25,-18,0];this.destroyed=false;
 this.svg=node('svg',{viewBox:'0 0 600 600',class:'globe',role:'group','aria-label':locale==='he'?'גלובוס אינטראקטיבי':'Interactive globe',tabindex:0});container.append(this.svg);
 const defs=node('defs',{},this.svg),gradient=node('radialGradient',{id:'ocean',cx:'34%',cy:'24%',r:'75%'},defs);node('stop',{offset:'0%','stop-color':'#85e4e6'},gradient);node('stop',{offset:'65%','stop-color':'#51bfcf'},gradient);node('stop',{offset:'100%','stop-color':'#2891b3'},gradient);
 const shade=node('radialGradient',{id:'shade',cx:'32%',cy:'25%',r:'75%'},defs);node('stop',{offset:'65%','stop-color':'#083e63','stop-opacity':0},shade);node('stop',{offset:'100%','stop-color':'#083e63','stop-opacity':.24},shade);
 this.p=geoOrthographic().translate([300,300]).scale(this.size).rotate(this.rotation);this.path=geoPath(this.p);
 node('ellipse',{cx:300,cy:569,rx:166,ry:14,fill:'#2e786b',opacity:.10},this.svg);
 this.ocean=node('path',{fill:'url(#ocean)',stroke:'#fff','stroke-width':6},this.svg);this.graticule=node('path',{fill:'none',stroke:'#e8ffff','stroke-opacity':.20,'stroke-width':1},this.svg);
 this.paths=features.map((f,i)=>{const c=byId[+f.id];const n=node('path',{fill:c?colors[c.index%colors.length]:'#b8d4a5',stroke:'#faffee','stroke-width':c?1.2:.6,'stroke-linejoin':'round',class:'land',...(c?{'data-country':c.id}: {})},this.svg);if(c){const title=node('title',{},n);title.textContent=c[locale];}return {f,n};});
 this.shade=node('path',{fill:'url(#shade)','pointer-events':'none'},this.svg);this.leaders=node('g',{'pointer-events':'none'},this.svg);this.pins=node('g',{},this.svg);this.pinNodes=[];
 const pool=gameIds?gameIds.map(id=>byId[id]):[byId[selected],...countries.filter(c=>c.id!==selected)];
 for(const c of pool){const g=node('g',{class:`globe-pin ${c.id===selected?'selected':''}`,'data-pin':c.id,role:'button',tabindex:-1,'aria-label':gameIds?String(gameIds.indexOf(c.id)+1):c[locale]},this.pins);const active=c.id===selected;const r=gameIds?22:active?23:17;
 const leader=gameIds?node('line',{stroke:'#fffdf3','stroke-width':2,'pointer-events':'none'},this.leaders):null;
 const anchorDot=gameIds?node('circle',{r:3,fill:'#fffdf3','pointer-events':'none'},this.leaders):null;
 node('circle',{r,fill:c.id===hint?'#ffe66b':gameIds?'#fffaf0':'white',stroke:c.id===hint?'#e59b22':active?'#df9c35':'#fff','stroke-width':active?4:2},g);
 if(gameIds){const t=node('text',{'text-anchor':'middle',dy:6,'font-size':19,'font-weight':900,fill:'#29494d'},g);t.textContent=gameIds.indexOf(c.id)+1;}
 else{const clipid=`clip-${c.id}`,clip=node('clipPath',{id:clipid},defs);node('circle',{r:r-2},clip);node('image',{href:c.art,x:-(r-2)*2.8,y:-(r-2)*2.8,width:(r-2)*3.6,height:(r-2)*3.6,'clip-path':`url(#${clipid})`},g);}
 const title=node('title',{},g);title.textContent=gameIds?String(gameIds.indexOf(c.id)+1):c[locale];this.pinNodes.push({c,g,r,leader,anchorDot});}
 this.draw();this.bind();
 }
 bind(){let start=null,moved=false,frame=0;
 this.svg.addEventListener('pointerdown',e=>{if(e.button&&e.button!==0)return;start={x:e.clientX,y:e.clientY,r:[...this.rotation]};moved=false;this.svg.setPointerCapture(e.pointerId);this.svg.classList.add('dragging');});
 this.svg.addEventListener('pointermove',e=>{if(!start)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;if(Math.hypot(dx,dy)>6)moved=true;if(!moved)return;this.rotation=[start.r[0]+dx*.33,Math.max(-80,Math.min(80,start.r[1]-dy*.33)),0];if(!frame)frame=requestAnimationFrame(()=>{frame=0;if(!this.destroyed)this.draw();});});
 this.svg.addEventListener('pointerup',e=>{this.svg.classList.remove('dragging');if(!moved&&start){const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-pin],[data-country]');const id=+(target?.getAttribute('data-pin')||target?.getAttribute('data-country'));if(id&&(!this.gameIds||this.gameIds.includes(id)))this.onSelect?.(id);}start=null;});
 this.svg.addEventListener('pointercancel',()=>{start=null;this.svg.classList.remove('dragging');});
 this.svg.addEventListener('keydown',e=>{const dirs={ArrowLeft:[-15,0],ArrowRight:[15,0],ArrowUp:[0,12],ArrowDown:[0,-12]};if(dirs[e.key]){e.preventDefault();this.spin(...dirs[e.key]);}});
 }
 draw(){this.p.scale(this.size).rotate(this.rotation);this.ocean.setAttribute('d',this.path({type:'Sphere'}));this.graticule.setAttribute('d',this.path(geoGraticule10()));for(const {f,n}of this.paths){n.setAttribute('d',this.path(f)||'');if(+f.id===this.hint)n.setAttribute('fill','#ffe46e');}this.shade.setAttribute('d',this.path({type:'Sphere'}));
 const occupied=[];for(const {c,g,r,leader,anchorDot}of this.pinNodes){const pt=this.p([c.lon,c.lat]);const front=geoDistance([c.lon,c.lat],[-this.rotation[0],-this.rotation[1]])<1.43;const crowded=!this.gameIds&&occupied.some(o=>Math.hypot(o[0]-pt[0],o[1]-pt[1])<r+o[2]+3);const visible=front&&!crowded&&pt[0]>25&&pt[0]<575&&pt[1]>25&&pt[1]<575;g.style.display=visible?'':'none';if(leader&&!visible){leader.style.display=anchorDot.style.display='none';}g.setAttribute('tabindex',visible?'0':'-1');if(visible){const pin=this.gameIds?quizPinPosition(pt,r,occupied):pt;occupied.push([...pin,r]);g.setAttribute('transform',`translate(${pin})`);if(leader){const dx=pt[0]-pin[0],dy=pt[1]-pin[1],moved=Math.hypot(dx,dy)>2;leader.style.display=anchorDot.style.display=moved?'':'none';leader.setAttribute('x1',pt[0]);leader.setAttribute('y1',pt[1]);leader.setAttribute('x2',pin[0]);leader.setAttribute('y2',pin[1]);anchorDot.setAttribute('cx',pt[0]);anchorDot.setAttribute('cy',pt[1]);}g.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();this.onSelect?.(c.id);}};}}
 }
 focus(id){const c=byId[id];if(c){this.rotation=[-c.lon,-c.lat,0];this.draw();}}
 focusOptions(){if(!this.gameIds)return;const centroid=geoCentroid({type:'MultiPoint',coordinates:this.gameIds.map(id=>[byId[id].lon,byId[id].lat])});this.rotation=[-centroid[0],-centroid[1],0];this.draw();}
 spin(lon,lat=0){this.rotation=[this.rotation[0]+lon,Math.max(-80,Math.min(80,this.rotation[1]+lat)),0];this.draw();}
 zoom(delta){this.size=Math.max(190,Math.min(430,this.size+delta));this.draw();}
 destroy(){this.destroyed=true;this.container.replaceChildren();}
}
