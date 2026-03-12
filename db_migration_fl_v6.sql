-- FL Training System — v6: Tabela de Planos de Treino da Semana
-- Execute no Supabase SQL Editor

CREATE TABLE fl_week_plans (
    id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    title       TEXT        NOT NULL,
    sessions    JSONB       NOT NULL DEFAULT '[]',
    is_active   BOOLEAN     NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE fl_week_plans ENABLE ROW LEVEL SECURITY;

-- Usuários autenticados (admin) gerenciam; público só lê
CREATE POLICY "auth_manage" ON fl_week_plans
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "public_read" ON fl_week_plans
    FOR SELECT TO anon USING (true);
