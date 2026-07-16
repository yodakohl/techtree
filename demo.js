document.addEventListener('DOMContentLoaded', async () => {
    const canvas = document.getElementById('documentary-canvas');
    const context = canvas.getContext('2d');
    const stageEl = document.querySelector('.documentary-stage');
    const titleEl = document.getElementById('documentary-title');
    const kickerEl = document.getElementById('documentary-kicker');
    const captionEl = document.getElementById('documentary-caption');
    const metaEl = document.getElementById('documentary-meta');
    const sceneListEl = document.getElementById('documentary-scenes');
    const progressEl = document.getElementById('documentary-progress');
    const progressTrackEl = progressEl.parentElement;
    const targetInput = document.getElementById('documentary-target');
    const targetOptionsEl = document.getElementById('documentary-target-options');
    const previousButton = document.getElementById('documentary-previous');
    const playToggle = document.getElementById('documentary-play-toggle');
    const nextButton = document.getElementById('documentary-next');
    const statusEl = document.getElementById('documentary-status');
    const presetButtons = [...document.querySelectorAll('[data-documentary-target]')];
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sceneDuration = 4400;
    const maxCanvasPixels = 8_000_000;

    const eraRank = {
        Ancient: 0,
        Classical: 1,
        Medieval: 2,
        Renaissance: 3,
        Industrial: 4,
        Modern: 5,
        Future: 6
    };

    const eraPalette = {
        Ancient: ['#b46a34', '#f0b36d', '#2d1710'],
        Classical: ['#4e93b8', '#a7d1df', '#101f2c'],
        Medieval: ['#846d39', '#dfc47b', '#1d1c16'],
        Renaissance: ['#4c9c73', '#b8dfb9', '#101f18'],
        Industrial: ['#d9953b', '#f4c06b', '#211711'],
        Modern: ['#62c9c3', '#d9fbf4', '#071a20'],
        Future: ['#b486e8', '#f0d7ff', '#140d22'],
        Unknown: ['#7c8b95', '#d5dde1', '#111820']
    };

    const storyCuts = {
        crispr_gene_editing: [
            {
                id: 'dna_structure',
                title: 'Read the Code',
                caption: 'The story starts when DNA stops being an invisible substance and becomes a readable structure.',
                visual: 'dna_read'
            },
            {
                id: 'dna_sequencing',
                title: 'Make Biology Legible',
                caption: 'Sequencing turns living systems into information that can be compared, searched, and engineered.',
                visual: 'sequencing'
            },
            {
                id: 'crispr_adaptive_immunity',
                title: 'Find the Memory',
                caption: 'A bacterial immune trick reveals that cells can keep molecular mugshots of viral invaders.',
                visual: 'immune_archive'
            },
            {
                id: 'cas9_programmable_nuclease',
                title: 'Aim the Scissors',
                caption: 'Cas9 becomes programmable: a guide RNA points the cut to a chosen address in the genome.',
                visual: 'cas_cut'
            },
            {
                id: 'crispr_delivery_aav_lnp_rnp',
                title: 'Enter the Cell',
                caption: 'A brilliant edit is useless until delivery systems can carry the editor into the right tissue.',
                visual: 'cell_delivery'
            },
            {
                id: 'casgevy_exa_cel',
                title: 'Reach the Clinic',
                caption: 'The path arrives at an approved therapy: a dependency stack becoming medicine.',
                visual: 'clinic'
            }
        ],
        high_na_euv_lithography: [
            {
                id: 'semiconductors',
                title: 'Teach Matter to Switch',
                caption: 'The chip story begins when materials can be made to conduct, block, and control current.',
                visual: 'crystal'
            },
            {
                id: 'transistors',
                title: 'Shrink the Switch',
                caption: 'Transistors make logic physical: tiny controllable gates replacing bulky electrical hardware.',
                visual: 'transistor'
            },
            {
                id: 'photolithography',
                title: 'Print with Light',
                caption: 'Circuit patterns move from hand wiring to optical projection onto prepared wafers.',
                visual: 'wafer_print'
            },
            {
                id: 'semiconductor_photomasks',
                title: 'Make the Stencil',
                caption: 'Photomasks become the master negatives that transfer intricate circuit geometry.',
                visual: 'mask'
            },
            {
                id: 'euv_lithography',
                title: 'Burn a New Sun',
                caption: 'Extreme ultraviolet lithography turns laser-produced plasma into a manufacturing tool.',
                visual: 'euv_plasma'
            },
            {
                id: 'high_na_euv_lithography',
                title: 'Resolve the Future',
                caption: 'High-NA EUV tightens the optical system so the next generation of chips can be printed.',
                visual: 'high_na'
            }
        ],
        retrieval_augmented_generation: [
            {
                id: 'database_management_systems',
                title: 'Store the Record',
                caption: 'Before a model can answer with evidence, knowledge has to live somewhere durable.',
                visual: 'archive'
            },
            {
                id: 'search_engines',
                title: 'Retrieve the Needle',
                caption: 'Search turns a pile of documents into a ranked path toward relevant information.',
                visual: 'search'
            },
            {
                id: 'machine_learning_early_algorithms',
                title: 'Learn the Pattern',
                caption: 'Machine learning gives systems a way to generalize instead of following only fixed rules.',
                visual: 'pattern'
            },
            {
                id: 'transformer_architectures',
                title: 'Attend to Context',
                caption: 'Transformers let a model weigh relationships across long spans of text.',
                visual: 'attention'
            },
            {
                id: 'large_language_models',
                title: 'Speak in Context',
                caption: 'Large language models make fluent synthesis possible, but fluency alone is not grounding.',
                visual: 'model'
            },
            {
                id: 'retrieval_augmented_generation',
                title: 'Ground the Answer',
                caption: 'RAG joins retrieval with generation: first find the evidence, then write with it in view.',
                visual: 'rag'
            }
        ],
        long_duration_energy_storage: [
            {
                id: 'electricity',
                title: 'Name the Force',
                caption: 'Electricity becomes a measurable phenomenon before it becomes infrastructure.',
                visual: 'spark'
            },
            {
                id: 'electric_generators_dynamos',
                title: 'Turn Motion into Current',
                caption: 'Generators make electricity produceable at scale instead of merely observable.',
                visual: 'generator'
            },
            {
                id: 'electrical_grid_early_distribution',
                title: 'Wire the City',
                caption: 'The grid changes electricity from a device into a shared system.',
                visual: 'grid'
            },
            {
                id: 'renewable_energy_systems',
                title: 'Harvest the Weather',
                caption: 'Solar and wind add clean power, but also create a new timing problem.',
                visual: 'renewables'
            },
            {
                id: 'grid_scale_battery_storage',
                title: 'Buffer the Peaks',
                caption: 'Grid batteries absorb short surges and smooth fast swings in supply and demand.',
                visual: 'battery'
            },
            {
                id: 'long_duration_energy_storage',
                title: 'Carry Power Through Time',
                caption: 'Long-duration storage is the missing bridge between renewable abundance and dark, still hours.',
                visual: 'duration'
            }
        ]
    };

    const particles = Array.from({ length: 86 }, (_, index) => ({
        x: ((index * 73) % 997) / 997,
        y: ((index * 131) % 991) / 991,
        r: 0.6 + (index % 5) * 0.32,
        phase: index * 0.57,
        speed: 0.00007 + (index % 7) * 0.000011
    }));

    let techData = [];
    let graph = null;
    let targetId = 'crispr_gene_editing';
    let currentTrace = null;
    let scenes = [];
    let activeIndex = 0;
    let startedAt = performance.now();
    let pausedAt = null;
    let running = !reducedMotionQuery.matches;
    let playbackPreferenceOverridden = false;
    let animationId = null;
    let resizeAnimationId = null;
    let hiddenAt = null;
    let lastRenderedIndex = -1;
    let lastProgressPercent = -1;
    let lastProgressScene = -1;
    let canvasCssWidth = 0;
    let canvasCssHeight = 0;
    let canvasScale = 0;
    let resizeObserver = null;

    function setStatus(text, state = '') {
        statusEl.textContent = text;
        statusEl.classList.toggle('is-error', state === 'error');
        statusEl.setAttribute('aria-live', state === 'error' ? 'assertive' : 'polite');
    }

    function traceStatus(trace = currentTrace) {
        if (!trace) return '';
        return `${trace.target.name} · ${trace.ids.length - 1} prerequisites · ${trace.edges.length} dependency edges`;
    }

    function getDependencyEdges(item) {
        if (Array.isArray(item?.dependencyEdges) && item.dependencyEdges.length) {
            return item.dependencyEdges;
        }
        return (item?.prerequisites || []).map(prerequisite => ({
            prerequisite,
            type: 'required',
            confidence: 0.5,
            evidence_level: 'weak_inference',
            note: 'Legacy prerequisite without edge-level metadata.'
        }));
    }

    function getPrerequisiteIds(item) {
        const ids = new Set(item?.prerequisites || []);
        for (const edge of getDependencyEdges(item)) {
            if (edge.prerequisite) ids.add(edge.prerequisite);
        }
        return [...ids];
    }

    function buildGraph(data) {
        const byId = new Map(data.map(item => [item.id, item]));
        const incoming = new Map();
        const dependents = new Map();
        for (const item of data) {
            incoming.set(item.id, []);
            if (!dependents.has(item.id)) dependents.set(item.id, []);
        }
        for (const item of data) {
            for (const edge of getDependencyEdges(item)) {
                if (!edge.prerequisite || !byId.has(edge.prerequisite)) continue;
                incoming.get(item.id).push({ from: edge.prerequisite, to: item.id, edge });
                if (!dependents.has(edge.prerequisite)) dependents.set(edge.prerequisite, []);
                dependents.get(edge.prerequisite).push(item.id);
            }
        }
        return { byId, incoming, dependents };
    }

    function formatDate(value) {
        if (typeof value !== 'number') return 'date unknown';
        if (value < 0) return `${Math.abs(value).toLocaleString()} BCE`;
        return String(value);
    }

    function compareDate(a, b) {
        const dateDiff = (a.firstKnownDate ?? 99999) - (b.firstKnownDate ?? 99999);
        if (dateDiff !== 0) return dateDiff;
        const eraDiff = (eraRank[a.era] ?? 99) - (eraRank[b.era] ?? 99);
        if (eraDiff !== 0) return eraDiff;
        return a.name.localeCompare(b.name);
    }

    function edgeRank(edge) {
        return {
            required: 0,
            enabling: 1,
            commercial_or_scaling_dependency: 2,
            accelerates: 3,
            historical_predecessor: 4,
            common_dependency: 5,
            speculative: 6
        }[edge?.type] ?? 7;
    }

    function hasEdgeSource(edge) {
        return Array.isArray(edge?.sources) && edge.sources.some(source => {
            return Array.isArray(source.supports) && source.supports.includes('edge');
        });
    }

    function parseTargetValue(value) {
        const bracketMatch = String(value || '').match(/\[([^\]]+)\]\s*$/);
        if (bracketMatch && graph?.byId.has(bracketMatch[1])) return bracketMatch[1];
        const normalized = String(value || '').trim().toLowerCase();
        if (!normalized) return null;
        const exact = techData.find(item => item.id.toLowerCase() === normalized || item.name.toLowerCase() === normalized);
        return exact?.id || null;
    }

    function getInitialTarget() {
        const id = new URLSearchParams(window.location.search).get('target');
        return id && graph.byId.has(id) ? id : 'crispr_gene_editing';
    }

    function updateUrl() {
        const params = new URLSearchParams();
        params.set('target', targetId);
        window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
    }

    function buildTrace(id) {
        const target = graph.byId.get(id);
        if (!target) return null;
        const ids = new Set([id]);
        const edges = [];
        const distance = new Map([[id, 0]]);
        const queue = [id];
        for (let queueIndex = 0; queueIndex < queue.length; queueIndex += 1) {
            const current = queue[queueIndex];
            const depth = distance.get(current) || 0;
            for (const entry of graph.incoming.get(current) || []) {
                edges.push(entry);
                if (!ids.has(entry.from)) {
                    ids.add(entry.from);
                    distance.set(entry.from, depth + 1);
                    queue.push(entry.from);
                }
            }
        }
        const edgeByFromTo = new Map(edges.map(entry => [`${entry.from}->${entry.to}`, entry.edge]));
        return {
            target,
            ids: [...ids],
            idSet: ids,
            edges,
            edgeByFromTo,
            distance,
            directEdges: (graph.incoming.get(id) || []).slice().sort((a, b) => {
                const typeDiff = edgeRank(a.edge) - edgeRank(b.edge);
                if (typeDiff !== 0) return typeDiff;
                return (b.edge.confidence || 0) - (a.edge.confidence || 0);
            })
        };
    }

    function longestChainTo(id, trace, memo = new Map()) {
        if (memo.has(id)) return memo.get(id);
        const entries = (graph.incoming.get(id) || [])
            .filter(entry => trace.idSet.has(entry.from));
        if (!entries.length) {
            const base = [id];
            memo.set(id, base);
            return base;
        }
        let best = [id];
        for (const entry of entries) {
            const candidate = [...longestChainTo(entry.from, trace, memo), id];
            if (candidate.length > best.length) best = candidate;
        }
        memo.set(id, best);
        return best;
    }

    function scoreMilestone(id, trace, chainSet, targetField) {
        const item = graph.byId.get(id);
        if (!item || id === trace.target.id) return -Infinity;
        const direct = trace.directEdges.find(entry => entry.from === id);
        let score = chainSet.has(id) ? 80 : 0;
        if (Array.isArray(item.fields) && item.fields.includes(targetField)) score += 90;
        if (direct) score += 80 - edgeRank(direct.edge) * 7 + Math.round((direct.edge.confidence || 0) * 20);
        if (item.reviewStatus === 'source_checked') score += 16;
        if (Array.isArray(item.sources) && item.sources.length) score += 10;
        const targetDate = trace.target.firstKnownDate;
        if (typeof targetDate === 'number' && typeof item.firstKnownDate === 'number') {
            const gap = targetDate - item.firstKnownDate;
            if (gap >= 0 && gap < 160) score += 24;
            if (gap > 1200) score -= 40;
            if (gap < 0) score -= 100;
        }
        return score;
    }

    function compactMilestones(ids, limit) {
        const unique = [...new Set(ids)].filter(Boolean);
        if (unique.length <= limit) return unique;
        const picks = [
            unique[0],
            unique[1],
            unique[Math.floor(unique.length * 0.42)],
            unique[Math.floor(unique.length * 0.68)],
            ...unique.slice(-3)
        ];
        return [...new Set(picks)].filter(Boolean).slice(0, limit);
    }

    function selectMilestones(trace) {
        const targetField = trace.target.fields?.[0] || '';
        const chain = longestChainTo(trace.target.id, trace).filter(id => graph.byId.has(id));
        const chainSet = new Set(chain);
        const targetDate = trace.target.firstKnownDate;
        const ranked = trace.ids
            .filter(id => id !== trace.target.id)
            .filter(id => {
                const item = graph.byId.get(id);
                if (!item) return false;
                if (Array.isArray(item.fields) && item.fields.includes(targetField)) return true;
                if (trace.directEdges.some(entry => entry.from === id)) return true;
                if (typeof targetDate === 'number' && typeof item.firstKnownDate === 'number') {
                    return targetDate - item.firstKnownDate < 400;
                }
                return false;
            })
            .sort((a, b) => scoreMilestone(b, trace, chainSet, targetField) - scoreMilestone(a, trace, chainSet, targetField));
        const relevantChain = chain.filter(id => {
            const item = graph.byId.get(id);
            return item && (Array.isArray(item.fields) && item.fields.includes(targetField));
        });
        const picked = compactMilestones(relevantChain.length ? relevantChain : ranked, 5);
        for (const id of ranked) {
            if (picked.length >= 6) break;
            if (!picked.includes(id)) picked.push(id);
        }
        return [...picked, trace.target.id]
            .filter((id, index, all) => all.indexOf(id) === index)
            .sort((a, b) => compareDate(graph.byId.get(a), graph.byId.get(b)));
    }

    function bestEdgeForMilestone(id, nextId, trace) {
        const direct = trace.edgeByFromTo.get(`${id}->${nextId}`);
        if (direct) return direct;
        const directToTarget = trace.edgeByFromTo.get(`${id}->${trace.target.id}`);
        if (directToTarget) return directToTarget;
        const outgoing = trace.edges.filter(entry => entry.from === id);
        return outgoing.sort((a, b) => edgeRank(a.edge) - edgeRank(b.edge))[0]?.edge || null;
    }

    function classifyScene(item) {
        const text = `${item.id} ${item.name} ${item.description || ''} ${(item.fields || []).join(' ')}`.toLowerCase();
        if (/crispr|gene|dna|rna|genom|cell|protein|biology|therapeutic|sequenc/.test(text)) return 'genome';
        if (/semiconductor|chip|transistor|lithograph|silicon|microprocessor|integrated circuit|memory/.test(text)) return 'chip';
        if (/ai|machine learning|neural|model|retrieval|database|software|computer|internet|network/.test(text)) return 'network';
        if (/energy|grid|electric|battery|solar|wind|nuclear|storage|power/.test(text)) return 'energy';
        if (/space|satellite|rocket|orbit|launch/.test(text)) return 'space';
        if (/water|sanitation|sewer|aqueduct|irrigation|filtration/.test(text)) return 'water';
        if (/road|rail|engine|machine|mechanical|factory|assembly|transport|vehicle/.test(text)) return 'machine';
        if (/finance|bank|market|money|credit|insurance|account/.test(text)) return 'ledger';
        return 'archive';
    }

    function sourcePhrase(scene, trace) {
        if (scene.target) {
            const sourced = trace.edges.filter(entry => hasEdgeSource(entry.edge)).length;
            return `${sourced}/${trace.edges.length} edge receipts`;
        }
        if (scene.edge && hasEdgeSource(scene.edge)) return 'edge source checked';
        if (scene.item.sources?.length) return `${scene.item.sources.length} node source${scene.item.sources.length === 1 ? '' : 's'}`;
        return 'needs deeper sourcing';
    }

    function makeFallbackTitle(item, target) {
        if (item.id === target.id) return 'The Payoff';
        const lane = item.fieldLanes?.[target.fields?.[0] || ''];
        if (lane && lane !== 'General') return lane.replace(/&/g, 'and');
        return item.name;
    }

    function makeCaption(item, edge, target) {
        if (item.id === target.id) {
            return 'The target is the final frame: many earlier capabilities arriving in the right order.';
        }
        if (edge?.type === 'required') return `${item.name} is a hard prerequisite in the visible path to ${target.name}.`;
        if (edge?.type === 'enabling') return `${item.name} makes the next step practical rather than merely imaginable.`;
        if (edge?.type === 'commercial_or_scaling_dependency') return `${item.name} helps move the idea from lab result to repeatable system.`;
        if (item.description) return item.description;
        return `${item.name} becomes part of the path toward ${target.name}.`;
    }

    function buildScenes(trace) {
        const curated = storyCuts[trace.target.id];
        if (curated) {
            return curated
                .filter(beat => graph.byId.has(beat.id))
                .map((beat, index, beats) => {
                    const item = graph.byId.get(beat.id);
                    const nextId = beats[index + 1]?.id || trace.target.id;
                    const edge = item.id === trace.target.id ? null : bestEdgeForMilestone(item.id, nextId, trace);
                    return {
                        item,
                        edge,
                        title: beat.title,
                        caption: beat.caption,
                        target: item.id === trace.target.id || index === beats.length - 1,
                        kind: classifyScene(item),
                        visual: beat.visual,
                        palette: eraPalette[item.era] || eraPalette.Unknown
                    };
                });
        }

        const ids = selectMilestones(trace).slice(-6);
        return ids.map((id, index) => {
            const item = graph.byId.get(id);
            const nextId = ids[index + 1] || trace.target.id;
            const edge = id === trace.target.id ? null : bestEdgeForMilestone(id, nextId, trace);
            return {
                item,
                edge,
                title: makeFallbackTitle(item, trace.target),
                target: id === trace.target.id,
                kind: classifyScene(item),
                visual: classifyScene(item),
                palette: eraPalette[item.era] || eraPalette.Unknown,
                caption: makeCaption(item, edge, trace.target)
            };
        });
    }

    function resizeCanvas() {
        const width = canvas.clientWidth || window.innerWidth;
        const height = canvas.clientHeight || window.innerHeight;
        const pixelBudgetRatio = Math.sqrt(maxCanvasPixels / Math.max(1, width * height));
        const ratio = Math.min(window.devicePixelRatio || 1, 2, pixelBudgetRatio);
        const pixelWidth = Math.max(1, Math.floor(width * ratio));
        const pixelHeight = Math.max(1, Math.floor(height * ratio));
        const dimensionsUnchanged = canvas.width === pixelWidth && canvas.height === pixelHeight;
        const layoutUnchanged = canvasCssWidth === width && canvasCssHeight === height && canvasScale === ratio;
        if (dimensionsUnchanged && layoutUnchanged) return;
        if (!dimensionsUnchanged) {
            canvas.width = pixelWidth;
            canvas.height = pixelHeight;
        }
        canvasCssWidth = width;
        canvasCssHeight = height;
        canvasScale = ratio;
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        requestRender();
    }

    function queueCanvasResize() {
        if (resizeAnimationId !== null) return;
        resizeAnimationId = window.requestAnimationFrame(() => {
            resizeAnimationId = null;
            resizeCanvas();
        });
    }

    function requestRender() {
        if (animationId !== null || document.hidden || !scenes.length) return;
        animationId = window.requestAnimationFrame(renderFrame);
    }

    function drawBackground(width, height, time, scene, sceneProgress) {
        const [base, accent, shadow] = scene.palette;
        const gradient = context.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#030507');
        gradient.addColorStop(0.46, shadow);
        gradient.addColorStop(1, '#040609');
        context.fillStyle = gradient;
        context.fillRect(0, 0, width, height);

        context.save();
        context.globalAlpha = 0.16;
        context.strokeStyle = accent;
        context.lineWidth = 1;
        const drift = (time * 0.018) % 86;
        for (let x = -86; x < width + 86; x += 86) {
            context.beginPath();
            context.moveTo(x + drift, 0);
            context.lineTo(x - 180 + drift, height);
            context.stroke();
        }
        context.restore();

        for (const particle of particles) {
            const x = ((particle.x * width) + Math.sin(time * particle.speed + particle.phase) * 34 + sceneProgress * 18) % width;
            const y = particle.y * height + Math.cos(time * particle.speed * 1.7 + particle.phase) * 22;
            context.fillStyle = particle.x > 0.68 ? base : accent;
            context.globalAlpha = 0.08 + ((particle.phase * 10) % 5) * 0.018;
            context.beginPath();
            context.arc(x, y, particle.r, 0, Math.PI * 2);
            context.fill();
        }
        context.globalAlpha = 1;
    }

    function drawGenome(width, height, time, progress, scene) {
        const [, accent] = scene.palette;
        const centerX = width * 0.66;
        const top = height * 0.16;
        const bottom = height * 0.72;
        context.lineWidth = 2.2;
        for (let strand = 0; strand < 2; strand += 1) {
            context.beginPath();
            for (let step = 0; step <= 150; step += 1) {
                const t = step / 150;
                const y = top + (bottom - top) * t;
                const wave = Math.sin(t * Math.PI * 8 + time * 0.002 + strand * Math.PI);
                const x = centerX + wave * width * 0.085;
                if (step === 0) context.moveTo(x, y);
                else context.lineTo(x, y);
            }
            context.strokeStyle = strand ? 'rgba(240,255,252,0.58)' : accent;
            context.stroke();
        }
        for (let step = 0; step <= 20; step += 1) {
            const t = step / 20;
            const y = top + (bottom - top) * t;
            const a = Math.sin(t * Math.PI * 8 + time * 0.002);
            const x1 = centerX + a * width * 0.085;
            const x2 = centerX - a * width * 0.085;
            context.strokeStyle = `rgba(240,255,252,${0.16 + progress * 0.3})`;
            context.beginPath();
            context.moveTo(x1, y);
            context.lineTo(x2, y);
            context.stroke();
        }
        drawLens(width * 0.18, height * 0.2, width * 0.2, accent, progress);
    }

    function drawChip(width, height, time, progress, scene) {
        const [base, accent] = scene.palette;
        const cx = width * 0.67;
        const cy = height * 0.43;
        const size = Math.min(width, height) * 0.42;
        context.save();
        context.translate(cx, cy);
        context.rotate(-0.16 + progress * 0.08);
        context.fillStyle = 'rgba(3,8,11,0.72)';
        context.strokeStyle = accent;
        context.lineWidth = 2;
        context.fillRect(-size / 2, -size / 2, size, size);
        context.strokeRect(-size / 2, -size / 2, size, size);
        for (let i = -5; i <= 5; i += 1) {
            context.strokeStyle = i % 2 ? 'rgba(255,255,255,0.18)' : base;
            context.beginPath();
            context.moveTo(-size / 2, (i * size) / 12);
            context.lineTo(size / 2, (i * size) / 12);
            context.moveTo((i * size) / 12, -size / 2);
            context.lineTo((i * size) / 12, size / 2);
            context.stroke();
        }
        context.restore();
    }

    function drawNetwork(width, height, time, progress, scene) {
        const [, accent] = scene.palette;
        const points = Array.from({ length: 16 }, (_, index) => ({
            x: width * (0.48 + ((index * 37) % 41) / 100),
            y: height * (0.18 + ((index * 53) % 52) / 100)
        }));
        context.lineWidth = 1;
        for (let i = 0; i < points.length; i += 1) {
            for (let j = i + 1; j < points.length; j += 1) {
                if ((i + j) % 4 !== 0) continue;
                context.strokeStyle = 'rgba(230,246,250,0.12)';
                context.beginPath();
                context.moveTo(points[i].x, points[i].y);
                context.lineTo(points[j].x, points[j].y);
                context.stroke();
            }
        }
        for (const [index, point] of points.entries()) {
            const pulse = 3 + Math.sin(time * 0.003 + index) * 1.4;
            context.fillStyle = index % 5 === 0 ? accent : 'rgba(238,250,252,0.72)';
            context.beginPath();
            context.arc(point.x, point.y, pulse + progress * 2, 0, Math.PI * 2);
            context.fill();
        }
    }

    function drawEnergy(width, height, time, progress, scene) {
        const [, accent] = scene.palette;
        context.strokeStyle = accent;
        context.lineWidth = 3;
        for (let i = 0; i < 5; i += 1) {
            const x = width * (0.48 + i * 0.09);
            const y = height * (0.62 - (i % 2) * 0.08);
            context.beginPath();
            context.moveTo(x, height * 0.78);
            context.lineTo(x, y);
            context.lineTo(x - 24, y + 54);
            context.moveTo(x, y);
            context.lineTo(x + 24, y + 54);
            context.stroke();
            context.beginPath();
            context.arc(x, y, 9 + progress * 5, 0, Math.PI * 2);
            context.fillStyle = 'rgba(255,255,255,0.7)';
            context.fill();
        }
        context.strokeStyle = 'rgba(255,255,255,0.25)';
        context.beginPath();
        context.moveTo(width * 0.44, height * 0.45);
        context.lineTo(width * 0.88, height * 0.35);
        context.stroke();
    }

    function drawSpace(width, height, time, progress, scene) {
        const [, accent] = scene.palette;
        context.strokeStyle = 'rgba(255,255,255,0.16)';
        context.lineWidth = 1.5;
        for (let i = 0; i < 4; i += 1) {
            context.beginPath();
            context.ellipse(width * 0.68, height * 0.44, width * (0.14 + i * 0.05), height * (0.05 + i * 0.024), -0.5, 0, Math.PI * 2);
            context.stroke();
        }
        context.fillStyle = accent;
        context.beginPath();
        const angle = time * 0.001 + progress * Math.PI * 2;
        context.arc(width * 0.68 + Math.cos(angle) * width * 0.22, height * 0.44 + Math.sin(angle) * height * 0.08, 7, 0, Math.PI * 2);
        context.fill();
    }

    function drawWater(width, height, time, progress, scene) {
        const [, accent] = scene.palette;
        context.strokeStyle = accent;
        context.lineWidth = 2;
        for (let i = 0; i < 8; i += 1) {
            const y = height * (0.32 + i * 0.055);
            context.beginPath();
            for (let x = width * 0.42; x < width * 0.9; x += 14) {
                const wave = Math.sin(x * 0.02 + time * 0.003 + i) * 7;
                if (x === width * 0.42) context.moveTo(x, y + wave);
                else context.lineTo(x, y + wave);
            }
            context.stroke();
        }
    }

    function drawMachine(width, height, time, progress, scene) {
        const [, accent] = scene.palette;
        for (let gear = 0; gear < 3; gear += 1) {
            const x = width * (0.54 + gear * 0.12);
            const y = height * (0.38 + (gear % 2) * 0.13);
            const r = width * 0.055;
            context.save();
            context.translate(x, y);
            context.rotate(time * 0.001 * (gear % 2 ? -1 : 1));
            context.strokeStyle = accent;
            context.lineWidth = 3;
            context.beginPath();
            for (let tooth = 0; tooth < 18; tooth += 1) {
                const angle = (tooth / 18) * Math.PI * 2;
                const radius = tooth % 2 ? r * 0.78 : r;
                const px = Math.cos(angle) * radius;
                const py = Math.sin(angle) * radius;
                if (tooth === 0) context.moveTo(px, py);
                else context.lineTo(px, py);
            }
            context.closePath();
            context.stroke();
            context.restore();
        }
    }

    function drawLedger(width, height, time, progress, scene) {
        const [, accent] = scene.palette;
        context.strokeStyle = accent;
        context.lineWidth = 1.5;
        for (let row = 0; row < 10; row += 1) {
            const y = height * (0.22 + row * 0.045);
            context.beginPath();
            context.moveTo(width * 0.46, y);
            context.lineTo(width * 0.84, y);
            context.stroke();
        }
        for (let col = 0; col < 5; col += 1) {
            const x = width * (0.46 + col * 0.095);
            context.beginPath();
            context.moveTo(x, height * 0.2);
            context.lineTo(x, height * 0.66);
            context.stroke();
        }
    }

    function drawArchive(width, height, time, progress, scene) {
        const [, accent] = scene.palette;
        context.save();
        context.translate(width * 0.66, height * 0.44);
        context.rotate(-0.08 + progress * 0.05);
        context.fillStyle = 'rgba(245,235,205,0.12)';
        context.strokeStyle = accent;
        context.lineWidth = 2;
        context.fillRect(-width * 0.17, -height * 0.22, width * 0.34, height * 0.44);
        context.strokeRect(-width * 0.17, -height * 0.22, width * 0.34, height * 0.44);
        for (let i = 0; i < 8; i += 1) {
            context.beginPath();
            context.moveTo(-width * 0.12, -height * 0.14 + i * height * 0.043);
            context.lineTo(width * (0.05 + (i % 3) * 0.035), -height * 0.14 + i * height * 0.043);
            context.stroke();
        }
        context.restore();
    }

    function drawLens(x, y, size, accent, progress) {
        context.strokeStyle = accent;
        context.lineWidth = 2;
        context.beginPath();
        context.arc(x, y, size * (0.36 + progress * 0.02), 0, Math.PI * 2);
        context.stroke();
        context.beginPath();
        context.arc(x + size * 0.13, y - size * 0.1, size * 0.08, 0, Math.PI * 2);
        context.fillStyle = 'rgba(255,255,255,0.42)';
        context.fill();
    }

    function drawGlow(x, y, radius, color, alpha = 0.55) {
        const glow = context.createRadialGradient(x, y, 0, x, y, radius);
        glow.addColorStop(0, color);
        glow.addColorStop(1, `rgba(255,255,255,0)`);
        context.globalAlpha = alpha;
        context.fillStyle = glow;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
        context.globalAlpha = 1;
    }

    function roundedRect(x, y, width, height, radius) {
        context.beginPath();
        context.moveTo(x + radius, y);
        context.lineTo(x + width - radius, y);
        context.quadraticCurveTo(x + width, y, x + width, y + radius);
        context.lineTo(x + width, y + height - radius);
        context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        context.lineTo(x + radius, y + height);
        context.quadraticCurveTo(x, y + height, x, y + height - radius);
        context.lineTo(x, y + radius);
        context.quadraticCurveTo(x, y, x + radius, y);
        context.closePath();
    }

    function drawDocument(x, y, width, height, accent, progress) {
        context.fillStyle = 'rgba(245,250,250,0.12)';
        context.strokeStyle = accent;
        context.lineWidth = 1.5;
        roundedRect(x, y, width, height, 8);
        context.fill();
        context.stroke();
        context.strokeStyle = 'rgba(255,255,255,0.34)';
        for (let i = 0; i < 5; i += 1) {
            const lineWidth = width * (0.42 + ((i * 17) % 33) / 100);
            context.beginPath();
            context.moveTo(x + width * 0.13, y + height * (0.24 + i * 0.12));
            context.lineTo(x + width * 0.13 + lineWidth * progress, y + height * (0.24 + i * 0.12));
            context.stroke();
        }
    }

    function drawDnaRead(width, height, time, progress, scene) {
        drawGenome(width, height, time, progress, scene);
        const accent = scene.palette[1];
        context.strokeStyle = 'rgba(255,255,255,0.46)';
        context.lineWidth = 5;
        context.beginPath();
        context.moveTo(width * 0.16, height * 0.52);
        context.lineTo(width * 0.28, height * 0.66);
        context.stroke();
        drawLens(width * 0.16, height * 0.44, width * 0.13, accent, progress);
        drawGlow(width * 0.66, height * 0.42, width * 0.23, 'rgba(133,216,205,0.9)', 0.22);
    }

    function drawSequencing(width, height, time, progress, scene) {
        const accent = scene.palette[1];
        const startX = width * 0.44;
        const baseY = height * 0.58;
        context.lineWidth = 2;
        for (let lane = 0; lane < 4; lane += 1) {
            context.strokeStyle = ['#8be0d1', '#f0bc68', '#9fd4ff', '#e6a6ff'][lane];
            context.beginPath();
            for (let i = 0; i < 90; i += 1) {
                const x = startX + i * width * 0.0048;
                const amp = Math.sin(i * 0.42 + time * 0.004 + lane) * height * 0.045;
                const spike = Math.max(0, Math.sin(i * 1.7 + lane * 2 + progress * 8)) * height * 0.13;
                const y = baseY - lane * height * 0.07 - amp - spike;
                if (i === 0) context.moveTo(x, y);
                else context.lineTo(x, y);
            }
            context.stroke();
        }
        drawDocument(width * 0.13, height * 0.26, width * 0.18, height * 0.32, accent, progress);
    }

    function drawImmuneArchive(width, height, time, progress, scene) {
        const accent = scene.palette[1];
        const cx = width * 0.66;
        const cy = height * 0.42;
        drawGlow(cx, cy, width * 0.24, 'rgba(139,224,209,0.9)', 0.25);
        context.strokeStyle = accent;
        context.lineWidth = 3;
        context.beginPath();
        context.arc(cx, cy, width * 0.12, 0, Math.PI * 2);
        context.stroke();
        for (let i = 0; i < 14; i += 1) {
            const angle = (i / 14) * Math.PI * 2 + time * 0.0009;
            const x = cx + Math.cos(angle) * width * 0.2;
            const y = cy + Math.sin(angle) * height * 0.16;
            context.fillStyle = i % 3 === 0 ? '#f0bc68' : 'rgba(245,255,255,0.78)';
            context.beginPath();
            context.moveTo(x, y - 8);
            context.lineTo(x + 10, y + 7);
            context.lineTo(x - 10, y + 7);
            context.closePath();
            context.fill();
        }
        for (let i = 0; i < 6; i += 1) {
            drawDocument(width * (0.12 + i * 0.035), height * (0.3 + i * 0.03), width * 0.09, height * 0.12, accent, Math.min(1, progress * 2));
        }
    }

    function drawCasCut(width, height, time, progress, scene) {
        const accent = scene.palette[1];
        const y = height * 0.46;
        const cutX = width * (0.58 + Math.sin(progress * Math.PI) * 0.04);
        context.lineWidth = 6;
        context.strokeStyle = 'rgba(240,255,252,0.78)';
        context.beginPath();
        context.moveTo(width * 0.36, y + Math.sin(time * 0.004) * 10);
        context.bezierCurveTo(width * 0.48, y - 55, cutX - 24, y + 42, cutX - 8, y);
        context.stroke();
        context.beginPath();
        context.moveTo(cutX + 8, y);
        context.bezierCurveTo(cutX + 42, y - 42, width * 0.78, y + 48, width * 0.88, y - 12);
        context.stroke();
        drawGlow(cutX, y, width * 0.13, 'rgba(240,188,104,0.95)', 0.42);
        context.fillStyle = accent;
        roundedRect(cutX - 42, y - 42, 84, 84, 22);
        context.fill();
        context.strokeStyle = '#061419';
        context.lineWidth = 4;
        context.beginPath();
        context.moveTo(cutX - 22, y - 12);
        context.lineTo(cutX + 20, y + 18);
        context.moveTo(cutX + 20, y - 18);
        context.lineTo(cutX - 22, y + 12);
        context.stroke();
    }

    function drawCellDelivery(width, height, time, progress, scene) {
        const accent = scene.palette[1];
        const cx = width * 0.67;
        const cy = height * 0.43;
        context.strokeStyle = 'rgba(230,255,250,0.36)';
        context.lineWidth = 5;
        context.beginPath();
        context.arc(cx, cy, width * 0.16, 0, Math.PI * 2);
        context.stroke();
        drawGlow(cx, cy, width * 0.19, 'rgba(139,224,209,0.85)', 0.17);
        const px = width * 0.34 + (cx - width * 0.34) * progress;
        const py = height * 0.22 + (cy - height * 0.22) * progress + Math.sin(time * 0.005) * 12;
        context.strokeStyle = accent;
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(width * 0.34, height * 0.22);
        context.quadraticCurveTo(width * 0.48, height * 0.12, px, py);
        context.stroke();
        context.fillStyle = '#f0bc68';
        context.beginPath();
        context.arc(px, py, 16, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = 'rgba(255,255,255,0.75)';
        context.beginPath();
        context.arc(px - 5, py - 5, 5, 0, Math.PI * 2);
        context.fill();
    }

    function drawClinic(width, height, time, progress, scene) {
        const accent = scene.palette[1];
        drawGlow(width * 0.68, height * 0.42, width * 0.23, 'rgba(240,188,104,0.8)', 0.22);
        for (let i = 0; i < 10; i += 1) {
            const x = width * (0.48 + ((i * 19) % 34) / 100);
            const y = height * (0.24 + ((i * 29) % 36) / 100);
            context.fillStyle = i % 2 ? 'rgba(190,28,50,0.7)' : 'rgba(238,245,246,0.82)';
            context.beginPath();
            context.ellipse(x + Math.sin(time * 0.002 + i) * 10, y, 22, 13, time * 0.001 + i, 0, Math.PI * 2);
            context.fill();
        }
        context.strokeStyle = accent;
        context.lineWidth = 8;
        context.lineCap = 'round';
        context.beginPath();
        context.moveTo(width * 0.62, height * 0.43);
        context.lineTo(width * 0.68, height * 0.5);
        context.lineTo(width * 0.81, height * 0.31);
        context.stroke();
        context.lineCap = 'butt';
    }

    function drawCrystal(width, height, time, progress, scene) {
        const accent = scene.palette[1];
        const originX = width * 0.48;
        const originY = height * 0.24;
        const gap = width * 0.062;
        for (let row = 0; row < 5; row += 1) {
            for (let col = 0; col < 6; col += 1) {
                const x = originX + col * gap + (row % 2) * gap * 0.5;
                const y = originY + row * gap * 0.78;
                drawGlow(x, y, 24, 'rgba(240,188,104,0.6)', 0.16);
                context.fillStyle = (row + col) % 2 ? accent : 'rgba(245,255,255,0.8)';
                context.beginPath();
                context.arc(x, y, 7 + Math.sin(time * 0.003 + row + col) * 1.5, 0, Math.PI * 2);
                context.fill();
                if (col > 0) {
                    context.strokeStyle = 'rgba(255,255,255,0.18)';
                    context.beginPath();
                    context.moveTo(x, y);
                    context.lineTo(x - gap, y - (row % 2 ? 0 : gap * 0.39));
                    context.stroke();
                }
            }
        }
    }

    function drawTransistor(width, height, time, progress, scene) {
        const accent = scene.palette[1];
        const x = width * 0.48;
        const y = height * 0.34;
        context.strokeStyle = accent;
        context.lineWidth = 4;
        context.fillStyle = 'rgba(255,255,255,0.08)';
        roundedRect(x, y, width * 0.36, height * 0.18, 14);
        context.fill();
        context.stroke();
        context.fillStyle = 'rgba(240,188,104,0.8)';
        context.fillRect(x + width * 0.15, y - height * 0.08, width * 0.06, height * 0.34);
        for (let i = 0; i < 9; i += 1) {
            const ex = x + width * 0.04 + ((time * 0.06 + i * 38) % (width * 0.28));
            context.fillStyle = 'rgba(255,255,255,0.75)';
            context.beginPath();
            context.arc(ex, y + height * 0.09 + Math.sin(i + time * 0.004) * 10, 4, 0, Math.PI * 2);
            context.fill();
        }
    }

    function drawWaferPrint(width, height, time, progress, scene) {
        const accent = scene.palette[1];
        const cx = width * 0.68;
        const cy = height * 0.52;
        context.fillStyle = 'rgba(220,245,250,0.12)';
        context.strokeStyle = accent;
        context.lineWidth = 3;
        context.beginPath();
        context.ellipse(cx, cy, width * 0.18, height * 0.1, -0.16, 0, Math.PI * 2);
        context.fill();
        context.stroke();
        for (let i = 0; i < 10; i += 1) {
            context.strokeStyle = 'rgba(255,255,255,0.22)';
            context.beginPath();
            context.moveTo(cx - width * 0.15 + i * width * 0.03, cy - height * 0.08);
            context.lineTo(cx - width * 0.17 + i * width * 0.03, cy + height * 0.08);
            context.stroke();
        }
        context.fillStyle = `rgba(240,188,104,${0.18 + progress * 0.28})`;
        context.beginPath();
        context.moveTo(width * 0.48, height * 0.08);
        context.lineTo(cx - width * 0.15, cy - height * 0.08);
        context.lineTo(cx + width * 0.15, cy - height * 0.08);
        context.closePath();
        context.fill();
    }

    function drawMask(width, height, time, progress, scene) {
        const accent = scene.palette[1];
        const x = width * 0.5;
        const y = height * 0.22;
        context.strokeStyle = accent;
        context.lineWidth = 2;
        context.fillStyle = 'rgba(255,255,255,0.08)';
        roundedRect(x, y, width * 0.32, height * 0.32, 10);
        context.fill();
        context.stroke();
        context.fillStyle = 'rgba(0,0,0,0.62)';
        for (let row = 0; row < 7; row += 1) {
            for (let col = 0; col < 9; col += 1) {
                if ((row * 2 + col) % 3 === 0) {
                    context.fillRect(x + 18 + col * width * 0.03, y + 16 + row * height * 0.035, width * 0.018, height * 0.018);
                }
            }
        }
        drawGlow(x + width * (0.06 + progress * 0.25), y + height * 0.16, width * 0.09, 'rgba(255,255,255,0.9)', 0.32);
    }

    function drawEuvPlasma(width, height, time, progress, scene) {
        const accent = scene.palette[1];
        const cx = width * 0.68;
        const cy = height * 0.38;
        drawGlow(cx, cy, width * (0.15 + progress * 0.05), 'rgba(240,188,104,0.95)', 0.7);
        context.strokeStyle = accent;
        context.lineWidth = 2;
        for (let i = 0; i < 8; i += 1) {
            const angle = (i / 8) * Math.PI * 2 + time * 0.001;
            context.beginPath();
            context.moveTo(cx, cy);
            context.lineTo(cx + Math.cos(angle) * width * 0.22, cy + Math.sin(angle) * height * 0.2);
            context.stroke();
        }
        for (let i = 0; i < 3; i += 1) {
            context.strokeStyle = 'rgba(255,255,255,0.34)';
            context.beginPath();
            context.ellipse(width * (0.45 + i * 0.14), height * (0.55 - i * 0.08), width * 0.08, height * 0.025, -0.35, 0, Math.PI * 2);
            context.stroke();
        }
    }

    function drawHighNa(width, height, time, progress, scene) {
        const accent = scene.palette[1];
        context.strokeStyle = accent;
        context.lineWidth = 3;
        for (let i = 0; i < 5; i += 1) {
            const x = width * (0.46 + i * 0.07);
            context.beginPath();
            context.ellipse(x, height * 0.36, width * 0.035, height * 0.18, 0, 0, Math.PI * 2);
            context.stroke();
        }
        context.fillStyle = `rgba(240,188,104,${0.14 + progress * 0.26})`;
        context.beginPath();
        context.moveTo(width * 0.39, height * 0.16);
        context.lineTo(width * 0.82, height * 0.62);
        context.lineTo(width * 0.47, height * 0.62);
        context.closePath();
        context.fill();
        drawWaferPrint(width, height, time, progress, scene);
    }

    function drawSearch(width, height, time, progress, scene) {
        const accent = scene.palette[1];
        for (let i = 0; i < 9; i += 1) {
            drawDocument(width * (0.48 + (i % 3) * 0.115), height * (0.18 + Math.floor(i / 3) * 0.15), width * 0.08, height * 0.1, accent, 1);
        }
        const sx = width * (0.48 + progress * 0.28);
        drawGlow(sx, height * 0.38, width * 0.12, 'rgba(139,224,209,0.8)', 0.38);
        drawLens(sx, height * 0.38, width * 0.09, accent, progress);
    }

    function drawAttention(width, height, time, progress, scene) {
        const accent = scene.palette[1];
        const y = height * 0.42;
        const xs = Array.from({ length: 8 }, (_, i) => width * (0.42 + i * 0.06));
        xs.forEach((x, i) => {
            context.fillStyle = i % 2 ? 'rgba(255,255,255,0.18)' : 'rgba(139,224,209,0.2)';
            roundedRect(x - 16, y - 16, 32, 32, 7);
            context.fill();
        });
        context.strokeStyle = accent;
        context.lineWidth = 1.6;
        for (let i = 0; i < xs.length; i += 1) {
            for (let j = i + 2; j < xs.length; j += 3) {
                context.globalAlpha = 0.2 + Math.sin(time * 0.003 + i + j) * 0.1;
                context.beginPath();
                context.moveTo(xs[i], y);
                context.quadraticCurveTo((xs[i] + xs[j]) / 2, y - height * 0.18, xs[j], y);
                context.stroke();
            }
        }
        context.globalAlpha = 1;
    }

    function drawModel(width, height, time, progress, scene) {
        const accent = scene.palette[1];
        for (let layer = 0; layer < 4; layer += 1) {
            for (let node = 0; node < 5; node += 1) {
                const x = width * (0.48 + layer * 0.1);
                const y = height * (0.24 + node * 0.075);
                context.fillStyle = node === Math.floor((time * 0.004 + layer) % 5) ? accent : 'rgba(255,255,255,0.48)';
                context.beginPath();
                context.arc(x, y, 6, 0, Math.PI * 2);
                context.fill();
                if (layer > 0) {
                    context.strokeStyle = 'rgba(255,255,255,0.12)';
                    context.beginPath();
                    context.moveTo(x - width * 0.1, height * (0.24 + ((node + layer) % 5) * 0.075));
                    context.lineTo(x, y);
                    context.stroke();
                }
            }
        }
    }

    function drawRag(width, height, time, progress, scene) {
        const accent = scene.palette[1];
        drawSearch(width, height, time, progress, scene);
        drawModel(width, height, time, progress, scene);
        context.strokeStyle = '#f0bc68';
        context.lineWidth = 4;
        context.beginPath();
        context.moveTo(width * 0.55, height * 0.64);
        context.bezierCurveTo(width * 0.62, height * 0.72, width * 0.76, height * 0.7, width * 0.84, height * 0.58);
        context.stroke();
        drawGlow(width * 0.84, height * 0.58, width * 0.08, 'rgba(240,188,104,0.8)', 0.34);
        context.strokeStyle = accent;
    }

    function drawPattern(width, height, time, progress, scene) {
        const accent = scene.palette[1];
        const centers = [
            [width * 0.54, height * 0.32, '#8be0d1'],
            [width * 0.74, height * 0.28, '#f0bc68'],
            [width * 0.66, height * 0.56, '#cda6ff']
        ];
        for (let i = 0; i < 42; i += 1) {
            const center = centers[i % centers.length];
            const angle = i * 1.7 + time * 0.001;
            const radius = 18 + ((i * 13) % 52);
            context.fillStyle = center[2];
            context.globalAlpha = 0.35 + progress * 0.3;
            context.beginPath();
            context.arc(center[0] + Math.cos(angle) * radius, center[1] + Math.sin(angle) * radius * 0.7, 4, 0, Math.PI * 2);
            context.fill();
        }
        context.globalAlpha = 1;
        context.strokeStyle = accent;
        context.lineWidth = 2;
        centers.forEach(center => {
            context.beginPath();
            context.ellipse(center[0], center[1], width * 0.09, height * 0.07, 0.2, 0, Math.PI * 2);
            context.stroke();
        });
    }

    function drawSpark(width, height, time, progress, scene) {
        const accent = scene.palette[1];
        drawGlow(width * 0.68, height * 0.38, width * 0.18, 'rgba(240,188,104,0.8)', 0.3);
        context.fillStyle = accent;
        context.beginPath();
        context.moveTo(width * 0.68, height * 0.14);
        context.lineTo(width * 0.58, height * 0.43);
        context.lineTo(width * 0.69, height * 0.39);
        context.lineTo(width * 0.61, height * 0.7);
        context.lineTo(width * 0.82, height * 0.32);
        context.lineTo(width * 0.7, height * 0.36);
        context.closePath();
        context.fill();
    }

    function drawGenerator(width, height, time, progress, scene) {
        const accent = scene.palette[1];
        const cx = width * 0.66;
        const cy = height * 0.42;
        context.strokeStyle = accent;
        context.lineWidth = 5;
        context.beginPath();
        context.arc(cx, cy, width * 0.12, 0, Math.PI * 2);
        context.stroke();
        context.save();
        context.translate(cx, cy);
        context.rotate(time * 0.004);
        context.strokeStyle = 'rgba(255,255,255,0.72)';
        context.strokeRect(-width * 0.09, -height * 0.035, width * 0.18, height * 0.07);
        context.restore();
        drawGlow(cx, cy, width * 0.18, 'rgba(139,224,209,0.7)', 0.18);
    }

    function drawGrid(width, height, time, progress, scene) {
        const accent = scene.palette[1];
        context.strokeStyle = accent;
        context.lineWidth = 2;
        const nodes = [];
        for (let i = 0; i < 12; i += 1) {
            nodes.push([width * (0.46 + ((i * 31) % 38) / 100), height * (0.22 + ((i * 47) % 42) / 100)]);
        }
        for (let i = 0; i < nodes.length - 1; i += 1) {
            context.globalAlpha = 0.24;
            context.beginPath();
            context.moveTo(nodes[i][0], nodes[i][1]);
            context.lineTo(nodes[i + 1][0], nodes[i + 1][1]);
            context.stroke();
        }
        context.globalAlpha = 1;
        for (const [i, node] of nodes.entries()) {
            context.fillStyle = i < progress * nodes.length ? '#f0bc68' : 'rgba(255,255,255,0.58)';
            context.beginPath();
            context.arc(node[0], node[1], 5, 0, Math.PI * 2);
            context.fill();
        }
    }

    function drawRenewables(width, height, time, progress, scene) {
        const accent = scene.palette[1];
        drawGlow(width * 0.78, height * 0.2, width * 0.12, 'rgba(240,188,104,0.75)', 0.28);
        for (let i = 0; i < 3; i += 1) {
            const x = width * (0.48 + i * 0.12);
            const y = height * 0.58;
            context.strokeStyle = accent;
            context.lineWidth = 3;
            context.beginPath();
            context.moveTo(x, y);
            context.lineTo(x, y - height * 0.18);
            context.stroke();
            context.save();
            context.translate(x, y - height * 0.18);
            context.rotate(time * 0.002 + i);
            for (let blade = 0; blade < 3; blade += 1) {
                context.rotate((Math.PI * 2) / 3);
                context.beginPath();
                context.moveTo(0, 0);
                context.lineTo(0, -height * 0.08);
                context.stroke();
            }
            context.restore();
        }
    }

    function drawBattery(width, height, time, progress, scene) {
        const accent = scene.palette[1];
        for (let i = 0; i < 5; i += 1) {
            const x = width * (0.48 + i * 0.07);
            const y = height * 0.32;
            context.strokeStyle = accent;
            context.lineWidth = 2;
            roundedRect(x, y, width * 0.045, height * 0.22, 8);
            context.stroke();
            context.fillStyle = 'rgba(240,188,104,0.58)';
            const fillHeight = height * 0.18 * Math.min(1, progress + i * 0.08);
            context.fillRect(x + 5, y + height * 0.2 - fillHeight, width * 0.045 - 10, fillHeight);
        }
    }

    function drawDuration(width, height, time, progress, scene) {
        drawRenewables(width, height, time, progress, scene);
        drawBattery(width, height, time, progress, scene);
        const cx = width * 0.7;
        const cy = height * 0.28;
        context.strokeStyle = 'rgba(255,255,255,0.5)';
        context.lineWidth = 2;
        context.beginPath();
        context.arc(cx, cy, width * 0.08, Math.PI * 1.1, Math.PI * 2.9);
        context.stroke();
        context.fillStyle = progress < 0.5 ? '#f0bc68' : 'rgba(220,235,255,0.85)';
        context.beginPath();
        context.arc(cx + Math.cos(progress * Math.PI * 2) * width * 0.08, cy + Math.sin(progress * Math.PI * 2) * width * 0.08, 9, 0, Math.PI * 2);
        context.fill();
    }

    function drawSceneArt(width, height, time, progress, scene) {
        if (scene.visual === 'dna_read') drawDnaRead(width, height, time, progress, scene);
        else if (scene.visual === 'sequencing') drawSequencing(width, height, time, progress, scene);
        else if (scene.visual === 'immune_archive') drawImmuneArchive(width, height, time, progress, scene);
        else if (scene.visual === 'cas_cut') drawCasCut(width, height, time, progress, scene);
        else if (scene.visual === 'cell_delivery') drawCellDelivery(width, height, time, progress, scene);
        else if (scene.visual === 'clinic') drawClinic(width, height, time, progress, scene);
        else if (scene.visual === 'crystal') drawCrystal(width, height, time, progress, scene);
        else if (scene.visual === 'transistor') drawTransistor(width, height, time, progress, scene);
        else if (scene.visual === 'wafer_print') drawWaferPrint(width, height, time, progress, scene);
        else if (scene.visual === 'mask') drawMask(width, height, time, progress, scene);
        else if (scene.visual === 'euv_plasma') drawEuvPlasma(width, height, time, progress, scene);
        else if (scene.visual === 'high_na') drawHighNa(width, height, time, progress, scene);
        else if (scene.visual === 'archive') drawArchive(width, height, time, progress, scene);
        else if (scene.visual === 'search') drawSearch(width, height, time, progress, scene);
        else if (scene.visual === 'pattern') drawPattern(width, height, time, progress, scene);
        else if (scene.visual === 'attention') drawAttention(width, height, time, progress, scene);
        else if (scene.visual === 'model') drawModel(width, height, time, progress, scene);
        else if (scene.visual === 'rag') drawRag(width, height, time, progress, scene);
        else if (scene.visual === 'spark') drawSpark(width, height, time, progress, scene);
        else if (scene.visual === 'generator') drawGenerator(width, height, time, progress, scene);
        else if (scene.visual === 'grid') drawGrid(width, height, time, progress, scene);
        else if (scene.visual === 'renewables') drawRenewables(width, height, time, progress, scene);
        else if (scene.visual === 'battery') drawBattery(width, height, time, progress, scene);
        else if (scene.visual === 'duration') drawDuration(width, height, time, progress, scene);
        else if (scene.kind === 'genome') drawGenome(width, height, time, progress, scene);
        else if (scene.kind === 'chip') drawChip(width, height, time, progress, scene);
        else if (scene.kind === 'network') drawNetwork(width, height, time, progress, scene);
        else if (scene.kind === 'energy') drawEnergy(width, height, time, progress, scene);
        else if (scene.kind === 'space') drawSpace(width, height, time, progress, scene);
        else if (scene.kind === 'water') drawWater(width, height, time, progress, scene);
        else if (scene.kind === 'machine') drawMachine(width, height, time, progress, scene);
        else if (scene.kind === 'ledger') drawLedger(width, height, time, progress, scene);
        else drawArchive(width, height, time, progress, scene);
    }

    function drawTimeline(width, height, progress) {
        const y = height * 0.82;
        const left = width * 0.08;
        const right = width * 0.92;
        context.strokeStyle = 'rgba(255,255,255,0.18)';
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(left, y);
        context.lineTo(right, y);
        context.stroke();

        context.strokeStyle = 'rgba(255,255,255,0.78)';
        context.beginPath();
        context.moveTo(left, y);
        context.lineTo(left + (right - left) * progress, y);
        context.stroke();

        scenes.forEach((scene, index) => {
            const x = left + ((right - left) * index) / Math.max(1, scenes.length - 1);
            const active = index === activeIndex;
            context.fillStyle = active ? scene.palette[1] : 'rgba(255,255,255,0.38)';
            context.beginPath();
            context.arc(x, y, active ? 7 : 4, 0, Math.PI * 2);
            context.fill();
            if (active) {
                context.fillStyle = 'rgba(255,255,255,0.82)';
                context.font = '700 12px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif';
                context.fillText(formatDate(scene.item.firstKnownDate), x - 28, y - 18);
            }
        });
    }

    function drawLetterbox(width, height) {
        context.fillStyle = 'rgba(0,0,0,0.9)';
        context.fillRect(0, 0, width, Math.max(30, height * 0.055));
        context.fillRect(0, height - Math.max(30, height * 0.055), width, Math.max(30, height * 0.055));
        const vignette = context.createRadialGradient(width * 0.58, height * 0.44, height * 0.12, width * 0.58, height * 0.44, height * 0.78);
        vignette.addColorStop(0, 'rgba(0,0,0,0)');
        vignette.addColorStop(1, 'rgba(0,0,0,0.72)');
        context.fillStyle = vignette;
        context.fillRect(0, 0, width, height);
    }

    function renderFrame(time) {
        animationId = null;
        if (!scenes.length) return;
        if (document.hidden) return;
        const width = canvas.clientWidth || window.innerWidth;
        const height = canvas.clientHeight || window.innerHeight;
        const totalDuration = sceneDuration * scenes.length;
        const rawElapsed = running ? time - startedAt : (pausedAt || time) - startedAt;
        const elapsed = ((rawElapsed % totalDuration) + totalDuration) % totalDuration;
        activeIndex = Math.min(scenes.length - 1, Math.floor(elapsed / sceneDuration));
        const sceneProgress = (elapsed % sceneDuration) / sceneDuration;
        const scene = scenes[activeIndex];
        const playbackProgress = (activeIndex + sceneProgress) / scenes.length;
        const timelineProgress = scenes.length === 1
            ? sceneProgress
            : (activeIndex + sceneProgress) / (scenes.length - 1);
        const visualTime = running ? time : (pausedAt || time);

        drawBackground(width, height, visualTime, scene, sceneProgress);
        drawSceneArt(width, height, visualTime, sceneProgress, scene);
        drawTimeline(width, height, Math.min(1, timelineProgress));
        drawLetterbox(width, height);

        if (activeIndex !== lastRenderedIndex) {
            updateSceneText(scene);
            lastRenderedIndex = activeIndex;
        }
        updateProgress(playbackProgress);
        if (running) requestRender();
    }

    function updateProgress(progress) {
        const normalized = Math.max(0, Math.min(1, progress));
        progressEl.style.transform = `scaleX(${normalized})`;
        const progressPercent = Math.round(normalized * 100);
        if (progressPercent !== lastProgressPercent) {
            progressTrackEl.setAttribute('aria-valuenow', String(progressPercent));
            lastProgressPercent = progressPercent;
        }
        if (scenes.length && activeIndex !== lastProgressScene) {
            progressTrackEl.setAttribute(
                'aria-valuetext',
                `Scene ${activeIndex + 1} of ${scenes.length}: ${scenes[activeIndex].title || scenes[activeIndex].item.name}`
            );
            lastProgressScene = activeIndex;
        }
    }

    function updateSceneText(scene) {
        kickerEl.textContent = `${formatDate(scene.item.firstKnownDate)} · ${scene.item.era || 'Unknown era'} · ${sourcePhrase(scene, currentTrace)}`;
        titleEl.textContent = scene.title || scene.item.name;
        captionEl.textContent = scene.caption;
        metaEl.textContent = scene.target
            ? 'Target technology'
            : `${scene.item.name} · ${scene.edge?.type ? scene.edge.type.replaceAll('_', ' ') : 'dependency'}`;
        [...sceneListEl.children].forEach((child, index) => {
            const active = index === activeIndex;
            child.classList.toggle('is-active', active);
            if (active) child.setAttribute('aria-current', 'step');
            else child.removeAttribute('aria-current');
        });
        const activeButton = sceneListEl.children[activeIndex];
        if (activeButton && sceneListEl.scrollWidth > sceneListEl.clientWidth) {
            const listBounds = sceneListEl.getBoundingClientRect();
            const buttonBounds = activeButton.getBoundingClientRect();
            if (buttonBounds.left < listBounds.left) {
                sceneListEl.scrollLeft -= listBounds.left - buttonBounds.left;
            } else if (buttonBounds.right > listBounds.right) {
                sceneListEl.scrollLeft += buttonBounds.right - listBounds.right;
            }
        }
    }

    function seekToScene(index, { focus = false, announce = false } = {}) {
        if (!scenes.length) return;
        const normalizedIndex = ((index % scenes.length) + scenes.length) % scenes.length;
        const now = performance.now();
        activeIndex = normalizedIndex;
        startedAt = now - normalizedIndex * sceneDuration;
        pausedAt = running ? null : now;
        lastRenderedIndex = normalizedIndex;
        updateSceneText(scenes[normalizedIndex]);
        updateProgress(normalizedIndex / scenes.length);
        requestRender();
        if (announce && targetInput.getAttribute('aria-invalid') !== 'true') {
            const scene = scenes[normalizedIndex];
            setStatus(`Scene ${normalizedIndex + 1} of ${scenes.length}: ${scene.title || scene.item.name}`);
        }
        if (focus) sceneListEl.children[normalizedIndex]?.focus();
    }

    function renderSceneList() {
        sceneListEl.replaceChildren();
        scenes.forEach((scene, index) => {
            const button = document.createElement('button');
            const date = document.createElement('span');
            const title = document.createElement('strong');
            button.type = 'button';
            date.textContent = formatDate(scene.item.firstKnownDate);
            title.textContent = scene.title || scene.item.name;
            button.append(date, title);
            button.setAttribute('aria-label', `Scene ${index + 1} of ${scenes.length}: ${date.textContent}, ${title.textContent}`);
            button.addEventListener('click', () => seekToScene(index));
            button.addEventListener('keydown', event => {
                let nextIndex = null;
                if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = index - 1;
                if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = index + 1;
                if (event.key === 'Home') nextIndex = 0;
                if (event.key === 'End') nextIndex = scenes.length - 1;
                if (nextIndex === null) return;
                event.preventDefault();
                seekToScene(nextIndex, { focus: true });
            });
            sceneListEl.appendChild(button);
        });
    }

    function setTarget(id) {
        if (!id || !graph?.byId.has(id)) return;
        targetId = id;
        currentTrace = buildTrace(id);
        scenes = buildScenes(currentTrace);
        lastRenderedIndex = -1;
        lastProgressPercent = -1;
        lastProgressScene = -1;
        activeIndex = 0;
        startedAt = performance.now();
        pausedAt = running ? null : startedAt;
        targetInput.value = currentTrace.target.name;
        targetInput.setAttribute('aria-invalid', 'false');
        updateUrl();
        renderSceneList();
        updateSceneText(scenes[0]);
        updateProgress(0);
        presetButtons.forEach(button => {
            const active = button.dataset.documentaryTarget === targetId;
            button.classList.toggle('is-active', active);
            button.setAttribute('aria-pressed', String(active));
        });
        setStatus(traceStatus());
        requestRender();
    }

    function updatePlaybackControl() {
        playToggle.textContent = running ? 'Pause' : 'Play';
        playToggle.setAttribute('aria-label', running ? 'Pause documentary' : 'Play documentary');
    }

    function setRunning(value, { userInitiated = false } = {}) {
        const nextRunning = Boolean(value);
        if (userInitiated) playbackPreferenceOverridden = true;
        if (nextRunning === running) {
            updatePlaybackControl();
            requestRender();
            return;
        }
        const now = performance.now();
        if (nextRunning) {
            if (pausedAt !== null) startedAt += now - pausedAt;
            pausedAt = null;
        } else {
            pausedAt = now;
        }
        running = nextRunning;
        updatePlaybackControl();
        if (running) {
            requestRender();
            return;
        }
        if (animationId !== null) window.cancelAnimationFrame(animationId);
        animationId = null;
        requestRender();
    }

    function commitTargetInput() {
        const id = parseTargetValue(targetInput.value);
        if (id) {
            setTarget(id);
            return;
        }
        targetInput.setAttribute('aria-invalid', 'true');
        setStatus('Target not found. Choose a technology from the suggestions.', 'error');
    }

    function handleReducedMotionChange(event) {
        if (!playbackPreferenceOverridden) setRunning(!event.matches);
    }

    updatePlaybackControl();

    try {
        setStatus('Loading graph...');
        const response = await fetch('api/tech-tree');
        if (!response.ok) throw new Error('Failed to load technology graph');
        techData = await response.json();
        graph = buildGraph(techData);

        const options = techData
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(item => {
                const option = document.createElement('option');
                option.value = `${item.name} [${item.id}]`;
                return option;
            });
        targetOptionsEl.replaceChildren(...options);

        presetButtons.forEach(button => {
            button.addEventListener('click', () => setTarget(button.dataset.documentaryTarget));
        });
        targetInput.addEventListener('change', commitTargetInput);
        targetInput.addEventListener('input', () => {
            targetInput.setAttribute('aria-invalid', 'false');
            if (currentTrace) setStatus(traceStatus());
        });
        targetInput.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                targetInput.value = currentTrace?.target.name || '';
                targetInput.setAttribute('aria-invalid', 'false');
                if (currentTrace) {
                    setStatus(traceStatus());
                }
                return;
            }
            if (event.key === 'Enter') {
                event.preventDefault();
                commitTargetInput();
            }
        });
        previousButton.addEventListener('click', () => seekToScene(activeIndex - 1, { announce: true }));
        nextButton.addEventListener('click', () => seekToScene(activeIndex + 1, { announce: true }));
        playToggle.addEventListener('click', () => setRunning(!running, { userInitiated: true }));
        canvas.addEventListener('click', () => {
            seekToScene(activeIndex + 1);
            if (!running) setRunning(true, { userInitiated: true });
        });
        window.addEventListener('resize', queueCanvasResize, { passive: true });
        if ('ResizeObserver' in window) {
            resizeObserver = new ResizeObserver(queueCanvasResize);
            resizeObserver.observe(canvas);
        }
        document.addEventListener('visibilitychange', () => {
            const now = performance.now();
            if (document.hidden) {
                hiddenAt = now;
                if (animationId !== null) window.cancelAnimationFrame(animationId);
                animationId = null;
                return;
            }
            if (running && hiddenAt !== null) startedAt += now - hiddenAt;
            hiddenAt = null;
            requestRender();
        });
        if (typeof reducedMotionQuery.addEventListener === 'function') {
            reducedMotionQuery.addEventListener('change', handleReducedMotionChange);
        } else {
            reducedMotionQuery.addListener(handleReducedMotionChange);
        }

        resizeCanvas();
        setTarget(getInitialTarget());
        stageEl.setAttribute('aria-busy', 'false');
        requestRender();
    } catch (error) {
        console.error(error);
        setStatus('Failed to load demo.', 'error');
        titleEl.textContent = 'TechTree demo failed to load';
        captionEl.textContent = error.message;
        stageEl.setAttribute('aria-busy', 'false');
    }

    window.addEventListener('beforeunload', () => {
        if (animationId !== null) window.cancelAnimationFrame(animationId);
        if (resizeAnimationId !== null) window.cancelAnimationFrame(resizeAnimationId);
        resizeObserver?.disconnect();
        if (typeof reducedMotionQuery.removeEventListener === 'function') {
            reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
        } else {
            reducedMotionQuery.removeListener(handleReducedMotionChange);
        }
    });
});
