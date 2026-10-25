let promptEvent=null,registration=null,callbacks={},reloadStarted=false,interacted=false;
export const isInstalled=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();promptEvent=e;});
window.addEventListener('appinstalled',()=>{promptEvent=null;callbacks.onInstall?.();});
document.addEventListener('pointerdown',()=>{interacted=true;},{once:true});
export async function installApp(t,dialog){if(isInstalled())return; if(promptEvent){try{await promptEvent.prompt();await promptEvent.userChoice;}catch{}promptEvent=null;return;}
 const apple=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 dialog.innerHTML=`<div class="dialog-head"><h2>${t('installTitle')}</h2><button class="round-button" data-action="close" aria-label="${t('close')}">×</button></div><img class="install-icon" src="icons/icon-192.png" alt="" width="96" height="96"><p class="install-instructions">${t(apple?'iosInstall':'otherInstall')}</p><p class="muted-copy">${t('offline')}</p>`;dialog.showModal();}
export function safeUpdate(atBoundary=false){if(registration?.waiting&&(atBoundary||callbacks.isSafe?.()||!interacted)){callbacks.persist?.();registration.waiting.postMessage({type:'ACTIVATE'});}}
export async function setupPWA(options){callbacks=options;if(!('serviceWorker'in navigator))return;
 navigator.serviceWorker.addEventListener('controllerchange',()=>{if(reloadStarted)return;callbacks.persist?.();reloadStarted=true;location.reload();});
 try{
  if(!navigator.onLine){registration=await navigator.serviceWorker.getRegistration('./');if(registration?.active)callbacks.onReady?.();return;}
  const existing=await navigator.serviceWorker.getRegistration('./');
  // One explicit check per online launch. No interval, focus, visibility or reconnect checks.
  registration=existing||await navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'});
  if(existing){existing.addEventListener('updatefound',watchInstalling);await existing.update();}
  else registration.addEventListener('updatefound',watchInstalling);
  if(registration.installing)watchInstalling();
  if(registration.waiting){callbacks.onWaiting?.();safeUpdate();}
  if(registration.active)callbacks.onReady?.();
  function watchInstalling(){const worker=registration.installing;if(!worker)return;worker.addEventListener('statechange',()=>{if(worker.state==='installed'){if(navigator.serviceWorker.controller){callbacks.onWaiting?.();safeUpdate();}else callbacks.onReady?.();}if(worker.state==='redundant')callbacks.onError?.();});}
 }catch{callbacks.onError?.();}
}
