/**
 * FL Training System — Admin Panel Logic
 * v2: pre-fill examples + Visual Builder (8-frame drag-and-drop)
 */
(function () {
    'use strict';

    // ── Constants ─────────────────────────────────────────────────
    const PITCH_W = 180, PITCH_H = 360;   // builder pitch dimensions (px)
    const FRAME_COUNT = 8;
    const ACTOR_COLORS = { p1:'#ef4444', p2:'#3b82f6', p3:'#10b981', p4:'#f59e0b' };

    const EXAMPLE_SETUP = {
        players: { p1:{x:5,y:15}, p2:{x:2,y:10}, p3:{x:8,y:10}, p4:{x:5,y:5} },
        ball: { x:0.5, y:0 },
        cones: [ {x:3,y:8}, {x:7,y:8}, {x:3,y:14}, {x:7,y:14} ]
    };
    const EXAMPLE_ANIM = [
        {actor:'ball', to:{x:5,y:15}, dur:1000},
        {delay:400},
        {actor:'ball', to:{x:2,y:10}, dur:800, sync:true},
        {actor:'p1',   to:{x:2,y:10}, dur:1200},
        {delay:300},
        {actor:'ball', to:{x:5,y:0},  dur:800}
    ];

    // ── Admin state ───────────────────────────────────────────────
    let fundamentals  = [];
    let currentFundId = null;
    let drills        = [];
    let editingId     = null;

    // ── Builder state ─────────────────────────────────────────────
    let builderFrames = [];
    let builderFrame  = 0;
    let builderTarget = null;   // 'new' | 'edit'
    let dragging      = null;   // { key: string, startPx, startPy }

    function defaultFrame() {
        return {
            p1: {x:5,y:15}, p2: {x:2,y:10}, p3: {x:8,y:10}, p4: {x:5,y:5},
            ball: {x:0.5,y:0},
            cones: [{x:3,y:8},{x:7,y:8},{x:3,y:14},{x:7,y:14}]
        };
    }

    function resetBuilderFrames() {
        builderFrames = Array.from({length: FRAME_COUNT}, defaultFrame);
        builderFrame  = 0;
    }

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

    const formNew         = document.getElementById('drill-form-panel');
    const newTitle        = document.getElementById('new-title');
    const newFundamental  = document.getElementById('new-fundamental');
    const newDesc         = document.getElementById('new-desc');
    const newSetup        = document.getElementById('new-setup');
    const newAnim         = document.getElementById('new-anim');
    const btnSaveNew      = document.getElementById('btn-save-new');
    const btnCancelNew    = document.getElementById('btn-cancel-new');

    const formEdit        = document.getElementById('inline-edit-form');
    const editFormTitle   = document.getElementById('edit-form-title');
    const editTitle       = document.getElementById('edit-title');
    const editFundamental = document.getElementById('edit-fundamental');
    const editDesc        = document.getElementById('edit-desc');
    const editSetup       = document.getElementById('edit-setup');
    const editAnim        = document.getElementById('edit-anim');
    const btnSaveEdit     = document.getElementById('btn-save-edit');
    const btnCancelEdit   = document.getElementById('btn-cancel-edit');

    const guideModal      = document.getElementById('guide-modal');
    const btnCloseGuide   = document.getElementById('btn-close-guide');

    const visualBuilder   = document.getElementById('visual-builder');
    const vbPitch         = document.getElementById('vb-pitch');
    const vbFrameTabs     = document.getElementById('vb-frame-tabs');
    const vbFrameLabel    = document.getElementById('vb-frame-label');

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
        if (user) showAdmin(); else showLogin();
        window.FLAuth.onAuthStateChange((event, session) => {
            if (session) showAdmin(); else showLogin();
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

    loginPassword.addEventListener('keydown', (e) => { if (e.key === 'Enter') btnLogin.click(); });
    btnLogout.addEventListener('click', () => window.FLAuth.logout());

    // ── Fundamentals ─────────────────────────────────────────────
    async function loadFundamentals() {
        try { fundamentals = await window.FLApi.Fundamentals.getAll(); }
        catch (err) { console.error('[Admin] Erro ao carregar fundamentos:', err); return; }

        [selFundamental, newFundamental, editFundamental].forEach(sel => {
            sel.innerHTML = fundamentals.map(f =>
                `<option value="${f.id}">${f.title}</option>`
            ).join('');
        });

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
        try { drills = await window.FLApi.Drills.getByFundamental(currentFundId); }
        catch (err) {
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
                    <div class="drill-item-title">#${i+1} — ${esc(d.title)}</div>
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
        if (btn.dataset.action === 'edit')   openEditForm(btn.dataset.id);
        if (btn.dataset.action === 'delete') deleteDrill(btn.dataset.id);
    });

    // ── New Drill Form ────────────────────────────────────────────
    btnNewDrill.addEventListener('click', () => {
        closeAllForms();
        newFundamental.value = currentFundId;
        newTitle.value = '';
        newDesc.value  = '';
        newSetup.value = JSON.stringify(EXAMPLE_SETUP, null, 2);
        newAnim.value  = JSON.stringify(EXAMPLE_ANIM,  null, 2);
        formNew.classList.remove('hidden');
        newTitle.focus();
    });

    btnCancelNew.addEventListener('click', () => {
        formNew.classList.add('hidden');
        closeBuilder();
    });

    btnSaveNew.addEventListener('click', async () => {
        const title = newTitle.value.trim();
        if (!title) { toast('Título é obrigatório.', 'error'); newTitle.focus(); return; }
        let setup, anim;
        try {
            setup = newSetup.value.trim() ? JSON.parse(newSetup.value) : {};
            anim  = newAnim.value.trim()  ? JSON.parse(newAnim.value)  : [];
        } catch { toast('JSON inválido em Setup ou Animação.', 'error'); return; }

        btnSaveNew.disabled = true;
        btnSaveNew.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';
        try {
            await window.FLApi.Drills.create({
                fundamental_id: newFundamental.value, title,
                description: newDesc.value.trim(), setup, anim,
            });
            toast('Drill criado!');
            formNew.classList.add('hidden');
            closeBuilder();
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
        editAnim.value        = JSON.stringify(drill.anim,  null, 2);
        formNew.classList.add('hidden');
        closeBuilder();
        formEdit.classList.remove('hidden');
        editTitle.focus();
        formEdit.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    btnCancelEdit.addEventListener('click', () => {
        formEdit.classList.add('hidden');
        closeBuilder();
        editingId = null;
    });

    btnSaveEdit.addEventListener('click', async () => {
        const title = editTitle.value.trim();
        if (!title) { toast('Título é obrigatório.', 'error'); editTitle.focus(); return; }
        let setup, anim;
        try {
            setup = editSetup.value.trim() ? JSON.parse(editSetup.value) : {};
            anim  = editAnim.value.trim()  ? JSON.parse(editAnim.value)  : [];
        } catch { toast('JSON inválido em Setup ou Animação.', 'error'); return; }

        btnSaveEdit.disabled = true;
        btnSaveEdit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';
        try {
            await window.FLApi.Drills.update(editingId, {
                fundamental_id: editFundamental.value, title,
                description: editDesc.value.trim(), setup, anim,
            });
            toast('Drill atualizado!');
            formEdit.classList.add('hidden');
            closeBuilder();
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
    function openGuide() { guideModal.classList.remove('hidden'); }
    document.getElementById('btn-guide-new').addEventListener('click', openGuide);
    document.getElementById('btn-guide-edit').addEventListener('click', openGuide);
    btnCloseGuide.addEventListener('click', () => guideModal.classList.add('hidden'));
    guideModal.addEventListener('click', (e) => { if (e.target === guideModal) guideModal.classList.add('hidden'); });

    // ══════════════════════════════════════════════════════════════
    // VISUAL BUILDER
    // ══════════════════════════════════════════════════════════════

    // ── Coordinate conversion ─────────────────────────────────────
    function fieldToPixel(x, y) {
        return { px: x / 10 * PITCH_W, py: y / 20 * PITCH_H };
    }

    function pixelToField(px, py) {
        const x = Math.max(0, Math.min(10, Math.round(px / PITCH_W * 10 * 4) / 4));
        const y = Math.max(0, Math.min(20, Math.round(py / PITCH_H * 20 * 4) / 4));
        return { x, y };
    }

    // ── Open / Close builder ──────────────────────────────────────
    function openBuilder(target) {
        builderTarget = target;
        resetBuilderFrames();
        renderBuilderTabs();
        renderBuilderPitch();
        visualBuilder.classList.remove('hidden');
        visualBuilder.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function closeBuilder() {
        visualBuilder.classList.add('hidden');
        builderTarget = null;
    }

    document.getElementById('btn-close-builder').addEventListener('click', closeBuilder);

    document.getElementById('btn-builder-new').addEventListener('click', () => openBuilder('new'));
    document.getElementById('btn-builder-edit').addEventListener('click', () => openBuilder('edit'));

    // ── Frame tabs ────────────────────────────────────────────────
    function renderBuilderTabs() {
        vbFrameTabs.innerHTML = Array.from({length: FRAME_COUNT}, (_, i) => `
            <button class="vb-frame-tab${i === builderFrame ? ' active' : ''}" data-frame="${i}">
                ${i + 1}
            </button>
        `).join('');
        vbFrameTabs.querySelectorAll('.vb-frame-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                builderFrame = parseInt(btn.dataset.frame);
                renderBuilderTabs();
                renderBuilderPitch();
            });
        });
        vbFrameLabel.textContent = builderFrame === 0
            ? 'Momento 1 — Posição Inicial (Setup)'
            : `Momento ${builderFrame + 1} — Movimento ${builderFrame}`;
    }

    document.getElementById('vb-prev').addEventListener('click', () => {
        if (builderFrame > 0) { builderFrame--; renderBuilderTabs(); renderBuilderPitch(); }
    });
    document.getElementById('vb-next').addEventListener('click', () => {
        if (builderFrame < FRAME_COUNT - 1) { builderFrame++; renderBuilderTabs(); renderBuilderPitch(); }
    });

    // ── Render pitch actors ───────────────────────────────────────
    function renderBuilderPitch() {
        vbPitch.innerHTML = `
            <div class="vb-goal"></div>
            <div class="vb-centerline"></div>
        `;

        const frame = builderFrames[builderFrame];

        // Cones — read from current frame, draggable everywhere
        frame.cones.forEach((c, idx) => {
            const {px, py} = fieldToPixel(c.x, c.y);
            const el = document.createElement('div');
            el.className = 'vb-actor cone';
            el.dataset.key = `cone${idx}`;
            el.style.left = px + 'px';
            el.style.top  = py + 'px';
            vbPitch.appendChild(el);
        });

        // Players
        ['p1','p2','p3','p4'].forEach(key => {
            const pos = frame[key];
            const {px, py} = fieldToPixel(pos.x, pos.y);
            const el = document.createElement('div');
            el.className = 'vb-actor';
            el.dataset.key = key;
            el.style.background = ACTOR_COLORS[key];
            el.style.left = px + 'px';
            el.style.top  = py + 'px';
            el.textContent = key[1]; // '1' '2' '3' '4'
            vbPitch.appendChild(el);
        });

        // Ball
        const ball = frame.ball;
        const {px: bx, py: by} = fieldToPixel(ball.x, ball.y);
        const ballEl = document.createElement('div');
        ballEl.className = 'vb-actor ball';
        ballEl.dataset.key = 'ball';
        ballEl.style.left = bx + 'px';
        ballEl.style.top  = by + 'px';
        vbPitch.appendChild(ballEl);

        // Bind drag — all actors including cones
        vbPitch.querySelectorAll('.vb-actor').forEach(el => {
            el.addEventListener('pointerdown', onActorPointerDown);
        });
    }

    // ── Drag logic ────────────────────────────────────────────────

    // After dragging actor on frame N, propagate new position to frames N+1, N+2...
    // as long as those frames still have the OLD position (weren't manually changed).
    function propagateForward(fromFrame, key, oldPos, newPos) {
        for (let i = fromFrame + 1; i < FRAME_COUNT; i++) {
            const f = builderFrames[i];
            const pos = key === 'ball' ? f.ball : f[key];
            if (pos.x === oldPos.x && pos.y === oldPos.y) {
                if (key === 'ball') f.ball = { ...newPos };
                else f[key] = { ...newPos };
            } else {
                break; // frame was manually changed — stop propagating
            }
        }
    }

    function onActorPointerDown(e) {
        e.preventDefault();
        const key = e.currentTarget.dataset.key;
        // Capture position before drag for forward propagation
        const frame = builderFrames[builderFrame];
        let initPos;
        if (key.startsWith('cone')) {
            const idx = parseInt(key.replace('cone', ''));
            initPos = { ...builderFrames[builderFrame].cones[idx] };
        } else if (key === 'ball') {
            initPos = { ...frame.ball };
        } else {
            initPos = { ...frame[key] };
        }
        dragging = { key, el: e.currentTarget, initPos };
        e.currentTarget.setPointerCapture(e.pointerId);
        e.currentTarget.addEventListener('pointermove', onActorPointerMove);
        e.currentTarget.addEventListener('pointerup',   onActorPointerUp);
    }

    function onActorPointerMove(e) {
        if (!dragging) return;
        const rect = vbPitch.getBoundingClientRect();
        const px = e.clientX - rect.left;
        const py = e.clientY - rect.top;
        // Visual update (pixel, clamped)
        const clampedPx = Math.max(0, Math.min(PITCH_W, px));
        const clampedPy = Math.max(0, Math.min(PITCH_H, py));
        dragging.el.style.left = clampedPx + 'px';
        dragging.el.style.top  = clampedPy + 'px';
    }

    function onActorPointerUp(e) {
        if (!dragging) return;
        const rect = vbPitch.getBoundingClientRect();
        const px = Math.max(0, Math.min(PITCH_W, e.clientX - rect.left));
        const py = Math.max(0, Math.min(PITCH_H, e.clientY - rect.top));
        const {x, y} = pixelToField(px, py);

        const frame = builderFrames[builderFrame];
        const key = dragging.key;
        const initPos = dragging.initPos;

        if (key.startsWith('cone')) {
            const idx = parseInt(key.replace('cone', ''));
            builderFrames[builderFrame].cones[idx] = {x, y};
            // Propagate forward while following frames still have the old cone position
            for (let i = builderFrame + 1; i < FRAME_COUNT; i++) {
                const c = builderFrames[i].cones[idx];
                if (c.x === initPos.x && c.y === initPos.y) {
                    builderFrames[i].cones[idx] = {x, y};
                } else { break; }
            }
        } else if (key === 'ball') {
            frame.ball = {x, y};
            propagateForward(builderFrame, 'ball', initPos, {x, y});
        } else {
            frame[key] = {x, y};
            propagateForward(builderFrame, key, initPos, {x, y});
        }

        dragging.el.removeEventListener('pointermove', onActorPointerMove);
        dragging.el.removeEventListener('pointerup',   onActorPointerUp);
        dragging = null;
        renderBuilderPitch();
    }

    // ── Generate JSON from frames ─────────────────────────────────
    function framesToJSON() {
        const f0 = builderFrames[0];
        const setup = {
            players: { p1:{...f0.p1}, p2:{...f0.p2}, p3:{...f0.p3}, p4:{...f0.p4} },
            ball: {...f0.ball},
            cones: f0.cones.map(c => ({...c}))
        };

        const anim = [];
        for (let i = 1; i < FRAME_COUNT; i++) {
            const prev = builderFrames[i - 1];
            const curr = builderFrames[i];
            const moves = [];

            ['p1','p2','p3','p4','ball'].forEach(key => {
                const p = key === 'ball' ? prev.ball : prev[key];
                const c = key === 'ball' ? curr.ball : curr[key];
                if (p.x !== c.x || p.y !== c.y) {
                    moves.push({ actor: key, to: {x: c.x, y: c.y}, dur: 1000 });
                }
            });

            if (moves.length > 0) {
                // Mark all but last as sync:true (parallel movement)
                for (let m = 0; m < moves.length - 1; m++) moves[m].sync = true;
                anim.push(...moves);
                anim.push({ delay: 400 });
            }
        }

        return { setup, anim };
    }

    document.getElementById('btn-apply-builder').addEventListener('click', () => {
        const { setup, anim } = framesToJSON();
        const setupStr = JSON.stringify(setup, null, 2);
        const animStr  = JSON.stringify(anim,  null, 2);

        if (builderTarget === 'new') {
            newSetup.value = setupStr;
            newAnim.value  = animStr;
            formNew.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (builderTarget === 'edit') {
            editSetup.value = setupStr;
            editAnim.value  = animStr;
            formEdit.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        toast('JSON aplicado! Revise e salve o drill.');
    });

    // ── Helpers ───────────────────────────────────────────────────
    function closeAllForms() {
        formNew.classList.add('hidden');
        formEdit.classList.add('hidden');
        closeBuilder();
        editingId = null;
    }

    function esc(str) {
        return String(str)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // ── Boot ──────────────────────────────────────────────────────
    init();

})();
