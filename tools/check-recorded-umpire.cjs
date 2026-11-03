const {chromium}=require('C:/Users/Dave/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const b=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--autoplay-policy=no-user-gesture-required']});
 try{
  const p=await b.newPage({viewport:{width:915,height:412},hasTouch:true,isMobile:true}),errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(()=>{
   window.umpirePlayed=[];window.deviceCalls=0;
   const Original=Audio;window.Audio=function(url){const a=new Original(url);a.addEventListener('play',()=>umpirePlayed.push({url,volume:a.volume}));return a;};
   speechSynthesis.speak=()=>window.deviceCalls++;
  });
  await p.goto('http://127.0.0.1:8787');await p.waitForFunction(()=>RallyUmpire?.ready);
  const decoded=await p.evaluate(async()=>{
   const root='/rally/umpire-voice/',m=await(await fetch(root+'manifest.json')).json(),ctx=new AudioContext();let count=0;
   for(const file of Object.values(m.files)){const bytes=await(await fetch(root+file)).arrayBuffer(),a=await ctx.decodeAudioData(bytes);if(!a.duration||a.duration>3)throw Error('Bad clip '+file);count++;}
   await ctx.close();return count;
  });assert.equal(decoded,112);
  await p.evaluate(()=>{RallyUmpire.speak('13-12-2',.4);RallyUmpire.speak('Side out',.4);});
  await p.waitForFunction(()=>umpirePlayed.length===4);await p.waitForTimeout(900);
  let played=await p.evaluate(()=>umpirePlayed);assert.deepEqual(played.map(x=>x.url.split('/').pop()),['call-13.mp3','call-12.mp3','call-2.mp3','call-side-out.mp3']);assert(played.every(x=>x.volume===.4));
  await p.evaluate(()=>{RallyUmpire.speak('98-99-1',.4);RallyUmpire.cancel();});await p.waitForTimeout(1200);
  const count=await p.evaluate(()=>umpirePlayed.length);assert(count<=5);
  await p.evaluate(()=>{window.liveUmpireCalls=[];const speak=RallyUmpire.speak;RallyUmpire.speak=(text,volume)=>{liveUmpireCalls.push(text);return speak(text,volume);};});
  await p.getByRole('button',{name:'Quick match',exact:true}).click();await p.getByRole('button',{name:'Quick match',exact:true}).click();await p.waitForSelector('[data-controls]');await p.waitForTimeout(3500);
  const live=await p.evaluate(()=>liveUmpireCalls);
  assert(live.some(text=>/^\d+-\d+(?:-[12])?$/.test(text)),'Live match must send numeric score calls to recordings: '+JSON.stringify(live));
  assert.equal(await p.evaluate(()=>deviceCalls),0);assert.deepEqual(errors,[]);
  console.log('PASS: 112 clips decode, score/call queue, volume, cancellation, live match uses recordings without device TTS; no JS errors');
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
