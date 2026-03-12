-- FL Training System — v5: Adiciona coluna duration em fl_drills
-- Execute no Supabase SQL Editor

ALTER TABLE fl_drills
    ADD COLUMN IF NOT EXISTS duration TEXT NOT NULL DEFAULT '';
