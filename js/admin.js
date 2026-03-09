/**
 * FL Training System — Admin Panel Logic
 */
(function () {
    'use strict';

    // ── State ────────────────────────────────────────────────────
    let fundamentals  = [];
    let currentFundId = null;
    let drills        = [];
    let editingId     = null;   // UUID of drill being edited (null = creating new)

    // ── DOM refs ─────────────────────────────────────────────────
    const loginSection    = document.getElementById('login-section');
    const adminSection    = document.getElementById('admin-section');
    const btnLogout       = document.getElementById('btn-logout');
    const loginEmail      = document.getElementById('login-email');
    const loginPassword   = document.getElementById('login-password');
    const loginError      = document.getElementById('login-error');
    const btnLogin        = document.getElementById('btn-login');

    const selFundamental  = document.getElementById('sel-fundamental');
    const drillList       = document.getElementById('drill-list');
    const btnNewDrill     = document.getElementById('btn-new-drill');

    // New form
    const formNew         = document.getElementById('drill-form-panel');
    const newTitle        = document.getElementById('new-title');
    const newFundamental  = document.getElementById('new-fundamental');
    const newDesc         = document.getElementById('new-desc');
    const newSetup        = document.getElementById('new-setup');
    const newAnim         = document.getElementById('new-anim');
    const btnSaveNew      = document.getElementById('btn-save-new');
    const btnCancelNew    = document.getElementById('btn-cancel-new');

    // Edit form
    const formEdit        = document.getElementById('inline-edit-form');
    const editFormTitle   = document.getElementById('edit-form-title');
    const editTitle       = document.getElementById('edit-title');
    const editFundamental = document.getElementById('edit-fundamental');
    const editDesc        = document.getElementById('edit-desc');
    const editSetup       = document.getElementById('edit-setup');
    const editAnim        = document.getElementById('edit-anim');
    const btnSaveEdit     = document.getElementById('btn-save-edit');
    const btnCancelEdit   = document.getElementById('btn-cancel-edit');

    // Guide modal
    const guideModal      = document.getElementById('guide-modal');
    const btnCloseGuide   = document.getElementById('btn-close-guide');

    // ── Toast ────────────────────────────────────────────────────
    let toastTimer = null;

    function toast(msg, type = 'success') {
        const el = document.getElementById('toast');
        el.textContent = msg;
        el.className = `toast-${type}`;
        el.classList.remove('hide');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => el.classList.add('hide'), 3000);
    }

    // ── Auth ─────────────────────────────────────────────────────
    async function init() {
        const user = await window.FLAuth.currentUser();
        if (user) {
            showAdmin();
        } else {
            showLogin();
        }

        window.FLAuth.onAuthStateChange((event, session) => {
            if (session) showAdmin();
            else showLogin();
        });
    }

    function showLogin() {
        loginSection.classList.remove('hidden');
        adminSection.classList.add('hidden');
        btnLogout.classList.add('hidden');
    }

    async function showAdmin() {
        loginSection.classList.add('hidden');
        adminSection.classList.remove('hidden');
        btnLogout.classList.remove('hidden');
        await loadFundamentals();
    }

    btnLogin.addEventListener('click', async () => {
        const email = loginEmail.value.trim();
        const pass  = loginPassword.value;
        loginError.classList.add('hidden');
        btnLogin.disabled = true;
        btnLogin.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Entrando...';
        try {
            await window.FLAuth.login(email, pass);
        } catch (err) {
            loginError.textContent = err.message || 'Credenciais inválidas.';
            loginError.classList.remove('hidden');
        } finally {
            btnLogin.disabled = false;
            btnLogin.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Entrar';
        }
    });

    loginPassword.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') btnLogin.click();
    });

    btnLogout.addEventListener('click', async () => {
        await window.FLAuth.logout();
    });

    // ── Fundamentals ─────────────────────────────────────────────
    async function loadFundamentals() {
        try {
            fundamentals = await window.FLApi.Fundamentals.getAll();
        } catch (err) {
            console.error('[Admin] Erro ao carregar fundamentos:', err);
            return;
        }

        // Populate selects
        [selFundamental, newFundamental, editFundamental].forEach(sel => {
            sel.innerHTML = fundamentals.map(f =>
                `<option value="${f.id}">${f.title}</option>`
            ).join('');
        });

        // Select first by default
        if (fundamentals.length > 0) {
            currentFundId = fundamentals[0].id;
            selFundamental.value = currentFundId;
            await loadDrills();
        }
    }

    selFundamental.addEventListener('change', async () => {
        currentFundId = selFundamental.value;
        closeAllForms();
        await loadDrills();
    });

    // ── Drills ────────────────────────────────────────────────────
    async function loadDrills() {
        drillList.innerHTML = '<p style="color:var(--text-muted);padding:16px 0;font-size:.9rem">Carregando...</p>';
        try {
            drills = await window.FLApi.Drills.getByFundamental(currentFundId);
        } catch (err) {
            drillList.innerHTML = `<p style="color:#ef4444;padding:16px 0;font-size:.9rem">Erro: ${err.message}</p>`;
            return;
        }
        renderDrillList();
    }

    function renderDrillList() {
        if (drills.length === 0) {
            drillList.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-futbol"></i>
                    Nenhum drill cadastrado para este fundamental.
                </div>`;
            return;
        }

        drillList.innerHTML = drills.map((d, i) => `
            <div class="drill-item" id="drill-item-${d.id}">
                <div class="drill-item-info">
                    <div class="drill-item-title">#${i + 1} — ${esc(d.title)}</div>
                    <div class="drill-item-desc">${esc(d.description || '')}</div>
                </div>
                <div class="drill-item-actions">
                    <button class="btn btn-secondary btn-sm" data-action="edit" data-id="${d.id}">
                        <i class="fa-solid fa-pen"></i> Editar
                    </button>
                    <button class="btn btn-danger btn-sm" data-action="delete" data-id="${d.id}">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    drillList.addEventListener('click', async (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const action = btn.dataset.action;
        const id     = btn.dataset.id;
        if (action === 'edit')   openEditForm(id);
        if (action === 'delete') deleteDrill(id);
    });

    // ── New Drill Form ────────────────────────────────────────────
    btnNewDrill.addEventListener('click', () => {
        closeAllForms();
        newFundamental.value = currentFundId;
        newTitle.value = '';
        newDesc.value  = '';
        newSetup.value = '';
        newAnim.value  = '';
        formNew.classList.remove('hidden');
        newTitle.focus();
    });

    btnCancelNew.addEventListener('click', () => formNew.classList.add('hidden'));

    btnSaveNew.addEventListener('click', async () => {
        const title = newTitle.value.trim();
        if (!title) { toast('Título é obrigatório.', 'error'); newTitle.focus(); return; }

        let setup, anim;
        try {
            setup = newSetup.value.trim() ? JSON.parse(newSetup.value) : {};
            anim  = newAnim.value.trim()  ? JSON.parse(newAnim.value)  : [];
        } catch {
            toast('JSON inválido em Setup ou Animação.', 'error');
            return;
        }

        btnSaveNew.disabled = true;
        btnSaveNew.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';
        try {
            await window.FLApi.Drills.create({
                fundamental_id: newFundamental.value,
                title,
                description: newDesc.value.trim(),
                setup,
                anim,
            });
            toast('Drill criado!');
            formNew.classList.add('hidden');
            currentFundId = newFundamental.value;
            selFundamental.value = currentFundId;
            await loadDrills();
        } catch (err) {
            toast(err.message || 'Erro ao salvar.', 'error');
        } finally {
            btnSaveNew.disabled = false;
            btnSaveNew.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Salvar Drill';
        }
    });

    // ── Edit Form ─────────────────────────────────────────────────
    function openEditForm(id) {
        const drill = drills.find(d => d.id === id);
        if (!drill) return;
        editingId = id;
        editFormTitle.textContent = `Editando: ${drill.title}`;
        editTitle.value       = drill.title;
        editFundamental.value = drill.fundamental_id;
        editDesc.value        = drill.description || '';
        editSetup.value       = JSON.stringify(drill.setup, null, 2);
        editAnim.value        = JSON.stringify(drill.anim, null, 2);
        formNew.classList.add('hidden');
        formEdit.classList.remove('hidden');
        editTitle.focus();

        // Scroll to form
        formEdit.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    btnCancelEdit.addEventListener('click', () => {
        formEdit.classList.add('hidden');
        editingId = null;
    });

    btnSaveEdit.addEventListener('click', async () => {
        const title = editTitle.value.trim();
        if (!title) { toast('Título é obrigatório.', 'error'); editTitle.focus(); return; }

        let setup, anim;
        try {
            setup = editSetup.value.trim() ? JSON.parse(editSetup.value) : {};
            anim  = editAnim.value.trim()  ? JSON.parse(editAnim.value)  : [];
        } catch {
            toast('JSON inválido em Setup ou Animação.', 'error');
            return;
        }

        btnSaveEdit.disabled = true;
        btnSaveEdit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';
        try {
            await window.FLApi.Drills.update(editingId, {
                fundamental_id: editFundamental.value,
                title,
                description: editDesc.value.trim(),
                setup,
                anim,
            });
            toast('Drill atualizado!');
            formEdit.classList.add('hidden');
            editingId = null;
            currentFundId = editFundamental.value;
            selFundamental.value = currentFundId;
            await loadDrills();
        } catch (err) {
            toast(err.message || 'Erro ao atualizar.', 'error');
        } finally {
            btnSaveEdit.disabled = false;
            btnSaveEdit.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Salvar';
        }
    });

    // ── Delete ────────────────────────────────────────────────────
    async function deleteDrill(id) {
        const drill = drills.find(d => d.id === id);
        if (!drill) return;
        if (!confirm(`Excluir "${drill.title}"? Esta ação não pode ser desfeita.`)) return;
        try {
            await window.FLApi.Drills.delete(id);
            toast('Drill excluído.');
            await loadDrills();
        } catch (err) {
            toast(err.message || 'Erro ao excluir.', 'error');
        }
    }

    // ── Guide Modal ───────────────────────────────────────────────
    function openGuide() {
        guideModal.classList.remove('hidden');
    }

    document.getElementById('btn-guide-new').addEventListener('click', openGuide);
    document.getElementById('btn-guide-edit').addEventListener('click', openGuide);
    btnCloseGuide.addEventListener('click', () => guideModal.classList.add('hidden'));
    guideModal.addEventListener('click', (e) => {
        if (e.target === guideModal) guideModal.classList.add('hidden');
    });

    // ── Helpers ───────────────────────────────────────────────────
    function closeAllForms() {
        formNew.classList.add('hidden');
        formEdit.classList.add('hidden');
        editingId = null;
    }

    function esc(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // ── Boot ──────────────────────────────────────────────────────
    init();

})();
