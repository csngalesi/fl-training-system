/**
 * Football Lab | Training Data
 * Defines the 8 fundamentals equipped to handle 4-player interactions.
 */

const FLData = {
    fundamentals: [
        {
            id: 'dominio',
            title: 'Domínio de Bola',
            icon: 'fa-magnet',
            baseTech: 'O domínio é o princípio do controle. Usar pés, peito, coxa ou cabeça para "amortecer" a velocidade da bola. Nos treinos em grupo (4 alunos), focar no domínio direcionado que já prepara o passe para o próximo colega, usando a perna oposta à origem da bola para proteger a posse.',
            drills: []
        },
        {
            id: 'passe',
            title: 'Passe (Equipe)',
            icon: 'fa-arrow-right-arrow-left',
            baseTech: 'A essência do jogo coletivo. O passe usando a parte interna do pé ("chapa") garante previsibilidade e firmeza. Nos exercícios com 4 jogadores, o foco é o "tocar e passar" (triangulações, rondos e profundidade), criando linhas de passe ativas e quebra das linhas de defesa.',
            drills: []
        },
        {
            id: 'chute',
            title: 'Finalização (Chute)',
            icon: 'fa-futbol',
            baseTech: 'Precisão, não só força. O corpo ligeiramente inclinado sobre a bola evita o chute alto. Em grupo, trabalhamos a infiltração de pivôs e assistências.',
            drills: []
        },
        {
            id: 'drible',
            title: 'Drible',
            icon: 'fa-shoe-prints',
            baseTech: 'Superar o adversário mantendo a posse. A base é a mudança brusca de velocidade e direção. Em formato 4x4, drible atrai marcação para liberar companheiros.',
            drills: []
        },
        {
            id: 'conducao',
            title: 'Condução',
            icon: 'fa-person-running',
            baseTech: 'Progredir com a bola dominada perto do corpo (peito do pé). Útil para chamar a pressão adversária e explorar espaços vazios antes do passe em profundidade.',
            drills: []
        },
        {
            id: 'cabeceio',
            title: 'Cabeceio',
            icon: 'fa-user-large',
            baseTech: 'Uso da testa com olhos abertos e pescoço rígido. Ataque na bola no ponto mais alto. Crucial em cruzamentos dinâmicos entre os alas (jogadores da ponta) e os centralizados.',
            drills: []
        },
        {
            id: 'marcacao',
            title: 'Marcação Coletiva',
            icon: 'fa-shield-halved',
            baseTech: 'Base afastada e foco na bola, não no corpo. Acompanhar em "sombra" fechando o passe. Em quarteto, treina-se o balanço defensivo e dobras de marcação (cobertura).',
            drills: []
        },
        {
            id: 'atletica',
            title: 'Técnica Atlética',
            icon: 'fa-bolt',
            baseTech: 'Explosão e desaceleração. Acelerações lineares e mudanças de direção em T. Treinos sincronizados para aprimorar tempo de reação visual e agilidade.',
            drills: []
        },
        {
            id: 'festa',
            title: 'Atividades de Festa',
            icon: 'fa-cake-candles',
            baseTech: 'Exercícios lúdicos e recreativos voltados para celebração, integração e diversão em grupo. Perfeitos para encerramento de temporada, confraternizações e eventos especiais. Atividades de baixa pressão que reforçam o senso de equipe e alegria pelo esporte.',
            drills: []
        }
    ]
};

// =========================================================================
// HIGH-QUALITY 4-PLAYER DRILLS FOR PASSE
// Players: p1 (Red), p2 (Blue), p3 (Green), p4 (Amber)
// Machines: M1 (0.5, 0) and M2 (9.5, 0)
// =========================================================================

