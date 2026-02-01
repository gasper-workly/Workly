$ErrorActionPreference = "Stop"

$keytool = 'C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe'
if (-not (Test-Path $keytool)) {
  throw "keytool.exe not found at: $keytool`nInstall/repair Android Studio, or update this script to point at your Android Studio jbr\bin\keytool.exe."
}

$keystorePath = Join-Path $PSScriptRoot 'workly-upload.jks'
$alias = 'upload'
$certPath = Join-Path $PSScriptRoot 'workly-upload-cert.pem'

if (-not (Test-Path $keystorePath)) {
  throw "Keystore not found at: $keystorePath`nRun create-upload-keystore.ps1 first."
}

if (Test-Path $certPath) {
  Remove-Item -Force $certPath
}

Write-Host "Exporting upload certificate to:"
Write-Host "  $certPath"
Write-Host ""
Write-Host "You will be prompted for your keystore password."
Write-Host ""

& $keytool `
  -exportcert -rfc `
  -alias $alias `
  -keystore $keystorePath `
  -file $certPath

Write-Host ""
Write-Host "Done."
Write-Host "Upload this PEM in Play Console if asked for your upload key certificate:"
Write-Host "  $certPath"
