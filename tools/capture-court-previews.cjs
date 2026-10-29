// Capture the actual offline venues, without HUD, for the quick-match picker.
const {chromium}=require('C:/Users/Dave/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path');
(async()=>{
 const out=path.resolve(__dirname,'../site/rally/court-previews');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:960,height:540},deviceScaleFactor:1});
  for(const id of ['stadium','beach','rooftop','night']){
   await page.goto('http://127.0.0.1:8787');
   await page.getByRole('button',{name:'Play match',exact:true}).click();
   await page.getByLabel('Scenery',{exact:true}).selectOption(id);
   await page.getByRole('button',{name:'Play match',exact:true}).click();
   await page.waitForSelector('[data-controls]');
   await page.waitForFunction(()=>!!globalThis.RallyScenery?.view);
   await page.evaluate(id=>{
    const v=RallyScenery.view;v.frame=()=>{};
    if(id==='night'||id==='rooftop'){v.camera.position.set(10,8,17);v.camera.lookAt(0,2,-3);}else{v.camera.position.set(9,13,17);v.camera.lookAt(0,0,0);}v.camera.updateMatrixWorld();v.camera.updateProjectionMatrix();
    v.renderer.render(v.scene,v.camera);
   },id);
   await page.addStyleTag({content:'[data-match-overlay]{visibility:hidden!important}'});
   await page.screenshot({path:path.join(out,id+'.jpg'),type:'jpeg',quality:85});
   console.log('Captured',id);
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
