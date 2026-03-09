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
            // Default "away" position if something breaks, but all our 4p data has mapping
            el.style.setProperty('--x', 5);
            el.style.setProperty('--y', 10);
        });

        // Map 4 players from data
        const ps = drill.setup.players || { p1: { x: 5, y: 10 }, p2: { x: 5, y: 12 }, p3: { x: 3, y: 10 }, p4: { x: 7, y: 10 } };
        ['p1', 'p2', 'p3', 'p4'].forEach(pID => {
            if (ps[pID]) {
                const el = actorsObj[pID];
                el.style.setProperty('--x', ps[pID].x);
                el.style.setProperty('--y', ps[pID].y);
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
            el.style.setProperty('--x', step.to.x);
            el.style.setProperty('--y', step.to.y);

            // Wait if not synced with the next move
            if (!step.sync) {
                await sleep(step.dur);
                if (seqId !== animationSequenceId) break;
            }
        }
    }

    // Run
    init();

});
