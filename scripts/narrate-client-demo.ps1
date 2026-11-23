$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$demoRoot = Join-Path $PSScriptRoot '..\build\client-demo'
$demoStory = Get-Content (Join-Path $demoRoot 'story.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$demoAudio = Join-Path $demoRoot 'audio'
New-Item -ItemType Directory -Force -Path $demoAudio | Out-Null
$demoSynth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$demoSynth.SelectVoice('Microsoft Zira Desktop')
$demoSynth.Rate = 0
$demoSynth.Volume = 100
$demoIndex = 0
try {
 foreach ($demoChapter in $demoStory) {
  foreach ($demoBeat in $demoChapter.beats) {
   $demoWav = Join-Path $demoAudio ('{0:D3}.wav' -f $demoIndex)
   $demoSynth.SetOutputToWaveFile($demoWav)
   $demoSynth.Speak([string]$demoBeat.voice)
   $demoSynth.SetOutputToNull()
   $demoIndex++
  }
  Write-Output ('Narrated: ' + $demoChapter.menu)
 }
} finally { $demoSynth.Dispose() }
Write-Output ('Created ' + $demoIndex + ' English voiceover clips.')
