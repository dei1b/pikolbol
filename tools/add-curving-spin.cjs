const fs=require('node:fs'),path=require('node:path'),root=path.resolve(__dirname,'..');let file=path.join(root,'site/_next/static/chunks/0axfra5kwz6z1.js'),s=fs.readFileSync(file,'utf8');
function patch(a,b){if(s.includes(b))return;if(s.split(a).length!==2)throw Error('Missing/ambiguous curved-spin hook '+a.slice(0,80));s=s.replace(a,b);}
patch('function iZ(e,t){let n=[]','function iZ(e,t){if(e.v.spin3&&globalThis.RallySpinPhysics)return RallySpinPhysics.step(e,t,iC);let n=[]');
patch('function iK(e,t){let n=iq','function iK(e,t){if(t.spin3&&globalThis.RallySpinPhysics)return RallySpinPhysics.landing(e,t);let n=iq');
patch('function hW(e,t){let g=','function hW(e,t){if(e.v.spin3&&globalThis.RallySpinPhysics)return RallySpinPhysics.free(e.p,e.v,t);let g=');
patch('function hQ(e,t,n,i){if(!e)return null','function hQ(e,t,n,i){if((e?.v.spin3||t?.v.spin3)&&globalThis.RallySpinPhysics)return RallySpinPhysics.view(e,t,n,i);if(!e)return null');
patch('landingView(e){let t=this.ball','landingView(e){if(this.ball?.v.spin3&&globalThis.RallySpinPhysics)return RallySpinPhysics.guide(this,e,iC);let t=this.ball');
patch('this.trail.spin=l.spin??0,this.trail.build','this.trail.spin=l.spin??0,this.trail.spinKind=l.spinKind,this.trail.build');
patch('globalThis.RallySpin?.trail(r,this.spin,a)','globalThis.RallySpin?.trail(r,this.spin,a,this.spinKind)');
patch('this.ball.rotation.z+=5*a','this.ball.rotation.z+=5*a,this.ball.rotation.y+=(l.spin3?.y??0)*a');
patch('globalThis.RallyProgress?.frame(o,i,n);','globalThis.RallyProgress?.frame(o,i,n);globalThis.RallySpin?.phase(o);');
fs.writeFileSync(file,s);
file=path.join(root,'site/index.html');s=fs.readFileSync(file,'utf8');if(!s.includes('src="/spin-physics.js"'))s=s.replace('<script src="/spin.js"></script>','<script src="/spin-physics.js"></script><script src="/spin.js"></script>');fs.writeFileSync(file,s);
file=path.join(root,'site/game-mods.js');s=fs.readFileSync(file,'utf8').replace('Use the Flat / Topspin / Slice selector before hitting.','Choose Flat, Topspin, Slice or Curve Left / Right before hitting. Curve direction is from the hitter’s view.').replace('Choose Flat, Topspin, Slice or Curve Left / Right before hitting. Curve direction is from the hitter’s view.','Choose Flat, Topspin or Slice during rallies. Curve Left / Right are for serves only, from the hitter’s view, and reset to Flat after serving.');fs.writeFileSync(file,s);console.log('Installed curved spin live/prediction/guide/render hooks');
