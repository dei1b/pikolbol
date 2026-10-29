const fs=require('fs'),path=require('path');
const sharp=require('C:/Users/Dave/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.resolve(__dirname,'../site/rally'),g=JSON.parse(fs.readFileSync(path.join(root,'characters.gltf'))),bin=fs.readFileSync(path.join(root,'characters.bin'));
const types={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16},sizes={5121:1,5122:2,5123:2,5126:4};
function values(index){const a=g.accessors[index],v=g.bufferViews[a.bufferView],n=types[a.type],size=sizes[a.componentType],out=[];for(let i=0;i<a.count;i++){const row=[];for(let j=0;j<n;j++){const p=(v.byteOffset||0)+(a.byteOffset||0)+i*(v.byteStride||n*size)+j*size;let val=a.componentType===5121?bin.readUInt8(p):a.componentType===5122?bin.readInt16LE(p):a.componentType===5123?bin.readUInt16LE(p):bin.readFloatLE(p);if(a.normalized)val/=a.componentType===5122?32767:65535;row.push(val);}out.push(row);}return out;}
const buffers=[bin];let length=bin.length;
function accessor(rows,type){while(length%4){buffers.push(Buffer.alloc(1));length++;}const start=length,n=types[type],data=Buffer.alloc(rows.length*n*4);rows.forEach((r,i)=>r.forEach((v,j)=>data.writeFloatLE(v,(i*n+j)*4)));buffers.push(data);length+=data.length;const view=g.bufferViews.push({buffer:0,byteOffset:start,byteLength:data.length,target:34962})-1;return g.accessors.push({bufferView:view,componentType:5126,count:rows.length,type,...(type==='VEC3'?{min:[0,1,2].map(i=>Math.min(...rows.map(r=>r[i]))),max:[0,1,2].map(i=>Math.max(...rows.map(r=>r[i])))}:{})})-1;}
const rgb=hex=>hex.match(/[a-f0-9]{2}/gi).map(x=>parseInt(x,16)/255);const linear=c=>c.map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
const ENZO_SKIN='#c48d64';
function material(name,color){return g.materials.push({name,doubleSided:true,pbrMetallicRoughness:{baseColorFactor:[...((color===ENZO_SKIN||color==='#8c583e')?linear(rgb(color)):rgb(color)),1],metallicFactor:0,roughnessFactor:1}})-1;}
function shape(name,vertices,color,parent){if(g.nodes[parent].name==='head'&&/^(enzo|rafi)-/.test(name))vertices=vertices.map(([x,y,z])=>[x*.88,y*.9,z*.88]);if(g.nodes[parent].name==="head"&&!/^(enzo|rafi)-/.test(name))vertices=vertices.map(([x,y,z])=>[x*1.7,y+.20-(/glasses|lens|frames/.test(name)?.065:0),z*1.6]);const mesh=g.meshes.push({name,primitives:[{attributes:{POSITION:accessor(vertices,'VEC3')},material:material(name,color),mode:4}]})-1;const node=g.nodes.push({name,mesh})-1;(g.nodes[parent].children??=[]).push(node);}
function box(name,c,s,color,parent){const [x,y,z]=c,[a,b,d]=s.map(n=>n/2),p=[[-a,-b,-d],[a,-b,-d],[a,b,-d],[-a,b,-d],[-a,-b,d],[a,-b,d],[a,b,d],[-a,b,d]].map(v=>v.map((n,i)=>n+c[i]));const faces=[[0,3,2,0,2,1],[4,5,6,4,6,7],[0,1,5,0,5,4],[3,7,6,3,6,2],[0,4,7,0,7,3],[1,2,6,1,6,5]];shape(name,faces.flat().map(i=>p[i]),color,parent);}
function ellipsoid(name,c,s,color,parent){const points=[],segments=12,rings=6;const pt=(u,v)=>[c[0]+s[0]*Math.cos(u)*Math.sin(v),c[1]+s[1]*Math.cos(v),c[2]+s[2]*Math.sin(u)*Math.sin(v)];for(let j=0;j<rings;j++)for(let i=0;i<segments;i++){const a=i*2*Math.PI/segments,b=(i+1)*2*Math.PI/segments,v=j*Math.PI/rings,w=(j+1)*Math.PI/rings;points.push(pt(a,v),pt(b,w),pt(a,w),pt(a,v),pt(b,v),pt(b,w));}shape(name,points,color,parent);}
function buildEnzoHead(head,torso,map,def){
 const skin=ENZO_SKIN,navy='#142b4a',white=def.trim;
 // Beveled block head replaces the reference head geometry completely.
 const outline=(x,z,b)=>[[-x+b,-z],[x-b,-z],[x,-z+b],[x,z-b],[x-b,z],[-x+b,z],[-x,z-b],[-x,-z+b]];
 const rings=[[.018,.174,.131],[.062,.218,.175],[.276,.218,.175],[.325,.174,.131]].map(([y,x,z])=>outline(x,z,.06).map(([a,b])=>[a,y,b]));
 const verts=[];for(let r=0;r<3;r++)for(let i=0;i<8;i++){const j=(i+1)%8;verts.push(rings[r][i],rings[r+1][i],rings[r+1][j],rings[r][i],rings[r+1][j],rings[r][j]);}for(let i=0;i<8;i++){verts.push([0,.018,0],rings[0][(i+1)%8],rings[0][i]);verts.push([0,.325,0],rings[3][i],rings[3][(i+1)%8]);}shape('enzo-head',verts,skin,head);
 for(const side of [-1,1]){ellipsoid('enzo-ear-'+side,[side*.225,.145,0],[.028,.039,.029],skin,head);ellipsoid('enzo-eye-'+side,[side*.079,.192,.177],[.023,.027,.004],'#172235',head);}
 const smile=[];for(let i=0;i<10;i++){const x=-.035+i*.007,X=x+.007,y=a=>.09+.014*(a/.035)**2;smile.push([x,y(x),.178],[X,y(X),.178],[X,y(X)+.008,.178],[x,y(x),.178],[X,y(X)+.008,.178],[x,y(x)+.008,.178]);}shape('enzo-smile',smile,'#3d2927',head);
 // A tall six-panel crown with an actual curved forward bill.
 const crown=[],segments=24,layers=6;
 const point=(theta,angle)=>[.237*Math.sin(theta)*Math.cos(angle),.31+.158*Math.cos(theta),.197*Math.sin(theta)*Math.sin(angle)];
 for(let l=0;l<layers;l++)for(let i=0;i<segments;i++){const a=i*2*Math.PI/segments,b=(i+1)*2*Math.PI/segments,t=l*Math.PI/2/layers,u=(l+1)*Math.PI/2/layers;crown.push(point(t,a),point(u,b),point(u,a),point(t,a),point(t,b),point(u,b));}
 shape('enzo-baseball-cap-crown',crown,navy,head);
 const bill=[];for(let i=0;i<16;i++){const x=-.224+i*.028,X=x+.028;const near=a=>[a,.316,.103];const far=a=>[a,.295,.18+.16*Math.sqrt(Math.max(0,1-(a/.24)**2))];bill.push(near(x),far(x),far(X),near(x),far(X),near(X));}shape('enzo-curved-cap-bill',bill,def.shirt,head);
 ellipsoid('enzo-cap-button',[0,.472,0],[.018,.009,.018],white,head);box('enzo-cap-front-mark',[0,.381,.174],[.043,.034,.012],white,head);
 for(let panel=0;panel<6;panel++){const angle=panel*Math.PI/3;const seam=[];for(let j=1;j<8;j++){const t=j*Math.PI/16,u=(j+1)*Math.PI/16,a=point(t,angle-.009),b=point(t,angle+.009),c=point(u,angle+.009),d=point(u,angle-.009);for(const p of [a,b,c,d]){p[0]*=1.008;p[2]*=1.008;p[1]+=.001;}seam.push(a,b,c,a,c,d);}shape('enzo-cap-panel-seam-'+panel,seam,'#385d85',head);}
 // White V stripes sit just outside both jersey faces and move with the torso.
 for(const z of [.135,-.135]){const v=[];for(const side of [-1,1])v.push([0,.07,z],[side*.127,.137,z],[side*.127,.112,z],[0,.07,z],[side*.127,.112,z],[0,.044,z]);shape('enzo-jersey-chevron-'+z,v,white,torso);}
 box('enzo-jersey-collar',[0,.156,.14],[.095,.019,.012],navy,torso);
 // Small jersey number 7, assembled from two clean strokes.
 box('enzo-number-seven-top',[.065,.058,.143],[.037,.009,.007],white,torso);shape('enzo-number-seven-leg',[[.077,.058,.147],[.086,.058,.147],[.067,.014,.147],[.077,.058,.147],[.067,.014,.147],[.058,.014,.147]],white,torso);
 for(const side of ['left','right']){const leg=[...map.values()].find(i=>g.nodes[i].name==='leg-'+side);box('enzo-shorts-side-stripe-'+side,[side==='left'?.063:-.063,-.032,.077],[.012,.057,.012],white,leg);}
}

function buildRafiHead(head,def){
 const skin='#8c583e',dark='#182a38',trim='#67c8cc';
 const outline=(x,z)=>[[-x+.05,-z],[x-.05,-z],[x,-z+.05],[x,z-.05],[x-.05,z],[-x+.05,z],[-x,z-.05],[-x,-z+.05]];
 const rings=[[.018,.17,.13],[.06,.218,.175],[.275,.218,.175],[.325,.17,.13]].map(([y,x,z])=>outline(x,z).map(([a,b])=>[a,y,b])),v=[];
 for(let r=0;r<3;r++)for(let i=0;i<8;i++){let j=(i+1)%8;v.push(rings[r][i],rings[r+1][i],rings[r+1][j],rings[r][i],rings[r+1][j],rings[r][j]);}
 for(let i=0;i<8;i++)v.push([0,.018,0],rings[0][(i+1)%8],rings[0][i],[0,.325,0],rings[3][i],rings[3][(i+1)%8]);
 shape('rafi-clean-head',v,skin,head);
 for(const side of [-1,1]){
  ellipsoid('rafi-ear-'+side,[side*.225,.145,0],[.028,.038,.028],skin,head);
  box('rafi-lens-'+side,[side*.092,.201,.183],[.148,.065,.008],'#193447',head);
  for(const y of [.164,.238])box('rafi-frame-horizontal-'+side+'-'+y,[side*.092,y,.188],[.164,.009,.012],dark,head);
  for(const dx of [-.08,.08])box('rafi-frame-edge-'+side+'-'+dx,[side*.092+dx,.201,.188],[.009,.074,.012],dark,head);
  box('rafi-glasses-arm-'+side,[side*.219,.208,.078],[.012,.012,.216],dark,head);
  box('rafi-frame-hinge-'+side,[side*.198,.208,.166],[.055,.017,.022],trim,head);
 }
 box('rafi-glasses-bridge',[0,.209,.186],[.033,.012,.012],dark,head);
 box('rafi-smile',[0,.1,.178],[.057,.008,.006],'#422d25',head);
 // Hair remains behind the cap and ears, clear of the face.
 box('rafi-back-hair',[0,.252,-.143],[.33,.14,.035],dark,head);
 const crown=[],point=(t,a)=>[.239*Math.sin(t)*Math.cos(a),.31+.16*Math.cos(t),.199*Math.sin(t)*Math.sin(a)];
 for(let l=0;l<6;l++)for(let i=0;i<24;i++){let a=i*Math.PI/12,b=(i+1)*Math.PI/12,t=l*Math.PI/12,u=(l+1)*Math.PI/12;crown.push(point(t,a),point(u,b),point(u,a),point(t,a),point(t,b),point(u,b));}
 shape('rafi-rounded-cap-crown',crown,def.shirt,head);
 const bill=[];for(let i=0;i<20;i++){const x=-.23+i*.023,X=x+.023,near=a=>[a,.314,.115],far=a=>[a,.297-.012*(a/.23)**2,.18+.14*Math.sqrt(Math.max(0,1-(a/.24)**2))];bill.push(near(x),far(x),far(X),near(x),far(X),near(X));}
 shape('rafi-curved-cap-bill',bill,def.shirt,head);
 ellipsoid('rafi-cap-button',[0,.473,0],[.014,.007,.014],trim,head);
 box('rafi-cap-emblem',[0,.37,.184],[.034,.027,.008],trim,head);
}
const defs=[{id:'rafi',name:'Rafi',base:1,shirt:'#16374f',trim:'#67e8ef',hair:'#172535',width:1.04},{id:'nika',name:'Nika',base:4,shirt:'#178b82',trim:'#ff9b84',hair:'#392b40',width:.99},{id:'enzo',name:'Enzo',base:3,shirt:'#2475df',trim:'#f0f5ff',hair:'#302e35',width:.96},{id:'maya',name:'Maya',base:0,shirt:'#9655b4',trim:'#9cf2c2',hair:'#332041',width:1}];
(async()=>{const image=await sharp(path.join(root,'characters-colormap.png')).ensureAlpha().raw().toBuffer({resolveWithObject:true});
for(const def of defs){const map=new Map();function cloneNode(i){const n=structuredClone(g.nodes[i]),id=g.nodes.length;g.nodes.push(n);map.set(i,id);if(n.children)n.children=n.children.map(cloneNode);return id;}const wrapper=cloneNode(g.scenes[0].nodes[def.base]);g.nodes[wrapper].name='rival-'+def.id;g.nodes[wrapper].extras={rival:def.id};g.nodes[wrapper].scale=[def.width,1,1];
 const head=[...map.values()].find(i=>g.nodes[i].name==='head'),torso=[...map.values()].find(i=>g.nodes[i].name==='torso');
 for(const [old,id]of map){const n=g.nodes[id];if(n.skin!==undefined){const skin=structuredClone(g.skins[n.skin]);skin.joints=skin.joints.map(j=>map.get(j));n.skin=g.skins.push(skin)-1;}
 if(n.mesh===undefined)continue;if((def.id==='enzo'||def.id==='rafi')&&n.name==='head-mesh'){delete n.mesh;delete n.skin;n.name=def.id+'-retired-reference-head';continue;}const mesh=structuredClone(g.meshes[n.mesh]);mesh.name=def.id+'-'+mesh.name;
 for(const primitive of mesh.primitives){const uv=values(primitive.attributes.TEXCOORD_0),joints=values(primitive.attributes.JOINTS_0),weights=values(primitive.attributes.WEIGHTS_0),positions=values(primitive.attributes.POSITION),bind=values(g.skins[n.skin].inverseBindMatrices);const isHead=n.name==='head-mesh';const colors=uv.map(([u,v],i)=>{const x=Math.min(image.info.width-1,Math.max(0,Math.round(u*(image.info.width-1)))),y=Math.min(image.info.height-1,Math.max(0,Math.round(v*(image.info.height-1))));const p=(y*image.info.width+x)*4;let c=[...image.data.subarray(p,p+3)].map(x=>x/255);const [r,b,d]=c,saturation=Math.max(...c)-Math.min(...c);const joint=joints[i][weights[i].indexOf(Math.max(...weights[i]))];if(!isHead&&joint===3)c=rgb(def.shirt);else if(!isHead&&saturation>.12&&!(r>b*1.12&&b>d*1.15)){c=rgb(joint===1||joint===2?def.trim:def.shirt);}if(isHead&&((Math.max(...c)<.42&&saturation<.28)||(def.base!==1&&r>b*1.6&&b>d*1.2)))c=rgb(def.hair);if(def.id==='enzo'&&!isHead){const v=positions[i],m=bind[joint],local=[0,1,2].map(k=>m[k]*v[0]+m[k+4]*v[1]+m[k+8]*v[2]+m[k+12]);if(joint===3)c=rgb(def.shirt);if(joint===4||joint===5)c=rgb(Math.abs(local[0])<.19?(Math.abs(local[0])>.155?def.trim:def.shirt):ENZO_SKIN);if(joint===1||joint===2){if(local[1]>-.105)c=rgb('#121e35');else if(local[1]>-.145)c=rgb(ENZO_SKIN);}}return linear(c);});primitive.attributes.COLOR_0=accessor(colors,'VEC3');primitive.material=g.materials.push({name:def.id+'-vertex-palette',doubleSided:true,pbrMetallicRoughness:{metallicFactor:0,roughnessFactor:1}})-1;}
 n.mesh=g.meshes.push(mesh)-1;}
 if(def.id==='rafi')buildRafiHead(head,def);
 if(def.id==='enzo')buildEnzoHead(head,torso,map,def);

 if(def.id==='nika'){
  // A fitted, chamfered ribbon follows the head instead of a large box frame.
  const outline=(x,z)=>[[-x+.045,-z],[x-.045,-z],[x,-z+.045],[x,z-.045],[x-.045,z],[-x+.045,z],[-x,z-.045],[-x,-z+.045]];
  const outside=outline(.222,.181),inside=outline(.215,.174),v=[];
  for(let i=0;i<8;i++){const j=(i+1)%8;for(const [a,b,y,Y]of [[outside[i],outside[j],.253,.276],[inside[j],inside[i],.253,.276]])v.push([a[0],y,a[1]],[b[0],y,b[1]],[b[0],Y,b[1]],[a[0],y,a[1]],[b[0],Y,b[1]],[a[0],Y,a[1]]);for(const y of [.253,.276])v.push([outside[i][0],y,outside[i][1]],[outside[j][0],y,outside[j][1]],[inside[j][0],y,inside[j][1]],[outside[i][0],y,outside[i][1]],[inside[j][0],y,inside[j][1]],[inside[i][0],y,inside[i][1]]);}
  shape('nika-fitted-headband',v.map(([x,y,z])=>[x/1.7,y-.20,z/1.6]),def.trim,head);
  for(let j=0;j<3;j++)ellipsoid('nika-braid-'+j,[.12,-.025-j*.037,-.1],[.035,.03,.035],def.hair,head);
 }

 if(def.id==='maya'){for(const side of [-1,1]){ellipsoid('maya-bun-'+side,[side*.115,.135,-.025],[.065,.065,.065],def.hair,head);box('maya-bun-band-'+side,[side*.115,.108,-.025],[.085,.018,.085],def.trim,head);}box('maya-frames',[0,.005,.100],[.195,.052,.008],def.trim,head);for(const side of [-1,1]){box('maya-lens-'+side,[side*.043,.005,.105],[.066,.040,.004],'#3e245b',head);box('maya-glasses-hinge-'+side,[side*.105,.005,.095],[.025,.014,.012],def.trim,head);box('maya-glasses-temple-'+side,[side*.113,.005,.035],[.009,.014,.130],def.trim,head);}}
 // Raised jersey stripes and a chest badge add silhouette/detail beyond a palette swap.
 if(def.id!=='enzo'){box(def.id+'-jersey-left',[-.072,.06,.072],[.025,.12,.014],def.trim,torso);box(def.id+'-jersey-right',[.072,.06,.072],[.025,.12,.014],def.trim,torso);box(def.id+'-chest-badge',[.031,.083,.083],[.03,.025,.008],def.trim,torso);}
 for(const side of ['left','right']){const arm=[...map.values()].find(i=>g.nodes[i].name==='arm-'+side);box(def.id+'-wrist-'+side,[side==='left'?.08:-.08,-.015,.012],[.052,.04,.06],def.trim,arm);}
 g.scenes[0].nodes.push(wrapper);
}
g.buffers[0]={uri:'rival-characters.bin',byteLength:length};fs.writeFileSync(path.join(root,'rival-characters.gltf'),JSON.stringify(g));fs.writeFileSync(path.join(root,'rival-characters.bin'),Buffer.concat(buffers));fs.writeFileSync(path.join(root,'rival-models.json'),JSON.stringify(defs,null,2));console.log('Built four rigged variants: '+defs.map(d=>d.name).join(', '));})();
