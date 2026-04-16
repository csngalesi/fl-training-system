Write-Host "Iniciando download do FFmpeg (Aproximadamente 130 MB, aguarde o contador terminar)..."
Invoke-WebRequest -Uri "https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip" -OutFile "ffmpeg.zip"
Write-Host "Extraindo arquivos do zip..."
Expand-Archive -Path "ffmpeg.zip" -DestinationPath "ffmpeg_extracted" -Force
Write-Host "Movendo ffmpeg.exe para a sua pasta..."
Move-Item ".\ffmpeg_extracted\ffmpeg-master-latest-win64-gpl\bin\ffmpeg.exe" ".\ffmpeg.exe" -Force
Write-Host "Limpando arquivos temporários..."
Remove-Item "ffmpeg.zip" -Force
Remove-Item ".\ffmpeg_extracted\" -Recurse -Force
Write-Host "Tudo pronto! ffmpeg.exe está instalado aqui na sua pasta! ✅"
Read-Host "Pressione ENTER para fechar..."
