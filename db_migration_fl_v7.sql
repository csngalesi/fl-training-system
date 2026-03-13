-- FL Training System — Migration v7
-- Adds visible_in_week flag to fl_week_plans
-- Run this in Supabase SQL Editor

ALTER TABLE fl_week_plans
    ADD COLUMN IF NOT EXISTS visible_in_week BOOLEAN NOT NULL DEFAULT false;
