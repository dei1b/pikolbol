const {chromium}=require('C:/Users/Dave/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs');
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});try{
 const page=await browser.newPage({viewport:{width:1280,height:800}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8787');await page.waitForSelector('[data-screen="title"]');await page.waitForTimeout(1500);
 console.log('Home sponsor elements:',await page.locator('[data-sponsor],[data-presented-by],a[href*="taplinc"]').count());
 await page.screenshot({path:'paddleup-offline/title-no-sponsor.png'});
 await page.getByRole('button',{name:/^Tournament/}).click();console.log('Tournament text:',await page.locator('body').innerText());
 await page.screenshot({path:'paddleup-offline/tournament-no-sponsor.png'});
 await page.goto('http://127.0.0.1:8787');await page.getByRole('button',{name:'Play match',exact:true}).click();await page.getByRole('button',{name:'Play match',exact:true}).click();await page.waitForSelector('[data-controls]');
 await page.screenshot({path:'paddleup-offline/court-no-sponsor.png'});console.log('JavaScript errors:',errors);
 fs.writeFileSync('paddleup-offline/sponsor-removal-report.json',JSON.stringify({sponsorElements:await page.locator('[data-sponsor],[data-presented-by],a[href*="taplinc"]').count(),errors},null,2));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
