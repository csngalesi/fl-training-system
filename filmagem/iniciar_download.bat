@echo off
title Extrator de Videos MP4 - Football Lab
cd /d "%~dp0"
echo ========================================================
echo FOOTBALL LAB - EXTRATOR DE VIDEOS MP4 (METODO 2)
echo ========================================================
echo.
echo Para conseguirmos baixar os videos sem que o Instagram
echo os bloqueie por direitos autorais ou privacidade,
echo a ferramenta precisara fazer o login na sua conta.
echo.
echo (Suas credenciais ficarao apenas nesta janela preta, 
echo de forma local e segura no seu proprio computador).
echo.
set /p IG_USER="Digite o seu usuario do Instagram (sem o @): "
set /p IG_PASS="Digite a sua senha: "
echo.
echo Conectando... Se o Instagram enviar um codigo SMS ou de 
echo autenticador de 2 fatores, fique atento, pois a tela 
echo abaixo podera pausar e pedir que voce digite o codigo!
echo.
echo Nao feche esta janela durante a extracao. Os MP4
echo vao brotar um por um na pasta "videos_baixados".
echo ========================================================
echo.

if not exist videos_baixados mkdir videos_baixados

yt-dlp.exe -u "%IG_USER%" -p "%IG_PASS%" -a urls.txt -o "videos_baixados\%%(autonumber)03d_%%(title).40s.%%(ext)s" --min-sleep-interval 4 --max-sleep-interval 8

echo.
echo ========================================================
echo FIM DO PROCESSO! Feche esta janela e confira seus videos.
pause
