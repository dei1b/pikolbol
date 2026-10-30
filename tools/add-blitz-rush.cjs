const fs=require('node:fs'),path=require('node:path'),root=path.resolve(__dirname,'..');
let f=path.join(root,'site/_next/static/chunks/0axfra5kwz6z1.js'),s=fs.readFileSync(f,'utf8');
function patch(a,b){if(s.includes(b))return;if(s.split(a).length!==2)throw Error('Missing/ambiguous Rush hook: '+a.slice(0,100));s=s.replace(a,b);}
patch('tick(){switch(this.t+=iN','finishTimedMatch(winner){if(this.phase==="over")return;this.score.winner=winner;this.phase="over";this.phaseT=0;this.out.push({kind:"match-over",winner});this.say("Game")}tick(){switch(this.t+=iN');
patch('let n=Math.min(.1,(e-b)/1e3);if(b=e,S.current)','let n=Math.min(o.config.offlineMode==="rush"?.25:.1,(e-b)/1e3);if(b=e,S.current)');
patch('let i=o.step(n,f.take());globalThis.RallyProgress?.frame(o,i,n);','let i=globalThis.RallyRush?RallyRush.step(o,n,f.take()):o.step(n,f.take());globalThis.RallyProgress?.frame(o,i,n);');
if(!s.includes('children:i.offlineMode==="rush"?"Rush":["to ",i.toScore]')){
 const a=s.indexOf('function a3('),b=s.indexOf('function a5(',a);if(a<0||b<0)throw Error('Scoreboard missing');
 let part=s.slice(a,b);part=part.replace('children:o?"Call":"Final"','children:i.offlineMode==="rush"?"Time":o?"Call":"Final"');
 part=part.replace('children:d}','"data-rush-clock":i.offlineMode==="rush"?true:void 0,children:i.offlineMode==="rush"?(globalThis.RallyRush?.label(globalThis.RallyMods?.engine)??"3:00"):d}');
 part=part.replace('children:["to ",i.toScore]','children:i.offlineMode==="rush"?"Rush":["to ",i.toScore]');s=s.slice(0,a)+part+s.slice(b);
}
patch('w=g?`Tournament \\xb7 ${x}`:', 'w=e.config.offlineMode==="rush"?`Blitz Rush · ${e.config.format} · ${th[e.config.level]} · 3 min`:g?`Tournament \\xb7 ${x}`:');
fs.writeFileSync(f,s);
f=path.join(root,'site/index.html');s=fs.readFileSync(f,'utf8');if(!s.includes('src="/blitz-rush.js"'))s=s.replace('<script src="/rival-ladder-ui.js"></script>','<script src="/rival-ladder-ui.js"></script><script src="/blitz-rush.js"></script><script src="/blitz-rush-ui.js"></script>');fs.writeFileSync(f,s);
f=path.join(root,'site/court-labels.js');s=fs.readFileSync(f,'utf8').replace("engine.blitz?'Blitz':'Classic'","engine.config.offlineMode==='rush'?'Blitz Rush':engine.blitz?'Blitz':'Classic'");fs.writeFileSync(f,s);
console.log('Installed Rush unscaled clock, timed completion and scoreboard clock');

require('./update-scoreboard.cjs');
