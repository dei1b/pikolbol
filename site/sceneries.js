/* Local scenery geometry; gameplay coordinates and physics remain in the game engine. */
(() => {
  const themes={
    stadium:{name:'Championship stadium',description:'The original packed arena and center court.'},
    beach:{name:'Palm Beach',description:'A bright seaside hard court, with palms, sand and turquoise water.'},
    rooftop:{name:'Sunset Rooftop',description:'A city roof court with safety rails, a skyline and warm sunset lighting.'},
    night:{name:'Neon Night Court',description:'An outdoor court under floodlights, with cyan and violet accents against a dark sky.'}
  };
  let selected='stadium';try{const saved=localStorage.getItem('rally.offline.scenery.v1');if(themes[saved])selected=saved;}catch{}
  function mount(host){
    if(!host||host.childElementCount)return;
    const panel=document.createElement('section');panel.className='rally-mod-panel';
    const title=document.createElement('h2');title.textContent='Scenery';
    const select=document.createElement('select');select.className='rally-ai-select';select.setAttribute('aria-label','Scenery');
    for(const [id,theme]of Object.entries(themes)){const o=document.createElement('option');o.value=id;o.textContent=theme.name;select.append(o);}select.value=selected;
    const description=document.createElement('p');description.setAttribute('aria-live','polite');description.className='rally-scenery-description';
    const update=()=>description.textContent=themes[selected].description+' Applied when you start a new match or drill.';
    select.onchange=()=>{selected=select.value;try{localStorage.setItem('rally.offline.scenery.v1',selected);}catch{}update();};update();panel.append(title,select,description);host.append(panel);
  }
  function makeVenue(options,K){
    const id=selected,theme=themes[id],group=new K.Group();group.name='scenery-'+id;group.userData.scenery=id;
    const geometries=[],materials=[],textures=[],batches=new Map();let disposed=false;
    const palettes={beach:{sky:'#9dd9e7',floor:'#d8be8b',outer:'#3d9db3',court:'#277b99',kitchen:'#5ebcc6',line:'#f9fbec',light:'#fff4dc'},rooftop:{sky:'#c99aac',floor:'#455365',outer:'#53687a',court:'#367c96',kitchen:'#5998a8',line:'#fff4e0',light:'#ffd6af'},night:{sky:'#08162a',floor:'#132331',outer:'#1a3045',court:'#20465b',kitchen:'#345779',line:'#c6f5ee',light:'#cbddff'}};
    const palette=palettes[id];if(!palette)throw new Error('Unknown scenery');
    const mat=(color,unlit=false)=>{const m=new (unlit?K.Basic:K.Material)({color,flatShading:!unlit});materials.push(m);return m;};
    const batch=(color,target=group,unlit=false)=>{let key=target.uuid+':'+color+':'+unlit;if(!batches.has(key))batches.set(key,{points:[],color,target,unlit});return batches.get(key).points;};
    function polygon(points,color,target=group,unlit=false){batch(color,target,unlit).push(...points.flat());}
    function box(x,y,z,w,h,d,color,target=group,unlit=false){const a=w/2,b=h/2,c=d/2,v=[[-a,-b,-c],[a,-b,-c],[a,b,-c],[-a,b,-c],[-a,-b,c],[a,-b,c],[a,b,c],[-a,b,c]].map(p=>[p[0]+x,p[1]+y,p[2]+z]);polygon([0,3,2,0,2,1,4,5,6,4,6,7,0,1,5,0,5,4,3,7,6,3,6,2,0,4,7,0,7,3,1,2,6,1,6,5].map(i=>v[i]),color,target,unlit);}
    function ellipsoid(x,y,z,rx,ry,rz,color,target=group,unlit=false){const n=12,m=6,point=(a,b)=>[x+rx*Math.cos(a)*Math.sin(b),y+ry*Math.cos(b),z+rz*Math.sin(a)*Math.sin(b)];for(let j=0;j<m;j++)for(let i=0;i<n;i++){const a=i*2*Math.PI/n,b=(i+1)*2*Math.PI/n,t=j*Math.PI/m,u=(j+1)*Math.PI/m;polygon([point(a,t),point(b,u),point(a,u),point(a,t),point(b,t),point(b,u)],color,target,unlit);}}
    function beam(a,b,width,color,target=group){const v=b.map((n,i)=>n-a[i]),length=Math.hypot(...v),dir=v.map(n=>n/length),ref=Math.abs(dir[1])>.9?[1,0,0]:[0,1,0],cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];let u=cross(dir,ref),size=Math.hypot(...u);u=u.map(n=>n/size*width/2);const w=cross(dir,u),ring=p=>[[-1,-1],[1,-1],[1,1],[-1,1]].map(([s,t])=>p.map((n,i)=>n+s*u[i]+t*w[i]));const vertices=[...ring(a),...ring(b)];polygon([0,1,2,0,2,3,4,7,6,4,6,5,0,4,5,0,5,1,1,5,6,1,6,2,2,6,7,2,7,3,3,7,4,3,4,0].map(i=>vertices[i]),color,target);}
    // All three scenes share the regulation-sized playing surface and line positions.
    box(0,-.12,0,19,.2,27,palette.floor);
    // Ground decals start at y=.01 (shadows), .013 (player marker) and .014
    // (landing guide). Keep all painted surfaces below those shared heights.
    box(0,-.012,0,11.5,.024,20.5,palette.outer);
    box(0,.001,0,6.096,.002,13.4112,palette.court);
    box(0,.003,0,6.096,.001,4.2672,palette.kitchen);
    const white=palette.line;
    for(const x of [-3.048,3.048])box(x,.005,0,.05,.001,13.46,white);
    for(const z of [-6.7056,-2.1336,2.1336,6.7056])box(0,.005,z,6.145,.001,.05,white);
    for(const z of [-4.4196,4.4196])box(0,.005,z,.05,.001,4.572,white);
    const net=new K.Group();net.name='net';group.add(net);
    for(const x of [-3.25,3.25]){box(x,.47,0,.10,.94,.10,'#263a43');box(x,.04,0,.40,.08,.35,'#263a43');}
    for(let i=0;i<=64;i++){const x=-3.2+i*.1;box(x,.48,0,.009,.79,.009,'#344d53',net);}
    for(let i=0;i<9;i++)box(0,.085+i*.1,0,6.4,.009,.009,'#344d53',net);
    box(0,.9,0,6.5,.045,.025,'#fbf8e9',net);
    // Fixtures stay beyond the run-off area.
    for(const x of [-7.5,7.5]){box(x,.52,3,2.2,.12,.6,'#b89971');for(const dx of [-.7,.7])box(x+dx,.25,3,.12,.5,.4,'#3c4b4e');}
    const hemi=new K.Hemi(palette.light,id==='night'?'#243448':'#648776',id==='night'?1.6:2);group.add(hemi);const sun=new K.Light(palette.light,id==='night'?2.5:2.1);sun.position.set(-6,13,8);group.add(sun);
    if(id==='beach'){
      box(0,-.42,-15,200,.1,200,'#279eae');box(0,-.24,0,30,.15,32,'#e4ca93');
      for(let i=0;i<18;i++)box(-35+(i*13)%70,-.35,-25-i*3,5+i%3,.02,.07,i%2?'#7cd4d1':'#57bcbe',group,true);
      function palm(x,z,height,lean){let previous=[x,0,z];for(let j=1;j<=5;j++){const next=[x+lean*(j/5)**2,j*height/5,z];beam(previous,next,.22-j*.018,j%2?'#997545':'#af8750');previous=next;}const [tx,ty,tz]=previous;for(let i=0;i<7;i++){const angle=i*Math.PI*2/7,dx=Math.cos(angle),dz=Math.sin(angle);const base=[tx,ty,tz],mid=[tx+dx*1.1,ty+.25,tz+dz*1.1],tip=[tx+dx*2.4,ty-.9,tz+dz*2.4],left=[mid[0]-dz*.38,mid[1],mid[2]+dx*.38],right=[mid[0]+dz*.38,mid[1],mid[2]-dx*.38];polygon([base,left,tip,base,tip,right,base,tip,left,base,right,tip],i%2?'#318764':'#24694f');}ellipsoid(tx,ty-.15,tz,.28,.25,.28,'#876b42');}
      for(const [x,z,h,l]of [[-7.2,-5,3.2,.7],[7.2,-5,3.4,-.6],[-9,9,3.6,.7],[9,10,3.9,-.7],[-12,-13,4,.8],[12,-13,4.4,-.6]])palm(x,z,h,l);
      for(let i=0;i<8;i++)box(-12+i*3,-.35,-16.7-(i%3)*.45,2.5,.02,.06,'#c6f0df',group,true);
      for(const x of [-7,7]){box(x,1.3,-5,.07,2.6,.07,'#d7ceb4');const top=[x,2.7,-5];for(let i=0;i<8;i++){const a=i*Math.PI/4,b=(i+1)*Math.PI/4;polygon([top,[x+Math.cos(a)*1.3,2.25,-5+Math.sin(a)*1.3],[x+Math.cos(b)*1.3,2.25,-5+Math.sin(b)*1.3]],i%2?'#fff2cc':'#ec8e6d');}}
      ellipsoid(-23,15,-53,4,4,1,'#fff0bc',group,true);
    }else if(id==='rooftop'){
      for(const x of [-9.4,9.4]){box(x,.32,0,.3,.65,26,'#718495');for(let z=-12;z<=12;z+=2){box(x,1.1,z,.05,1.6,.05,'#bed0d6');}for(const y of [.8,1.6])box(x,y,0,.06,.06,26,'#bed0d6');}
      for(const z of [-13,13]){box(0,.32,z,19,.65,.3,'#718495');for(let x=-9;x<=9;x+=2)box(x,1.1,z,.05,1.6,.05,'#bed0d6');for(const y of [.8,1.6])box(0,y,z,19,.06,.06,'#bed0d6');}
      const colors=['#5b647d','#706c87','#45566d','#8b7890'];
      for(let i=0;i<26;i++){const side=i%2?-1:1,x=side*(15+(i%5)*5),z=-23-Math.floor(i/5)*6,h=7+(i*7)%16,w=3+(i%3);box(x,h/2-6,z,w,h,4,colors[i%4]);for(let y=0;y<h-1;y+=2)for(let dx=-w/2+.6;dx<w/2;dx+=1)box(x+dx,y-5,z+2.015,.38,.66,.02,(i+y)%3?'#ffdbab':'#889ab2',group,true);}
      ellipsoid(-23,13,-62,5.5,5.5,1,'#ffd1a8',group,true);
      for(const x of [-8,8])for(const z of [-8,8]){box(x,.3,z,.8,.6,.8,'#b6a7a2');ellipsoid(x,1,z,.7,.9,.7,'#568574');}
      for(const x of [-6.8,6.8]){box(x,3,-10,.08,6,.08,'#34465c');box(x,6,-10,1.1,.12,.35,'#fff0d4',group,true);}
    }else{
      box(0,-.3,0,100,.2,100,'#101e2b');
      for(const x of [-8.8,8.8]){for(let y=.25;y<2.6;y+=.3)box(x,y,0,.009,.009,25,'#446276');for(let z=-12;z<=12;z+=.6)box(x,1.3,z,.012,2.6,.012,'#446276');for(let z=-12;z<=12;z+=2.4)box(x,1.3,z,.06,2.6,.06,'#7c99b4');box(x,2.63,0,.07,.035,25,x<0?'#7de9ee':'#c38bff',group,true);}
      for(const z of [-12.5,12.5]){for(let y=.25;y<2.6;y+=.3)box(0,y,z,17.6,.009,.009,'#446276');for(let x=-8.7;x<8.8;x+=.6)box(x,1.3,z,.012,2.6,.012,'#446276');box(0,2.63,z,17.6,.04,.05,'#83b3da',group,true);}
      for(const x of [-7.8,7.8])for(const z of [-8,8]){box(x,2.3,z,.13,4.6,.13,'#57738a');box(x,4.6,z,1.5,.18,.7,'#d7efff',group,true);box(x,4.51,z,1.4,.02,.65,'#ffffff',group,true);}
      for(const x of [-5.8,5.8])box(x,.04,0,.04,.02,20.5,x<0?'#65dce7':'#b586ed',group,true);
      for(let i=0;i<12;i++){const x=(i%2?-1:1)*(13+i%4*3),z=-17-Math.floor(i/2)*4;box(x,1.8,z,.35,3.6,.35,'#263c43');ellipsoid(x,4,z,1.8,2,1.5,i%2?'#203e43':'#2d4654');}
      ellipsoid(-16,19,-49,2.5,2.5,.4,'#d1e5ee',group,true);
      for(let i=0;i<28;i++)ellipsoid(-42+(i*17)%84,12+(i*7)%21,-45-(i%3)*8,.045,.045,.045,'#b9d2e7',group,true);
    }
    for(const x of [-2.4,2.4])box(x,1.7,-11.05,.09,3.4,.09,'#435866');
    for(const batch of batches.values()){const geometry=new K.Geometry();geometry.setAttribute('position',new K.Attribute(new Float32Array(batch.points),3));geometry.computeVertexNormals();const mesh=new K.Mesh(geometry,mat(batch.color,batch.unlit));batch.target.add(mesh);geometries.push(geometry);}
    const canvas=document.createElement('canvas');canvas.width=768;canvas.height=256;const context=canvas.getContext('2d'),texture=new K.Texture(canvas);texture.colorSpace=K.sRGB;textures.push(texture);
    const geometry=new K.Geometry();geometry.setAttribute('position',new K.Attribute(new Float32Array([-2.5,1.8,-10.9,2.5,1.8,-10.9,2.5,3.4,-10.9,-2.5,1.8,-10.9,2.5,3.4,-10.9,-2.5,3.4,-10.9]),3));geometry.setAttribute('uv',new K.Attribute(new Float32Array([0,0,1,0,1,1,0,0,1,1,0,1]),2));geometry.computeVertexNormals();geometries.push(geometry);const signMat=new K.Basic({map:texture,toneMapped:false});materials.push(signMat);group.add(new K.Mesh(geometry,signMat));
    const draw=score=>{if(disposed||!context)return;context.fillStyle=id==='night'?'#122638':'#173b48';context.fillRect(0,0,768,256);context.fillStyle=id==='night'?'#9fe7f0':'#f3e9c9';context.font='bold 49px sans-serif';context.textAlign='center';context.fillText(theme.name.toUpperCase(),384,83);context.fillStyle='#ffffff';context.font='bold 62px sans-serif';context.fillText(score?`${score.short[0]}  ${score.points[0]} — ${score.points[1]}  ${score.short[1]}`:'RALLY · PICKLEBALL',384,183);texture.needsUpdate=true;};draw(null);
    let lastScore='';
    return{id,sky:palette.sky,group,update(){},setMood(){},cheer(){},wave(){},confetti(){},setScoreboard(score){const key=JSON.stringify(score);if(key!==lastScore){lastScore=key;draw(score);}},dispose(){if(disposed)return;disposed=true;group.removeFromParent();for(const g of geometries)g.dispose();for(const m of materials)m.dispose();for(const t of textures)t.dispose();group.clear();canvas.width=canvas.height=0;batches.clear();geometries.length=materials.length=textures.length=0;if(globalThis.RallyScenery.venue===this){globalThis.RallyScenery.venue=null;globalThis.RallyScenery.view=null;}}};
  }
  globalThis.RallyScenery={get selected(){return selected;},themes,mount,makeVenue,onView(view,venue){this.view=view;this.venue=venue;if(venue.sky)view.renderer.setClearColor(venue.sky);}};
})();
