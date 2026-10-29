const {chromium}=require('C:/Users/Dave/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try{
 const page=await browser.newPage({viewport:{width:1280,height:800}});
 for(const name of ['Practice','Tournament 8 teams · 3 rounds · win it all','Settings']){
 await page.goto('http://127.0.0.1:8787/');await page.waitForSelector('[data-screen="title"]');await page.getByRole('button',{name,exact:true}).click();
 console.log(name,await page.locator('body').innerText());console.log('BUTTONS',await page.locator('button').allTextContents());console.log('INPUTS',await page.locator('input').evaluateAll(els=>els.map(e=>({type:e.type,value:e.value,checked:e.checked,aria:e.getAttribute('aria-label')}))));
 }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
