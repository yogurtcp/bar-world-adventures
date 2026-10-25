const VERSION='__VERSION__';
const FILES=__FILES__;
const SCOPE=new URL(self.registration.scope);
const PREFIX='bar-world-'+SCOPE.pathname.replace(/[^a-z0-9]/gi,'_')+'-';
const CACHE=PREFIX+VERSION;
const url=path=>new URL(path,SCOPE).href;
const allowed=new Set(FILES.map(url));
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 try{
  // A release activates only when every image, narration clip and shell file is cached.
  for(let i=0;i<FILES.length;i+=32)await cache.addAll(FILES.slice(i,i+32).map(path=>new Request(url(path),{cache:'reload'})));
 }catch(error){await caches.delete(CACHE);throw error;}
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 // This prefix is unique to this game and scope. Keep one older complete release for open tabs.
 const old=(await caches.keys()).filter(key=>key.startsWith(PREFIX)&&key!==CACHE);
 await Promise.all(old.slice(0,-1).map(key=>caches.delete(key)));
 await self.clients.claim();
})()));
self.addEventListener('message',event=>{if(event.data?.type==='ACTIVATE')self.skipWaiting();if(event.data?.type==='VERSION')event.ports[0]?.postMessage({version:VERSION});});
self.addEventListener('fetch',event=>{
 const request=event.request,u=new URL(request.url);
 if(request.method!=='GET'||u.origin!==SCOPE.origin||!u.pathname.startsWith(SCOPE.pathname))return;
 if(request.mode==='navigate'){event.respondWith((async()=>{const cache=await caches.open(CACHE);return await cache.match(url('index.html'))||fetch(request);})());return;}
 if(allowed.has(u.href))event.respondWith((async()=>{const cache=await caches.open(CACHE);return await cache.match(request,{ignoreSearch:false})||fetch(request);})());
});
