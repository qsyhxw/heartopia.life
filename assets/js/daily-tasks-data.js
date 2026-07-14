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

    function getStoredRegion() {
        return localStorage.getItem('heartopia.dailyTasks.region') || 'america';
    }

    function setStoredRegion(region) {
        localStorage.setItem('heartopia.dailyTasks.region', region);
    }

    function partsInZone(date, timeZone) {
        const parts = new Intl.DateTimeFormat('en-CA', {
            timeZone: timeZone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            hourCycle: 'h23'
        }).formatToParts(date).reduce(function (acc, part) {
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
        return partsInZone(new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days, 12, 0, 0)), 'UTC');
    }

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

    function storageKey(regionKey, resetKey) {
        return 'heartopia.dailyTasks.' + regionKey + '.' + resetKey;
    }

    function customKey(regionKey, resetKey) {
        return 'heartopia.dailyTasks.custom.' + regionKey + '.' + resetKey;
    }

    function getContext() {
        const regionKey = getStoredRegion();
        const state = resetState(regionKey);
        return {
            regionKey: regionKey,
            state: state,
            doneKey: storageKey(regionKey, state.resetKey),
            customStorageKey: customKey(regionKey, state.resetKey)
        };
    }

    function getTasks(context) {
        const active = context || getContext();
        const customTasks = readJson(active.customStorageKey, []);
        return defaultTasks.concat(customTasks.map(function (task) {
            return {
                id: task.id,
                title: task.title,
                group: 'Optional',
                note: 'Custom task saved for this reset day only.',
                custom: true
            };
        }));
    }

    function getToday() {
        const context = getContext();
        return {
            context: context,
            tasks: getTasks(context),
            done: new Set(readJson(context.doneKey, []))
        };
    }

    function setDone(id, checked) {
        const context = getContext();
        const done = new Set(readJson(context.doneKey, []));
        if (checked) done.add(id);
        else done.delete(id);
        writeJson(context.doneKey, Array.from(done));
        return getToday();
    }

    function setAllDone(ids) {
        const context = getContext();
        writeJson(context.doneKey, Array.from(new Set(ids)));
    }

    function clearDone() {
        const context = getContext();
        writeJson(context.doneKey, []);
    }

    function addCustomTask(title) {
        const context = getContext();
        const tasks = readJson(context.customStorageKey, []);
        tasks.push({ id: 'custom-' + Date.now(), title: title });
        writeJson(context.customStorageKey, tasks);
    }

    function removeCustomTask(id) {
        const context = getContext();
        const tasks = readJson(context.customStorageKey, []).filter(function (task) { return task.id !== id; });
        const done = readJson(context.doneKey, []).filter(function (taskId) { return taskId !== id; });
        writeJson(context.customStorageKey, tasks);
        writeJson(context.doneKey, done);
    }

    window.heartopiaDailyTasks = Object.freeze({
        regionInfo: regionInfo,
        defaultTasks: defaultTasks,
        getStoredRegion: getStoredRegion,
        setStoredRegion: setStoredRegion,
        getContext: getContext,
        getTasks: getTasks,
        getToday: getToday,
        setDone: setDone,
        setAllDone: setAllDone,
        clearDone: clearDone,
        addCustomTask: addCustomTask,
        removeCustomTask: removeCustomTask,
        readJson: readJson,
        writeJson: writeJson
    });
})();
