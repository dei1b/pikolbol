(() => {
  function clip(points,axis,edge,greater){const out=[];for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],inside=p=>greater?p[axis]>=edge:p[axis]<=edge,A=inside(a),B=inside(b);if(A)out.push(a);if(A!==B){const t=(edge-a[axis])/(b[axis]-a[axis]);out.push([a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])]);}}return out;}
  function get(id){
    const shapes=[],add=(points,color)=>{for(const [axis,edge,greater]of [[0,0,true],[0,100,false],[1,0,true],[1,100,false]]){if(!points.length)return;points=clip(points,axis,edge,greater);}if(points.length>=3)shapes.push({points,color});};
    const rect=(x,y,w,h,c)=>add([[x,y],[x+w,y],[x+w,y+h],[x,y+h]],c);
    const disk=(x,y,r,c,n=20)=>{for(let i=0;i<n;i++){const a=i*2*Math.PI/n,b=(i+1)*2*Math.PI/n;add([[x,y],[x+r*Math.cos(a),y+r*Math.sin(a)],[x+r*Math.cos(b),y+r*Math.sin(b)]],c);}};
    if(id==='paddle-lime')for(const y of [-15,27,69])add([[0,y+35],[100,y],[100,y+12],[0,y+47]],'#173629');
    if(id==='paddle-coral')for(const y of [8,40,72]){add([[0,y],[50,y+23],[50,y+35],[0,y+10]],'#fff1d6');add([[50,y+23],[100,y],[100,y+10],[50,y+35]],'#fff1d6');}
    if(id==='paddle-gold'){for(let i=0;i<12;i++){const a=i*Math.PI/6,b=a+.13;add([[50,50],[50+90*Math.cos(a),50+90*Math.sin(a)],[50+90*Math.cos(b),50+90*Math.sin(b)]],'#765124');}disk(50,50,14,'#fff1b5');}
    if(id==='paddle-midnight')for(const [x,y,r]of [[23,20,9],[72,14,6],[55,42,12],[18,66,7],[80,71,9],[48,89,6]]){const p=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,R=i%2?r*.43:r;p.push([x+Math.cos(a)*R,y+Math.sin(a)*R]);}for(let i=0;i<p.length;i++)add([[x,y],p[i],p[(i+1)%p.length]],'#dcecff');}
    if(id==='paddle-sunset'){disk(65,30,22,'#ffe4a2');rect(0,57,100,10,'#703951');rect(0,73,100,10,'#423553');rect(0,89,100,11,'#21374a');}
    if(id==='paddle-mint')for(let y=0;y<5;y++)for(let x=0;x<4;x++)if((x+y)%2===0)rect(x*25,y*20,25,20,'#246756');
    return shapes;
  }
  function image(id){const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">'+get(id).map(s=>'<polygon points="'+s.points.map(p=>p.join(',')).join(' ')+'" fill="'+s.color+'"/>').join('')+'</svg>';return'url("data:image/svg+xml,'+encodeURIComponent(svg)+'")';}
  globalThis.RallyPaddlePatterns={get,image};if(typeof module!=='undefined')module.exports=globalThis.RallyPaddlePatterns;
})();
