$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$cursorDir = Join-Path $HOME ".cursor"
$claudeDir = Join-Path $HOME ".claude"

New-Item -ItemType Directory -Force -Path $cursorDir | Out-Null
New-Item -ItemType Directory -Force -Path $claudeDir | Out-Null

$cursorSource = Join-Path $root ".cursor\hooks.json"
$cursorTarget = Join-Path $cursorDir "hooks.json"
if ((Test-Path $cursorTarget) -and -not (Get-Item $cursorTarget).LinkType) {
  $cursorBackup = "$cursorTarget.bak.$((Get-Date).ToUniversalTime().ToString('yyyyMMdd_HHmmss') + 'Z')"
  Copy-Item $cursorTarget $cursorBackup -Force
}
if (Test-Path $cursorTarget) { Remove-Item $cursorTarget -Force }
New-Item -ItemType Junction -Path $cursorTarget -Target $cursorSource | Out-Null

$claudeSource = Join-Path $root ".claude\settings.json"
$claudeTarget = Join-Path $claudeDir "settings.json"
if ((Test-Path $claudeTarget) -and -not (Get-Item $claudeTarget).LinkType) {
  $claudeBackup = "$claudeTarget.bak.$((Get-Date).ToUniversalTime().ToString('yyyyMMdd_HHmmss') + 'Z')"
  Copy-Item $claudeTarget $claudeBackup -Force
}
if (Test-Path $claudeTarget) { Remove-Item $claudeTarget -Force }
New-Item -ItemType Junction -Path $claudeTarget -Target $claudeSource | Out-Null

Write-Output "WhytCard hooks linked globally."
