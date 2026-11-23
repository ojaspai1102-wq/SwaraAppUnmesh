$ErrorActionPreference='Stop'
$project=Split-Path $PSScriptRoot -Parent
$jdk=Get-ChildItem -LiteralPath (Join-Path $project 'toolchain\jdk') -Directory | Select-Object -First 1
$platform=Join-Path $project 'toolchain\platform\android-35\android.jar'
$json=Join-Path $project 'toolchain\json-tests.jar'
$classes=Join-Path $project 'build\classes'
$testClasses=Join-Path $project 'build\test-classes'
New-Item -ItemType Directory -Path $testClasses -Force | Out-Null
$cp=$json+';'+$platform+';'+$classes
& (Join-Path $jdk.FullName 'bin\javac.exe') --release 8 -encoding UTF-8 -cp $cp -d $testClasses (Join-Path $PSScriptRoot 'NativeTest.java')
if($LASTEXITCODE -ne 0){throw 'Native test compilation failed'}
& (Join-Path $jdk.FullName 'bin\java.exe') -cp ($testClasses+';'+$cp) com.swarainstitute.app.NativeTest (Join-Path $project 'build\test-role-views.json') (Join-Path $project 'app\src\main\assets\ramashree-students.json')
if($LASTEXITCODE -ne 0){throw 'Native tests failed'}
