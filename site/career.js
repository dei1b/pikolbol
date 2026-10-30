(() => {
  'use strict';
  const KEY='rally.offline.career.v1',clone=v=>JSON.parse(JSON.stringify(v));
  const items=[
    {id:'paddle-default',name:'Original',color:null},
    {id:'paddle-lime',name:'Lime',color:'#D4F25A'}, {id:'paddle-coral',name:'Coral',color:'#FF8B6E'},
    {id:'paddle-gold',name:'Gold',color:'#E7B64D'}, {id:'paddle-midnight',name:'Midnight',color:'#243B67'},
    {id:'paddle-sunset',name:'Sunset',color:'#DB7956'}, {id:'paddle-mint',name:'Mint',color:'#9CF2C2'},
    {id:'badge-precision',name:'Precision',icon:'◎'}, {id:'badge-competitor',name:'Competitor',icon:'★'}
  ];
  const medals=[
    {id:'first-victory',name:'First victory',description:'Win your first completed CPU match.',reward:'paddle-lime',test:(r,s)=>r.winner===0&&s.totals.wins>=1},
    {id:'finding-form',name:'Finding form',description:'Win five completed CPU matches.',reward:'paddle-coral',test:(r,s)=>s.totals.wins>=5},
    {id:'rival-collector',name:'Rival collector',description:'Beat three different lead rivals.',reward:'paddle-gold',test:(r,s)=>Object.keys(s.rivalWins).length>=3},
    {id:'long-rally',name:'Long rally',description:'Complete a match with a rally of 15 contacts.',reward:'paddle-midnight',test:r=>r.metrics.longestRally>=15},
    {id:'comeback',name:'Comeback',description:'Win after trailing by four points.',reward:'paddle-sunset',test:r=>r.winner===0&&r.metrics.maxDeficit>=4},
    {id:'clean-server',name:'Clean server',description:'Complete five human serves with no service faults in one match.',reward:'paddle-mint',test:r=>r.metrics.humanServes>=5&&r.metrics.humanServiceFaults===0},
    {id:'sweet-spot',name:'Sweet spot',description:'Make five perfect human contacts in one completed match.',reward:'badge-precision',test:r=>r.metrics.humanPerfectHits>=5},
    {id:'hard-earned',name:'Hard-earned',description:'Win against Hard CPU opponents.',reward:'badge-competitor',test:r=>r.winner===0&&r.difficulty==='hard'}
  ];
  function empty(){return{version:1,medals:{},totals:{matches:0,wins:0,rushBests:{}},rivalWins:{},unlocked:['paddle-default'],equipped:{paddle:'paddle-default',badge:null},ladder:{singles:{clearedIds:[]},doubles:{clearedIds:[]}},receipts:[]};}
  const knownItem=id=>items.some(i=>i.id===id)||/^ladder-(singles|doubles)-(stage-[36]|champion)$/.test(id);
  const validInt=n=>Number.isSafeInteger(n)&&n>=0;
  const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
  function validate(s){
    if(!object(s)||!object(s.medals)||!object(s.totals)||!object(s.rivalWins)||!object(s.equipped)||!object(s.ladder)||!object(s.totals.rushBests??{}))throw Error('Invalid career object');
    if(Object.entries(s.medals).some(([id,v])=>!medals.some(m=>m.id===id)||v!==true)||Object.values(s.rivalWins).some(v=>!validInt(v)))throw Error('Invalid medal data');
    for(const [key,best]of Object.entries(s.totals.rushBests??{}))if(!/^(singles|doubles):(easy|normal|hard)$/.test(key)||!object(best)||['wins','bestWinningMargin','longestRally','leadChanges'].some(k=>!validInt(best[k])))throw Error('Invalid Rush best');
    if(!s||s.version!==1||!s.medals||!s.totals||!validInt(s.totals.wins)||!validInt(s.totals.matches)||!s.rivalWins||!Array.isArray(s.unlocked)||s.unlocked.some(i=>!knownItem(i))||!s.equipped||!s.unlocked.includes(s.equipped.paddle)||!Array.isArray(s.receipts)||s.receipts.length>200||s.receipts.some(x=>typeof x!=='string')||!s.ladder)throw Error('Invalid career save');
    for(const format of ['singles','doubles'])if(!Array.isArray(s.ladder[format]?.clearedIds)||s.ladder[format].clearedIds.some(n=>!Number.isInteger(n)||n<1||n>10))throw Error('Invalid ladder save');
    if(s.equipped.badge&&!s.unlocked.includes(s.equipped.badge))throw Error('Invalid badge');
    s.totals.rushBests??={};return s;
  }
  function createStore(storage){
    let state=null,lastError=null;
    function load(){
      if(!state){try{const raw=storage.getItem(KEY);try{state=raw?validate(JSON.parse(raw)):empty();}catch{if(raw)storage.setItem(KEY+'.backup',raw);state=empty();}}catch{state=empty();lastError='Career storage is unavailable.';}}
      return clone(state);
    }
    function commit(next){try{storage.setItem(KEY,JSON.stringify(next));state=next;lastError=null;return{saved:true};}catch{lastError='Progress could not be saved. Free device storage and try again.';return{saved:false,error:lastError};}}
    function finalizeMatch(record){
      const s=load(),none={saved:true,duplicate:false,newMedalIds:[],newItemIds:[]};
      if(!record?.eligible||!record.id||![0,1].includes(record.winner)||!Array.isArray(record.points)||record.points.length!==2||record.points.some(n=>!validInt(n)))return{...none,ignored:true};
      if(s.receipts.includes(record.id))return{...none,duplicate:true};
      if(record.mode==='ladder'&&!globalThis.RallyLadder?.validateCompletion(record,s))return{...none,ignored:true};
      const r={...record,metrics:record.metrics||{}},newMedalIds=[],before=new Set(s.unlocked);
      s.totals.matches++;if(r.winner===0){s.totals.wins++;if(r.rivalId)s.rivalWins[r.rivalId]=(s.rivalWins[r.rivalId]||0)+1;}
      for(const m of medals)if(!s.medals[m.id]&&m.test(r,s)){s.medals[m.id]=true;newMedalIds.push(m.id);if(!s.unlocked.includes(m.reward))s.unlocked.push(m.reward);}
      if(r.mode==='ladder'&&r.winner===0){
        const ids=s.ladder[r.format].clearedIds;if(!ids.includes(r.ladderStageId))ids.push(r.ladderStageId);
        if([3,6,10].includes(r.ladderStageId)){const badge=`ladder-${r.format}-${r.ladderStageId===10?'champion':'stage-'+r.ladderStageId}`;if(!s.unlocked.includes(badge))s.unlocked.push(badge);}
      }
      if(r.mode==='rush'){
        const key=r.format+':'+r.difficulty,b=s.totals.rushBests[key]??{wins:0,bestWinningMargin:0,longestRally:0,leadChanges:0};
        if(r.winner===0){b.wins++;b.bestWinningMargin=Math.max(b.bestWinningMargin,r.points[0]-r.points[1]);}
        b.longestRally=Math.max(b.longestRally,r.metrics.longestRally||0);b.leadChanges=Math.max(b.leadChanges,r.metrics.leadChanges||0);s.totals.rushBests[key]=b;
      }
      s.receipts.push(r.id);s.receipts=s.receipts.slice(-200);
      const result=commit(s);return{...result,duplicate:false,newMedalIds:result.saved?newMedalIds:[],newItemIds:result.saved?s.unlocked.filter(x=>!before.has(x)):[]};
    }
    function equip(slot,id){const s=load();if(!['paddle','badge'].includes(slot)||!s.unlocked.includes(id)||!knownItem(id)||(slot==='paddle')!==id.startsWith('paddle-'))return{saved:false,error:'Earn this item before equipping it.'};s.equipped[slot]=id;return commit(s);}
    function clearBadge(){const s=load();s.equipped.badge=null;return commit(s);}
    return{load,finalizeMatch,equip,clearBadge,equipment(){if(!state)load();return{...state.equipped};},get error(){return lastError;}};
  }
  let storage;try{storage=globalThis.localStorage;}catch{}
  const api=Object.assign(createStore(storage??{getItem:()=>null,setItem:()=>{throw Error('Unavailable');}}),{createStore,medals,items,key:KEY});
  globalThis.RallyCareer=api;if(typeof module!=='undefined')module.exports=api;
})();
