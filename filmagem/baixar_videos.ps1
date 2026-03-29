$ErrorActionPreference = "Stop"
Set-Location "C:\Users\christiano galesi\.gemini\antigravity\scratch\filmagem"

if (-not (Test-Path "yt-dlp.exe")) {
    Write-Host ">>> Baixando a ferramenta de extração de vídeos (yt-dlp)..."
    Invoke-WebRequest -Uri "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe" -OutFile "yt-dlp.exe"
}

if (-not (Test-Path "videos_baixados")) {
    New-Item -ItemType Directory -Force -Path "videos_baixados"
}

Write-Host ">>> Ferramenta pronta. Preparando a quebra do bloqueio usando a sua conta do Chrome..."
Write-Host ">>> A intenção é baixar os arquivos na pasta 'videos_baixados'."
Write-Host ">>> Avisando o Instagram... Iniciando os downloads (Isso vai levar um tempo bom, confira o terminal para ver o progresso!)"
Write-Host "--------------------------------------------------------"

# Executando o download dos links usando o Chrome
.\yt-dlp.exe --cookies-from-browser chrome -a urls.txt -o "videos_baixados\%(autonumber)03d_%(title).80s.%(ext)s" --sleep-requests 6 --max-sleep-interval 12

Write-Host "--------------------------------------------------------"
Write-Host ">>> PROCESSO CONCLUÍDO! Verifique a pasta 'videos_baixados' para ver seus arquivos MP4."
