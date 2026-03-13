-- FL Training System — Migration v8
-- Adds videos JSONB to fl_fundamentals for YouTube video links
-- Run this in Supabase SQL Editor

ALTER TABLE fl_fundamentals
    ADD COLUMN IF NOT EXISTS videos JSONB NOT NULL DEFAULT '[]';
