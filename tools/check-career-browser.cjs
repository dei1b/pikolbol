const {chromium}=require('C:/Users/Dave/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'),assert=require('node:assert/strict');
(async()=>{
 const b=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try{for(const viewport of [{width:393,height:852},{width:915,height:412}]){
  const p=await b.newPage({viewport,isMobile:true,hasTouch:true}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://127.0.0.1:8787');await p.getByRole('button',{name:'Career & rewards',exact:true}).click();assert.equal(await p.locator('[data-medal]').count(),8);
  await p.getByRole('button',{name:'← Back',exact:true}).click();await p.getByRole('button',{name:'Quick match',exact:true}).click();await p.getByRole('button',{name:'Quick match',exact:true}).click();await p.waitForSelector('[data-controls]');
  await p.evaluate(()=>{
   const e=RallyMods.engine;e.skipIntro();
   for(let i=0;i<11;i++){e.phase='rally';e.out=[];e.endRally(0,'out');if(i<10)RallyProgress.frame(e,e.out,0);}
   const events=e.out.slice(),original=e.step.bind(e);let once=false;e.step=(dt,input)=>{if(!once){once=true;return events;}return original(dt,input);};
  });
  await p.waitForSelector('[data-screen="results"]',{timeout:15000});await p.locator('[data-career-results]').scrollIntoViewIfNeeded();
  const state=await p.evaluate(()=>RallyCareer.load());assert.equal(state.totals.wins,1);assert(state.unlocked.includes('paddle-lime'));
  await p.getByRole('button',{name:'View Career',exact:true}).click();await p.getByRole('button',{name:'Equip Lime paddle',exact:true}).click();
  assert.equal(await p.evaluate(()=>RallyCareer.load().equipped.paddle),'paddle-lime');await p.screenshot({path:'career-equipped-'+viewport.width+'.png'});
  await p.reload();await p.getByRole('button',{name:'Quick match',exact:true}).click();await p.getByRole('button',{name:'Quick match',exact:true}).click();await p.waitForSelector('[data-controls]');
  const materials=await p.evaluate(()=>{const view=RallyScenery.view,player=view.players.get(0),cpu=view.players.get(2);return{different:player.paddle.material!==cpu.paddle.material,geometry:player.paddle.geometry!==cpu.paddle.geometry,scale:player.paddle.scale.toArray(),wins:RallyCareer.load().totals.wins};});
  assert(materials.different);assert(materials.geometry);assert.equal(materials.wins,1);assert.deepEqual(materials.scale,[1,1,1]);assert.deepEqual(errors,[]);await p.close();console.log('PASS Career UI, real results, saved equipment, isolated paddle materials:',viewport.width);
 }}finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
