const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const site=path.join(__dirname,'../site'),manifest=JSON.parse(fs.readFileSync(path.join(site,'rally/umpire-voice/manifest.json')));
(async()=>{
 const played=[],context={document:{documentElement:{hasAttribute:()=>true}},fetch:async()=>({ok:true,json:async()=>manifest}),Audio:class{
  constructor(url){this.url=url;}play(){played.push(this.url.split('/').pop());queueMicrotask(()=>this.onended());return Promise.resolve();}pause(){this.onpause?.();}
 }};context.globalThis=context;vm.runInNewContext(fs.readFileSync(path.join(site,'umpire-recorded.js'),'utf8'),context);
 await new Promise(r=>setTimeout(r,0));
 const cases={'1-1-1':['1','all','1'],'1-1-2':['1','all','2'],'2-2-1':['2','all','1'],'2-2-2':['2','all','2'],'2-2':['2','all'],'21-21-2':['21','all','2'],'2-3':['2','3'],'0-0-2':['0-0-2']};
 for(const [score,parts]of Object.entries(cases)){
  played.length=0;context.RallyUmpire.speak(score,.5);await new Promise(r=>setTimeout(r,0));
  assert.deepEqual(played,parts.map(p=>'call-'+p+'.mp3'),score);
 }
 console.log('PASS: all eight tied, untied, opening and Rally score cases');
})().catch(e=>{console.error(e);process.exitCode=1;});
