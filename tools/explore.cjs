const {chromium}=require('C:/Users/Dave/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:960},serviceWorkers:'block'});
 const external=[],errors=[],missing=[];
 await context.route('**/*',route=>{const u=new URL(route.request().url());if(!['127.0.0.1','localhost'].includes(u.hostname)&&['http:','https:'].includes(u.protocol)){external.push(u.href);return route.abort();}return route.continue();});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)missing.push([r.status(),r.url()]);});
 await page.goto('http://127.0.0.1:8787/');await page.waitForSelector('[data-screen="title"]',{timeout:45000});
 await page.screenshot({path:'paddleup-offline/title.png'});
 console.log('TITLE',await page.locator('body').innerText());
 await page.getByRole('button',{name:'Play match',exact:true}).click();
 console.log('MATCH SETUP',await page.locator('body').innerText());
 await page.screenshot({path:'paddleup-offline/setup.png'});
 await page.getByRole('button',{name:/^Play match$/i}).click();
 await page.waitForTimeout(2500);
 console.log('AFTER PLAY',await page.locator('body').innerText());
 console.log('BUTTONS',await page.locator('button').allTextContents());
 await page.screenshot({path:'paddleup-offline/game.png'});
 await page.keyboard.press('Space');await page.waitForTimeout(1500);await page.keyboard.press('l');await page.waitForTimeout(1000);await page.keyboard.press('Escape');
 console.log('PAUSED',await page.locator('body').innerText());
 console.log('ERRORS',errors,'MISSING',missing,'EXTERNAL',external);
 fs.writeFileSync('paddleup-offline/explore-report.json',JSON.stringify({errors,missing,external},null,2));
 await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1});

