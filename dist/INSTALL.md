# Swara Institute Android app

This app implements the core operations in your Music Institute App Requirements Document: students, trainers, artists, work packets, class sessions, fees, concert finances, dashboards and reminders. It works offline on Android 8.0 or later.

## Install on your phone

1. Copy `Swara-Institute-1.1.apk` to your Android phone using USB, your cloud drive, or another file transfer method.
2. Open the APK from the phone’s Files app. If Android asks, allow **Install unknown apps** for the app opening this file, then tap **Install**.
3. Open **Swara Institute**. Enter your institute name and choose an owner PIN with 6–12 digits. The owner username is `owner`.
4. You can rename the institute in **More → Settings**.

## Start using the app

1. Open **More → People** and add a trainer.
2. Open **More → Work packets** and create a course, session count and fee model.
3. Enrol a student from **Students** and assign the trainer and course. A student can have multiple courses.
4. Use **Sessions** to plan classes. **Mark complete** opens the form with present attendance and today’s actual date; add notes and assignments before saving. To reschedule, change the planned date, choose **Rescheduled**, and enter the reason. Prepare a class message in **More → Reminders**.
5. Create a fee plan in **Fees**. Record each payment using **Collect payment**, including the payment mode, receipt number and reference. The balance and overdue status are calculated automatically. Open a fee record to print its receipt or save it as a PDF.
6. Create a concert under **More → Concerts**. Open its details to add itemised expenses and artist payouts. **Net earnings** use ticket collections plus the amount billed to the organizer, less expenses. **Cash surplus** uses the organizer amount actually received.
7. Use **More → Reports** to export CSV files that open in Excel, or select **Save as PDF** and choose Android’s **Save as PDF** printer. Swipe wide tables sideways to see all columns.

Sample data is included by default when you create an institute in version 1.1. Leave Include sample students, classes, fees and concerts checked during setup. The sample institute contains 6 students, 3 trainers, 3 artists, 4 courses, 28 class sessions, 6 fee plans and 2 concerts. Dates are set relative to the day you load the samples. Existing installations can load samples from More → Settings without replacing other records. Remove sample data from Settings before entering real records. Removal preserves other records and refuses when a sample profile is linked to your own records or local accounts. Sample phone numbers and email addresses are non-routable placeholders.

## Accounts and reminders

The owner can create local Admin, Trainer, Artist, Student / Parent and Finance accounts in Settings. Trainer, artist and student accounts must be linked to a matching profile. Accounts and records belong to this installation; they do not sync with other phones.

Trainers see their assigned students and sessions, and their own estimated commission. Artists see their own profile, participating events and recorded payouts. Students or parents see their own classes, progress and fees. Admin accounts manage operations. Finance accounts update fee collections and event finances; they cannot change student profiles.

Open **Reminders** to prepare fee, class, assignment or event messages. **Choose app to send** opens Android’s share menu; choose a recipient and confirm sending in that app. No message is sent automatically.

Enable local alerts in Settings and grant notification permission if requested. A daily summary is scheduled around 9 am for due fees, classes and events within three days, and unfinished assignments. Battery saving can delay alerts. The alert account switches to the account that next signs in. Alerts can be turned off in Settings.

## Back up your records

The APK stores data in the app’s private directory, encrypted with a key in Android Keystore. PINs are salted and hashed. The app locks after being in the background for more than two minutes. Five incorrect PIN attempts trigger a one-minute wait.

Use **Settings → Create backup** and choose a strong password with at least 10 characters. Save the backup somewhere separate from the phone and keep its password. The backup includes records and local PIN accounts. To move to a new phone, install the APK, create an initial owner account, then restore the backup. Restore replaces the installation’s existing records and accounts; sign in with a PIN from the restored backup.

Uninstalling the app deletes its local data. A forgotten owner PIN cannot be recovered; an encrypted backup and its password allow you to restore after reinstalling and creating an initial owner account. Android automatic cloud backup is disabled.

Fee payments and event expense entries are preserved as immutable ledger records. Check details before saving. This version does not include transaction reversal/refund workflows. Trainer commission is an estimate on collections from students currently assigned to that trainer; review historical reassignment and your payment agreement before paying a trainer.

## Scope and verification

This is a first offline release. Payment modes record payments you received elsewhere; the app does not process payments. Multi-device synchronization, remote student logins, automatic WhatsApp/email delivery, payment gateway integration, multiple branches and AI features require backend integrations and are not included.

The APK’s signatures, ZIP alignment, Android package metadata and packaged assets were verified. Verification also covered 25 business-logic tests, 36 native permission/validation/cryptography/sample-data tests, a mobile owner workflow, six role-specific screen tests, and mobile/tablet layout inspection. The native permission and cryptography tests ran on the Java runtime; screen tests ran in Chromium. Installation, Android Keystore, file picking, printing and notification delivery have not been tested on a physical Android phone or emulator.
