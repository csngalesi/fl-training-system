$ErrorActionPreference = "Stop"
$pasta = "C:\Users\christiano galesi\.gemini\antigravity\scratch\fl-training-system\Novos instagram"
Set-Location $pasta

if (-not (Test-Path "yt-dlp.exe")) {
    Write-Host ">>> Baixando yt-dlp..."
    Invoke-WebRequest -Uri "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe" -OutFile "yt-dlp.exe"
}

# Extrai URLs do urls.txt (ignora prefixo de data/WhatsApp, comentarios e linhas vazias)
$urls = Get-Content "urls.txt" | ForEach-Object {
    if ($_ -match 'https?://\S+') { $matches[0].TrimEnd('*','_') }
} | Where-Object { $_ -ne $null }

if ($urls.Count -eq 0) {
    Write-Host "ERRO: Nenhuma URL no urls.txt." -ForegroundColor Red; exit 1
}
Write-Host ">>> $($urls.Count) URLs encontradas."

# -------------------------------------------------------
# Login no Instagram direto no terminal
# -------------------------------------------------------
Write-Host ""
Write-Host "============================================================" -ForegroundColor Yellow
Write-Host "  LOGIN NO INSTAGRAM" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Yellow
$igUser = Read-Host "  Usuario (ex: christiano.galesi)"
$igPass = Read-Host "  Senha" -AsSecureString
$igPassPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($igPass)
)
Write-Host "============================================================" -ForegroundColor Yellow
Write-Host ""

# -------------------------------------------------------
# Download
# -------------------------------------------------------
Write-Host ">>> Iniciando downloads (15-45s entre cada video)..." -ForegroundColor Cyan
Write-Host "--------------------------------------------------------"

$tempFile = [System.IO.Path]::GetTempFileName()
$urls | Set-Content $tempFile

.\yt-dlp.exe --username $igUser --password $igPassPlain -a $tempFile `
    -o "%(autonumber)03d_%(title).80s.%(ext)s" `
    --min-sleep-interval 15 --max-sleep-interval 45

Remove-Item $tempFile

Write-Host "--------------------------------------------------------"
Write-Host ">>> CONCLUIDO! Verifique a pasta 'Novos instagram'." -ForegroundColor Green
