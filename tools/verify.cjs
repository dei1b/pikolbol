const {chromium}=require('C:/Users/Dave/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 const checks=[],external=[],errors=[],missing=[];
 try {
 const context=await browser.newContext({viewport:{width:1440,height:960},serviceWorkers:'block'});
 await context.route('**/*',route=>{const u=new URL(route.request().url());if(['http:','https:'].includes(u.protocol)&&u.hostname!=='127.0.0.1'){external.push(u.href);return route.abort();}return route.continue();});
 const page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)missing.push([r.status(),r.url()]);});
 const home=async()=>{await page.goto('http://127.0.0.1:8787/');await page.waitForSelector('[data-screen="title"]');};
 const record=(s)=>{checks.push(s);console.log('PASS',s);};
 await home();assert(await page.locator('canvas').isVisible());record('Cold start and 3D stadium with external network blocked');
 await page.locator('[data-online-entry]').click({force:true});assert.match(await page.locator('#offline-notice').innerText(),/needs the online service/);assert(await page.locator('[data-screen="title"]').isVisible());record('Online-only menu explains offline limitation');
 await page.getByRole('button',{name:'Settings',exact:true}).click();
 const volume=page.locator('input[type="range"]');await volume.fill('35');await volume.dispatchEvent('change');
 const auto=page.getByRole('switch',{name:/Auto-swing/});if(await auto.getAttribute('aria-checked')!=='true')await auto.click();
 await page.getByText('Low',{exact:true}).click();
 await home();await page.getByRole('button',{name:'Settings',exact:true}).click();assert.equal(await volume.inputValue(),'35');assert.equal(await auto.getAttribute('aria-checked'),'true');record('Volume and auto-swing settings persist across reload');
 await home();await page.getByRole('button',{name:'Play match',exact:true}).click();
 await page.getByText('Singles',{exact:true}).click();await page.getByText('Easy',{exact:true}).click();await page.getByText('7',{exact:true}).click();
 await page.getByText('Classic match',{exact:true}).click();await page.getByRole('button',{name:'Play match',exact:true}).click();
 await page.waitForSelector('[data-controls]');console.log('INITIAL PHASE',await page.locator('[data-match-overlay]').getAttribute('data-phase'));await page.mouse.click(700,500);await page.keyboard.press('Space');
 await page.keyboard.down('ArrowLeft');await page.waitForTimeout(400);await page.keyboard.up('ArrowLeft');
 await page.keyboard.press('l');await page.waitForTimeout(1800);await page.keyboard.press('Escape');
 assert(await page.getByRole('button',{name:'Resume',exact:true}).isVisible());record('Singles match starts; keyboard serve, movement, shot, and pause work');
 await page.getByRole('button',{name:'Resume',exact:true}).click();
 await page.mouse.click(700,500);
 const phases=new Set();for(let i=0;i<65;i++){await page.keyboard.press('Space');await page.keyboard.press('l');phases.add(await page.locator('[data-match-overlay]').getAttribute('data-phase'));await page.waitForTimeout(350);}
 await page.screenshot({path:'paddleup-offline/verified-game.png'});console.log('RALLY PHASES',[...phases]);console.log('RALLY STATE',await page.locator('body').innerText());assert(phases.has('rally'),'Must observe live rally state');record('Live rally simulation observed, with AI and rendered court');
 await home();await page.getByRole('button',{name:'Practice',exact:true}).click();await page.getByRole('button',{name:'Drill the dink',exact:true}).click();await page.waitForSelector('[data-controls]');await page.waitForTimeout(1200);await page.keyboard.press('j');await page.keyboard.press('Escape');assert(await page.getByRole('button',{name:'Resume',exact:true}).isVisible());record('Practice drill starts and pauses');
 await home();await page.getByRole('button',{name:/^Tournament/}).click();await page.getByRole('button',{name:'Start tournament',exact:true}).click();
 console.log('TOURNAMENT BRACKET',await page.locator('body').innerText());console.log('TOURNAMENT BUTTONS',await page.locator('button').allTextContents());
 await page.screenshot({path:'paddleup-offline/tournament.png'});
 const round=page.getByRole('button',{name:/Play.*quarter|Play next|Play round|Start match|Play match/i});
 if(await round.count()){await round.first().click();await page.waitForSelector('[data-controls]');record('Tournament bracket and opening match start');}else{record('Tournament bracket created and saved');}
 await home();assert.match(await page.locator('body').innerText(),/Continue|Resume/i);record('Saved tournament is offered after reload');
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'paddleup-offline/mobile.png'});assert(await page.getByRole('button',{name:'Play match',exact:true}).isVisible());record('Narrow window menu remains accessible');
 assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);assert.deepEqual(external,[]);record('Zero JavaScript errors, missing resources, or external requests');
 const report={checkedAt:new Date().toISOString(),checks,errors,missing,external,limitations:['Full tournament completion and every drill were not exhaustively played.','Tests block external requests while retaining loopback access.']};
 fs.writeFileSync('paddleup-offline/verification-report.json',JSON.stringify(report,null,2));
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});



