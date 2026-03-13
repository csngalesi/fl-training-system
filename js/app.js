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
    const navFundamentals  = document.getElementById('nav-fundamentals');
    const navWeekPlans     = document.getElementById('nav-week-plans');
    const weekPlansNavList = document.getElementById('week-plans-nav-list');
    const fundamentalsPanel = document.getElementById('fundamentals-panel');
    const weekPanel        = document.getElementById('week-sessions-panel');
    const weekPlanName     = document.getElementById('week-plan-name');
    const weekSessionCount = document.getElementById('week-session-count');
    const weekDrillsList   = document.getElementById('week-drills-list');

    let appMode = 'fundamentals';   // 'fundamentals' | 'week'
    let selectedPlanId = null;

    // Modal Elements
    const btnTechBase = document.getElementById('btn-tech-base');
    const modalBase = document.getElementById('tech-modal');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const modalText = document.getElementById('modal-text');

    // Pitch / Animation Elements (4 Players now)
    const actorsObj = {
        ball: document.getElementById('actor-ball'),
        p1: document.getElementById('actor-p1'),
        p2: document.getElementById('actor-p2'),
        p3: document.getElementById('actor-p3'),
        p4: document.getElementById('actor-p4')
    };

    const conesContainer = document.getElementById('dynamic-elements');

    // State
    const fData = window.FLData.fundamentals;
    let currentFundamental = null;
    let currentDrill = null;
    let animationSequenceId = 0;

    // ==========================================================
    // INITIALIZATION & UI ROUTING
    // ==========================================================

    function init() {
        // Build Sidebar Menu
        fData.forEach((fund, index) => {
            const btn = document.createElement('button');
            btn.className = 'nav-btn';
            btn.innerHTML = `<i class="fa-solid ${fund.icon}"></i> ${fund.title}`;
            btn.addEventListener('click', () => {
                selectFundamental(index, btn);
                closeMobileSidebar();
            });
            navMenu.appendChild(btn);
        });

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
        function closeMobileSidebar() {
            sidebar.classList.remove('open');
            sidebarBackdrop.classList.add('hidden');
        }

        // Mode switcher
        btnModeFund.addEventListener('click', () => switchMode('fundamentals'));
        btnModeWeek.addEventListener('click', () => switchMode('week'));

        // Event Listeners
        btnReplay.addEventListener('click', () => {
            if (currentDrill) playDrillAnimation(currentDrill);
        });

        // Modal Logic
        btnTechBase.addEventListener('click', () => {
            if (currentFundamental) {
                modalText.textContent = currentFundamental.base_tech || currentFundamental.baseTech || '';
                modalBase.classList.remove('hidden');
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

        // Map 4 players from data
        const ps = drill.setup.players || { p1: { x: 5, y: 10 }, p2: { x: 5, y: 12 }, p3: { x: 3, y: 10 }, p4: { x: 7, y: 10 } };
        ['p1', 'p2', 'p3', 'p4'].forEach(pID => {
            if (ps[pID]) {
                const el = actorsObj[pID];
                el.style.setProperty('--x', ps[pID].x);
                el.style.setProperty('--y', ps[pID].y);
                if (ps[pID].rot) el.style.transform = `translate(-50%, -50%) rotate(${ps[pID].rot}deg)`;
                if (ps[pID].foot) el.dataset.foot = ps[pID].foot;
            }
        });

        // Ball setup
        const bStart = drill.setup.ball || { x: 0.5, y: 0 };
        actorsObj['ball'].style.setProperty('--x', bStart.x);
        actorsObj['ball'].style.setProperty('--y', bStart.y);

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

        // Restore transitions heavily easing for players, linear for ball
        ['p1', 'p2', 'p3', 'p4'].forEach(pID => { actorsObj[pID].style.transition = 'all 0.5s ease-in-out'; });
        actorsObj['ball'].style.transition = 'all 0.4s ease-out';

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
        navFundamentals.classList.toggle('hidden', mode === 'week');
        navWeekPlans.classList.toggle('hidden', mode !== 'week');
        fundamentalsPanel.classList.toggle('hidden', mode === 'week');
        weekPanel.classList.toggle('hidden', mode !== 'week');

        if (mode === 'week') {
            fundTitle.textContent = 'Treino da Semana';
            fundDesc.textContent = 'Selecione um plano no menu lateral.';
            btnTechBase.classList.add('hidden');
            loadVisiblePlans();
        } else {
            navMenu.classList.remove('hidden'); // ensure nav-fundamentals stays visible
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

    function escHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // Run
    init();

});
