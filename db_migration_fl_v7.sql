-- FL Training System — Migration v7
-- Corrige RLS de fl_drills: permite update/delete para qualquer usuário autenticado
-- (drills importados via SQL ficam com user_id NULL e eram bloqueados pelas policies antigas)
-- Execute no SQL Editor do Supabase

DROP POLICY IF EXISTS "fl_drill_update" ON public.fl_drills;
DROP POLICY IF EXISTS "fl_drill_delete" ON public.fl_drills;

CREATE POLICY "fl_drill_update" ON public.fl_drills
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "fl_drill_delete" ON public.fl_drills
    FOR DELETE USING (auth.uid() IS NOT NULL);
