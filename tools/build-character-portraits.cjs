// Re-run after changing models; these portraits use the game's own loader and materials.
const {chromium}=require('C:/Users/Dave/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
(async()=>{
 const root=path.resolve(__dirname,'..'),out=path.join(root,'site/rally/portraits');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try{
  const page=await browser.newPage();await page.goto('http://127.0.0.1:8787');
  await page.waitForFunction(()=>globalThis.RallyModelAssets?.templates.length===10);
  const images=await page.evaluate(()=>{
   const assets=RallyModelAssets,K=assets.previewKit,renderer=new K.Renderer({antialias:true,alpha:true,preserveDrawingBuffer:true});
   renderer.setSize(256,256);renderer.setClearColor('#10201b',0);
   const scene=new K.Scene(),camera=new K.Camera(32,1,.01,100);camera.position.set(0,1.12,2.45);camera.lookAt(0,1.12,0);
   scene.add(new K.Hemi('#ffffff','#365646',2));const light=new K.Light('#fff1dc',2.1);light.position.set(4,7,6);scene.add(light);
   const images=[];
   for(let i=0;i<10;i++){
    const actor=assets.actor(i);scene.add(actor.root);actor.root.rotation.y=-.12;actor.root.updateMatrixWorld(true);
    renderer.render(scene,camera);images.push(renderer.domElement.toDataURL('image/png'));actor.dispose();
   }
   renderer.dispose();return images;
  });
  images.forEach((data,i)=>fs.writeFileSync(path.join(out,i+'.png'),Buffer.from(data.split(',')[1],'base64')));
  const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'site/rally',file))).digest('hex');
  fs.writeFileSync(path.join(out,'source.json'),JSON.stringify({models:hash('rival-characters.gltf'),geometry:hash('rival-characters.bin'),count:images.length},null,2));
  console.log('Rendered all ten portraits from the current game models');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
