# Contexto Geral do Projeto

**Site/App:** FL Training System (Sistema de Treinos Táticos Otimizados para Quartetos em Campo Reduzido 20x10m)
**Status Atual:** Nós construímos um MVP completo (Single Page Application) em Vanilla JS, HTML Puro e CSS.
Ele conta com uma interface Sidebar (menu com os 8 fundamentos), Modal ("Base Técnica") e um **Motor de Simulação 2D**.
O Motor lê de uma estrutura rígida estática (atualmente em `data.js`) chamada `FLData` as coordenadas de animação e usa Vanilla JS lendo CSS Custom Properties (`--x`, `--y`) num loop assíncrono para animar **4 Atletas e 1 Bola** simultaneamente dentro do campo desenhado em CSS. O diretório do projeto local se chama `fl-training-system`.

---

# Seus Objetivos nesta Sessão

1. **Migração Full-Stack & Deploy (Vercel):**
   Pegar a essência visual e lógica do nosso projeto HTML/CSS/JS e transformá-lo em uma arquitetura moderna (Next.js + React ou framework similar de sua escolha) para facilitar o deploy pelo **Git na Vercel**. A interface do usuário final (frontend) deve parecer idêntica ao que temos agora.

2. **Integração com Banco de Dados:**
   Acabar com o `data.js` hardcoded. Subir um banco de dados relacional (ex: PostgreSQL com Prisma) ou NoSQL (Supabase, Firebase). A estrutura de dados base precisa prever: `Fundamentos` (1:N) `Treinos`.

3. **Criação do Painel Administrativo ("Criar Treino"):**
   Esta é a prioridade urgente. Precisamos de um painel de retaguarda (Backoffice) onde possamos cadastrar novos treinos no banco de dados. O formulário para a entidade "Treino" deve ter obrigatoriamente:
   
   - Um campo `Título do Treino` (input text).
   - Um campo `Descrição do Treino` (textarea): Para explicar em texto como o exercício deve ocorrer.
   - Um campo de `Instruções da Animação` (textarea ou JSON area): Para inserir a estrutura da animação (as coordenadas do campo do treino).
   
   **Requisito Específico de UX no Admin:** Ao lado da label do campo "Instruções da Animação", você deve criar um ícone de interrogação `[?]`. Ao passar o mouse por cima (Tooltip) ou clicar (se for mobile), ele deve exibir um pop-up/modal com um **Guia de Como Escrever a Animação**. 

---

# Regras que devem aparecer no Tooltip "Como Montar a Animação [?]":

Crie o Tooltip estruturado contendo as seguintes explicações vitais, de forma bem visual (pode usar listas ou bullets), ensinando o administrador a escrever o código de posicionamento:

*   **O Campo Base (A Geometria da Simulação):** 
    * O nosso campo de treino possui tamanho físico fixo (escala real) simulando 20m x 10m.
    * Todas as coordenadas variam dentro de um grid perfeito: O eixo **X** vai de 0 a 10 e o eixo **Y** vai de 0 a 20.
    * O Gol oficial do campo fica estático e eternamente centralizado na coordenada `{X: 5, Y: 0}`.
*   **Os Personagens Ativos (Nomenclatura):**
    *   Existem exatamente 5 atores no campo do motor. Você deve chamar cada um por suas chaves (ids) para animá-los: `p1`, `p2`, `p3`, `p4` (que representam os quatro alunos), e a bola que atende pelo id `ball`.
*   **Como Escrever um Passo de Animação (Time e Posição):**
    *   O motor consome e enfileira uma lista encadeada (Array) de comandos e vai movendo os astros para os pontos indicados. O formato base leva um ponto de destino `to: {x, y}` e um tempo `dur: (milissegundos)`.
    * Exemplo de instrução: `O Atleta P1 corre até o alvo X:2, Y:10 gastando 1.2 segundos (1200ms)`.
*   **A Sincronia de Jogadas (Movendo Vários Ao Mesmo Tempo):**
    *   Geralmente os eventos são sequenciais. O motor espera o primeiro astro chegar, pra iniciar o passo seguinte. Para fazer o atleta e a bola (ou dois atletas) correrem **juntos**, você DEVE ensinar o usuário a acionar uma flag booleana de sincronia: Ex. `sync: true`.
    * Sem `sync: true` o movimento de um passe longo ficará pausado aguardando quem tocou terminar o giro, destruindo o realismo.
*   **Os Atrasos Temporais (Delay):**
    *   Existe também uma chave `delay`. Ela não requer quem nem para onde ir. Exemplo: `delay: 300` (pausa tudo por 300ms). Perfeito para retratar a bola sendo dominada ("pisão" de um pivô), o tempo de processamento/tomada de decisão sob pressão antes da execução do próximo movimento.

---

# Entregáveis que espero do Claude para Esta Iteração

1. **Esquema Inicial do Banco:** Indicar qual banco e relatar o modelo inicial para as entidades de Fundamentos e Exercícios/Treinos animáveis.
2. **Código Front-End do Admin (Forms & UX):** Como ficará o novo componente React com os campos exigidos. Dê atenção máxima ao design do campo de "Instalações da Animação" e a construção da UI desse **Tooltip de Ajuda [?]** (com todos os pontos supracitados) para ser muito legível para os futuros editores do painel.
3. **Checklist Rápido do Setup Vercel:** Esboço de como ligar isso num workflow GitHub/Vercel (variáveis de ambiente, push script).
