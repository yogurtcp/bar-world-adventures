const VERSION='__VERSION__';
const FILES=__FILES__;
const HASHES=__HASHES__;
const SCOPE=new URL(self.registration.scope);
const PREFIX='bar-world-'+SCOPE.pathname.replace(/[^a-z0-9]/gi,'_')+'-';
const CACHE=PREFIX+VERSION;
const url=path=>new URL(path,SCOPE).href;
const allowed=new Set(FILES.map(url));
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 try{
  // A release activates only when every image, narration clip and shell file is cached.
  // Reuse verified bytes from complete older releases, including pre-hash versions.
  // UI updates need only download changed files, not every voice and picture again.
  const older=await Promise.all((await caches.keys()).filter(key=>key.startsWith(PREFIX)&&key!==CACHE).reverse().map(key=>caches.open(key)));
  for(let i=0;i<FILES.length;i+=32){
   const missing=[];
   await Promise.all(FILES.slice(i,i+32).map(async path=>{
    for(const previous of older){
     const response=await previous.match(url(path));
     if(!response?.ok)continue;
     const digest=await crypto.subtle.digest('SHA-256',await response.clone().arrayBuffer());
     const hash=Array.from(new Uint8Array(digest),byte=>byte.toString(16).padStart(2,'0')).join('');
     if(hash===HASHES[path]){await cache.put(url(path),response);return;}
    }
    missing.push(new Request(url(path),{cache:'reload'}));
   }));
   if(missing.length)await cache.addAll(missing);
  }
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