function createPasseDrills4p() {
    return [
        {
            title: "Losango de Passes Dinâmico",
            desc: "P1, P2, P3 e P4 formam um losango. A Máquina lança a bola e o passe roda rápido em sentido horário. Todos se movem seguindo o toque.",
            setup: {
                players: { p1: { x: 5, y: 15 }, p2: { x: 2, y: 10 }, p3: { x: 8, y: 10 }, p4: { x: 5, y: 5 } },
                ball: { x: 0.5, y: 0 }, cones: []
            },
            anim: [
                { actor: 'ball', to: { x: 5, y: 15 }, dur: 1000 }, // M1 to P1
                { delay: 400 },
                { actor: 'ball', to: { x: 2, y: 10 }, dur: 800, sync: true }, // P1 to P2
                { actor: 'p1', to: { x: 2, y: 10 }, dur: 1200 }, // P1 runs to P2
                { delay: 200 },
                { actor: 'ball', to: { x: 5, y: 5 }, dur: 800, sync: true }, // P2 to P4 (top)
                { actor: 'p2', to: { x: 5, y: 5 }, dur: 1200 },
                { delay: 200 },
                { actor: 'ball', to: { x: 8, y: 10 }, dur: 800, sync: true }, // P4 to P3
                { actor: 'p4', to: { x: 8, y: 10 }, dur: 1200 },
                { delay: 200 },
                { actor: 'ball', to: { x: 5, y: 15 }, dur: 800, sync: true }, // P3 to bottom
                { actor: 'p3', to: { x: 5, y: 15 }, dur: 1200 },
                { actor: 'ball', to: { x: 5, y: 0 }, dur: 1000 } // Pass to goal
            ]
        },
        {
            title: "Rondo (Bobinho) 3x1 de Pressão",
            desc: "P1, P2 e P3 trocam passes rápidos no espaço triangular usando 1/2 toques, enquanto P4 (bobinho) corre no centro tentando interceptar.",
            setup: {
                players: { p1: { x: 3, y: 14 }, p2: { x: 7, y: 14 }, p3: { x: 5, y: 8 }, p4: { x: 5, y: 12 } },
                ball: { x: 3, y: 14 }, cones: []
            },
            anim: [
                { actor: 'ball', to: { x: 7, y: 14 }, dur: 600, sync: true }, // P1 -> P2
                { actor: 'p4', to: { x: 6, y: 13 }, dur: 800 }, // Defender moves
                { delay: 200 },
                { actor: 'ball', to: { x: 5, y: 8 }, dur: 600, sync: true }, // P2 -> P3
                { actor: 'p4', to: { x: 5.5, y: 10 }, dur: 800 },
                { delay: 200 },
                { actor: 'ball', to: { x: 3, y: 14 }, dur: 600, sync: true }, // P3 -> P1
                { actor: 'p4', to: { x: 4, y: 13 }, dur: 800 },
            ]
        },
        {
            title: "Tabelão (1-2) com Infiltração",
            desc: "A Máquina toca em P1, que escora pra P2 (curto). P2 lança em profundidade para P3 e P4, que cruzam correndo invadindo a área de gol.",
            setup: {
                players: { p1: { x: 5, y: 14 }, p2: { x: 4, y: 10 }, p3: { x: 2, y: 16 }, p4: { x: 8, y: 16 } },
                ball: { x: 0.5, y: 0 }, cones: []
            },
            anim: [
                { actor: 'ball', to: { x: 5, y: 14 }, dur: 1000 }, // M1 to P1
                { delay: 300 },
                { actor: 'ball', to: { x: 4, y: 10 }, dur: 600, sync: true }, // P1 to P2
                { actor: 'p1', to: { x: 5, y: 3 }, dur: 1500, sync: true }, // P1 infiltrates
                { actor: 'p3', to: { x: 4, y: 2 }, dur: 1800, sync: true }, // Wingers run
                { actor: 'p4', to: { x: 6, y: 2 }, dur: 1800 },
                { delay: 200 },
                { actor: 'ball', to: { x: 4, y: 2 }, dur: 800, sync: true }, // Deep pass to P3
                { actor: 'ball', to: { x: 6, y: 2 }, dur: 500 }, // P3 crosses to P4
                { actor: 'ball', to: { x: 5, y: 0 }, dur: 300 } // P4 shoots
            ]
        },
        {
            title: "Recepção Dupla das Máquinas",
            desc: "M1 e M2 lançam simultaneamente. P1 e P2 dominam e invertem de lado tocando cruzado para P3 e P4 que recebem no ataque e finalizam.",
            setup: {
                players: { p1: { x: 2, y: 10 }, p2: { x: 8, y: 10 }, p3: { x: 3, y: 4 }, p4: { x: 7, y: 4 } },
                ball: { x: 0.5, y: 0 }, cones: []
            },
            anim: [
                { actor: 'ball', to: { x: 2, y: 10 }, dur: 800 }, // Assumes visualizing only 1 ball mechanically
                { delay: 400 },
                { actor: 'ball', to: { x: 7, y: 4 }, dur: 800, sync: true }, // Cross pass P1 -> P4
                { actor: 'p1', to: { x: 8, y: 10 }, dur: 1200, sync: true }, // Swaps
                { actor: 'p2', to: { x: 2, y: 10 }, dur: 1200 },
                { delay: 200 },
                { actor: 'ball', to: { x: 5, y: 0 }, dur: 500 } // P4 goal
            ]
        },
        {
            title: "Passe Paredão (Retorno de Pivô)",
            desc: "P1 inicia o toque para o P2 (Pivô). P3 e P4 se deslocam como opções de escape. P2 pisa na bola e escora para P4 finalizar potente.",
            setup: {
                players: { p1: { x: 5, y: 18 }, p2: { x: 5, y: 6 }, p3: { x: 2, y: 12 }, p4: { x: 8, y: 12 } },
                ball: { x: 5, y: 18 }, cones: [{ x: 5, y: 8 }]
            },
            anim: [
                { actor: 'ball', to: { x: 5, y: 6 }, dur: 1200 }, // P1 longo pro Pivô
                { delay: 300 },
                { actor: 'p3', to: { x: 3, y: 6 }, dur: 800, sync: true }, // Options approach
                { actor: 'p4', to: { x: 7, y: 6 }, dur: 800, sync: true },
                { actor: 'ball', to: { x: 7, y: 6 }, dur: 600 }, // Pivot back to P4
                { delay: 200 },
                { actor: 'ball', to: { x: 6, y: 0 }, dur: 600 } // Shot
            ]
        },
        {
            title: "Passa, Corre e Cobre (Circulação Ofensiva)",
            desc: "Circulação em zigue-zague avançando o time. P1 toca para P2, que toca pra P3, que atinge P4. Todos que passam a bola correm para suprir o espaço vago do companheiro.",
            setup: {
                players: { p1: { x: 2, y: 18 }, p2: { x: 8, y: 14 }, p3: { x: 2, y: 8 }, p4: { x: 8, y: 4 } },
                ball: { x: 2, y: 18 }, cones: []
            },
            anim: [
                { actor: 'ball', to: { x: 8, y: 14 }, dur: 800, sync: true },
                { actor: 'p1', to: { x: 8, y: 14 }, dur: 1200 },
                { delay: 100 },
                { actor: 'ball', to: { x: 2, y: 8 }, dur: 800, sync: true },
                { actor: 'p2', to: { x: 2, y: 8 }, dur: 1200 },
                { delay: 100 },
                { actor: 'ball', to: { x: 8, y: 4 }, dur: 800, sync: true },
                { actor: 'p3', to: { x: 8, y: 4 }, dur: 1200 },
                { delay: 100 },
                { actor: 'ball', to: { x: 5, y: 0 }, dur: 600 }
            ]
        },
        {
            title: "Ruptura de Linhas Verticais",
            desc: "P1 no fundo toca forte furando as linhas defensivas falsas até chegar à zona de frente com P3, que de primeira deixa P2 livre, cruzando, e P4 ataca a pequena área.",
            setup: {
                players: { p1: { x: 5, y: 18 }, p2: { x: 3, y: 10 }, p3: { x: 5, y: 4 }, p4: { x: 7, y: 12 } },
                ball: { x: 5, y: 18 }, cones: [{ x: 4, y: 14 }, { x: 6, y: 14 }, { x: 4, y: 8 }, { x: 6, y: 8 }]
            },
            anim: [
                { actor: 'ball', to: { x: 5, y: 4 }, dur: 1400 }, // strong pass splits cones
                { delay: 300 },
                { actor: 'p2', to: { x: 3, y: 4 }, dur: 800, sync: true },
                { actor: 'ball', to: { x: 3, y: 4 }, dur: 600 }, // Layoff
                { delay: 200 },
                { actor: 'p4', to: { x: 6, y: 2 }, dur: 1000, sync: true },
                { actor: 'ball', to: { x: 6, y: 2 }, dur: 800 }, // Cross
                { actor: 'ball', to: { x: 5, y: 0 }, dur: 400 } // Goal
            ]
        },
        {
            title: "Sobreposição Pelas Alas (Overlap)",
            desc: "P1 toca para P2 e ultrapassa em alta velocidade pelas costas dele. P2 engana, gira e solta a bola na frente para P1. P3 e P4 se preparam para cruzar/finalizar.",
            setup: {
                players: { p1: { x: 8, y: 16 }, p2: { x: 8, y: 10 }, p3: { x: 2, y: 10 }, p4: { x: 4, y: 5 } },
                ball: { x: 8, y: 16 }, cones: []
            },
            anim: [
                { actor: 'ball', to: { x: 8, y: 10 }, dur: 800, sync: true }, // Pass to P2
                { actor: 'p1', to: { x: 9, y: 4 }, dur: 1600 }, // Overlap run
                { delay: 600 },
                { actor: 'ball', to: { x: 9, y: 4 }, dur: 700 }, // Pass to P1 at the wing
                { delay: 300 },
                { actor: 'p3', to: { x: 4, y: 2 }, dur: 1000, sync: true }, // Striker runs
                { actor: 'p4', to: { x: 6, y: 2 }, dur: 1000, sync: true },
                { actor: 'ball', to: { x: 5, y: 2 }, dur: 800 }, // Cross
                { actor: 'ball', to: { x: 4, y: 0 }, dur: 400 } // Goal
            ]
        },
        {
            title: "Caixa de Passes de Alta Intensidade",
            desc: "Formato em Quadrado 8x8m. Passes ultrarrápidos alternando pé direito/esquerdo. Aumenta a velocidade de raciocínio. A posse roda sem parar até o som do apito.",
            setup: {
                players: { p1: { x: 2, y: 14 }, p2: { x: 8, y: 14 }, p3: { x: 8, y: 6 }, p4: { x: 2, y: 6 } },
                ball: { x: 2, y: 14 }, cones: []
            },
            anim: [
                { actor: 'ball', to: { x: 8, y: 14 }, dur: 600 },
                { delay: 200 },
                { actor: 'ball', to: { x: 8, y: 6 }, dur: 600 },
                { delay: 200 },
                { actor: 'ball', to: { x: 2, y: 6 }, dur: 600 },
                { delay: 200 },
                { actor: 'ball', to: { x: 2, y: 14 }, dur: 600 },
                { delay: 200 },
                { actor: 'ball', to: { x: 8, y: 6 }, dur: 700 } // diagonal shift
            ]
        },
        {
            title: "Simulação Jogo Real (Mini-Partida 2x2)",
            desc: "P1 e P2 (Ataque) contra P3 e P4 (Defesa). Foco é usar passes triangulados para furar a linha defensiva fechada e marcar gol no fundo.",
            setup: {
                players: { p1: { x: 3, y: 16 }, p2: { x: 7, y: 16 }, p3: { x: 4, y: 8 }, p4: { x: 6, y: 8 } },
                ball: { x: 3, y: 16 }, cones: []
            },
            anim: [
                { actor: 'p3', to: { x: 3, y: 12 }, dur: 800, sync: true }, // p3 pressures
                { actor: 'ball', to: { x: 7, y: 16 }, dur: 700 }, // Switch side to p2
                { delay: 200 },
                { actor: 'p4', to: { x: 7, y: 10 }, dur: 1000, sync: true }, // p4 covers
                { actor: 'p1', to: { x: 4, y: 6 }, dur: 1500, sync: true }, // p1 breaks the line
                { actor: 'ball', to: { x: 4, y: 6 }, dur: 1000 }, // Long ground pass
                { delay: 300 },
                { actor: 'ball', to: { x: 6, y: 0 }, dur: 500 } // Goal
            ]
        }
    ];
}

