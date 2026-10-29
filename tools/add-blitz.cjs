const fs=require('fs'),path=require('path');
const file=path.resolve(__dirname,'../site/_next/static/chunks/0axfra5kwz6z1.js');let s=fs.readFileSync(file,'utf8');
const backup=path.resolve(__dirname,'../backups/before-blitz');fs.mkdirSync(backup,{recursive:true});if(!fs.existsSync(path.join(backup,path.basename(file))))fs.copyFileSync(file,path.join(backup,path.basename(file)));
function patch(from,to){if(s.includes(to))return;if(!s.includes(from))throw new Error('Missing patch anchor: '+from.slice(0,100));s=s.replace(from,to);}
patch('children:[(0,n.jsx)(eU.Z,{title:"Mode"','children:[(0,n.jsx)("div",{"data-blitz-picker":true,ref:e=>globalThis.RallyMods?.mountMode(e)}),(0,n.jsx)(eU.Z,{title:"Mode"');
patch('onClick:r,children:"Play match"','onClick:()=>{globalThis.RallyMods?.startQuick();r()},children:"Play match"');
patch('"data-settings":!0,children:[','"data-settings":!0,children:[(0,n.jsx)("div",{"data-remap-settings":true,ref:e=>globalThis.RallyMods?.mountControls(e)}),');
patch('this.config=e,this.practice=!!e.practice','this.blitz=!e.practice&&!!globalThis.RallyMods?.activeBlitz,this.config=e,globalThis.RallyMods?.observeEngine(this),this.practice=!!e.practice');
patch('this.acc+=Math.min(Math.max(e,0),.25);','this.acc+=Math.min(Math.max(e,0),.25)*(this.blitz?1.2:1);');
patch('let e=this.practice?1.2:2.2,t=this.practice?.3:1;','let e=this.practice?1.2:this.blitz?1.05:2.2,t=this.practice?.3:this.blitz?.15:1;');
patch('if(t.metaKey||t.ctrlKey||t.altKey)return;let i=t.target','t=globalThis.RallyMods?.keyEvent(t)??t;if(t.metaKey||t.ctrlKey||t.altKey)return;let i=t.target');
patch('n=t=>L(t.code,e)','n=t=>L(globalThis.RallyMods?.codeFor(t.code)??t.code,e)');
fs.writeFileSync(file,s);
const html=path.resolve(__dirname,'../site/index.html');let h=fs.readFileSync(html,'utf8');if(!h.includes('/game-mods.js'))h=h.replace('<script src="/offline.js"></script>','<script src="/offline.js"></script><link rel="stylesheet" href="/game-mods.css"><script src="/game-mods.js"></script>');fs.writeFileSync(html,h);
console.log('Blitz engine and controls hooks installed');
