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
                .select('id, title, icon, base_tech, sort_order')
                .order('sort_order', { ascending: true });
            if (error) throw error;
            return data || [];
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

    window.FLApi = { Fundamentals, Drills, Templates };

    console.info('[FL] API module loaded.');
})();
