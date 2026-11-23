$ErrorActionPreference='Stop'
$root=Join-Path $PSScriptRoot 'toolchain'
New-Item -ItemType Directory -Path $root -Force | Out-Null
$packages=@(
    @{Name='jdk';Url='https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.20.1%2B1/OpenJDK17U-jdk_x64_windows_hotspot_17.0.20.1_1.zip';Algorithm='SHA256';Hash='e53a79c3c3d86865bd7e787903884331068e71321714ffd44f145785affc7cb0'},
    @{Name='build-tools';Url='https://dl.google.com/android/repository/build-tools_r35.0.1_windows.zip';Algorithm='SHA1';Hash='1cbfa5564b62504a1111352edda35914cf723a20'},
    @{Name='platform';Url='https://dl.google.com/android/repository/platform-35_r02.zip';Algorithm='SHA1';Hash='0bb560a90a7a2cbd0dd8348224d518b638fe7949'}
)
Add-Type -AssemblyName System.IO.Compression.FileSystem
foreach($package in $packages){
    $archive=Join-Path $root ($package.Name+'.zip')
    if(!(Test-Path -LiteralPath $archive)){Write-Output ('Downloading '+$package.Name);Invoke-WebRequest -Uri $package.Url -OutFile $archive -UseBasicParsing}
    if((Get-FileHash -LiteralPath $archive -Algorithm $package.Algorithm).Hash.ToLowerInvariant() -ne $package.Hash){throw ('Checksum mismatch: '+$package.Name)}
    $destination=Join-Path $root $package.Name
    if(!(Test-Path -LiteralPath $destination)){[System.IO.Compression.ZipFile]::ExtractToDirectory($archive,$destination)}
    Write-Output ('Ready: '+$package.Name)
}
Write-Output 'Toolchain ready. Run build.ps1 to create a signed APK.'
