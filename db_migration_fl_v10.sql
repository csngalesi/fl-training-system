-- FL Training System — Migration v10
-- Adiciona colunas de mídia na tabela fl_mensagem
-- Execute no SQL Editor do Supabase

ALTER TABLE public.fl_mensagem
    ADD COLUMN IF NOT EXISTS media_geral   JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS media_tecnico JSONB NOT NULL DEFAULT '[]'::jsonb;
