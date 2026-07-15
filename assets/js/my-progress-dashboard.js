(function () {
    const backupVersion = 1;
    const progressItems = [
        { id: 'fish', title: 'Fish collected', icon: '&#128031;', image: '/img/fish/Anglerfish.webp', storageKey: 'heartopia.collection.fish', total: 119, url: '/database/fish/', action: 'Open fish database', color: 'sky' },
        { id: 'insects', title: 'Insects collected', icon: '&#129419;', image: '/img/insects/Abeja-Azul.webp', storageKey: 'heartopia.collection.insects', total: 91, url: '/database/insects/', action: 'Open insect database', color: 'sage' },
        { id: 'birds', title: 'Birds photographed', icon: '&#128038;', image: '/img/birds/African-Olive-Pigeon.webp', storageKey: 'heartopia.collection.birds', total: 97, url: '/database/birds/', action: 'Open bird database', color: 'coral' },
        { id: 'wildlife', title: 'Wildlife found', icon: '&#128062;', image: '/img/wildlife/Capybara.webp', storageKey: 'heartopia.collection.wildlife', total: 10, url: '/database/wildlife/', action: 'Open wildlife database', color: 'mint' },
        { id: 'crops', title: 'Crops harvested', icon: '&#127806;', image: '/img/crops/Grape.webp', storageKey: 'heartopia.collection.crops', total: 17, url: '/database/crops/', action: 'Open crops database', color: 'gold' },
        { id: 'flowers', title: 'Flowers grown', icon: '', image: '/img/flowers/Pink-Flower-2-Star.webp', storageKey: 'heartopia.collection.flowers', total: 10, url: '/database/flowers/', action: 'Open flowers database', color: 'flower' },
        { id: 'recipes', title: 'Recipes learned', icon: '&#127859;', image: '/img/recipes/Afternoon-Tea.webp', storageKey: 'heartopia.database.recipes.learned.v2', total: 168, url: '/database/recipes/', action: 'Open recipe database', color: 'recipe' },
        { id: 'achievements', title: 'Achievements earned', icon: '&#127942;', image: '/img/achievements/Collector.webp', storageKey: 'heartopia.achievements.earned', total: 67, url: '/guides/achievements/', action: 'Open achievements', color: 'achievement' },
        { id: 'collectibles', title: 'Collectibles found', icon: '&#129525;', image: '/img/collectibles/Apple.webp', storageKey: 'heartopia.collection.collectibles', total: 37, url: '/database/collectibles/', action: 'Open collectibles', color: 'forest' },
        { id: 'items', title: 'Items owned', icon: '&#127890;', image: '/img/items/Amazing-Seasoning.webp', storageKey: 'heartopia.collection.items', total: 23, url: '/database/items/', action: 'Open items database', color: 'violet' },
        { id: 'ingredients', title: 'Ingredients stocked', icon: '&#129371;', image: '/img/ingredients/Butter.webp', storageKey: 'heartopia.collection.ingredients', total: 26, url: '/database/ingredients/', action: 'Open ingredients database', color: 'cream' },
        { id: 'npcs', title: 'NPCs met', icon: '&#128101;', image: '/img/npcs/Bailey-J.webp', storageKey: 'heartopia.collection.npcs', total: 19, url: '/npcs/', action: 'Open NPC directory', color: 'npc' },
        { id: 'map', title: 'Map locations checked', icon: '&#128506;', storageKey: 'heartopia.map.visitedLocations', total: 46, url: '/guides/map/#location-tool', action: 'Open map finder', color: 'rose' }
    ];

    const colorClasses = {
        sky: 'bg-cozy-sky/20 border-cozy-sky/50 text-cozy-sky',
        sage: 'bg-cozy-sage/20 border-cozy-sage/50 text-cozy-sage',
        coral: 'bg-cozy-coral/20 border-cozy-coral/50 text-cozy-coral',
        rose: 'bg-cozy-rose/20 border-cozy-rose/50 text-cozy-rose',
        mint: 'bg-cozy-mint/30 border-cozy-mint text-cozy-sage',
        gold: 'bg-amber-100 border-amber-300 text-amber-600',
        forest: 'bg-emerald-100 border-emerald-300 text-emerald-700',
        violet: 'bg-violet-100 border-violet-300 text-violet-700',
        cream: 'bg-amber-50 border-amber-200 text-amber-700',
        npc: 'bg-violet-100 border-violet-300 text-violet-700',
        recipe: 'bg-orange-100 border-orange-300 text-orange-700',
        achievement: 'bg-yellow-100 border-yellow-300 text-yellow-700',
        flower: 'bg-pink-100 border-pink-300 text-pink-700'
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

    function writeArray(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(Array.from(new Set(value.filter(Boolean)))));
            return true;
        } catch (error) {
            return false;
        }
    }

    function itemState(item) {
        const saved = readArray(item.storageKey);
        const count = Math.min(saved.length, item.total);
        return { saved: saved, count: count, percent: item.total ? Math.round((count / item.total) * 100) : 0 };
    }

    function cardImage(item, classes) {
        if (!item.image) return '<div class="w-14 h-14 rounded-2xl ' + classes + ' border flex items-center justify-center text-3xl">' + item.icon + '</div>';
        return '<div class="w-14 h-14 rounded-2xl ' + classes + ' border flex items-center justify-center overflow-hidden bg-white p-1"><img src="' + item.image + '" alt="" class="w-full h-full object-contain" loading="lazy"></div>';
    }

    function renderDashboard() {
        const grid = document.getElementById('progress-grid');
        const summary = document.getElementById('progress-summary');
        const activity = document.getElementById('progress-activity');
        if (!grid || !summary || !activity) return;

        const states = progressItems.map(function (item) { return { item: item, state: itemState(item) }; });
        const totalCollected = states.reduce(function (sum, entry) { return sum + entry.state.count; }, 0);
        const totalItems = states.reduce(function (sum, entry) { return sum + entry.item.total; }, 0);
        const overallPercent = totalItems ? Math.round((totalCollected / totalItems) * 100) : 0;

        summary.innerHTML = '<div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4"><div><p class="text-sm font-bold uppercase tracking-wide text-cozy-coral mb-2">Saved in this browser</p><h2 class="font-display text-2xl md:text-3xl font-bold">' + totalCollected + ' / ' + totalItems + ' entries tracked</h2><p class="text-cozy-wood mt-2">Your progress is private to this browser. Export a backup before switching devices or clearing browser data.</p></div><div class="min-w-[240px]"><div class="flex justify-between text-sm mb-2"><span>Overall progress</span><strong>' + overallPercent + '%</strong></div><div class="h-4 rounded-full bg-cozy-cream border border-cozy-peach/50 overflow-hidden"><div class="h-full bg-cozy-coral transition-all duration-300" style="width:' + overallPercent + '%"></div></div></div></div>';

        grid.innerHTML = states.map(function (entry) {
            const item = entry.item;
            const state = entry.state;
            const classes = colorClasses[item.color] || colorClasses.coral;
            return '<article class="bg-white rounded-2xl p-5 border border-cozy-peach/40 shadow-sm"><div class="flex items-start justify-between gap-4 mb-4">' + cardImage(item, classes) + '<div class="text-right"><div class="text-2xl font-bold text-cozy-bark">' + state.count + '/' + item.total + '</div><div class="text-sm text-cozy-wood">' + state.percent + '%</div></div></div><h3 class="font-display text-xl font-bold mb-2">' + item.title + '</h3><div class="h-3 rounded-full bg-cozy-cream border border-cozy-peach/40 overflow-hidden mb-4"><div class="h-full bg-cozy-coral transition-all duration-300" style="width:' + state.percent + '%"></div></div><div class="flex flex-wrap gap-2 text-sm"><a href="' + item.url + '" class="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-cozy-peach hover:bg-cozy-coral hover:text-white font-bold transition-colors">' + item.action + '</a><button type="button" data-clear-progress="' + item.id + '" class="inline-flex items-center justify-center px-3 py-2 rounded-lg border border-cozy-peach hover:border-cozy-coral font-bold transition-colors">Clear</button></div></article>';
        }).join('');

        const active = states.filter(function (entry) { return entry.state.count > 0; });
        activity.innerHTML = active.length ? active.map(function (entry) { return '<li><strong>' + entry.item.title + ':</strong> ' + entry.state.count + '/' + entry.item.total + ' saved</li>'; }).join('') : '<li>No saved collection progress yet. Start by opening a database or Map Finder and marking an entry.</li>';
    }

    function buildBackup() {
        const collections = {};
        progressItems.forEach(function (item) { collections[item.storageKey] = readArray(item.storageKey); });
        return { app: 'Heartopia.Life My Progress', version: backupVersion, exportedAt: new Date().toISOString(), collections: collections };
    }

    function exportBackup() {
        const blob = new Blob([JSON.stringify(buildBackup(), null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'heartopia-life-progress-backup.json';
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    }

    function importBackup(file) {
        const reader = new FileReader();
        reader.onload = function () {
            try {
                const backup = JSON.parse(String(reader.result || ''));
                if (!backup || backup.app !== 'Heartopia.Life My Progress' || !backup.collections || typeof backup.collections !== 'object') throw new Error('Invalid backup');
                if (!confirm('Replace saved My Progress marks in this browser with this backup?')) return;
                progressItems.forEach(function (item) {
                    const values = backup.collections[item.storageKey];
                    if (Array.isArray(values)) writeArray(item.storageKey, values);
                });
                renderDashboard();
                alert('Progress backup imported.');
            } catch (error) {
                alert('This file is not a valid Heartopia.Life My Progress backup.');
            }
        };
        reader.readAsText(file);
    }

    document.addEventListener('DOMContentLoaded', function () {
        const exportButton = document.getElementById('export-progress');
        const importButton = document.getElementById('import-progress');
        const importInput = document.getElementById('import-progress-file');

        renderDashboard();
        exportButton?.addEventListener('click', exportBackup);
        importButton?.addEventListener('click', function () { importInput?.click(); });
        importInput?.addEventListener('change', function () {
            const file = importInput.files && importInput.files[0];
            if (file) importBackup(file);
            importInput.value = '';
        });

        document.addEventListener('click', function (event) {
            const button = event.target.closest('[data-clear-progress]');
            if (!button) return;
            const item = progressItems.find(function (entry) { return entry.id === button.dataset.clearProgress; });
            if (!item) return;
            if (!confirm('Clear saved progress for ' + item.title + '?')) return;
            writeArray(item.storageKey, []);
            renderDashboard();
        });
    });
})();
