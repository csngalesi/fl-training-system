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
            const { data, error } = await db()
                .from('fl_fundamentals')
                .insert(payload)
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
            if (!data || data.length === 0) throw new Error('Nenhuma linha atualizada — verifique autenticação/RLS no Supabase.');
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

    window.FLApi = { Fundamentals, Drills, Templates, WeekPlans };

    console.info('[FL] API module loaded.');
})();
