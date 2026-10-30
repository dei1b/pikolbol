(() => {
  const ui=()=>globalThis.RallyCareerUI;
  function open(format='singles'){
    const U=ui(),body=U.screen('Rival Ladder'),track=RallyLadder.getTrack(format),switches=U.el('div',null,'career-home');
    for(const f of ['singles','doubles'])switches.append(U.button(f==='singles'?'Singles':'Doubles',()=>open(f),f===format));body.append(switches,U.el('p','Traditional scoring to 11 · win by two. Choose Classic or Blitz pace before each match.'));
    body.append(U.el('p',track.champion?'Champion! Replay any rival to sharpen your skills.':'Each stage brings quicker reactions, better placement and fewer mistakes. Retries keep the same difficulty. Losses never remove progress.','career-muted'));
    for(const stage of RallyLadder.stages){
      const profile=RallyAI.profiles[stage.rivalId],cleared=track.clearedIds.includes(stage.id),available=cleared||track.nextStageId===stage.id,p=U.panel(null);p.classList.add('career-stage');
      const image=U.el('img');image.src='/rally/portraits/'+profile.character+'.png';image.alt='';p.append(image);
      const text=U.el('div');text.append(U.el('h2',stage.id+'. '+profile.name),U.el('p',profile.title+' · '+stage.level),U.el('small',cleared?'Cleared':available?'Next rival':'Locked'));p.append(text);
      const play=U.button(cleared?'Replay':available?'Challenge':'Locked',()=>openStage(stage.id,format),available);play.disabled=!available;play.setAttribute('aria-label',(cleared?'Replay':available?'Challenge':'Locked')+' '+profile.name);p.append(play);body.append(p);
    }
  }
  function setupScreen(options,onPlay,onBack){
    const U=ui(),body=U.screen(options.title,onBack),rival=RallyAI.profiles[options.rivalId],form=U.el('div');let character=0;
    const rivalPanel=rival?U.panel(rival.name+' — '+rival.title,rival.description):null;if(rivalPanel)body.append(rivalPanel);
    body.append(U.el('p',options.mode==='ladder'?'Traditional to 11, win by two. Auto-swing and power-ups are off.':'Three minutes · Blitz pace · Rally scoring. A tied finish goes to one golden rally.'));
    const chars=U.el('div',null,'career-portraits');for(const p of RallyAI.roster){const b=U.button('',()=>{character=p.character;for(const c of chars.children)c.setAttribute('aria-pressed',String(c===b));});b.setAttribute('aria-label','Play as '+p.name);b.setAttribute('aria-pressed',String(p.character===character));const img=U.el('img');img.src='/rally/portraits/'+p.character+'.png';img.alt='';b.append(img,U.el('small',p.name));chars.append(b);}body.append(U.el('h2','Your character'),chars);
    const format=U.select('Match format',[['singles','Singles'],['doubles','Doubles']],options.format??'singles');form.append(format.wrap);format.input.disabled=options.mode==='ladder';
    const partner=U.select('Your partner',[['auto','Automatic partner'],...RallyAI.roster.map(p=>[p.character,p.name])],'auto');form.append(partner.wrap);const updatePartner=()=>partner.wrap.hidden=format.input.value!=='doubles';format.input.onchange=updatePartner;updatePartner();
    const pace=U.select('Match pace',[['classic','Classic'],['blitz','Blitz']],options.pace??'blitz');if(options.mode==='ladder')form.append(pace.wrap);
    const level=U.select('Difficulty',[['easy','Easy'],['normal','Normal'],['hard','Hard']],options.level??'normal');
    const opponent=U.select('Rival',RallyAI.roster.map(p=>[p.id,p.name+' — '+p.title]),options.rivalId??'bea');if(options.mode==='rush'){form.append(opponent.wrap,level.wrap);opponent.input.onchange=()=>{const p=RallyAI.profiles[opponent.input.value];if(rivalPanel){rivalPanel.querySelector('h2').textContent=p.name+' — '+p.title;rivalPanel.querySelector('p').textContent=p.description;}};}
    const court=U.select('Court',Object.entries(RallyScenery.themes).map(([id,t])=>[id,t.name]),RallyScenery.selected),preview=U.el('img',null,'career-court-preview');preview.width=960;preview.height=540;
    const update=()=>{preview.src='/rally/court-previews/'+court.input.value+'.jpg';preview.alt=RallyScenery.themes[court.input.value].name+' court preview';};court.input.onchange=update;update();form.append(court.wrap,preview);
    const error=U.el('p','', 'career-error'),play=U.button('Start '+(options.mode==='ladder'?'challenge':'Blitz Rush'),()=>{try{onPlay({character,partner:Number(partner.input.value),format:format.input.value,pace:options.mode==='rush'?'blitz':pace.input.value,court:court.input.value,level:level.input.value,rivalId:opponent.input.value});}catch(e){error.textContent=e.message;}},true);form.append(error,play);body.append(form);
  }
  function launch(plan){RallyMods.activeBlitz=plan.config.offlinePace==='blitz';ui().close();ui().actions.launch(plan);}
  function openStage(stageId,format){const stage=RallyLadder.stages.find(s=>s.id===stageId);setupScreen({mode:'ladder',title:'Stage '+stageId+' · '+RallyAI.profiles[stage.rivalId].name,format,rivalId:stage.rivalId,level:stage.level},setup=>{const state=RallyLadder.getTrack(format);if(!state.clearedIds.includes(stageId)&&state.nextStageId!==stageId)throw Error('Clear the previous stage first.');launch(RallyLadder.createPlan({...setup,stageId}));},()=>open(format));}
  function mountResults(host,record){const U=ui(),track=RallyLadder.getTrack(record.format);host.append(U.el('p',`Stage ${record.ladderStageId} · ${record.winner===0?'Victory':'Retry when ready'}`));
    if(record.winner===0&&track.nextStageId)host.append(U.button('Next rival',()=>openStage(track.nextStageId,record.format),true));
    else if(record.winner!==0)host.append(U.button('Retry stage',()=>openStage(record.ladderStageId,record.format),true));
    host.append(U.button('View ladder',()=>open(record.format)));}
  globalThis.RallyLadderUI={open,openStage,setupScreen,launch,mountResults};
})();
