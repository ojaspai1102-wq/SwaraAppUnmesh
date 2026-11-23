const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{pathToFileURL}=require('url');
const {chromium}=require('C:/Users/Unmesh/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const scenes=require('./demo-story'),root=path.resolve(__dirname,'..'),out=path.join(root,'build/client-demo');
fs.mkdirSync(path.join(out,'screens'),{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const context=await browser.newContext({viewport:{width:430,height:840},deviceScaleFactor:2,locale:'en-IN',timezoneId:'Asia/Kolkata'});
 const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(pathToFileURL(path.join(root,'app/src/main/assets/index.html')).href);
 await p.locator('#institute').fill('Ramashree Gurukul');await p.locator('#pin').fill('123456');await p.locator('#confirmPin').fill('123456');
 await p.getByRole('button',{name:'Create institute',exact:true}).click();
 await p.addStyleTag({content:'*,*::before,*::after{scroll-behavior:auto!important;animation:none!important;transition:none!important}body{scrollbar-width:none}.sheet{scrollbar-width:none}.brand b{font-size:16px}'});
 assert.equal(await p.evaluate(()=>db.students.length),6);
 let index=0;
 for(const s of scenes)for(const b of s.beats){
  for(const op of b.ops){
   if(op.nav){await p.evaluate(()=>{document.querySelector('[data-action="close"]')?.click();window.scrollTo(0,0)});let el=p.locator(`[data-action="nav"][data-page="${op.nav}"]`);if(!(await el.count())){await p.locator('.nav [data-page="more"]').click();el=p.locator(`[data-action="nav"][data-page="${op.nav}"]`);}await el.first().click();await p.evaluate(()=>window.scrollTo(0,0));}
   else if(op.click){const modalLoc=p.locator('#overlay '+op.click);await (await modalLoc.count()?modalLoc:p.locator(op.click)).first().click();}
   else if(op.select)await p.locator(op.select[0]).selectOption(op.select[1]);
   else if(op.fill)await p.locator(op.fill[0]).fill(op.fill[1]);
   else if(op.scroll)await p.locator(op.scroll).first().evaluate(el=>el.scrollIntoView({block:'center'}));
   await p.waitForTimeout(130);
  }
  if(index===18)await p.waitForTimeout(4200); // Let the successful payment toast disappear.
  await p.waitForTimeout(220);
  b.screen=`screens/${String(index).padStart(3,'0')}.png`;
  b.screenText=(await p.locator('body').innerText()).slice(0,20000);
  b.highlight=null;
  if(b.focus){const loc=p.locator(b.focus).first();if(await loc.count()){const box=await loc.boundingBox();if(box)b.highlight=box;}}
  await p.screenshot({path:path.join(out,b.screen),animations:'disabled'});
  if(s.menu.startsWith('Reports')){
   const table=p.locator('.table-wrap');
   if(await table.count()&&await table.evaluate(el=>el.scrollWidth>el.clientWidth+20)){
    await table.evaluate(el=>el.scrollLeft=el.scrollWidth);
    b.alternateScreen=`screens/${String(index).padStart(3,'0')}-right.png`;
    await p.screenshot({path:path.join(out,b.alternateScreen),animations:'disabled'});
    await table.evaluate(el=>el.scrollLeft=0);
   }
  }
  console.log(String(index).padStart(3,'0')+' '+s.menu);index++;
 }
 assert.equal(await p.evaluate(()=>db.fees.find(f=>f.id==='demo-f1').payments.some(v=>v.receipt==='RAM-DEMO-001')),true);
 assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(out,'story.json'),JSON.stringify(scenes,null,2));
 await browser.close();console.log('PASS all screens captured; fictional collection saved; no JavaScript errors.');
})().catch(e=>{console.error(e);process.exit(1)});
