-- FL Training System — v4: Tabela de Templates de Movimentação
-- Execute no Supabase SQL Editor

CREATE TABLE fl_templates (
    id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    title       TEXT        NOT NULL,
    description TEXT        NOT NULL DEFAULT '',
    frames      JSONB       NOT NULL DEFAULT '[]',
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE fl_templates ENABLE ROW LEVEL SECURITY;

-- Usuários autenticados (admin) gerenciam; público só lê
CREATE POLICY "auth_manage" ON fl_templates
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "public_read" ON fl_templates
    FOR SELECT TO anon USING (true);
