// Client walkthrough: real app UI, isolated fictional dataset, no APK changes.
const scenes=[];
function scene(menu,title,benefit,beats){scenes.push({menu,title,benefit,beats:beats.map(([voice,ops=[],focus=null])=>({voice,ops,focus}))});}
const nav=p=>({nav:p}),click=s=>({click:s}),scroll=s=>({scroll:s}),select=(s,v)=>({select:[s,v]}),fill=(s,v)=>({fill:[s,v]}),close=()=>click('[data-action="close"]');
scene('Welcome','Ramashree Gurukul\nMusic Institute','More time for teaching. A clearer view of the business.',[
 ['Welcome to this demonstration for the owner of Ramashree Gurukul Music Institute. We will explore every menu and connect each one to a business benefit.'],
 ['All students, payments and concerts shown here are fictional. These are the actual app interface screens, captured in a browser preview, rather than on an Android phone.']
]);
scene('Home','Start with the\nbig picture','See collections, pending fees and upcoming work in one place.',[
 ['Home gives the owner a quick view of active students, fee collections, pending fees and event earnings.',[scroll('.metrics')],'.metrics'],
 ['Filter by month, course, trainer or student status to review a specific part of the institute.',[scroll('.toolbar')],'.toolbar'],
 ['Upcoming classes, concerts and student journeys help you decide what needs attention before the teaching day begins.',[scroll('.grid')]]
]);
scene('Students','Know each student’s\nlearning journey','Reduce scattered records and make parent conversations more informed.',[
 ['Students brings enrolment status, assigned trainers, courses and learning progress together. Search and status filters make follow-up easier.',[nav('students')]],
 ['Open a student to review contact details, guardian information and preferences. This gives your team context when speaking with a parent.',[click('[data-action="view"][data-key="students"][data-id="demo-s1"]')]],
 ['Learning progress and the session timeline show what has been completed and what remains. This supports better progress discussions and continuity between classes.',[scroll('#overlay .progress')]]
]);
scene('Students · enrolment','Capture preferences\nat enrolment','Match course, trainer and class timing to the student’s needs.',[
 ['The enrolment form captures music interests, class preferences, assigned trainer, work packets, fee terms and a learning goal.',[close(),click('[data-action="edit"][data-key="students"][data-id="demo-s1"]'),scroll('#f-musicStyle')]],
 ['Keeping these details together can reduce repeated questions and help the owner plan a suitable learning path.',[scroll('#f-learningGoal')],'.sheet']
]);
scene('Sessions','Plan classes.\nRecord what happened.','Make attendance and teaching follow-through visible.',[
 ['Sessions tracks planned, completed, missed, rescheduled and cancelled classes. The planned filter helps identify the next classes to deliver.',[close(),nav('sessions'),select('#status','Planned')]],
 ['Mark complete opens the class record with actual date and attendance. Notes, feedback, assignments and the next action preserve the teaching context.',[click('[data-action="complete"]'),scroll('#f-actualDate')]],
 ['Alternative dates and a reschedule reason help track changes. This can improve class coordination and make delivered sessions easier to review.',[scroll('#f-assignment')]]
]);
scene('Fees','Turn balances\ninto clear follow-ups','See who has paid, who owes money and when it was due.',[
 ['Fees separates paid, part paid, pending and overdue plans. Each record shows the amount collected and the remaining balance.',[close(),nav('fees')]],
 ['Filter overdue fees to focus collection follow-ups. Fee plans support discounts and due dates, so agreed terms remain visible.',[select('#status','Overdue')]],
 ['Open a fee record to review payment receipts and the balance. This can reduce uncertainty when a parent asks what has already been paid.',[select('#status',''),click('[data-action="view"][data-key="fees"][data-id="demo-f1"]'),scroll('#overlay .metrics')]]
]);
scene('Fees · collection','Record a payment\nwith a receipt','Create a traceable collection history.',[
 ['Here we record a fictional five hundred rupee UPI payment with a receipt number and a reference.',[click('[data-action="paid"]'),fill('#f-amount','500'),select('#f-mode','UPI'),fill('#f-receipt','RAM-DEMO-001'),fill('#f-remarks','Fictional client demonstration')]],
 ['After saving, the balance and receipt history update. The app records a payment made elsewhere; this version does not collect money through an online gateway.',[click('#overlay button[type="submit"]'),click('[data-action="view"][data-key="fees"][data-id="demo-f1"]'),scroll('#overlay h3:nth-of-type(1)')]]
]);
scene('More','Your institute’s\noperating toolkit','Reach people, courses, concerts, reminders, reports and settings.',[
 ['More opens six additional sections: People, Work packets, Concerts, Reminders, Reports and Settings. We will visit each of them.',[close(),nav('more')],'.menu']
]);
scene('More → People · Trainers','Match teaching capacity\nto student demand','Review expertise, availability and assigned workload.',[
 ['People has separate tabs for trainers and artists. Trainers shows expertise, available slots and the number of assigned students.',[nav('people')]],
 ['A trainer profile includes workload and estimated commission. Commission uses collections from currently assigned students, so the owner should review it before making a payout.',[click('[data-action="view"][data-key="trainers"][data-id="demo-t1"]'),scroll('#overlay .meta')]]
]);
scene('More → People · Artists','Keep performance\ntalent organised','Find suitable artists and review availability and payout expectations.',[
 ['The Artists tab keeps vocalists, instrumentalists, accompanists and other performance roles together.',[close(),click('[data-action="people-tab"][data-key="artists"]')]],
 ['Profiles include expertise, availability, stage preferences and expected payout. This helps shortlist talent and prepare a realistic event budget.',[click('[data-action="view"][data-key="artists"][data-id="demo-a1"]'),scroll('#overlay dl')]]
]);
scene('More → Work packets','Define what\nyou teach and charge','Make course scope and pricing easier to explain consistently.',[
 ['Work packets defines courses and packages with session counts and fees. The sample includes vocal, guitar, keyboard and workshop offerings.',[close(),nav('courses')]],
 ['A work packet can specify duration, prerequisites, batch size, pricing type and special rules. Clear terms help staff explain the offer consistently at enrolment.',[click('[data-action="view"][data-key="courses"][data-id="demo-c1"]'),scroll('#overlay dl')]]
]);
scene('More → Concerts','Plan programs\nand track their finances','Review participants, costs and organizer balances together.',[
 ['Concerts keeps program dates, venue, organizer and participating artists, students and trainers in one record.',[close(),nav('events'),click('[data-action="view"][data-key="events"][data-id="demo-e1"]')]],
 ['The financial view separates billed earnings from cash actually received, and shows total costs and the organizer balance. This distinction helps the owner assess both profitability and cash flow.',[scroll('#overlay .metrics')],'.sheet']
]);
scene('Concerts · expenses','Account for costs\nand artist payouts','Keep event spending visible when reviewing performance.',[
 ['The expense ledger records sound, venue, travel, marketing and artist payouts with dates and references.',[scroll('#overlay .list-row')]],
 ['Use Record expense or payout to capture each paid cost and link an artist when relevant. The business benefit is a clearer view of where event revenue is going.',[click('[data-action="expense"]'),select('#f-category','Artist payout'),select('#f-artistId','demo-a1'),fill('#f-amount','2500'),fill('#f-description','Illustrative artist payout — not saved')]]
]);
scene('More → Reminders','Stay ahead\nof follow-ups','Bring fees, classes, assignments and events into an attention list.',[
 ['Reminders gathers items due soon or needing attention. The Fee and Class tabs help prioritise collection calls and upcoming lessons.',[close(),nav('reminders'),click('[data-action="reminder-tab"][data-type="Fee"]')]],
 ['The Assignment and Event tabs support learning follow-through and program preparation.',[click('[data-action="reminder-tab"][data-type="Assignment"]')]],
 ['Prepare message creates editable reminder text. In the Android app, you choose a messaging app and confirm the recipient and delivery yourself; sending is not automatic.',[click('[data-action="reminder-tab"][data-type="Class"]'),click('[data-action="remind"]')]]
]);
scene('Reminders · events','Keep the next\nperformance in view','Avoid losing event follow-ups among everyday class work.',[
 ['The Event tab surfaces upcoming programs. Combined with the other reminder categories, it helps the owner maintain a practical follow-up routine.',[close(),click('[data-action="reminder-tab"][data-type="Event"]')]]
]);
scene('More → Reports · Summary','Review business\nperformance','Turn daily records into an owner’s review.',[
 ['Reports includes seven views. Business summary brings key activity and financial measures together, with a month filter for periodic reviews.',[nav('reports'),select('#report-type','summary')]]
]);
scene('Reports · Student progress','Review learning\ndelivery','Spot students who may need more support or follow-up.',[
 ['Student progress compares completed sessions with the target and remaining sessions. Use it to review learning delivery and guide parent conversations.',[select('#report-type','progress')]]
]);
scene('Reports · Trainer workload','Review teaching\nworkload','Discuss capacity and estimated commission using recorded activity.',[
 ['Trainer workload shows assigned students, delivered and pending sessions, collections and estimated commission. It supports capacity planning and payout review.',[select('#report-type','trainers')]]
]);
scene('Reports · Fee balances','Prioritise\ncollections','Use a consolidated balance list for structured follow-up.',[
 ['Fee balances consolidates charges, discounts, collections and outstanding amounts. This gives the owner a structured list for collection follow-ups.',[select('#report-type','fees')]]
]);
scene('Reports · Course revenue','Understand course\ncollections','Compare what different work packets are contributing.',[
 ['Course revenue groups financial activity by work packet. It helps compare collections and balances across offerings when reviewing pricing and demand.',[select('#report-type','courses')]]
]);
scene('Reports · Event profitability','Review each\nprogram’s return','Separate earnings from received cash when evaluating events.',[
 ['Event profitability compares revenue, costs, earnings and cash surplus. Use it to review which programs are financially worthwhile and which organizer payments remain pending.',[select('#report-type','events')]]
]);
scene('Reports · Artist payouts','Review recorded\nartist payments','Keep the owner’s payout review connected to event records.',[
 ['Artist payouts summarises recorded payments to performers. This supports payout reconciliation and conversations with participating artists.',[select('#report-type','artists')]],
 ['Every report offers CSV export for Excel and Save as PDF. These help share a review with an accountant or keep a periodic record.',[],'.actions']
]);
scene('More → Settings · Access','Control access\non the Android phone','Give people access appropriate to their responsibilities.',[
 ['Settings includes institute naming, PIN changes, locking and local account management. The Android app supports Owner, Admin, Trainer, Artist, Student or Parent, and Finance roles.',[nav('settings')]],
 ['Linked roles see their permitted records. Accounts belong to this phone and do not provide remote access or synchronise with another device.',[scroll('.card')]]
]);
scene('Settings · Protection','Protect records\nand prepare for a new phone','Keep a password-protected backup before changing devices.',[
 ['The Android app stores records in an encrypted local file. Settings offers password-protected backup and restore, including local accounts.',[scroll('.card:nth-of-type(2)')]],
 ['You can also enable a local daily reminder summary. Android may delay alerts to save battery. These phone features are shown here as interface options and were not executed in this browser recording.',[scroll('.card:nth-of-type(3)')]]
]);
scene('Settings · Samples & audit','Move from demo\nto daily use','Remove fictional samples and review the change history.',[
 ['Getting started lets the owner load or remove sample records. Remove fictional data before adding real institute records.',[scroll('.card:nth-of-type(4)')]],
 ['Audit history records changes with the user and time. It gives the owner a useful trail when reviewing what changed.',[scroll('.card:nth-of-type(5)')]]
]);
scene('Owner’s takeaway','Keep the music moving.\nKeep the business visible.','Student continuity • Class delivery • Collections • Event review',[
 ['For Ramashree Gurukul, the value is a connected view of students, teaching delivery, collections and performances, with fewer scattered records.',[nav('home')]],
 ['The current app works offline on one Android device. Multi-device synchronisation, online payments and automatic message delivery would require a future backend integration. This concludes the owner’s walkthrough.']
]);
module.exports=scenes;
if(require.main===module){const fs=require('fs'),path=require('path');const out=path.resolve(__dirname,'../build/client-demo');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'story.json'),JSON.stringify(scenes,null,2));console.log(scenes.length+' chapters; '+scenes.flatMap(s=>s.beats).length+' narrated screen steps; '+scenes.flatMap(s=>s.beats).map(b=>b.voice).join(' ').split(/\s+/).length+' words');}
