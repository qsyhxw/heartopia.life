(() => {
    const storageKey = 'heartopia.collection.npcs';
    const byId = (id) => document.getElementById(id);
    const elements = { query: byId('npc-query'), location: byId('npc-location'), role: byId('npc-role'), status: byId('npc-status'), clear: byId('npc-clear'), total: byId('npc-total'), met: byId('npc-met'), shown: byId('npc-shown'), progress: byId('npc-progress'), message: byId('npc-status-message'), results: byId('npc-results') };
    let entries = [];
    let met = readSet();

    function readSet() { try { const value = JSON.parse(localStorage.getItem(storageKey) || '[]'); return new Set(Array.isArray(value) ? value.map(String) : []); } catch (error) { return new Set(); } }
    function saveSet() { try { localStorage.setItem(storageKey, JSON.stringify([...met].sort())); } catch (error) {} }
    function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character])); }
    function optionList(values) { return values.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join(''); }
    function listedGift(entry) { const value = String(entry.gifts || '').trim(); return value && value.toLowerCase() !== 'none' ? value : 'No verified preference listed'; }
    function entryCard(entry) {
        const isMet = met.has(entry.name);
        return `<article class="border border-cozy-peach/60 bg-white p-4"><div class="flex gap-4"><img src="${escapeHtml(entry.image)}" alt="${escapeHtml(entry.name)} NPC portrait" class="h-24 w-24 shrink-0 object-contain" loading="lazy" onerror="this.src='/favicon-96x96.png'"><div class="min-w-0 flex-1"><p class="text-xs font-bold text-cozy-sage">${escapeHtml(entry.location || 'Location not listed')}</p><h2 class="mt-1 font-display text-xl font-bold">${escapeHtml(entry.name)}</h2><p class="mt-1 text-sm text-cozy-wood">${escapeHtml(entry.role || 'Role not listed')}</p><button type="button" data-npc-name="${escapeHtml(entry.name)}" class="mt-3 rounded-md border px-3 py-2 text-xs font-bold ${isMet ? 'border-cozy-sage bg-cozy-mint/30 text-cozy-bark' : 'border-cozy-peach text-cozy-wood hover:border-cozy-coral'}">${isMet ? 'Met' : 'Mark met'}</button></div></div><dl class="mt-4 grid gap-3 border-t border-cozy-peach/50 pt-4 text-sm"><div><dt class="font-bold">Gift / turn-in note</dt><dd class="mt-1 text-cozy-wood">${escapeHtml(listedGift(entry))}</dd></div>${entry.saleCount ? `<div><dt class="font-bold">Listed shop entries</dt><dd class="mt-1 text-cozy-wood">${Number(entry.saleCount)}</dd></div>` : ''}</dl><details class="mt-4 border-t border-cozy-peach/50 pt-3 text-sm"><summary class="cursor-pointer font-bold">About this NPC</summary><p class="mt-2 leading-6 text-cozy-wood">${escapeHtml(entry.about || 'No additional profile note is listed.')}</p></details><a href="/npcs/?search=${encodeURIComponent(entry.name)}" class="mt-4 inline-block text-sm font-bold text-cozy-coral hover:underline">Open in NPC directory</a></article>`;
    }
    function render() {
        const query = elements.query.value.trim().toLowerCase(), location = elements.location.value, role = elements.role.value, status = elements.status.value;
        const filtered = entries.filter((entry) => { const haystack = `${entry.name} ${entry.location} ${entry.role} ${entry.gifts} ${entry.about}`.toLowerCase(), isMet = met.has(entry.name); return (!query || haystack.includes(query)) && (location === 'all' || entry.location === location) && (role === 'all' || entry.role === role) && (status === 'all' || (status === 'met' ? isMet : !isMet)); });
        const validMet = [...met].filter((name) => entries.some((entry) => entry.name === name)).length;
        elements.total.textContent = String(entries.length); elements.met.textContent = String(validMet); elements.shown.textContent = String(filtered.length); elements.progress.style.width = `${entries.length ? Math.round((validMet / entries.length) * 100) : 0}%`;
        elements.message.textContent = filtered.length ? `${filtered.length} NPC${filtered.length === 1 ? '' : 's'} shown. Progress is saved only in this browser.` : 'No NPCs match the current filters.';
        elements.results.innerHTML = filtered.map(entryCard).join('');
    }
    async function init() {
        try {
            const response = await fetch('/data/heartopia-npcs.json', { cache: 'no-store' }); if (!response.ok) throw new Error(String(response.status));
            const data = await response.json(); entries = Array.isArray(data.npcs) ? data.npcs : [];
            const validNames = new Set(entries.map((entry) => entry.name)), cleaned = new Set([...met].filter((name) => validNames.has(name))); if (cleaned.size !== met.size) { met = cleaned; saveSet(); }
            elements.location.insertAdjacentHTML('beforeend', optionList([...new Set(entries.map((entry) => entry.location).filter(Boolean))].sort()));
            elements.role.insertAdjacentHTML('beforeend', optionList([...new Set(entries.map((entry) => entry.role).filter(Boolean))].sort())); render();
        } catch (error) { elements.message.textContent = 'NPC data is temporarily unavailable. Open the NPC directory and try again shortly.'; elements.results.innerHTML = '<a href="/npcs/" class="font-bold text-cozy-coral hover:underline">Open NPC directory</a>'; }
    }
    [elements.query, elements.location, elements.role, elements.status].forEach((control) => control.addEventListener(control === elements.query ? 'input' : 'change', render));
    elements.results.addEventListener('click', (event) => { const button = event.target.closest('[data-npc-name]'); if (!button) return; const name = button.dataset.npcName; if (met.has(name)) met.delete(name); else met.add(name); saveSet(); render(); });
    elements.clear.addEventListener('click', () => { if (!met.size || confirm('Clear all NPC meeting marks?')) { met.clear(); saveSet(); render(); } });
    window.addEventListener('storage', (event) => { if (event.key === storageKey) { met = readSet(); render(); } });
    init();
})();
