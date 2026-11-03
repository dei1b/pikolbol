const fs=require('node:fs'),path=require('node:path'),root=path.resolve(__dirname,'..');let file=path.join(root,'site/_next/static/chunks/0axfra5kwz6z1.js'),s=fs.readFileSync(file,'utf8');
function patch(a,b){if(s.includes(b))return;if(s.split(a).length!==2)throw Error('Missing/ambiguous LAN hook '+a.slice(0,90));s=s.replace(a,b);}
patch('class p_{stick=null','globalThis.RallyLanKit={Engine:pv,seatView:t$};class p_{stick=null');
patch('globalThis.RallyProgress?.begin(o,{mode:c?', 'globalThis.RallyLan?.attach(o);globalThis.RallyProgress?.begin(o,{mode:c?');
patch('S.current=x,x&&f.clear()','S.current=x,x&&f.clear(),globalThis.RallyLan?.pause(x)');
patch('T.current?.setVoice(_.umpireVoice)},[_,h])','T.current?.setVoice(_.umpireVoice),globalThis.RallyLan?.assists(_.autoRun)},[_,h])');
patch('let i=globalThis.RallyRush?RallyRush.step(o,n,f.take()):o.step(n,f.take());','let i=globalThis.RallyLan?RallyLan.step(o,n,f.take()):globalThis.RallyRush?RallyRush.step(o,n,f.take()):o.step(n,f.take());');
patch('E.current=_,B(),b=performance.now()','E.current=_,B(),globalThis.RallyLan?.loaded(o),b=performance.now()');
patch('globalThis.RallyProgress?.abandon(o),clearInterval(O)','globalThis.RallyProgress?.abandon(o),globalThis.RallyLan?.detach(o),clearInterval(O)');
const completion='A.current(globalThis.RallyProgress?.complete(o,{winner:a.winner,points:[a.score.points[0],a.score.points[1]],stats:o.stats()})??{winner:a.winner,points:[a.score.points[0],a.score.points[1]],stats:o.stats()})';
patch(completion,'(globalThis.RallyLan?.complete(o)||'+completion+')');
fs.writeFileSync(file,s);
file=path.join(root,'site/career-ui.js');s=fs.readFileSync(file,'utf8');if(!s.includes("button('LAN multiplayer'"))s=s.replace("if(globalThis.RallyLadderUI)","if(globalThis.RallyLanUI)host.append(button('LAN multiplayer',()=>RallyLanUI.open()));\n    if(globalThis.RallyLadderUI)");fs.writeFileSync(file,s);
if(!s.includes('RallyLan?.stop(false)'))s=s.replace("e.stopImmediatePropagation();close();","e.stopImmediatePropagation();if(globalThis.RallyLan?.session)RallyLan.stop(false);close();");fs.writeFileSync(file,s);
file=path.join(root,'site/game-mods.js');s=fs.readFileSync(file,'utf8');if(!s.includes('RallyLanUI?.refresh()'))s=s.replace('globalThis.RallySpin?.refresh();','globalThis.RallySpin?.refresh();globalThis.RallyLanUI?.refresh();');fs.writeFileSync(file,s);
file=path.join(root,'site/spin.js');s=fs.readFileSync(file,'utf8').replace("if(p.human)return selected.startsWith('curve-')&&type!=='serve'?'flat':selected;","if(p.human){const choice=p.lanSpin??selected;return choice.startsWith('curve-')&&type!=='serve'?'flat':choice;}").replace("if(p.human&&mode.startsWith('curve-'))select('flat');","if(p.human&&mode.startsWith('curve-')){if(p.lanSpin!==undefined)p.lanSpin='flat';if(!p.lanRemote)select('flat');}");fs.writeFileSync(file,s);
file=path.join(root,'site/index.html');s=fs.readFileSync(file,'utf8');if(!s.includes('src="/lan.js"'))s=s.replace('<script src="/court-labels.js"></script>','<script src="/court-labels.js"></script><script src="/lan-protocol.js"></script><script src="/lan.js"></script><script src="/lan-ui.js"></script><link rel="stylesheet" href="/lan.css">');fs.writeFileSync(file,s);console.log('Installed LAN home, native runner, host/guest input/view and lifecycle hooks');
