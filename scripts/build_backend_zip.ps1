$ErrorActionPreference = "Stop"
$sourceDir = Join-Path $PSScriptRoot "..\api"
$sourceDir = [System.IO.Path]::GetFullPath($sourceDir)
$destZip = Join-Path $PSScriptRoot "..\backend_api.zip"
$destZip = [System.IO.Path]::GetFullPath($destZip)

if (Test-Path $destZip) {
    Remove-Item $destZip -Force
}

$tempDir = Join-Path $env:TEMP ("backend_api_" + [System.Guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $tempDir | Out-Null

try {
    # Copy api contents
    Copy-Item -Path "$sourceDir\*" -Destination $tempDir -Recurse -Force
    # Copy dotfiles
    Get-ChildItem -Path $sourceDir -Filter ".*" -File | ForEach-Object {
        Copy-Item -Path $_.FullName -Destination $tempDir -Force
    }

    # Remove runtime database JSON files if any
    if (Test-Path "$tempDir\database") {
        Get-ChildItem -Path "$tempDir\database" -Filter "*.json" | Remove-Item -Force
    }
    # Keep uploads directory clean
    if (Test-Path "$tempDir\uploads") {
        Get-ChildItem -Path "$tempDir\uploads" -Exclude ".htaccess" | Remove-Item -Recurse -Force
    }

    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::CreateFromDirectory($tempDir, $destZip, [System.IO.Compression.CompressionLevel]::Optimal, $false)
} finally {
    if (Test-Path $tempDir) {
        Remove-Item $tempDir -Recurse -Force
    }
}

$item = Get-Item $destZip
Write-Host "SUCCESS: Created $destZip (Size: $($item.Length) bytes)"


$zip = [System.IO.Compression.ZipFile]::OpenRead($destZip)
Write-Host "Total files/folders in zip: $($zip.Entries.Count)"
$hasSitemap = $zip.Entries | Where-Object { $_.FullName -eq "sitemap.php" }
$hasHtaccess = $zip.Entries | Where-Object { $_.FullName -eq ".htaccess" }
$hasDb = $zip.Entries | Where-Object { $_.FullName -eq "db.php" }
Write-Host "Contains sitemap.php: $([bool]$hasSitemap)"
Write-Host "Contains .htaccess: $([bool]$hasHtaccess)"
Write-Host "Contains db.php: $([bool]$hasDb)"
$zip.Dispose()

