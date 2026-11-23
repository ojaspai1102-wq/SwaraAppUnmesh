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
  await page.locator('#institute').fill('Edit Workflow Academy');
  await page.locator('#pin').fill('123456');
  await page.locator('#confirmPin').fill('123456');
  await page.getByRole('button',{name:'Create institute',exact:true}).click();
  await page.evaluate(()=>{
    const today=M.today();
    db.trainers=[
      {id:'t1',name:'Trainer One',age:35,mobile:'9000000101',email:'one@example.test',expertise:'Vocals',availability:'Monday',commission:20,status:'Active'},
      {id:'t2',name:'Trainer Two',age:40,mobile:'9000000102',email:'two@example.test',expertise:'Tabla',availability:'Tuesday',commission:25,status:'Active'}
    ];
    db.artists=[
      {id:'a1',name:'Artist One',age:30,mobile:'9000000201',email:'artist1@example.test',expertise:'Sitar',category:'Instrumentalist',availability:'Friday',status:'Active'},
      {id:'a2',name:'Artist Two',age:32,mobile:'9000000202',email:'artist2@example.test',expertise:'Tabla',category:'Instrumentalist',availability:'Saturday',status:'Active'}
    ];
    db.courses=[
      {id:'c1',name:'Foundation Vocals',category:'Beginner course',subcategory:'Vocals',duration:6,durationUnit:'Months',sessions:12,feeType:'Monthly',fee:6000,status:'Active'},
      {id:'c2',name:'Advanced Vocals',category:'Advanced course',subcategory:'Vocals',duration:1,durationUnit:'Years',sessions:24,feeType:'Course based',fee:12000,status:'Active'}
    ];
    db.students=[
      {id:'s1',name:'Student One',age:14,mobile:'9000000301',email:'student1@example.test',location:'Pune',enrollmentDate:today,status:'Active',trainerId:'t1',courseIds:['c1']},
      {id:'s2',name:'Student Two',age:16,mobile:'9000000302',email:'student2@example.test',location:'Mumbai',enrollmentDate:today,status:'Active',trainerId:'t2',courseIds:['c2']}
    ];
    db.events=[
      {id:'e1',name:'Morning Raagas',date:today,duration:2,durationUnit:'Days',organizer:'Cultural Circle',status:'Planned',artistIds:['a1'],studentIds:['s1'],trainerIds:['t1'],collections:0,organizerCharge:10000,organizerReceived:2000,expenses:[]},
      {id:'e2',name:'Evening Raagas',date:today,duration:1,durationUnit:'Days',organizer:'Music Club',status:'Planned',artistIds:['a2'],studentIds:['s2'],trainerIds:['t2'],collections:0,organizerCharge:8000,organizerReceived:1000,expenses:[]}
    ];
    db.fees=[{id:'f1',studentId:'s1',courseId:'c1',amount:6000,discount:0,dueDate:today,payments:[]}];
    localStorage.setItem('swara-preview',JSON.stringify(db));
    render();
  });

  async function nav(target){await page.locator(`[data-action="nav"][data-page="${target}"]`).first().click();}
  async function edit(key,id){await page.locator(`[data-action="edit"][data-key="${key}"][data-id="${id}"]`).click();}
  async function fill(values){for(const [key,value] of Object.entries(values)){const field=page.locator('#f-'+key);const tag=await field.evaluate(el=>el.tagName);if(tag==='SELECT')await field.selectOption(value);else await field.fill(String(value));}}
  async function submit(){await page.locator('#overlay form[data-form="record"] button[type="submit"]').click();}
  async function errorText(){return page.locator('#overlay .form-error').innerText();}
  async function expectToast(text){assert.equal(await page.locator('#toast').innerText(),text);}

  await nav('students');
  await edit('students','s1');
  assert.equal(await page.locator('#f-name').inputValue(),'Student One');
  await fill({age:0});await submit();assert.ok((await errorText()).includes('Age must be between 1 and 120.'));assert.equal(await page.evaluate(()=>db.students.find(x=>x.id==='s1').age),14);
  await fill({age:14,name:'Student Two',mobile:'9000000302'});await submit();assert.ok((await errorText()).includes('A student with this name and mobile number already exists.'));
  await fill({name:'Student One Updated',mobile:'9000000301',location:'Nashik'});await submit();await expectToast('Student updated successfully.');assert.equal(await page.evaluate(()=>db.students.find(x=>x.id==='s1').location),'Nashik');

  await nav('more');await nav('people');
  await edit('trainers','t1');
  assert.equal(await page.locator('#f-expertise').inputValue(),'Vocals');
  await fill({expertise:'Changed but cancelled'});await page.getByRole('button',{name:'Cancel'}).click();assert.equal(await page.evaluate(()=>db.trainers.find(x=>x.id==='t1').expertise),'Vocals');
  await edit('trainers','t1');await fill({commission:150});await submit();assert.ok((await errorText()).includes('Commission cannot exceed 100%.'));
  await fill({commission:22,availability:'Monday and Wednesday'});await submit();await expectToast('Trainer updated successfully.');assert.equal(await page.evaluate(()=>db.trainers.find(x=>x.id==='t1').commission),22);
  await edit('trainers','t1');await fill({name:'Trainer Two',mobile:'9000000102'});await submit();assert.ok((await errorText()).includes('A trainer with this name and mobile number already exists.'));await page.getByRole('button',{name:'Cancel'}).click();

  await page.locator('[data-action="people-tab"][data-key="artists"]').click();
  await edit('artists','a1');await fill({availability:''});await submit();assert.ok((await errorText()).includes('Enter the artist availability.'));
  await fill({availability:'Friday evening',stagePreference:'Acoustic stage'});await submit();await expectToast('Artist updated successfully.');assert.equal(await page.evaluate(()=>db.artists.find(x=>x.id==='a1').stagePreference),'Acoustic stage');
  await edit('artists','a1');await fill({name:'Artist Two',mobile:'9000000202'});await submit();assert.ok((await errorText()).includes('An artist with this name and mobile number already exists.'));await page.getByRole('button',{name:'Cancel'}).click();

  await nav('more');await nav('courses');
  await edit('courses','c1');
  assert.equal(await page.locator('#f-durationUnit').inputValue(),'Months');
  await fill({sessions:0});await submit();assert.ok((await errorText()).includes('Sessions must be a positive whole number.'));
  await fill({sessions:12,name:'Advanced Vocals'});await submit();assert.ok((await errorText()).includes('A work packet with this name already exists.'));
  await fill({name:'Foundation Vocals Updated',duration:9,durationUnit:'Months'});await submit();await expectToast('Work packet updated successfully.');assert.equal(await page.evaluate(()=>db.courses.find(x=>x.id==='c1').duration),9);

  await nav('more');await nav('events');
  await edit('events','e1');
  assert.equal(await page.locator('#f-organizer').inputValue(),'Cultural Circle');
  await fill({duration:''});await submit();assert.ok((await errorText()).includes('Enter the event duration.'));
  await fill({duration:2,organizerCharge:1000,organizerReceived:2000});await submit();assert.ok((await errorText()).includes('Organizer received cannot exceed the organizer charge.'));
  const eventDate=await page.locator('#f-date').inputValue();await fill({name:'Evening Raagas',date:eventDate,organizerCharge:10000,organizerReceived:2000});await submit();assert.ok((await errorText()).includes('A concert with this name and date already exists.'));
  await fill({name:'Morning Raagas Updated',venue:'Main Auditorium'});await submit();await expectToast('Concert updated successfully.');assert.equal(await page.evaluate(()=>db.events.find(x=>x.id==='e1').venue),'Main Auditorium');

  await nav('more');await nav('reminders');
  await page.locator('[data-action="remind"]').first().click();
  assert.ok((await page.locator('#message').inputValue()).length>0);
  await page.locator('#message').fill('');await page.locator('[data-action="share"]').click();assert.equal(await page.locator('#reminder-error').innerText(),'Enter a reminder message before sharing.');
  await page.evaluate(()=>{const el=document.querySelector('#message');el.removeAttribute('maxlength');el.value='x'.repeat(8001);});await page.locator('[data-action="share"]').click();assert.equal(await page.locator('#reminder-error').innerText(),'Keep the reminder message within 8,000 characters.');
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:text=>{window.__copiedReminder=text;return Promise.resolve();}}}));
  await page.locator('#message').fill('Edited reminder for the family.');
  await page.screenshot({path:path.resolve(__dirname,'../dist/qa-edit-reminder.png'),fullPage:true});
  await page.locator('[data-action="share"]').click();await page.waitForTimeout(50);await expectToast('Edited reminder copied.');assert.equal(await page.evaluate(()=>window.__copiedReminder),'Edited reminder for the family.');

  assert.deepEqual(errors,[]);
  await browser.close();
  console.log('PASS edit student, trainer, artist, work packet, concert and reminder validation, cancellation, duplicate protection and success messages.');
})().catch(error=>{console.error(error);process.exit(1);});
