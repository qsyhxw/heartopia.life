(function () {
    const STORAGE_KEY = 'heartopia.map.visitedLocations';
    const TODAY_ROUTE_KEY = 'heartopia.map.todayRouteChecklist';
    const FILTER_STATE_KEY = 'heartopia.map.filterState';
    const locations = [
        { name: 'Dorothy', type: 'npc', area: 'Central Town', tags: 'clothing store poster quest', note: 'Clothing store NPC unlocked through the poster quest.', link: '/guides/npc-locations/' },
        { name: 'Bob', type: 'npc', area: 'Central Town', tags: 'furniture store joinery tea table quest', note: 'Furniture store NPC tied to the joinery tea table quest.', link: '/guides/npc-locations/' },
        { name: 'Bailey J', type: 'npc', area: 'Central Town', tags: 'pet store birdwatching dg level 6', note: 'Upstairs in Pet Store; birdwatching unlock path.', link: '/hobbies/birdwatching/' },
        { name: 'Ka Ching', type: 'npc', area: 'Central Town', tags: 'inventory expansion bag upgrade', note: 'Inventory expansion NPC near the city center.', link: '/guides/ka-ching/' },
        { name: 'Bill', type: 'npc', area: 'Fishing Village', tags: 'sea fishing event host', note: 'Sea Fishing event host in Fishing Village.', link: '/hobbies/fishing/' },
        { name: 'Doris', type: 'npc', area: 'Art Street', tags: 'weather merchant rain rainbow meteor shower recipe', note: 'Traveling merchant tied to rain, rainbow, snow, or meteor weather.', link: '/guides/npc-locations/' },
        { name: 'Albert Jr.', type: 'npc', area: 'Varies', tags: 'gold merchant wandering sale daily icon', note: 'Moving merchant; check the in-game map icon each day.', link: '/guides/npc-locations/' },
        { name: 'Roaming Oak', type: 'npc', area: 'Home Lots', tags: 'rare timber tree daily moving resource', note: 'Moving tree NPC that can provide Roaming Oak Timber.', link: '/database/materials/roaming-oak-timber/' },
        { name: 'Alpaca', type: 'wildlife', area: 'Amethyst Beach', tags: 'wildlife alpaca sunny beach', note: 'Appears at Amethyst Beach in Sunny weather.', link: '/database/wildlife/' },
        { name: 'Bunny', type: 'wildlife', area: 'Suburbs', tags: 'wildlife bunny sunny suburbs', note: 'Appears in the Suburbs in Sunny weather.', link: '/database/wildlife/' },
        { name: 'Capybara', type: 'wildlife', area: 'Crater Lake', tags: 'wildlife capybara crater lake rainbow', note: 'Appears at Crater Lake in Rainbow weather.', link: '/database/wildlife/capybara/' },
        { name: 'Dolphin', type: 'wildlife', area: 'Whalefall Canyon', tags: 'wildlife dolphin seasonal call of whales familiarity life fragment', note: 'Seasonal dolphin group in Whalefall Canyon through August 22, 2026.', link: '/database/wildlife/dolphin/' },
        { name: 'Ferret', type: 'wildlife', area: 'Rosy River', tags: 'wildlife ferret rosy river rainbow', note: 'Appears at Rosy River in Rainbow weather.', link: '/database/wildlife/' },
        { name: 'Fox', type: 'wildlife', area: 'Flower Field', tags: 'wildlife fox meadow lake windmill rainbow', note: 'Appears in Windmill Flower Field, Amethyst Beach, or Meadow Lake in Rainbow weather.', link: '/database/wildlife/' },
        { name: 'Maltese', type: 'wildlife', area: 'Forest Island', tags: 'wildlife maltese forest island sunny', note: 'Listed in the Maltese category at Forest Island in Sunny weather.', link: '/database/wildlife/' },
        { name: 'Panda', type: 'wildlife', area: 'Forest Jump Puzzle', tags: 'wildlife panda jump puzzle rainy', note: 'Appears at Forest Jump Puzzle in Rainy weather.', link: '/database/wildlife/panda/' },
        { name: 'Penguin', type: 'wildlife', area: 'Old Sea', tags: 'wildlife penguin old sea rainy winter', note: 'Winter frost season entry at Old Sea in Rainy weather.', link: '/database/wildlife/' },
        { name: 'Sea Otter', type: 'wildlife', area: 'Fishing Village Square', tags: 'wildlife sea otter fishing village rainy', note: 'Appears at Fishing Village Square in Rainy weather.', link: '/database/wildlife/' },
        { name: 'Sika Deer', type: 'wildlife', area: 'Forest Lake', tags: 'wildlife sika deer forest lake sunny', note: 'Appears at Forest Lake in Sunny weather.', link: '/database/wildlife/deer/' },
        { name: 'Shiitake Mushrooms', type: 'resource', area: 'Fishing Village', tags: 'mushroom bizarre mushroom foraging', note: 'Mushroom route in Fishing Village; rare variants can appear.', link: '/database/materials/mushrooms/' },
        { name: 'Oyster Mushrooms', type: 'resource', area: 'Onsen Mountain', tags: 'mushroom bizarre mushroom foraging', note: 'Mushroom route around Onsen Mountain.', link: '/database/materials/mushrooms/' },
        { name: 'Bamboo', type: 'resource', area: 'Forest', tags: 'panda forest southern area gathering', note: 'Southern forest gathering route near Panda habitat.', link: '/guides/map/#foraging' },
        { name: 'Fluorite Mine', type: 'resource', area: 'Onsen Mountain', tags: 'fluorite mineral mine crafting material', note: 'Mineral route for Fluorite and crafting materials.', link: '/database/materials/fluorite/' },
        { name: 'Black Truffle', type: 'resource', area: 'Forest Island', tags: 'truffle recipes respawn forest island', note: 'High-value ingredient route tied to Forest Island.', link: '/database/items/black-truffle/' },
        { name: 'Flower Field Materials', type: 'resource', area: 'Flower Field', tags: 'highland poppy flower material gathering route', note: 'Broad Flower Field gathering route for flower materials; confirm the current in-game spawn before planning an exact stop.', link: '/database/materials/' },
        { name: 'Meadow Lake', type: 'fish', area: 'Flower Field', tags: 'butterfly koi lake fishing rain rainbow', note: 'Lake fishing spot connected to Butterfly Koi searches.', link: '/database/fish/butterfly-koi/' },
        { name: 'Any River', type: 'fish', area: 'River Routes', tags: 'tilapia river mermaid attractor fishing', note: 'Use river routes when hunting Tilapia and common river fish.', link: '/database/fish/tilapia/' },
        { name: 'Fishing Village Coast', type: 'fish', area: 'Fishing Village', tags: 'sea fishing sardine ocean coastal', note: 'Coastal route for sea fish and event fishing.', link: '/database/fish/sardine/' },
        { name: 'Whale Sea', type: 'fish', area: 'Sea', tags: 'seahorse whale sea fishing', note: 'Sea route connected to Seahorse and ocean fish.', link: '/database/fish/seahorse/' },
        { name: 'Forest Lake Fishing', type: 'fish', area: 'Forest', tags: 'forest lake fishing freshwater', note: 'Route anchor for fish listings around Forest Lake; check the fish database for each target condition.', link: '/database/fish/' },
        { name: 'Onsen Lake Fishing', type: 'fish', area: 'Onsen Mountain', tags: 'onsen mountain lake crater lake fishing freshwater', note: 'Route anchor for fish listings around Onsen Mountain and Crater Lake; check the fish database for each target condition.', link: '/database/fish/' },
        { name: 'Central Area Birds', type: 'bird', area: 'Central Area', tags: 'european robin magpie house sparrow photo', note: 'Easy birdwatching route for all-day birds.', link: '/guides/bird-locations/' },
        { name: 'Fishing Village Lighthouse Birds', type: 'bird', area: 'Fishing Village', tags: 'double barred finch lighthouse bird location', note: 'Bird route for Double-Barred Finch and village species.', link: '/database/birds/double-barred-finch/' },
        { name: 'Onsen Mountain Birds', type: 'bird', area: 'Onsen Mountain', tags: 'hawfinch golden pheasant crater lake bird', note: 'Route for Hawfinch and mountain bird searches.', link: '/database/birds/hawfinch/' },
        { name: 'Forest Bird Route', type: 'bird', area: 'Forest', tags: 'forest lake forest island birdwatching', note: 'Broad birdwatching route for forest and Forest Lake listings; confirm each bird\'s conditions in the database.', link: '/database/birds/' },
        { name: 'Flower Field Birds', type: 'bird', area: 'Flower Field', tags: 'flower field meadow lake birdwatching', note: 'Broad birdwatching route for Flower Field and Meadow Lake listings; confirm each bird\'s conditions in the database.', link: '/database/birds/' },
        { name: 'Seaside Bird Route', type: 'bird', area: 'Coast', tags: 'beach coast sea birdwatching', note: 'Broad birdwatching route for beach and coast listings; confirm each bird\'s conditions in the database.', link: '/database/birds/' },
        { name: 'Suburbs Bird Route', type: 'bird', area: 'Suburbs', tags: 'suburbs town birdwatching', note: 'Broad birdwatching route for Suburbs listings; confirm each bird\'s conditions in the database.', link: '/database/birds/' },
        { name: 'Nest of Hundreds Birds', type: 'bird', area: 'Event Area', tags: 'nest of hundreds event bird peafowl macaw', note: 'Birdwatching route for entries tied to the Nest of Hundreds event area.', link: '/database/birds/' },
        { name: 'Flower Field Butterflies', type: 'insect', area: 'Flower Field', tags: 'purple emperor elegant flower beetle butterfly', note: 'Flower route for butterflies and flower beetles.', link: '/database/insects/' },
        { name: 'Forest Beetles', type: 'insect', area: 'Forest', tags: 'golden stag beetle hercules beetle night', note: 'Forest route for rare beetles and high-level catches.', link: '/database/insects/golden-stag-beetle/' },
        { name: 'Insect Attractor Route', type: 'insect', area: 'Home Lots', tags: 'sulkowskys morpho attractor home garden', note: 'Use attractor checks for special insect entries.', link: '/database/insects/sulkowskys-morpho/' },
        { name: 'Bus Stops', type: 'landmark', area: 'All Areas', tags: 'fast travel map navigation', note: 'Use bus stops to shorten daily gathering and NPC routes.', link: '/guides/map/#areas' },
        { name: 'Jump Puzzle', type: 'landmark', area: 'Forest', tags: 'forest panda bamboo stairs', note: 'Forest landmark near Panda and bamboo gathering.', link: '/guides/map/#wild-animals' },
        { name: 'Sea Fishing Event', type: 'event', area: 'Fishing Village', tags: 'bill fishing event ocean', note: 'Event location hosted by Bill in Fishing Village.', link: '/hobbies/fishing/' },
        { name: 'Nest of Hundreds', type: 'event', area: 'Event Area', tags: 'bird event peafowl macaw', note: 'Event route for special bird entries.', link: '/database/birds/' },
        { name: 'Meteor Shower Sites', type: 'event', area: 'Onsen Mountain', tags: 'meteor shower doris aurora photo event', note: 'Weather/event search route for Doris and sky events.', link: '/guides/meteor-shower/' }
    ];

    const typeLabels = {
        all: 'All types',
        resource: 'Resources',
        npc: 'NPCs',
        wildlife: 'Wild animals',
        fish: 'Fish spots',
        insect: 'Insects',
        bird: 'Birds',
        landmark: 'Landmarks',
        event: 'Events'
    };
    const dailyRoutes = [
        {
            id: 'daily-resource-route',
            name: 'Daily Materials Route',
            emoji: '🧺',
            area: 'Mixed route',
            description: 'A fast material loop for mushrooms, timber, fluorite, bamboo, and Black Truffle checks.',
            items: ['Shiitake Mushrooms', 'Oyster Mushrooms', 'Bamboo', 'Fluorite Mine', 'Roaming Oak', 'Black Truffle']
        },
        {
            id: 'town-npc-route',
            name: 'Town NPC Route',
            emoji: '🏙️',
            area: 'Central Town',
            description: 'Quick town checks for shops, inventory upgrade, pet store, and weather merchant paths.',
            items: ['Dorothy', 'Bob', 'Bailey J', 'Ka Ching', 'Doris']
        },
        {
            id: 'wildlife-weather-route',
            name: 'Wildlife Weather Route',
            emoji: '🐾',
            area: 'Animal habitats',
            description: 'A weather-based route for checking current wild animal locations across major regions.',
            items: ['Fox', 'Alpaca', 'Bunny', 'Panda', 'Sika Deer', 'Capybara', 'Sea Otter']
        },
        {
            id: 'photo-and-catch-route',
            name: 'Photo & Catch Route',
            emoji: '📸',
            area: 'Birds, fish, insects',
            description: 'A collection route for bird photos, fish spots, and insect areas.',
            items: ['Central Area Birds', 'Fishing Village Lighthouse Birds', 'Onsen Mountain Birds', 'Meadow Lake', 'Fishing Village Coast', 'Forest Beetles', 'Flower Field Butterflies']
        },
        {
            id: 'rainy-insect-route',
            name: 'Rainy Insect Route',
            emoji: '☔',
            area: 'Flower Field, Forest, Home Lots',
            description: 'When Rainy weather is active, use this loop to check key insect areas. Confirm each insect\'s own weather and time in the database.',
            items: ['Flower Field Butterflies', 'Forest Beetles', 'Insect Attractor Route']
        },
        {
            id: 'rainbow-wildlife-route',
            name: 'Rainbow Wildlife Route',
            emoji: '🌈',
            area: 'Flower Field, Crater Lake, Rosy River',
            description: 'A focused route for the wildlife entries currently listed under Rainbow weather.',
            items: ['Fox', 'Capybara', 'Ferret']
        },
        {
            id: 'event-route',
            name: 'Event Route',
            emoji: '✨',
            area: 'Fishing Village, Event Area, Onsen Mountain',
            description: 'A quick event-area loop. Check the current in-game schedule before traveling to a limited activity.',
            items: ['Sea Fishing Event', 'Nest of Hundreds', 'Meteor Shower Sites']
        }
    ];

    function readVisited() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            const values = raw ? JSON.parse(raw) : [];
            return new Set(Array.isArray(values) ? values : []);
        } catch (error) {
            return new Set();
        }
    }

    function writeVisited(visited) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(visited).sort()));
        } catch (error) {
            return;
        }
    }

    function readFilterState() {
        try {
            const raw = localStorage.getItem(FILTER_STATE_KEY);
            const value = raw ? JSON.parse(raw) : null;
            return value && typeof value === 'object' ? value : {};
        } catch (error) {
            return {};
        }
    }

    function getCurrentFilterState() {
        const search = document.getElementById('map-location-search');
        const type = document.getElementById('map-type-filter');
        const area = document.getElementById('map-area-filter');
        const hideVisited = document.getElementById('map-hide-visited');
        return {
            search: search ? search.value.trim() : '',
            type: type ? type.value : 'all',
            area: area ? area.value : 'all',
            hideVisited: Boolean(hideVisited?.checked)
        };
    }

    function saveFilterState(overrides = {}) {
        try {
            const prior = readFilterState();
            const state = {
                ...prior,
                ...getCurrentFilterState(),
                focus: prior.focus || '',
                entity: prior.entity || '',
                ...overrides,
                savedAt: Date.now()
            };
            localStorage.setItem(FILTER_STATE_KEY, JSON.stringify(state));
            return state;
        } catch (error) {
            return {};
        }
    }

    function restoreFilterState() {
        const state = readFilterState();
        const search = document.getElementById('map-location-search');
        const type = document.getElementById('map-type-filter');
        const area = document.getElementById('map-area-filter');
        const hideVisited = document.getElementById('map-hide-visited');
        if (search && typeof state.search === 'string') search.value = state.search;
        if (type && Object.prototype.hasOwnProperty.call(typeLabels, state.type)) type.value = state.type;
        if (area && Array.from(area.options).some(option => option.value === state.area)) area.value = state.area;
        if (hideVisited && typeof state.hideVisited === 'boolean') hideVisited.checked = state.hideVisited;
        return state;
    }

    function slug(text) {
        return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }
    function todayKey() {
        return new Date().toISOString().slice(0, 10);
    }

    function readTodayChecklist() {
        try {
            const raw = localStorage.getItem(TODAY_ROUTE_KEY);
            const value = raw ? JSON.parse(raw) : null;
            if (!value || value.date !== todayKey()) {
                return { date: todayKey(), routeId: '', items: [], checked: [] };
            }
            return {
                date: value.date,
                routeId: value.routeId || '',
                items: Array.isArray(value.items) ? value.items : [],
                checked: Array.isArray(value.checked) ? value.checked : []
            };
        } catch (error) {
            return { date: todayKey(), routeId: '', items: [], checked: [] };
        }
    }

    function writeTodayChecklist(checklist) {
        try {
            localStorage.setItem(TODAY_ROUTE_KEY, JSON.stringify({
                date: todayKey(),
                routeId: checklist.routeId || '',
                items: Array.isArray(checklist.items) ? checklist.items : [],
                checked: Array.isArray(checklist.checked) ? checklist.checked : []
            }));
        } catch (error) {
            return;
        }
    }

    function getLocationByName(name) {
        return locations.find(item => item.name === name);
    }

    function scrollToMap(item, entity = '') {
        const map = document.getElementById('interactive-map');
        const status = document.getElementById('map-focus-status');
        if (!map) return;
        if (item) saveFilterState({ focus: item.name, entity });
        map.scrollIntoView({ behavior: 'smooth', block: 'start' });
        map.classList.add('ring-4', 'ring-cozy-coral/40');
        window.setTimeout(() => map.classList.remove('ring-4', 'ring-cozy-coral/40'), 1800);
        if (status && item) {
            status.classList.remove('hidden');
            const label = document.createElement('strong');
            label.textContent = 'Map focus:';
            const target = entity ? `${entity} -> ${item.name}` : item.name;
            status.replaceChildren(label, document.createTextNode(` ${target} · ${item.area}. This is a route anchor; use the Location Finder filters below for the related database and guide links.`));
        }
    }

    function withMapReturn(link) {
        try {
            const url = new URL(link, window.location.origin);
            url.searchParams.set('map-return', '1');
            return url.pathname + url.search + url.hash;
        } catch (error) {
            return link;
        }
    }

    function setupAreaOptions() {
        const areaSelect = document.getElementById('map-area-filter');
        if (!areaSelect) return;
        const areas = Array.from(new Set(locations.map(item => item.area))).sort();
        areaSelect.innerHTML = '<option value="all">All areas</option>' + areas.map(area => `<option value="${area}">${area}</option>`).join('');
    }

    function locationMatches(item, query, type, area, hideVisited, visited) {
        const itemId = slug(item.name);
        const haystack = [item.name, item.type, item.area, item.tags, item.note].join(' ').toLowerCase();
        return (!query || haystack.includes(query)) &&
            (type === 'all' || item.type === type) &&
            (area === 'all' || item.area === area) &&
            (!hideVisited || !visited.has(itemId));
    }

    function renderLocations() {
        const list = document.getElementById('map-location-results');
        const count = document.getElementById('map-location-count');
        const progress = document.getElementById('map-location-progress');
        const empty = document.getElementById('map-location-empty');
        if (!list || !count || !progress || !empty) return;

        const query = document.getElementById('map-location-search').value.trim().toLowerCase();
        const type = document.getElementById('map-type-filter').value;
        const area = document.getElementById('map-area-filter').value;
        const hideVisited = document.getElementById('map-hide-visited').checked;
        const visited = readVisited();
        const visible = locations.filter(item => locationMatches(item, query, type, area, hideVisited, visited));

        count.textContent = String(visible.length);
        progress.textContent = `${visited.size}/${locations.length} marked`;
        empty.classList.toggle('hidden', visible.length !== 0);
        list.innerHTML = visible.map(item => {
            const itemId = slug(item.name);
            const checked = visited.has(itemId) ? 'checked' : '';
            const dim = visited.has(itemId) ? 'opacity-60' : '';
            return `
                <article class="map-location-card ${dim} rounded-xl border border-cozy-peach/40 bg-cozy-cream/50 p-4 cursor-pointer hover:border-cozy-coral transition-colors" data-location-id="${itemId}" data-type="${item.type}" data-area="${item.area}">
                    <div class="flex items-start justify-between gap-3">
                        <div>
                            <div class="text-xs uppercase tracking-wide text-cozy-coral font-bold">${typeLabels[item.type]}</div>
                            <h3 class="font-bold text-lg text-cozy-bark">${item.name}</h3>
                            <p class="text-sm text-cozy-wood mt-1">${item.note}</p>
                        </div>
                        <label class="shrink-0 inline-flex items-center gap-2 text-xs font-bold text-cozy-wood cursor-pointer">
                            <input type="checkbox" class="map-location-check h-5 w-5 rounded accent-[#ff8a7a]" data-location-id="${itemId}" ${checked}>
                            Done
                        </label>
                    </div>
                    <div class="mt-3 flex flex-wrap items-center gap-2 text-xs">
                        <span class="rounded-full bg-white px-2 py-1 border border-cozy-peach/40">${item.area}</span>
                        <span class="rounded-full bg-white px-2 py-1 border border-cozy-peach/40">${typeLabels[item.type]}</span>
                        <button type="button" class="map-focus-button text-cozy-coral font-bold hover:underline" data-location-id="${itemId}">Show on map</button>
                        <a href="${withMapReturn(item.link)}" class="map-guide-link ml-auto text-cozy-coral font-bold hover:underline" data-location-id="${itemId}">Open guide</a>
                    </div>
                </article>`;
        }).join('');
    }


    function renderDailyRoutes() {
        const routeCards = document.getElementById('daily-route-cards');
        const routeItems = document.getElementById('today-route-items');
        const routeEmpty = document.getElementById('today-route-empty');
        const routeCount = document.getElementById('today-route-count');
        const routeDate = document.getElementById('today-route-date');
        if (!routeCards || !routeItems || !routeEmpty || !routeCount || !routeDate) return;

        const checklist = readTodayChecklist();
        const checkedSet = new Set(checklist.checked);
        routeDate.textContent = checklist.date;
        routeCount.textContent = `${checkedSet.size}/${checklist.items.length}`;

        routeCards.innerHTML = dailyRoutes.map(route => {
            const active = checklist.routeId === route.id ? 'border-cozy-coral bg-cozy-coral/10' : 'border-cozy-peach/40 bg-cozy-cream/50';
            return `
                <button type="button" class="daily-route-card text-left rounded-2xl border ${active} p-4 hover:border-cozy-coral transition-colors" data-route-id="${route.id}">
                    <div class="flex items-center justify-between gap-3 mb-2">
                        <span class="text-2xl">${route.emoji}</span>
                        <span class="text-xs font-bold text-cozy-coral">${route.items.length} stops</span>
                    </div>
                    <h3 class="font-bold text-cozy-bark">${route.name}</h3>
                    <p class="text-xs text-cozy-wood mt-1">${route.area}</p>
                    <p class="text-sm text-cozy-wood mt-2">${route.description}</p>
                </button>`;
        }).join('');

        routeEmpty.classList.toggle('hidden', checklist.items.length !== 0);
        routeItems.innerHTML = checklist.items.map(name => {
            const item = getLocationByName(name);
            const itemId = slug(name);
            const checked = checkedSet.has(itemId) ? 'checked' : '';
            const labelClass = checkedSet.has(itemId) ? 'opacity-60 line-through' : '';
            return `
                <label class="flex items-start gap-3 rounded-xl bg-white border border-cozy-peach/40 p-3 cursor-pointer hover:border-cozy-coral transition-colors">
                    <input type="checkbox" class="today-route-check mt-1 h-5 w-5 rounded accent-[#ff8a7a]" data-location-id="${itemId}" ${checked}>
                    <span class="flex-1 ${labelClass}">
                        <strong class="block text-cozy-bark">${name}</strong>
                        <span class="block text-sm text-cozy-wood">${item ? item.area + ' · ' + item.note : 'Route stop'}</span>
                    </span>
                    <button type="button" class="today-route-map text-xs font-bold text-cozy-coral hover:underline" data-location-name="${name}">Map</button>
                </label>`;
        }).join('');
    }

    function loadDailyRoute(routeId) {
        const route = dailyRoutes.find(item => item.id === routeId);
        if (!route) return;
        writeTodayChecklist({ date: todayKey(), routeId: route.id, items: route.items, checked: [] });
        const first = getLocationByName(route.items[0]);
        if (first) scrollToMap(first);
        renderDailyRoutes();
    }

    function clearTodayChecklist() {
        writeTodayChecklist({ date: todayKey(), routeId: '', items: [], checked: [] });
        renderDailyRoutes();
    }
    window.filterMapLocations = renderLocations;
    window.resetMapLocationFilters = resetFilters;
    window.clearMapVisitedLocations = clearVisited;

    function resetFilters() {
        document.getElementById('map-location-search').value = '';
        document.getElementById('map-type-filter').value = 'all';
        document.getElementById('map-area-filter').value = 'all';
        document.getElementById('map-hide-visited').checked = false;
        saveFilterState({ focus: '', entity: '' });
        renderLocations();
    }

    function clearVisited() {
        if (!confirm('Clear marked map locations in this browser?')) return;
        localStorage.removeItem(STORAGE_KEY);
        renderLocations();
    }

    function showUncollectedNotice() {
        const toggle = document.getElementById('map-hide-visited');
        const panel = toggle?.closest('section');
        if (!toggle || document.getElementById('map-progress-filter-notice')) return;
        const notice = document.createElement('div');
        notice.id = 'map-progress-filter-notice';
        notice.className = 'mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-cozy-sky/40 bg-cozy-sky/10 px-4 py-3 text-sm text-cozy-bark';
        notice.innerHTML = '<span><strong>Uncollected only</strong> is active.</span><button type="button" class="font-bold text-cozy-coral hover:underline">Show all</button>';
        notice.querySelector('button')?.addEventListener('click', function () {
            const url = new URL(window.location.href);
            url.searchParams.delete('progress');
            window.location.href = url.pathname + url.search + url.hash;
        });
        panel?.parentNode?.insertBefore(notice, panel.nextSibling);
    }

    function applyNavigationState() {
        const prior = restoreFilterState();
        const params = new URLSearchParams(window.location.search);
        const search = document.getElementById('map-location-search');
        const type = document.getElementById('map-type-filter');
        const area = document.getElementById('map-area-filter');
        const hideVisited = document.getElementById('map-hide-visited');
        const urlSearch = params.get('search');
        const urlType = params.get('type');
        const urlArea = params.get('area');
        const isEntityView = params.get('view') === 'entity';
        const isUncollected = params.get('progress') === 'uncollected';
        const hasNavigation = ['view', 'search', 'type', 'area', 'progress', 'focus', 'entity'].some(key => params.has(key));

        if (isEntityView) {
            if (search) search.value = '';
            if (type) type.value = 'all';
            if (area) area.value = 'all';
            if (hideVisited) hideVisited.checked = false;
        }
        if (search && urlSearch !== null) search.value = urlSearch.trim();
        if (type && urlType && Object.prototype.hasOwnProperty.call(typeLabels, urlType)) type.value = urlType;
        if (area && urlArea && Array.from(area.options).some(option => option.value === urlArea)) area.value = urlArea;
        if (hideVisited && isUncollected) hideVisited.checked = true;

        const requestedFocus = params.get('focus')?.trim() || '';
        const focusItem = requestedFocus ? getLocationByName(requestedFocus) : null;
        const entity = params.get('entity')?.trim() || '';
        if (focusItem) {
            saveFilterState({ focus: focusItem.name, entity });
        } else if (hasNavigation) {
            saveFilterState({ focus: '', entity: '' });
        } else if (prior.focus) {
            saveFilterState({ focus: prior.focus, entity: prior.entity || '' });
        }

        if (isUncollected) showUncollectedNotice();
        return { focusItem, entity };
    }

    function handleFilterChange() {
        saveFilterState({ focus: '', entity: '' });
        renderLocations();
    }

    document.addEventListener('DOMContentLoaded', () => {
        setupAreaOptions();
        ['map-location-search', 'map-type-filter', 'map-area-filter', 'map-hide-visited'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', handleFilterChange);
            if (el) el.addEventListener('change', handleFilterChange);
        });
        document.getElementById('map-reset-filters')?.addEventListener('click', resetFilters);
        document.getElementById('map-clear-visited')?.addEventListener('click', clearVisited);
        document.getElementById('today-route-clear')?.addEventListener('click', clearTodayChecklist);
        document.getElementById('daily-route-cards')?.addEventListener('click', event => {
            const button = event.target.closest('.daily-route-card');
            if (!button) return;
            loadDailyRoute(button.dataset.routeId);
        });
        document.getElementById('today-route-items')?.addEventListener('change', event => {
            const input = event.target.closest('.today-route-check');
            if (!input) return;
            const checklist = readTodayChecklist();
            const checked = new Set(checklist.checked);
            if (input.checked) {
                checked.add(input.dataset.locationId);
            } else {
                checked.delete(input.dataset.locationId);
            }
            checklist.checked = Array.from(checked).sort();
            writeTodayChecklist(checklist);
            renderDailyRoutes();
        });
        document.getElementById('today-route-items')?.addEventListener('click', event => {
            const button = event.target.closest('.today-route-map');
            if (!button) return;
            event.preventDefault();
            const item = getLocationByName(button.dataset.locationName);
            scrollToMap(item);
        });
        document.getElementById('map-location-results')?.addEventListener('click', event => {
            const guideLink = event.target.closest('.map-guide-link');
            if (guideLink) {
                const item = locations.find(location => slug(location.name) === guideLink.dataset.locationId);
                if (item) saveFilterState({ focus: item.name, entity: '' });
                return;
            }
            const focusButton = event.target.closest('.map-focus-button');
            const card = event.target.closest('.map-location-card');
            if (!focusButton && (!card || event.target.closest('a, input, label'))) return;
            event.preventDefault();
            const id = (focusButton || card).dataset.locationId;
            const item = locations.find(location => slug(location.name) === id);
            scrollToMap(item);
        });
        document.getElementById('map-location-results')?.addEventListener('change', event => {
            const input = event.target.closest('.map-location-check');
            if (!input) return;
            const visited = readVisited();
            if (input.checked) {
                visited.add(input.dataset.locationId);
            } else {
                visited.delete(input.dataset.locationId);
            }
            writeVisited(visited);
            renderLocations();
        });
        const navigation = applyNavigationState();
        renderLocations();
        renderDailyRoutes();
        if (navigation.focusItem) window.setTimeout(() => scrollToMap(navigation.focusItem, navigation.entity), 120);
    });
})();
