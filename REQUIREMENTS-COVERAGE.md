# Requirements coverage

| Requirement | Implemented behavior |
|---|---|
| Student profiles and preferences | Create/edit profiles, guardian details, age, location, contact, enrolment, music preferences, goals, status, multiple courses and trainer assignment, with prerequisite, contact, duplicate and required-field validation and record-specific success messages. |
| Trainer profiles and workload | Profiles, expertise, availability, commission percentage, assigned students, completed/pending session reports and estimated commission on collections, with contact, range, duplicate and required-field validation. |
| Artist profiles | Contacts, expertise, required artist categories, availability, stage preference, payout expectation, participating events and recorded payouts, with contact, duplicate and required-field validation. |
| Work packets and courses | Categories/subcategories, session targets, numeric duration with Days/Months/Years unit, fee model, fee amount, batch size, prerequisites, rules and status, with required-field, range and duplicate-name edit validation. |
| Session tracking | Planned/actual dates, time, attendance, completion, notes/feedback, assignment status, next action, next date, reschedule reasons and alternative dates. |
| Fees and receipts | Charged amount, discount, multiple payment receipts, payment mode/reference, balance, due date, paid/part-paid/overdue calculations and PDF receipts. |
| Student registration | Registration records linked to an existing student, with positive amount, Registration date, payment mode, unique receipt number, remarks, printable receipt, reports and immutable recorded payments. Payments are received externally and recorded offline. |
| Programs and concerts | Event date/time, venue, numeric duration with Days/Months/Years unit, organizer, participating people, status, ticket collections, organizer charges/receipts, itemised costs and payouts, earned profit and cash surplus, with edit validation and duplicate name/date protection. |
| Record editing | Student, trainer, artist, work packet and concert forms preserve saved data after cancellation or rejected input, enforce required, range, contact, linked-record and duplicate rules, and show record-specific success confirmations. |
| Notifications | Prepared and editable share messages for fees/classes/assignments/events with blank and 8,000-character limits, plus optional daily Android summaries; sending is confirmed manually in the selected app. |
| Owner dashboard | Active students, collections, outstanding fees, event earnings, planned classes, upcoming events and progress; month/course/trainer/student-status filters. |
| Role restrictions | Native enforcement for Owner/Admin/Trainer/Artist/Student or Parent/Finance accounts, with profile assignment for restricted roles. Local accounts on one installation. |
| Session controls | Lock returns to sign in; Exit app requires confirmation and closes the Android task without deleting saved institute records. |
| Reports | Student progress, trainer workload/commission, fee balances, course revenue, event profit, artist payouts and institute summary; month filters where relevant, CSV/Excel and Android PDF printing. |
| Audit and backup | Latest 500 audit entries, logged account/institute/record changes, encrypted device storage, protected PINs, throttled login, encrypted portable backup/restore. |

## Deliberate release limits

- Single institute per installation. No shared server, remote logins, live cross-device updates or branch consolidation.
- Prepared reminders and local notifications. No unattended messaging, email server, SMS service or WhatsApp Business integration.
- Registration and fee cash/UPI/bank/card payments are records of payments received externally, with no gateway processing.
- Trainer commission uses current assignments and a percentage of student collections. Per-session/mixed payroll, historical assignment accounting and trainer payout settlement need additional ledger design.
- Event expenses are paid-cost records. Separate vendor accounts payable and accrued liabilities are not implemented.
- Payment/expense records cannot be silently edited or removed. Refund/reversal workflows are not implemented.
- One fee record per charge with explicit due date. Recurring invoices are created manually.
- Session targets come from currently enrolled work packets. Re-enrolment in the same work packet as a separate cohort needs an enrolment ledger.
- Audit history is local and retained for 500 entries, not an external tamper-proof compliance log.
- Application installation and Android-only integration testing on a phone or emulator remain unverified. Automated tests and browser visual inspection passed.

The document’s acceptance criteria for creating/updating records, assigning trainers/courses, tracking sessions and fees, preparing reminders, creating concerts and showing business/progress dashboards are implemented in this offline release. Later delivery phases remain backend work.
