const path=require('path');
const assert=require('assert/strict');
const {pathToFileURL}=require('url');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/Unmesh/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

(async()=>{
  const file=path.resolve(__dirname,'../dist/Swara-Institute-Sharable.html');
  const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  const page=await browser.newPage({viewport:{width:390,height:844}});
  await page.goto(pathToFileURL(file).href);
  const dashboard=page.locator('.student-dashboard');
  assert.equal(await dashboard.locator('article.card').count(),94);
  await dashboard.scrollIntoViewIfNeeded();
  await page.screenshot({path:path.resolve(__dirname,'../dist/qa-student-dashboard.png')});
  await browser.close();
  console.log('PASS student dashboard displays all 94 profiles and produced a visual QA screenshot.');
})().catch(error=>{console.error(error);process.exit(1);});
