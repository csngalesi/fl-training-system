-- FL Training System — Migration v18
-- Cria tabela fl_mensagem (caso não exista) e garante colunas necessárias
-- Execute no SQL Editor do Supabase do FL Training System

-- 1. Cria a tabela se ainda não existir
CREATE TABLE IF NOT EXISTS public.fl_mensagem (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    week_plan_id     UUID REFERENCES public.fl_week_plans(id) ON DELETE CASCADE,
    mensagem         TEXT,
    destaque_tecnico TEXT,
    media_mensagem   JSONB NOT NULL DEFAULT '[]',
    media_tecnica    JSONB NOT NULL DEFAULT '[]',
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Garante colunas (caso a tabela já existisse sem elas)
ALTER TABLE public.fl_mensagem
    ADD COLUMN IF NOT EXISTS week_plan_id     UUID REFERENCES public.fl_week_plans(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS mensagem         TEXT,
    ADD COLUMN IF NOT EXISTS destaque_tecnico TEXT,
    ADD COLUMN IF NOT EXISTS media_mensagem   JSONB NOT NULL DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS media_tecnica    JSONB NOT NULL DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- 3. RLS
ALTER TABLE public.fl_mensagem ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_full_access" ON public.fl_mensagem;
CREATE POLICY "auth_full_access" ON public.fl_mensagem
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Índice para busca por plano
CREATE INDEX IF NOT EXISTS idx_fl_mensagem_week_plan
    ON public.fl_mensagem (week_plan_id);
