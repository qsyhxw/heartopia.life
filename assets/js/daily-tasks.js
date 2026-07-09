(function () {
    const resetHour = 6;
    const regionInfo = {
        america: { label: 'America', timeZone: 'America/New_York' },
        global: { label: 'Global', timeZone: 'UTC' },
        sea: { label: 'SEA', timeZone: 'Asia/Bangkok' },
        'tw-hk-mo': { label: 'TW / HK / MO', timeZone: 'Asia/Hong_Kong' },
        asia: { label: 'Asia', timeZone: 'Asia/Tokyo' }
    };

    const defaultTasks = [
        { id: 'login', title: 'Claim login rewards and mailbox', group: 'Start', link: '/codes/' },
        { id: 'codes', title: 'Check current redeem codes', group: 'Start', link: '/codes/' },
        { id: 'daily-quests', title: 'Finish daily quests and activity goals', group: 'Tasks', link: '/guides/daily-routine/' },
        { id: 'events', title: 'Check event tasks and event shop', group: 'Tasks', link: '/events/' },
        { id: 'friends', title: 'Send gifts, visit friends, and clear invite notices', group: 'Social', link: '/guides/friends-invites-gifting/' },
        { id: 'pets', title: 'Feed pets or animals and check troughs', group: 'Animals', link: '/guides/pet-favorite-food/' },
        { id: 'crops', title: 'Water, harvest, and replant crops or flowers', group: 'Home', link: '/guides/flower-crossbreeding/' },
        { id: 'resources', title: 'Run one map resource route', group: 'Map', link: '/guides/map/' },
        { id: 'fish', title: 'Catch missing fish for collection progress', group: 'Collection', link: '/database/fish/' },
        { id: 'insects-birds', title: 'Photograph birds or collect insects', group: 'Collection', link: '/database/birds/' },
        { id: 'recipes', title: 'Cook or sell high-profit food', group: 'Money', link: '/database/recipes/' },
        { id: 'progress', title: 'Review My Progress before logging out', group: 'Wrap-up', link: '/tools/my-progress/' }
    ];

    function getStoredRegion() {
        return localStorage.getItem('heartopia.dailyTasks.region') || 'america';
    }

    function setStoredRegion(region) {
        localStorage.setItem('heartopia.dailyTasks.region', region);
    }

    function partsInZone(date, timeZone) {
        const parts = new Intl.DateTimeFormat('en-CA', {
            timeZone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            hourCycle: 'h23'
        }).formatToParts(date).reduce((acc, part) => {
            acc[part.type] = part.value;
            return acc;
        }, {});
        return {
            year: Number(parts.year),
            month: Number(parts.month),
            day: Number(parts.day),
            hour: Number(parts.hour),
            minute: Number(parts.minute),
            second: Number(parts.second)
        };
    }

    function zonedTimeToDate(timeZone, year, month, day, hour, minute, second) {
        const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
        const actual = partsInZone(utcGuess, timeZone);
        const diff = Date.UTC(actual.year, actual.month - 1, actual.day, actual.hour, actual.minute, actual.second) - Date.UTC(year, month - 1, day, hour, minute, second);
        return new Date(utcGuess.getTime() - diff);
    }

    function addDaysInZone(parts, days) {
        const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days, 12, 0, 0));
        return partsInZone(date, 'UTC');
    }

    function resetState(regionKey) {
        const region = regionInfo[regionKey] || regionInfo.america;
        const now = new Date();
        const serverNow = partsInZone(now, region.timeZone);
        const todayReset = zonedTimeToDate(region.timeZone, serverNow.year, serverNow.month, serverNow.day, resetHour, 0, 0);
        const nextResetParts = now >= todayReset ? addDaysInZone(serverNow, 1) : serverNow;
        const previousResetParts = now >= todayReset ? serverNow : addDaysInZone(serverNow, -1);
        const nextReset = zonedTimeToDate(region.timeZone, nextResetParts.year, nextResetParts.month, nextResetParts.day, resetHour, 0, 0);
        const resetKey = [
            previousResetParts.year,
            String(previousResetParts.month).padStart(2, '0'),
            String(previousResetParts.day).padStart(2, '0')
        ].join('-');
        return { region, serverNow, nextReset, resetKey };
    }

    function formatCountdown(ms) {
        const safeMs = Math.max(0, ms);
        const totalSeconds = Math.floor(safeMs / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    function storageKey(regionKey, resetKey) {
        return `heartopia.dailyTasks.${regionKey}.${resetKey}`;
    }

    function customKey(regionKey, resetKey) {
        return `heartopia.dailyTasks.custom.${regionKey}.${resetKey}`;
    }

    function readJson(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (error) {
            return fallback;
        }
    }

    function writeJson(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function allTasks(regionKey, resetKey) {
        const customTasks = readJson(customKey(regionKey, resetKey), []);
        return defaultTasks.concat(customTasks.map(task => ({
            id: task.id,
            title: task.title,
            group: 'Custom',
            custom: true
        })));
    }

    function currentContext() {
        const regionKey = getStoredRegion();
        const state = resetState(regionKey);
        return {
            regionKey,
            state,
            doneKey: storageKey(regionKey, state.resetKey),
            customStorageKey: customKey(regionKey, state.resetKey)
        };
    }

    function render() {
        const list = document.getElementById('daily-task-list');
        const summary = document.getElementById('daily-summary');
        const regionSelect = document.getElementById('server-region');
        if (!list || !summary || !regionSelect) return;

        const context = currentContext();
        const tasks = allTasks(context.regionKey, context.state.resetKey);
        const done = new Set(readJson(context.doneKey, []));
        const count = tasks.filter(task => done.has(task.id)).length;
        const percent = tasks.length ? Math.round((count / tasks.length) * 100) : 0;

        regionSelect.value = context.regionKey;
        summary.innerHTML = `
            <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
                <div>
                    <p class="text-sm font-bold uppercase tracking-wide text-cozy-coral mb-2">Saved in this browser</p>
                    <h2 class="font-display text-2xl md:text-3xl font-bold">${count} / ${tasks.length} tasks done today</h2>
                    <p class="text-cozy-wood mt-2">Checklist day: ${context.state.resetKey} on ${context.state.region.label}. Progress is private to this browser.</p>
                </div>
                <div class="min-w-[240px]">
                    <div class="flex justify-between text-sm mb-2"><span>Today progress</span><strong>${percent}%</strong></div>
                    <div class="h-4 rounded-full bg-cozy-cream border border-cozy-peach/50 overflow-hidden">
                        <div class="h-full bg-cozy-coral transition-all duration-300" style="width:${percent}%"></div>
                    </div>
                </div>
            </div>`;

        list.innerHTML = tasks.map(task => {
            const checked = done.has(task.id);
            return `
                <article class="task-row ${checked ? 'task-done' : ''} rounded-2xl border border-cozy-peach/40 bg-cozy-cream/60 p-4 flex items-start gap-4">
                    <input type="checkbox" data-task-id="${task.id}" ${checked ? 'checked' : ''} class="mt-1 w-5 h-5 rounded border-cozy-peach text-cozy-coral focus:ring-cozy-coral">
                    <div class="min-w-0 flex-1">
                        <div class="flex flex-wrap items-center gap-2 mb-1">
                            <h3 class="task-title font-bold text-cozy-bark">${task.title}</h3>
                            <span class="text-xs font-bold rounded-full bg-white px-2 py-1 text-cozy-wood">${task.group}</span>
                        </div>
                        <div class="flex flex-wrap gap-3 text-sm">
                            ${task.link ? `<a href="${task.link}" class="text-cozy-coral font-medium hover:underline">Open related page</a>` : ''}
                            ${task.custom ? `<button type="button" data-remove-custom="${task.id}" class="text-cozy-wood hover:text-cozy-coral">Remove</button>` : ''}
                        </div>
                    </div>
                </article>`;
        }).join('');
    }

    function updateCountdown() {
        const regionKey = getStoredRegion();
        const state = resetState(regionKey);
        const countdown = document.getElementById('reset-countdown');
        const summary = document.getElementById('reset-summary');
        if (!countdown || !summary) return;
        countdown.textContent = formatCountdown(state.nextReset.getTime() - Date.now());
        summary.textContent = `${state.region.label} reset estimate: 6:00 AM server time.`;
    }

    document.addEventListener('DOMContentLoaded', () => {
        const regionSelect = document.getElementById('server-region');
        const form = document.getElementById('custom-task-form');
        const input = document.getElementById('custom-task-input');

        render();
        updateCountdown();
        window.setInterval(updateCountdown, 1000);
        window.setInterval(render, 60000);

        regionSelect?.addEventListener('change', () => {
            setStoredRegion(regionSelect.value);
            render();
            updateCountdown();
        });

        document.addEventListener('change', event => {
            const checkbox = event.target.closest('[data-task-id]');
            if (!checkbox) return;
            const context = currentContext();
            const done = new Set(readJson(context.doneKey, []));
            if (checkbox.checked) {
                done.add(checkbox.dataset.taskId);
            } else {
                done.delete(checkbox.dataset.taskId);
            }
            writeJson(context.doneKey, Array.from(done));
            render();
        });

        document.addEventListener('click', event => {
            const markAll = event.target.closest('#mark-all');
            const clearToday = event.target.closest('#clear-today');
            const removeCustom = event.target.closest('[data-remove-custom]');
            const context = currentContext();

            if (markAll) {
                writeJson(context.doneKey, allTasks(context.regionKey, context.state.resetKey).map(task => task.id));
                render();
            }

            if (clearToday) {
                writeJson(context.doneKey, []);
                render();
            }

            if (removeCustom) {
                const tasks = readJson(context.customStorageKey, []).filter(task => task.id !== removeCustom.dataset.removeCustom);
                writeJson(context.customStorageKey, tasks);
                const done = readJson(context.doneKey, []).filter(id => id !== removeCustom.dataset.removeCustom);
                writeJson(context.doneKey, done);
                render();
            }
        });

        form?.addEventListener('submit', event => {
            event.preventDefault();
            const title = input.value.trim();
            if (!title) return;
            const context = currentContext();
            const tasks = readJson(context.customStorageKey, []);
            tasks.push({
                id: `custom-${Date.now()}`,
                title
            });
            writeJson(context.customStorageKey, tasks);
            input.value = '';
            render();
        });
    });
})();
