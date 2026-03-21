/**
 * Football Lab | Application Logic & Animation Engine
 * Upgraded to explicitly manage a squad of 4 interacting players (p1, p2, p3, p4).
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const navMenu = document.getElementById('nav-fundamentals');
    const fundTitle = document.getElementById('fund-title');
    const fundDesc = document.getElementById('fund-desc');
    const workspace = document.getElementById('workspace');
    const drillsContainer = document.getElementById('drills-container');
    const pitchHeaderCaption = document.getElementById('visual-caption');
    const btnReplay = document.getElementById('btn-replay');

    // Week plan elements
    const btnModeFund      = document.getElementById('btn-mode-fundamentals');
    const btnModeWeek      = document.getElementById('btn-mode-week');
    const btnModePrancheta = document.getElementById('btn-mode-prancheta');
    const navFundamentals  = document.getElementById('nav-fundamentals');
    const navWeekPlans     = document.getElementById('nav-week-plans');
    const weekPlansNavList = document.getElementById('week-plans-nav-list');
    const fundamentalsPanel = document.getElementById('fundamentals-panel');
    const weekPanel        = document.getElementById('week-sessions-panel');
    const pranchetaPanel   = document.getElementById('prancheta-panel');
    const weekPlanName     = document.getElementById('week-plan-name');
    const weekSessionCount = document.getElementById('week-session-count');
    const weekDrillsList   = document.getElementById('week-drills-list');

    let appMode = 'fundamentals';   // 'fundamentals' | 'week' | 'prancheta'
    let selectedPlanId = null;

    // Modal Elements
    const btnTechBase     = document.getElementById('btn-tech-base');
    const modalBase       = document.getElementById('tech-modal');
    const btnCloseModal   = document.getElementById('btn-close-modal');
    const modalText       = document.getElementById('modal-text');
    const modalVideos     = document.getElementById('modal-videos');
    const modalVideosList = document.getElementById('modal-videos-list');

    let fundSupaCache = null; // fundamentals from Supabase (loaded on first modal open)

    // Pitch / Animation Elements (4 Players now)
    const actorsObj = {
        ball:  document.getElementById('actor-ball'),
        ball2: document.getElementById('actor-ball2'),
        ball3: document.getElementById('actor-ball3'),
        ball4: document.getElementById('actor-ball4'),
        ball5: document.getElementById('actor-ball5'),
        ball6: document.getElementById('actor-ball6'),
        p1: document.getElementById('actor-p1'),
        p2: document.getElementById('actor-p2'),
        p3: document.getElementById('actor-p3'),
        p4: document.getElementById('actor-p4'),
        p5: document.getElementById('actor-p5'),
        p6: document.getElementById('actor-p6'),
        p7: document.getElementById('actor-p7'),
        p8: document.getElementById('actor-p8')
    };

    const conesContainer = document.getElementById('dynamic-elements');

    // State
    let fData = window.FLData.fundamentals; // fallback; replaced by Supabase on init
    let currentFundamental = null;
    let currentDrill = null;
    let animationSequenceId = 0;

    // ==========================================================
    // INITIALIZATION & UI ROUTING
    // ==========================================================

    function closeMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const sidebarBackdrop = document.getElementById('sidebar-backdrop');
        if (sidebar) sidebar.classList.remove('open');
        if (sidebarBackdrop) sidebarBackdrop.classList.add('hidden');
    }

    function buildFundMenu() {
        navMenu.innerHTML = '';
        fData.forEach((fund, index) => {
            const btn = document.createElement('button');
            btn.className = 'nav-btn';
            btn.innerHTML = `<i class="fa-solid ${fund.icon || 'fa-futbol'}"></i> ${fund.title}`;
            btn.addEventListener('click', () => {
                selectFundamental(index, btn);
                closeMobileSidebar();
            });
            navMenu.appendChild(btn);
        });
    }

    async function init() {
        // Load fundamentals from Supabase; fall back to hardcoded data on error
        try {
            const supaFunds = await window.FLApi.Fundamentals.getAll();
            if (supaFunds && supaFunds.length) {
                fData = supaFunds;
                fundSupaCache = supaFunds; // pre-warm modal cache
            }
        } catch (e) {
            console.warn('[FL] Fundamentals.getAll() failed, using static data:', e);
        }

        // Build Sidebar Menu
        buildFundMenu();

        // Mobile sidebar toggle
        const btnMenu = document.getElementById('btn-menu');
        const sidebarBackdrop = document.getElementById('sidebar-backdrop');
        const sidebar = document.querySelector('.sidebar');
        if (btnMenu) {
            btnMenu.addEventListener('click', () => {
                sidebar.classList.toggle('open');
                sidebarBackdrop.classList.toggle('hidden');
            });
            sidebarBackdrop.addEventListener('click', closeMobileSidebar);
        }

        // Mode switcher
        btnModeFund.addEventListener('click', () => switchMode('fundamentals'));
        btnModeWeek.addEventListener('click', () => switchMode('week'));
        btnModePrancheta.addEventListener('click', () => switchMode('prancheta'));

        // Prancheta
        initPrancheta();

        // Event Listeners
        btnReplay.addEventListener('click', () => {
            if (currentDrill) playDrillAnimation(currentDrill);
        });

        // Modal Logic
        btnTechBase.addEventListener('click', async () => {
            if (!currentFundamental) return;
            modalText.textContent = currentFundamental.base_tech || currentFundamental.baseTech || '';
            modalVideos.classList.add('hidden');
            modalBase.classList.remove('hidden');

            // Load from Supabase (cached after first call)
            if (!fundSupaCache) {
                try { fundSupaCache = await window.FLApi.Fundamentals.getAll(); }
                catch (e) {
                    console.error('[FL] Fundamentals.getAll() error:', e);
                    fundSupaCache = [];
                }
            }
            const supaFund = fundSupaCache.find(f => f.title === currentFundamental.title);
            // Override static base_tech with Supabase version if available
            if (supaFund?.base_tech) modalText.textContent = supaFund.base_tech;
            const videos = supaFund?.videos || [];
            modalVideos.classList.remove('hidden');
            if (videos.length) {
                modalVideosList.innerHTML = videos.map(v => `
                    <a class="modal-video-card"
                       href="https://www.youtube.com/watch?v=${escHtml(v.youtube_id)}"
                       target="_blank" rel="noopener">
                        <img class="modal-video-thumb"
                             src="https://img.youtube.com/vi/${escHtml(v.youtube_id)}/mqdefault.jpg"
                             alt="" loading="lazy">
                        <div class="modal-video-info">
                            <div class="modal-video-name">${escHtml(v.title)}</div>
                            <div class="modal-video-hint">
                                <i class="fa-brands fa-youtube" style="color:#ef4444"></i>
                                Abrir no YouTube
                            </div>
                        </div>
                        <i class="fa-solid fa-arrow-up-right-from-square" style="color:var(--text-muted);font-size:.8rem"></i>
                    </a>`).join('');
            } else {
                modalVideosList.innerHTML = '<p style="color:var(--text-muted);font-size:.85rem">Nenhum vídeo cadastrado para este fundamento.</p>';
            }
        });

        btnCloseModal.addEventListener('click', () => modalBase.classList.add('hidden'));
        modalBase.addEventListener('click', (e) => {
            if (e.target === modalBase) modalBase.classList.add('hidden');
        });
    }

    async function selectFundamental(index, btnEl) {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        if (btnEl) btnEl.classList.add('active');

        currentFundamental = fData[index];

        // Populate Header
        fundTitle.textContent = currentFundamental.title;
        btnTechBase.classList.remove('hidden');

        // Show Workspace
        workspace.classList.remove('hidden');

        // Load drills from Supabase
        drillsContainer.innerHTML = '<p style="color:var(--text-muted);padding:16px 0;font-size:.9rem">Carregando exercícios...</p>';
        try {
            const drills = await window.FLApi.Drills.getByFundamental(currentFundamental.id);
            currentFundamental.drills = drills;
        } catch (err) {
            console.error('[FL] Erro ao carregar drills:', err);
            drillsContainer.innerHTML = '<p style="color:#ef4444;padding:16px 0;font-size:.9rem">Erro ao carregar exercícios.</p>';
            return;
        }

        // Populate Drill Cards
        const countBadge = document.getElementById('drill-count-badge');
        if (countBadge) countBadge.textContent = `${currentFundamental.drills.length} exercícios`;
        drillsContainer.innerHTML = '';
        currentFundamental.drills.forEach((drill, dIdx) => {
            const card = document.createElement('div');
            card.className = 'drill-card fade-in';
            card.style.animationDelay = `${dIdx * 0.05}s`;

            card.innerHTML = `
                <div class="drill-nav">
                    <span class="drill-title">${drill.title}</span>
                    <span class="drill-idx">#${dIdx + 1}</span>
                </div>
                <p class="drill-desc">${drill.description || drill.desc || ''}</p>
            `;

            card.addEventListener('click', () => selectDrill(drill, card));
            drillsContainer.appendChild(card);
        });

        // Automatically select the first drill
        if (currentFundamental.drills.length > 0) {
            selectDrill(currentFundamental.drills[0], drillsContainer.firstChild);
        }
    }

    function selectDrill(drill, cardEl) {
        document.querySelectorAll('.drill-card').forEach(c => c.classList.remove('active'));
        if (cardEl) cardEl.classList.add('active');

        currentDrill = drill;
        pitchHeaderCaption.innerHTML = `<p><i class="fa-solid fa-play"></i> <strong>${drill.title}</strong>: Executando simulação táctica com a equipe...</p>`;

        playDrillAnimation(drill);
    }

    // ==========================================================
    // MULTI-ACTOR ANIMATION ENGINE
    // ==========================================================

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    async function playDrillAnimation(drill) {
        animationSequenceId++;
        const seqId = animationSequenceId;

        // Reset Setup without Transitions
        Object.values(actorsObj).forEach(el => {
            el.style.transition = 'none';
            el.style.setProperty('--x', 5);
            el.style.setProperty('--y', 10);
            el.style.transform = 'translate(-50%, -50%)';
            el.dataset.foot = '';
        });
        // Hide ALL players and extended balls; shown only if this drill uses them
        ['p1','p2','p3','p4','p5','p6','p7','p8','ball2','ball3','ball4','ball5','ball6'].forEach(key => {
            if (actorsObj[key]) actorsObj[key].style.display = 'none';
        });

        // Map players from data (p1-p8)
        const ps = drill.setup.players || {};
        ['p1','p2','p3','p4','p5','p6','p7','p8'].forEach(pID => {
            const el = actorsObj[pID];
            if (!el) return;
            const pos = ps[pID];
            if (pos) {
                el.style.display = 'block';
                el.style.setProperty('--x', pos.x);
                el.style.setProperty('--y', pos.y);
                if (pos.rot) el.style.transform = `translate(-50%, -50%) rotate(${pos.rot}deg)`;
                if (pos.foot) el.dataset.foot = pos.foot;
            }
        });

        // Ball setup (ball + ball2-ball6)
        ['ball','ball2','ball3','ball4','ball5','ball6'].forEach(bKey => {
            const el = actorsObj[bKey];
            if (!el) return;
            const bPos = bKey === 'ball' ? (drill.setup.ball || { x: 0.5, y: 0 }) : drill.setup[bKey];
            if (bPos) {
                el.style.display = 'block';
                el.style.setProperty('--x', bPos.x);
                el.style.setProperty('--y', bPos.y);
            }
        });

        // Map Cones
        conesContainer.innerHTML = '';
        if (drill.setup.cones) {
            drill.setup.cones.forEach(conePos => {
                const c = document.createElement('div');
                c.className = 'cone';
                c.style.setProperty('--x', conePos.x);
                c.style.setProperty('--y', conePos.y);
                conesContainer.appendChild(c);
            });
        }

        // Wait a tick
        await sleep(50);
        if (seqId !== animationSequenceId) return;

        // Restore transitions
        ['p1','p2','p3','p4','p5','p6','p7','p8'].forEach(pID => {
            if (actorsObj[pID]) actorsObj[pID].style.transition = 'all 0.5s ease-in-out';
        });
        ['ball','ball2','ball3','ball4','ball5','ball6'].forEach(bKey => {
            if (actorsObj[bKey]) actorsObj[bKey].style.transition = 'all 0.4s ease-out';
        });

        await sleep(600); // Intro pause before action
        if (seqId !== animationSequenceId) return;

        // Run Sequence
        const steps = drill.anim || [];
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];

            if (step.delay) {
                await sleep(step.delay);
                if (seqId !== animationSequenceId) break;
                continue;
            }

            // Identify Which Actor to Move
            const el = actorsObj[step.actor];
            if (!el) continue;
            el.style.display = 'block'; // ensure extended actors are visible if animated

            const cssDur = (step.dur / 1000) + 's';
            // Give players ease, ball precise linear
            if (step.actor === 'ball') {
                el.style.transition = `all ${cssDur} linear`;
            } else {
                el.style.transition = `all ${cssDur} ease-in-out`;
            }

            // Execute move
            if (step.to) {
                el.style.setProperty('--x', step.to.x);
                el.style.setProperty('--y', step.to.y);
            }
            if (step.rot !== undefined) {
                el.style.transform = `translate(-50%, -50%) rotate(${step.rot}deg)`;
            }
            if (step.foot !== undefined) {
                el.dataset.foot = step.foot || '';
            }

            // Wait if not synced with the next move
            if (!step.sync) {
                await sleep(step.dur);
                if (seqId !== animationSequenceId) break;
            }
        }
    }

    // ==========================================================
    // WEEK PLAN MODE
    // ==========================================================

    function switchMode(mode) {
        appMode = mode;
        btnModeFund.classList.toggle('active', mode === 'fundamentals');
        btnModeWeek.classList.toggle('active', mode === 'week');
        btnModePrancheta.classList.toggle('active', mode === 'prancheta');

        navFundamentals.classList.toggle('hidden', mode !== 'fundamentals');
        navWeekPlans.classList.toggle('hidden', mode !== 'week');

        fundamentalsPanel.classList.toggle('hidden', mode !== 'fundamentals');
        weekPanel.classList.toggle('hidden', mode !== 'week');
        pranchetaPanel.classList.toggle('hidden', mode !== 'prancheta');

        const pitchEl = document.getElementById('pitch');

        if (mode === 'prancheta') {
            fundTitle.textContent = 'Prancheta';
            fundDesc.textContent = 'Arraste peças e faça rabiscos no campo.';
            btnTechBase.classList.add('hidden');
            workspace.classList.remove('hidden');
            document.getElementById('btn-replay').classList.add('hidden');
            pitchEl.classList.add('prancheta-mode');
            pitchHeaderCaption.innerHTML = '<p><i class="fa-solid fa-hand-pointer"></i> Clique nas peças à esquerda para adicionar ao campo. Clique com botão direito em uma peça para removê-la.</p>';
        } else {
            document.getElementById('btn-replay').classList.remove('hidden');
            pitchEl.classList.remove('prancheta-mode');
        }

        if (mode === 'week') {
            fundTitle.textContent = 'Treino da Semana';
            fundDesc.textContent = 'Selecione um plano no menu lateral.';
            btnTechBase.classList.add('hidden');
            workspace.classList.remove('hidden');
            loadVisiblePlans();
        } else if (mode === 'fundamentals') {
            if (currentFundamental) {
                fundTitle.textContent = currentFundamental.title;
            } else {
                fundTitle.textContent = 'Selecione um Fundamento';
                fundDesc.textContent = 'Escolha uma opção no menu lateral para visualizar os exercícios de grupo.';
            }
        }
    }

    async function loadVisiblePlans() {
        weekPlansNavList.innerHTML = '<p style="color:var(--text-muted);font-size:.8rem;padding:4px 0">Carregando...</p>';
        let plans;
        try {
            plans = await window.FLApi.WeekPlans.getVisible();
        } catch (err) {
            weekPlansNavList.innerHTML = '<p style="color:#ef4444;font-size:.8rem">Erro ao carregar planos.</p>';
            return;
        }
        if (!plans.length) {
            weekPlansNavList.innerHTML = '<p style="color:var(--text-muted);font-size:.8rem">Nenhum plano visível configurado.</p>';
            return;
        }
        weekPlansNavList.innerHTML = plans.map(p => `
            <button class="week-plan-nav-btn ${p.id === selectedPlanId ? 'active' : ''}" data-plan-id="${p.id}">
                <i class="fa-solid fa-calendar-check"></i>
                <div>
                    <div class="week-plan-nav-title">${escHtml(p.title)}</div>
                    <div class="week-plan-nav-meta">${p.sessions ? p.sessions.length : 0} sessões</div>
                </div>
            </button>`).join('');

        weekPlansNavList.querySelectorAll('.week-plan-nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const plan = plans.find(p => p.id === btn.dataset.planId);
                if (plan) selectWeekPlan(plan);
            });
        });
    }

    function selectWeekPlan(plan) {
        selectedPlanId = plan.id;
        // Update active state in nav
        weekPlansNavList.querySelectorAll('.week-plan-nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.planId === plan.id);
        });
        // Keep header fixed as "Treino da Semana" — don't overwrite with plan title
        fundDesc.textContent = `${plan.sessions ? plan.sessions.length : 0} sessões`;
        btnTechBase.classList.add('hidden');
        workspace.classList.remove('hidden');
        weekPanel.classList.remove('hidden');
        fundamentalsPanel.classList.add('hidden');
        if (!plan.sessions || !plan.sessions.length) {
            weekPlanName.textContent = plan.title;
            weekSessionCount.textContent = '0 sessões';
            weekDrillsList.innerHTML = '<p style="color:var(--text-muted);font-size:.88rem;padding:16px 0">Nenhuma sessão neste plano.</p>';
            return;
        }
        weekPlanName.textContent = plan.title;
        weekSessionCount.textContent = `${plan.sessions.length} sessões`;
        renderWeekSessions(plan.sessions);
    }

    function renderWeekSessions(sessions) {
        weekDrillsList.innerHTML = sessions.map((s, i) => `
            <div class="week-session-card" data-drill-id="${s.drill_id}">
                <div class="week-session-num">Sessão ${i + 1}</div>
                <div class="week-session-title">${escHtml(s.title)}</div>
                <div class="week-session-meta">
                    ${s.fundamental_title ? escHtml(s.fundamental_title) : ''}
                    ${s.duration ? ' · ' + escHtml(s.duration) : ''}
                </div>
            </div>`).join('');

        weekDrillsList.querySelectorAll('.week-session-card').forEach(card => {
            card.addEventListener('click', () => selectWeekSession(card, card.dataset.drillId));
        });
    }

    async function selectWeekSession(cardEl, drillId) {
        document.querySelectorAll('.week-session-card').forEach(c => c.classList.remove('active'));
        cardEl.classList.add('active');
        pitchHeaderCaption.innerHTML = '<p><i class="fa-solid fa-spinner fa-spin"></i> Carregando animação...</p>';
        try {
            const drill = await window.FLApi.Drills.getById(drillId);
            currentDrill = drill;
            pitchHeaderCaption.innerHTML = `<p><i class="fa-solid fa-play"></i> <strong>${drill.title}</strong></p>`;
            playDrillAnimation(drill);
        } catch (err) {
            pitchHeaderCaption.innerHTML = `<p style="color:#ef4444">Erro: ${err.message}</p>`;
        }
    }

    // ─── PRANCHETA ───────────────────────────────────────────────────────────────
    function initPrancheta() {
        const canvas  = document.getElementById('prancheta-canvas');
        const ctx     = canvas.getContext('2d');
        const itemsEl = document.getElementById('prancheta-items');
        const pitchEl = document.getElementById('pitch');

        // Canvas buffer matches pitch CSS size (240×480)
        canvas.width  = 240;
        canvas.height = 480;

        let pTool    = 'move';
        let penColor = '#ffffff';
        let penSize  = 3;
        let isDrawing = false;
        let lastPos   = null;

        const COLORS = ['#ffffff', '#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#f97316', '#a855f7', '#000000'];

        // ── Tool switching ──────────────────────────────────────────────
        function setTool(tool) {
            pTool = tool;
            canvas.style.pointerEvents  = tool === 'move' ? 'none' : 'auto';
            itemsEl.style.pointerEvents = tool === 'move' ? 'auto' : 'none';
            canvas.style.cursor = tool === 'draw' ? 'crosshair' : tool === 'erase' ? 'cell' : 'default';
            document.querySelectorAll('.pran-tool-btn').forEach(b =>
                b.classList.toggle('active', b.dataset.tool === tool));
        }

        // ── Canvas coordinate helper ────────────────────────────────────
        function getCanvasPos(e) {
            const rect   = canvas.getBoundingClientRect();
            const scaleX = canvas.width  / rect.width;
            const scaleY = canvas.height / rect.height;
            const src    = e.touches ? e.touches[0] : e;
            return {
                x: (src.clientX - rect.left) * scaleX,
                y: (src.clientY - rect.top)  * scaleY
            };
        }

        // ── Drawing ─────────────────────────────────────────────────────
        canvas.addEventListener('pointerdown', e => {
            if (pTool === 'move') return;
            isDrawing = true;
            lastPos   = getCanvasPos(e);
            canvas.setPointerCapture(e.pointerId);
        });

        canvas.addEventListener('pointermove', e => {
            if (!isDrawing) return;
            const pos = getCanvasPos(e);
            if (pTool === 'draw') {
                ctx.beginPath();
                ctx.moveTo(lastPos.x, lastPos.y);
                ctx.lineTo(pos.x, pos.y);
                ctx.strokeStyle = penColor;
                ctx.lineWidth   = penSize;
                ctx.lineCap     = 'round';
                ctx.lineJoin    = 'round';
                ctx.stroke();
            } else if (pTool === 'erase') {
                const r = penSize * 4;
                ctx.clearRect(pos.x - r, pos.y - r, r * 2, r * 2);
            }
            lastPos = pos;
        });

        canvas.addEventListener('pointerup',    () => { isDrawing = false; });
        canvas.addEventListener('pointerleave', () => { isDrawing = false; });

        // ── Item dragging on pitch ──────────────────────────────────────
        function makeItemDraggable(el) {
            let startX, startY, startLeft, startTop;

            el.addEventListener('pointerdown', e => {
                if (pTool !== 'move') return;
                e.stopPropagation();
                el.setPointerCapture(e.pointerId);
                startX    = e.clientX;
                startY    = e.clientY;
                startLeft = parseFloat(el.style.left);
                startTop  = parseFloat(el.style.top);
            });

            el.addEventListener('pointermove', e => {
                if (!e.buttons || pTool !== 'move') return;
                const rect = pitchEl.getBoundingClientRect();
                const dx   = (e.clientX - startX) / rect.width  * 100;
                const dy   = (e.clientY - startY) / rect.height * 100;
                el.style.left = Math.min(97, Math.max(3, startLeft + dx)) + '%';
                el.style.top  = Math.min(97, Math.max(3, startTop  + dy)) + '%';
            });

            el.addEventListener('contextmenu', e => {
                e.preventDefault();
                el.remove();
            });
        }

        // ── Add piece to field ──────────────────────────────────────────
        function addPieceToField(piece, leftPct, topPct) {
            const el = document.createElement('div');
            el.className = 'pran-item';
            el.style.left = leftPct + '%';
            el.style.top  = topPct  + '%';
            el.style.touchAction = 'none';

            if (piece.type === 'player') {
                el.style.color = piece.color;
                el.innerHTML = `<svg viewBox="0 0 42 36" width="36" height="30" style="display:block;filter:drop-shadow(0 1px 3px rgba(0,0,0,.6))">
                    <ellipse cx="21" cy="13" rx="13" ry="8" fill="currentColor"/>
                    <ellipse cx="21" cy="13" rx="13" ry="8" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="1"/>
                    <text x="21" y="14" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="9" font-weight="900" font-family="Outfit,sans-serif">${piece.num}</text>
                </svg>`;
            } else if (piece.type === 'cone') {
                el.innerHTML = `<svg viewBox="0 0 28 28" width="28" height="28" style="display:block;filter:drop-shadow(0 1px 2px rgba(0,0,0,.6))">
                    <polygon points="14,3 26,25 2,25" fill="#f97316" stroke="rgba(255,255,255,.3)" stroke-width="1"/>
                </svg>`;
            } else if (piece.type === 'ball') {
                el.innerHTML = `<div style="width:18px;height:18px;border-radius:50%;background:#fff;border:2px solid #94a3b8;box-shadow:0 1px 4px rgba(0,0,0,.6)"></div>`;
            }

            makeItemDraggable(el);
            itemsEl.appendChild(el);
        }

        // ── Toolbox pieces (click to add) ───────────────────────────────
        const COLOR_MAP = { '1': '#ef4444', '2': '#3b82f6', '3': '#22c55e', '4': '#f59e0b' };

        document.querySelectorAll('.pran-piece').forEach(btn => {
            btn.addEventListener('click', () => {
                const type  = btn.dataset.type;
                const num   = btn.dataset.num ? parseInt(btn.dataset.num) : null;
                const piece = type === 'player'
                    ? { type: 'player', num, color: COLOR_MAP[num] }
                    : { type };
                const left = 35 + Math.random() * 30;
                const top  = 30 + Math.random() * 40;
                addPieceToField(piece, left, top);
            });
        });

        // ── Tool buttons ────────────────────────────────────────────────
        document.querySelectorAll('.pran-tool-btn').forEach(btn => {
            btn.addEventListener('click', () => setTool(btn.dataset.tool));
        });

        // ── Color swatches ──────────────────────────────────────────────
        const colorsContainer = document.getElementById('pran-colors');
        COLORS.forEach((c, i) => {
            const sw = document.createElement('div');
            sw.className = 'pran-color-swatch' + (i === 0 ? ' active' : '');
            sw.style.background = c;
            sw.title = c;
            if (c === '#000000') sw.style.border = '2px solid rgba(255,255,255,.3)';
            sw.addEventListener('click', () => {
                penColor = c;
                if (pTool !== 'draw') setTool('draw');
                colorsContainer.querySelectorAll('.pran-color-swatch').forEach(s => s.classList.remove('active'));
                sw.classList.add('active');
            });
            colorsContainer.appendChild(sw);
        });

        // ── Pen size slider ─────────────────────────────────────────────
        document.getElementById('pran-pen-size').addEventListener('input', e => {
            penSize = parseInt(e.target.value);
        });

        // ── Action buttons ──────────────────────────────────────────────
        document.getElementById('pran-clear-draw').addEventListener('click', () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        });
        document.getElementById('pran-clear-all').addEventListener('click', () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            itemsEl.innerHTML = '';
        });

        // Init
        setTool('move');
    }

    function escHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // Run
    init();

});
