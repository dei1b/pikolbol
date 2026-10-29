/* Local adaptation layer. Sponsor removal also patches the original game bundles. */
(() => {
  const nativeFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    const url = new URL(input instanceof Request ? input.url : input, location.href);
    if (url.origin !== location.origin) return Promise.reject(new TypeError('Rally Offline blocks internet requests.'));
    if (url.pathname === '/leaderboard') return Promise.reject(new TypeError('The global leaderboard is unavailable offline.'));
    if (url.pathname.startsWith('/live/stats/')) return Promise.resolve(new Response(null,{status:204}));
    if (url.pathname === '/live/park/online') return Promise.resolve(Response.json({total:0,parks:[0,0,0,0,0]}));
    return nativeFetch(input,init);
  };
  if (navigator.sendBeacon) navigator.sendBeacon = () => false;
  const onlineSelector = '[data-online-entry],[data-park-entry],[data-leaderboard-entry]';
  const apply = () => {
    document.querySelectorAll(onlineSelector).forEach(el => {
      if (el.dataset.offlineHandled) return;
      el.dataset.offlineHandled='true';
      el.setAttribute('aria-disabled','true');
      el.title='Unavailable offline. Play matches, tournaments, or practice against the computer.';
      el.style.opacity='.5';
      el.querySelectorAll('span').forEach(span=>{if(span.textContent==='New')span.textContent='Online';});
    });
    const title = document.querySelector('[data-screen="title"]');
    if (title && !document.getElementById('offline-label')) {
      const label=document.createElement('div'); label.id='offline-label';
      label.textContent=/Android/i.test(navigator.userAgent)?'OFFLINE EDITION · SAVED ON THIS PHONE':'OFFLINE EDITION · SAVED ON THIS PC';
      label.style.cssText='position:fixed;left:16px;bottom:10px;font:700 10px system-ui;letter-spacing:1.3px;color:#d4f25a;z-index:50;pointer-events:none;text-shadow:0 1px 3px #10201b';
      title.append(label);
    }
  };
  document.addEventListener('click',e=>{
    const privacy=e.target.closest?.('a[href="/privacy"]');
    if(privacy){e.preventDefault();e.stopImmediatePropagation();alert('Rally Offline stores settings and tournament progress in this browser on your PC. Game assets are served locally. This edition does not send telemetry or connect to the original game service.');return;}
    const target=e.target.closest?.(onlineSelector);
    if (target) {
      e.preventDefault();e.stopImmediatePropagation();
      let toast=document.getElementById('offline-notice');
      if(!toast){toast=document.createElement('div');toast.id='offline-notice';toast.setAttribute('role','status');toast.style.cssText='position:fixed;left:50%;bottom:44px;transform:translateX(-50%);z-index:9999;max-width:90vw;width:390px;background:#10201b;color:white;border:1px solid #d4f25a;border-radius:16px;padding:18px;font:600 14px/1.5 system-ui;box-shadow:0 8px 30px #0009';document.body.append(toast);}
      toast.textContent='This feature needs the online service. Matches, tournaments, and practice work offline against the computer.';
      clearTimeout(window.offlineNoticeTimeout);window.offlineNoticeTimeout=setTimeout(()=>toast.remove(),5000);
    }
  },true);
  document.addEventListener('DOMContentLoaded',()=>{apply();new MutationObserver(apply).observe(document.body,{childList:true,subtree:true});});
})();

