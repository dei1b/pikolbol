(() => {
  function begin(engine,context={}){
    return{engine,context,id:globalThis.crypto?.randomUUID?.()??Date.now()+'-'+Math.random(),abandoned:false,server:null,returned:false,lastLead:0,done:false,
      metrics:{maxDeficit:0,longestRally:0,humanServes:0,humanServiceFaults:0,humanPerfectHits:0,leadChanges:0}};
  }
  function observe(t,events,snapshot){
    if(t.done||t.abandoned)return;
    const human=id=>t.engine.players.some(p=>p.id===id&&p.human);
    if(t.engine.config.autoSwing)t.disqualified=true;
    for(const e of events){
      if(e.kind==='serve'){t.server=t.engine.players.find(p=>p.id===e.player);t.returned=false;if(human(e.player))t.metrics.humanServes++;}
      if(e.kind==='hit'){const p=t.engine.players.find(p=>p.id===e.player);if(t.server&&p?.team!==t.server.team)t.returned=true;if(human(e.player)&&e.quality>=.9)t.metrics.humanPerfectHits++;}
      if(e.kind==='rally-end'){
        t.metrics.longestRally=Math.max(t.metrics.longestRally,e.rallyLength||0);
        if(t.server&&human(t.server.id)&&!t.returned&&e.winner!==t.server.team&&e.reason!=='double-bounce')t.metrics.humanServiceFaults++;
        t.server=null;
      }
    }
    const points=snapshot.score.points;t.metrics.maxDeficit=Math.max(t.metrics.maxDeficit,points[1]-points[0]);
    const lead=Math.sign(points[0]-points[1]);if(lead){if(t.lastLead&&t.lastLead!==lead)t.metrics.leadChanges++;t.lastLead=lead;}
  }
  function finish(t,result){
    const e=t.engine,c=e.config,mode=t.context.mode??c.offlineMode??'quick';
    return{id:t.id,mode,format:c.format,scoring:c.scoring,target:c.toScore,difficulty:c.level,pace:e.blitz?'blitz':'classic',rivalId:c.aiProfiles?.[2]??globalThis.RallyAI?.roster.find(p=>p.character===c.characters?.[2])?.id,
      winner:result.winner,points:result.points,metrics:{...t.metrics},ladderStageId:c.ladderStageId,
      eligible:!t.abandoned&&!t.disqualified&&!c.practice&&!c.powerUps&&!c.autoSwing&&e.players.some(p=>p.human&&p.team===0)&&!e.players.some(p=>p.human&&p.team===1)&&['quick','tournament','ladder','rush'].includes(mode)&&(mode==='rush'||c.toScore>=7)};
  }
  function abandon(t){if(t)t.abandoned=true;}
  const api={begin,observe,finish,abandon};globalThis.RallyMedals=api;if(typeof module!=='undefined')module.exports=api;
  const trackers=new WeakMap();
  globalThis.RallyProgress={
    begin(engine,context){trackers.set(engine,begin(engine,context));globalThis.RallyRush?.attach(engine);},
    frame(engine,events,dt){globalThis.RallyRush?.frame(engine,events,dt);const t=trackers.get(engine);if(t)observe(t,events,engine.snapshot());},
    complete(engine,result){
      const t=trackers.get(engine);if(!t)return result;
      if(!t.done){t.record=finish(t,result);t.award=globalThis.RallyCareer.finalizeMatch(t.record);t.done=true;}
      return{...result,careerAward:t.award,careerRecord:t.record};
    },
    abandon(engine){abandon(trackers.get(engine));},get:engine=>trackers.get(engine)
  };
})();
