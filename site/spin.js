/* Shared by live ball physics, predicted contacts and offline controls. */
(() => {
  const modes=['flat','topspin','slice','curve-left','curve-right'],labels={flat:'Flat',topspin:'Topspin',slice:'Slice','curve-left':'↶ Left','curve-right':'Right ↷'};
  let selected='flat',engine=null,host=null,previousPhase=null;
  const strength=v=>Number.isFinite(v?.spin)?Math.max(-1,Math.min(1,v.spin)):0;
  const gravity=v=>9.81+(strength(v)>0?1.8:1.2)*strength(v);
  function bounce(v){const spin=strength(v);if(!spin)return{x:.7*v.x,y:.64*Math.abs(v.y),z:.7*v.z};const forward=.7+(spin>0?.06:.035)*spin,vertical=.64+(spin>0?.015:.14)*spin;return{x:forward*v.x,y:vertical*Math.abs(v.y),z:forward*v.z,spin:spin*.45};}
  function select(mode){selected=modes.includes(mode)?mode:'flat';paint();}
  function choose(e,p,type,quality){
    if(e.practice||!['serve','drive','drop','dink'].includes(type))return'flat';
    if(p.human)return selected.startsWith('curve-')&&type!=='serve'?'flat':selected;
    const mind=p.mind;if(!mind?.rnd||quality<.35||mind.rnd()>.12+.48*mind.tune.smart)return'flat';
    if(type==='serve'&&['rafi','maya','tala'].includes(mind.personality)&&mind.rnd()<.45)return mind.rnd()<.5?'curve-left':'curve-right';
    if(['bea','isay','nika','tala'].includes(mind.personality))return'slice';
    return type==='drive'||type==='serve'?'topspin':'slice';
  }
  function apply(e,p,ball,type,quality,netHeight){
    const mode=choose(e,p,type,quality),P=globalThis.RallySpinPhysics;if(mode==='flat'||!P)return;
    const v=ball.v,amount=.45+.55*Math.max(0,Math.min(1,quality)),speed=Math.hypot(v.x,v.z)||1;
    let time=(v.y+Math.sqrt(v.y*v.y+19.62*Math.max(0,ball.p.y-.037)))/9.81;
    const target={x:ball.p.x+v.x*time,y:.037,z:ball.p.z+v.z*time},omega=90*amount;
    v.spin=mode==='slice'?-amount:amount;v.spinKind=mode;
    v.spin3=mode.startsWith('curve-')?{x:0,y:(mode==='curve-left'?1:-1)*omega,z:0}:{x:v.z/speed*omega*(mode==='slice'?-1:1),y:0,z:-v.x/speed*omega*(mode==='slice'?-1:1)};
    // Aim remains the intended endpoint, including the original placement errors.
    for(let arc=0;arc<3;arc++){
      v.x=(target.x-ball.p.x)/time;v.z=(target.z-ball.p.z)/time;v.y=(target.y-ball.p.y+4.905*time*time)/time;
      for(let i=0;i<4;i++){const end=P.free(ball.p,v,time).p;v.x+=(target.x-end.x)/time;v.y+=(target.y-end.y)/time;v.z+=(target.z-end.z)/time;}
      if(!netHeight||Math.sign(ball.p.z)===Math.sign(target.z))break;
      const copy=P.clone(ball);let cleared=true;
      for(let t=0;t<time;t+=1/60){if(P.step(copy,Math.min(1/60,time-t),x=>netHeight(x)+.06).some(ev=>ev.kind==='net')){cleared=false;break;}}
      if(cleared)break;time*=1.08;
    }
    if(p.human&&mode.startsWith('curve-'))select('flat');
  }
  function trail(style,spin,fire,kind){if(fire||!spin)return;if(kind?.startsWith('curve-')){style.color=kind==='curve-left'?'#c6adff':'#fface1';style.tail='#f5eaff';style.seconds=Math.max(style.seconds,.42);style.width*=1.05;return;}style.color=spin>0?'#ffb65c':'#80e6ed';style.tail=spin>0?'#ff713f':'#c7fff0';style.width*=spin>0?.9:1.15;}
  function paint(){if(!host)return;for(const b of host.querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.spin===selected));}
  function refresh(){
    const e=globalThis.RallyMods?.engine,controls=document.querySelector('[data-controls]'),overlay=document.querySelector('[data-match-overlay]');
    if(e!==engine){engine=e;selected='flat';paint();}
    const canCurve=e?.phase==='intro'||e?.phase==='serve';
    if(!canCurve&&selected.startsWith('curve-')){selected='flat';paint();}
    const buttons=[...document.querySelectorAll('button[data-shot]')],hint=document.querySelector('[data-swipe-hint]'),anchors=buttons.length===4?buttons:hint?[hint]:[];
    if(!e||e.practice||!controls||!anchors.length){host?.remove();host=null;return;}
    if(!host){host=document.createElement('div');host.className='rally-spin-picker';host.setAttribute('role','group');host.setAttribute('aria-label','Shot spin');
      for(const mode of modes){const b=document.createElement('button');b.type='button';b.dataset.spin=mode;b.textContent=labels[mode];b.setAttribute('aria-label',mode.startsWith('curve-')?'Curve '+mode.slice(6):labels[mode]);b.title=mode==='topspin'?'Dips faster, kicks forward':mode==='slice'?'Floats and bounces low':mode.startsWith('curve-')?'Curves '+mode.slice(6)+' from the hitter’s view':'Standard shot';b.addEventListener('pointerdown',ev=>{ev.stopPropagation();ev.preventDefault();select(mode);});b.addEventListener('click',ev=>{ev.stopPropagation();if(ev.detail===0)select(mode);});host.append(b);}document.body.append(host);paint();}
    for(const b of host.querySelectorAll('button'))if(b.dataset.spin.startsWith('curve-')){b.disabled=!canCurve;b.title=canCurve?'Serve curves '+b.dataset.spin.slice(6)+' from the hitter’s view':'Curve spin is available on serves only';}
    host.hidden=overlay?.dataset.paused==='true'||!['intro','serve','rally','point'].includes(e.phase);
    const rects=anchors.map(b=>b.getBoundingClientRect()),left=controls.dataset.leftHanded==='true';
    const edge=Math.min(...rects.map(r=>r.top));host.style.top=Math.max(8,edge-44)+'px';host.style.left=left?'calc(12px + env(safe-area-inset-left))':'auto';host.style.right=left?'auto':'calc(12px + env(safe-area-inset-right))';
  }
  function phase(e){if(e.phase!==previousPhase){previousPhase=e.phase;refresh();}}
  const api={gravity,bounce,select,choose,apply,trail,refresh,phase,get selected(){return selected;}};globalThis.RallySpin=api;
  if(typeof document==='undefined')return;
  document.addEventListener('keydown',ev=>{if(ev.repeat||ev.ctrlKey||ev.altKey||ev.metaKey||ev.target.closest?.('input,select,textarea,[contenteditable=true]'))return;if(globalThis.RallyMods?.keyEvent(ev).code!=='KeyQ')return;const overlay=document.querySelector('[data-match-overlay]');if(!overlay||overlay.dataset.paused==='true'||!engine||engine.practice)return;ev.preventDefault();ev.stopImmediatePropagation();const available=engine.phase==='intro'||engine.phase==='serve'?modes:modes.slice(0,3);select(available[(available.indexOf(selected)+1)%available.length]);},true);
})();
