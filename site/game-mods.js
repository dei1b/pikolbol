(() => {
  const defaults={up:['KeyW','ArrowUp'],down:['KeyS','ArrowDown'],left:['KeyA','ArrowLeft'],right:['KeyD','ArrowRight'],dink:['KeyJ'],drop:['KeyK'],drive:['KeyL'],lob:['KeyI'],serve:['Space'],dash:['ShiftLeft','ShiftRight'],power:['KeyE'],pause:['Escape','KeyP'],spin:['KeyQ']};
  const names={up:'Move up',down:'Move down',left:'Move left',right:'Move right',dink:'Dink',drop:'Drop',drive:'Drive / smash',lob:'Lob',serve:'Serve',dash:'Dash',power:'Power / partner tag',pause:'Pause',spin:'Cycle spin'};
  const canonical=Object.fromEntries(Object.entries(defaults).map(([a,keys])=>[a,keys[0]]));
  const shots=['drive','dink','drop','lob'];
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}};
  let bindings=read('rally.offline.keys.v1',structuredClone(defaults)),touch=read('rally.offline.touch.v1',shots);
  if(bindings&&typeof bindings==='object'&&!Array.isArray(bindings)){bindings.spin??=[['KeyQ','KeyR','KeyF','KeyC','KeyV','KeyB','KeyN','KeyU','KeyO'].find(k=>!Object.values(bindings).some(keys=>Array.isArray(keys)&&keys.includes(k)))??'F8'];}
  if(!bindings||Object.keys(defaults).some(a=>!Array.isArray(bindings[a])||!bindings[a].length||bindings[a].some(k=>typeof k!=='string')))bindings=structuredClone(defaults);
  if(!Array.isArray(touch)||touch.length!==4||new Set(touch).size!==4||touch.some(s=>!shots.includes(s)))touch=[...shots];
  let mode=read('rally.offline.pace.v1','classic'),capture=null,revision=0;
  const save=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));}catch{}};
  const label=code=>({Space:'Space',ArrowUp:'↑',ArrowDown:'↓',ArrowLeft:'←',ArrowRight:'→',Escape:'Esc',ShiftLeft:'L Shift',ShiftRight:'R Shift'}[code]||code.replace(/^Key|^Digit/,''));
  const codeFor=code=>{for(const a of Object.keys(defaults))if(bindings[a].includes(code))return canonical[a];return Object.values(defaults).flat().includes(code)?'Unbound':code;};
  const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text)e.textContent=text;if(cls)e.className=cls;return e;};
  function panel(title,description){const p=el('section',null,'rally-mod-panel');p.append(el('h2',title),el('p',description));return p;}
  function matchInfoHost(){
    const resume=[...document.querySelectorAll('button')].find(e=>e.textContent.trim()==='Resume');
    return resume?.parentElement??null;
  }
  const mods=globalThis.RallyMods={activeBlitz:false,codeFor,
    matchInfoHost,
    keyEvent(event){if(!event.isTrusted&&event.code==='Escape')return event;return new Proxy(event,{get(target,key){if(key==='code')return codeFor(target.code);const v=Reflect.get(target,key,target);return typeof v==='function'?v.bind(target):v;}});},
    startQuick(){mods.activeBlitz=mode==='blitz';},
    observeEngine(engine){mods.engine=engine;},
    mountMode(host){if(!host||host.childElementCount)return;const descriptions={classic:'Classic: standard game speed and point resets. Choose Traditional or Rally scoring below.',blitz:'Blitz: 20% faster play and quicker point resets. Choose Traditional or Rally scoring below.'};const p=panel('Match pace',descriptions[mode]||descriptions.classic),description=p.querySelector('p');description.setAttribute('aria-live','polite');const opts=el('div',null,'rally-mod-options');
      for(const value of ['classic','blitz']){const b=el('button',value==='classic'?'Classic':'⚡ Blitz');b.type='button';b.setAttribute('aria-pressed',String(mode===value));b.onclick=()=>{mode=value;save('rally.offline.pace.v1',mode);description.textContent=descriptions[mode];for(const x of opts.children)x.setAttribute('aria-pressed',String(x===b));};opts.append(b);}p.append(opts);host.append(p);},
    mountControls(host,category='all'){if(!host||host.childElementCount)return;
      if(category==='display' && globalThis.RallyAppUpdates){
        const app=globalThis.RallyAppUpdates;
        const updates=panel('App version','Installed version: '+app.version());
        const check=el('button','Check for updates');
        check.type='button';
        check.onclick=()=>app.check();
        updates.append(check);
        host.append(updates);
      }
      if(category==='all'||category==='controls')host.append(panel('Shot spin','Choose Flat, Topspin or Slice during rallies. Curve Left / Right are for serves only, from the hitter’s view, and reset to Flat after serving. Topspin dips and kicks forward; slice/chop floats and bounces low. Applies to serves, drives, drops and dinks. Lobs and smashes stay flat. Cycle spin using the binding in Keyboard.'));
      if(category==='all'||category==='keyboard'){
      const p=panel('Keyboard controls','Select an action, then press a key. Assignments are saved on this device. Esc cancels key capture.');p.classList.add('rally-keyboard-panel');const status=el('div',null,'rally-mod-status');status.setAttribute('role','status');
      for(const a of Object.keys(defaults)){const row=el('div',null,'rally-mod-row'),b=el('button',bindings[a].map(label).join(' / '));b.type='button';b.setAttribute('aria-label','Rebind '+names[a]);b.onclick=()=>{if(capture){capture.button.textContent=bindings[capture.action].map(label).join(' / ');}capture={action:a,button:b,status};b.textContent='Press a key…';status.textContent='Press a key for '+names[a]+'.';};row.append(el('span',names[a]),b);p.append(row);}
      const reset=el('button','Reset keyboard defaults');reset.type='button';reset.onclick=()=>{capture=null;bindings=structuredClone(defaults);save('rally.offline.keys.v1',bindings);host.replaceChildren();mods.mountControls(host,category);revision++;refresh();};p.append(status,reset);host.append(p);}
      if(category==='all'||category==='controls'){
      const t=panel('Touch shot positions','Swap the four shot buttons between their existing positions. Movement, left-handed mode, and swipe controls are in Controls.');
      const slots=['Drive position','Dink position','Drop position','Lob position'];
      touch.forEach((shot,index)=>{const row=el('label',null,'rally-mod-row'),select=el('select');select.setAttribute('aria-label',slots[index]);for(const s of shots){const o=el('option',names[s]);o.value=s;select.append(o);}select.value=shot;select.onchange=()=>{const other=touch.indexOf(select.value);[touch[index],touch[other]]=[touch[other],touch[index]];save('rally.offline.touch.v1',touch);host.replaceChildren();mods.mountControls(host,category);revision++;refresh();};row.append(el('span',slots[index]),select);t.append(row);});
      const resetTouch=el('button','Reset touch positions');resetTouch.type='button';resetTouch.onclick=()=>{touch=[...shots];save('rally.offline.touch.v1',touch);host.replaceChildren();mods.mountControls(host,category);revision++;refresh();};t.append(resetTouch);host.append(t); }
    }
  };
  document.addEventListener('keydown',event=>{
    if(!capture)return;
    if(!document.contains(capture.button)){capture=null;return;}
    event.preventDefault();event.stopImmediatePropagation();
    if(event.code==='Escape'){capture.button.textContent=bindings[capture.action].map(label).join(' / ');capture.status.textContent='Cancelled.';capture=null;return;}
    if(event.repeat)return;
    if(event.ctrlKey||event.altKey||event.metaKey||['MetaLeft','MetaRight','ControlLeft','ControlRight','AltLeft','AltRight','Tab'].includes(event.code)){capture.status.textContent='Choose a key without Ctrl, Alt, or Command. Tab is reserved for navigation.';return;}
    const used=Object.keys(bindings).find(a=>a!==capture.action&&bindings[a].includes(event.code));
    if(used){capture.status.textContent=label(event.code)+' is already assigned to '+names[used]+'. Choose another key.';return;}
    bindings[capture.action]=[event.code];save('rally.offline.keys.v1',bindings);capture.button.textContent=label(event.code);capture.status.textContent=names[capture.action]+' saved.';capture=null;revision++;refresh();
  },true);
  // React owns the host elements; this module owns their contents and the touch transforms.
  function refresh(){
    const overlay=document.querySelector('[data-match-overlay]');
    globalThis.RallyAI?.refreshMatchInfo();globalThis.RallyCourtLabels?.update(mods.engine);
    globalThis.RallySpin?.refresh();globalThis.RallyLanUI?.refresh();
    let badge=document.getElementById('rally-blitz-badge');
    badge?.remove();
    const buttons=[...document.querySelectorAll('[data-shot]')].filter(b=>b.tagName==='BUTTON');
    if(buttons.length!==4)return;
    const version=revision+':'+innerWidth+':'+innerHeight+':'+(document.querySelector('[data-controls]')?.getAttribute('data-left-handed'));
    if(buttons.every(b=>b.dataset.remapVersion===version))return;
    for(const b of buttons)b.style.transform='';
    const byShot=Object.fromEntries(buttons.map(b=>[b.getAttribute('data-shot'),b]));
    if(shots.some(s=>!byShot[s]))return;
    const boxes=shots.map(s=>byShot[s].getBoundingClientRect());
    touch.forEach((shot,slot)=>{const b=byShot[shot],from=boxes[shots.indexOf(shot)],to=boxes[slot];b.style.transform=`translate(${to.x+to.width/2-from.x-from.width/2}px,${to.y+to.height/2-from.y-from.height/2}px)`;b.dataset.remapVersion=version;});
    for(const s of shots){const b=byShot[s];b.setAttribute('aria-label',names[s]+' (key '+bindings[s].map(label).join(' / ')+')');for(const k of b.querySelectorAll('kbd,span.absolute')){const text=bindings[s].map(label).join('/');if(k.textContent!==text)k.textContent=text;}}
  }
  document.addEventListener('click',event=>{if(event.target.closest?.('[data-screen="title"] button'))mods.activeBlitz=false;},true);
  document.addEventListener('DOMContentLoaded',()=>{new MutationObserver(refresh).observe(document.body,{subtree:true,childList:true});refresh();});
  window.addEventListener('resize',()=>{revision++;refresh();});
})();