// Generate sensible defaults for the remaining fundamentals (adapted for 4 players)
function scaffoldDrills4p(type, categoryLabel) {
    const drills = [];
    for (let i = 1; i <= 10; i++) {
        let title = `${categoryLabel} Coletivo #${i}`;
        let playerObj = { p1: { x: 5, y: 15 }, p2: { x: 2, y: 10 }, p3: { x: 8, y: 10 }, p4: { x: 5, y: 5 } };
        let anim = [];
        let desc = `Exercício de quarteto (4 jogadores) trabalhando a coordenação, reação motora e técnica específica de ${type.toUpperCase()}. Interações de suporte essenciais.`;

        if (i % 2 === 0) {
            anim = [
                { actor: 'ball', to: { x: 5, y: 15 }, dur: 1000 },
                { delay: 300 },
                { actor: 'ball', to: { x: 2, y: 10 }, dur: 800, sync: true },
                { actor: 'p1', to: { x: 3, y: 12 }, dur: 1000 },
                { delay: 300 },
                { actor: 'ball', to: { x: 5, y: 0 }, dur: 800 }
            ];
        } else {
            anim = [
                { actor: 'ball', to: { x: 2, y: 10 }, dur: 1000, sync: true },
                { actor: 'p2', to: { x: 4, y: 8 }, dur: 1000, sync: true },
                { actor: 'p3', to: { x: 6, y: 8 }, dur: 1000 },
                { delay: 200 },
                { actor: 'ball', to: { x: 6, y: 8 }, dur: 800 },
                { delay: 300 },
                { actor: 'ball', to: { x: 2, y: 0 }, dur: 800 }
            ];
        }

        drills.push({
            id: `${type}-${i}`,
            title: title,
            desc: desc,
            setup: { players: playerObj, ball: { x: 0.5, y: 0 }, cones: [] },
            anim: anim
        });
    }
    return drills;
}

FLData.fundamentals[1].drills = createPasseDrills4p();
FLData.fundamentals[0].drills = scaffoldDrills4p('dom', 'Controle e Domínio');
FLData.fundamentals[2].drills = scaffoldDrills4p('chu', 'Finalização Dinâmica');
FLData.fundamentals[3].drills = scaffoldDrills4p('dri', 'Drible em Espaços Curtos');
FLData.fundamentals[4].drills = scaffoldDrills4p('con', 'Transição e Condução');
FLData.fundamentals[5].drills = scaffoldDrills4p('cab', 'Jogo Aéreo / Cabeceio');
FLData.fundamentals[6].drills = scaffoldDrills4p('mar', 'Dobras de Marcação');
FLData.fundamentals[7].drills = scaffoldDrills4p('atl', 'Circuitos e Sprint 4x4');
FLData.fundamentals[8].drills = scaffoldDrills4p('fes', 'Atividade de Festa');

window.FLData = FLData;
