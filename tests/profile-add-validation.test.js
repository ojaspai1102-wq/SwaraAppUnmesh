const path=require('path');
const assert=require('assert/strict');
const {pathToFileURL}=require('url');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/Unmesh/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

(async()=>{
  const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  const page=await browser.newPage({viewport:{width:390,height:844}});
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../app/src/main/assets/index.html')).href);
  await page.evaluate(()=>localStorage.clear());
  await page.reload();
  await page.locator('#institute').fill('Validation Music Academy');
  await page.locator('#pin').fill('123456');
  await page.locator('#confirmPin').fill('123456');
  await page.getByRole('button',{name:'Create institute',exact:true}).click();

  async function action(name,key){let selector=`[data-action="${name}"]`;if(key)selector+=`[data-key="${key}"]`;await page.locator(selector).first().click();}
  async function fill(values){for(const [key,value] of Object.entries(values)){const field=page.locator('#f-'+key);const tag=await field.evaluate(el=>el.tagName);if(tag==='SELECT')await field.selectOption(value);else await field.fill(String(value));}}
  async function submit(){await page.locator('#overlay form[data-form="record"] button[type="submit"]').click();}
  async function formError(){return page.locator('#overlay .form-error').innerText();}
  async function nav(target){await page.locator('[data-action="nav"][data-page="'+target+'"]').first().click();}

  await nav('students');
  await action('edit','students');
  assert.ok((await page.locator('#overlay').innerText()).includes('Add at least one trainer and one work packet before enrolling students.'));
  await action('edit','trainers');
  await submit();
  let message=await formError();
  assert.ok(message.includes('Enter the trainer name.'));
  assert.ok(message.includes('Enter the trainer mobile number.'));
  assert.ok(message.includes('Enter the trainer expertise.'));
  assert.ok(message.includes('Enter the trainer availability.'));
  await fill({name:'Ananya Rao',age:121,mobile:'invalid',email:'bad-email',expertise:'Hindustani vocals',availability:'Monday evenings',commission:101});
  await submit();
  message=await formError();
  assert.ok(message.includes('Age must be between 1 and 120.'));
  assert.ok(message.includes('Enter a valid trainer mobile number.'));
  assert.ok(message.includes('Enter a valid email address.'));
  assert.ok(message.includes('Commission cannot exceed 100%.'));
  await fill({age:36,mobile:'9000000001',email:'ananya@example.test',commission:20});
  await submit();
  assert.equal(await page.evaluate(()=>db.trainers.length),1);
  assert.equal(await page.locator('#toast').innerText(),'Trainer added successfully.');

  await nav('more');
  await nav('people');
  await action('edit','trainers');
  await fill({name:'Ananya Rao',mobile:'9000000001',expertise:'Hindustani vocals',availability:'Monday evenings',commission:20});
  await submit();
  assert.ok((await formError()).includes('A trainer with this name and mobile number already exists.'));
  assert.equal(await page.evaluate(()=>db.trainers.length),1);
  await action('close');
  await action('people-tab','artists');
  await action('edit','artists');
  await submit();
  message=await formError();
  assert.ok(message.includes('Enter the artist name.'));
  assert.ok(message.includes('Enter the artist mobile number.'));
  assert.ok(message.includes('Enter the artist expertise.'));
  assert.ok(message.includes('Enter the artist availability.'));
  await fill({name:'Rohan Desai',age:40,mobile:'9000000002',email:'rohan@example.test',expertise:'Tabla',category:'Instrumentalist',availability:'Weekends'});
  await submit();
  assert.equal(await page.evaluate(()=>db.artists.length),1);
  assert.equal(await page.locator('#toast').innerText(),'Artist added successfully.');
  await action('edit','artists');
  await fill({name:'Rohan Desai',mobile:'9000000002',expertise:'Tabla',category:'Instrumentalist',availability:'Weekends'});
  await submit();
  assert.ok((await formError()).includes('An artist with this name and mobile number already exists.'));
  assert.equal(await page.evaluate(()=>db.artists.length),1);
  await action('close');

  await nav('more');
  await nav('courses');
  await action('edit','courses');
  await fill({name:'Foundation vocals',subcategory:'Hindustani vocals',duration:6,durationUnit:'Months',sessions:12,fee:6000});
  await submit();
  assert.equal(await page.evaluate(()=>db.courses.length),1);

  await nav('students');
  await action('edit','students');
  await submit();
  message=await formError();
  assert.ok(message.includes('Enter the student name.'));
  assert.ok(message.includes('Enter the student age.'));
  assert.ok(message.includes('Enter the student mobile number.'));
  assert.ok(message.includes('Enter the student location.'));
  assert.ok(message.includes('Select an assigned trainer.'));
  assert.ok(message.includes('Select at least one course or work packet.'));
  const ids=await page.evaluate(()=>({trainer:db.trainers[0].id,course:db.courses[0].id}));
  await fill({name:'Meera Shah',age:130,mobile:'bad',email:'not-an-email',location:'Pune',guardianMobile:'wrong',trainerId:ids.trainer,courseIds:[ids.course],learningGoal:'Build vocal confidence'});
  await submit();
  message=await formError();
  assert.ok(message.includes('Age must be between 1 and 120.'));
  assert.ok(message.includes('Enter a valid student mobile number.'));
  assert.ok(message.includes('Enter a valid guardian mobile number.'));
  assert.ok(message.includes('Enter a valid email address.'));
  await page.screenshot({path:path.resolve(__dirname,'../dist/qa-student-enrolment-errors.png'),fullPage:true});
  await fill({age:14,mobile:'9000000003',email:'meera@example.test',guardianMobile:'9000000004'});
  await submit();
  assert.equal(await page.evaluate(()=>db.students.length),1);
  assert.equal(await page.locator('#toast').innerText(),'Student enrolled successfully.');

  await action('edit','students');
  await fill({name:'Meera Shah',age:14,mobile:'9000000003',location:'Pune',trainerId:ids.trainer,courseIds:[ids.course]});
  await submit();
  assert.ok((await formError()).includes('A student with this name and mobile number already exists.'));
  assert.equal(await page.evaluate(()=>db.students.length),1);
  assert.deepEqual(errors,[]);
  await browser.close();
  console.log('PASS add trainer, artist and student prerequisite, required-field, range, contact, duplicate and success-message validation.');
})().catch(error=>{console.error(error);process.exit(1);});
