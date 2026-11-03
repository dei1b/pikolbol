const {chromium}=require('C:/Users/Dave/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'),assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});try{
 const p=await b.newPage({viewport:{width:915,height:412},isMobile:true,hasTouch:true});
 for(const format of ['Singles','Doubles'])for(const scoring of ['Traditional','Rally'])for(const pace of ['Classic','Blitz']){
  await p.goto('http://127.0.0.1:8787');await p.getByRole('button',{name:'Quick match',exact:true}).click();await p.getByText(format,{exact:true}).click();await p.getByText(scoring,{exact:true}).click();await p.getByRole('button',{name:new RegExp(pace)}).click();await p.getByRole('button',{name:'Quick match',exact:true}).click();await p.waitForSelector('[data-scoreboard]');
  const text=await p.locator('[data-scoreboard]').innerText();assert(!/call/i.test(text));assert(!/0-0/.test(text));assert(new RegExp(pace,'i').test(text));assert(/to\s*11/i.test(text));assert(new RegExp(scoring==='Traditional'?'side-out':'rally','i').test(text));
  if(format==='Doubles'&&scoring==='Traditional'&&pace==='Blitz')await p.screenshot({path:'scoreboard-clean.png'});
 }
 console.log('PASS single score display across eight format/scoring/pace combinations, serving indication retained');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
