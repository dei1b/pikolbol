(() => {
  const delta=n=>Math.min(.25,Math.max(0,Number.isFinite(n)?n:0));
  function create(){return{remainingSeconds:180,expired:false,golden:false,finished:false,winner:null,serve:null};}
  function advance(s,{deltaSeconds,paused=false,visible=true,phase}){
    if(s.finished||s.expired||paused||!visible||phase==='intro'||phase==='over')return;
    s.remainingSeconds=Math.max(0,s.remainingSeconds-delta(deltaSeconds));if(s.remainingSeconds<1e-7){s.remainingSeconds=0;s.expired=true;}
  }
  function decision(s,score,after){
    if(s.finished||!s.expired)return{action:'continue',winner:null};
    if(s.golden&&!after)return{action:'golden',winner:null};
    if(score[0]===score[1]){s.golden=true;return{action:'golden',winner:null};}
    s.finished=true;s.winner=score[0]>score[1]?0:1;return{action:'finish',winner:s.winner};
  }
  const afterRally=(s,score)=>decision(s,score,true),betweenRallies=(s,score)=>decision(s,score,false);
  function advanceServe(s,{deltaSeconds,ready,phase,serverId,serveStarted=false,paused=false}){
    if(phase!=='serve'||serveStarted||s.finished){s.serve=null;return{remainingSeconds:5,autoServe:false};}
    if(!s.serve||s.serve.serverId!==serverId)s.serve={serverId,remainingSeconds:5,fired:false};
    const clock=s.serve;if(ready&&!paused)clock.remainingSeconds=Math.max(0,clock.remainingSeconds-delta(deltaSeconds));
    const autoServe=clock.remainingSeconds<1e-7&&!clock.fired;if(autoServe)clock.fired=true;
    return{remainingSeconds:clock.remainingSeconds,autoServe};
  }
  const states=new WeakMap();
  function attach(e){if(e.config.offlineMode!=='rush')return;const state=create();state.previousPhase=e.phase;states.set(e,state);e.blitz=true;e.score.toScore=Number.MAX_SAFE_INTEGER;}
  function step(e,dt,input){
    const state=states.get(e);if(!state||state.finished)return e.step(dt,input);
    advance(state,{deltaSeconds:dt,phase:e.phase,visible:typeof document==='undefined'||!document.hidden});
    if(state.expired&&e.phase!=='rally'&&e.phase!=='intro'&&e.phase!=='over'){
      const choice=betweenRallies(state,e.score.points);
      if(choice.action==='finish'){e.out=[];e.finishTimedMatch(choice.winner);return e.out;}
    }
    return e.step(dt,input);
  }
  function frame(e,events,dt){
    const state=states.get(e);if(!state)return;
    const visible=typeof document==='undefined'||!document.hidden;
    const ends=events.filter(e=>e.kind==='rally-end');
    let choice={action:'continue'};
    if(ends.length)choice=afterRally(state,e.score.points);
    else if(e.phase!=='rally'&&e.phase!=='intro'&&e.phase!=='over')choice=betweenRallies(state,e.score.points);
    if(choice.action==='finish')e.finishTimedMatch(choice.winner);
    const serve=advanceServe(state,{deltaSeconds:visible?dt:0,ready:e.phase==='serve'&&e.serverReady(),phase:e.phase,serverId:e.setup.server,serveStarted:e.serveSwingAt!==null});
    if(serve.autoServe&&e.phase==='serve'&&e.serveSwingAt===null){e.serveChoice={variant:'deep',aim:{x:0,depth:0},quality:1,extra:0};e.startServeSwing(e.player(e.setup.server),'serve');}
    state.previousPhase=e.phase;globalThis.RallyRushUI?.mountServeCountdown(state);
  }
  function label(e){const s=states.get(e);if(!s)return'3:00';if(s.golden&&!s.finished)return'Golden';const n=Math.ceil(s.remainingSeconds);return Math.floor(n/60)+':'+String(n%60).padStart(2,'0');}
  const api={create,advance,afterRally,betweenRallies,advanceServe,attach,step,frame,label,get:e=>states.get(e)};
  globalThis.RallyRush=api;if(typeof module!=='undefined')module.exports=api;
})();
