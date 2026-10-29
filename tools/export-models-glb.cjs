const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const directory=path.resolve(__dirname,'../site/rally');
const source=JSON.parse(fs.readFileSync(path.join(directory,'rival-characters.gltf'),'utf8'));
function exportGlb(filename,root){
 const model=structuredClone(source),parts=[],offsets=[];let size=0;
 const append=bytes=>{const pad=(4-size%4)%4;if(pad){parts.push(Buffer.alloc(pad));size+=pad;}const offset=size;parts.push(bytes);size+=bytes.length;return offset;};
 const read=uri=>uri.startsWith('data:')?Buffer.from(uri.split(',')[1],'base64'):fs.readFileSync(path.join(directory,decodeURIComponent(uri)));
 for(const buffer of model.buffers)offsets.push(append(read(buffer.uri)));
 for(const view of model.bufferViews){view.byteOffset=(view.byteOffset||0)+offsets[view.buffer];view.buffer=0;}
 for(const image of model.images||[]){if(!image.uri)continue;const bytes=read(image.uri),offset=append(bytes);image.bufferView=model.bufferViews.push({buffer:0,byteOffset:offset,byteLength:bytes.length})-1;image.mimeType=image.mimeType||'image/png';delete image.uri;}
 model.buffers=[{byteLength:size}];
 if(root!==undefined){
  model.scenes=[{name:filename.replace('.glb',''),nodes:[root]}];model.scene=0;
  // The game reuses clips by bone name. Retarget them to this exported rig.
  const bones=new Map();const visit=i=>{bones.set(model.nodes[i].name,i);for(const child of model.nodes[i].children||[])visit(child);};visit(root);
  for(const animation of model.animations||[])for(const channel of animation.channels){const name=source.nodes[channel.target.node].name;if(!bones.has(name))throw Error('Missing animated bone '+name);channel.target.node=bones.get(name);}
 }
 const json=Buffer.from(JSON.stringify(model)),jsonPad=(4-json.length%4)%4,jsonChunk=Buffer.concat([json,Buffer.alloc(jsonPad,0x20)]);
 const bin=Buffer.concat(parts),binPad=(4-bin.length%4)%4,binChunk=Buffer.concat([bin,Buffer.alloc(binPad)]);
 const header=Buffer.alloc(12);header.writeUInt32LE(0x46546c67,0);header.writeUInt32LE(2,4);header.writeUInt32LE(12+8+jsonChunk.length+8+binChunk.length,8);
 const jh=Buffer.alloc(8);jh.writeUInt32LE(jsonChunk.length,0);jh.writeUInt32LE(0x4e4f534a,4);
 const bh=Buffer.alloc(8);bh.writeUInt32LE(binChunk.length,0);bh.writeUInt32LE(0x004e4942,4);
 const output=Buffer.concat([header,jh,jsonChunk,bh,binChunk]);fs.writeFileSync(path.join(directory,filename),output);
 // Read back the container and ensure every dependency is embedded.
 const parsed=JSON.parse(output.subarray(20,20+output.readUInt32LE(12)).toString());assert.equal(output.readUInt32LE(8),output.length);assert(parsed.buffers.every(b=>!b.uri));assert(parsed.images.every(i=>i.bufferView!==undefined&&!i.uri));for(const view of parsed.bufferViews)assert((view.byteOffset||0)+view.byteLength<=parsed.buffers[0].byteLength);
 console.log(filename,output.length+' bytes; geometry, texture and animations embedded');
}
exportGlb('rival-characters.glb');
for(const name of ['rafi','nika','enzo','maya']){const root=source.nodes.findIndex(n=>n.name==='rival-'+name);assert(root>=0);exportGlb(name+'.glb',root);}
