/* Shared by live ball physics, predicted contacts and offline controls. */
(() => {
  const modes=['flat','topspin','slice'],labels={flat:'Flat',topspin:'Topspin',slice:'Slice'};
  let selected='flat',engine=null,host=null;
  const strength=v=>Number.isFinite(v?.spin)?Math.max(-1,Math.min(1,v.spin)):0;
  const gravity=v=>9.81+(strength(v)>0?1.8:1.2)*strength(v);
  function bounce(v){const spin=strength(v);if(!spin)return{x:.7*v.x,y:.64*Math.abs(v.y),z:.7*v.z};const forward=.7+(spin>0?.06:.035)*spin,vertical=.64+(spin>0?.015:.14)*spin;return{x:forward*v.x,y:vertical*Math.abs(v.y),z:forward*v.z,spin:spin*.45};}
  function select(mode){selected=modes.includes(mode)?mode:'flat';paint();}
  function choose(e,p,type,quality){
    if(e.practice||!['serve','drive','drop','dink'].includes(type))return'flat';
    if(p.human)return selected;
    const mind=p.mind;if(!mind?.rnd||quality<.35||mind.rnd()>.12+.48*mind.tune.smart)return'flat';
    if(['bea','isay','nika','tala'].includes(mind.personality))return'slice';
    return type==='drive'||type==='serve'?'topspin':'slice';
  }
  function apply(e,p,ball,type,quality,netHeight){
    const mode=choose(e,p,type,quality);if(mode==='flat')return;
    const v=ball.v,amount=.45+.55*Math.max(0,Math.min(1,quality));
    const flight=(v.y+Math.sqrt(v.y*v.y+19.62*Math.max(0,ball.p.y-.037)))/9.81;
    v.spin=mode==='topspin'?amount:-amount;
    // Preserve the intended landing depth, then keep slice arcs above the net margin.
    const g=gravity(v);v.y+=(g-9.81)*flight*.5;
    const crossing=-ball.p.z/v.z;
    if(netHeight&&crossing>0&&crossing<flight){const x=ball.p.x+v.x*crossing,min=netHeight(x)+.037+.08;v.y=Math.max(v.y,(min-ball.p.y+g*crossing*crossing*.5)/crossing);}
  }
  function trail(style,spin,fire){if(fire||!spin)return;style.color=spin>0?'#ffb65c':'#80e6ed';style.tail=spin>0?'#ff713f':'#c7fff0';style.width*=spin>0?.9:1.15;}
  function paint(){if(!host)return;for(const b of host.querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.spin===selected));}
  function refresh(){
    const e=globalThis.RallyMods?.engine,controls=document.querySelector('[data-controls]'),overlay=document.querySelector('[data-match-overlay]');
    if(e!==engine){engine=e;selected='flat';paint();}
    const buttons=[...document.querySelectorAll('button[data-shot]')],hint=document.querySelector('[data-swipe-hint]'),anchors=buttons.length===4?buttons:hint?[hint]:[];
    if(!e||e.practice||!controls||!anchors.length){host?.remove();host=null;return;}
    if(!host){host=document.createElement('div');host.className='rally-spin-picker';host.setAttribute('role','group');host.setAttribute('aria-label','Shot spin');
      for(const mode of modes){const b=document.createElement('button');b.type='button';b.dataset.spin=mode;b.textContent=labels[mode];b.title=mode==='topspin'?'Dips faster, kicks forward':mode==='slice'?'Floats and bounces low':'Standard shot';b.addEventListener('pointerdown',ev=>{ev.stopPropagation();ev.preventDefault();select(mode);});b.addEventListener('click',ev=>{ev.stopPropagation();if(ev.detail===0)select(mode);});host.append(b);}document.body.append(host);paint();}
    host.hidden=overlay?.dataset.paused==='true'||!['intro','serve','rally','point'].includes(e.phase);
    const rects=anchors.map(b=>b.getBoundingClientRect()),left=controls.dataset.leftHanded==='true';
    const edge=Math.min(...rects.map(r=>r.top));host.style.top=Math.max(8,edge-44)+'px';host.style.left=left?'calc(12px + env(safe-area-inset-left))':'auto';host.style.right=left?'auto':'calc(12px + env(safe-area-inset-right))';
  }
  const api={gravity,bounce,select,choose,apply,trail,refresh,get selected(){return selected;}};globalThis.RallySpin=api;
  if(typeof document==='undefined')return;
  document.addEventListener('keydown',ev=>{if(ev.repeat||ev.ctrlKey||ev.altKey||ev.metaKey||ev.target.closest?.('input,select,textarea,[contenteditable=true]'))return;if(globalThis.RallyMods?.keyEvent(ev).code!=='KeyQ')return;const overlay=document.querySelector('[data-match-overlay]');if(!overlay||overlay.dataset.paused==='true'||!engine||engine.practice)return;ev.preventDefault();ev.stopImmediatePropagation();select(modes[(modes.indexOf(selected)+1)%3]);},true);
})();
