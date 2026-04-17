/**
 * FL Training System — API Module
 * Queries Supabase. Exposed via window.FLApi.
 */
(function () {
    'use strict';

    const db = () => window.supabaseClient;

    // ── Fundamentals ─────────────────────────────────────────────
    const Fundamentals = {
        async getAll() {
            const { data, error } = await db()
                .from('fl_fundamentals')
                .select('id, title, icon, base_tech, sort_order, videos')
                .order('sort_order', { ascending: true });
            if (error) throw error;
            return data || [];
        },

        async create(payload) {
            const row = { id: crypto.randomUUID(), ...payload };
            const { data, error } = await db()
                .from('fl_fundamentals')
                .insert(row)
                .select();
            if (error) throw error;
            return (data || [])[0];
        },

        async update(id, payload) {
            const { data, error } = await db()
                .from('fl_fundamentals')
                .update(payload)
                .eq('id', id)
                .select('id');
            if (error) throw error;
            return data && data.length > 0; // true = updated, false = 0 rows matched
        },

        async delete(id) {
            const { error } = await db()
                .from('fl_fundamentals')
                .delete()
                .eq('id', id);
            if (error) throw error;
        },
    };

    // ── Drills ────────────────────────────────────────────────────
    const Drills = {
        async getByFundamental(fundamentalId) {
            const { data, error } = await db()
                .from('fl_drills')
                .select('id, fundamental_id, title, description, duration, setup, anim, sort_order, user_id, created_at')
                .eq('fundamental_id', fundamentalId)
                .order('sort_order', { ascending: true })
                .order('created_at', { ascending: true });
            if (error) throw error;
            return data || [];
        },

        async create(payload) {
            const user = await window.FLAuth.currentUser();
            const { data, error } = await db()
                .from('fl_drills')
                .insert({ ...payload, user_id: user.id })
                .select()
                .single();
            if (error) throw error;
            return data;
        },

        async update(id, payload) {
            const { data, error } = await db()
                .from('fl_drills')
                .update(payload)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },

        async delete(id) {
            const { error } = await db()
                .from('fl_drills')
                .delete()
                .eq('id', id);
            if (error) throw error;
        },

        async getById(id) {
            const { data, error } = await db()
                .from('fl_drills')
                .select('id, fundamental_id, title, description, duration, setup, anim')
                .eq('id', id)
                .single();
            if (error) throw error;
            return data;
        },
    };

    // ── Templates ─────────────────────────────────────────────────
    const Templates = {
        async getAll() {
            const { data, error } = await db()
                .from('fl_templates')
                .select('id, title, description, frames, created_at')
                .order('created_at', { ascending: true });
            if (error) throw error;
            return data || [];
        },

        async create(payload) {
            const { data, error } = await db()
                .from('fl_templates')
                .insert(payload)
                .select()
                .single();
            if (error) throw error;
            return data;
        },

        async update(id, payload) {
            const { data, error } = await db()
                .from('fl_templates')
                .update(payload)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },

        async delete(id) {
            const { error } = await db()
                .from('fl_templates')
                .delete()
                .eq('id', id);
            if (error) throw error;
        },
    };

    // ── Week Plans ────────────────────────────────────────────────
    const WeekPlans = {
        async getAll() {
            const { data, error } = await db()
                .from('fl_week_plans')
                .select('id, title, sessions, is_active, visible_in_week, created_at')
                .order('created_at', { ascending: true });
            if (error) throw error;
            return data || [];
        },

        async getVisible() {
            const { data, error } = await db()
                .from('fl_week_plans')
                .select('id, title, sessions, is_active, visible_in_week, created_at')
                .eq('visible_in_week', true)
                .order('created_at', { ascending: true });
            if (error) throw error;
            return data || [];
        },

        async create(payload) {
            const { data, error } = await db()
                .from('fl_week_plans')
                .insert(payload)
                .select()
                .single();
            if (error) throw error;
            return data;
        },

        async update(id, payload) {
            const { data, error } = await db()
                .from('fl_week_plans')
                .update(payload)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },

        async delete(id) {
            const { error } = await db()
                .from('fl_week_plans')
                .delete()
                .eq('id', id);
            if (error) throw error;
        },

        async setActive(id) {
            // Deactivate all, then activate the selected one
            const { error: e1 } = await db()
                .from('fl_week_plans')
                .update({ is_active: false })
                .neq('id', id);
            if (e1) throw e1;
            const { error: e2 } = await db()
                .from('fl_week_plans')
                .update({ is_active: true })
                .eq('id', id);
            if (e2) throw e2;
        },
    };

    // ── Mensagem ──────────────────────────────────────────────────
    const Mensagem = {
        async getByPlan(planId) {
            const { data, error } = await db()
                .from('fl_mensagem')
                .select('*')
                .eq('week_plan_id', planId)
                .maybeSingle();
            if (error) throw error;
            return data;
        },
        async save(id, payload) {
            if (id) {
                const { data, error } = await db()
                    .from('fl_mensagem')
                    .update({ ...payload, updated_at: new Date().toISOString() })
                    .eq('id', id)
                    .select().single();
                if (error) throw error;
                return data;
            }
            const { data, error } = await db()
                .from('fl_mensagem')
                .insert(payload)
                .select().single();
            if (error) throw error;
            return data;
        },
    };

    // ── Carga Registros ───────────────────────────────────────────
    const CargaRegistros = {
        async create(payload) {
            const { data, error } = await db()
                .from('fl_carga_registros')
                .insert(payload)
                .select()
                .single();
            if (error) throw error;
            return data;
        },

        async getByPlan(weekPlanId) {
            const { data, error } = await db()
                .from('fl_carga_registros')
                .select('*')
                .eq('week_plan_id', weekPlanId)
                .order('recorded_at', { ascending: false });
            if (error) throw error;
            return data || [];
        },

        async delete(id) {
            const { error } = await db()
                .from('fl_carga_registros')
                .delete()
                .eq('id', id);
            if (error) throw error;
        },
    };

    // ── Storage ───────────────────────────────────────────────────
    const Storage = {
        async upload(file) {
            const ext      = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
            const { data, error } = await db()
                .storage
                .from('fl-media')
                .upload(fileName, file, { contentType: file.type, upsert: false });
            if (error) throw error;
            const { data: urlData } = db().storage.from('fl-media').getPublicUrl(data.path);
            return urlData.publicUrl;
        },
    };

    // ── FL Gestão (external Supabase via REST) ────────────────────
    const FL_GESTAO_URL = 'https://negipnauepyeztarwvye.supabase.co';
    const FL_GESTAO_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lZ2lwbmF1ZXB5ZXp0YXJ3dnllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NTMyNjMsImV4cCI6MjA4ODIyOTI2M30.GZ49uxi39X6RSDHdyksAw8XnKxwvvq_QvH5WCNi0NGg';

    async function flGestaoFetch(path) {
        const res = await fetch(`${FL_GESTAO_URL}/rest/v1/${path}`, {
            headers: {
                apikey: FL_GESTAO_KEY,
                Authorization: `Bearer ${FL_GESTAO_KEY}`,
                Accept: 'application/json',
            },
        });
        if (!res.ok) throw new Error(`FL Gestão API error: ${res.status}`);
        return res.json();
    }

    const FLGestao = {
        async getAllStudents() {
            return flGestaoFetch('students?student_type=in.(aluno,pre-cadastro)&select=id,full_name,student_type&order=full_name.asc');
        },

        async getSessionStudents(dayOfWeek, startTime) {
            // Find the schedule_class for this day+time
            const classes = await flGestaoFetch(
                `schedule_classes?day_of_week=eq.${dayOfWeek}&start_time=eq.${startTime}&select=id`
            );
            if (!classes.length) return [];
            const classId = classes[0].id;
            const enrollments = await flGestaoFetch(
                `class_enrollments?schedule_class_id=eq.${classId}&select=student_id,students(id,full_name)`
            );
            return enrollments.map(e => ({
                id:   e.student_id,
                full_name: e.students ? e.students.full_name : '?',
            }));
        },
    };

    window.FLApi = { Fundamentals, Drills, Templates, WeekPlans, Mensagem, CargaRegistros, FLGestao, Storage };

    console.info('[FL] API module loaded.');
})();
