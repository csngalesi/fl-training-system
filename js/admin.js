/**
 * FL Training System — Admin Panel Logic
 * v2: pre-fill examples + Visual Builder (15-frame drag-and-drop)
 */
(function () {
    'use strict';

    // ── Constants ─────────────────────────────────────────────────
    const PITCH_W = 180, PITCH_H = 360;   // builder pitch dimensions (px)
    const FRAME_COUNT = 20;
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

    // ── Templates state ───────────────────────────────────────────
    let templates         = [];
    let editingTemplateId = null;

    // ── Builder state ─────────────────────────────────────────────
    let builderFrames = [];
    let builderFrame  = 0;
    let builderTarget = null;   // 'new' | 'edit' | 'template'
    let dragging      = null;   // { key: string, startPx, startPy }

    function defaultFrame() {
        return {
            p1: {x:5,y:15,rot:0,foot:null}, p2: {x:2,y:10,rot:0,foot:null},
            p3: {x:8,y:10,rot:0,foot:null}, p4: {x:5,y:5, rot:0,foot:null},
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
    const newDuration     = document.getElementById('new-duration');
    const newSetup        = document.getElementById('new-setup');
    const newAnim         = document.getElementById('new-anim');
    const btnSaveNew      = document.getElementById('btn-save-new');
    const btnCancelNew    = document.getElementById('btn-cancel-new');

    const formEdit        = document.getElementById('inline-edit-form');
    const editFormTitle   = document.getElementById('edit-form-title');
    const editTitle       = document.getElementById('edit-title');
    const editFundamental = document.getElementById('edit-fundamental');
    const editDesc        = document.getElementById('edit-desc');
    const editDuration    = document.getElementById('edit-duration');
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
        await loadTemplates();
        await loadWeekPlans();
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
        buildWeekFundPills();
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
                    <div class="drill-item-title">#${i+1} — ${esc(d.title)}${d.duration ? ` <span style="font-size:.75rem;color:var(--text-muted);font-weight:400;margin-left:6px"><i class="fa-regular fa-clock"></i> ${esc(d.duration)}</span>` : ''}</div>
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
        newTitle.value    = '';
        newDesc.value     = '';
        newDuration.value = '';
        newSetup.value = JSON.stringify(EXAMPLE_SETUP, null, 2);
        newAnim.value  = JSON.stringify(EXAMPLE_ANIM,  null, 2);
        drillList.classList.add('hidden');
        formNew.classList.remove('hidden');
        newTitle.focus();
    });

    btnCancelNew.addEventListener('click', () => {
        formNew.classList.add('hidden');
        drillList.classList.remove('hidden');
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
                description: newDesc.value.trim(),
                duration: newDuration.value.trim(),
                setup, anim,
            });
            toast('Drill criado!');
            formNew.classList.add('hidden');
            drillList.classList.remove('hidden');
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
        editDuration.value    = drill.duration || '';
        editSetup.value       = JSON.stringify(drill.setup, null, 2);
        editAnim.value        = JSON.stringify(drill.anim,  null, 2);
        formNew.classList.add('hidden');
        closeBuilder();
        drillList.classList.add('hidden');
        formEdit.classList.remove('hidden');
        editTitle.focus();
        formEdit.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    btnCancelEdit.addEventListener('click', () => {
        formEdit.classList.add('hidden');
        drillList.classList.remove('hidden');
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
                description: editDesc.value.trim(),
                duration: editDuration.value.trim(),
                setup, anim,
            });
            toast('Drill atualizado!');
            formEdit.classList.add('hidden');
            drillList.classList.remove('hidden');
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
    const btnApplyBuilder   = document.getElementById('btn-apply-builder');
    const btnApplyTemplate  = document.getElementById('btn-apply-template');

    function openBuilder(target, frames = null) {
        builderTarget = target;
        if (frames) {
            builderFrames = frames.map(f => JSON.parse(JSON.stringify(f)));
        } else {
            resetBuilderFrames();
        }
        // Toggle footer buttons
        const isTemplate = target === 'template';
        btnApplyBuilder.classList.toggle('hidden', isTemplate);
        btnApplyTemplate.classList.toggle('hidden', !isTemplate);

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

    // ── Template loader ───────────────────────────────────────────
    const btnLoadTemplate = document.getElementById('btn-load-template');
    const templateMenu    = document.getElementById('vb-template-menu');

    function buildTemplateMenu() {
        templateMenu.innerHTML = '';
        // Use Supabase templates; fall back to hardcoded if none loaded yet
        const tplSource = templates.length ? templates : (window.FL_TEMPLATES || []);
        tplSource.forEach(tpl => {
            const item = document.createElement('div');
            item.className = 'vb-template-item';
            item.innerHTML = `<div class="vb-template-item-title">${tpl.title}</div>
                <div class="vb-template-item-desc">${tpl.description}</div>`;
            item.addEventListener('click', () => {
                builderFrames = tpl.frames.map(f => JSON.parse(JSON.stringify(f)));
                builderFrame  = 0;
                renderBuilderTabs();
                renderBuilderPitch();
                templateMenu.classList.add('hidden');
                toast(`Template carregado: ${tpl.title}`);
            });
            templateMenu.appendChild(item);
        });
    }

    btnLoadTemplate.addEventListener('click', (e) => {
        e.stopPropagation();
        if (templateMenu.classList.contains('hidden')) {
            buildTemplateMenu();
            templateMenu.classList.remove('hidden');
        } else {
            templateMenu.classList.add('hidden');
        }
    });

    document.addEventListener('click', () => templateMenu.classList.add('hidden'));

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

    // ── SVG player silhouette (top-down view) ─────────────────────
    function playerSVG(num, color, foot = null) {
        const lFill = foot === 'L' ? 'white' : color;
        const rFill = foot === 'R' ? 'white' : color;
        const lOp   = foot === 'L' ? '1'     : '0.88';
        const rOp   = foot === 'R' ? '1'     : '0.88';
        return `<svg viewBox="0 0 42 36" width="40" height="34" style="display:block;filter:drop-shadow(0 1px 3px rgba(0,0,0,.6));">
            <ellipse cx="21" cy="13" rx="13" ry="8" fill="${color}"/>
            <ellipse cx="21" cy="13" rx="13" ry="8" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="1"/>
            <ellipse cx="11" cy="30" rx="4" ry="6" fill="${lFill}" opacity="${lOp}"/>
            <ellipse cx="31" cy="30" rx="4" ry="6" fill="${rFill}" opacity="${rOp}"/>
            <text x="21" y="14" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="9" font-weight="900" font-family="'Outfit',sans-serif">${num}</text>
        </svg>`;
    }

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
            const rot  = pos.rot  || 0;
            const foot = pos.foot || null;
            const el = document.createElement('div');
            el.className = 'vb-actor';
            el.dataset.key = key;
            el.style.left = px + 'px';
            el.style.top  = py + 'px';
            el.style.transform = `translate(-50%, -50%) rotate(${rot}deg)`;
            el.innerHTML = playerSVG(key[1], ACTOR_COLORS[key], foot);

            // Rotate handle
            const handle = document.createElement('div');
            handle.className = 'vb-rotate-handle';
            handle.title = 'Girar (arraste)';
            handle.addEventListener('pointerdown', onRotateHandlePointerDown);
            el.appendChild(handle);

            // Double-click → cycle foot: null → L → R → null
            el.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                const cur = builderFrames[builderFrame][key].foot;
                builderFrames[builderFrame][key].foot = cur === null ? 'L' : cur === 'L' ? 'R' : null;
                renderBuilderPitch();
            });

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
                if (key === 'ball') f.ball = { ...f.ball, x: newPos.x, y: newPos.y };
                else f[key] = { ...f[key], x: newPos.x, y: newPos.y };
            } else {
                break;
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
            frame.ball = { ...frame.ball, x, y };
            propagateForward(builderFrame, 'ball', initPos, {x, y});
        } else {
            frame[key] = { ...frame[key], x, y };
            propagateForward(builderFrame, key, initPos, {x, y});
        }

        dragging.el.removeEventListener('pointermove', onActorPointerMove);
        dragging.el.removeEventListener('pointerup',   onActorPointerUp);
        dragging = null;
        renderBuilderPitch();
    }

    // ── Rotate handle ─────────────────────────────────────────────
    function propagateRotForward(fromFrame, key, oldRot, newRot) {
        for (let i = fromFrame + 1; i < FRAME_COUNT; i++) {
            if ((builderFrames[i][key].rot || 0) === oldRot) {
                builderFrames[i][key].rot = newRot;
            } else { break; }
        }
    }

    function onRotateHandlePointerDown(e) {
        e.stopPropagation();
        e.preventDefault();
        const actorEl = e.currentTarget.parentElement;
        const key     = actorEl.dataset.key;
        const rect    = actorEl.getBoundingClientRect();
        const cx = rect.left + rect.width  / 2;
        const cy = rect.top  + rect.height / 2;
        const initRot = builderFrames[builderFrame][key].rot || 0;

        e.currentTarget.setPointerCapture(e.pointerId);

        function onMove(ev) {
            const angle = Math.round(Math.atan2(ev.clientX - cx, -(ev.clientY - cy)) * 180 / Math.PI);
            builderFrames[builderFrame][key].rot = angle;
            actorEl.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
        }
        function onUp() {
            const newRot = builderFrames[builderFrame][key].rot || 0;
            propagateRotForward(builderFrame, key, initRot, newRot);
            e.currentTarget.removeEventListener('pointermove', onMove);
            e.currentTarget.removeEventListener('pointerup',   onUp);
        }
        e.currentTarget.addEventListener('pointermove', onMove);
        e.currentTarget.addEventListener('pointerup',   onUp);
    }

    // ── Generate JSON from frames ─────────────────────────────────
    function framesToJSON() {
        const f0 = builderFrames[0];
        const pickPlayer = (p) => ({ x:p.x, y:p.y, rot: p.rot||0, foot: p.foot||null });
        const setup = {
            players: { p1:pickPlayer(f0.p1), p2:pickPlayer(f0.p2), p3:pickPlayer(f0.p3), p4:pickPlayer(f0.p4) },
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
                const posChanged  = p.x !== c.x || p.y !== c.y;
                const rotChanged  = key !== 'ball' && (p.rot || 0) !== (c.rot || 0);
                const footChanged = key !== 'ball' && p.foot !== c.foot;
                if (posChanged || rotChanged || footChanged) {
                    const step = { actor: key, dur: 1000 };
                    if (posChanged)  step.to   = {x: c.x, y: c.y};
                    if (rotChanged)  step.rot  = c.rot  || 0;
                    if (footChanged) step.foot = c.foot || null;
                    moves.push(step);
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

    // ── Templates admin ───────────────────────────────────────────
    const tplFormPanel  = document.getElementById('template-form-panel');
    const tplFormTitle  = document.getElementById('template-form-title');
    const tplTitleInput = document.getElementById('tpl-title');
    const tplDescInput  = document.getElementById('tpl-desc');
    const tplList       = document.getElementById('template-list');

    async function loadTemplates() {
        try { templates = await window.FLApi.Templates.getAll(); }
        catch (err) { console.error('[Admin] Erro ao carregar templates:', err); }
        renderTemplateList();
    }

    function renderTemplateList() {
        if (!templates.length) {
            tplList.innerHTML = '<p style="color:var(--text-muted);font-size:.85rem">Nenhum template cadastrado.</p>';
            return;
        }
        tplList.innerHTML = templates.map(t => `
            <div class="drill-item" style="margin-bottom:10px">
                <div class="drill-header">
                    <span style="font-weight:600;font-size:.9rem">${esc(t.title)}</span>
                    <div style="display:flex;gap:8px">
                        <button class="btn btn-secondary btn-sm" onclick="window._editTemplate('${t.id}')">
                            <i class="fa-solid fa-pencil"></i>
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="window._duplicateTemplate('${t.id}')" title="Duplicar">
                            <i class="fa-solid fa-copy"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="window._deleteTemplate('${t.id}')">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
                ${t.description ? `<p style="font-size:.8rem;color:var(--text-muted);margin:4px 0 0">${esc(t.description)}</p>` : ''}
            </div>`).join('');
    }

    function openTemplateForm(mode, tpl = null) {
        editingTemplateId = tpl ? tpl.id : null;
        tplFormTitle.textContent = tpl ? 'Editar Template' : 'Novo Template';
        tplTitleInput.value = tpl ? tpl.title : '';
        tplDescInput.value  = tpl ? tpl.description : '';
        // Pre-load frames into builder state so the builder opens with them
        if (tpl && tpl.frames) {
            builderFrames = tpl.frames.map(f => JSON.parse(JSON.stringify(f)));
        } else {
            resetBuilderFrames();
        }
        tplList.classList.add('hidden');
        tplFormPanel.classList.remove('hidden');
        tplFormPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    document.getElementById('btn-new-template').addEventListener('click', () => {
        openTemplateForm('new');
    });

    document.getElementById('btn-builder-template').addEventListener('click', () => {
        openBuilder('template', builderFrames);
    });

    document.getElementById('btn-cancel-template').addEventListener('click', () => {
        tplFormPanel.classList.add('hidden');
        tplList.classList.remove('hidden');
        editingTemplateId = null;
        closeBuilder();
    });

    document.getElementById('btn-save-template').addEventListener('click', async () => {
        const title = tplTitleInput.value.trim();
        if (!title) { toast('Preencha o título do template.', 'error'); return; }
        const payload = { title, description: tplDescInput.value.trim(), frames: builderFrames };
        try {
            if (editingTemplateId) {
                await window.FLApi.Templates.update(editingTemplateId, payload);
                toast('Template atualizado!');
            } else {
                await window.FLApi.Templates.create(payload);
                toast('Template criado!');
            }
            tplFormPanel.classList.add('hidden');
            tplList.classList.remove('hidden');
            editingTemplateId = null;
            closeBuilder();
            await loadTemplates();
        } catch (err) {
            toast('Erro ao salvar template: ' + err.message, 'error');
        }
    });

    // "Salvar Template" button inside the Visual Builder legend
    btnApplyTemplate.addEventListener('click', async () => {
        const title = tplTitleInput.value.trim();
        if (!title) {
            toast('Preencha o título antes de salvar.', 'error');
            tplFormPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }
        const payload = { title, description: tplDescInput.value.trim(), frames: builderFrames };
        try {
            if (editingTemplateId) {
                await window.FLApi.Templates.update(editingTemplateId, payload);
                toast('Template atualizado!');
            } else {
                await window.FLApi.Templates.create(payload);
                toast('Template criado!');
            }
            tplFormPanel.classList.add('hidden');
            tplList.classList.remove('hidden');
            editingTemplateId = null;
            closeBuilder();
            await loadTemplates();
        } catch (err) {
            toast('Erro ao salvar template: ' + err.message, 'error');
        }
    });

    window._editTemplate = (id) => {
        const tpl = templates.find(t => t.id === id);
        if (tpl) openTemplateForm('edit', tpl);
    };

    window._duplicateTemplate = async (id) => {
        const tpl = templates.find(t => t.id === id);
        if (!tpl) return;
        try {
            await window.FLApi.Templates.create({
                title: tpl.title + ' (Cópia)',
                description: tpl.description,
                frames: tpl.frames,
            });
            toast('Template duplicado!');
            await loadTemplates();
        } catch (err) { toast('Erro: ' + err.message, 'error'); }
    };

    window._deleteTemplate = async (id) => {
        if (!confirm('Excluir este template?')) return;
        try {
            await window.FLApi.Templates.delete(id);
            toast('Template excluído.');
            await loadTemplates();
        } catch (err) { toast('Erro: ' + err.message, 'error'); }
    };

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

    // ══════════════════════════════════════════════════════════════
    // WEEK PLAN BUILDER
    // ══════════════════════════════════════════════════════════════

    let weekPlans          = [];
    let editingWeekPlanId  = null;   // null = new plan
    let weekSessions       = [];     // sessions currently in editor
    let weekDrillsCache    = {};     // fundamentalId → drills[]
    let weekActiveFundId   = null;

    // ── DOM refs (week) ───────────────────────────────────────────
    const wbPlanList       = document.getElementById('wb-plan-list');
    const wbFundSelect     = document.getElementById('wb-fund-select');
    const wbDrillCards     = document.getElementById('wb-drill-cards');
    const wbDropZone       = document.getElementById('wb-drop-zone');
    const wbSessionList    = document.getElementById('wb-session-list');
    const wbDropHint       = document.getElementById('wb-drop-hint');
    const wbPlanEditor     = document.getElementById('wb-plan-editor');
    const wbPlanSelectHint = document.getElementById('wb-plan-select-hint');
    const wbPlanTitleInput = document.getElementById('wb-plan-title-input');
    const wbChkVisible     = document.getElementById('wb-chk-visible');

    async function loadWeekPlans() {
        try { weekPlans = await window.FLApi.WeekPlans.getAll(); }
        catch (err) { console.error('[Admin] Erro ao carregar planos:', err); }
        renderWeekPlanList();
        // Auto-open the active plan (or the first) when nothing is in edit yet
        if (!editingWeekPlanId && weekPlans.length) {
            const auto = weekPlans.find(p => p.is_active) || weekPlans[0];
            openWeekPlanEditor(auto);
        }
    }

    function renderWeekPlanList() {
        if (!weekPlans.length) {
            wbPlanList.innerHTML = '<p style="color:var(--text-muted);font-size:.8rem">Nenhum plano.</p>';
            return;
        }
        wbPlanList.innerHTML = weekPlans.map(p => `
            <div class="wb-plan-item ${p.id === editingWeekPlanId ? 'active' : ''}"
                 data-plan-id="${p.id}" title="Clique para abrir · Duplo clique para renomear">
                <div class="wb-plan-item-title">${esc(p.title)}</div>
                ${p.is_active ? '<span class="wb-plan-item-active-badge">Ativo</span>' : ''}
                ${p.visible_in_week ? '<span class="wb-plan-visible-badge">Visível</span>' : ''}
                <button class="wb-session-remove" data-action="delete" data-id="${p.id}" title="Excluir">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>`).join('');

        wbPlanList.querySelectorAll('.wb-plan-item').forEach(item => {
            const titleEl = item.querySelector('.wb-plan-item-title');

            item.addEventListener('click', (e) => {
                if (e.target.closest('[data-action="delete"]')) return;
                if (titleEl.contentEditable === 'true') return; // editing inline
                const plan = weekPlans.find(p => p.id === item.dataset.planId);
                if (plan) openWeekPlanEditor(plan);
            });

            // Double-click on title → inline rename
            titleEl.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                const plan = weekPlans.find(p => p.id === item.dataset.planId);
                if (!plan) return;

                titleEl.contentEditable = 'true';
                titleEl.style.cssText += ';border-bottom:1px solid var(--acc-primary);outline:none;cursor:text';
                titleEl.focus();
                const range = document.createRange();
                range.selectNodeContents(titleEl);
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);

                const cancelEdit = () => {
                    titleEl.contentEditable = 'false';
                    titleEl.style.borderBottom = '';
                    titleEl.style.cursor = '';
                    titleEl.textContent = plan.title;
                };

                const saveEdit = async () => {
                    titleEl.contentEditable = 'false';
                    titleEl.style.borderBottom = '';
                    titleEl.style.cursor = '';
                    const newTitle = titleEl.textContent.trim();
                    if (!newTitle || newTitle === plan.title) {
                        titleEl.textContent = plan.title;
                        return;
                    }
                    try {
                        await window.FLApi.WeekPlans.update(plan.id, { title: newTitle, sessions: plan.sessions });
                        if (editingWeekPlanId === plan.id) wbPlanTitleInput.value = newTitle;
                        await loadWeekPlans();
                    } catch (err) {
                        toast('Erro ao renomear: ' + err.message, 'error');
                        await loadWeekPlans();
                    }
                };

                titleEl.addEventListener('blur', saveEdit, { once: true });
                titleEl.addEventListener('keydown', (ke) => {
                    if (ke.key === 'Enter') { ke.preventDefault(); titleEl.removeEventListener('blur', saveEdit); titleEl.blur(); saveEdit(); }
                    if (ke.key === 'Escape') { ke.preventDefault(); titleEl.removeEventListener('blur', saveEdit); cancelEdit(); }
                });
            });

            item.querySelector('[data-action="delete"]').addEventListener('click', (e) => {
                e.stopPropagation();
                window._wbDeletePlan(item.dataset.planId);
            });
        });
    }

    // Update highlight without rebuilding DOM (preserves elements for dblclick)
    function updatePlanListHighlight() {
        wbPlanList.querySelectorAll('.wb-plan-item').forEach(item => {
            item.classList.toggle('active', item.dataset.planId === editingWeekPlanId);
        });
    }

    function openWeekPlanEditor(plan = null) {
        editingWeekPlanId = plan ? plan.id : null;
        weekSessions = plan ? JSON.parse(JSON.stringify(plan.sessions || [])) : [];
        wbPlanTitleInput.value = plan ? plan.title : '';
        wbChkVisible.checked = plan ? !!plan.visible_in_week : false;
        wbPlanEditor.classList.remove('hidden');
        wbPlanSelectHint.classList.add('hidden');
        updatePlanListHighlight(); // don't rebuild DOM — preserves elements for dblclick
        renderWeekSessions();
    }

    function renderWeekSessions() {
        wbDropHint.style.display = weekSessions.length ? 'none' : '';
        wbSessionList.innerHTML = weekSessions.map((s, i) => `
            <div class="wb-session-item" draggable="true" data-session-idx="${i}">
                <span class="wb-session-num">${i + 1}</span>
                <div class="wb-session-info">
                    <div class="wb-session-title">${esc(s.title)}</div>
                    <div class="wb-session-sub">${esc(s.fundamental_title || '')}${s.duration ? ' · ' + esc(s.duration) : ''}</div>
                </div>
                <button class="wb-session-remove" data-remove="${i}" title="Remover">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>`).join('');

        // Remove buttons
        wbSessionList.querySelectorAll('[data-remove]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(btn.dataset.remove);
                weekSessions.splice(idx, 1);
                renderWeekSessions();
            });
        });

        // Drag-to-reorder within session list
        let dragSrcIdx = null;
        wbSessionList.querySelectorAll('.wb-session-item').forEach(item => {
            item.addEventListener('dragstart', (e) => {
                dragSrcIdx = parseInt(item.dataset.sessionIdx);
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('session-reorder', dragSrcIdx);
                setTimeout(() => item.classList.add('dragging'), 0);
            });
            item.addEventListener('dragend', () => item.classList.remove('dragging'));
            item.addEventListener('dragover', (e) => { e.preventDefault(); });
            item.addEventListener('drop', (e) => {
                // If it's a drill card drop, let it bubble to the drop zone
                if (e.dataTransfer.types.includes('drill')) return;
                e.preventDefault();
                e.stopPropagation();
                const targetIdx = parseInt(item.dataset.sessionIdx);
                if (dragSrcIdx !== null && dragSrcIdx !== targetIdx) {
                    const moved = weekSessions.splice(dragSrcIdx, 1)[0];
                    weekSessions.splice(targetIdx, 0, moved);
                    dragSrcIdx = null;
                    renderWeekSessions();
                }
            });
        });
    }

    // Drop zone — accept drills from center panel
    wbDropZone.addEventListener('dragover', (e) => {
        if (e.dataTransfer.types.includes('drill')) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            wbDropZone.classList.add('drag-over');
        }
    });
    wbDropZone.addEventListener('dragleave', () => wbDropZone.classList.remove('drag-over'));
    wbDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        wbDropZone.classList.remove('drag-over');
        if (!editingWeekPlanId && wbPlanTitleInput.value.trim() === '') {
            toast('Crie ou selecione um plano antes de adicionar sessões.', 'error');
            return;
        }
        const raw = e.dataTransfer.getData('drill');
        if (!raw) return;
        try {
            const drill = JSON.parse(raw);
            weekSessions.push(drill);
            renderWeekSessions();
        } catch { /* ignore */ }
    });

    // Render drills in right panel
    async function loadWeekDrills(fundamentalId) {
        weekActiveFundId = fundamentalId;
        if (weekDrillsCache[fundamentalId]) {
            renderWeekDrillCards(weekDrillsCache[fundamentalId], fundamentalId);
            return;
        }
        wbDrillCards.innerHTML = '<p style="color:var(--text-muted);font-size:.82rem">Carregando...</p>';
        try {
            const drills = await window.FLApi.Drills.getByFundamental(fundamentalId);
            weekDrillsCache[fundamentalId] = drills;
            renderWeekDrillCards(drills, fundamentalId);
        } catch (err) {
            wbDrillCards.innerHTML = `<p style="color:var(--acc-danger);font-size:.82rem">${err.message}</p>`;
        }
    }

    function renderWeekDrillCards(drills, fundamentalId) {
        const fundTitle = fundamentals.find(f => f.id === fundamentalId)?.title || '';
        if (!drills.length) {
            wbDrillCards.innerHTML = '<p style="color:var(--text-muted);font-size:.82rem">Nenhum drill neste fundamental.</p>';
            return;
        }
        wbDrillCards.innerHTML = drills.map(d => `
            <div class="wb-drill-card" draggable="true" data-drill='${JSON.stringify({
                drill_id: d.id,
                title: d.title,
                description: d.description || '',
                duration: d.duration || '',
                fundamental_title: fundTitle,
            }).replace(/'/g, "&#39;")}'>
                <div class="wb-drill-card-title">${esc(d.title)}</div>
                <div class="wb-drill-card-meta">${esc(fundTitle)}${d.duration ? ' · ' + esc(d.duration) : ''}</div>
            </div>`).join('');

        wbDrillCards.querySelectorAll('.wb-drill-card').forEach(card => {
            card.addEventListener('dragstart', (e) => {
                const data = card.dataset.drill;
                e.dataTransfer.setData('drill', data);
                e.dataTransfer.effectAllowed = 'copy';
                setTimeout(() => card.classList.add('dragging'), 0);
            });
            card.addEventListener('dragend', () => card.classList.remove('dragging'));
        });
    }

    function buildWeekFundPills() {
        wbFundSelect.innerHTML = '<option value="">Selecione um fundamento...</option>' +
            fundamentals.map(f => `<option value="${f.id}">${esc(f.title)}</option>`).join('');
    }

    wbFundSelect.addEventListener('change', () => {
        if (wbFundSelect.value) loadWeekDrills(wbFundSelect.value);
        else wbDrillCards.innerHTML = '<p style="color:var(--text-muted);font-size:.82rem">Selecione um fundamento acima.</p>';
    });

    document.getElementById('wb-btn-new-plan').addEventListener('click', async () => {
        const btn = document.getElementById('wb-btn-new-plan');
        btn.disabled = true;
        try {
            const created = await window.FLApi.WeekPlans.create({ title: 'Novo Plano', sessions: [] });
            editingWeekPlanId = created.id; // set before loadWeekPlans to suppress auto-open
            await loadWeekPlans();
            const newPlan = weekPlans.find(p => p.id === created.id);
            if (newPlan) {
                openWeekPlanEditor(newPlan);
                wbPlanTitleInput.select(); // select default title so user can type immediately
            }
        } catch (err) {
            toast('Erro ao criar plano: ' + err.message, 'error');
        } finally {
            btn.disabled = false;
        }
    });

    document.getElementById('wb-btn-save-plan').addEventListener('click', async () => {
        const title = wbPlanTitleInput.value.trim();
        if (!title) { toast('Informe o título do plano.', 'error'); wbPlanTitleInput.focus(); return; }
        const payload = { title, sessions: weekSessions, visible_in_week: wbChkVisible.checked };
        try {
            if (editingWeekPlanId) {
                await window.FLApi.WeekPlans.update(editingWeekPlanId, payload);
                toast('Plano atualizado!');
            } else {
                const created = await window.FLApi.WeekPlans.create(payload);
                editingWeekPlanId = created.id;
                toast('Plano criado!');
            }
            await loadWeekPlans();
        } catch (err) { toast('Erro: ' + err.message, 'error'); }
    });

    document.getElementById('wb-btn-activate-plan').addEventListener('click', async () => {
        if (!editingWeekPlanId) { toast('Salve o plano antes de ativá-lo.', 'error'); return; }
        try {
            await window.FLApi.WeekPlans.setActive(editingWeekPlanId);
            toast('Plano marcado como ativo!');
            await loadWeekPlans();
        } catch (err) { toast('Erro: ' + err.message, 'error'); }
    });

    document.getElementById('wb-btn-cancel-plan').addEventListener('click', () => {
        editingWeekPlanId = null;
        weekSessions = [];
        wbPlanEditor.classList.add('hidden');
        wbPlanSelectHint.classList.remove('hidden');
        wbDropHint.style.display = '';
        wbSessionList.innerHTML = '';
        renderWeekPlanList();
    });

    window._wbDeletePlan = async (id) => {
        if (!confirm('Excluir este plano?')) return;
        try {
            await window.FLApi.WeekPlans.delete(id);
            if (editingWeekPlanId === id) {
                editingWeekPlanId = null;
                weekSessions = [];
                wbPlanEditor.classList.add('hidden');
                wbPlanSelectHint.classList.remove('hidden');
                wbSessionList.innerHTML = '';
            }
            toast('Plano excluído.');
            await loadWeekPlans();
        } catch (err) { toast('Erro: ' + err.message, 'error'); }
    };

    // ── Sidebar navigation ────────────────────────────────────────
    document.querySelectorAll('.sidebar-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const mod = btn.dataset.module;
            // Update active state
            document.querySelectorAll('.sidebar-item').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // Show/hide modules
            document.querySelectorAll('.admin-module').forEach(m => m.classList.add('hidden'));
            document.getElementById(`module-${mod}`).classList.remove('hidden');
            // Close builder when switching modules
            closeBuilder();
        });
    });

    // ── Boot ──────────────────────────────────────────────────────
    init();

})();
