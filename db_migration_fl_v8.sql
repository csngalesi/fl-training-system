-- FL Training System — Migration v8
-- Tabela fl_mensagem: mensagem da semana para exibição no app
-- Execute no SQL Editor do Supabase

CREATE TABLE IF NOT EXISTS public.fl_mensagem (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mensagem         TEXT,
    destaque_tecnico TEXT,
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.fl_mensagem ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fl_mensagem_read" ON public.fl_mensagem
    FOR SELECT USING (true);

CREATE POLICY "fl_mensagem_manage" ON public.fl_mensagem
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
