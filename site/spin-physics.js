/* Tuned rigid-ball approximation: SI units, drag and omega cross velocity lift. */
(() => {
  const radius=.037,quantum=1/240,drag=.022,lift=.0025,decay=.18;
  const clone=b=>({p:{...b.p},v:{...b.v,...(b.v.spin3?{spin3:{...b.v.spin3}}:{})},netted:!!b.netted});
  function acceleration(v,w){const d=drag*Math.hypot(v.x,v.y,v.z);return{x:-d*v.x+lift*(w.y*v.z-w.z*v.y),y:-9.81-d*v.y+lift*(w.z*v.x-w.x*v.z),z:-d*v.z+lift*(w.x*v.y-w.y*v.x)};}
  function flight(p,v,dt){const w=v.spin3??{x:0,y:0,z:0},a=acceleration(v,w),half={x:v.x+a.x*dt/2,y:v.y+a.y*dt/2,z:v.z+a.z*dt/2},factor=Math.exp(-decay*dt/2),ah=acceleration(half,{x:w.x*factor,y:w.y*factor,z:w.z*factor}),fade=factor*factor;
    return{p:{x:p.x+half.x*dt,y:p.y+half.y*dt,z:p.z+half.z*dt},v:{...v,x:v.x+ah.x*dt,y:v.y+ah.y*dt,z:v.z+ah.z*dt,spin3:{x:w.x*fade,y:w.y*fade,z:w.z*fade}}};}
  function free(p,v,dt){let state={p:{...p},v:{...v,spin3:{...(v.spin3??{x:0,y:0,z:0})}}};const steps=Math.max(1,Math.ceil(Math.abs(dt)/quantum)),h=dt/steps;for(let i=0;i<steps;i++)state=flight(state.p,state.v,h);return state;}
  function bounce(v){const w=v.spin3??{x:0,y:0,z:0},limit=.5*Math.abs(v.y),clamp=x=>Math.max(-limit,Math.min(limit,x)),dx=clamp(-.35*(v.x+radius*w.z)),dz=clamp(-.35*(v.z-radius*w.x)),restitution=v.spinKind==='slice'?.5:v.spinKind==='topspin'?.66:.61;
    let spin3={x:w.x-2.5*dz/radius,y:w.y*.65,z:w.z+2.5*dx/radius};const old=Math.hypot(w.x,w.y,w.z),size=Math.hypot(spin3.x,spin3.y,spin3.z),factor=size?Math.min(.65*old/size,1):1;spin3={x:spin3.x*factor,y:spin3.y*factor,z:spin3.z*factor};
    return{...v,x:v.x+dx,y:Math.abs(v.y)*restitution,z:v.z+dz,spin3};}
  function step(ball,dt,netHeight=()=>0){if(!Number.isFinite(dt)||dt<=0)return[];const events=[];let left=Math.min(dt,5),elapsed=0,collisions=0;
    while(left>1e-10){const h=Math.min(left,quantum),before={p:ball.p,v:ball.v},next=flight(before.p,before.v,h);let ground=Infinity,net=Infinity;
      if(before.p.y<=radius+1e-10&&before.v.y<=0)ground=0;
      else if(next.p.y<=radius){let low=0,high=h;for(let i=0;i<12;i++){const mid=(low+high)/2;if(flight(before.p,before.v,mid).p.y>radius)low=mid;else high=mid;}ground=high;}
      if(!ball.netted&&before.p.z!==0&&before.p.z*next.p.z<=0){let low=0,high=h;for(let i=0;i<12;i++){const mid=(low+high)/2;if(before.p.z*flight(before.p,before.v,mid).p.z>0)low=mid;else high=mid;}net=high;}
      const collision=Math.min(ground,net);
      if(collision<=h){const hit=flight(before.p,before.v,collision);ball.p=hit.p;ball.v=hit.v;left-=collision;elapsed+=collision;
        if(net<ground){ball.p.z=0;if(ball.p.y-radius<netHeight(ball.p.x)){ball.p.z=(Math.sign(before.p.z)||1)*.047;ball.v={x:0,y:Math.min(ball.v.y,0),z:0};ball.netted=true;events.push({kind:'net',p:{...ball.p},t:elapsed});}}
        else{ball.p.y=radius;ball.v=bounce(ball.v);events.push({kind:'bounce',p:{...ball.p},t:elapsed});if(ball.v.y<.3){ball.v.y=0;break;}}
        if(++collisions>8)break;
      }else{ball.p=next.p;ball.v=next.v;left-=h;elapsed+=h;}
    }return events;
  }
  function landing(p,v){const b=clone({p,v});let elapsed=0;for(let i=0;i<360;i++){const events=step(b,1/60,()=>-1000),hit=events.find(e=>e.kind==='bounce');if(hit)return{t:elapsed+hit.t,p:hit.p};elapsed+=1/60;}return{t:Infinity,p:{...b.p}};}
  function guide(e,team,netHeight){const b=e.ball,sign=team===0?1:-1;if(e.phase!=='rally'||!b||b.netted||e.lastTeam===team||e.bounces>0||sign*b.v.z<=0)return null;const copy=clone(b);for(let i=0;i<360;i++){const events=step(copy,1/60,netHeight);if(events.some(ev=>ev.kind==='net'))return null;const hit=events.find(ev=>ev.kind==='bounce');if(hit)return sign*hit.p.z>0?{x:hit.p.x,z:hit.p.z}:null;}return null;}
  function view(e,t,n,i){if(!e)return null;if(!t||n<=0)return e;const a=Math.max(0,Math.min(1,i/n)),mix=(x,y)=>x+(y-x)*a;return{p:{x:mix(e.p.x,t.p.x),y:mix(e.p.y,t.p.y),z:mix(e.p.z,t.p.z)},v:{...(a<.5?e.v:t.v),x:mix(e.v.x,t.v.x),y:mix(e.v.y,t.v.y),z:mix(e.v.z,t.v.z)},bounces:a<.5?e.bounces:t.bounces};}
  globalThis.RallySpinPhysics={clone,flight,free,step,bounce,landing,guide,view,acceleration};
})();
