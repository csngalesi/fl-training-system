$repo = "C:\Users\christiano galesi\.gemini\antigravity\scratch\fl-training-system"
Set-Location $repo

Write-Host ">>> Atualizando catalogo..." -ForegroundColor Cyan
powershell -ExecutionPolicy Bypass -File "$repo\RepVid\gerar_catalog.ps1" | Out-Null

Write-Host ">>> Fazendo deploy..." -ForegroundColor Cyan
git add RepVid/
git commit -m "feat: atualizar RepVid e catalogo"
git push

Write-Host ""
Write-Host ">>> Deploy concluido! Vercel ja esta atualizando." -ForegroundColor Green
Read-Host "Pressione ENTER para fechar"
