(function () {
    const resetHour = 6;
    const regionInfo = {
        america: { label: 'America (UTC-5)', timeZone: 'Etc/GMT+5' },
        global: { label: 'Global (UTC+1)', timeZone: 'Etc/GMT-1' },
        sea: { label: 'SEA (UTC+7)', timeZone: 'Etc/GMT-7' },
        'tw-hk-mo': { label: 'TW / HK / MO (UTC+8)', timeZone: 'Etc/GMT-8' },
        asia: { label: 'Asia (UTC+9)', timeZone: 'Etc/GMT-9' }
    };

    const defaultTasks = [
        { id: 'daily-missions', title: 'Complete 5 daily NPC missions', group: 'Important', note: 'Check resident mission markers to progress your DG member level.', link: '/guides/daily-routine/' },
        { id: 'watering', title: 'Water crops and check flower crossbreeding', group: 'Important', note: 'Harvest seeds when ready, then replant and water crops or flowers.', link: '/guides/flower-crossbreeding/' },
        { id: 'massimo-shop', title: 'Check Massimo for daily ingredients', group: 'Important', note: 'Review the cooking mentor shop before planning recipes.', link: '/npcs/massimo/' },
        { id: 'daily-resources', title: 'Check Roaming Oak and Flawless Fluorite', group: 'Important', note: 'Use the map and materials database when you need daily timber or fluorite.', link: '/database/materials/' },
        { id: 'daily-gift', title: 'Claim the daily check-in gift', group: 'Important', note: 'Check the in-game Events tab for the current daily reward.', link: '/events/' },
        { id: 'bob-shop', title: "Check Bob's furniture display", group: 'Important', note: 'Look for furniture changes before ending your daily route.', link: '/guides/decoration/' },
        { id: 'dorothee-shop', title: "Check Dorothee's clothing shop", group: 'Important', note: 'Browse the current clothing selection if you are collecting outfits.', link: '/npcs/dorothee/' },
        { id: 'lab-research', title: 'Check Laboratory research', group: 'Important', note: 'Only applies after the required DG level unlock.', when: 'Level 35+', link: '/guides/daily-routine/' },
        { id: 'doris-shop', title: "Check Doris's weather shop", group: 'Important', note: 'Visit only when the current weather or event makes Doris available.', when: 'Weather event', link: '/npcs/doris/' },
        { id: 'weather-resources', title: 'Look for rainbow bouquets or meteor fragments', group: 'Important', note: 'Only run this check while the matching weather event is active.', when: 'Weather event', link: '/guides/meteor-shower/' },
        { id: 'seasonal-tasks', title: 'Review daily seasonal event tasks', group: 'Important', note: 'Open the active event panel and shop when a seasonal event is running.', when: 'Seasonal event', link: '/events/' },
        { id: 'wildlife', title: 'Feed wild animals', group: 'Optional', note: 'Use the right favorite food when you want to improve animal friendship.', link: '/guides/pet-favorite-food/' },
        { id: 'friends', title: 'Greet friends and check invitations', group: 'Optional', note: 'Use the daily social action, then clear any invite notices.', link: '/guides/friends-invites-gifting/' },
        { id: 'resident-gifts', title: 'Give gifts to residents', group: 'Optional', note: 'Use the Friendship Journal; Bailey J accepts bird photographs.', link: '/npcs/bailey-j/' },
        { id: 'water-friends', title: "Water friends' plants", group: 'Optional', note: 'Help with crops and flowers when friends have plants ready.', link: '/guides/flower-crossbreeding/' },
        { id: 'puzzles', title: 'Check Ka Ching for puzzles', group: 'Optional', note: 'Visit the general store when you are working on the puzzle collection.', link: '/npcs/ka-ching/' },
        { id: 'resident-events', title: 'Check resident events for fishing, bugs, or birds', group: 'Optional', note: 'Use current in-game notices to decide whether a collection route is worthwhile.', link: '/guides/map/' },
        { id: 'codes', title: 'Check current redeem codes', group: 'Optional', note: 'Review active codes before you log out.', link: '/codes/' },
        { id: 'pet-food', title: 'Feed your pet', group: 'Optional', note: 'Use favorite food when you are training or caring for a pet.', link: '/guides/pet-favorite-food/' },
        { id: 'walk-dog', title: 'Walk your dog', group: 'Optional', note: 'Add this when you are working on dog care and related rewards.', link: '/hobbies/dog-care/breeds/' },
        { id: 'train-pets', title: 'Train pets', group: 'Optional', note: 'Use this for pet interactions and hobby progress.', link: '/guides/pet-favorite-food/' },
        { id: 'progress', title: 'Review My Progress before logging out', group: 'Optional', note: 'Mark collection finds after your daily route.', link: '/tools/my-progress/' }
    ];

    function getStoredRegion() { return localStorage.getItem('heartopia.dailyTasks.region') || 'america'; }
    function setStoredRegion(region) { localStorage.setItem('heartopia.dailyTasks.region', region); }

    function partsInZone(date, timeZone) {
        const parts = new Intl.DateTimeFormat('en-CA', { timeZone: timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, hourCycle: 'h23' }).formatToParts(date).reduce(function (acc, part) {
            acc[part.type] = part.value;
            return acc;
        }, {});
        return { year: Number(parts.year), month: Number(parts.month), day: Number(parts.day), hour: Number(parts.hour), minute: Number(parts.minute), second: Number(parts.second) };
    }

    function zonedTimeToDate(timeZone, year, month, day, hour, minute, second) {
        const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
        const actual = partsInZone(utcGuess, timeZone);
        const diff = Date.UTC(actual.year, actual.month - 1, actual.day, actual.hour, actual.minute, actual.second) - Date.UTC(year, month - 1, day, hour, minute, second);
        return new Date(utcGuess.getTime() - diff);
    }

    function addDaysInZone(parts, days) { return partsInZone(new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days, 12, 0, 0)), 'UTC'); }

    function resetState(regionKey) {
        const region = regionInfo[regionKey] || regionInfo.america;
        const now = new Date();
        const serverNow = partsInZone(now, region.timeZone);
        const todayReset = zonedTimeToDate(region.timeZone, serverNow.year, serverNow.month, serverNow.day, resetHour, 0, 0);
        const nextResetParts = now >= todayReset ? addDaysInZone(serverNow, 1) : serverNow;
        const previousResetParts = now >= todayReset ? serverNow : addDaysInZone(serverNow, -1);
        const nextReset = zonedTimeToDate(region.timeZone, nextResetParts.year, nextResetParts.month, nextResetParts.day, resetHour, 0, 0);
        const resetKey = [previousResetParts.year, String(previousResetParts.month).padStart(2, '0'), String(previousResetParts.day).padStart(2, '0')].join('-');
        return { region: region, serverNow: serverNow, nextReset: nextReset, resetKey: resetKey };
    }

    function formatCountdown(ms) {
        const totalSeconds = Math.floor(Math.max(0, ms) / 1000);
        return String(Math.floor(totalSeconds / 3600)).padStart(2, '0') + ':' + String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0') + ':' + String(totalSeconds % 60).padStart(2, '0');
    }

    function storageKey(regionKey, resetKey) { return 'heartopia.dailyTasks.' + regionKey + '.' + resetKey; }
    function customKey(regionKey, resetKey) { return 'heartopia.dailyTasks.custom.' + regionKey + '.' + resetKey; }
    function readJson(key, fallback) { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch (error) { return fallback; } }
    function writeJson(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

    function allTasks(regionKey, resetKey) {
        const customTasks = readJson(customKey(regionKey, resetKey), []);
        return defaultTasks.concat(customTasks.map(function (task) {
            return { id: task.id, title: task.title, group: 'Optional', note: 'Custom task saved for this reset day only.', custom: true };
        }));
    }

    function currentContext() {
        const regionKey = getStoredRegion();
        const state = resetState(regionKey);
        return { regionKey: regionKey, state: state, doneKey: storageKey(regionKey, state.resetKey), customStorageKey: customKey(regionKey, state.resetKey) };
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (character) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character];
        });
    }

    function renderTask(task, done) {
        const checked = done.has(task.id);
        const condition = task.when ? '<span class="text-xs font-bold rounded-full bg-cozy-sky/20 px-2 py-1 text-cozy-bark">' + escapeHtml(task.when) + '</span>' : '';
        const note = task.note ? '<p class="text-sm text-cozy-wood mb-2">' + escapeHtml(task.note) + '</p>' : '';
        const link = task.link ? '<a href="' + task.link + '" class="text-cozy-coral font-medium hover:underline">Open related page</a>' : '';
        const remove = task.custom ? '<button type="button" data-remove-custom="' + task.id + '" class="text-cozy-wood hover:text-cozy-coral">Remove</button>' : '';
        return '<article class="task-row ' + (checked ? 'task-done' : '') + ' rounded-2xl border border-cozy-peach/40 bg-cozy-cream/60 p-4 flex items-start gap-4">'
            + '<input type="checkbox" data-task-id="' + task.id + '"' + (checked ? ' checked' : '') + ' class="mt-1 w-5 h-5 rounded border-cozy-peach text-cozy-coral focus:ring-cozy-coral">'
            + '<div class="min-w-0 flex-1"><div class="flex flex-wrap items-center gap-2 mb-1"><h3 class="task-title font-bold text-cozy-bark">' + escapeHtml(task.title) + '</h3>' + condition + '</div>'
            + note + '<div class="flex flex-wrap gap-3 text-sm">' + link + remove + '</div></div></article>';
    }

    function renderGroup(tasks, done, group, label, description) {
        const groupTasks = tasks.filter(function (task) { return task.group === group; });
        if (!groupTasks.length) return '';
        return '<section class="space-y-3 ' + (group === 'Optional' ? 'pt-3' : '') + '"><div class="flex flex-wrap items-baseline justify-between gap-2 px-1"><div><h3 class="font-display text-xl font-bold text-cozy-bark">' + label + '</h3><p class="text-sm text-cozy-wood">' + description + '</p></div><span class="text-xs font-bold rounded-full bg-white px-2 py-1 text-cozy-wood">' + groupTasks.length + ' tasks</span></div>' + groupTasks.map(function (task) { return renderTask(task, done); }).join('') + '</section>';
    }

    function render() {
        const list = document.getElementById('daily-task-list');
        const summary = document.getElementById('daily-summary');
        const regionSelect = document.getElementById('server-region');
        if (!list || !summary || !regionSelect) return;
        const context = currentContext();
        const tasks = allTasks(context.regionKey, context.state.resetKey);
        const done = new Set(readJson(context.doneKey, []));
        const count = tasks.filter(function (task) { return done.has(task.id); }).length;
        const percent = tasks.length ? Math.round((count / tasks.length) * 100) : 0;
        regionSelect.value = context.regionKey;
        summary.innerHTML = '<div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5"><div><p class="text-sm font-bold uppercase tracking-wide text-cozy-coral mb-2">Saved in this browser</p><h2 class="font-display text-2xl md:text-3xl font-bold">' + count + ' / ' + tasks.length + ' tasks done today</h2><p class="text-cozy-wood mt-2">Checklist day: ' + context.state.resetKey + ' on ' + context.state.region.label + '. Progress is private to this browser.</p></div><div class="min-w-[240px]"><div class="flex justify-between text-sm mb-2"><span>Today progress</span><strong>' + percent + '%</strong></div><div class="h-4 rounded-full bg-cozy-cream border border-cozy-peach/50 overflow-hidden"><div class="h-full bg-cozy-coral transition-all duration-300" style="width:' + percent + '%"></div></div></div></div>';
        list.innerHTML = renderGroup(tasks, done, 'Important', 'Important daily checks', 'Finish the core route first. Weather and event labels only apply when active.') + renderGroup(tasks, done, 'Optional', 'Optional progress checks', 'Use these for social, pets, collections, or your personal goals.');
    }

    function updateCountdown() {
        const state = resetState(getStoredRegion());
        const countdown = document.getElementById('reset-countdown');
        const summary = document.getElementById('reset-summary');
        if (!countdown || !summary) return;
        countdown.textContent = formatCountdown(state.nextReset.getTime() - Date.now());
        summary.textContent = state.region.label + ' reset estimate: 6:00 AM server time.';
    }

    document.addEventListener('DOMContentLoaded', function () {
        const regionSelect = document.getElementById('server-region');
        const form = document.getElementById('custom-task-form');
        const input = document.getElementById('custom-task-input');
        render();
        updateCountdown();
        window.setInterval(updateCountdown, 1000);
        window.setInterval(render, 60000);

        regionSelect?.addEventListener('change', function () {
            setStoredRegion(regionSelect.value);
            render();
            updateCountdown();
        });

        document.addEventListener('change', function (event) {
            const checkbox = event.target.closest('[data-task-id]');
            if (!checkbox) return;
            const context = currentContext();
            const done = new Set(readJson(context.doneKey, []));
            if (checkbox.checked) done.add(checkbox.dataset.taskId);
            else done.delete(checkbox.dataset.taskId);
            writeJson(context.doneKey, Array.from(done));
            render();
        });

        document.addEventListener('click', function (event) {
            const markAll = event.target.closest('#mark-all');
            const clearToday = event.target.closest('#clear-today');
            const removeCustom = event.target.closest('[data-remove-custom]');
            const context = currentContext();
            if (markAll) {
                writeJson(context.doneKey, allTasks(context.regionKey, context.state.resetKey).map(function (task) { return task.id; }));
                render();
            }
            if (clearToday) {
                writeJson(context.doneKey, []);
                render();
            }
            if (removeCustom) {
                const tasks = readJson(context.customStorageKey, []).filter(function (task) { return task.id !== removeCustom.dataset.removeCustom; });
                writeJson(context.customStorageKey, tasks);
                writeJson(context.doneKey, readJson(context.doneKey, []).filter(function (id) { return id !== removeCustom.dataset.removeCustom; }));
                render();
            }
        });

        form?.addEventListener('submit', function (event) {
            event.preventDefault();
            const title = input.value.trim();
            if (!title) return;
            const context = currentContext();
            const tasks = readJson(context.customStorageKey, []);
            tasks.push({ id: 'custom-' + Date.now(), title: title });
            writeJson(context.customStorageKey, tasks);
            input.value = '';
            render();
        });
    });
})();
