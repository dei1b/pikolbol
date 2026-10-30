const fs=require('node:fs'),path=require('node:path'),root=path.resolve(__dirname,'..'),file=path.join(root,'site/_next/static/chunks/0axfra5kwz6z1.js');
let s=fs.readFileSync(file,'utf8');
function patch(from,to){if(s.includes(to))return;if(s.split(from).length!==2)throw Error('Missing/ambiguous career hook: '+from.slice(0,80));s=s.replace(from,to);}
patch(',d=null,m=ie();m.setVolume(s.volume)',',d=null,m=ie();globalThis.RallyProgress?.begin(o,{mode:c?"tournament":e.offlineMode??"quick"});m.setVolume(s.volume)');
if(!s.includes('let i=globalThis.RallyRush?'))patch('let i=o.step(n,f.take()),a=o.snapshot();_.frame(a,i,n);','let i=o.step(n,f.take());globalThis.RallyProgress?.frame(o,i,n);let a=o.snapshot();_.frame(a,i,n);');
patch('A.current({winner:a.winner,points:[a.score.points[0],a.score.points[1]],stats:o.stats()})','A.current(globalThis.RallyProgress?.complete(o,{winner:a.winner,points:[a.score.points[0],a.score.points[1]],stats:o.stats()})??{winner:a.winner,points:[a.score.points[0],a.score.points[1]],stats:o.stats()})');
patch('a=!0,clearInterval(O),window.removeEventListener("pagehide",F)','a=!0,globalThis.RallyProgress?.abandon(o),clearInterval(O),window.removeEventListener("pagehide",F)');
patch('H=(0,n.jsx)(tD,{wins:u','H=(globalThis.RallyCareerUI?.bind({launch:F,home:()=>U("title")}), (0,n.jsx)(tD,{wins:u');
patch('onPark:c?()=>I():void 0}),G=null','onPark:c?()=>I():void 0})),G=null');
patch('children:"Play match"}),(0,n.jsx)(eU.h,{tone:"white",size:"lg",icon:"trophy"','children:"Play match"}),(0,n.jsx)("div",{"data-career-home":true,ref:e=>globalThis.RallyCareerUI?.mountHome(e)}),(0,n.jsx)(eU.h,{tone:"white",size:"lg",icon:"trophy"');
patch('children:h}),(0,n.jsxs)("div",{className:`${eU.X} animate-pop divide-y divide-white/8`','children:h}),(0,n.jsx)("div",{"data-career-results":true,ref:h=>globalThis.RallyCareerUI?.mountResults(h,t.careerAward,t.careerRecord)}),(0,n.jsxs)("div",{className:`${eU.X} animate-pop divide-y divide-white/8`');
patch('this.players.set(t,o),this.playerGroup.add(o.root)','this.players.set(t,o),this.playerGroup.add(o.root),globalThis.RallyEquipment?.apply(o,t,i)');
patch('frame(e,t,n){let i=Math.min(Math.max(n,0),.1);','frame(e,t,n){globalThis.RallyEquipment?.frame(this,e);let i=Math.min(Math.max(n,0),.1);');
patch('dispose(){let e=new Set;for(let t of(this.model.traverse','dispose(){globalThis.RallyEquipment?.dispose(this);let e=new Set;for(let t of(this.model.traverse');
fs.writeFileSync(file,s);console.log('Installed Career match, result, menu and equipment hosts');
