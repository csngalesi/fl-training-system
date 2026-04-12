-- FL Training System — Migration v11
-- Tabela fl_carga_registros: registros de PSE por aluno/sessão
-- Execute no SQL Editor do Supabase

CREATE TABLE IF NOT EXISTS public.fl_carga_registros (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    week_plan_id  UUID NOT NULL REFERENCES public.fl_week_plans(id) ON DELETE CASCADE,
    student_id    TEXT,           -- ID do aluno no FL Gestão (pode ser NULL)
    student_name  TEXT NOT NULL,
    pse_value     SMALLINT NOT NULL CHECK (pse_value BETWEEN 0 AND 10),
    session_label TEXT,           -- ex: "Terça 10:00"
    recorded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.fl_carga_registros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fl_carga_read"   ON public.fl_carga_registros FOR SELECT USING (true);
CREATE POLICY "fl_carga_manage" ON public.fl_carga_registros FOR ALL TO authenticated USING (true) WITH CHECK (true);
