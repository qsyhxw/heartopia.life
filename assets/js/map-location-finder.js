(function () {
    const STORAGE_KEY = 'heartopia.map.visitedLocations';
    const locations = [
        { name: 'Dorothy', type: 'npc', area: 'Central Town', tags: 'clothing store poster quest', note: 'Clothing store NPC unlocked through the poster quest.', link: '/guides/npc-locations/' },
        { name: 'Bob', type: 'npc', area: 'Central Town', tags: 'furniture store joinery tea table quest', note: 'Furniture store NPC tied to the joinery tea table quest.', link: '/guides/npc-locations/' },
        { name: 'Bailey J', type: 'npc', area: 'Central Town', tags: 'pet store birdwatching dg level 6', note: 'Upstairs in Pet Store; birdwatching unlock path.', link: '/hobbies/birdwatching/' },
        { name: 'Ka Ching', type: 'npc', area: 'Central Town', tags: 'inventory expansion bag upgrade', note: 'Inventory expansion NPC near the city center.', link: '/guides/ka-ching/' },
        { name: 'Bill', type: 'npc', area: 'Fishing Village', tags: 'sea fishing event host', note: 'Sea Fishing event host in Fishing Village.', link: '/hobbies/fishing/' },
        { name: 'Doris', type: 'npc', area: 'Art Street', tags: 'weather merchant rain rainbow meteor shower recipe', note: 'Traveling merchant tied to rain, rainbow, snow, or meteor weather.', link: '/guides/npc-locations/' },
        { name: 'Albert Jr.', type: 'npc', area: 'Varies', tags: 'gold merchant wandering sale daily icon', note: 'Moving merchant; check the in-game map icon each day.', link: '/guides/npc-locations/' },
        { name: 'Roaming Oak', type: 'npc', area: 'Home Lots', tags: 'rare timber tree daily moving resource', note: 'Moving tree NPC that can provide Roaming Oak Timber.', link: '/database/materials/roaming-oak-timber/' },
        { name: 'Alpaca Trough', type: 'wildlife', area: 'Flower Field', tags: 'animal trough tranquil river giant yellow duck', note: 'Near the giant yellow duck in southern Flower Fields.', link: '/guides/animal-troughs/' },
        { name: 'Bunny Trough', type: 'wildlife', area: 'Suburbs', tags: 'animal trough art street town bus stop', note: 'West of Art Street, between bus stop and town.', link: '/guides/animal-troughs/' },
        { name: 'Capybara Trough', type: 'wildlife', area: 'Onsen Mountain', tags: 'animal trough ruins crater lake favorite food', note: 'West of Onsen Mountain Lake near ruins.', link: '/guides/animal-troughs/' },
        { name: 'Ferret Trough', type: 'wildlife', area: 'Rosie River', tags: 'animal trough windmill river route', note: 'South of Rosie River, near the northern windmill.', link: '/guides/animal-troughs/' },
        { name: 'Fox Trough', type: 'wildlife', area: 'Flower Field', tags: 'animal trough meadow lake windmill fox', note: 'Near Meadow Lake, at the base of the southern windmill hill.', link: '/guides/animal-troughs/' },
        { name: 'Panda Trough', type: 'wildlife', area: 'Forest', tags: 'animal trough bamboo jump puzzle', note: 'Southern forest area with bamboo near Jump Puzzle stairs.', link: '/guides/animal-troughs/' },
        { name: 'Sea Otter Trough', type: 'wildlife', area: 'Fishing Village', tags: 'animal trough pier harbor', note: 'Between the two piers in the village square.', link: '/guides/animal-troughs/' },
        { name: 'Sika Deer Trough', type: 'wildlife', area: 'Forest Lake', tags: 'animal trough deer bus stop forest lake', note: 'Beside Forest Lake, close to the bus stop.', link: '/database/wildlife/deer/' },
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
                <article class="map-location-card ${dim} rounded-xl border border-cozy-peach/40 bg-cozy-cream/50 p-4" data-type="${item.type}" data-area="${item.area}">
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
                        <a href="${item.link}" class="ml-auto text-cozy-coral font-bold hover:underline">Open guide</a>
                    </div>
                </article>`;
        }).join('');
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

    document.addEventListener('DOMContentLoaded', () => {
        setupAreaOptions();
        ['map-location-search', 'map-type-filter', 'map-area-filter', 'map-hide-visited'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', renderLocations);
            if (el) el.addEventListener('change', renderLocations);
        });
        document.getElementById('map-reset-filters')?.addEventListener('click', resetFilters);
        document.getElementById('map-clear-visited')?.addEventListener('click', clearVisited);
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
        renderLocations();
    });
})();