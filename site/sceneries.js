/* Local scenery geometry; gameplay coordinates and physics remain in the game engine. */
(() => {
  const themes={
    stadium:{name:'Championship stadium',description:'The original packed arena and center court.'},
    beach:{name:'Palm Beach',description:'A bright seaside hard court, with palms, sand and turquoise water.'},
    rooftop:{name:'Sunset Rooftop',description:'A blue rooftop court with glass railings, warm LEDs and a golden city skyline beneath an orange-pink sunset.'},
    night:{name:'Moonlit Grove',description:'A deep-blue court beneath warm floodlights and a silver full moon, with forest greenery, mountains and distant valley lights.'}
  };
  let selected='stadium';try{const saved=localStorage.getItem('rally.offline.scenery.v1');if(themes[saved])selected=saved;}catch{}
  function mount(host){
    if(!host||host.childElementCount)return;
    const panel=document.createElement('section');panel.className='rally-mod-panel';
    const title=document.createElement('h2');title.textContent='Scenery';
    const select=document.createElement('select');select.className='rally-ai-select';select.setAttribute('aria-label','Scenery');
    for(const [id,theme]of Object.entries(themes)){const o=document.createElement('option');o.value=id;o.textContent=theme.name;select.append(o);}select.value=selected;
    const description=document.createElement('p');description.setAttribute('aria-live','polite');description.className='rally-scenery-description';
    const preview=document.createElement('img');preview.className='rally-court-preview';preview.width=960;preview.height=540;preview.decoding='async';
    const update=()=>{
      description.textContent=themes[selected].description;
      preview.src='/rally/court-previews/'+selected+'.jpg';preview.alt=themes[selected].name+' court preview';
    };
    select.onchange=()=>{selected=select.value;try{localStorage.setItem('rally.offline.scenery.v1',selected);}catch{}update();};update();panel.append(title,select,preview,description);host.append(panel);
  }
  function makeVenue(options,K){
    const id=selected,theme=themes[id],group=new K.Group();group.name='scenery-'+id;group.userData.scenery=id;
    const geometries=[],materials=[],textures=[],batches=new Map();let disposed=false;
    const palettes={beach:{sky:'#9dd9e7',floor:'#d8be8b',outer:'#3d9db3',court:'#277b99',kitchen:'#5ebcc6',line:'#f9fbec',light:'#fff4dc'},rooftop:{sky:'#b47a88',floor:'#343d48',outer:'#344e63',court:'#164c79',kitchen:'#28618a',line:'#fff9ed',light:'#ffce8e'},night:{sky:'#080f23',floor:'#142a25',outer:'#244a3b',court:'#16426c',kitchen:'#28567a',line:'#f4f5ec',light:'#ffdda0'}};
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
    const hemi=new K.Hemi(palette.light,id==='night'?'#243448':'#648776',id==='night'?.85:2);group.add(hemi);const sun=new K.Light(palette.light,id==='night'?1.8:2.1);sun.position.set(-6,13,8);group.add(sun);
    if(id==='beach'){
      box(0,-.42,-15,200,.1,200,'#279eae');box(0,-.24,0,30,.15,32,'#e4ca93');
      for(let i=0;i<18;i++)box(-35+(i*13)%70,-.35,-25-i*3,5+i%3,.02,.07,i%2?'#7cd4d1':'#57bcbe',group,true);
      function palm(x,z,height,lean){let previous=[x,0,z];for(let j=1;j<=5;j++){const next=[x+lean*(j/5)**2,j*height/5,z];beam(previous,next,.22-j*.018,j%2?'#997545':'#af8750');previous=next;}const [tx,ty,tz]=previous;for(let i=0;i<7;i++){const angle=i*Math.PI*2/7,dx=Math.cos(angle),dz=Math.sin(angle);const base=[tx,ty,tz],mid=[tx+dx*1.1,ty+.25,tz+dz*1.1],tip=[tx+dx*2.4,ty-.9,tz+dz*2.4],left=[mid[0]-dz*.38,mid[1],mid[2]+dx*.38],right=[mid[0]+dz*.38,mid[1],mid[2]-dx*.38];polygon([base,left,tip,base,tip,right,base,tip,left,base,right,tip],i%2?'#318764':'#24694f');}ellipsoid(tx,ty-.15,tz,.28,.25,.28,'#876b42');}
      for(const [x,z,h,l]of [[-7.2,-5,3.2,.7],[7.2,-5,3.4,-.6],[-9,9,3.6,.7],[9,10,3.9,-.7],[-12,-13,4,.8],[12,-13,4.4,-.6]])palm(x,z,h,l);
      for(let i=0;i<8;i++)box(-12+i*3,-.35,-16.7-(i%3)*.45,2.5,.02,.06,'#c6f0df',group,true);
      for(const x of [-7,7]){box(x,1.3,-5,.07,2.6,.07,'#d7ceb4');const top=[x,2.7,-5];for(let i=0;i<8;i++){const a=i*Math.PI/4,b=(i+1)*Math.PI/4;polygon([top,[x+Math.cos(a)*1.3,2.25,-5+Math.sin(a)*1.3],[x+Math.cos(b)*1.3,2.25,-5+Math.sin(b)*1.3]],i%2?'#fff2cc':'#ec8e6d');}}
      ellipsoid(-23,15,-53,4,4,1,'#fff0bc',group,true);
    }else if(id==='rooftop'){

      sun.position.set(-12,15,-24);
      // Layered sunset backdrop, shared by the game and the court preview.
      const skyCanvas=document.createElement('canvas');skyCanvas.width=1536;skyCanvas.height=768;
      const sky=skyCanvas.getContext('2d'),gradient=sky.createLinearGradient(0,0,0,768);
      gradient.addColorStop(0,'#454567');gradient.addColorStop(.35,'#96667e');gradient.addColorStop(.62,'#e78e82');gradient.addColorStop(.82,'#ffb36d');gradient.addColorStop(1,'#ffda8e');sky.fillStyle=gradient;sky.fillRect(0,0,1536,768);
      for(let i=0;i<27;i++){
        const x=(i*193)%1700-90,y=120+(i*71)%410,w=150+(i*23)%280;
        sky.fillStyle=i%3===0?'rgba(255,190,153,.23)':'rgba(71,58,91,.17)';
        sky.beginPath();sky.ellipse(x,y,w,9+i%5*3,-.06,0,Math.PI*2);sky.fill();
        sky.fillStyle='rgba(255,209,155,.19)';sky.beginPath();sky.ellipse(x+22,y+10,w*.9,3,0,0,Math.PI*2);sky.fill();
      }
      const skyTex=new K.Texture(skyCanvas);skyTex.colorSpace=K.sRGB;textures.push(skyTex);
      const skyGeo=new K.Geometry();skyGeo.setAttribute('position',new K.Attribute(new Float32Array([-180,-40,-105,180,-40,-105,180,110,-105,-180,-40,-105,180,110,-105,-180,110,-105]),3));skyGeo.setAttribute('uv',new K.Attribute(new Float32Array([0,0,1,0,1,1,0,0,1,1,0,1]),2));skyGeo.computeVertexNormals();geometries.push(skyGeo);
      const skyMat=new K.Basic({map:skyTex,toneMapped:false});materials.push(skyMat);const backdrop=new K.Mesh(skyGeo,skyMat);backdrop.name='sunset-sky';group.add(backdrop);
      ellipsoid(-9,9,-65,4.3,4.3,.6,'#ffe1a0',group,true);
      // A dense skyline with lit windows and sunset-facing glass strips.
      const facades=['#455367','#566077','#374657','#6e6878','#655967'];
      function building(x,z,w,d,h,color,landmark=false){
        const base=-9;box(x,base+h/2,z,w,h,d,color);
        const front=z+d/2+.018;
        box(x-w*.39,base+h*.51,front,w*.12,h*.94,.025,landmark?'#a78368':'#b88c78',group,true);
        box(x+w*.41,base+h*.51,front,w*.035,h*.96,.025,'#f2ba83',group,true);
        for(let y=base+1;y<base+h-.7;y+=1.45)for(let dx=-w/2+.45;dx<w/2-.2;dx+=.72){
          const lit=(Math.floor((x+80)*3+y*7+dx*5)%5+5)%5;
          box(x+dx,y,front,.30,.60,.022,lit===0?'#f5c98b':lit===1?'#d5a675':landmark?'#304052':'#728397',group,true);
        }
        for(let dz=-d/2+.5;dz<d/2;dz+=.9)for(let y=base+1;y<base+h-1;y+=2)box(x-w/2-.018,y,z+dz,.02,.55,.35,'#8c8d93',group,true);
        box(x,base+h+.12,z,w+.08,.24,d+.08,'#303b4a');
        if(landmark){box(x,base+h+1.4,z,w*.55,2.8,d*.55,'#263341');box(x,base+h+4,z,.07,4,.07,'#c4b4a4');}
      }
      for(let i=0;i<26;i++){
        const x=-60+i*4.7,z=-39-(i%4)*7,w=2.8+(i%3)*.8,h=13+(i*7)%17;
        building(x,z,w,3.6,h,facades[i%facades.length]);
      }
      for(let i=0;i<10;i++){const side=i%2?-1:1;building(side*(17+(i%3)*6),-14-Math.floor(i/2)*8,4.5+(i%2),4.7,17+(i*7)%13,facades[(i+2)%5]);}
      building(20,-24,6.2,5.8,39,'#263546',true);
      // Glass balustrades keep the skyline visible around the run-off area.
      const glassMat=new K.Basic({color:'#b6d1df',transparent:true,opacity:.16,depthWrite:false,side:2});materials.push(glassMat);
      function glass(vertices){const g=new K.Geometry();g.setAttribute('position',new K.Attribute(new Float32Array(vertices.flat()),3));g.computeVertexNormals();geometries.push(g);const mesh=new K.Mesh(g,glassMat);mesh.name='glass-railing';group.add(mesh);}
      for(const x of [-9.2,9.2]){
        box(x,.16,0,.24,.32,26,'#69727a');box(x,1.4,0,.07,.07,26,'#c5bcae');
        for(let z=-12.8;z<12.8;z+=2.56){glass([[x,.3,z],[x,1.36,z],[x,1.36,z+2.48],[x,.3,z],[x,1.36,z+2.48],[x,.3,z+2.48]]);box(x,.84,z,.045,1.1,.045,'#c5bcae');}
      }
      for(const z of [-13,13]){
        box(0,.16,z,18.4,.32,.24,'#69727a');box(0,1.4,z,18.4,.07,.07,'#c5bcae');
        for(let x=-9.1;x<9;x+=2.275){glass([[x,.3,z],[x+2.2,.3,z],[x+2.2,1.36,z],[x,.3,z],[x+2.2,1.36,z],[x,1.36,z]]);box(x,.84,z,.045,1.1,.045,'#c5bcae');}
      }
      // Protective fencing at the far baseline, with a warm slim top rail.
      for(const z of [-12.8]){for(let x=-9;x<=9;x+=3)box(x,2.4,z,.05,2.2,.05,'#50616d');for(let x=-9;x<=9;x+=.35)box(x,2.4,z,.009,2.2,.009,'#6b7982');for(let y=1.5;y<3.5;y+=.35)box(0,y,z,18,.009,.009,'#6b7982');box(0,3.5,z,18,.04,.04,'#a9a79b');}
      // Slate benches, rectangular planters and warm LED heads.
      for(const x of [-7.3,7.3])for(const z of [-7,7]){
        box(x,.3,z,1.05,.6,1.05,'#747b7b');box(x,.64,z,.96,.08,.96,'#283c38');
        for(let j=0;j<3;j++)ellipsoid(x+(j-1)*.22,1.04+j*.11,z,.38,.64,.38,['#416448','#55754d','#34563e'][j]);
      }
      for(const x of [-7.4,7.4])for(const z of [-9.6,9.6]){
        box(x,3.2,z,.09,6.4,.09,'#3b4c5a');box(x,6.4,z,1.3,.18,.55,'#263747');box(x,6.30,z,1.16,.025,.46,'#fff0c9',group,true);
      }

    }else{

      box(0,-.3,0,220,.2,220,'#10231f');
      // Dark chain-link enclosure without luminous trim.
      for(const x of [-8.8,8.8]){
        for(let z=-12;z<=12;z+=2.4)box(x,1.4,z,.07,2.8,.07,'#4a5a56');
        box(x,2.8,0,.055,.055,25,'#6f7c73');
        for(let z=-14;z<13;z+=.6){
          const lo=Math.max(-12.5,z),hi=Math.min(12.5,z+2.8);
          if(hi>lo){beam([x,lo-z,lo],[x,hi-z,hi],.012,'#394b47');beam([x,2.8-(lo-z),lo],[x,2.8-(hi-z),hi],.012,'#394b47');}
        }
      }
      for(const z of [-12.5,12.5]){
        box(0,2.8,z,17.6,.05,.05,'#6f7c73');
        for(let x=-8.8;x<=8.8;x+=2.2)box(x,1.4,z,.06,2.8,.06,'#4a5a56');
        for(let x=-11;x<9;x+=.6){const lo=Math.max(-8.8,x),hi=Math.min(8.8,x+2.8);if(hi>lo){beam([lo,lo-x,z],[hi,hi-x,z],.012,'#394b47');beam([lo,2.8-(lo-x),z],[hi,2.8-(hi-x),z],.012,'#394b47');}}
      }
      // A single tall bank of warm LEDs on the left.
      box(-7.8,4.5,-4,.18,9,.18,'#63716b');beam([-7.8,8.8,-4],[-6.9,8.8,-4],.13,'#63716b');
      box(-6.9,8.75,-4,1.5,.25,.75,'#242f32');
      for(let x=0;x<4;x++)box(-7.43+x*.35,8.61,-4,.25,.025,.53,'#fff0c4',group,true);
      const moonLight=new K.Light('#a5bce8',.65);moonLight.position.set(18,24,-35);group.add(moonLight);
      // Layered ridgelines, warm lights nestled in the distant valley.
      for(let layer=0;layer<3;layer++)for(let i=0;i<11;i++){
        const x=-72+i*14+layer*5,z=-49-layer*16,h=8+((i*7+layer*3)%13),w=12;
        polygon([[x+w,-1,z],[x,h,z],[x-w,-1,z]],['#182f38','#142636','#101d30'][layer],group,true);
      }
      for(let i=0;i<55;i++){const x=-48+(i*17)%96,z=-28-(i*7)%18;ellipsoid(x,.6+(i%3)*.2,z,.07,.06,.06,i%3?'#b89a59':'#f2cf83',group,true);}
      // Tall broadleaf trees with a few leaves catching the floodlight.
      for(let i=0;i<24;i++){
        const side=i%2?-1:1,x=side*(12+(i%4)*3),z=-22+Math.floor(i/2)*3.8,h=4.8+i%4;
        box(x,h*.45,z,.32,h*.9,.32,'#303a2b');
        for(let j=0;j<3;j++)ellipsoid(x+(j-1)*.8,h+j*.45,z+(j%2)*.65,1.5,1.8,1.5,x<0&&z>-12&&z<6?['#536442','#66764a','#3d563c'][j]:['#193b30','#224738','#2a4b3a'][j]);
      }
      ellipsoid(0,10,-26,1.8,1.8,.4,'#e6eced',group,true);
      for(let i=0;i<7;i++)ellipsoid(-.7+(i*3)%2,9.3+(i*7)%2,-25.55,.3+(i%3)*.15,.22,.01,'#bccbd5',group,true);
      for(let i=0;i<65;i++)ellipsoid(-65+(i*19)%130,15+(i*7)%29,-65-(i%3)*4,.035,.035,.035,'#b3c3da',group,true);
      for(let i=0;i<12;i++)ellipsoid(-45+(i*13)%90,9+(i%3)*2,-57-(i%2)*7,5+(i%3),.65,1.1,i%2?'#1b2b43':'#22334b',group,true);

    }
    for(const x of [-2.4,2.4])box(x,1.7,-11.05,.09,3.4,.09,'#435866');
    for(const batch of batches.values()){const geometry=new K.Geometry();geometry.setAttribute('position',new K.Attribute(new Float32Array(batch.points),3));geometry.computeVertexNormals();const mesh=new K.Mesh(geometry,mat(batch.color,batch.unlit));batch.target.add(mesh);geometries.push(geometry);}
    if(id==='night'||id==='rooftop'){
      // A soft floodlight wash adds a subtle sheen without covering ground guides.
      const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d');
      const glow=ctx.createRadialGradient(90,230,0,110,230,440);glow.addColorStop(0,'rgba(255,224,162,.20)');glow.addColorStop(.5,'rgba(255,224,162,.06)');glow.addColorStop(1,'rgba(255,224,162,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,512,512);
      const t=new K.Texture(c);t.colorSpace=K.sRGB;textures.push(t);
      const g=new K.Geometry();g.setAttribute('position',new K.Attribute(new Float32Array([-5,.006,-9,-5,.006,9,5,.006,9,-5,.006,-9,5,.006,9,5,.006,-9]),3));g.setAttribute('uv',new K.Attribute(new Float32Array([0,0,0,1,1,1,0,0,1,1,1,0]),2));g.computeVertexNormals();geometries.push(g);
      const m=new K.Basic({map:t,transparent:true,depthWrite:false,toneMapped:false});materials.push(m);const wash=new K.Mesh(g,m);wash.name='warm-floodlight-wash';group.add(wash);
    }
    const canvas=document.createElement('canvas');canvas.width=768;canvas.height=256;const context=canvas.getContext('2d'),texture=new K.Texture(canvas);texture.colorSpace=K.sRGB;textures.push(texture);
    const geometry=new K.Geometry();geometry.setAttribute('position',new K.Attribute(new Float32Array([-2.5,1.8,-10.9,2.5,1.8,-10.9,2.5,3.4,-10.9,-2.5,1.8,-10.9,2.5,3.4,-10.9,-2.5,3.4,-10.9]),3));geometry.setAttribute('uv',new K.Attribute(new Float32Array([0,0,1,0,1,1,0,0,1,1,0,1]),2));geometry.computeVertexNormals();geometries.push(geometry);const signMat=new K.Basic({map:texture,toneMapped:false});materials.push(signMat);group.add(new K.Mesh(geometry,signMat));
    const draw=score=>{if(disposed||!context)return;context.fillStyle=id==='night'?'#122638':'#173b48';context.fillRect(0,0,768,256);context.fillStyle=id==='night'?'#9fe7f0':'#f3e9c9';context.font='bold 49px sans-serif';context.textAlign='center';context.fillText(theme.name.toUpperCase(),384,83);context.fillStyle='#ffffff';context.font='bold 62px sans-serif';context.fillText(score?`${score.short[0]}  ${score.points[0]} — ${score.points[1]}  ${score.short[1]}`:'RALLY · PICKLEBALL',384,183);texture.needsUpdate=true;};draw(null);
    let lastScore='';
    return{id,sky:palette.sky,group,update(){},setMood(){},cheer(){},wave(){},confetti(){},setScoreboard(score){const key=JSON.stringify(score);if(key!==lastScore){lastScore=key;draw(score);}},dispose(){if(disposed)return;disposed=true;group.removeFromParent();for(const g of geometries)g.dispose();for(const m of materials)m.dispose();for(const t of textures)t.dispose();group.clear();canvas.width=canvas.height=0;batches.clear();geometries.length=materials.length=textures.length=0;if(globalThis.RallyScenery.venue===this){globalThis.RallyScenery.venue=null;globalThis.RallyScenery.view=null;}}};
  }
  globalThis.RallyScenery={get selected(){return selected;},themes,mount,makeVenue,onView(view,venue){this.view=view;this.venue=venue;if(venue.sky)view.renderer.setClearColor(venue.sky);}};
})();
