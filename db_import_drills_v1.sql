-- FL Training System — Importação de Drills v1
-- Execute no SQL Editor do Supabase
-- Os drills são vinculados aos fundamentais pelo título (case-insensitive).
-- Se algum fundamental não for encontrado, um NOTICE é exibido e o drill é ignorado.

DO $$
DECLARE
    f_passe    UUID;
    f_conducao UUID;
    f_dominio  UUID;
    f_situacao UUID;
    f_final    UUID;
    f_comb     UUID;
BEGIN
    -- Busca IDs dos fundamentais pelo título
    SELECT id INTO f_passe    FROM public.fl_fundamentals WHERE title ILIKE 'passe'            LIMIT 1;
    SELECT id INTO f_conducao FROM public.fl_fundamentals WHERE title ILIKE 'condução'         LIMIT 1;
    SELECT id INTO f_dominio  FROM public.fl_fundamentals WHERE title ILIKE 'domínio'          LIMIT 1;
    SELECT id INTO f_situacao FROM public.fl_fundamentals WHERE title ILIKE 'situação de jogo' LIMIT 1;
    SELECT id INTO f_final    FROM public.fl_fundamentals WHERE title ILIKE 'finalização'      LIMIT 1;
    SELECT id INTO f_comb     FROM public.fl_fundamentals WHERE title ILIKE 'combinado'        LIMIT 1;

    -- Avisos se algum fundamental não existir
    IF f_passe    IS NULL THEN RAISE NOTICE 'AVISO: Fundamental "Passe" não encontrado — drills ignorados.'; END IF;
    IF f_conducao IS NULL THEN RAISE NOTICE 'AVISO: Fundamental "Condução" não encontrado — drills ignorados.'; END IF;
    IF f_dominio  IS NULL THEN RAISE NOTICE 'AVISO: Fundamental "Domínio" não encontrado — drills ignorados.'; END IF;
    IF f_situacao IS NULL THEN RAISE NOTICE 'AVISO: Fundamental "Situação de Jogo" não encontrado — drills ignorados.'; END IF;
    IF f_final    IS NULL THEN RAISE NOTICE 'AVISO: Fundamental "Finalização" não encontrado — drills ignorados.'; END IF;
    IF f_comb     IS NULL THEN RAISE NOTICE 'AVISO: Fundamental "Combinado" não encontrado — drills ignorados.'; END IF;

    -- ──────────────────────────────────────────────────────────────
    -- PASSE (3 drills)
    -- ──────────────────────────────────────────────────────────────
    IF f_passe IS NOT NULL THEN
        INSERT INTO public.fl_drills (id, fundamental_id, title, description, setup, anim, sort_order)
        VALUES
            (gen_random_uuid(), f_passe,
             'Passe com deslocamento lateral',
             'Dois discos: desloca para o disco da esquerda e passa com a esquerda; desloca para o disco da direita e passa com a direita.',
             '{"players":{},"ball":{"x":0.5,"y":0.5},"cones":[]}'::jsonb, '[]'::jsonb, 1),

            (gen_random_uuid(), f_passe,
             'Passe e aproximação',
             'Duas filas: realiza o passe e aproxima para a tabela; após a tabela, o jogador da fila que recebeu faz o passe para a fila do outro jogador. Mínimo 3 pessoas.',
             '{"players":{},"ball":{"x":0.5,"y":0.5},"cones":[]}'::jsonb, '[]'::jsonb, 2),

            (gen_random_uuid(), f_passe,
             'Rondo',
             'Jogo de passe dentro de um quadrado com oposição.',
             '{"players":{},"ball":{"x":0.5,"y":0.5},"cones":[]}'::jsonb, '[]'::jsonb, 3);
    END IF;

    -- ──────────────────────────────────────────────────────────────
    -- CONDUÇÃO (5 drills)
    -- ──────────────────────────────────────────────────────────────
    IF f_conducao IS NOT NULL THEN
        INSERT INTO public.fl_drills (id, fundamental_id, title, description, setup, anim, sort_order)
        VALUES
            (gen_random_uuid(), f_conducao,
             'Condução de direção',
             'Fila com discos: condução ida e volta.',
             '{"players":{},"ball":{"x":0.5,"y":0.5},"cones":[]}'::jsonb, '[]'::jsonb, 1),

            (gen_random_uuid(), f_conducao,
             'Condução com passe preciso',
             'Condução em velocidade entre discos, terminar com passe preciso em mini-gol.',
             '{"players":{},"ball":{"x":0.5,"y":0.5},"cones":[]}'::jsonb, '[]'::jsonb, 2),

            (gen_random_uuid(), f_conducao,
             'Filas para condução',
             'Executar filas com condução de diferentes formas para um melhor repertório motor.',
             '{"players":{},"ball":{"x":0.5,"y":0.5},"cones":[]}'::jsonb, '[]'::jsonb, 3),

            (gen_random_uuid(), f_conducao,
             'Condução básica',
             'Condução com drible e finalização rápida.',
             '{"players":{},"ball":{"x":0.5,"y":0.5},"cones":[]}'::jsonb, '[]'::jsonb, 4),

            (gen_random_uuid(), f_conducao,
             'Fila de discos dupla',
             'Uma fila de discos para cada jogador: condução entre eles, passe para a outra fila.',
             '{"players":{},"ball":{"x":0.5,"y":0.5},"cones":[]}'::jsonb, '[]'::jsonb, 5);
    END IF;

    -- ──────────────────────────────────────────────────────────────
    -- DOMÍNIO (3 drills)
    -- ──────────────────────────────────────────────────────────────
    IF f_dominio IS NOT NULL THEN
        INSERT INTO public.fl_drills (id, fundamental_id, title, description, setup, anim, sort_order)
        VALUES
            (gen_random_uuid(), f_dominio,
             'Domínio simples',
             'Exercício de domínio simples com diversas partes do corpo.',
             '{"players":{},"ball":{"x":0.5,"y":0.5},"cones":[]}'::jsonb, '[]'::jsonb, 1),

            (gen_random_uuid(), f_dominio,
             'Relóginho',
             'Exercício de domínio orientado em sentido, podendo ser com movimentação ou parado.',
             '{"players":{},"ball":{"x":0.5,"y":0.5},"cones":[]}'::jsonb, '[]'::jsonb, 2),

            (gen_random_uuid(), f_dominio,
             'Maq. Domínio',
             'Domínio, tira rápido e finalização.',
             '{"players":{},"ball":{"x":0.5,"y":0.5},"cones":[]}'::jsonb, '[]'::jsonb, 3);
    END IF;

    -- ──────────────────────────────────────────────────────────────
    -- SITUAÇÃO DE JOGO (2 drills)
    -- ──────────────────────────────────────────────────────────────
    IF f_situacao IS NOT NULL THEN
        INSERT INTO public.fl_drills (id, fundamental_id, title, description, setup, anim, sort_order)
        VALUES
            (gen_random_uuid(), f_situacao,
             'Enfrentamento — mini gols',
             '1x1 com mini gols.',
             '{"players":{},"ball":{"x":0.5,"y":0.5},"cones":[]}'::jsonb, '[]'::jsonb, 1),

            (gen_random_uuid(), f_situacao,
             'Enfrentamento — gol',
             '1x1 no gol.',
             '{"players":{},"ball":{"x":0.5,"y":0.5},"cones":[]}'::jsonb, '[]'::jsonb, 2);
    END IF;

    -- ──────────────────────────────────────────────────────────────
    -- FINALIZAÇÃO (4 drills)
    -- ──────────────────────────────────────────────────────────────
    IF f_final IS NOT NULL THEN
        INSERT INTO public.fl_drills (id, fundamental_id, title, description, setup, anim, sort_order)
        VALUES
            (gen_random_uuid(), f_final,
             'Passe em profundidade',
             'Troca de passes com passe em profundidade e finalização de primeira.',
             '{"players":{},"ball":{"x":0.5,"y":0.5},"cones":[]}'::jsonb, '[]'::jsonb, 1),

            (gen_random_uuid(), f_final,
             'Desmarque com finta',
             'Passe para o companheiro, finta recebendo o passe, finalização.',
             '{"players":{},"ball":{"x":0.5,"y":0.5},"cones":[]}'::jsonb, '[]'::jsonb, 2),

            (gen_random_uuid(), f_final,
             'Passe pivô',
             'Exercício de passe com jogo de pivô, ultrapassagem e finalização.',
             '{"players":{},"ball":{"x":0.5,"y":0.5},"cones":[]}'::jsonb, '[]'::jsonb, 3),

            (gen_random_uuid(), f_final,
             'Antecipação e giro',
             'Antecipação com giro e finalização.',
             '{"players":{},"ball":{"x":0.5,"y":0.5},"cones":[]}'::jsonb, '[]'::jsonb, 4);
    END IF;

    -- ──────────────────────────────────────────────────────────────
    -- COMBINADO (1 drill)
    -- ──────────────────────────────────────────────────────────────
    IF f_comb IS NOT NULL THEN
        INSERT INTO public.fl_drills (id, fundamental_id, title, description, setup, anim, sort_order)
        VALUES
            (gen_random_uuid(), f_comb,
             'Maq. Pivô',
             'Passe para o pivô com tabela e finalização de primeira.',
             '{"players":{},"ball":{"x":0.5,"y":0.5},"cones":[]}'::jsonb, '[]'::jsonb, 1);
    END IF;

    RAISE NOTICE 'Importação concluída.';
END $$;
