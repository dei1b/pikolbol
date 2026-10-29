const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),file=path.join(root,'site/_next/static/chunks/0axfra5kwz6z1.js');let s=fs.readFileSync(file,'utf8');
const backup=path.join(root,'backups/before-ai-personalities');fs.mkdirSync(backup,{recursive:true});if(!fs.existsSync(path.join(backup,path.basename(file))))fs.copyFileSync(file,path.join(backup,path.basename(file)));
function patch(from,to){if(s.includes(to))return;if(!s.includes(from))throw new Error('Missing AI hook: '+from.slice(0,100));s=s.replace(from,to);}
patch('(0,n.jsx)(eU.Z,{title:"Computer",children:', '(0,n.jsx)("div",{"data-ai-picker":true,ref:e=>globalThis.RallyAI?.mountPicker(e)}),(0,n.jsx)(eU.Z,{title:"Difficulty",children:');
patch('onPlay:()=>F(ev(d,h,(0,ec.J)()))','onPlay:()=>{let p=ev(d,h,(0,ec.J)());F(globalThis.RallyAI?.preparePlan(p)??p)}');
patch('}),this.setup=this.planServe()}step(e,t)', '}),globalThis.RallyAI?.configure(this),this.setup=this.planServe()}step(e,t)');
patch('return this.practice&&1===e.team&&"dink"===pi(this.drill)?{...r,type:"dink"}:r}hit(', 'return this.practice&&1===e.team&&"dink"===pi(this.drill)?{...r,type:"dink"}:globalThis.RallyAI?.chooseShot(this,e,t,n,i,r)??r}hit(');
patch('this.afterHit(e,u),c&&iP(', 'this.afterHit(e,u),globalThis.RallyAI?.afterHit(this,e),c&&iP(');
patch('sub:"A gentle hit."','sub:"Slower reactions, wider misses."');
patch('sub:"An even match."','sub:"Balanced reactions and accuracy."');
patch('sub:"Bring your best."','sub:"Quick reactions, precise placement."');
fs.writeFileSync(file,s);
const index=path.join(root,'site/index.html');let html=fs.readFileSync(index,'utf8');if(!html.includes('/ai-personalities.js'))html=html.replace('<script src="/game-mods.js"></script>','<script src="/game-mods.js"></script><script src="/ai-personalities.js"></script>');fs.writeFileSync(index,html);
console.log('AI personality hooks installed');
