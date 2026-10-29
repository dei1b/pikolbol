const {chromium}=require('C:/Users/Dave/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');

(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try {
  const page=await browser.newPage();
  await page.goto('http://127.0.0.1:8787');
  await page.getByRole('button',{name:'Play match',exact:true}).click();
  await page.getByRole('button',{name:'Play match',exact:true}).click();
  await page.waitForFunction(()=>!!globalThis.RallyMods?.engine);
  const result=await page.evaluate(()=>{
   const live=RallyMods.engine,C=live.constructor,failures=[],examples=[];
   let transitions=0;
   for(const format of ['singles','doubles'])for(const scoring of ['traditional','rally'])
   for(const blitz of [false,true])for(const first of [0,1])for(let path=0;path<256;path++){
    RallyMods.activeBlitz=blitz;
    const e=new C({...live.config,format,scoring,toScore:99,seed:123},{computerPlaysLocal:true,firstServingTeam:first});
    const ref={points:[0,0],right:[0,2],serving:first,server:2*first,number:2};
    e.skipIntro();
    for(let turn=0;turn<8;turn++){
     const win=(path>>turn)&1,old=ref.serving;
     let sideOut=false;
     if(win===old){ref.points[win]++;if(format==='doubles')ref.right[win]^=1;}
     else if(scoring==='rally'){
      ref.points[win]++;
      if(format==='doubles')ref.right[win]^=1;
      ref.serving=win;ref.server=format==='doubles'?ref.right[win]:2*win;sideOut=true;
     }else if(format==='doubles'&&ref.number===1){ref.number=2;ref.server^=1;}
     else {ref.serving=win;ref.number=1;ref.server=format==='doubles'?ref.right[win]:2*win;sideOut=true;}
     e.out=[];e.endRally(win,'out');
     // Exercise the actual point reset and beginServe path, including cached spots.
     e.phaseT=10;e.tickPoint();
     const right=format==='singles'?ref.points[ref.serving]%2===0:ref.right[ref.serving]===ref.server;
     const receiver=format==='singles'?2*(1-ref.serving):ref.right[1-ref.serving]^(right?0:1);
     const actual={points:[...e.score.points],right:[...e.score.right],serving:e.score.serving,server:e.setup.server,fromRight:e.setup.fromRight,receiver:e.setup.receiver};
     const expected={points:ref.points.slice(),right:ref.right.slice(),serving:ref.serving,server:ref.server,fromRight:right,receiver};
     transitions++;
     if(JSON.stringify(actual)!==JSON.stringify(expected)){
      if(failures.length<8)failures.push({format,scoring,blitz,first,path,turn,sideOut,actual,expected});
      break;
     }
     if(sideOut&&format==='doubles'&&examples.length<8)examples.push({scoring,team:ref.serving,points:ref.points.slice(),server:ref.server,fromRight:right});
    }
   }
   RallyMods.engine=live;RallyMods.activeBlitz=live.blitz;
   return {transitions,failures,examples};
  });
  fs.writeFileSync('paddleup-offline/serving-check.json',JSON.stringify(result,null,2));
  assert.deepEqual(result.failures,[],JSON.stringify(result.failures[0],null,2));
  console.log(`PASS: ${result.transitions} serving transitions across singles/doubles, both scoring modes, both paces and both starting teams`);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
