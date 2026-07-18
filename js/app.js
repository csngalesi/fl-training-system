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

    // Treinos elements
    const btnModeWeek      = document.getElementById('btn-mode-week');
    const navFundamentals  = document.getElementById('nav-fundamentals');
    const navWeekPlans     = document.getElementById('trainings-main-col');
    const weekPlansNavList = document.getElementById('week-plans-nav-list');
    const fundamentalsPanel = document.getElementById('fundamentals-panel');
    const weekPanel        = document.getElementById('week-sessions-panel');
    const pranchetaPanel   = document.getElementById('prancheta-panel');
    const weekPlanName     = document.getElementById('week-plan-name');
    const weekSessionCount = document.getElementById('week-session-count');
    const weekDrillsList   = document.getElementById('week-drills-list');

    let appMode = 'week';
    let selectedPlanId = null;           // = fl_trainings.id
    let _currentTrainingData = null;     // cached currently selected training

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

        // Mode switcher — only Treinos in main nav; start in week mode
        if (btnModeWeek) btnModeWeek.addEventListener('click', () => switchMode('week'));
        switchMode('week');

        // Prancheta (panel removed from layout, guard against missing elements)
        try { initPrancheta(); } catch (e) { /* prancheta panel not in current layout */ }

        // Controle de Carga
        initCarga();

        // ── Helper: normaliza media para array ───────────────────────
        function toMediaArr(val) {
            if (!val) return [];
            return Array.isArray(val) ? val : [val];
        }

        // ── Helper: renderiza lista de mídia no modal ──────────────────────
        function renderModalMedia(containerId, mediaArr) {
            const el = document.getElementById(containerId);
            if (!el) return;
            if (!mediaArr || !mediaArr.length) { el.innerHTML = ''; return; }
            el.innerHTML = mediaArr.map(m => {
                if (m.type === 'youtube') {
                    return `<div style="margin-top:12px;">
                        ${m.caption ? `<p style="font-size:.82rem;color:var(--text-muted);margin-bottom:6px;">${m.caption}</p>` : ''}
                        <div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:10px;">
                            <iframe src="https://www.youtube.com/embed/${m.value}" frameborder="0" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen
                                style="position:absolute;top:0;left:0;width:100%;height:100%;border-radius:10px;"></iframe>
                        </div>
                    </div>`;
                }
                if (m.type === 'image') {
                    return `<div style="margin-top:12px;">
                        ${m.caption ? `<p style="font-size:.82rem;color:var(--text-muted);margin-bottom:6px;">${m.caption}</p>` : ''}
                        <img src="${m.value}" style="width:100%;border-radius:10px;object-fit:cover;" loading="lazy">
                    </div>`;
                }
                // video_url
                return `<div style="margin-top:12px;">
                    ${m.caption ? `<p style="font-size:.82rem;color:var(--text-muted);margin-bottom:6px;">${m.caption}</p>` : ''}
                    <video src="${m.value}" controls style="width:100%;border-radius:10px;" preload="none"></video>
                </div>`;
            }).join('');
        }

        // Mensagem modal
        document.getElementById('btn-mensagem').addEventListener('click', () => {
            const modal   = document.getElementById('mensagem-modal');
            const loading = document.getElementById('mensagem-loading');
            const content = document.getElementById('mensagem-content');
            const empty   = document.getElementById('mensagem-empty');
            loading.classList.add('hidden');
            content.classList.add('hidden');
            empty.classList.add('hidden');
            modal.classList.remove('hidden');
            if (_currentTrainingData && _currentTrainingData.mensagem_text) {
                document.getElementById('mensagem-texto').textContent = _currentTrainingData.mensagem_text;
                renderModalMedia('mensagem-media', toMediaArr(_currentTrainingData.mensagem_media));
                content.classList.remove('hidden');
            } else {
                empty.classList.remove('hidden');
            }
        });
        const closeMensagemModal = () => {
            document.getElementById('mensagem-modal').classList.add('hidden');
            const el = document.getElementById('mensagem-media');
            if (el) el.innerHTML = '';
        };
        document.getElementById('btn-close-mensagem').addEventListener('click', closeMensagemModal);
        document.getElementById('mensagem-modal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('mensagem-modal'))
                closeMensagemModal();
        });

        // Técnica modal
        document.getElementById('btn-tecnica').addEventListener('click', () => {
            const modal   = document.getElementById('tecnica-modal');
            const loading = document.getElementById('tecnica-loading');
            const content = document.getElementById('tecnica-content');
            const empty   = document.getElementById('tecnica-empty');
            loading.classList.add('hidden');
            content.classList.add('hidden');
            empty.classList.add('hidden');
            modal.classList.remove('hidden');
            if (_currentTrainingData && _currentTrainingData.destaque_text) {
                document.getElementById('tecnica-texto').textContent = _currentTrainingData.destaque_text;
                renderModalMedia('tecnica-media', toMediaArr(_currentTrainingData.destaque_media));
                content.classList.remove('hidden');
            } else {
                empty.classList.remove('hidden');
            }
        });
        const closeTecnicaModal = () => {
            document.getElementById('tecnica-modal').classList.add('hidden');
            const el = document.getElementById('tecnica-media');
            if (el) el.innerHTML = '';
        };
        document.getElementById('btn-close-tecnica').addEventListener('click', closeTecnicaModal);
        document.getElementById('tecnica-modal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('tecnica-modal'))
                closeTecnicaModal();
        });

        // Metodologia modal slideshow
        const metodologiasConfig = [
            'metodologia/blueprint.html',
            'metodologia/bloco_a.html',
            'metodologia/bloco_b.html',
            'metodologia/bloco_c.html',
            'metodologia/bloco_d.html',
            'metodologia/bloco_e.html'
        ];
        let currentMetoIdx = 0;
        const frameMeto = document.getElementById('metodologia-frame');

        document.getElementById('btn-metodologia-prev').addEventListener('click', () => {
            currentMetoIdx = (currentMetoIdx - 1 + metodologiasConfig.length) % metodologiasConfig.length;
            if(frameMeto) frameMeto.src = metodologiasConfig[currentMetoIdx];
        });

        document.getElementById('btn-metodologia-next').addEventListener('click', () => {
            currentMetoIdx = (currentMetoIdx + 1) % metodologiasConfig.length;
            if(frameMeto) frameMeto.src = metodologiasConfig[currentMetoIdx];
        });

        document.getElementById('btn-metodologia').addEventListener('click', () => {
            currentMetoIdx = 0; // always open on the first slide
            if(frameMeto) frameMeto.src = metodologiasConfig[0];
            document.getElementById('metodologia-modal').classList.remove('hidden');
        });

        // Grade Horária modal
        const DAYS_ORDER = ['Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
        const DAY_NUM_TO_NAME = { 1:'Segunda', 2:'Terça', 3:'Quarta', 4:'Quinta', 5:'Sexta', 6:'Sábado' };

        document.getElementById('btn-open-grade').addEventListener('click', async () => {
            const modal   = document.getElementById('grade-modal');
            const loading = document.getElementById('grade-loading');
            const wrap    = document.getElementById('grade-table-wrap');
            modal.classList.remove('hidden');
            loading.classList.remove('hidden');
            wrap.classList.add('hidden');
            wrap.innerHTML = '';

            try {
                const { classes, enrollments } = await window.FLApi.FLGestao.getSchedule();

                // Map enrollments by schedule_class_id
                const enrollMap = {};
                enrollments.forEach(e => {
                    const sid = e.schedule_class_id;
                    if (!enrollMap[sid]) enrollMap[sid] = [];
                    if (e.students) {
                        enrollMap[sid].push({
                            id: e.students.id,
                            full_name: e.students.full_name,
                            student_type: e.students.student_type,
                            birth_date: e.students.birth_date || null,
                            is_reschedule: e.is_reschedule || false
                        });
                    }
                });

                // Collect all unique days and times from schedule_classes
                // day_of_week é número inteiro (1=Segunda … 6=Sábado)
                const dayNums = [...new Set(classes.map(c => c.day_of_week).filter(n => n != null))].sort((a,b) => a-b);
                const activeDays = dayNums.map(n => DAY_NUM_TO_NAME[n] || `Dia ${n}`);

                const times = [...new Set(classes.map(c => c.start_time.substring(0, 5)))].sort();

                // Map: { time -> { dayName -> class_id } }
                const grid = {};
                classes.forEach(c => {
                    if (!c.start_time || c.day_of_week == null) return;
                    const t = c.start_time.substring(0, 5);
                    const d = DAY_NUM_TO_NAME[c.day_of_week] || `Dia ${c.day_of_week}`;
                    if (!grid[t]) grid[t] = {};
                    grid[t][d] = c.id;
                });

                const thStyle = 'padding:10px 14px;text-align:left;color:var(--text-muted);font-size:.75rem;font-weight:700;letter-spacing:.06em;border-bottom:1px solid var(--glass-border);white-space:nowrap;position:sticky;top:0;background:#1e293b;z-index:1;overflow:hidden;';
                const tdTimeStyle = 'padding:10px 14px;color:var(--text-muted);font-size:.82rem;white-space:nowrap;border-bottom:1px solid rgba(255,255,255,.04);vertical-align:top;font-weight:600;width:72px;';
                const tdStyle = 'padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.04);vertical-align:top;';

                let html = '<table style="width:100%;border-collapse:collapse;font-size:.82rem;table-layout:fixed;">';
                html += '<colgroup>';
                html += '<col style="width:72px">';  // Horário
                activeDays.forEach(() => { html += `<col>`; });  // dias dividem o restante igualmente
                html += '</colgroup>';
                html += '<thead><tr>';
                html += `<th style="${thStyle}">HORÁRIO</th>`;
                activeDays.forEach(d => {
                    html += `<th style="${thStyle}">${d.toUpperCase()}</th>`;
                });
                html += '</tr></thead><tbody>';

                times.forEach(time => {
                    html += '<tr>';
                    html += `<td style="${tdTimeStyle}">${time}</td>`;
                    activeDays.forEach(day => {
                        const classId  = grid[time] && grid[time][day];
                        const students = classId ? (enrollMap[classId] || []) : null;
                        let cell = '';
                        if (students === null) {
                            // No class configured for this slot
                            cell = '';
                        } else if (students.length === 0) {
                            cell = '<span style="color:rgba(255,255,255,.15);font-size:.72rem;">vazio</span>';
                        } else {
                            cell = students.map(s => {
                                const isPre     = s.student_type === 'pre-cadastro';
                                const isResched = s.is_reschedule;
                                
                                let bg     = 'rgba(16,185,129,.12)'; // Verde default
                                let color  = '#10b981';
                                let border = 'rgba(16,185,129,.35)';
                                
                                if (isPre) {
                                    bg     = 'rgba(251,191,36,.12)'; // Amarelo
                                    color  = '#fbbf24';
                                    border = 'rgba(251,191,36,.35)';
                                } else if (isResched) {
                                    bg     = 'rgba(59, 130, 246, .12)'; // Azul
                                    color  = '#3b82f6';
                                    border = 'rgba(59, 130, 246, .35)';
                                }
                                
                                return (() => {
                                    const age    = calcAge(s.birth_date);
                                    const ageStr = age !== null ? ` (${age})` : '';
                                    return `<span title="${escHtml(s.full_name)}${ageStr}" style="display:block;padding:3px 8px;border-radius:6px;background:${bg};color:${color};border:1px solid ${border};font-size:.72rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:2px 0;cursor:default;">${escHtml(s.full_name)}${ageStr}</span>`;
                                })();
                            }).join('');
                        }
                        html += `<td style="${tdStyle}">${cell}</td>`;
                    });
                    html += '</tr>';
                });

                html += '</tbody></table>';
                loading.classList.add('hidden');
                wrap.innerHTML = html;
                wrap.classList.remove('hidden');

                // ── Tooltip no clique (nome completo para chips truncados) ──
                // Usa delegação no scrollDiv para não acumular listeners a cada abertura
                const scrollDiv = modal.querySelector('div[style*="overflow"]');
                if (scrollDiv && !scrollDiv._gradeTipBound) {
                    scrollDiv._gradeTipBound = true;
                    scrollDiv.addEventListener('click', function (e) {
                        const chip = e.target.closest('span[title]');
                        // Remove tooltip existente
                        document.getElementById('fl-grade-tip')?.remove();
                        if (!chip) return;
                        e.stopPropagation();

                        const tip = document.createElement('div');
                        tip.id = 'fl-grade-tip';
                        tip.textContent = chip.getAttribute('title');
                        tip.style.cssText = [
                            'position:fixed',
                            'background:#0f172a',
                            'color:#f8fafc',
                            'padding:8px 14px',
                            'border-radius:10px',
                            'font-size:.82rem',
                            'font-weight:600',
                            'z-index:9999',
                            'pointer-events:none',
                            'border:1px solid rgba(255,255,255,.2)',
                            'box-shadow:0 8px 24px rgba(0,0,0,.6)',
                            'max-width:260px',
                            'line-height:1.4',
                            'word-break:break-word',
                            'animation:tipIn .15s ease',
                        ].join(';');
                        document.body.appendChild(tip);

                        // Posiciona abaixo do chip, ajustando para não sair da tela
                        const rect = chip.getBoundingClientRect();
                        let top  = rect.bottom + 8;
                        let left = rect.left;
                        if (top  + 80  > window.innerHeight) top  = rect.top - tip.offsetHeight - 8;
                        if (left + 268 > window.innerWidth)  left = window.innerWidth - 272;
                        if (left < 4) left = 4;
                        tip.style.top  = top  + 'px';
                        tip.style.left = left + 'px';

                        // Some no próximo clique em qualquer lugar
                        setTimeout(() => {
                            document.addEventListener('click', () => document.getElementById('fl-grade-tip')?.remove(), { once: true });
                        }, 10);
                    });
                }
            } catch(e) {
                loading.innerHTML = `<span style="color:#ef4444;">Erro ao carregar: ${escHtml(e.message)}</span>`;
            }
        });

        document.getElementById('btn-close-grade').addEventListener('click', () => {
            document.getElementById('grade-modal').classList.add('hidden');
        });
        document.getElementById('grade-modal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('grade-modal'))
                document.getElementById('grade-modal').classList.add('hidden');
        });

        // ── Modal Registros de Carga (PSE Viewer) ──────────────────
        let _appCargaSelectedPlanId = null;
        let _appCargaSelectedPlanName = '';

        document.getElementById('btn-open-carga-records').addEventListener('click', async () => {
            const modal     = document.getElementById('carga-records-modal');
            const plansList = document.getElementById('app-carga-plans-list');
            const title     = document.getElementById('app-carga-records-title');
            const loading   = document.getElementById('app-carga-records-loading');
            const table     = document.getElementById('app-carga-records-table');
            const btnRef    = document.getElementById('btn-app-carga-refresh');

            modal.classList.remove('hidden');
            plansList.innerHTML = '<span style="color:var(--text-muted);font-size:.85rem;">Carregando treinos...</span>';
            title.textContent = 'Selecione um treino acima';
            title.style.color = 'var(--text-muted)';
            btnRef.style.display = 'none';
            loading.classList.add('hidden');
            table.innerHTML = '';

            try {
                const plans = await window.FLApi.Trainings.getAll();
                if (!plans.length) {
                    plansList.innerHTML = '<span style="color:var(--text-muted);font-size:.85rem;">Nenhum treino cadastrado.</span>';
                    return;
                }
                plansList.innerHTML = plans.map(p => `
                    <button class="btn btn-secondary app-carga-plan-btn" data-id="${p.id}"
                        style="padding:10px 18px;border-radius:10px;font-weight:600;font-size:.85rem;">
                        ${escHtml(p.title)}
                    </button>`).join('');

                plansList.querySelectorAll('.app-carga-plan-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        plansList.querySelectorAll('.app-carga-plan-btn').forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        _appCargaSelectedPlanId = btn.dataset.id;
                        _appCargaSelectedPlanName = btn.textContent.trim();
                        loadAppCargaRecords(_appCargaSelectedPlanId, _appCargaSelectedPlanName);
                    });
                });
            } catch (err) {
                plansList.innerHTML = `<span style="color:#ef4444;font-size:.85rem;">Erro: ${escHtml(err.message)}</span>`;
            }
        });

        const closeCargaRecordsModal = () => {
            document.getElementById('carga-records-modal').classList.add('hidden');
        };
        document.getElementById('btn-close-carga-records').addEventListener('click', closeCargaRecordsModal);
        document.getElementById('carga-records-modal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('carga-records-modal'))
                closeCargaRecordsModal();
        });

        document.getElementById('btn-app-carga-refresh').addEventListener('click', () => {
            if (_appCargaSelectedPlanId) loadAppCargaRecords(_appCargaSelectedPlanId);
        });

        async function loadAppCargaRecords(planId, planName) {
            const title   = document.getElementById('app-carga-records-title');
            const loading = document.getElementById('app-carga-records-loading');
            const table   = document.getElementById('app-carga-records-table');
            const btnRef  = document.getElementById('btn-app-carga-refresh');

            if (planName) _appCargaSelectedPlanName = planName;
            const currentPlanName = _appCargaSelectedPlanName || 'Plano';

            title.textContent = `Registros — ${currentPlanName}`;
            title.style.color = 'var(--text-main)';
            btnRef.style.display = '';
            loading.classList.remove('hidden');
            table.innerHTML = '';

            try {
                const records = await window.FLApi.CargaRegistros.getByPlan(planId);
                loading.classList.add('hidden');

                const count = records.length;
                let avgStr = '-';
                if (count > 0) {
                    const sum = records.reduce((acc, r) => acc + r.pse_value, 0);
                    avgStr = (sum / count).toFixed(1);
                }

                title.innerHTML = `
                    <div style="display:inline-flex; align-items:center; gap:8px; vertical-align:middle;">
                        <span>Registros — ${escHtml(currentPlanName)}</span>
                        <span class="badge" style="font-size:0.75rem; padding:3px 10px; background:rgba(14,165,233,0.15); color:#38bdf8; border:1px solid rgba(14,165,233,0.3); font-weight:700; border-radius:20px; display:inline-flex; align-items:center; gap:4px;"><i class="fa-solid fa-users" style="font-size:0.7rem;"></i> ${count} registros</span>
                        <span class="badge" style="font-size:0.75rem; padding:3px 10px; background:rgba(167,139,250,0.15); color:#c084fc; border:1px solid rgba(167,139,250,0.3); font-weight:700; border-radius:20px; display:inline-flex; align-items:center; gap:4px;"><i class="fa-solid fa-chart-simple" style="font-size:0.7rem;"></i> Média: ${avgStr}</span>
                    </div>
                `;

                if (!records.length) {
                    table.innerHTML = '<p style="color:var(--text-muted);font-size:.88rem;text-align:center;padding:20px 0;">Nenhum registro para este plano.</p>';
                    return;
                }

                table.innerHTML = records.map(r => {
                    const pse   = r.pse_value;
                    const color = PSE_COLORS[pse] || '#94a3b8';
                    const label = PSE_LABELS[pse] || '';
                    const dt    = new Date(r.recorded_at).toLocaleString('pt-BR');
                    return `
                    <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;
                                background:rgba(255,255,255,.04);border-radius:10px;padding:12px 16px;
                                border-left:4px solid ${color};">
                        <div style="flex:1;min-width:120px;font-weight:600;color:var(--text-primary);">${escHtml(r.student_name)}</div>
                        <div style="display:flex;align-items:center;gap:8px;">
                            <span style="background:${color}22;color:${color};border-radius:20px;
                                         padding:3px 12px;font-size:.82rem;font-weight:700;">PSE ${pse}</span>
                            <span style="color:${color};font-size:.82rem;">${label}</span>
                        </div>
                        ${r.session_label ? `<span style="font-size:.78rem;color:var(--text-muted);"><i class="fa-solid fa-clock"></i> ${escHtml(r.session_label)}</span>` : ''}
                        <span style="font-size:.78rem;color:var(--text-muted);margin-left:auto;">${dt}</span>
                    </div>`;
                }).join('');

            } catch (err) {
                loading.classList.add('hidden');
                table.innerHTML = `<p style="color:#ef4444;text-align:center;padding:20px 0;">Erro: ${escHtml(err.message)}</p>`;
            }
        }
        document.getElementById('btn-close-metodologia').addEventListener('click', () => {
            document.getElementById('metodologia-modal').classList.add('hidden');
        });
        document.getElementById('metodologia-modal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('metodologia-modal'))
                document.getElementById('metodologia-modal').classList.add('hidden');
        });

        document.getElementById('btn-close-drill-info').addEventListener('click', () => {
            document.getElementById('drill-info-modal').classList.add('hidden');
        });
        document.getElementById('drill-info-modal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('drill-info-modal'))
                document.getElementById('drill-info-modal').classList.add('hidden');
        });

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

        stopSimulation();
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

        // Map Cones (skip legacy bench sentinel position x=5, y=10)
        conesContainer.innerHTML = '';
        if (drill.setup.cones) {
            drill.setup.cones.forEach(conePos => {
                if (conePos.x === 5 && conePos.y === 10) return;
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

    function stopSimulation() {
        animationSequenceId++;
        Object.values(actorsObj).forEach(el => { el.style.display = 'none'; });
        conesContainer.innerHTML = '';
        pitchHeaderCaption.innerHTML = '<p>Aguardando seleção do exercício...</p>';
        currentDrill = null;
    }

    function switchMode(mode) {
        appMode = mode;
        stopSimulation();
        if (btnModeWeek) btnModeWeek.classList.toggle('active', mode === 'week');

        if (navFundamentals) navFundamentals.classList.toggle('hidden', mode !== 'fundamentals');
        navWeekPlans.classList.toggle('hidden', mode !== 'week');

        if (fundamentalsPanel) fundamentalsPanel.classList.toggle('hidden', mode !== 'fundamentals');
        weekPanel.classList.toggle('hidden', mode !== 'week');
        if (pranchetaPanel) pranchetaPanel.classList.toggle('hidden', mode !== 'prancheta');

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

        // Show Carga / Mensagem / Técnica / Metodologia buttons only in week mode
        document.getElementById('btn-carga').classList.toggle('hidden', mode !== 'week');
        document.getElementById('btn-mensagem').classList.toggle('hidden', mode !== 'week');
        document.getElementById('btn-tecnica').classList.toggle('hidden', mode !== 'week');
        document.getElementById('btn-metodologia').classList.toggle('hidden', mode !== 'week');

        if (mode === 'week') {
            fundTitle.textContent = 'Treino da Semana';
            fundDesc.textContent = 'Selecione um treino no menu lateral.';
            btnTechBase.classList.add('hidden');
            workspace.classList.remove('hidden');
            loadVisibleTrainings();
        } else if (mode === 'fundamentals') {
            if (currentFundamental) {
                fundTitle.textContent = currentFundamental.title;
            } else {
                fundTitle.textContent = 'Selecione um Fundamento';
                fundDesc.textContent = 'Escolha uma opção no menu lateral para visualizar os exercícios de grupo.';
            }
        }
    }

    async function loadVisibleTrainings() {
        weekPlansNavList.innerHTML = '<p style="color:var(--text-muted);font-size:.8rem;padding:4px 0">Carregando...</p>';
        let trainings;
        try {
            trainings = await window.FLApi.Trainings.getVisible();
        } catch (err) {
            weekPlansNavList.innerHTML = '<p style="color:#ef4444;font-size:.8rem">Erro ao carregar treinos.</p>';
            return;
        }
        if (!trainings.length) {
            weekPlansNavList.innerHTML = '<p style="color:var(--text-muted);font-size:.8rem">Nenhum treino visível configurado.</p>';
            return;
        }
        weekPlansNavList.innerHTML = trainings.map(t => `
            <button class="week-plan-nav-btn ${t.id === selectedPlanId ? 'active' : ''}" data-plan-id="${t.id}">
                <i class="fa-solid fa-calendar-check"></i>
                <div>
                    <div class="week-plan-nav-title">${escHtml(t.title)}</div>
                    <div class="week-plan-nav-meta">${t.sessions ? t.sessions.length : 0} sessões</div>
                </div>
            </button>`).join('');

        weekPlansNavList.querySelectorAll('.week-plan-nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const training = trainings.find(t => t.id === btn.dataset.planId);
                if (training) {
                    selectTraining(training);
                    closeMobileSidebar();
                }
            });
        });
    }

    function selectTraining(training) {
        _currentTrainingData = training;
        selectedPlanId = training.id;
        // Update active state in nav
        weekPlansNavList.querySelectorAll('.week-plan-nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.planId === training.id);
        });
        fundDesc.textContent = `${training.sessions ? training.sessions.length : 0} sessões`;
        btnTechBase.classList.add('hidden');
        workspace.classList.remove('hidden');
        weekPanel.classList.remove('hidden');
        if (fundamentalsPanel) fundamentalsPanel.classList.add('hidden');
        weekPlanName.textContent = training.title;
        weekSessionCount.textContent = `${training.sessions ? training.sessions.length : 0} sessões`;
        if (!training.sessions || !training.sessions.length) {
            weekDrillsList.innerHTML = '<p style="color:var(--text-muted);font-size:.88rem;padding:16px 0">Nenhuma sessão neste treino.</p>';
        } else {
            renderTrainingSessions(training.sessions);
        }
        // Update mensagem/técnica button state from cached training data
        const btnMsg = document.getElementById('btn-mensagem');
        const btnTec = document.getElementById('btn-tecnica');
        btnMsg.disabled = !(training.mensagem_text && training.mensagem_text.trim());
        btnTec.disabled = !(training.destaque_text && training.destaque_text.trim());
    }

    function renderTrainingSessions(sessions) {
        weekDrillsList.innerHTML = sessions.map((s, i) => {
            const name = escHtml(s.name || s.title || `Sessão ${i + 1}`);
            const desc = (s.description || '').trim();
            const hasdesc = desc ? `<span class="session-has-desc-badge" title="Ver descrição">!</span>` : '';
            return `
                <div class="week-session-card" data-idx="${i}">
                    ${hasdesc}
                    <div class="week-session-num">Sessão ${i + 1}</div>
                    <div class="week-session-title">${name}</div>
                    <div class="week-session-inline-desc" style="max-height:0;overflow:hidden;transition:max-height .35s ease,margin-top .35s ease,opacity .35s ease;opacity:0;font-size:.82rem;line-height:1.6;color:var(--text-muted);white-space:pre-wrap;">${escHtml(desc)}</div>
                </div>`;
        }).join('');

        weekDrillsList.querySelectorAll('.week-session-card').forEach(card => {
            card.addEventListener('click', () => {
                const isActive = card.classList.contains('active');
                // Collapse all
                document.querySelectorAll('.week-session-card').forEach(c => {
                    c.classList.remove('active');
                    const d = c.querySelector('.week-session-inline-desc');
                    if (d) { d.style.maxHeight = '0'; d.style.opacity = '0'; d.style.marginTop = '0'; }
                });
                // Expand clicked (toggle)
                if (!isActive) {
                    card.classList.add('active');
                    const desc = card.querySelector('.week-session-inline-desc');
                    if (desc && desc.textContent.trim()) {
                        desc.style.maxHeight = '400px';
                        desc.style.opacity = '1';
                        desc.style.marginTop = '8px';
                    }
                }
            });
        });
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

    // ==========================================================
    // CARGA PSE — multi-step modal
    // ==========================================================

    const PSE_COLORS = ['#94a3b8','#22c55e','#22c55e','#84cc16','#84cc16','#eab308','#eab308','#f97316','#f97316','#ef4444','#7c3aed'];
    const PSE_LABELS = ['Repouso','Muito Leve','Muito Leve','Leve','Leve','Moderado','Moderado','Intenso','Intenso','Muito Intenso','Máximo'];

    // current state
    let _cargaStudent    = null; // { id, name }
    let _cargaSessionLbl = '';
    let _cargaPse        = null;
    let _cargaSource     = null; // 'sessao' | 'cadastro'

    function cargaShowStep(step) {
        ['carga-step-source','carga-step-students','carga-step-pse','carga-step-ok']
            .forEach(id => document.getElementById(id).classList.add('hidden'));
        document.getElementById(step).classList.remove('hidden');
    }

    function cargaCurrentSessionLabel() {
        const DAYS_MAP = { 1:'Segunda', 2:'Terça', 3:'Quarta', 4:'Quinta', 5:'Sexta', 6:'Sábado' };
        const now = new Date();
        const jsDay = now.getDay(); // 0=Sun
        const flDay = jsDay === 0 ? null : jsDay; // 0=Dom → sem aula
        if (!flDay) return null;
        const hour = `${String(now.getHours()).padStart(2,'0')}:00:00`;
        return { day: flDay, time: hour, label: `${DAYS_MAP[flDay]} ${hour.substring(0,5)}` };
    }

    let _cargaAllStudents = [];

    function renderCargaStudentList(students) {
        _cargaAllStudents = students;
        document.getElementById('carga-students-loading').classList.add('hidden');
        const searchWrap = document.getElementById('carga-search-wrap');
        const searchEl   = document.getElementById('carga-search');
        searchEl.value   = '';
        searchWrap.classList.toggle('hidden', students.length === 0);
        _renderCargaStudentRows(students);
    }

    function _renderCargaStudentRows(students) {
        const list = document.getElementById('carga-students-list');
        if (!students.length) {
            list.innerHTML = '<p style="color:var(--text-muted);font-size:.88rem;padding:12px 0;">Nenhum aluno encontrado.</p>';
            return;
        }
        list.innerHTML = students.map(s => {
            const isPre = s.student_type === 'pre-cadastro';
            const badge = isPre ? '<span style="font-size:.65rem;font-weight:700;padding:2px 6px;border-radius:4px;background:rgba(251,191,36,.15);color:#fbbf24;border:1px solid rgba(251,191,36,.35);margin-left:6px;">Pré</span>' : '';
            return `<button class="btn-secondary carga-student-btn"
                data-id="${escHtml(s.id || '')}" data-name="${escHtml(s.full_name)}"
                style="text-align:left;padding:12px 14px;border-radius:10px;font-size:.92rem;display:flex;align-items:center;">
                <i class="fa-solid fa-user" style="color:#a78bfa;margin-right:8px;flex-shrink:0;"></i>
                ${escHtml(s.full_name)}${badge}
            </button>`;
        }).join('');
        list.querySelectorAll('.carga-student-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                _cargaStudent = { id: btn.dataset.id, name: btn.dataset.name };
                _cargaPse = null;
                document.getElementById('carga-pse-student-name').textContent = _cargaStudent.name;
                document.getElementById('carga-pse-selected').textContent = '';
                document.getElementById('btn-carga-save').disabled = true;
                cargaShowStep('carga-step-pse');
            });
        });
    }

    function initCarga() {
        const cargaModal = document.getElementById('carga-modal');
        if (!cargaModal) return;

        // Build PSE grid (0–10)
        const grid = document.getElementById('carga-pse-grid');
        grid.innerHTML = Array.from({length:11},(_,v) => `
            <button class="pse-btn" data-val="${v}"
                style="padding:10px 0;border-radius:8px;font-weight:800;font-size:1rem;
                       background:rgba(255,255,255,.06);border:2px solid transparent;
                       color:${PSE_COLORS[v]};cursor:pointer;transition:.15s;">
                ${v}
            </button>`).join('');
        grid.querySelectorAll('.pse-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                _cargaPse = parseInt(btn.dataset.val);
                grid.querySelectorAll('.pse-btn').forEach(b => b.style.borderColor = 'transparent');
                btn.style.borderColor = PSE_COLORS[_cargaPse];
                document.getElementById('carga-pse-selected').innerHTML =
                    `<span style="color:${PSE_COLORS[_cargaPse]}">PSE ${_cargaPse} · ${PSE_LABELS[_cargaPse]}</span>`;
                document.getElementById('btn-carga-save').disabled = false;
            });
        });

        // Open modal
        document.getElementById('btn-carga').addEventListener('click', () => {
            if (!selectedPlanId) {
                alert('Selecione um plano da semana antes de registrar a carga.');
                return;
            }
            _cargaStudent = null; _cargaPse = null; _cargaSource = null;
            // Set session label
            const sess = cargaCurrentSessionLabel();
            document.getElementById('carga-sessao-label').textContent = sess ? sess.label : 'Sem aula agora';
            cargaShowStep('carga-step-source');
            cargaModal.classList.remove('hidden');
        });

        // Source: Sessão Atual
        document.getElementById('btn-carga-sessao').addEventListener('click', async () => {
            _cargaSource = 'sessao';
            const sess = cargaCurrentSessionLabel();
            document.getElementById('carga-students-title').textContent = sess ? `Sessão: ${sess.label}` : 'Sessão Atual';
            _cargaSessionLbl = sess ? sess.label : '';
            document.getElementById('carga-students-list').innerHTML = '';
            document.getElementById('carga-students-loading').classList.remove('hidden');
            cargaShowStep('carga-step-students');
            try {
                let students = [];
                if (sess) students = await window.FLApi.FLGestao.getSessionStudents(sess.day, sess.time);
                renderCargaStudentList(students);
            } catch(e) {
                document.getElementById('carga-students-loading').classList.add('hidden');
                document.getElementById('carga-students-list').innerHTML =
                    `<p style="color:#ef4444;font-size:.88rem;">Erro ao carregar: ${escHtml(e.message)}</p>`;
            }
        });

        // Source: Cadastro
        document.getElementById('btn-carga-cadastro').addEventListener('click', async () => {
            _cargaSource = 'cadastro';
            _cargaSessionLbl = '';
            document.getElementById('carga-students-title').textContent = 'Todos os Alunos';
            document.getElementById('carga-students-list').innerHTML = '';
            document.getElementById('carga-students-loading').classList.remove('hidden');
            cargaShowStep('carga-step-students');
            try {
                const students = await window.FLApi.FLGestao.getAllStudents();
                renderCargaStudentList(students);
            } catch(e) {
                document.getElementById('carga-students-loading').classList.add('hidden');
                document.getElementById('carga-students-list').innerHTML =
                    `<p style="color:#ef4444;font-size:.88rem;">Erro ao carregar: ${escHtml(e.message)}</p>`;
            }
        });

        // Search
        document.getElementById('carga-search').addEventListener('input', e => {
            const term = e.target.value.toLowerCase().trim();
            const filtered = term
                ? _cargaAllStudents.filter(s => s.full_name.toLowerCase().includes(term))
                : _cargaAllStudents;
            _renderCargaStudentRows(filtered);
        });

        // Back buttons
        document.getElementById('btn-carga-back-source').addEventListener('click', () => cargaShowStep('carga-step-source'));
        document.getElementById('btn-carga-back-students').addEventListener('click', () => cargaShowStep('carga-step-students'));

        // Save
        document.getElementById('btn-carga-save').addEventListener('click', async () => {
            if (!_cargaStudent || _cargaPse === null || !selectedPlanId) return;
            const btn = document.getElementById('btn-carga-save');
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';
            try {
                await window.FLApi.CargaRegistros.create({
                    training_id:   selectedPlanId,
                    student_id:    _cargaStudent.id || null,
                    student_name:  _cargaStudent.name,
                    pse_value:     _cargaPse,
                    session_label: _cargaSessionLbl || null,
                });
                document.getElementById('carga-ok-text').textContent =
                    `${_cargaStudent.name} · PSE ${_cargaPse} · ${PSE_LABELS[_cargaPse]}`;
                cargaShowStep('carga-step-ok');
            } catch(e) {
                alert('Erro ao salvar: ' + e.message);
            } finally {
                btn.disabled = false;
                btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Salvar';
            }
        });

        // OK step
        document.getElementById('btn-carga-outro').addEventListener('click', () => {
            _cargaStudent = null; _cargaPse = null;
            cargaShowStep('carga-step-source');
        });
        document.getElementById('btn-carga-fechar').addEventListener('click', () => cargaModal.classList.add('hidden'));

        // Close
        document.getElementById('btn-close-carga').addEventListener('click', () => cargaModal.classList.add('hidden'));
        cargaModal.addEventListener('click', e => { if (e.target === cargaModal) cargaModal.classList.add('hidden'); });
    }

    function calcAge(birthDate) {
        if (!birthDate) return null;
        const today = new Date();
        const dob   = new Date(birthDate);
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
        return age;
    }

    function escHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // Run
    init();

    // ── Camisetas Module ────────────────────────────────────────────────────────
    (function () {
        const STORAGE_KEY = 'fl_camisetas_v1';

        const GROUPS = [
            {
                label: 'Camiseta Infantil',
                icon:  'fa-child',
                color: '#34d399',
                items: ['P', 'M', 'G'],
            },
            {
                label: 'Camiseta Adulto',
                icon:  'fa-person',
                color: '#60a5fa',
                items: ['PP', 'P', 'M', 'G', 'GG'],
            },
            {
                label: 'Moletom Infantil',
                icon:  'fa-child-reaching',
                color: '#f59e0b',
                items: ['10', '12', '14', '16'],
            },
            {
                label: 'Moletom Adulto',
                icon:  'fa-user',
                color: '#a78bfa',
                items: ['P', 'M', 'G', 'GG'],
            },
        ];

        let _adjusting = false;

        function _loadData() {
            try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
            catch (_) { return {}; }
        }

        function _saveData(data) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }

        function _slotKey(groupIdx, size) {
            return `g${groupIdx}_${size}`;
        }

        function _render() {
            const body = document.getElementById('camisetas-body');
            if (!body) return;
            const data = _loadData();

            body.innerHTML = GROUPS.map((g, gi) => {
                const rows = g.items.map(size => {
                    const key = _slotKey(gi, size);
                    const qty = data[key] !== undefined ? data[key] : 0;
                    return `
                        <div style="display:flex;align-items:center;gap:10px;padding:8px 10px;
                            background:rgba(255,255,255,.04);border-radius:8px;border:1px solid var(--glass-border);">
                            <span style="font-size:.82rem;font-weight:600;color:var(--text-secondary);
                                min-width:32px;text-align:center;">${size}</span>
                            <button class="cam-btn-minus btn-icon" data-key="${key}"
                                style="flex-shrink:0;color:var(--acc-danger);width:28px;height:28px;font-size:.85rem;">
                                <i class="fa-solid fa-minus"></i>
                            </button>
                            <input type="number" class="cam-input form-input" data-key="${key}"
                                value="${qty}" min="0"
                                style="flex:1;text-align:center;font-size:1rem;font-weight:700;
                                    padding:6px 8px;${_adjusting ? '' : 'pointer-events:none;background:transparent;border-color:transparent;'}">
                        </div>`;
                }).join('');

                return `
                    <div>
                        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
                            <i class="fa-solid ${g.icon}" style="color:${g.color};font-size:.95rem;"></i>
                            <span style="font-size:.88rem;font-weight:700;color:${g.color};text-transform:uppercase;
                                letter-spacing:.04em;">${g.label}</span>
                        </div>
                        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px;">
                            ${rows}
                        </div>
                    </div>`;
            }).join('');

            // Wiring: minus buttons
            body.querySelectorAll('.cam-btn-minus').forEach(btn => {
                btn.addEventListener('click', () => {
                    const d = _loadData();
                    const k = btn.dataset.key;
                    d[k] = Math.max(0, (d[k] || 0) - 1);
                    _saveData(d);
                    // update input without full re-render
                    const inp = body.querySelector(`.cam-input[data-key="${k}"]`);
                    if (inp) inp.value = d[k];
                });
            });

            // Wiring: input changes
            body.querySelectorAll('.cam-input').forEach(inp => {
                inp.addEventListener('change', () => {
                    const d = _loadData();
                    d[inp.dataset.key] = Math.max(0, parseInt(inp.value) || 0);
                    inp.value = d[inp.dataset.key];
                    _saveData(d);
                });
            });
        }

        function _updateAjustarBtn() {
            const btn = document.getElementById('btn-camisetas-ajustar');
            if (!btn) return;
            if (_adjusting) {
                btn.innerHTML = '<i class="fa-solid fa-check"></i> Concluir';
                btn.style.background = 'rgba(16,185,129,.15)';
                btn.style.borderColor = 'rgba(16,185,129,.4)';
                btn.style.color = '#34d399';
            } else {
                btn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Ajustar quantidades';
                btn.style.background = '';
                btn.style.borderColor = '';
                btn.style.color = '';
            }
        }

        // Open modal
        document.getElementById('btn-open-camisetas')?.addEventListener('click', () => {
            _adjusting = false;
            _render();
            _updateAjustarBtn();
            document.getElementById('camisetas-modal').classList.remove('hidden');
        });

        // Close modal
        document.getElementById('btn-close-camisetas')?.addEventListener('click', () => {
            document.getElementById('camisetas-modal').classList.add('hidden');
        });
        document.getElementById('camisetas-modal')?.addEventListener('click', (e) => {
            if (e.target === document.getElementById('camisetas-modal'))
                document.getElementById('camisetas-modal').classList.add('hidden');
        });

        // Toggle ajustar
        document.getElementById('btn-camisetas-ajustar')?.addEventListener('click', () => {
            _adjusting = !_adjusting;
            _updateAjustarBtn();
            _render();
        });
    })();

});
