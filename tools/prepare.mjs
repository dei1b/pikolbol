import {readFile, writeFile, readdir, mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'../site');
const seen=new Set();
const inventory=[];
async function walk(dir){for(const ent of await readdir(dir,{withFileTypes:true})){const file=path.join(dir,ent.name);if(ent.isDirectory())await walk(file);else inventory.push(file);}}
await walk(root);
const queue=inventory.filter(f=>/\.(js|css|html|gltf|webmanifest)$/.test(f));
async function acquire(url){
  if(seen.has(url))return;seen.add(url);
  const u=new URL(url,'https://paddleup.ph/');
  if(u.origin!=='https://paddleup.ph')return;
  const file=path.join(root,u.pathname);
  try {await readFile(file);return;}catch{}
  const response=await fetch(u);
  if(!response.ok)throw new Error(`Asset unavailable: ${response.status} ${url}`);
  const bytes=Buffer.from(await response.arrayBuffer());await mkdir(path.dirname(file),{recursive:true});await writeFile(file,bytes);
  inventory.push(file);if(/\.(js|css|gltf|webmanifest)$/.test(file))queue.push(file);
  console.log('Additional asset:',u.pathname,bytes.length);
}
for(let i=0;i<queue.length;i++){
  const file=queue[i],s=await readFile(file,'utf8');
  for(const m of s.matchAll(/(?:_next\/)?static\/(?:chunks|media)\/[a-zA-Z0-9_.-]+\.(?:js|css|woff2|png|svg)/g))await acquire('/_next/'+m[0].replace(/^_next\//,''));
  if(file.endsWith('.css'))for(const m of s.matchAll(/url\(["']?([^\s)"']+)/g)){
    if(m[1].startsWith('data:'))continue;
    await acquire(new URL(m[1],'https://paddleup.ph/'+path.relative(root,file).replaceAll('\\','/')).pathname);
  }
  if(file.endsWith('.gltf')){const g=JSON.parse(s);for(const obj of [...(g.buffers||[]),...(g.images||[])])if(obj.uri&&!obj.uri.startsWith('data:'))await acquire('/rally/'+obj.uri);}
  if(file.endsWith('.webmanifest'))for(const icon of JSON.parse(s).icons||[])await acquire(icon.src);
}
await acquire('/apple-icon.png');
await acquire('/_next/static/chunks/0cz1d0mv5g_q7.js');
const htmlPath=path.join(root,'index.html');let html=await readFile(htmlPath,'utf8');
if(!html.includes('src="/offline.js"'))html=html.replace('<head>','<head><script src="/offline.js"></script>');
await writeFile(htmlPath,html);
const manifest=[];for(const file of inventory){const bytes=await readFile(file);manifest.push({path:path.relative(root,file).replaceAll('\\','/'),bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});}
await writeFile(path.resolve(import.meta.dirname,'../asset-manifest.json'),JSON.stringify(manifest,null,2));
console.log('Local files:',manifest.length);
