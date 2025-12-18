# PowerShell script to zip the project for Hostinger upload
# Backup method: Copies to temp folder, removes node_modules, then zips

$projectName = "Employee_Portal_Source"
$zipFileName = "$projectName.zip"
$tempDir = ".\_temp_upload_build"

Write-Host "Preparing to zip project (No Git)..." -ForegroundColor Cyan

# Clean up previous runs
if (Test-Path $zipFileName) { Remove-Item $zipFileName }
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }

# 1. Copy everything to temp folder
Write-Host "1. Copying files to temporary folder..." -ForegroundColor Cyan
New-Item -ItemType Directory -Path $tempDir | Out-Null
Copy-Item -Path ".\*" -Destination $tempDir -Recurse -Force

# 2. Remove node_modules and other junk from temp folder
Write-Host "2. Cleaning up node_modules and unneeded files..." -ForegroundColor Cyan
Get-ChildItem -Path $tempDir -Recurse -Include "node_modules", ".git", "dist", "build", ".vscode" | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue

# 3. Zip the temp folder
Write-Host "3. Compressing files (this may take a minute)..." -ForegroundColor Cyan
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipFileName

# 4. Cleanup
Remove-Item $tempDir -Recurse -Force

if (Test-Path $zipFileName) {
    Write-Host "✅ Created $zipFileName successfully!" -ForegroundColor Green
    Write-Host "👉 Upload this file to your Hostinger VPS in the 'htdocs' folder." -ForegroundColor Cyan
} else {
    Write-Host "❌ Failed to create zip file." -ForegroundColor Red
}
