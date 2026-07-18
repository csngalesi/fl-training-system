$ErrorActionPreference = "Stop"
Set-Location "C:\Users\csnga\.gemini\antigravity\scratch\fl-training-system\Novos instagram"

if (-not (Test-Path "yt-dlp.exe")) {
    Write-Host ">>> Baixando yt-dlp..."
    Invoke-WebRequest -Uri "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe" -OutFile "yt-dlp.exe"
}

if (-not (Test-Path "videos_baixados")) {
    New-Item -ItemType Directory -Force -Path "videos_baixados"
}

Write-Host ">>> Ferramenta pronta. Usando cookies do Chrome para autenticar no Instagram..."
Write-Host ">>> 35 vídeos para baixar. Isso vai levar um tempo..."
Write-Host "--------------------------------------------------------"

.\yt-dlp.exe --cookies cookies.txt -a urls.txt -o "videos_baixados\%(autonumber)03d_%(title).80s.%(ext)s" --sleep-requests 6 --min-sleep-interval 4 --max-sleep-interval 12

Write-Host "--------------------------------------------------------"
Write-Host ">>> CONCLUÍDO! Verifique a pasta 'videos_baixados'."
