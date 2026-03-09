-- FL Training System — Migration v1
-- Cria tabelas fl_fundamentals e fl_drills + seed inicial
-- Execute no Supabase SQL Editor do seu projeto FL

-- ── Tabelas ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.fl_fundamentals (
    id         TEXT    PRIMARY KEY,          -- 'dominio', 'passe', etc.
    title      TEXT    NOT NULL,
    icon       TEXT    NOT NULL,             -- classe Font Awesome (ex: 'fa-magnet')
    base_tech  TEXT    DEFAULT '',
    sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.fl_drills (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    fundamental_id TEXT        NOT NULL REFERENCES public.fl_fundamentals(id) ON DELETE CASCADE,
    title          TEXT        NOT NULL,
    description    TEXT        DEFAULT '',
    setup          JSONB       NOT NULL DEFAULT '{}',  -- {players:{p1:{x,y},...}, ball:{x,y}, cones:[]}
    anim           JSONB       NOT NULL DEFAULT '[]',  -- [{actor, to:{x,y}, dur, sync?, delay?}, ...]
    sort_order     INTEGER     DEFAULT 0,
    user_id        UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at     TIMESTAMPTZ DEFAULT now()
);

-- ── RLS ──────────────────────────────────────────────────────────────────

ALTER TABLE public.fl_fundamentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fl_drills       ENABLE ROW LEVEL SECURITY;

-- Leitura pública (anon OK para o app)
CREATE POLICY "fl_fund_read"  ON public.fl_fundamentals FOR SELECT USING (true);
CREATE POLICY "fl_drill_read" ON public.fl_drills       FOR SELECT USING (true);

-- Escrita: somente autenticados
CREATE POLICY "fl_drill_insert" ON public.fl_drills
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Update/Delete: somente o criador
CREATE POLICY "fl_drill_update" ON public.fl_drills
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "fl_drill_delete" ON public.fl_drills
    FOR DELETE USING (auth.uid() = user_id);

-- ── Seed: 8 Fundamentos ───────────────────────────────────────────────────

INSERT INTO public.fl_fundamentals (id, title, icon, base_tech, sort_order) VALUES
(
    'dominio', 'Domínio de Bola', 'fa-magnet',
    'O domínio é o princípio do controle. Usar pés, peito, coxa ou cabeça para "amortecer" a velocidade da bola. Nos treinos em grupo (4 alunos), focar no domínio direcionado que já prepara o passe para o próximo colega, usando a perna oposta à origem da bola para proteger a posse.',
    0
),
(
    'passe', 'Passe (Equipe)', 'fa-arrow-right-arrow-left',
    'A essência do jogo coletivo. O passe usando a parte interna do pé ("chapa") garante previsibilidade e firmeza. Nos exercícios com 4 jogadores, o foco é o "tocar e passar" (triangulações, rondos e profundidade), criando linhas de passe ativas e quebra das linhas de defesa.',
    1
),
(
    'chute', 'Finalização (Chute)', 'fa-futbol',
    'Precisão, não só força. O corpo ligeiramente inclinado sobre a bola evita o chute alto. Em grupo, trabalhamos a infiltração de pivôs e assistências.',
    2
),
(
    'drible', 'Drible', 'fa-shoe-prints',
    'Superar o adversário mantendo a posse. A base é a mudança brusca de velocidade e direção. Em formato 4x4, drible atrai marcação para liberar companheiros.',
    3
),
(
    'conducao', 'Condução', 'fa-person-running',
    'Progredir com a bola dominada perto do corpo (peito do pé). Útil para chamar a pressão adversária e explorar espaços vazios antes do passe em profundidade.',
    4
),
(
    'cabeceio', 'Cabeceio', 'fa-user-large',
    'Uso da testa com olhos abertos e pescoço rígido. Ataque na bola no ponto mais alto. Crucial em cruzamentos dinâmicos entre os alas (jogadores da ponta) e os centralizados.',
    5
),
(
    'marcacao', 'Marcação Coletiva', 'fa-shield-halved',
    'Base afastada e foco na bola, não no corpo. Acompanhar em "sombra" fechando o passe. Em quarteto, treina-se o balanço defensivo e dobras de marcação (cobertura).',
    6
),
(
    'atletica', 'Técnica Atlética', 'fa-bolt',
    'Explosão e desaceleração. Acelerações lineares e mudanças de direção em T. Treinos sincronizados para aprimorar tempo de reação visual e agilidade.',
    7
)
ON CONFLICT (id) DO NOTHING;

-- ── Seed: 10 Drills de Passe ──────────────────────────────────────────────

INSERT INTO public.fl_drills (fundamental_id, title, description, setup, anim, sort_order) VALUES

(
    'passe', 'Losango de Passes Dinâmico',
    'P1, P2, P3 e P4 formam um losango. A Máquina lança a bola e o passe roda rápido em sentido horário. Todos se movem seguindo o toque.',
    '{"players":{"p1":{"x":5,"y":15},"p2":{"x":2,"y":10},"p3":{"x":8,"y":10},"p4":{"x":5,"y":5}},"ball":{"x":0.5,"y":0},"cones":[]}',
    '[{"actor":"ball","to":{"x":5,"y":15},"dur":1000},{"delay":400},{"actor":"ball","to":{"x":2,"y":10},"dur":800,"sync":true},{"actor":"p1","to":{"x":2,"y":10},"dur":1200},{"delay":200},{"actor":"ball","to":{"x":5,"y":5},"dur":800,"sync":true},{"actor":"p2","to":{"x":5,"y":5},"dur":1200},{"delay":200},{"actor":"ball","to":{"x":8,"y":10},"dur":800,"sync":true},{"actor":"p4","to":{"x":8,"y":10},"dur":1200},{"delay":200},{"actor":"ball","to":{"x":5,"y":15},"dur":800,"sync":true},{"actor":"p3","to":{"x":5,"y":15},"dur":1200},{"actor":"ball","to":{"x":5,"y":0},"dur":1000}]',
    0
),

(
    'passe', 'Rondo (Bobinho) 3x1 de Pressão',
    'P1, P2 e P3 trocam passes rápidos no espaço triangular usando 1/2 toques, enquanto P4 (bobinho) corre no centro tentando interceptar.',
    '{"players":{"p1":{"x":3,"y":14},"p2":{"x":7,"y":14},"p3":{"x":5,"y":8},"p4":{"x":5,"y":12}},"ball":{"x":3,"y":14},"cones":[]}',
    '[{"actor":"ball","to":{"x":7,"y":14},"dur":600,"sync":true},{"actor":"p4","to":{"x":6,"y":13},"dur":800},{"delay":200},{"actor":"ball","to":{"x":5,"y":8},"dur":600,"sync":true},{"actor":"p4","to":{"x":5.5,"y":10},"dur":800},{"delay":200},{"actor":"ball","to":{"x":3,"y":14},"dur":600,"sync":true},{"actor":"p4","to":{"x":4,"y":13},"dur":800}]',
    1
),

(
    'passe', 'Tabelão (1-2) com Infiltração',
    'A Máquina toca em P1, que escora pra P2 (curto). P2 lança em profundidade para P3 e P4, que cruzam correndo invadindo a área de gol.',
    '{"players":{"p1":{"x":5,"y":14},"p2":{"x":4,"y":10},"p3":{"x":2,"y":16},"p4":{"x":8,"y":16}},"ball":{"x":0.5,"y":0},"cones":[]}',
    '[{"actor":"ball","to":{"x":5,"y":14},"dur":1000},{"delay":300},{"actor":"ball","to":{"x":4,"y":10},"dur":600,"sync":true},{"actor":"p1","to":{"x":5,"y":3},"dur":1500,"sync":true},{"actor":"p3","to":{"x":4,"y":2},"dur":1800,"sync":true},{"actor":"p4","to":{"x":6,"y":2},"dur":1800},{"delay":200},{"actor":"ball","to":{"x":4,"y":2},"dur":800,"sync":true},{"actor":"ball","to":{"x":6,"y":2},"dur":500},{"actor":"ball","to":{"x":5,"y":0},"dur":300}]',
    2
),

(
    'passe', 'Recepção Dupla das Máquinas',
    'M1 e M2 lançam simultaneamente. P1 e P2 dominam e invertem de lado tocando cruzado para P3 e P4 que recebem no ataque e finalizam.',
    '{"players":{"p1":{"x":2,"y":10},"p2":{"x":8,"y":10},"p3":{"x":3,"y":4},"p4":{"x":7,"y":4}},"ball":{"x":0.5,"y":0},"cones":[]}',
    '[{"actor":"ball","to":{"x":2,"y":10},"dur":800},{"delay":400},{"actor":"ball","to":{"x":7,"y":4},"dur":800,"sync":true},{"actor":"p1","to":{"x":8,"y":10},"dur":1200,"sync":true},{"actor":"p2","to":{"x":2,"y":10},"dur":1200},{"delay":200},{"actor":"ball","to":{"x":5,"y":0},"dur":500}]',
    3
),

(
    'passe', 'Passe Paredão (Retorno de Pivô)',
    'P1 inicia o toque para o P2 (Pivô). P3 e P4 se deslocam como opções de escape. P2 pisa na bola e escora para P4 finalizar potente.',
    '{"players":{"p1":{"x":5,"y":18},"p2":{"x":5,"y":6},"p3":{"x":2,"y":12},"p4":{"x":8,"y":12}},"ball":{"x":5,"y":18},"cones":[{"x":5,"y":8}]}',
    '[{"actor":"ball","to":{"x":5,"y":6},"dur":1200},{"delay":300},{"actor":"p3","to":{"x":3,"y":6},"dur":800,"sync":true},{"actor":"p4","to":{"x":7,"y":6},"dur":800,"sync":true},{"actor":"ball","to":{"x":7,"y":6},"dur":600},{"delay":200},{"actor":"ball","to":{"x":6,"y":0},"dur":600}]',
    4
),

(
    'passe', 'Passa, Corre e Cobre (Circulação Ofensiva)',
    'Circulação em zigue-zague avançando o time. P1 toca para P2, que toca pra P3, que atinge P4. Todos que passam a bola correm para suprir o espaço vago do companheiro.',
    '{"players":{"p1":{"x":2,"y":18},"p2":{"x":8,"y":14},"p3":{"x":2,"y":8},"p4":{"x":8,"y":4}},"ball":{"x":2,"y":18},"cones":[]}',
    '[{"actor":"ball","to":{"x":8,"y":14},"dur":800,"sync":true},{"actor":"p1","to":{"x":8,"y":14},"dur":1200},{"delay":100},{"actor":"ball","to":{"x":2,"y":8},"dur":800,"sync":true},{"actor":"p2","to":{"x":2,"y":8},"dur":1200},{"delay":100},{"actor":"ball","to":{"x":8,"y":4},"dur":800,"sync":true},{"actor":"p3","to":{"x":8,"y":4},"dur":1200},{"delay":100},{"actor":"ball","to":{"x":5,"y":0},"dur":600}]',
    5
),

(
    'passe', 'Ruptura de Linhas Verticais',
    'P1 no fundo toca forte furando as linhas defensivas falsas até chegar à zona de frente com P3, que de primeira deixa P2 livre, cruzando, e P4 ataca a pequena área.',
    '{"players":{"p1":{"x":5,"y":18},"p2":{"x":3,"y":10},"p3":{"x":5,"y":4},"p4":{"x":7,"y":12}},"ball":{"x":5,"y":18},"cones":[{"x":4,"y":14},{"x":6,"y":14},{"x":4,"y":8},{"x":6,"y":8}]}',
    '[{"actor":"ball","to":{"x":5,"y":4},"dur":1400},{"delay":300},{"actor":"p2","to":{"x":3,"y":4},"dur":800,"sync":true},{"actor":"ball","to":{"x":3,"y":4},"dur":600},{"delay":200},{"actor":"p4","to":{"x":6,"y":2},"dur":1000,"sync":true},{"actor":"ball","to":{"x":6,"y":2},"dur":800},{"actor":"ball","to":{"x":5,"y":0},"dur":400}]',
    6
),

(
    'passe', 'Sobreposição Pelas Alas (Overlap)',
    'P1 toca para P2 e ultrapassa em alta velocidade pelas costas dele. P2 engana, gira e solta a bola na frente para P1. P3 e P4 se preparam para cruzar/finalizar.',
    '{"players":{"p1":{"x":8,"y":16},"p2":{"x":8,"y":10},"p3":{"x":2,"y":10},"p4":{"x":4,"y":5}},"ball":{"x":8,"y":16},"cones":[]}',
    '[{"actor":"ball","to":{"x":8,"y":10},"dur":800,"sync":true},{"actor":"p1","to":{"x":9,"y":4},"dur":1600},{"delay":600},{"actor":"ball","to":{"x":9,"y":4},"dur":700},{"delay":300},{"actor":"p3","to":{"x":4,"y":2},"dur":1000,"sync":true},{"actor":"p4","to":{"x":6,"y":2},"dur":1000,"sync":true},{"actor":"ball","to":{"x":5,"y":2},"dur":800},{"actor":"ball","to":{"x":4,"y":0},"dur":400}]',
    7
),

(
    'passe', 'Caixa de Passes de Alta Intensidade',
    'Formato em Quadrado 8x8m. Passes ultrarrápidos alternando pé direito/esquerdo. Aumenta a velocidade de raciocínio. A posse roda sem parar até o som do apito.',
    '{"players":{"p1":{"x":2,"y":14},"p2":{"x":8,"y":14},"p3":{"x":8,"y":6},"p4":{"x":2,"y":6}},"ball":{"x":2,"y":14},"cones":[]}',
    '[{"actor":"ball","to":{"x":8,"y":14},"dur":600},{"delay":200},{"actor":"ball","to":{"x":8,"y":6},"dur":600},{"delay":200},{"actor":"ball","to":{"x":2,"y":6},"dur":600},{"delay":200},{"actor":"ball","to":{"x":2,"y":14},"dur":600},{"delay":200},{"actor":"ball","to":{"x":8,"y":6},"dur":700}]',
    8
),

(
    'passe', 'Simulação Jogo Real (Mini-Partida 2x2)',
    'P1 e P2 (Ataque) contra P3 e P4 (Defesa). Foco é usar passes triangulados para furar a linha defensiva fechada e marcar gol no fundo.',
    '{"players":{"p1":{"x":3,"y":16},"p2":{"x":7,"y":16},"p3":{"x":4,"y":8},"p4":{"x":6,"y":8}},"ball":{"x":3,"y":16},"cones":[]}',
    '[{"actor":"p3","to":{"x":3,"y":12},"dur":800,"sync":true},{"actor":"ball","to":{"x":7,"y":16},"dur":700},{"delay":200},{"actor":"p4","to":{"x":7,"y":10},"dur":1000,"sync":true},{"actor":"p1","to":{"x":4,"y":6},"dur":1500,"sync":true},{"actor":"ball","to":{"x":4,"y":6},"dur":1000},{"delay":300},{"actor":"ball","to":{"x":6,"y":0},"dur":500}]',
    9
);
