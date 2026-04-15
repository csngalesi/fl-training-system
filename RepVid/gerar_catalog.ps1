# Gera RepVid/catalog.json escaneando as subpastas
# Uso: Execute este script sempre que adicionar novos videos ao RepVid
# Depois: git add RepVid/ && git commit -m "..." && git push

$base = Split-Path -Parent $MyInvocation.MyCommand.Path
$cats = @('Domínio','Passe','Chute','Drible','Condução','Marcação','Técnica atlética','Outro')

$lines = @('{')
$lastCat = $cats[-1]

foreach ($cat in $cats) {
    $catPath = Join-Path $base $cat
    $files = Get-ChildItem -LiteralPath $catPath -Filter '*.mp4' -ErrorAction SilentlyContinue |
             Sort-Object Name |
             Select-Object -ExpandProperty Name

    $comma = if ($cat -eq $lastCat) { '' } else { ',' }
    $lines += "  `"$cat`": ["

    $fileList = @($files)
    for ($i = 0; $i -lt $fileList.Count; $i++) {
        $fc = if ($i -lt $fileList.Count - 1) { ',' } else { '' }
        $lines += "    `"$($fileList[$i])`"$fc"
    }

    $lines += "  ]$comma"
}
$lines += '}'

$outPath = Join-Path $base 'catalog.json'
[System.IO.File]::WriteAllLines($outPath, $lines, [System.Text.UTF8Encoding]::new($false))

Write-Host "catalog.json gerado com sucesso em: $outPath"
foreach ($cat in $cats) {
    $catPath = Join-Path $base $cat
    $count = (Get-ChildItem -LiteralPath $catPath -Filter '*.mp4' -ErrorAction SilentlyContinue).Count
    Write-Host "  $cat`: $count videos"
}
