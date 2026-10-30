(() => {
  function createPlan(setup){return RallyLadder.makePlan({...setup,mode:'rush',pace:'blitz',scoring:'rally',target:11});}
  function open(){RallyLadderUI.setupScreen({mode:'rush',title:'Blitz Rush',format:'singles',rivalId:'bea',level:'normal'},setup=>RallyLadderUI.launch(createPlan(setup)),()=>RallyCareerUI.close());}
  function mountServeCountdown(state){
    const hint=document.querySelector('[data-serve-hint] > div'),show=state.serve&&!state.finished&&state.serve.remainingSeconds<=3&&state.serve.remainingSeconds>0;
    let el=document.getElementById('rush-serve-countdown');if(!hint||!show){el?.remove();return;}
    if(!el){el=document.createElement('div');el.id='rush-serve-countdown';el.className='career-clock';hint.append(el);}
    const text='Auto-serve in '+Math.ceil(state.serve.remainingSeconds);if(el.textContent!==text)el.textContent=text;
  }
  function mountResults(host,r){const U=RallyCareerUI,best=RallyCareer.load().totals.rushBests[r.format+':'+r.difficulty];
    host.append(U.el('p',`${r.points[0]}–${r.points[1]} · ${r.metrics.leadChanges} lead changes · longest rally ${r.metrics.longestRally}`));
    if(best)host.append(U.el('p','Best winning margin: '+best.bestWinningMargin+' · Rush wins: '+best.wins));
    host.append(U.button('Set up another Rush',open,true));
  }
  globalThis.RallyRushUI={open,createPlan,mountServeCountdown,mountResults};
})();
