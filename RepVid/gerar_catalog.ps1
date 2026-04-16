# Gera RepVid/catalog.json escaneando as subpastas
# Uso: clique direito > Executar com PowerShell
# Depois: git add RepVid/ && git commit -m "..." && git push

$base = Split-Path -Parent $MyInvocation.MyCommand.Path

# Ordem preferida das categorias
$order = @('Dominio','Passe','Chute','Drible','Conducao','Marcacao','Tecnica atletica','Outro')

# Le as pastas REAIS do filesystem (NTFS = Unicode, sem problema de encoding)
$folders = Get-ChildItem -LiteralPath $base -Directory | Select-Object -ExpandProperty Name

# Ordena pelas pastas reais seguindo a ordem preferida (match por similaridade)
$sorted = @()
foreach ($pref in $order) {
    $match = $folders | Where-Object { $_ -replace '[^a-zA-Z ]','' -eq $pref } | Select-Object -First 1
    if ($match) { $sorted += $match }
}
# Adiciona pastas que nao estejam na ordem preferida
foreach ($f in $folders) {
    if ($sorted -notcontains $f) { $sorted += $f }
}

# Monta o JSON manualmente (evita problemas de encoding do ConvertTo-Json)
$parts = @()
foreach ($cat in $sorted) {
    $catPath = Join-Path $base $cat
    $files = Get-ChildItem -LiteralPath $catPath -Filter '*.mp4' -ErrorAction SilentlyContinue |
             Sort-Object Name | Select-Object -ExpandProperty Name

    $escaped = $cat -replace '"', '\"'
    if ($files.Count -eq 0) {
        $parts += "  `"$escaped`": []"
    } else {
        $fileEntries = $files | ForEach-Object { "    `"$($_ -replace '"','\"')`"" }
        $parts += "  `"$escaped`": [`n" + ($fileEntries -join ",`n") + "`n  ]"
    }
}

$json = "{`n" + ($parts -join ",`n") + "`n}"
$outPath = Join-Path $base 'catalog.json'
[System.IO.File]::WriteAllText($outPath, $json, [System.Text.UTF8Encoding]::new($false))

Write-Host ""
Write-Host "catalog.json gerado com sucesso!" -ForegroundColor Green
foreach ($cat in $sorted) {
    $count = (Get-ChildItem -LiteralPath (Join-Path $base $cat) -Filter '*.mp4' -ErrorAction SilentlyContinue).Count
    Write-Host "  $cat`: $count videos"
}
Write-Host ""
Write-Host "Proximo passo: git add RepVid/ && git commit -m 'update catalogo' && git push" -ForegroundColor Yellow
Read-Host "Pressione ENTER para fechar"
