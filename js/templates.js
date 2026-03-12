/**
 * FL Training System — Movement Templates
 * Each template contains 15 pre-built frames for the Visual Builder.
 * rot: degrees (0=up, 90=right, 180=down, 270=left)
 * foot: null | 'L' | 'R'
 */
/* global window */
window.FL_TEMPLATES = [
    {
        id: 'orientado-2p',
        title: 'Movimentação de Orientado (2 atletas)',
        description: 'P2 abaixo do quadrado passa para P1 no centro. P1 domina e sai pela direita (pé D), passa por fora e volta. Repete pela esquerda (pé E).',
        frames: [
            // 0 — Setup: P1 centro do quadrado, P2 abaixo com bola
            {
                p1: { x: 5,   y: 10, rot: 180, foot: null },
                p2: { x: 5,   y: 16, rot: 0,   foot: null },
                p3: { x: 1,   y: 19, rot: 0,   foot: null },
                p4: { x: 9,   y: 19, rot: 0,   foot: null },
                ball: { x: 5, y: 16 },
                cones: [{ x: 3, y: 8 }, { x: 7, y: 8 }, { x: 3, y: 14 }, { x: 7, y: 14 }]
            },
            // 1 — P2 passa para P1 (pé direito)
            {
                p1: { x: 5,   y: 10, rot: 180, foot: null },
                p2: { x: 5,   y: 16, rot: 0,   foot: 'R'  },
                p3: { x: 1,   y: 19, rot: 0,   foot: null },
                p4: { x: 9,   y: 19, rot: 0,   foot: null },
                ball: { x: 5, y: 10 },
                cones: [{ x: 3, y: 8 }, { x: 7, y: 8 }, { x: 3, y: 14 }, { x: 7, y: 14 }]
            },
            // 2 — P1 recebe e se orienta para a direita
            {
                p1: { x: 5,   y: 10, rot: 90,  foot: 'R'  },
                p2: { x: 5,   y: 16, rot: 0,   foot: null },
                p3: { x: 1,   y: 19, rot: 0,   foot: null },
                p4: { x: 9,   y: 19, rot: 0,   foot: null },
                ball: { x: 5, y: 10 },
                cones: [{ x: 3, y: 8 }, { x: 7, y: 8 }, { x: 3, y: 14 }, { x: 7, y: 14 }]
            },
            // 3 — P1 conduz até a borda direita do quadrado
            {
                p1: { x: 7,   y: 10, rot: 90,  foot: 'R'  },
                p2: { x: 5,   y: 16, rot: 0,   foot: null },
                p3: { x: 1,   y: 19, rot: 0,   foot: null },
                p4: { x: 9,   y: 19, rot: 0,   foot: null },
                ball: { x: 7.5, y: 10 },
                cones: [{ x: 3, y: 8 }, { x: 7, y: 8 }, { x: 3, y: 14 }, { x: 7, y: 14 }]
            },
            // 4 — P1 sai do quadrado à direita com bola
            {
                p1: { x: 9,   y: 10, rot: 90,  foot: 'R'  },
                p2: { x: 5,   y: 16, rot: 0,   foot: null },
                p3: { x: 1,   y: 19, rot: 0,   foot: null },
                p4: { x: 9,   y: 19, rot: 0,   foot: null },
                ball: { x: 9, y: 10 },
                cones: [{ x: 3, y: 8 }, { x: 7, y: 8 }, { x: 3, y: 14 }, { x: 7, y: 14 }]
            },
            // 5 — P1 passa por fora do quadrado (pé direito)
            {
                p1: { x: 9,   y: 10, rot: 45,  foot: 'R'  },
                p2: { x: 5,   y: 16, rot: 0,   foot: null },
                p3: { x: 1,   y: 19, rot: 0,   foot: null },
                p4: { x: 9,   y: 19, rot: 0,   foot: null },
                ball: { x: 10, y: 6 },
                cones: [{ x: 3, y: 8 }, { x: 7, y: 8 }, { x: 3, y: 14 }, { x: 7, y: 14 }]
            },
            // 6 — P1 gira e começa a voltar; bola retorna para P2
            {
                p1: { x: 9,   y: 10, rot: 270, foot: null },
                p2: { x: 5,   y: 16, rot: 0,   foot: null },
                p3: { x: 1,   y: 19, rot: 0,   foot: null },
                p4: { x: 9,   y: 19, rot: 0,   foot: null },
                ball: { x: 5, y: 16 },
                cones: [{ x: 3, y: 8 }, { x: 7, y: 8 }, { x: 3, y: 14 }, { x: 7, y: 14 }]
            },
            // 7 — P1 volta ao centro do quadrado
            {
                p1: { x: 5,   y: 10, rot: 180, foot: null },
                p2: { x: 5,   y: 16, rot: 0,   foot: null },
                p3: { x: 1,   y: 19, rot: 0,   foot: null },
                p4: { x: 9,   y: 19, rot: 0,   foot: null },
                ball: { x: 5, y: 16 },
                cones: [{ x: 3, y: 8 }, { x: 7, y: 8 }, { x: 3, y: 14 }, { x: 7, y: 14 }]
            },
            // 8 — P2 passa novamente (pé esquerdo)
            {
                p1: { x: 5,   y: 10, rot: 180, foot: null },
                p2: { x: 5,   y: 16, rot: 0,   foot: 'L'  },
                p3: { x: 1,   y: 19, rot: 0,   foot: null },
                p4: { x: 9,   y: 19, rot: 0,   foot: null },
                ball: { x: 5, y: 10 },
                cones: [{ x: 3, y: 8 }, { x: 7, y: 8 }, { x: 3, y: 14 }, { x: 7, y: 14 }]
            },
            // 9 — P1 recebe e se orienta para a esquerda
            {
                p1: { x: 5,   y: 10, rot: 270, foot: 'L'  },
                p2: { x: 5,   y: 16, rot: 0,   foot: null },
                p3: { x: 1,   y: 19, rot: 0,   foot: null },
                p4: { x: 9,   y: 19, rot: 0,   foot: null },
                ball: { x: 5, y: 10 },
                cones: [{ x: 3, y: 8 }, { x: 7, y: 8 }, { x: 3, y: 14 }, { x: 7, y: 14 }]
            },
            // 10 — P1 conduz até a borda esquerda do quadrado
            {
                p1: { x: 3,   y: 10, rot: 270, foot: 'L'  },
                p2: { x: 5,   y: 16, rot: 0,   foot: null },
                p3: { x: 1,   y: 19, rot: 0,   foot: null },
                p4: { x: 9,   y: 19, rot: 0,   foot: null },
                ball: { x: 2.5, y: 10 },
                cones: [{ x: 3, y: 8 }, { x: 7, y: 8 }, { x: 3, y: 14 }, { x: 7, y: 14 }]
            },
            // 11 — P1 sai do quadrado à esquerda com bola
            {
                p1: { x: 1,   y: 10, rot: 270, foot: 'L'  },
                p2: { x: 5,   y: 16, rot: 0,   foot: null },
                p3: { x: 1,   y: 19, rot: 0,   foot: null },
                p4: { x: 9,   y: 19, rot: 0,   foot: null },
                ball: { x: 1, y: 10 },
                cones: [{ x: 3, y: 8 }, { x: 7, y: 8 }, { x: 3, y: 14 }, { x: 7, y: 14 }]
            },
            // 12 — P1 passa por fora do quadrado (pé esquerdo)
            {
                p1: { x: 1,   y: 10, rot: -45, foot: 'L'  },
                p2: { x: 5,   y: 16, rot: 0,   foot: null },
                p3: { x: 1,   y: 19, rot: 0,   foot: null },
                p4: { x: 9,   y: 19, rot: 0,   foot: null },
                ball: { x: 0, y: 6 },
                cones: [{ x: 3, y: 8 }, { x: 7, y: 8 }, { x: 3, y: 14 }, { x: 7, y: 14 }]
            },
            // 13 — P1 gira para voltar ao centro
            {
                p1: { x: 1,   y: 10, rot: 90,  foot: null },
                p2: { x: 5,   y: 16, rot: 0,   foot: null },
                p3: { x: 1,   y: 19, rot: 0,   foot: null },
                p4: { x: 9,   y: 19, rot: 0,   foot: null },
                ball: { x: 0, y: 6 },
                cones: [{ x: 3, y: 8 }, { x: 7, y: 8 }, { x: 3, y: 14 }, { x: 7, y: 14 }]
            },
            // 14 — P1 volta ao centro (ciclo completo)
            {
                p1: { x: 5,   y: 10, rot: 180, foot: null },
                p2: { x: 5,   y: 16, rot: 0,   foot: null },
                p3: { x: 1,   y: 19, rot: 0,   foot: null },
                p4: { x: 9,   y: 19, rot: 0,   foot: null },
                ball: { x: 5, y: 16 },
                cones: [{ x: 3, y: 8 }, { x: 7, y: 8 }, { x: 3, y: 14 }, { x: 7, y: 14 }]
            },
        ]
    }
];
