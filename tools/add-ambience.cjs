const fs=require('node:fs'),path=require('node:path'),root=path.resolve(__dirname,'..');
let f=path.join(root,'site/_next/static/chunks/0axfra5kwz6z1.js'),s=fs.readFileSync(f,'utf8');
function patch(a,b){if(s.includes(b))return;if(s.split(a).length!==2)throw Error('Missing/ambiguous ambience hook '+a.slice(0,60));s=s.replace(a,b);}
patch('let x=m.beginMatch(),v=new ot','let x=m.beginMatch(),ambienceStop=globalThis.RallyAmbience?.begin(m,void 0===h?globalThis.RallyScenery?.selected:"stadium"),v=new ot');
patch('if(b=e,S.current){P=!0;return}P&&(P=!1,U.resumed(D()));','if(b=e,S.current){globalThis.RallyAmbience?.pause();P=!0;return}globalThis.RallyAmbience?.sync();P&&(P=!1,U.resumed(D()));');
patch('x(),E.current=null,T.current=null','ambienceStop?.(),x(),E.current=null,T.current=null');
patch('this.ramp(this.crowdBus?.gain,+!!this.crowdOn,.15)','this.ramp(this.crowdBus?.gain,+!!this.crowdOn*(globalThis.RallyAmbience?.custom?0:1),.15)');
patch('n.gain.value=+!!this.crowdOn,n.connect(this.master)','n.gain.value=+!!this.crowdOn*(globalThis.RallyAmbience?.custom?0:1),n.connect(this.master)');
patch('label:"Crowd sounds",sub:"Cheers, oohs and applause."','label:"Crowd & ambience",sub:"Stadium crowd or your court’s environmental sounds."');
fs.writeFileSync(f,s);
f=path.join(root,'site/umpire-recorded.js');s=fs.readFileSync(f,'utf8');if(!s.includes('RallyAmbience?.duck'))s=s.replace('const audio=current=new Audio(root+files[part]);','globalThis.RallyAmbience?.duck();const audio=current=new Audio(root+files[part]);');fs.writeFileSync(f,s);
f=path.join(root,'site/index.html');s=fs.readFileSync(f,'utf8');if(!s.includes('src="/ambience.js"'))s=s.replace('<script src="/offline.js"></script>','<script src="/offline.js"></script><script src="/ambience.js"></script>');fs.writeFileSync(f,s);
console.log('Installed per-court ambience, master volume, crowd toggle, pause and voice ducking');
