const {chromium}=require('C:/Users/Dave/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});try{
 const page=await browser.newPage({viewport:{width:1300,height:950}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8787');await page.getByRole('button',{name:'Play match',exact:true}).click();
 const picker=page.getByLabel('AI opponent',{exact:true});assert.equal(await picker.locator('option').count(),11);
 await picker.selectOption('rafi');assert.match(await page.locator('.rally-ai-description').innerText(),/open corner/);await picker.selectOption('tala');assert.match(await page.locator('.rally-ai-description').innerText(),/lobs/);await picker.selectOption('rafi');
 await page.screenshot({path:'paddleup-offline/ai-selection.png',fullPage:true});
 await page.reload();await page.getByRole('button',{name:'Play match',exact:true}).click();assert.equal(await picker.inputValue(),'rafi');await page.getByRole('button',{name:'Play match',exact:true}).click();await page.waitForSelector('[data-controls]');
 const result=await page.evaluate(()=>{const live=RallyMods.engine,C=live.constructor,results=[];const cfg={...live.config,seed:12345};
  for(const format of ['singles','doubles'])for(const scoring of ['traditional','rally'])for(const pace of [false,true]){
   for(const id of ['bea','migo','tala','paco','isay','jojo','rafi','nika','enzo','maya']){
    RallyMods.activeBlitz=pace;const profiles=['bea','paco',id,id],e=new C({...cfg,format,scoring,level:'normal',aiProfiles:profiles},{computerPlaysLocal:true});const counts={};let ended=0;
    for(let i=0;i<12000;i++){for(const event of e.stepPlayers(1/60,{})){if(event.kind==='hit'&&event.player>=2)counts[event.shot]=(counts[event.shot]||0)+1;if(event.kind==='rally-end')ended++;}if(e.score.winner!==null)break;}
    const finite=e.players.every(p=>[p.p.x,p.p.z,p.v.x,p.v.z].every(Number.isFinite));results.push({id,format,scoring,blitz:pace,ended,shots:counts,points:[...e.score.points],finite});
   }
  }
  const replay=new C({...cfg,seed:9876}),practice=new C({...cfg,practice:true,drill:'dink'}),tournament=new C({...cfg,aiProfiles:undefined,characters:[0,3,2,5]});
  const regression={rematch:replay.players.map(p=>p.mind.personality||'human'),practice:practice.players.every(p=>!p.mind.personality),tournament:tournament.players.map(p=>p.mind.personality||'human')};
  RallyMods.engine=live;RallyMods.activeBlitz=live.blitz;return{live:{profiles:live.players.map(p=>p.mind.personality||'human'),chars:live.config.characters,aiProfiles:live.config.aiProfiles},regression,results};});
 assert.equal(result.live.profiles[2],'rafi');assert.equal(result.live.profiles[3],'isay');assert.equal(result.live.chars[2],1);
 assert.deepEqual(result.regression.rematch,result.live.profiles);assert.equal(result.regression.practice,true);assert.deepEqual(result.regression.tournament,['human','paco','tala','jojo']);
 for(const row of result.results){assert(row.finite,JSON.stringify(row));assert(row.ended>0,JSON.stringify(row));assert(Object.keys(row.shots).length>0,JSON.stringify(row));}
 assert.deepEqual(errors,[]);await page.screenshot({path:'paddleup-offline/ai-match.png'});fs.writeFileSync('paddleup-offline/ai-browser-check.json',JSON.stringify({checks:['Picker lists all profiles','Description changes with selection','Selection persists','Rival and partner in live engine','Rematch retains rival','Practice keeps original drill AI','Tournament characters inherit their styles','80 seeded CPU matches across formats, scoring and paces','No JS errors'],...result,errors},null,2));console.log('PASS: selector, Rafi/Isay team, rematch/practice/tournament, 80 CPU simulations; no errors');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
