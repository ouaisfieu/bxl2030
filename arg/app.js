/* ============================================
   LA RÉSERVE - UNIFIED APPLICATION
   ============================================ */

// State
const state = {
    view: 'dashboard',
    actions: JSON.parse(localStorage.getItem('lr-actions') || '[]'),
    recrues: [],
    timeline: [],
    editingId: null,
    theme: localStorage.getItem('lr-theme') || 'sombre',
    typo: localStorage.getItem('lr-typo') || 'elegant'
};

// Init
document.addEventListener('DOMContentLoaded', () => {
    applyTheme(state.theme);
    applyTypo(state.typo);
    initNav();
    initEditor();
    initSettings();
    initFiles();
    renderDashboard();
    renderGuide();
    console.log('🎭 La Réserve initialisée');
});

// Navigation
function initNav() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => showView(item.dataset.view));
    });
    document.getElementById('menuToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });
    document.getElementById('newActionBtn').addEventListener('click', () => {
        resetEditor();
        showView('create');
    });
    document.getElementById('themeToggle').addEventListener('click', cycleTheme);
}

function showView(view) {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.view === view));
    document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === `view-${view}`));
    document.getElementById('viewTitle').textContent = {
        dashboard: 'Tableau de bord', create: 'Créer une action', actions: 'Mes actions',
        files: 'Fichiers', warroom: 'War Room', guide: 'Guide', settings: 'Préférences'
    }[view] || view;
    document.getElementById('sidebar').classList.remove('open');
    state.view = view;
    if (view === 'create') updatePreview();
    if (view === 'actions') renderActions();
    if (view === 'warroom') renderWarroomStats();
}

// Dashboard
function renderDashboard() {
    const total = state.actions.length;
    const recrues = state.actions.reduce((s, a) => s + (a.recrues?.length || 0), 0);
    const bascule = state.actions.filter(a => a.statut === 'bascule').length;
    
    document.getElementById('statsGrid').innerHTML = `
        <div class="stat-card"><div class="stat-value">${total}</div><div class="stat-label">Actions</div></div>
        <div class="stat-card"><div class="stat-value">${recrues}</div><div class="stat-label">Recrues</div></div>
        <div class="stat-card"><div class="stat-value">${bascule}</div><div class="stat-label">Basculées</div></div>
        <div class="stat-card"><div class="stat-value">${Math.min(100, Math.round(total * 2))}%</div><div class="stat-label">Progression</div></div>
    `;
    
    const recent = [...state.actions].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5);
    document.getElementById('recentList').innerHTML = recent.length ? `
        <div class="card"><h3>Actions récentes</h3>
        ${recent.map(a => `
            <div class="list-item" onclick="editAction('${a.id}')" style="cursor:pointer">
                <span>📄</span>
                <div class="list-item-info">
                    <div class="list-item-title">${esc(a.titre || 'Sans titre')}</div>
                    <div class="list-item-sub">${a.cible || ''} • ${formatDate(a.updatedAt)}</div>
                </div>
                <span class="badge">${a.statut}</span>
            </div>
        `).join('')}
        </div>
    ` : '';
    
    document.getElementById('actionsCount').textContent = total;
}

// Editor
function initEditor() {
    // Tabs
    document.querySelectorAll('.editor-tabs .tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.editor-tabs .tab').forEach(t => t.classList.toggle('active', t === tab));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.toggle('active', c.id === `tab-${tab.dataset.tab}`));
        });
    });
    
    // Markdown
    document.querySelectorAll('.md-btn').forEach(btn => {
        btn.addEventListener('click', () => insertMd(btn.dataset.md));
    });
    
    // Auto preview
    ['actionTitle', 'actionDescription', 'actionManifeste'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', debounce(updatePreview, 500));
    });
    
    // Buttons
    document.getElementById('addRecrueBtn').addEventListener('click', () => openModal('recrueModal'));
    document.getElementById('addEventBtn').addEventListener('click', () => {
        document.getElementById('eventDate').value = new Date().toISOString().split('T')[0];
        openModal('eventModal');
    });
    document.getElementById('saveBtn').addEventListener('click', saveAction);
    document.getElementById('exportBtn').addEventListener('click', () => exportAction('html'));
    document.getElementById('fullPreviewBtn').addEventListener('click', openFullPreview);
}

