const {chromium}=require('C:/Users/Dave/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const sharp=require('C:/Users/Dave/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const fs=require('node:fs'),assert=require('node:assert/strict');
const observeOnly=process.argv.includes('--observe');
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});try{
 const page=await browser.newPage({viewport:{width:1200,height:850}}),errors=[],results=[];page.on('pageerror',e=>errors.push(e.message));
 for(const scenery of ['beach','rooftop','night','stadium']){
  await page.goto('http://127.0.0.1:8787');await page.getByRole('button',{name:'Quick match',exact:true}).click();await page.getByLabel('Scenery',{exact:true}).selectOption(scenery);await page.getByRole('button',{name:'Quick match',exact:true}).click();await page.waitForSelector('[data-controls]');
  await page.evaluate(()=>{const v=RallyScenery.view;v.frame=()=>{};v.camera.position.set(0,12,13);v.camera.lookAt(0,0,0);v.camera.updateMatrixWorld();v.camera.updateProjectionMatrix();v.ball.group.visible=true;v.ball.ball.visible=false;v.ball.shadow.visible=false;v.marker.visible=false;});
  for(const [name,x,z]of [['service box',1.3,4],['kitchen',1.3,1],['painted line',0,4]]){
   const point=await page.evaluate(({x,z})=>{const v=RallyScenery.view;v.ball.update({p:{x,y:1,z},v:{x:0,y:-1,z:0}},{x,z},'drive',v.camera.position,1/60);v.ball.ball.visible=false;v.ball.shadow.visible=false;v.ball.guide.visible=false;v.renderer.render(v.scene,v.camera);return v.project(x,.014,z);},{x,z});
   const off=await page.screenshot();
   await page.evaluate(()=>{const v=RallyScenery.view;v.ball.guide.visible=true;v.renderer.render(v.scene,v.camera);});const on=await page.screenshot();
   const crop={left:Math.max(0,Math.round(point.x)-35),top:Math.max(0,Math.round(point.y)-35),width:70,height:70};const a=await sharp(off).extract(crop).removeAlpha().raw().toBuffer(),b=await sharp(on).extract(crop).removeAlpha().raw().toBuffer();let changed=0;for(let i=0;i<a.length;i+=3)if(Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2])>30)changed++;
   results.push({scenery,location:name,changedPixels:changed});console.log(scenery,name,changed+' visible pixels');if(!observeOnly)assert(changed>15,`Landing guide hidden on ${scenery} ${name}`);
  }
  await page.screenshot({path:`paddleup-offline/landing-guide-${scenery}.png`});
  const toggles=await page.evaluate(()=>{const v=RallyScenery.view,e=RallyMods.engine,s=e.snapshot();s.phase='rally';s.ball={p:{x:1,y:1,z:3},v:{x:0,y:-1,z:0}};s.landing={x:1,z:4};v.setLandingGuide(false);v.ball.update(s.ball,v.guideOn?s.landing:null,'drive',v.camera.position,1/60);const off=!v.ball.guide.visible;v.setLandingGuide(true);v.ball.update(s.ball,v.guideOn?s.landing:null,'drive',v.camera.position,1/60);return{off,on:v.ball.guide.visible};});assert(toggles.off&&toggles.on);
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(`paddleup-offline/landing-guide-${observeOnly?'before':'check'}.json`,JSON.stringify({results,errors},null,2));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
