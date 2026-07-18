-- ============================================================
-- FL Training System — Migration
-- Tabela: fl_camisetas
-- Linha única com quantities JSONB — compartilhada por todos
-- ============================================================

CREATE TABLE IF NOT EXISTS public.fl_camisetas (
    id          TEXT PRIMARY KEY DEFAULT 'global',  -- sempre 'global'
    quantities  JSONB NOT NULL DEFAULT '{}',
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inserir linha inicial vazia
INSERT INTO public.fl_camisetas (id, quantities)
VALUES ('global', '{}')
ON CONFLICT (id) DO NOTHING;

-- RLS: todos os autenticados leem e gravam
ALTER TABLE public.fl_camisetas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "camisetas: all authenticated read"
    ON public.fl_camisetas FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "camisetas: all authenticated update"
    ON public.fl_camisetas FOR UPDATE
    TO authenticated
    USING (true);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.fl_camisetas_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_fl_camisetas_updated_at ON public.fl_camisetas;
CREATE TRIGGER trg_fl_camisetas_updated_at
    BEFORE UPDATE ON public.fl_camisetas
    FOR EACH ROW EXECUTE FUNCTION public.fl_camisetas_set_updated_at();
