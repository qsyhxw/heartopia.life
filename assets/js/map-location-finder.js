(function () {
    const STORAGE_KEY = 'heartopia.map.visitedLocations';
    const TODAY_ROUTE_KEY = 'heartopia.map.todayRouteChecklist';
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
        { name: 'Capybara', type: 'wildlife', area: 'Ruins', tags: 'wildlife capybara ruins rainbow rainy', note: 'Appears in the Ruins in Rainbow or Rainy weather.', link: '/database/wildlife/' },
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
        { name: 'Meadow Lake', type: 'fish', area: 'Flower Field', tags: 'butterfly koi lake fishing rain rainbow', note: 'Lake fishing spot connected to Butterfly Koi searches.', link: '/database/fish/butterfly-koi/' },
        { name: 'Any River', type: 'fish', area: 'River Routes', tags: 'tilapia river mermaid attractor fishing', note: 'Use river routes when hunting Tilapia and common river fish.', link: '/database/fish/tilapia/' },
        { name: 'Fishing Village Coast', type: 'fish', area: 'Fishing Village', tags: 'sea fishing sardine ocean coastal', note: 'Coastal route for sea fish and event fishing.', link: '/database/fish/sardine/' },
        { name: 'Whale Sea', type: 'fish', area: 'Sea', tags: 'seahorse whale sea fishing', note: 'Sea route connected to Seahorse and ocean fish.', link: '/database/fish/seahorse/' },
        { name: 'Central Area Birds', type: 'bird', area: 'Central Area', tags: 'european robin magpie house sparrow photo', note: 'Easy birdwatching route for all-day birds.', link: '/guides/bird-locations/' },
        { name: 'Fishing Village Lighthouse Birds', type: 'bird', area: 'Fishing Village', tags: 'double barred finch lighthouse bird location', note: 'Bird route for Double-Barred Finch and village species.', link: '/database/birds/double-barred-finch/' },
        { name: 'Onsen Mountain Birds', type: 'bird', area: 'Onsen Mountain', tags: 'hawfinch golden pheasant crater lake bird', note: 'Route for Hawfinch and mountain bird searches.', link: '/database/birds/hawfinch/' },
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
            name: 'Daily Resource Route',
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

    function scrollToMap(item) {
        const map = document.getElementById('interactive-map');
        const status = document.getElementById('map-focus-status');
        if (!map) return;
        map.scrollIntoView({ behavior: 'smooth', block: 'start' });
        map.classList.add('ring-4', 'ring-cozy-coral/40');
        window.setTimeout(() => map.classList.remove('ring-4', 'ring-cozy-coral/40'), 1800);
        if (status && item) {
            status.classList.remove('hidden');
            status.innerHTML = `<strong>Map focus:</strong> ${item.name} · ${item.area}. Use the map search or category filters to inspect this area, then return to the finder for the guide link.`;
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
                        <a href="${item.link}" class="ml-auto text-cozy-coral font-bold hover:underline">Open guide</a>
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
        renderLocations();
    }

    function clearVisited() {
        if (!confirm('Clear marked map locations in this browser?')) return;
        localStorage.removeItem(STORAGE_KEY);
        renderLocations();
    }

    function applyUncollectedDeepLink() {
        const params = new URLSearchParams(window.location.search);
        if (params.get('progress') !== 'uncollected') return;
        const toggle = document.getElementById('map-hide-visited');
        const panel = toggle?.closest('section');
        if (!toggle) return;
        const query = params.get('search')?.trim();
        const search = document.getElementById('map-location-search');
        if (query && search) search.value = query;
        toggle.checked = true;
        if (!document.getElementById('map-progress-filter-notice')) {
            const notice = document.createElement('div');
            notice.id = 'map-progress-filter-notice';
            notice.className = 'mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-cozy-sky/40 bg-cozy-sky/10 px-4 py-3 text-sm text-cozy-bark';
            notice.innerHTML = '<span><strong>Uncollected only</strong> is active.</span><button type="button" class="font-bold text-cozy-coral hover:underline">Show all</button>';
            notice.querySelector('button')?.addEventListener('click', function () {
                const url = new URL(window.location.href);
                url.searchParams.delete('progress');
                url.searchParams.delete('search');
                window.location.href = url.pathname + url.search + url.hash;
            });
            panel?.parentNode?.insertBefore(notice, panel.nextSibling);
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        setupAreaOptions();
        ['map-location-search', 'map-type-filter', 'map-area-filter', 'map-hide-visited'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', renderLocations);
            if (el) el.addEventListener('change', renderLocations);
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
        applyUncollectedDeepLink();
        renderLocations();
        renderDailyRoutes();
    });
})();
