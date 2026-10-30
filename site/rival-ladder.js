(() => {
  const stages=['bea','migo','tala','paco','isay','jojo','enzo','nika','rafi','maya'].map((rivalId,i)=>({id:i+1,rivalId,level:i<2?'easy':i<6?'normal':'hard'}));
  function getTrack(format,state=globalThis.RallyCareer.load()){
    if(!['singles','doubles'].includes(format))throw Error('Choose singles or doubles.');
    const clearedIds=state.ladder[format].clearedIds.slice(),next=stages.find(s=>!clearedIds.includes(s.id));return{clearedIds,nextStageId:next?.id??null,champion:!next};
  }
  function validateCompletion(r,state=globalThis.RallyCareer.load()){
    const stage=stages.find(s=>s.id===r.ladderStageId);if(!stage||!['singles','doubles'].includes(r.format))return false;
    const track=getTrack(r.format,state),open=track.clearedIds.includes(stage.id)||track.nextStageId===stage.id;
    return open&&r.rivalId===stage.rivalId&&r.difficulty===stage.level&&r.scoring==='traditional'&&r.target===11&&Math.max(...r.points)>=11&&Math.abs(r.points[0]-r.points[1])>=2;
  }
  function makePlan(setup){
    const roster=globalThis.RallyAI.roster,character=Number(setup.character)||0,partner=Number(setup.partner),rival=roster.find(p=>p.id===setup.rivalId)??roster[0];
    const teammate=Number.isInteger(partner)&&partner!==character?partner:(character+1)%roster.length;
    const config={format:setup.format,scoring:setup.scoring,toScore:setup.target,level:setup.level,characters:[character,teammate,rival.character,rival.character],seed:setup.seed??Math.floor(Math.random()*0xffffffff),autoRun:true,autoSwing:false,powerUps:false,offlineMode:setup.mode,offlinePace:setup.pace,offlineCourt:setup.court};
    const local=[roster[character],roster[teammate]],plan={mode:setup.mode,config,teams:[{name:setup.format==='doubles'?local.map(p=>p.name).join(' & '):local[0].name,short:'YOU',characters:[character,teammate],color:'#d4f25a'},{name:rival.name,short:rival.name.toUpperCase(),characters:[rival.character,rival.character],color:'#ff8b6e'}]};
    return globalThis.RallyAI.preparePlan(plan,setup.rivalId);
  }
  function createPlan(setup){const stage=stages.find(s=>s.id===setup.stageId);if(!stage)throw Error('Unknown stage.');const p=makePlan({...setup,mode:'ladder',scoring:'traditional',target:11,level:stage.level,rivalId:stage.rivalId});p.config.ladderStageId=stage.id;return p;}
  const api={stages,getTrack,validateCompletion,createPlan,makePlan};globalThis.RallyLadder=api;if(typeof module!=='undefined')module.exports=api;
})();