function resetEditor() {
    state.editingId = null;
    state.recrues = [];
    state.timeline = [];
    ['actionTitle', 'actionPseudo', 'actionLieu', 'actionCible', 'actionDescription', 'actionManifeste'].forEach(id => {
        document.getElementById(id).value = '';
    });
    document.getElementById('actionType').value = 'detournement';
    document.getElementById('actionStatut').value = 'brouillon';
    renderRecrues();
    renderTimeline();
    updatePreview();
}

function getFormData() {
    return {
        id: state.editingId || genId(),
        titre: document.getElementById('actionTitle').value,
        pseudo: document.getElementById('actionPseudo').value,
        lieu: document.getElementById('actionLieu').value,
        type: document.getElementById('actionType').value,
        statut: document.getElementById('actionStatut').value,
        cible: document.getElementById('actionCible').value,
        description: document.getElementById('actionDescription').value,
        manifeste: document.getElementById('actionManifeste').value,
        recrues: state.recrues,
        timeline: state.timeline,
        createdAt: state.editingId ? state.actions.find(a => a.id === state.editingId)?.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
}

function fillForm(data) {
    state.editingId = data.id;
    state.recrues = data.recrues || [];
    state.timeline = data.timeline || [];
    document.getElementById('actionTitle').value = data.titre || '';
    document.getElementById('actionPseudo').value = data.pseudo || '';
    document.getElementById('actionLieu').value = data.lieu || '';
    document.getElementById('actionType').value = data.type || 'detournement';
    document.getElementById('actionStatut').value = data.statut || 'brouillon';
    document.getElementById('actionCible').value = data.cible || '';
    document.getElementById('actionDescription').value = data.description || '';
    document.getElementById('actionManifeste').value = data.manifeste || '';
    renderRecrues();
    renderTimeline();
    updatePreview();
}

function saveAction() {
    const data = getFormData();
    if (!data.titre.trim()) return toast('Titre requis', 'error');
    
    const idx = state.actions.findIndex(a => a.id === data.id);
    if (idx >= 0) state.actions[idx] = data;
    else state.actions.push(data);
    
    localStorage.setItem('lr-actions', JSON.stringify(state.actions));
    renderDashboard();
    toast('Action sauvegardée!', 'success');
}

// Recrues
function renderRecrues() {
    const el = document.getElementById('recruesList');
    if (!state.recrues.length) {
        el.innerHTML = '<div class="empty-state"><div class="empty-icon">👥</div>Aucune recrue</div>';
        return;
    }
    const icons = { complice: '🟣', figurant: '🔵', temoin: '🟡', expert: '🟢' };
    el.innerHTML = state.recrues.map((r, i) => `
        <div class="list-item" style="border-left-color: var(--accent-${r.type === 'complice' ? '1' : '2'})">
            <span>${icons[r.type] || '👤'}</span>
            <div class="list-item-info">
                <div class="list-item-title">${esc(r.name)}</div>
                <div class="list-item-sub">${esc(r.role)}</div>
            </div>
            <span class="badge badge-${r.type}">${r.type}</span>
            <button class="btn btn-ghost btn-sm" onclick="deleteRecrue(${i})">🗑️</button>
        </div>
    `).join('');
}

function saveRecrue() {
    const name = document.getElementById('recrueName').value.trim();
    const type = document.getElementById('recrueType').value;
    const role = document.getElementById('recrueRole').value.trim();
    if (!name) return toast('Nom requis', 'error');
    if (state.recrues.length >= 9) return toast('Max 9 recrues', 'error');
    
    state.recrues.push({ name, type, role });
    renderRecrues();
    updatePreview();
    closeModal('recrueModal');
    document.getElementById('recrueName').value = '';
    document.getElementById('recrueRole').value = '';
}

function deleteRecrue(i) {
    state.recrues.splice(i, 1);
    renderRecrues();
    updatePreview();
}

// Timeline
function renderTimeline() {
    const el = document.getElementById('timelineList');
    if (!state.timeline.length) {
        el.innerHTML = '<div class="empty-state"><div class="empty-icon">📅</div>Timeline vide</div>';
        el.className = 'list';
        return;
    }
    el.className = 'timeline';
    const sorted = [...state.timeline].sort((a, b) => new Date(a.date) - new Date(b.date));
    el.innerHTML = sorted.map((e, i) => `
        <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
                <div class="timeline-date">${formatDate(e.date)}</div>
                <strong>${esc(e.title)}</strong>
                ${e.desc ? `<p style="font-size:0.85rem;color:var(--text-muted);margin-top:0.5rem">${esc(e.desc)}</p>` : ''}
                <button class="btn btn-ghost btn-sm" onclick="deleteEvent(${i})" style="margin-top:0.5rem">🗑️</button>
            </div>
        </div>
    `).join('');
}

function saveEvent() {
    const date = document.getElementById('eventDate').value;
    const title = document.getElementById('eventTitle').value.trim();
    const desc = document.getElementById('eventDesc').value.trim();
    if (!date || !title) return toast('Date et titre requis', 'error');
    
    state.timeline.push({ date, title, desc });
    renderTimeline();
    updatePreview();
    closeModal('eventModal');
    document.getElementById('eventTitle').value = '';
    document.getElementById('eventDesc').value = '';
}

function deleteEvent(i) {
    state.timeline.splice(i, 1);
    renderTimeline();
    updatePreview();
}

// Preview
function updatePreview() {
    const data = getFormData();
    document.getElementById('previewIframe').srcdoc = generateHTML(data);
}

function openFullPreview() {
    const html = generateHTML(getFormData());
    const w = window.open('', '_blank');
    w.document.write(html);
}

function generateHTML(d) {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${esc(d.titre || 'Action')} — La Réserve</title>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">
    <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'DM Sans',sans-serif;background:#1a1a2e;color:#e8e8f0;line-height:1.6;min-height:100vh;padding:2rem}
    .container{max-width:800px;margin:0 auto}
    .header{text-align:center;margin-bottom:2rem}
    .logo{font-size:0.9rem;color:#7c3aed;letter-spacing:0.2em;margin-bottom:1rem}
    h1{font-family:'Playfair Display',serif;font-size:2rem;margin-bottom:1rem}
    .meta{display:flex;flex-wrap:wrap;justify-content:center;gap:1rem;color:#a8a8c0;font-size:0.9rem}
    .badge{padding:0.25rem 0.75rem;background:#7c3aed;color:#fff;border-radius:20px;font-size:0.75rem}
    .section{background:#252540;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:1.5rem;margin-bottom:1.5rem}
    .section h2{font-size:1.1rem;margin-bottom:1rem;display:flex;align-items:center;gap:0.5rem}
    blockquote{font-size:1.1rem;font-style:italic;text-align:center;padding:1.5rem;border-left:4px solid #7c3aed;margin-bottom:1.5rem}
    .recrue{display:flex;align-items:center;gap:1rem;padding:0.75rem;background:rgba(255,255,255,0.05);border-radius:8px;margin-bottom:0.5rem}
    .timeline-item{position:relative;padding-left:2rem;padding-bottom:1.5rem;border-left:2px solid rgba(255,255,255,0.1)}
    .timeline-dot{position:absolute;left:-6px;top:0;width:10px;height:10px;background:#7c3aed;border-radius:50%}
    .footer{text-align:center;margin-top:2rem;padding-top:1.5rem;border-top:1px solid rgba(255,255,255,0.1);font-size:0.85rem;color:#6b6b80}
    </style></head><body>
    <div class="container">
    <header class="header"><div class="logo">LA RÉSERVE</div><h1>${esc(d.titre || 'Sans titre')}</h1>
    <div class="meta">${d.pseudo ? `<span>👤 ${esc(d.pseudo)}</span>` : ''}${d.lieu ? `<span>📍 ${esc(d.lieu)}</span>` : ''}${d.cible ? `<span>🎯 ${esc(d.cible)}</span>` : ''}<span class="badge">${d.statut}</span></div></header>
    ${d.manifeste ? `<blockquote>« ${esc(d.manifeste)} »</blockquote>` : ''}
    ${d.description ? `<section class="section"><h2>📝 Description</h2><div>${parseMd(d.description)}</div></section>` : ''}
    ${d.recrues?.length ? `<section class="section"><h2>👥 Recrues (${d.recrues.length}/9)</h2>${d.recrues.map(r => `<div class="recrue"><span>${{complice:'🟣',figurant:'🔵',temoin:'🟡',expert:'🟢'}[r.type]||'👤'}</span><div><strong>${esc(r.name)}</strong><div style="font-size:0.85rem;color:#a8a8c0">${esc(r.role)}</div></div></div>`).join('')}</section>` : ''}
    ${d.timeline?.length ? `<section class="section"><h2>📅 Timeline</h2><div style="padding-left:0.5rem">${[...d.timeline].sort((a,b)=>new Date(a.date)-new Date(b.date)).map(e => `<div class="timeline-item"><div class="timeline-dot"></div><div class="timeline-date" style="font-size:0.8rem;color:#6b6b80">${formatDate(e.date)}</div><strong>${esc(e.title)}</strong>${e.desc?`<p style="color:#a8a8c0;font-size:0.9rem">${esc(e.desc)}</p>`:''}</div>`).join('')}</div></section>` : ''}
    <footer class="footer"><p>Action ${d.id} — La Réserve</p><p>« Ce qui existe déjà mais n'a jamais été reconnu »</p></footer>
    </div></body></html>`;
}

// Actions list
function renderActions() {
    const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
    let filtered = state.actions;
    if (search) filtered = filtered.filter(a => a.titre?.toLowerCase().includes(search) || a.cible?.toLowerCase().includes(search));
    
    document.getElementById('actionsGrid').innerHTML = filtered.length ? filtered.map(a => `
        <div class="card" onclick="editAction('${a.id}')" style="cursor:pointer">
            <div class="flex-between" style="margin-bottom:0.75rem">
                <h3 style="font-size:1.1rem">${esc(a.titre || 'Sans titre')}</h3>
                <span class="badge">${a.statut}</span>
            </div>
            <p style="font-size:0.9rem;color:var(--text-muted);margin-bottom:1rem">${esc((a.description||'').substring(0,100))}...</p>
            <div style="display:flex;gap:1rem;font-size:0.8rem;color:var(--text-muted)">
                <span>👥 ${a.recrues?.length||0}</span><span>📅 ${a.timeline?.length||0}</span>
            </div>
            <div style="margin-top:1rem;display:flex;gap:0.5rem">
                <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();duplicateAction('${a.id}')">📋</button>
                <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();exportActionById('${a.id}')">📤</button>
                <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();deleteAction('${a.id}')">🗑️</button>
            </div>
        </div>
    `).join('') : '<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">📋</div>Aucune action<br><button class="btn btn-primary" onclick="showView(\'create\')" style="margin-top:1rem">Créer une action</button></div>';
}

function editAction(id) {
    const action = state.actions.find(a => a.id === id);
    if (action) { fillForm(action); showView('create'); }
}

function duplicateAction(id) {
    const a = state.actions.find(x => x.id === id);
    if (a) {
        state.actions.push({ ...a, id: genId(), titre: a.titre + ' (copie)', createdAt: new Date().toISOString() });
        localStorage.setItem('lr-actions', JSON.stringify(state.actions));
        renderActions();
        renderDashboard();
        toast('Action dupliquée', 'success');
    }
}

function deleteAction(id) {
    if (confirm('Supprimer cette action?')) {
        state.actions = state.actions.filter(a => a.id !== id);
        localStorage.setItem('lr-actions', JSON.stringify(state.actions));
        renderActions();
        renderDashboard();
        toast('Action supprimée', 'success');
    }
}

document.getElementById('searchInput')?.addEventListener('input', debounce(renderActions, 300));

// Files
function initFiles() {
    const imports = [
        { icon: '📄', label: 'JSON', accept: '.json', type: 'json' },
        { icon: '📝', label: 'Markdown', accept: '.md', type: 'md' },
        { icon: '🌐', label: 'HTML', accept: '.html', type: 'html' }
    ];
    const exports = [
        { icon: '📄', label: 'JSON', type: 'json' },
        { icon: '📝', label: 'Markdown', type: 'md' },
        { icon: '🌐', label: 'HTML', type: 'html' },
        { icon: '📃', label: 'TXT', type: 'txt' }
    ];
    
    document.getElementById('importGrid').innerHTML = imports.map(f => `
        <label class="file-btn"><input type="file" accept="${f.accept}" style="display:none" onchange="importFile(this,'${f.type}')">
        <span class="file-icon">${f.icon}</span><span class="file-label">${f.label}</span></label>
    `).join('');
    
    document.getElementById('exportGrid').innerHTML = exports.map(f => `
        <button class="file-btn" onclick="exportAction('${f.type}')">
        <span class="file-icon">${f.icon}</span><span class="file-label">${f.label}</span></button>
    `).join('');
}

function importFile(input, type) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        try {
            let data;
            if (type === 'json') data = JSON.parse(e.target.result);
            else if (type === 'md') data = { titre: file.name.replace('.md',''), description: e.target.result };
            else data = { titre: file.name };
            fillForm(data);
            showView('create');
            toast('Fichier importé', 'success');
        } catch (err) { toast('Erreur d\'import', 'error'); }
    };
    reader.readAsText(file);
    input.value = '';
}

function exportAction(type) {
    const data = getFormData();
    if (!data.titre) return toast('Créez une action d\'abord', 'error');
    
    let content, filename, mime;
    switch (type) {
        case 'json':
            content = JSON.stringify(data, null, 2);
            filename = `${data.id}.json`;
            mime = 'application/json';
            break;
        case 'md':
            content = `# ${data.titre}\n\n${data.manifeste ? `> ${data.manifeste}\n\n` : ''}${data.description || ''}`;
            filename = `${data.id}.md`;
            mime = 'text/markdown';
            break;
        case 'html':
            content = generateHTML(data);
            filename = `${data.id}.html`;
            mime = 'text/html';
            break;
        case 'txt':
            content = `${data.titre}\n${'='.repeat(40)}\n\n${data.description || ''}`;
            filename = `${data.id}.txt`;
            mime = 'text/plain';
            break;
    }
    
    download(content, filename, mime);
    toast(`Exporté en ${type.toUpperCase()}`, 'success');
}

function exportActionById(id) {
    const a = state.actions.find(x => x.id === id);
    if (a) download(generateHTML(a), `${a.id}.html`, 'text/html');
}

function exportAll() {
    const data = { version: '1.0', exportedAt: new Date().toISOString(), actions: state.actions, settings: { theme: state.theme, typo: state.typo } };
    download(JSON.stringify(data, null, 2), 'lareserve-backup.json', 'application/json');
    toast('Données exportées', 'success');
}

function clearAll() {
    if (confirm('Effacer TOUTES les données?') && confirm('Vraiment sûr?')) {
        localStorage.clear();
        state.actions = [];
        renderDashboard();
        renderActions();
        toast('Données effacées', 'success');
    }
}

// Settings
function initSettings() {
    const themes = [
        { id: 'sombre', name: 'Sombre', colors: '#1a1a2e,#16213e' },
        { id: 'clair', name: 'Clair', colors: '#f8f9fa,#e9ecef' },
        { id: 'neon', name: 'Néon', colors: '#00ff88,#ff0080' },
        { id: 'retrogeek', name: 'Retrogeek', colors: '#2b1b3d,#00ff00' },
        { id: 'console', name: 'Console', colors: '#0c0c0c,#00ff00' },
        { id: 'warroom', name: 'War Room', colors: '#001100,#00ff41' }
    ];
    const typos = [
        { id: 'elegant', name: 'Élégant', font: 'Playfair Display' },
        { id: 'editorial', name: 'Éditorial', font: 'Syne' },
        { id: 'raw', name: 'Brut', font: 'Fira Code' }
    ];
    
    document.getElementById('themeGrid').innerHTML = themes.map(t => `
        <div class="theme-option ${t.id === state.theme ? 'active' : ''}" onclick="applyTheme('${t.id}')">
            <div class="theme-preview" style="background:linear-gradient(135deg,${t.colors})"></div>
            <div class="theme-name">${t.name}</div>
        </div>
    `).join('');
    
    document.getElementById('typoGrid').innerHTML = typos.map(t => `
        <div class="typo-option ${t.id === state.typo ? 'active' : ''}" onclick="applyTypo('${t.id}')">
            <div class="typo-name" style="font-family:'${t.font}',serif">${t.name}</div>
        </div>
    `).join('');
}

function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('lr-theme', theme);
    document.querySelectorAll('.theme-option').forEach(o => o.classList.toggle('active', o.textContent.toLowerCase().includes(theme)));
}

function applyTypo(typo) {
    state.typo = typo;
    document.documentElement.setAttribute('data-typography', typo);
    localStorage.setItem('lr-typo', typo);
    document.querySelectorAll('.typo-option').forEach(o => o.classList.toggle('active', o.textContent.toLowerCase().includes(typo.substring(0,4))));
}

function cycleTheme() {
    const themes = ['sombre', 'clair', 'neon', 'retrogeek', 'console', 'warroom'];
    const next = themes[(themes.indexOf(state.theme) + 1) % themes.length];
    applyTheme(next);
    toast(`Thème: ${next}`, 'success');
}

// War Room
function renderWarroomStats() {
    const targets = [
        { name: 'FOREM', status: 'infiltrated' },
        { name: 'VDAB', status: 'in-progress' },
        { name: 'Actiris', status: 'infiltrated' },
        { name: 'ONEM', status: 'in-progress' },
        { name: 'CPAS', status: 'locked' }
    ];
    document.getElementById('warroomStats').innerHTML = `
        <div class="stat-card" style="border-left:4px solid var(--terminal-green)"><div class="stat-value" style="color:var(--terminal-green)">67%</div><div class="stat-label">Belgique</div></div>
        <div class="stat-card" style="border-left:4px solid var(--terminal-amber)"><div class="stat-value" style="color:var(--terminal-amber)">12%</div><div class="stat-label">Europe</div></div>
        <div class="stat-card" style="border-left:4px solid #06b6d4"><div class="stat-value" style="color:#06b6d4">3%</div><div class="stat-label">Monde</div></div>
        <div class="stat-card"><div class="stat-value">${state.actions.length}</div><div class="stat-label">Actions</div></div>
    `;
}

function launchWarRoom() {
    const overlay = document.getElementById('warroomOverlay');
    overlay.classList.add('active');
    overlay.innerHTML = `
        <div style="display:flex;flex-direction:column;height:100vh;background:#000;color:var(--terminal-green);font-family:'Share Tech Mono',monospace">
            <header style="display:flex;justify-content:space-between;align-items:center;padding:1rem 2rem;background:#001100;border-bottom:2px solid var(--terminal-green)">
                <span style="font-family:'Orbitron',sans-serif;font-size:1.5rem;letter-spacing:0.3em;text-shadow:0 0 10px var(--terminal-green)">LA RÉSERVE</span>
                <span style="color:var(--terminal-amber);font-size:1.2rem" id="wrTime">${new Date().toLocaleTimeString()}</span>
                <button onclick="closeWarRoom()" style="padding:0.5rem 1rem;background:transparent;border:1px solid var(--terminal-red);color:var(--terminal-red);cursor:pointer">FERMER</button>
            </header>
            <main style="flex:1;display:grid;grid-template-columns:1fr 2fr 1fr;gap:2px;padding:2px;background:#002200">
                <div style="background:rgba(0,20,0,0.9);padding:1rem">
                    <h3 style="font-size:0.8rem;letter-spacing:0.1em;margin-bottom:1rem;border-bottom:1px solid rgba(0,255,65,0.3);padding-bottom:0.5rem">🎯 CIBLES</h3>
                    ${['FOREM ✓', 'VDAB ⚡', 'Actiris ✓', 'ONEM ⚡', 'CPAS ✗'].map(t => `<div style="padding:0.5rem;margin-bottom:0.5rem;background:rgba(0,255,65,0.05);border-left:3px solid ${t.includes('✓')?'var(--terminal-green)':t.includes('⚡')?'var(--terminal-amber)':'var(--terminal-red)'}">${t}</div>`).join('')}
                </div>
                <div style="background:rgba(0,20,0,0.9);padding:1rem;position:relative">
                    <h3 style="font-size:0.8rem;letter-spacing:0.1em;margin-bottom:1rem">🗺️ CARTE TACTIQUE — BELGIQUE</h3>
                    <svg viewBox="0 0 400 300" style="width:100%;height:calc(100% - 40px)">
                        <g fill="rgba(0,50,0,0.5)" stroke="var(--terminal-green)" stroke-width="1">
                            <ellipse cx="200" cy="150" rx="150" ry="100"/>
                            <circle cx="200" cy="120" r="20" fill="rgba(0,255,65,0.3)"/>
                        </g>
                        <circle cx="200" cy="120" r="8" fill="var(--terminal-green)"><animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite"/></circle>
                        <text x="220" y="125" fill="var(--terminal-green)" font-size="12">HQ</text>
                    </svg>
                    <div style="position:absolute;top:50%;left:50%;width:200%;height:200%;transform:translate(-50%,-50%);background:conic-gradient(from 0deg,transparent 0deg,rgba(0,255,65,0.1) 30deg,transparent 60deg);animation:sweep 4s linear infinite;pointer-events:none"></div>
                    <style>@keyframes sweep{from{transform:translate(-50%,-50%) rotate(0deg)}to{transform:translate(-50%,-50%) rotate(360deg)}}</style>
                </div>
                <div style="background:rgba(0,20,0,0.9);padding:1rem">
                    <h3 style="font-size:0.8rem;letter-spacing:0.1em;margin-bottom:1rem;border-bottom:1px solid rgba(0,255,65,0.3);padding-bottom:0.5rem">📊 STATS</h3>
                    <div style="text-align:center;padding:1rem;background:rgba(0,255,65,0.1);margin-bottom:1rem"><div style="font-size:2rem;font-weight:bold">67%</div><div style="font-size:0.7rem;opacity:0.7">BELGIQUE</div></div>
                    <div style="font-size:0.75rem" id="wrOps"></div>
                </div>
            </main>
            <footer style="display:flex;justify-content:space-between;align-items:center;padding:0.5rem 2rem;background:#001100;border-top:2px solid var(--terminal-green)">
                <span>● UPTIME: <span id="wrUptime">00:00:00</span></span>
                <span style="color:var(--terminal-amber);animation:marquee 20s linear infinite;white-space:nowrap">⚠️ OPÉRATION WAFFLE EN COURS — PHASE 1: BELGIQUE — "CE QUI EXISTE DÉJÀ MAIS N'A JAMAIS ÉTÉ RECONNU"</span>
                <button onclick="toast('🌟 BASCULEMENT INITIÉ','success')" style="padding:0.5rem 1rem;background:transparent;border:1px solid var(--terminal-amber);color:var(--terminal-amber);cursor:pointer">🌟 BASCULEMENT</button>
            </footer>
        </div>
        <style>@keyframes marquee{0%{transform:translateX(100%)}100%{transform:translateX(-100%)}}</style>
    `;
    
    // Updates
    const start = Date.now();
    const interval = setInterval(() => {
        if (!overlay.classList.contains('active')) { clearInterval(interval); return; }
        document.getElementById('wrTime').textContent = new Date().toLocaleTimeString();
        const s = Math.floor((Date.now() - start) / 1000);
        document.getElementById('wrUptime').textContent = `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor((s%3600)/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
    }, 1000);
}

function closeWarRoom() {
    document.getElementById('warroomOverlay').classList.remove('active');
}

// Guide
function renderGuide() {
    document.getElementById('guideContent').innerHTML = `
        <h1>📖 Guide de La Réserve</h1>
        <h2>🎭 Concept</h2>
        <p><strong>La Réserve</strong> est un ARG (Alternate Reality Game) participatif sur l'emploi et la bureaucratie en Belgique.</p>
        <blockquote>« Ce qui existe déjà mais n'a jamais été reconnu »</blockquote>
        
        <h2>⚙️ Comment ça marche ?</h2>
        <h3>1. Détourner</h3>
        <p>Créez une action en détournant une offre d'emploi, un formulaire administratif, ou tout document bureaucratique.</p>
        
        <h3>2. Recruter</h3>
        <p>Constituez une équipe de 9 recrues maximum :</p>
        <ul>
            <li><strong>Complice</strong> 🟣 — Participe activement</li>
            <li><strong>Figurant·e</strong> 🔵 — Apparaît sans contexte</li>
            <li><strong>Témoin</strong> 🟡 — Observe et documente</li>
            <li><strong>Expert·e</strong> 🟢 — Apporte une expertise</li>
        </ul>
        
        <h3>3. Documenter</h3>
        <p>Construisez une timeline détaillée avec les étapes de votre action.</p>
        
        <h3>4. Basculer</h3>
        <p>Si votre action rencontre un succès, elle peut "basculer" du fictif vers le réel.</p>
        
        <h2>🚫 Limites</h2>
        <p>Seules contraintes : <strong>le droit réel</strong> et <strong>les aléas de la vie</strong>.</p>
        
        <h2>🎛️ War Room</h2>
        <p>Le centre de commandement tactique permet de visualiser la progression du "piratage pacifique" de la Belgique.</p>
    `;
}

// Modals
function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

document.querySelectorAll('.modal-overlay').forEach(m => {
    m.addEventListener('click', e => { if (e.target === m) m.classList.remove('active'); });
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active')); });

// Toast
function toast(msg, type = 'info') {
    const container = document.getElementById('toastContainer');
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<span>${{success:'✅',error:'❌',warning:'⚠️',info:'ℹ️'}[type]||'ℹ️'}</span><span>${msg}</span>`;
    container.appendChild(t);
    setTimeout(() => { t.style.animation = 'toastIn 0.3s reverse'; setTimeout(() => t.remove(), 300); }, 3000);
}

// Utils
function genId() { return 'LR-' + Math.random().toString(36).substr(2, 9).toUpperCase(); }
function esc(s) { return s ? String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])) : ''; }
function formatDate(d) { try { return new Date(d).toLocaleDateString('fr-BE', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return d; } }
function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
function download(content, filename, mime) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type: mime }));
    a.download = filename;
    a.click();
}

function insertMd(type) {
    const ta = document.getElementById('actionDescription');
    const s = ta.selectionStart, e = ta.selectionEnd, txt = ta.value, sel = txt.substring(s, e);
    const wrap = { bold: ['**', '**'], italic: ['_', '_'], heading: ['## ', ''], list: ['- ', ''], link: ['[', '](url)'] };
    const [b, a] = wrap[type] || ['', ''];
    ta.value = txt.substring(0, s) + b + (sel || 'texte') + a + txt.substring(e);
    ta.focus();
    updatePreview();
}

function parseMd(t) {
    return t.replace(/^### (.*)$/gm, '<h3>$1</h3>').replace(/^## (.*)$/gm, '<h2>$1</h2>').replace(/^# (.*)$/gm, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>')
        .replace(/^- (.*)$/gm, '<li>$1</li>').replace(/\n/g, '<br>');
}

// Keyboard shortcuts
document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); if (state.view === 'create') saveAction(); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') { e.preventDefault(); resetEditor(); showView('create'); }
});

console.log(`
╔═══════════════════════════════════════════════════════════╗
║                    LA RÉSERVE v1.0                        ║
║     « Ce qui existe déjà mais n'a jamais été reconnu »    ║
╚═══════════════════════════════════════════════════════════╝
`);
