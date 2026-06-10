document.addEventListener('DOMContentLoaded', async () => {
    const canvas = document.getElementById('documentary-canvas');
    const context = canvas.getContext('2d');
    const titleEl = document.getElementById('documentary-title');
    const kickerEl = document.getElementById('documentary-kicker');
    const captionEl = document.getElementById('documentary-caption');
    const metaEl = document.getElementById('documentary-meta');
    const sceneListEl = document.getElementById('documentary-scenes');
    const progressEl = document.getElementById('documentary-progress');
    const targetInput = document.getElementById('documentary-target');
    const targetOptionsEl = document.getElementById('documentary-target-options');
    const playToggle = document.getElementById('documentary-play-toggle');
    const statusEl = document.getElementById('documentary-status');

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
    let running = true;
    let animationId = null;
    let lastRenderedIndex = -1;

    function setStatus(text) {
        statusEl.textContent = text;
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
        if (bracketMatch && graph.byId.has(bracketMatch[1])) return bracketMatch[1];
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
        while (queue.length) {
            const current = queue.shift();
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
            .filter(entry => trace.ids.includes(entry.from));
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
        const ranked = trace.ids
            .filter(id => id !== trace.target.id)
            .sort((a, b) => scoreMilestone(b, trace, chainSet, targetField) - scoreMilestone(a, trace, chainSet, targetField));
        const picked = compactMilestones(chain, 5);
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
            return `${sourced}/${trace.edges.length} edge receipts in visible trace`;
        }
        if (scene.edge && hasEdgeSource(scene.edge)) return 'edge source checked';
        if (scene.item.sources?.length) return `${scene.item.sources.length} node source${scene.item.sources.length === 1 ? '' : 's'}`;
        return 'needs deeper sourcing';
    }

    function makeCaption(item, edge, target) {
        if (item.id === target.id) {
            return `${target.name} is not one invention in isolation. It is a stack: instruments, methods, delivery systems, assays, and institutions arriving in sequence.`;
        }
        if (edge?.note) return edge.note;
        if (item.description) return item.description;
        return `${item.name} becomes part of the path toward ${target.name}.`;
    }

    function buildScenes(trace) {
        const ids = selectMilestones(trace);
        return ids.map((id, index) => {
            const item = graph.byId.get(id);
            const nextId = ids[index + 1] || trace.target.id;
            const edge = id === trace.target.id ? null : bestEdgeForMilestone(id, nextId, trace);
            return {
                item,
                edge,
                target: id === trace.target.id,
                kind: classifyScene(item),
                palette: eraPalette[item.era] || eraPalette.Unknown,
                caption: makeCaption(item, edge, trace.target)
            };
        });
    }

    function resizeCanvas() {
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        const width = canvas.clientWidth || window.innerWidth;
        const height = canvas.clientHeight || window.innerHeight;
        canvas.width = Math.floor(width * ratio);
        canvas.height = Math.floor(height * ratio);
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
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

    function drawSceneArt(width, height, time, progress, scene) {
        if (scene.kind === 'genome') drawGenome(width, height, time, progress, scene);
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
        if (!scenes.length) return;
        const width = canvas.clientWidth || window.innerWidth;
        const height = canvas.clientHeight || window.innerHeight;
        const duration = 4400;
        const totalDuration = duration * scenes.length;
        const elapsed = running ? (time - startedAt) % totalDuration : (pausedAt - startedAt) % totalDuration;
        activeIndex = Math.min(scenes.length - 1, Math.floor(elapsed / duration));
        const sceneProgress = (elapsed % duration) / duration;
        const scene = scenes[activeIndex];
        const globalProgress = (activeIndex + sceneProgress) / Math.max(1, scenes.length - 1);

        drawBackground(width, height, time, scene, sceneProgress);
        drawSceneArt(width, height, time, sceneProgress, scene);
        drawTimeline(width, height, Math.min(1, globalProgress));
        drawLetterbox(width, height);

        if (activeIndex !== lastRenderedIndex) {
            updateSceneText(scene);
            lastRenderedIndex = activeIndex;
        }
        progressEl.style.transform = `scaleX(${Math.min(1, globalProgress)})`;
        animationId = window.requestAnimationFrame(renderFrame);
    }

    function updateSceneText(scene) {
        kickerEl.textContent = `${formatDate(scene.item.firstKnownDate)} · ${scene.item.era || 'Unknown era'} · ${sourcePhrase(scene, currentTrace)}`;
        titleEl.textContent = scene.item.name;
        captionEl.textContent = scene.caption;
        metaEl.textContent = scene.target
            ? 'Target technology'
            : `${scene.edge?.type ? scene.edge.type.replaceAll('_', ' ') : 'dependency'} · ${scene.edge?.confidence !== undefined ? `${Math.round(scene.edge.confidence * 100)}% confidence` : 'confidence unknown'}`;
        [...sceneListEl.children].forEach((child, index) => child.classList.toggle('is-active', index === activeIndex));
    }

    function renderSceneList() {
        sceneListEl.replaceChildren();
        scenes.forEach((scene, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.innerHTML = `<span>${formatDate(scene.item.firstKnownDate)}</span><strong>${scene.item.name}</strong>`;
            button.addEventListener('click', () => {
                activeIndex = index;
                startedAt = performance.now() - index * 4400;
                if (!running) pausedAt = performance.now();
                updateSceneText(scene);
            });
            sceneListEl.appendChild(button);
        });
    }

    function setTarget(id) {
        if (!id || !graph.byId.has(id)) return;
        targetId = id;
        currentTrace = buildTrace(id);
        scenes = buildScenes(currentTrace);
        lastRenderedIndex = -1;
        activeIndex = 0;
        startedAt = performance.now();
        pausedAt = null;
        targetInput.value = `${currentTrace.target.name} [${currentTrace.target.id}]`;
        updateUrl();
        renderSceneList();
        updateSceneText(scenes[0]);
        setStatus(`${currentTrace.ids.length - 1} prerequisites · ${currentTrace.edges.length} dependency edges`);
    }

    function setRunning(value) {
        running = value;
        playToggle.textContent = running ? 'Pause' : 'Play';
        if (running) {
            const pauseDuration = performance.now() - (pausedAt || performance.now());
            startedAt += pauseDuration;
            pausedAt = null;
        } else {
            pausedAt = performance.now();
        }
    }

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

        document.querySelectorAll('[data-documentary-target]').forEach(button => {
            button.addEventListener('click', () => setTarget(button.dataset.documentaryTarget));
        });
        targetInput.addEventListener('change', () => {
            const id = parseTargetValue(targetInput.value);
            if (id) setTarget(id);
            else setStatus('Target not found.');
        });
        targetInput.addEventListener('keydown', event => {
            if (event.key !== 'Enter') return;
            event.preventDefault();
            const id = parseTargetValue(targetInput.value);
            if (id) setTarget(id);
        });
        playToggle.addEventListener('click', () => setRunning(!running));
        canvas.addEventListener('click', () => {
            startedAt = performance.now() - (((activeIndex + 1) % scenes.length) * 4400);
            if (!running) setRunning(true);
        });
        window.addEventListener('resize', resizeCanvas);

        resizeCanvas();
        setTarget(getInitialTarget());
        animationId = window.requestAnimationFrame(renderFrame);
    } catch (error) {
        console.error(error);
        setStatus('Failed to load demo.');
        titleEl.textContent = 'TechTree demo failed to load';
        captionEl.textContent = error.message;
    }

    window.addEventListener('beforeunload', () => {
        if (animationId) window.cancelAnimationFrame(animationId);
    });
});
