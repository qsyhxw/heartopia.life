(function () {
    const progressItems = [
        {
            id: 'fish',
            title: 'Fish collected',
            icon: '🐟',
            storageKey: 'heartopia.collection.fish',
            total: 112,
            url: '/database/fish/',
            action: 'Open fish database',
            color: 'sky'
        },
        {
            id: 'insects',
            title: 'Insects collected',
            icon: '🦋',
            storageKey: 'heartopia.collection.insects',
            total: 91,
            url: '/database/insects/',
            action: 'Open insect database',
            color: 'sage'
        },
        {
            id: 'birds',
            title: 'Birds photographed',
            icon: '🐦',
            storageKey: 'heartopia.collection.birds',
            total: 92,
            url: '/database/birds/',
            action: 'Open bird database',
            color: 'coral'
        },
        {
            id: 'wildlife',
            title: 'Wildlife found',
            icon: '🐾',
            storageKey: 'heartopia.collection.wildlife',
            total: 10,
            url: '/database/wildlife/',
            action: 'Open wildlife database',
            color: 'mint'
        },
        {
            id: 'crops',
            title: 'Crops harvested',
            icon: '🌾',
            storageKey: 'heartopia.collection.crops',
            total: 17,
            url: '/database/crops/',
            action: 'Open crops database',
            color: 'gold'
        },
        {
            id: 'collectibles',
            title: 'Collectibles found',
            icon: '🧺',
            storageKey: 'heartopia.collection.collectibles',
            total: 37,
            url: '/database/collectibles/',
            action: 'Open collectibles',
            color: 'forest'
        },

        {
            id: 'map',
            title: 'Map locations checked',
            icon: '🗺️',
            storageKey: 'heartopia.map.visitedLocations',
            total: 36,
            url: '/guides/map/#location-tool',
            action: 'Open map finder',
            color: 'rose'
        }
    ];

    const colorClasses = {
        sky: 'bg-cozy-sky/20 border-cozy-sky/50 text-cozy-sky',
        sage: 'bg-cozy-sage/20 border-cozy-sage/50 text-cozy-sage',
        coral: 'bg-cozy-coral/20 border-cozy-coral/50 text-cozy-coral',
        rose: 'bg-cozy-rose/20 border-cozy-rose/50 text-cozy-rose',
        mint: 'bg-cozy-mint/30 border-cozy-mint text-cozy-sage',
        gold: 'bg-amber-100 border-amber-300 text-amber-600',
        forest: 'bg-emerald-100 border-emerald-300 text-emerald-700'
    };

    function readArray(key) {
        try {
            const raw = localStorage.getItem(key);
            const value = raw ? JSON.parse(raw) : [];
            return Array.isArray(value) ? Array.from(new Set(value.filter(Boolean))) : [];
        } catch (error) {
            return [];
        }
    }

    function writeEmpty(key) {
        try {
            localStorage.setItem(key, JSON.stringify([]));
        } catch (error) {
            return;
        }
    }

    function itemState(item) {
        const saved = readArray(item.storageKey);
        const count = Math.min(saved.length, item.total);
        const percent = item.total ? Math.round((count / item.total) * 100) : 0;
        return { saved, count, percent };
    }

    function renderDashboard() {
        const grid = document.getElementById('progress-grid');
        const summary = document.getElementById('progress-summary');
        const activity = document.getElementById('progress-activity');
        if (!grid || !summary || !activity) return;

        const states = progressItems.map(item => ({ item, state: itemState(item) }));
        const totalCollected = states.reduce((sum, entry) => sum + entry.state.count, 0);
        const totalItems = states.reduce((sum, entry) => sum + entry.item.total, 0);
        const overallPercent = totalItems ? Math.round((totalCollected / totalItems) * 100) : 0;

        summary.innerHTML = `
            <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                <div>
                    <p class="text-sm font-bold uppercase tracking-wide text-cozy-coral mb-2">Saved in this browser</p>
                    <h2 class="font-display text-2xl md:text-3xl font-bold">${totalCollected} / ${totalItems} items tracked</h2>
                    <p class="text-cozy-wood mt-2">Your progress is private to this browser. It does not require an account and is not uploaded.</p>
                </div>
                <div class="min-w-[240px]">
                    <div class="flex justify-between text-sm mb-2"><span>Overall progress</span><strong>${overallPercent}%</strong></div>
                    <div class="h-4 rounded-full bg-cozy-cream border border-cozy-peach/50 overflow-hidden">
                        <div class="h-full bg-cozy-coral transition-all duration-300" style="width:${overallPercent}%"></div>
                    </div>
                </div>
            </div>`;

        grid.innerHTML = states.map(({ item, state }) => {
            const classes = colorClasses[item.color] || colorClasses.coral;
            return `
                <article class="bg-white rounded-2xl p-5 border border-cozy-peach/40 shadow-sm">
                    <div class="flex items-start justify-between gap-4 mb-4">
                        <div class="w-14 h-14 rounded-2xl ${classes} border flex items-center justify-center text-3xl">${item.icon}</div>
                        <div class="text-right">
                            <div class="text-2xl font-bold text-cozy-bark">${state.count}/${item.total}</div>
                            <div class="text-sm text-cozy-wood">${state.percent}%</div>
                        </div>
                    </div>
                    <h3 class="font-display text-xl font-bold mb-2">${item.title}</h3>
                    <div class="h-3 rounded-full bg-cozy-cream border border-cozy-peach/40 overflow-hidden mb-4">
                        <div class="h-full bg-cozy-coral transition-all duration-300" style="width:${state.percent}%"></div>
                    </div>
                    <div class="flex flex-wrap gap-2 text-sm">
                        <a href="${item.url}" class="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-cozy-peach hover:bg-cozy-coral hover:text-white font-bold transition-colors">${item.action}</a>
                        <button type="button" data-clear-progress="${item.id}" class="inline-flex items-center justify-center px-3 py-2 rounded-lg border border-cozy-peach hover:border-cozy-coral font-bold transition-colors">Clear</button>
                    </div>
                </article>`;
        }).join('');

        const active = states.filter(entry => entry.state.count > 0);
        activity.innerHTML = active.length
            ? active.map(({ item, state }) => `<li><strong>${item.title}:</strong> ${state.count}/${item.total} saved</li>`).join('')
            : '<li>No saved collection progress yet. Start by opening Fish, Insects, Birds, or the Map Finder and marking items.</li>';
    }

    document.addEventListener('DOMContentLoaded', () => {
        renderDashboard();
        document.addEventListener('click', event => {
            const button = event.target.closest('[data-clear-progress]');
            if (!button) return;
            const item = progressItems.find(entry => entry.id === button.dataset.clearProgress);
            if (!item) return;
            if (!confirm('Clear saved progress for ' + item.title + '?')) return;
            writeEmpty(item.storageKey);
            renderDashboard();
        });
    });
})();