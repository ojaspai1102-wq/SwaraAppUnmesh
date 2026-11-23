# Swara Institute

An offline Android app built from `Music_Institute_App_Requirements_Document.docx` in `C:\01 - Users\02 - Manjushri\My Music project`. The latest update is `dist/Swara-Institute-1.12-Registration-Date.apk`. It can update earlier installations because it retains the Android package and signing identity while using a newer version code. Version 1.12 labels the date on the Registration form and registration report as **Registration date**. It retains registration payments, printable receipts, immutable ledger validation, tested edit validation and all previous features. See [INSTALL.md](INSTALL.md) for installation and daily use.

## Project layout

- `app/src/main/java/com/swarainstitute/app`: Android activity, encrypted persistence, native access controls, backup encryption and reminder receivers.
- `app/src/main/assets`: self-contained responsive interface and business calculations. No network resources, CDN libraries or internet permission are used.
- `app/src/main/res`: vector icons and Android theme.
- `tests`: business, permission, backup and browser workflow tests.
- `build.ps1`: compile, package, sign and verify the APK using the Android command-line tools.
- `setup-toolchain.ps1`: download the pinned Java 17 compiler, Android API 35 platform and Android Build Tools 35.0.1, then verify their published checksums.

The native layer validates and filters records independently of interface controls. An authenticated account is required for reads, writes, exports and backups. File storage uses AES-256-GCM and Android Keystore; encrypted portable backups use PBKDF2-HMAC-SHA256 with 210,000 iterations and AES-256-GCM. PIN hashes use independently salted PBKDF2-HMAC-SHA256 with 120,000 iterations.

## Build on Windows

From this folder in PowerShell:

```powershell
.\setup-toolchain.ps1
.\build.ps1
```

If PowerShell’s execution policy blocks downloaded scripts, review the scripts and run them with the execution policy appropriate to your environment. No system-wide Java or Android Studio installation is required. The tools are extracted inside `toolchain`.

The first build creates a private release signing key in `.signing`. **Retain that directory privately** so later APK versions can update this installation without uninstalling it. The source ZIP excludes signing keys, credentials, downloaded tools, build outputs and test screenshots. Rebuilding an extracted source ZIP without the original signing key produces a different signing identity. Increase the manifest version code for future releases.

The build follows Android’s [AAPT2 packaging workflow](https://developer.android.com/tools/aapt2) and [apksigner signing and verification](https://developer.android.com/tools/apksigner). Java binaries are from [Eclipse Temurin](https://adoptium.net/temurin/releases/). Android SDK tools retain their original licenses in the downloaded distributions.

## Tests

```powershell
node .\tests\model.test.js
.\tests\native-test.ps1
node .\tests\edit-workflows.test.js
node .\tests\registration.test.js
node .\tests\ui.test.js
node .\tests\roles-ui.test.js
```

Native tests need the upstream JSON implementation in `toolchain/json-tests.jar` from `https://repo.maven.apache.org/maven2/org/json/json/20240303/json-20240303.jar`. It is only a desktop test dependency and is not packaged into the APK. Run a build before native tests. Role screen tests use sanitized fixture views exported by native tests. Browser tests require Playwright and a Chromium browser; set `PLAYWRIGHT_MODULE` to your module path and `CHROME_PATH` to your browser executable if they differ from the local bundled paths.

Browser-only preview uses `localStorage` and explicitly identifies itself as a preview. Its PIN field does not provide security. Android mode uses only native encrypted persistence and native authentication, and disables browser DOM storage. Do not use browser preview for real institute records.

See [REQUIREMENTS-COVERAGE.md](REQUIREMENTS-COVERAGE.md) for scope and limitations.

## GitHub and privacy

The repository is designed to be shared without institute records or release credentials. The private `ramashree-students.json` import, generated APK/HTML files, downloaded Android toolchain, build output, test screenshots, signing keystore and signing password are excluded by `.gitignore`.

A fresh clone starts with an empty student list. Run `setup-toolchain.ps1` and `build.ps1` to create an APK signed with a new local key. Do not copy another institute's student data, encrypted backups or signing directory into Git. Release APKs may be attached separately to a GitHub Release after confirming they contain no private student import.
