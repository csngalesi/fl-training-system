/**
 * FL Training System — Supabase Client
 * Projeto: FL Training System (gtcqoeaspnbjocwliyhd)
 */
(function () {
    'use strict';

    const SUPABASE_URL = 'https://gtcqoeaspnbjocwliyhd.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_DGjTdlOTGMHAw4YrPkN60g_Ow3fwnrR';

    if (typeof window.supabase === 'undefined') {
        console.error('[FL] CRITICAL: Supabase SDK não carregado. Sirva via HTTP, não file://');
        window.supabaseClient = null;
        return;
    }

    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.info('[FL] Supabase client initialized.');
})();
