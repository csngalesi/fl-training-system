-- FL Training System — v3: Limpar dados e reinserir fundamentos
-- Execute no Supabase SQL Editor

-- 1. Limpar tudo
DELETE FROM fl_drills;
DELETE FROM fl_fundamentals;

-- 2. Re-inserir os 9 fundamentos
INSERT INTO fl_fundamentals (id, title, icon, base_tech) VALUES
('dominio',  'Domínio de Bola',      'fa-magnet',              'O domínio é o princípio do controle. Usar pés, peito, coxa ou cabeça para "amortecer" a velocidade da bola. Nos treinos em grupo (4 alunos), focar no domínio direcionado que já prepara o passe para o próximo colega, usando a perna oposta à origem da bola para proteger a posse.'),
('passe',    'Passe (Equipe)',        'fa-arrow-right-arrow-left','A essência do jogo coletivo. O passe usando a parte interna do pé ("chapa") garante previsibilidade e firmeza. Nos exercícios com 4 jogadores, o foco é o "tocar e passar" (triangulações, rondos e profundidade), criando linhas de passe ativas e quebra das linhas de defesa.'),
('chute',    'Finalização (Chute)',   'fa-futbol',              'Precisão, não só força. O corpo ligeiramente inclinado sobre a bola evita o chute alto. Em grupo, trabalhamos a infiltração de pivôs e assistências.'),
('drible',   'Drible',               'fa-shoe-prints',         'Superar o adversário mantendo a posse. A base é a mudança brusca de velocidade e direção. Em formato 4x4, drible atrai marcação para liberar companheiros.'),
('conducao', 'Condução',             'fa-person-running',      'Progredir com a bola dominada perto do corpo (peito do pé). Útil para chamar a pressão adversária e explorar espaços vazios antes do passe em profundidade.'),
('cabeceio', 'Cabeceio',             'fa-user-large',          'Uso da testa com olhos abertos e pescoço rígido. Ataque na bola no ponto mais alto. Crucial em cruzamentos dinâmicos entre os alas (jogadores da ponta) e os centralizados.'),
('marcacao', 'Marcação Coletiva',    'fa-shield-halved',       'Base afastada e foco na bola, não no corpo. Acompanhar em "sombra" fechando o passe. Em quarteto, treina-se o balanço defensivo e dobras de marcação (cobertura).'),
('atletica', 'Técnica Atlética',     'fa-bolt',                'Explosão e desaceleração. Acelerações lineares e mudanças de direção em T. Treinos sincronizados para aprimorar tempo de reação visual e agilidade.'),
('festa',    'Atividades de Festa',  'fa-cake-candles',        'Exercícios lúdicos e recreativos voltados para celebração, integração e diversão em grupo. Perfeitos para encerramento de temporada, confraternizações e eventos especiais. Atividades de baixa pressão que reforçam o senso de equipe e alegria pelo esporte.');
