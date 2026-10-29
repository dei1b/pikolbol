const {chromium}=require('C:/Users/Dave/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.connectOverCDP('http://127.0.0.1:9229');
 try{
 const page=browser.contexts()[0].pages()[0];if(!page)throw new Error('No game WebView');
 console.log('Phone page:',page.url());
 console.log('SCREEN',await page.locator('body').innerText());
 console.log('BUTTONS',await page.locator('button').allTextContents());
 const play=page.getByRole('button',{name:'Play match',exact:true});
 if(await play.count())await play.click();
 console.log('AFTER CLICK',await page.locator('body').innerText());
 const nextPlay=page.getByRole('button',{name:'Play match',exact:true});
 if(await nextPlay.count())await nextPlay.click();
 await page.waitForSelector('[data-controls]');
 await page.locator('[data-match-overlay]').click({position:{x:180,y:300}});
 console.log('Game controls loaded:',await page.locator('[data-controls]').count());
 console.log('Game phase:',await page.locator('[data-match-overlay]').getAttribute('data-phase'));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
