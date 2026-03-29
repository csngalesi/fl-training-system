# 🎥 Guia Completo: Como Baixamos 77 Vídeos do Instagram 

Este documento explica como conseguimos construir o nosso acervo de vídeos do Football Lab de forma massiva desviando dos severos bloqueios da Meta (Instagram/Facebook).

## 🛑 O Problema Original
O Instagram possui ferramentas agressivas contra *bots* (robôs). Ele proíbe terminantemente acessos anônimos. Se um robô tentar baixar um vídeo (ou 70 de uma vez), a Meta tranca o acesso no primeiro segundo, exigindo que você "Faça Login para Continuar". Ferramentas de download normais falham em massa no Instagram.

## 🛠️ A Ferramenta Base
Usamos o motor **yt-dlp** (o super-herói dos downloads open-source contido no arquivo `yt-dlp.exe`). Como ele sofria os mesmos bloqueios anônimos, a abordagem secreta que usei foi a de "Sequestro Autenticado de Sessão".

## 🕵️‍♂️ A Abordagem (Sequestro de Sessão)
Construí um pequeno script PowerShell (`baixar_videos.ps1`) que emite comandos muito específicos. Em vez do script usar senhas visíveis para tentar logar ou ir de peito aberto como anônimo, eu executei a flag mágica: 
`--cookies-from-browser chrome`

**Como funciona a mágica:**
1. Você acessa sua conta do Instagram no seu Google Chrome normalmente e loga uma vez.
2. O seu Google Chrome salva um arquivo de banco de cookies criptografado em seu Windows com o seu "crachá" de acesso valendo.
3. Meu script vai lá, copia esse crachá local do Chrome e envia pro Instagram na hora do download, como se fosse você navegando na web naquele milissegundo. O Instagram entende "Ah, é o Christiano Galesi vendo esse reels. Permissão de download concedida."

## ⏳ Fuga do Antivírus da Meta (Rate Limit)
Se você baixasse 77 vídeos em 10 segundos, mesmo com o seu crachá, a conta receberia um bloqueio temporário (Action Blocked). Para contornar isso, eu incluí um descanso (Sleep Timer) invisível no nosso script:
`--min-sleep-interval 15 --max-sleep-interval 45`

Isso faz o robô pausar entre *15 a 45 segundos* aleatoriamente entre cada vídeo. Foi por isso que nosso primeiro processo extraiu 77 vídeos sem sua conta perceber nada de estranho e em total segurança.

---

## 🚀 PASSO-A-PASSO PARA O FUTURO

Se não me encontrar amanhã e você quiser adicionar mais 50 vídeos no Football Lab, basta repetir esse ciclo na máquina local:

### Passo 1: Separar os Links
1. Abra o arquivo `urls.txt` (localizado e deixado ao lado deste guia físico na pasta `/filmagem`).
2. Cole os links diretos dos novos Reels ou Youtube Shorts do Instagram, sempre um link por linha. 
3. Salve o arquivo de texto.

### Passo 2: Validar o Crachá (Login Real)
1. Abra seu Google Chrome normal.
2. Acesse o `instagram.com` (garanta que você esteja logado e vendo seu mural). 
3. **Feche totalmente** o aplicativo Google Chrome (para evitar conflito de acesso ao banco do Windows).

### Passo 3: Executar a Extração
1. Dê 2 cliques diretos sobre o arquivo `iniciar_download.bat` da sua pasta `filmagem`.
2. A telinha azul escuro do PowerShell será aberta já fazendo todo o trabalho sujo. 
3. Ele vai ler a sua lista de `urls.txt`, buscar seu "crachá" escondido no Google Chrome fechado, e vai passar link a link devagar.

### Passo 4: O "Tinder" de Favoritos
* Todos os novos em .mp4 vão se empilhar magicamente na pasta `/videos_baixados`.
* Terminando o painel azul, basta você clicar em `classificador_videos.html`. Ele abrirá no navegador te forçando a classificar (Domínio, Passe, Favorito) exatamente como fizemos hoje.
* Feito a classificação final, você pode me chamar para atualizar suas páginas do Vercel com os `.mp4` novos - e o nosso ciclo de enriquecimento da Plataforma continua eternamente.

*Seu assistente virtual de inteligência - Antigravity.*
──────────────────────────────────────────────────────────────────────
