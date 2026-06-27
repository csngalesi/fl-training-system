@echo off
echo ============================================================
echo  DOWNLOADER - Novos videos Instagram / YouTube
echo ============================================================
echo  1. Certifique-se de que esta logado no Instagram no Chrome
echo  2. FECHE totalmente o Chrome antes de continuar
echo  3. Pressione qualquer tecla para iniciar...
echo ============================================================
pause
powershell -ExecutionPolicy Bypass -File "%~dp0baixar.ps1"
pause
