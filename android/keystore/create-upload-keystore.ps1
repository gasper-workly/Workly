$ErrorActionPreference = "Stop"

$keytool = 'C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe'
if (-not (Test-Path $keytool)) {
  throw "keytool.exe not found at: $keytool`nInstall/repair Android Studio, or update this script to point at your Android Studio jbr\bin\keytool.exe."
}

$keystorePath = Join-Path $PSScriptRoot 'workly-upload.jks'
$alias = 'upload'

if (Test-Path $keystorePath) {
  $ans = Read-Host "Keystore already exists at $keystorePath. Overwrite? (y/N)"
  if ($ans -ne 'y' -and $ans -ne 'Y') {
    Write-Host "Cancelled."
    exit 0
  }
  Remove-Item -Force $keystorePath
}

Write-Host "Creating upload keystore at:"
Write-Host "  $keystorePath"
Write-Host ""
Write-Host "You will be prompted for:"
Write-Host "- Keystore password"
Write-Host "- Key password"
Write-Host "- Certificate identity fields (name/org/country)"
Write-Host ""

& $keytool `
  -genkeypair -v `
  -keystore $keystorePath `
  -alias $alias `
  -keyalg RSA `
  -keysize 2048 `
  -validity 10000

Write-Host ""
Write-Host "Done."
Write-Host "BACK UP THIS FILE + PASSWORDS:"
Write-Host "  $keystorePath"
