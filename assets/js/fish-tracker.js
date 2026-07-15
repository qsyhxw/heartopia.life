(() => {
    const fishData = Array.isArray(window.heartopiaFishData) ? window.heartopiaFishData : [];
    const storageKey = 'heartopia.collection.fish';
    const legacyKey = 'heartopia-fish-caught-v2';

    function normalizeItemName(value) {
        return String(value || '').replace(/[★☆]/g, '').replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
    }
    function readArray(key) { try { const value = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(value) ? value : []; } catch (error) { return []; } }
    function writeCaught(set) { try { localStorage.setItem(storageKey, JSON.stringify([...set].sort())); } catch (error) {} }
    function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character])); }

    let caughtFish = new Set(readArray(storageKey).map(String));
    const legacy = readArray(legacyKey);
    if (legacy.length) {
        legacy.forEach((id) => { const fish = fishData.find((entry) => Number(entry.id) === Number(id)); if (fish) caughtFish.add(normalizeItemName(fish.name)); });
        writeCaught(caughtFish);
        try { localStorage.removeItem(legacyKey); } catch (error) {}
    }

    function isCaught(fish) { return caughtFish.has(normalizeItemName(fish.name)); }
    function saveCaughtFish() { writeCaught(caughtFish); }
    function toggleFish(name) { const id = normalizeItemName(name); if (caughtFish.has(id)) caughtFish.delete(id); else caughtFish.add(id); saveCaughtFish(); renderFish(); updateStats(); }
    function updateStats() { const total = fishData.length, caught = fishData.filter(isCaught).length, percent = total ? Math.round((caught / total) * 100) : 0; document.getElementById('caught-count').textContent = caught; document.getElementById('total-count').textContent = total; document.getElementById('progress-bar').style.width = `${percent}%`; document.getElementById('progress-percent').textContent = `${percent}%`; }
    function currentFilters() { return { query: document.getElementById('filter-search').value.trim().toLowerCase(), location: document.getElementById('filter-location').value, weather: document.getElementById('filter-weather').value, time: document.getElementById('filter-time').value, level: document.getElementById('filter-level').value, status: document.getElementById('filter-status').value }; }
    function renderFish() {
        const filters = currentFilters();
        const filtered = fishData.filter((fish) => {
            const searchable = `${fish.name} ${fish.location} ${fish.category} ${fish.shadow}`.toLowerCase();
            return (!filters.query || searchable.includes(filters.query))
                && (filters.location === 'all' || fish.locationType === filters.location)
                && (filters.weather === 'all' || fish.weather.includes(filters.weather))
                && (filters.time === 'all' || fish.time.includes(filters.time))
                && (filters.level === 'all' || fish.level === Number(filters.level))
                && (filters.status === 'all' || (filters.status === 'caught' ? isCaught(fish) : !isCaught(fish)));
        });
        let summary = document.getElementById('fish-filter-summary');
        if (!summary) { summary = document.createElement('p'); summary.id = 'fish-filter-summary'; summary.className = 'mb-4 text-sm text-cozy-wood'; summary.setAttribute('aria-live', 'polite'); document.getElementById('fish-grid').before(summary); }
        summary.textContent = `${filtered.length} fish shown. Catches are shared with the Fish Database and My Progress.`;
        const grid = document.getElementById('fish-grid');
        grid.innerHTML = filtered.length ? filtered.map((fish) => {
            const caught = isCaught(fish);
            return `<button type="button" data-fish-name="${escapeHtml(fish.name)}" aria-label="${caught ? 'Mark as missing' : 'Mark as caught'}: ${escapeHtml(fish.name)}" class="fish-card relative bg-white rounded-xl p-4 border border-cozy-peach/30 text-left transition-all hover:shadow-md ${caught ? 'caught' : ''}"><img src="${escapeHtml(fish.image)}" alt="${escapeHtml(fish.name)} fish image" class="w-20 h-20 object-contain mx-auto rounded-xl bg-cozy-sky/10 p-2 mb-3" loading="lazy" onerror="this.src='/favicon-96x96.png'"><span class="block text-sm font-bold text-center leading-tight mb-1">${escapeHtml(fish.name)}</span><span class="block text-xs text-cozy-wood text-center">${escapeHtml(fish.location)}</span><span class="flex flex-wrap justify-center gap-1 mt-2 text-[11px]"><span class="bg-cozy-peach/40 rounded-full px-2 py-0.5">Lv.${fish.level}</span><span class="bg-cozy-sky/20 rounded-full px-2 py-0.5">${escapeHtml(fish.shadow)}</span></span><span class="block text-[11px] text-cozy-wood text-center mt-2">${escapeHtml(fish.category)}</span><span class="block text-[11px] font-semibold text-cozy-coral text-center mt-1">${escapeHtml(fish.marketValue)}</span></button>`;
        }).join('') : '<div class="col-span-full py-8 text-center text-cozy-wood">No fish match your filters.</div>';
    }
    function applyFilters() { renderFish(); }
    function resetProgress() { if (confirm('Reset all caught fish?')) { caughtFish.clear(); saveCaughtFish(); renderFish(); updateStats(); } }

    window.applyFilters = applyFilters;
    window.resetProgress = resetProgress;
    document.addEventListener('DOMContentLoaded', () => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('progress') === 'uncollected') document.getElementById('filter-status').value = 'uncaught';
        const query = params.get('search')?.trim(); if (query) document.getElementById('filter-search').value = query;
        document.getElementById('fish-grid').addEventListener('click', (event) => { const button = event.target.closest('[data-fish-name]'); if (button) toggleFish(button.dataset.fishName); });
        renderFish(); updateStats();
    });
    window.addEventListener('storage', (event) => { if (event.key === storageKey) { caughtFish = new Set(readArray(storageKey).map(String)); renderFish(); updateStats(); } });
})();
