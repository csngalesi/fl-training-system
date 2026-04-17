-- FL Training System — Migration v18
-- Vincula fl_mensagem a planos da semana + adiciona mídia dinâmica
-- Execute no SQL Editor do Supabase do FL Training System

ALTER TABLE public.fl_mensagem
    ADD COLUMN IF NOT EXISTS week_plan_id    UUID REFERENCES public.fl_week_plans(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS media_mensagem  JSONB NOT NULL DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS media_tecnica   JSONB NOT NULL DEFAULT '[]';

-- Índice para busca por plano
CREATE INDEX IF NOT EXISTS idx_fl_mensagem_week_plan
    ON public.fl_mensagem (week_plan_id);
