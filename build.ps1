param([string]$ProjectRoot=$PSScriptRoot)
$ErrorActionPreference='Stop'
$jdk = Get-ChildItem -LiteralPath (Join-Path $ProjectRoot 'toolchain\jdk') -Directory | Select-Object -First 1
$java = Join-Path $jdk.FullName 'bin\java.exe'
$javac = Join-Path $jdk.FullName 'bin\javac.exe'
$jar = Join-Path $jdk.FullName 'bin\jar.exe'
$keytool = Join-Path $jdk.FullName 'bin\keytool.exe'
$bt = Join-Path $ProjectRoot 'toolchain\build-tools\android-15'
$platform = Join-Path $ProjectRoot 'toolchain\platform\android-35\android.jar'
$main = Join-Path $ProjectRoot 'app\src\main'
$build = Join-Path $ProjectRoot 'build'
$dist = Join-Path $ProjectRoot 'dist'
foreach ($dir in @($build,$dist,(Join-Path $build 'classes'),(Join-Path $build 'generated'),(Join-Path $build 'dex'))) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
function Check-Exit([string]$stage){ if ($LASTEXITCODE -ne 0) { throw "$stage failed with exit code $LASTEXITCODE" } }
& (Join-Path $bt 'aapt2.exe') compile --dir (Join-Path $main 'res') -o (Join-Path $build 'resources.zip')
Check-Exit 'Resource compilation'
& (Join-Path $bt 'aapt2.exe') link -o (Join-Path $build 'unsigned.apk') --manifest (Join-Path $main 'AndroidManifest.xml') -I $platform --java (Join-Path $build 'generated') -A (Join-Path $main 'assets') (Join-Path $build 'resources.zip')
Check-Exit 'APK resource linking'
$sources = @(Get-ChildItem -LiteralPath (Join-Path $main 'java'),(Join-Path $build 'generated') -Filter '*.java' -Recurse | ForEach-Object { $_.FullName })
& $javac -encoding UTF-8 --release 8 -classpath $platform -d (Join-Path $build 'classes') @sources
Check-Exit 'Java compilation'
& $jar --create --file (Join-Path $build 'classes.jar') -C (Join-Path $build 'classes') .
Check-Exit 'Class archive'
& $java -cp (Join-Path $bt 'lib\d8.jar') com.android.tools.r8.D8 --lib $platform --min-api 26 --output (Join-Path $build 'dex') (Join-Path $build 'classes.jar')
Check-Exit 'DEX compilation'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$apk = [System.IO.Compression.ZipFile]::Open((Join-Path $build 'unsigned.apk'),[System.IO.Compression.ZipArchiveMode]::Update)
try { [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($apk,(Join-Path $build 'dex\classes.dex'),'classes.dex',[System.IO.Compression.CompressionLevel]::Optimal) | Out-Null } finally { $apk.Dispose() }
& (Join-Path $bt 'zipalign.exe') -p -f 4 (Join-Path $build 'unsigned.apk') (Join-Path $build 'aligned.apk')
Check-Exit 'ZIP alignment'
$signing = Join-Path $ProjectRoot '.signing'
New-Item -ItemType Directory -Path $signing -Force | Out-Null
$passFile = Join-Path $signing 'password.txt'
$keyFile = Join-Path $signing 'swara-release.jks'
if (!(Test-Path -LiteralPath $keyFile)) {
    $randomBytes = New-Object byte[] 32
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($randomBytes)
    $rng.Dispose()
    [System.IO.File]::WriteAllText($passFile,[Convert]::ToBase64String($randomBytes))
    & $keytool -genkeypair -keystore $keyFile -storepass:file $passFile -keypass:file $passFile -alias swara -keyalg RSA -keysize 3072 -validity 10000 -dname 'CN=Swara Institute, OU=Mobile App, O=Swara, C=IN'
    Check-Exit 'Release signing key generation'
}
$output = Join-Path $dist 'Swara-Institute-1.12-Registration-Date.apk'
& $java -jar (Join-Path $bt 'lib\apksigner.jar') sign --ks $keyFile --ks-key-alias swara --ks-pass "file:$passFile" --out $output (Join-Path $build 'aligned.apk')
Check-Exit 'APK signing'
& $java -jar (Join-Path $bt 'lib\apksigner.jar') verify --verbose $output
Check-Exit 'Signature verification'
& (Join-Path $bt 'zipalign.exe') -c 4 $output
Check-Exit 'Alignment verification'
& (Join-Path $bt 'aapt.exe') dump badging $output | Select-Object -First 12
Check-Exit 'Manifest verification'
$hash = (Get-FileHash -LiteralPath $output -Algorithm SHA256).Hash.ToLowerInvariant()
[System.IO.File]::WriteAllText((Join-Path $dist 'Swara-Institute-1.12-Registration-Date.apk.sha256'),"$hash  Swara-Institute-1.12-Registration-Date.apk`n")
Write-Output "Built and verified: $output"
