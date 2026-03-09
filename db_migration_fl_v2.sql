-- FL Training System — Migration v2
-- Adiciona o fundamental "Atividades de Festa"
-- Execute no Supabase SQL Editor do projeto FL

INSERT INTO public.fl_fundamentals (id, title, icon, base_tech, sort_order)
VALUES (
    'festa',
    'Atividades de Festa',
    'fa-cake-candles',
    'Exercícios lúdicos e recreativos voltados para celebração, integração e diversão em grupo. Perfeitos para encerramento de temporada, confraternizações e eventos especiais. Atividades de baixa pressão que reforçam o senso de equipe e alegria pelo esporte.',
    9
)
ON CONFLICT (id) DO NOTHING;
