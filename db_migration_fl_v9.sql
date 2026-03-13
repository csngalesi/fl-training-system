-- FL Training System — Migration v9
-- Ensures sort_order column exists on fl_fundamentals
-- Also sets initial sort_order values for rows that have NULL
-- Run this in Supabase SQL Editor

ALTER TABLE fl_fundamentals
    ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

-- Assign sequential sort_order to rows where it is still 0
-- (preserves existing non-zero values)
WITH ranked AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY id ASC) AS rn
    FROM fl_fundamentals
    WHERE sort_order = 0
)
UPDATE fl_fundamentals f
SET sort_order = r.rn
FROM ranked r
WHERE f.id = r.id;
