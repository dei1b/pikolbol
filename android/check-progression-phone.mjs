// Real WebView smoke/lifecycle/timing check. Requires an adb-forwarded port 9229.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const adb='C:/adb/adb.exe',serial=process.env.RALLY_PHONE_SERIAL;
if(!serial)throw Error('Set RALLY_PHONE_SERIAL to the connected test device');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const targets=await(await fetch('http://127.0.0.1:9229/json/list')).json(),target=targets.find(t=>t.url.startsWith('https://appassets.androidplatform.net'));
if(!target)throw Error('No offline game WebView');
const socket=new WebSocket(target.webSocketDebuggerUrl);await new Promise((r,j)=>{const t=setTimeout(()=>j(Error('Socket timeout')),10000);socket.onopen=()=>{clearTimeout(t);r();};socket.onerror=j;});
let seq=0;const pending=new Map();socket.onmessage=e=>{const m=JSON.parse(e.data);if(pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id);}};
async function call(method,params={}){const id=++seq;return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout '+method));},12000);pending.set(id,m=>{clearTimeout(timer);m.error?reject(Error(m.error.message)):resolve(m.result);});socket.send(JSON.stringify({id,method,params}));});}
async function evaluate(expression){const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.text+' '+r.exceptionDetails.exception?.description);return r.result.value;}
const click=text=>evaluate(`[...document.querySelectorAll('button')].find(e=>e.textContent.trim()===${JSON.stringify(text)})?.click()`);
const checks=[];
async function ready(){for(let i=0;i<80;i++){if(await evaluate("!!globalThis.RallyCareerUI?.actions&&document.querySelector('[data-view]')?.dataset.view!=='loading'"))return;await sleep(500);}throw Error('Game menu did not become ready');}
async function matchReady(mode){for(let i=0;i<80;i++){if(await evaluate(`globalThis.RallyMods?.engine?.config.offlineMode===${JSON.stringify(mode)}&&!!document.querySelector('[data-controls]')`))return;await sleep(500);}throw Error('Match did not become ready: '+mode);}
try{
 await ready();
 await evaluate('RallyCareerUI.openCareer()');assert.equal(await evaluate("document.querySelectorAll('[data-medal]').length"),8);checks.push('Career UI on actual WebView');await evaluate('RallyCareerUI.close()');
 await evaluate(`(()=>{const adapter={getItem:k=>localStorage.getItem('rally.qa.'+k),setItem:(k,v)=>localStorage.setItem('rally.qa.'+k,v)},s=RallyCareer.createStore(adapter),r={id:'qa',mode:'quick',eligible:true,format:'singles',winner:0,points:[11,5],difficulty:'normal',rivalId:'bea',metrics:{}};const a=s.finalizeMatch(r),b=s.finalizeMatch(r);if(!a.saved||!b.duplicate)throw Error('Career transaction failed');if(!s.equip('paddle','paddle-lime').saved)throw Error('Equipment failed');})()`);
 await call('Page.reload');await sleep(2500);await ready();assert.equal(await evaluate("JSON.parse(localStorage.getItem('rally.qa.rally.offline.career.v1')).equipped.paddle"),'paddle-lime');await evaluate("Object.keys(localStorage).filter(k=>k.startsWith('rally.qa.')).forEach(k=>localStorage.removeItem(k))");checks.push('Isolated career reward/equipment persisted after reload; user saves untouched');
 await evaluate("RallyLadderUI.openStage(1,'doubles')");await click('Start challenge');await matchReady('ladder');assert.deepEqual(await evaluate("({scoring:RallyMods.engine.config.scoring,target:RallyMods.engine.config.toScore,stage:RallyMods.engine.config.ladderStageId})"),{scoring:'traditional',target:11,stage:1});checks.push('Actual Ladder launch: Traditional-to-11 doubles');
 await evaluate('RallyCareerUI.actions.home()');await sleep(400);await evaluate('RallyRushUI.open()');await click('Start Blitz Rush');await matchReady('rush');await sleep(2800);
 let info=await evaluate("({remaining:RallyRush.get(RallyMods.engine).remainingSeconds,phase:RallyMods.engine.phase})");assert(info.remaining>175);const before=info.remaining;
 await sleep(1500);const running=await evaluate('RallyRush.get(RallyMods.engine).remainingSeconds');assert(before-running>1.0&&before-running<2.1);
 await evaluate("document.querySelector('button[aria-label=Pause]').click()");const paused=await evaluate('RallyRush.get(RallyMods.engine).remainingSeconds');await sleep(2200);assert.equal(await evaluate('RallyRush.get(RallyMods.engine).remainingSeconds'),paused);await click('Resume');checks.push('Rush real seconds and pause freeze');
 const beforeBackground=await evaluate('RallyRush.get(RallyMods.engine).remainingSeconds');execFileSync(adb,['-s',serial,'shell','input','keyevent','KEYCODE_HOME']);await sleep(2500);execFileSync(adb,['-s',serial,'shell','am','start','-n','ph.paddleup.offline/.MainActivity']);await sleep(800);const resumed=await evaluate('RallyRush.get(RallyMods.engine).remainingSeconds');assert(beforeBackground-resumed<.6);await click('Resume');checks.push('Android background/resume excludes hidden time');
 const hud=await evaluate("document.querySelector('[data-scoreboard]').innerText");assert(/time/i.test(hud));assert(!/call/i.test(hud));checks.push('Rush has one score display and a large clock');
 if(process.argv.includes('--short')){
   await evaluate('RallyCareerUI.actions.home()');console.log('PASS phone smoke',checks);
   fs.writeFileSync(new URL('../phone-progression-smoke-check.json',import.meta.url),JSON.stringify({checks},null,2));
 }else{
 const started=Date.now();let lastLog=0;
 while(Date.now()-started<240000){await sleep(5000);info=await evaluate("({remaining:RallyRush.get(RallyMods.engine).remainingSeconds,phase:RallyMods.engine.phase,result:!!document.querySelector('[data-screen=results]'),matches:RallyCareer.load().totals.matches})");if(Date.now()-lastLog>25000){console.log('Phone Rush',info);lastLog=Date.now();}if(info.result)break;}
 assert(info.result,'Real three-minute Rush should reach results');assert.equal(info.remaining,0);checks.push('Full real-time Rush finished and saved its result');
 console.log('PASS',checks);fs.writeFileSync(new URL('../phone-progression-check.json',import.meta.url),JSON.stringify({checks,elapsedAfterResumeSeconds:(Date.now()-started)/1000,info},null,2));
 }
}finally{socket.close();}
