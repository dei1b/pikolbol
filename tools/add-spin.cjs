const fs=require('node:fs'),path=require('node:path'),root=path.resolve(__dirname,'..');let file=path.join(root,'site/_next/static/chunks/0axfra5kwz6z1.js'),s=fs.readFileSync(file,'utf8');
function patch(a,b){if(s.includes(b))return;if(s.split(a).length!==2)throw Error('Missing/ambiguous spin hook: '+a.slice(0,95));s=s.replace(a,b);}
patch('y:e.y+t.y*n-4.905*n*n,z:e.z+t.z*n','y:e.y+t.y*n-(globalThis.RallySpin?.gravity(t)??9.81)*.5*n*n,z:e.z+t.z*n');
patch('function iq(e,t,n){let i=t*t+19.62*(e-n);if(i<0)return 1/0;let a=(t+Math.sqrt(i))/9.81;', 'function iq(e,t,n,g=9.81){let i=t*t+2*g*(e-n);if(i<0)return 1/0;let a=(t+Math.sqrt(i))/g;');
patch('let n=iq(e.y,t.y,.037);return{t:n','let n=iq(e.y,t.y,.037,globalThis.RallySpin?.gravity(t)??9.81);return{t:n');
patch('function iY(e){return{x:.7*e.x,y:.64*Math.abs(e.y),z:.7*e.z}}','function iY(e){return globalThis.RallySpin?.bounce(e)??{x:.7*e.x,y:.64*Math.abs(e.y),z:.7*e.z}}');
patch('iq(t.y,r.y,.037):1/0','iq(t.y,r.y,.037,globalThis.RallySpin?.gravity(r)??9.81):1/0');
patch('h=r.y-9.81*l','h=r.y-(globalThis.RallySpin?.gravity(r)??9.81)*l');
patch('this.ball=iW(l,_),this.hits++','this.ball=iW(l,_),globalThis.RallySpin?.apply(this,e,this.ball,d?"power":u,p,iC),this.hits++');
patch('this.ball=iW(u,f),this.hits=1','this.ball=iW(u,f),globalThis.RallySpin?.apply(this,c,this.ball,"serve",d.quality,iC),this.hits=1');
patch('t.p.y+t.v.y*e-4.905*e*e-.037','t.p.y+t.v.y*e-(globalThis.RallySpin?.gravity(t.v)??9.81)*.5*e*e-.037');
patch('function hW(e,t){return{p:{x:e.p.x+e.v.x*t,y:e.p.y+e.v.y*t-4.905*t*t,z:e.p.z+e.v.z*t},v:{x:e.v.x,y:e.v.y-9.81*t,z:e.v.z}}}', 'function hW(e,t){let g=globalThis.RallySpin?.gravity(e.v)??9.81;return{p:{x:e.p.x+e.v.x*t,y:e.p.y+e.v.y*t-g*.5*t*t,z:e.p.z+e.v.z*t},v:{...e.v,y:e.v.y-g*t}}}');
patch('t.v.y-(e.v.y-9.81*n)','t.v.y-(e.v.y-(globalThis.RallySpin?.gravity(e.v)??9.81)*n)');
patch('v:{x:hV(r.v.x,s.v.x,a),y:hV(r.v.y,s.v.y,a),z:hV(r.v.z,s.v.z,a)}','v:{...r.v,x:hV(r.v.x,s.v.x,a),y:hV(r.v.y,s.v.y,a),z:hV(r.v.z,s.v.z,a)}');
patch('this.ball.rotation.x+=9*a,this.ball.rotation.z+=5*a','this.ball.rotation.x+=(l.spin?l.spin*22:9)*a,this.ball.rotation.z+=5*a');
patch('this.trail.build(this.now,n,Math.hypot(l.x,l.y,l.z),i,r)','this.trail.spin=l.spin??0,this.trail.build(this.now,n,Math.hypot(l.x,l.y,l.z),i,r)');
patch('}(t,n,a),s=0;for(;s<this.points.length','}(t,n,a),s=0;globalThis.RallySpin?.trail(r,this.spin,a);for(;s<this.points.length');
patch('}(o,l),0,1.2)','}(o,l,.037,globalThis.RallySpin?.gravity(l)??9.81),0,1.2)');
fs.writeFileSync(file,s);
file=path.join(root,'site/game-mods.js');s=fs.readFileSync(file,'utf8');
if(!s.includes("spin:['KeyQ']"))s=s.replace("pause:['Escape','KeyP']","pause:['Escape','KeyP'],spin:['KeyQ']");
if(!s.includes("spin:'Cycle spin'"))s=s.replace("pause:'Pause'","pause:'Pause',spin:'Cycle spin'");
// Migrate older saved key maps by adding the new action, rather than resetting mappings.
if(!s.includes('bindings.spin??='))s=s.replace('  if(!bindings||Object.keys(defaults)',"  if(bindings&&typeof bindings==='object'&&!Array.isArray(bindings)){bindings.spin??=[['KeyQ','KeyR','KeyF','KeyC','KeyV','KeyB','KeyN','KeyU','KeyO'].find(k=>!Object.values(bindings).some(keys=>Array.isArray(keys)&&keys.includes(k)))??'F8'];}\n  if(!bindings||Object.keys(defaults)");
// Upgrade the initial migration hook too, if installed before this tool revision.
s=s.replace('bindings.spin??=[...defaults.spin];',"bindings.spin??=[['KeyQ','KeyR','KeyF','KeyC','KeyV','KeyB','KeyN','KeyU','KeyO'].find(k=>!Object.values(bindings).some(keys=>Array.isArray(keys)&&keys.includes(k)))??'F8'];");
if(!s.includes('RallySpin?.refresh()'))s=s.replace('    let badge=document.getElementById', '    globalThis.RallySpin?.refresh();\n    let badge=document.getElementById');fs.writeFileSync(file,s);
if(!s.includes("panel('Shot spin'"))s=s.replace("      const p=panel('Keyboard controls'","      host.append(panel('Shot spin','Use the Flat / Topspin / Slice selector before hitting. Topspin dips and kicks forward; slice/chop floats and bounces low. Applies to serves, drives, drops and dinks. Lobs and smashes stay flat. Cycle spin with your saved keyboard binding below.'));\n      const p=panel('Keyboard controls'");fs.writeFileSync(file,s);
file=path.join(root,'site/index.html');s=fs.readFileSync(file,'utf8');if(!s.includes('src="/spin.js"'))s=s.replace('<script src="/game-mods.js"></script>','<script src="/game-mods.js"></script><script src="/spin.js"></script><link rel="stylesheet" href="/spin.css">');fs.writeFileSync(file,s);console.log('Installed shared spin physics, contact hooks, predictions and controls');
