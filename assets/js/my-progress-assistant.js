(function () {
    const backupVersion = 2;
    const mapRouteKey = 'heartopia.map.todayRouteChecklist';
    const eventGoalPrefix = 'heartopia.myProgress.eventGoals.';
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

    const eventGoals = [
        { id: 'event-panel', title: 'Review today\'s active event tasks', link: '/events/' },
        { id: 'event-rewards', title: 'Claim any active event rewards', link: '/events/' }
    ];

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (character) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character];
        });
    }

    function comparable(value) {
        return String(value || '').replace(/\s+/g, ' ').trim().toLowerCase();
    }

    function readJson(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (error) {
            return fallback;
        }
    }

    function readArray(key) {
        const value = readJson(key, []);
        return Array.isArray(value) ? Array.from(new Set(value.filter(Boolean))) : [];
    }

    function writeArray(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(Array.from(new Set(value.filter(Boolean)))));
            return true;
        } catch (error) {
            return false;
        }
    }

    function catalogItems(item) {
        const group = window.heartopiaProgressCatalog && window.heartopiaProgressCatalog[item.id];
        return Array.isArray(group?.items) ? group.items : [];
    }

    function itemState(item) {
        const saved = readArray(item.storageKey);
        const savedIds = new Set(saved.map(comparable));
        const catalog = catalogItems(item);
        const count = catalog.length
            ? catalog.filter(function (entry) { return savedIds.has(comparable(entry.id || entry.name)); }).length
            : Math.min(saved.length, item.total);
        return {
            saved: saved,
            savedIds: savedIds,
            count: Math.min(count, item.total),
            percent: item.total ? Math.round((Math.min(count, item.total) / item.total) * 100) : 0
        };
    }

    function missingEntries(item, state) {
        return catalogItems(item).filter(function (entry) {
            return !state.savedIds.has(comparable(entry.id || entry.name));
        });
    }

    function cardImage(item, classes) {
        if (!item.image) return '<div class="w-14 h-14 rounded-2xl ' + classes + ' border flex items-center justify-center text-3xl">' + item.icon + '</div>';
        return '<div class="w-14 h-14 rounded-2xl ' + classes + ' border flex items-center justify-center overflow-hidden bg-white p-1"><img src="' + item.image + '" alt="" class="w-full h-full object-contain" loading="lazy"></div>';
    }

    function uncollectedUrl(item, entry) {
        const url = new URL(item.url, window.location.href);
        url.searchParams.set('progress', 'uncollected');
        if (entry?.name) url.searchParams.set('search', entry.name);
        return url.pathname + url.search + url.hash;
    }

    function renderSummary(states, totalCollected, totalItems, overallPercent) {
        const summary = document.getElementById('progress-summary');
        if (!summary) return;
        const completedCategories = states.filter(function (entry) { return entry.state.count === entry.item.total; }).length;
        const nextThreshold = [10, 25, 50, 75, 100].find(function (threshold) { return overallPercent < threshold; });
        const nextCopy = nextThreshold
            ? (nextThreshold - overallPercent) + '% to the next collection milestone'
            : 'Every tracked category is complete';
        summary.innerHTML = '<div class="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5"><div><p class="text-sm font-bold uppercase tracking-wide text-cozy-coral mb-2">Saved in this browser</p><h2 class="font-display text-2xl md:text-3xl font-bold">' + totalCollected + ' / ' + totalItems + ' entries tracked</h2><p class="text-cozy-wood mt-2">' + completedCategories + ' completed categories · ' + escapeHtml(nextCopy) + '</p></div><div class="min-w-[250px]"><div class="flex justify-between text-sm mb-2"><span>Overall progress</span><strong>' + overallPercent + '%</strong></div><div class="h-4 rounded-full bg-cozy-cream border border-cozy-peach/50 overflow-hidden"><div class="h-full bg-cozy-coral transition-all duration-300" style="width:' + overallPercent + '%"></div></div></div></div>';
    }

    function renderCards(states) {
        const grid = document.getElementById('progress-grid');
        if (!grid) return;
        grid.innerHTML = states.map(function (entry) {
            const item = entry.item;
            const state = entry.state;
            const classes = colorClasses[item.color] || colorClasses.coral;
            const openMissing = state.count < item.total
                ? '<a href="' + uncollectedUrl(item) + '" class="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-cozy-peach hover:bg-cozy-coral hover:text-white font-bold transition-colors">Continue</a>'
                : '<a href="' + item.url + '" class="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-cozy-mint/50 hover:bg-cozy-sage hover:text-white font-bold transition-colors">View list</a>';
            return '<article class="bg-white rounded-2xl p-5 border border-cozy-peach/40 shadow-sm"><div class="flex items-start justify-between gap-4 mb-4">' + cardImage(item, classes) + '<div class="text-right"><div class="text-2xl font-bold text-cozy-bark">' + state.count + '/' + item.total + '</div><div class="text-sm text-cozy-wood">' + state.percent + '%</div></div></div><h3 class="font-display text-xl font-bold mb-2">' + item.title + '</h3><div class="h-3 rounded-full bg-cozy-cream border border-cozy-peach/40 overflow-hidden mb-4"><div class="h-full bg-cozy-coral transition-all duration-300" style="width:' + state.percent + '%"></div></div><div class="flex flex-wrap gap-2 text-sm">' + openMissing + '<button type="button" data-clear-progress="' + item.id + '" class="inline-flex items-center justify-center px-3 py-2 rounded-lg border border-cozy-peach hover:border-cozy-coral font-bold transition-colors">Clear</button></div></article>';
        }).join('');
    }

    function renderClosest(states) {
        const target = document.getElementById('progress-closest');
        if (!target) return;
        const closest = states
            .filter(function (entry) { return entry.state.count < entry.item.total; })
            .sort(function (left, right) {
                return right.state.percent - left.state.percent
                    || (left.item.total - left.state.count) - (right.item.total - right.state.count)
                    || left.item.title.localeCompare(right.item.title);
            })
            .slice(0, 3);
        target.innerHTML = closest.length
            ? closest.map(function (entry) {
                const remaining = entry.item.total - entry.state.count;
                return '<a href="' + uncollectedUrl(entry.item) + '" class="flex items-center justify-between gap-4 border-t border-cozy-peach/30 py-3 first:border-t-0 first:pt-0 hover:text-cozy-coral"><span><strong class="block">' + entry.item.title + '</strong><span class="text-sm text-cozy-wood">' + remaining + ' remaining · ' + entry.state.percent + '% complete</span></span><span class="text-sm font-bold">Continue</span></a>';
            }).join('')
            : '<p class="text-cozy-wood">Every tracked category is complete. Enjoy the victory lap.</p>';
    }

    function renderMilestones(states, totalCollected, totalItems, overallPercent) {
        const target = document.getElementById('progress-milestones');
        if (!target) return;
        const completedCategories = states.filter(function (entry) { return entry.state.count === entry.item.total; }).length;
        const milestones = [
            { title: 'First Steps', note: 'Mark your first entry', unlocked: totalCollected >= 1, progress: Math.min(totalCollected, 1) + '/1' },
            { title: 'Explorer', note: 'Reach 25% overall', unlocked: overallPercent >= 25, progress: overallPercent + '/25%' },
            { title: 'Halfway Home', note: 'Reach 50% overall', unlocked: overallPercent >= 50, progress: overallPercent + '/50%' },
            { title: 'Dedicated Collector', note: 'Reach 75% overall', unlocked: overallPercent >= 75, progress: overallPercent + '/75%' },
            { title: 'Category Finisher', note: 'Complete one category', unlocked: completedCategories >= 1, progress: completedCategories + ' complete' },
            { title: 'Heartopia Historian', note: 'Complete every tracked entry', unlocked: totalItems > 0 && totalCollected === totalItems, progress: overallPercent + '/100%' }
        ];
        target.innerHTML = milestones.map(function (milestone) {
            const state = milestone.unlocked ? 'bg-white/15 border-white/25 text-white' : 'bg-white/5 border-white/10 text-white/70';
            const icon = milestone.unlocked ? '&#10003;' : '&#9675;';
            return '<li class="rounded-xl border ' + state + ' px-3 py-2.5"><div class="flex items-center justify-between gap-3"><strong class="text-sm">' + icon + ' ' + milestone.title + '</strong><span class="text-xs font-bold">' + milestone.progress + '</span></div><span class="block text-xs mt-1 text-white/65">' + milestone.note + '</span></li>';
        }).join('');
    }

    function todayMapKey() {
        return new Date().toISOString().slice(0, 10);
    }

    function slug(value) {
        return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }

    function readMapRoute() {
        const fallback = { date: todayMapKey(), routeId: '', items: [], checked: [] };
        const route = readJson(mapRouteKey, fallback);
        if (!route || route.date !== todayMapKey()) return fallback;
        return {
            date: route.date,
            routeId: route.routeId || '',
            items: Array.isArray(route.items) ? route.items : [],
            checked: Array.isArray(route.checked) ? route.checked : []
        };
    }

    function writeMapRoute(route) {
        localStorage.setItem(mapRouteKey, JSON.stringify({
            date: todayMapKey(),
            routeId: route.routeId || '',
            items: Array.isArray(route.items) ? route.items : [],
            checked: Array.isArray(route.checked) ? route.checked : []
        }));
    }

    function eventGoalKey() {
        const daily = window.heartopiaDailyTasks;
        return eventGoalPrefix + (daily ? daily.getContext().state.resetKey : todayMapKey());
    }

    function getTodayGoals() {
        const goals = [];
        const daily = window.heartopiaDailyTasks;
        if (daily) {
            const today = daily.getToday();
            today.tasks.filter(function (task) { return task.group === 'Important'; }).slice(0, 3).forEach(function (task) {
                goals.push({ kind: 'daily', id: task.id, title: task.title, source: 'Daily Tasks', link: task.link || '/tools/daily-tasks/', checked: today.done.has(task.id) });
            });
        }

        const route = readMapRoute();
        const routeChecked = new Set(route.checked);
        route.items.slice(0, 2).forEach(function (name) {
            goals.push({ kind: 'route', id: slug(name), title: name, source: 'Today\'s map route', link: '/guides/map/#location-tool', checked: routeChecked.has(slug(name)) });
        });

        const doneEvents = new Set(readArray(eventGoalKey()));
        eventGoals.forEach(function (goal) {
            goals.push({ kind: 'event', id: goal.id, title: goal.title, source: 'Events', link: goal.link, checked: doneEvents.has(goal.id) });
        });

        return goals;
    }

    function setGoalDone(goal, checked) {
        if (goal.kind === 'daily' && window.heartopiaDailyTasks) {
            window.heartopiaDailyTasks.setDone(goal.id, checked);
            return;
        }
        if (goal.kind === 'route') {
            const route = readMapRoute();
            const done = new Set(route.checked);
            if (checked) done.add(goal.id);
            else done.delete(goal.id);
            route.checked = Array.from(done).sort();
            writeMapRoute(route);
            return;
        }
        if (goal.kind === 'event') {
            const done = new Set(readArray(eventGoalKey()));
            if (checked) done.add(goal.id);
            else done.delete(goal.id);
            writeArray(eventGoalKey(), Array.from(done));
        }
    }

    function renderTodayGoals() {
        const list = document.getElementById('progress-today-goals');
        const summary = document.getElementById('progress-today-summary');
        if (!list || !summary) return;
        const goals = getTodayGoals();
        const complete = goals.filter(function (goal) { return goal.checked; }).length;
        summary.textContent = goals.length ? complete + ' / ' + goals.length + ' checked' : 'Open Daily Tasks to build today\'s route';
        list.innerHTML = goals.length
            ? goals.map(function (goal) {
                const titleClass = goal.checked ? 'line-through text-cozy-wood' : 'text-cozy-bark';
                return '<li class="flex items-start gap-3 rounded-xl border border-cozy-peach/35 bg-cozy-cream/60 px-3 py-3"><input type="checkbox" class="progress-goal-check mt-1 h-5 w-5 rounded accent-[#ff8a7a]" data-goal-kind="' + goal.kind + '" data-goal-id="' + escapeHtml(goal.id) + '"' + (goal.checked ? ' checked' : '') + '><span class="min-w-0 flex-1"><a href="' + goal.link + '" class="block font-bold ' + titleClass + ' hover:text-cozy-coral">' + escapeHtml(goal.title) + '</a><span class="block mt-1 text-xs text-cozy-wood">' + escapeHtml(goal.source) + '</span></span></li>';
            }).join('')
            : '<li class="text-sm text-cozy-wood">Start a daily checklist or choose a map route to see focused goals here.</li>';
    }

    function renderContinue(states) {
        const target = document.getElementById('progress-continue');
        if (!target) return;
        const incomplete = states.filter(function (entry) { return entry.state.count < entry.item.total; });
        const started = incomplete.filter(function (entry) { return entry.state.count > 0; }).sort(function (left, right) { return right.state.percent - left.state.percent; });
        const untouched = incomplete.filter(function (entry) { return entry.state.count === 0; }).sort(function (left, right) { return left.item.total - right.item.total; });
        const focus = started.concat(untouched).slice(0, 3);
        target.innerHTML = focus.length
            ? focus.map(function (entry) {
                const targets = missingEntries(entry.item, entry.state).slice(0, 3);
                const rows = targets.length
                    ? targets.map(function (targetEntry) {
                        const image = targetEntry.image
                            ? '<img src="' + targetEntry.image + '" alt="" class="h-10 w-10 shrink-0 rounded-lg bg-white object-contain p-1" loading="lazy">'
                            : '<span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-lg">' + entry.item.icon + '</span>';
                        return '<a href="' + uncollectedUrl(entry.item, targetEntry) + '" class="flex items-center gap-3 rounded-xl border border-cozy-peach/35 bg-cozy-cream/60 p-3 hover:border-cozy-coral"><span>' + image + '</span><span class="min-w-0"><strong class="block truncate">' + escapeHtml(targetEntry.name) + '</strong><span class="block truncate text-xs text-cozy-wood">' + escapeHtml(targetEntry.detail || 'Open the database entry') + '</span></span></a>';
                    }).join('')
                    : '<p class="text-sm text-cozy-wood">Open the full database to choose your next target.</p>';
                return '<article class="border-t border-cozy-peach/35 pt-6 first:border-t-0 first:pt-0"><div class="mb-3 flex items-center justify-between gap-3"><div><h3 class="font-display text-xl font-bold">' + entry.item.title + '</h3><p class="text-sm text-cozy-wood">' + entry.state.count + '/' + entry.item.total + ' saved · ' + (entry.item.total - entry.state.count) + ' remaining</p></div><a href="' + uncollectedUrl(entry.item) + '" class="shrink-0 text-sm font-bold text-cozy-coral hover:underline">View all missing</a></div><div class="grid gap-2">' + rows + '</div></article>';
            }).join('')
            : '<p class="text-cozy-wood">You have completed every tracked category. Check the map and events page for the next route.</p>';
    }

    function renderActivity(states) {
        const activity = document.getElementById('progress-activity');
        if (!activity) return;
        const active = states.filter(function (entry) { return entry.state.count > 0; }).sort(function (left, right) { return right.state.percent - left.state.percent; }).slice(0, 6);
        activity.innerHTML = active.length
            ? active.map(function (entry) { return '<li><strong>' + entry.item.title + ':</strong> ' + entry.state.count + '/' + entry.item.total + ' saved</li>'; }).join('')
            : '<li>No saved collection progress yet. Start by opening a database or Map Finder and marking an entry.</li>';
    }

    function renderDashboard() {
        const states = progressItems.map(function (item) { return { item: item, state: itemState(item) }; });
        const totalCollected = states.reduce(function (sum, entry) { return sum + entry.state.count; }, 0);
        const totalItems = states.reduce(function (sum, entry) { return sum + entry.item.total; }, 0);
        const overallPercent = totalItems ? Math.round((totalCollected / totalItems) * 100) : 0;
        renderSummary(states, totalCollected, totalItems, overallPercent);
        renderCards(states);
        renderClosest(states);
        renderMilestones(states, totalCollected, totalItems, overallPercent);
        renderTodayGoals();
        renderContinue(states);
        renderActivity(states);
    }

    function isBackupKey(key) {
        return progressItems.some(function (item) { return item.storageKey === key; })
            || key === 'heartopia.dailyTasks.region'
            || key === mapRouteKey
            || key.indexOf('heartopia.dailyTasks.') === 0
            || key.indexOf(eventGoalPrefix) === 0;
    }

    function backupKeys() {
        const keys = [];
        for (let index = 0; index < localStorage.length; index += 1) {
            const key = localStorage.key(index);
            if (key && isBackupKey(key)) keys.push(key);
        }
        return keys.sort();
    }

    function decodeBackupValue(raw) {
        try {
            return JSON.parse(raw);
        } catch (error) {
            return raw;
        }
    }

    function buildBackup() {
        const storage = {};
        backupKeys().forEach(function (key) {
            storage[key] = decodeBackupValue(localStorage.getItem(key));
        });
        return {
            app: 'Heartopia.Life My Progress',
            version: backupVersion,
            exportedAt: new Date().toISOString(),
            storage: storage
        };
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

    function writeBackupStorage(storage) {
        backupKeys().forEach(function (key) { localStorage.removeItem(key); });
        Object.entries(storage).forEach(function (entry) {
            const key = entry[0];
            const value = entry[1];
            if (!isBackupKey(key)) return;
            localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        });
    }

    function importBackup(file) {
        const reader = new FileReader();
        reader.onload = function () {
            try {
                const backup = JSON.parse(String(reader.result || ''));
                if (!backup || backup.app !== 'Heartopia.Life My Progress') throw new Error('Invalid backup');
                if (backup.version >= 2 && backup.storage && typeof backup.storage === 'object') {
                    if (!confirm('Replace this browser\'s saved progress, daily checklist, and map route with this backup?')) return;
                    writeBackupStorage(backup.storage);
                } else if (backup.collections && typeof backup.collections === 'object') {
                    if (!confirm('Replace this browser\'s saved collection marks with this legacy backup?')) return;
                    progressItems.forEach(function (item) {
                        const values = backup.collections[item.storageKey];
                        if (Array.isArray(values)) writeArray(item.storageKey, values);
                    });
                } else {
                    throw new Error('Invalid backup');
                }
                renderDashboard();
                alert('Progress backup imported.');
            } catch (error) {
                alert('This file is not a valid Heartopia.Life My Progress backup.');
            }
        };
        reader.readAsText(file);
    }

    function handleGoalChange(input) {
        const goal = {
            kind: input.dataset.goalKind,
            id: input.dataset.goalId
        };
        setGoalDone(goal, input.checked);
        renderDashboard();
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

        document.addEventListener('change', function (event) {
            const goal = event.target.closest('.progress-goal-check');
            if (goal) handleGoalChange(goal);
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

        window.addEventListener('storage', function () { renderDashboard(); });
    });
})();
