(() => {
    const npcs = [
        { name: 'Blanc', role: 'Gardening Mentor', type: 'mentor', area: 'Garden Street', location: 'Gardening Shop / Garden Street', function: 'Seeds, plant boxes, fertilizer, gardening unlocks', gifts: 'Flowers, crops, fruit, garden dishes', quests: 'Early gardening tutorial and seed route', tags: 'blanc gardening shop seeds plant boxes fertilizer crops flowers', link: '/npcs/blanc/' },
        { name: 'Doris', role: 'Weather Merchant', type: 'merchant', area: 'Weather Routes', location: 'Art Street, rainbow base, meteor sites', function: 'Weather shop, roll cake recipe, meteor and rainbow items', gifts: 'Event currencies and weather-related routing', quests: 'Rain, snow, rainbow, and meteor shower checks', tags: 'doris weather merchant rain snow rainbow meteor roll cake shop', link: '/npcs/doris/' },
        { name: 'Vanya', role: 'Fishing Mentor', type: 'mentor', area: 'River Pier', location: 'Town River Pier / Fishing Shop', function: 'Fishing unlock, bait, repair kit, fishing shop', gifts: 'Fish, seafood dishes, coffee, fishing bait', quests: 'Fishing beginner, rod repair, cat fish quest', tags: 'vanya fishing mentor river pier fishing shop bait rod fish seafood', link: '/npcs/vanya/' },
        { name: 'Vernie', role: 'Flower Field Resident', type: 'resident', area: 'Flower Field', location: 'Flower Field near the windmill', function: 'Music story route, Lute, Astralis quest', gifts: 'Flowers and music-themed items', quests: 'Astralis in Flower Field, Lute unlock', tags: 'vernie flower field windmill lute music astralis', link: '/npcs/vernie/' },
        { name: 'Atara', role: 'Mayor', type: 'resident', area: 'Town Hall', location: 'Town Hall', function: 'Daily Requests intro and town story', gifts: 'Polite daily gifts and story items', quests: 'Daily Requests and mayor route', tags: 'atara mayor town hall daily requests', link: '/npcs/atara/' },
        { name: 'Eric', role: 'Winter Event NPC', type: 'event', area: 'Onsen Mountain', location: 'Onsen Mountain Park / winter route', function: 'Winter Frost event quests', gifts: 'Event-themed gifts and cooked food', quests: 'Winter Frost, Astralis in Onsen Mountain', tags: 'eric winter frost onsen mountain event astralis', link: '/npcs/eric/' },
        { name: 'Will', role: 'Lighthouse Resident', type: 'resident', area: 'Coast', location: 'Lighthouse area', function: 'Coastal story progression', gifts: 'Story-safe gifts and cooked meals', quests: 'Lighthouse story route', tags: 'will lighthouse coast story', link: '/npcs/will/' },
        { name: 'Dorothee', role: 'Clothing Store Manager', type: 'merchant', area: 'Central Town', location: 'Clothing Store', function: 'Clothing store and Dress App unlocks', gifts: 'Clothing, design, and style-themed items', quests: 'Clothing store poster route', tags: 'dorothee dorothy clothing store dress app patterns', link: '/npcs/dorothee/' },
        { name: 'Massimo', role: 'Cooking Mentor', type: 'mentor', area: 'Town Center', location: 'Cafe / Town Center', function: 'Cooking recipes and ingredients', gifts: 'Cooked meals, eggs, cafe-friendly food', quests: 'Cooking unlock and recipe buying', tags: 'massimo cooking mentor cafe recipes eggs food', link: '/database/recipes/' },
        { name: 'Naniwa', role: 'Insect Mentor', type: 'mentor', area: 'Garden Area', location: 'Garden river area', function: 'Bubble Net and insect catching unlocks', gifts: 'Insect and nature-themed items', quests: 'Insect catching route', tags: 'naniwa insect catching bubble net garden river', link: '/hobbies/insect-catching/' },
        { name: 'Bailey J', role: 'Birdwatching Mentor', type: 'mentor', area: 'Central Plaza', location: 'Above the Pet Shop', function: 'Birdwatching and Info Card recycling', gifts: 'Bird and nature-themed items', quests: 'Birdwatching unlock route', tags: 'bailey birdwatching info card pet shop birds', link: '/hobbies/birdwatching/' },
        { name: 'Mrs. Joan', role: 'Pet Adoption', type: 'merchant', area: 'Pet Adoption Center', location: 'Pet Adoption Center', function: 'Cat and dog adoption', gifts: 'Animal products and pet-themed gifts', quests: 'Cat care and dog care unlock routes', tags: 'mrs joan pet adoption cats dogs animal products', link: '/hobbies/cat-care/' },
        { name: 'Azure', role: 'Snow Sculpting Mentor', type: 'event', area: 'Onsen Mountain', location: 'Onsen Mountain during Winter Frost', function: 'Snow Sculpting hobby unlock', gifts: 'Winter event items', quests: 'Snow Sculpting and Winter Frost', tags: 'azure snow sculpting winter frost onsen mountain', link: '/hobbies/snow-sculpting/' },
        { name: 'Albert Jr.', role: 'Wandering Gold Merchant', type: 'merchant', area: 'Town Routes', location: 'Wanders around town', function: 'Buys items from players for Gold', gifts: 'Merchant-safe daily gifts', quests: 'Selling and money route', tags: 'albert jr wandering gold merchant sell items bus', link: '/progression/money-making/' },
        { name: 'Ka-Ching', role: 'General Store Owner', type: 'merchant', area: 'Suburban Lake', location: 'Residential Street / Suburban Lake', function: 'General goods, puzzles, fireworks, repair kits, dyes', gifts: 'Shop-themed gifts and useful goods', quests: 'Store and inventory route', tags: 'ka ching general store puzzles fireworks repair kits dyes', link: '/guides/ka-ching/' },
        { name: 'Night Merchant', role: 'Mystery Seed Seller', type: 'merchant', area: 'Town Square', location: 'Town Square after 10 PM', function: 'Mystery Seeds and night shop checks', gifts: 'Night market-safe gifts', quests: 'Late-night shopping route', tags: 'night merchant mystery seeds town square 10 pm', link: '/npcs/#merchants' }
    ];

    const stateKeys = {
        met: 'heartopia.npcs.met',
        gift: 'heartopia.npcs.gift',
        quest: 'heartopia.npcs.quest'
    };

    const readSet = (key) => {
        try { return new Set(JSON.parse(localStorage.getItem(key) || '[]')); }
        catch (error) { return new Set(); }
    };
    const writeSet = (key, set) => localStorage.setItem(key, JSON.stringify([...set]));
    const slug = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const text = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };

    const sets = {
        met: readSet(stateKeys.met),
        gift: readSet(stateKeys.gift),
        quest: readSet(stateKeys.quest)
    };

    const buttonClass = (active) => `rounded-full border px-3 py-1 text-xs font-bold transition-colors ${active ? 'border-cozy-coral bg-cozy-coral text-white' : 'border-cozy-peach/60 bg-white text-cozy-wood hover:border-cozy-coral'}`;

    const initNpcDatabase = () => {
        const root = document.querySelector('[data-npc-database]');
        if (!root) return;

        const controls = {
            search: document.getElementById('npc-search'),
            type: document.getElementById('npc-type-filter'),
            area: document.getElementById('npc-area-filter'),
            function: document.getElementById('npc-function-filter'),
            state: document.getElementById('npc-state-filter'),
            reset: document.getElementById('npc-filter-reset')
        };
        const list = document.getElementById('npc-results');
        const empty = document.getElementById('npc-empty');
        if (!list) return;

        const render = () => {
            const query = (controls.search?.value || '').trim().toLowerCase();
            const type = controls.type?.value || 'all';
            const area = controls.area?.value || 'all';
            const fn = controls.function?.value || 'all';
            const state = controls.state?.value || 'all';
            const filtered = npcs.filter((npc) => {
                const id = slug(npc.name);
                const haystack = `${npc.name} ${npc.role} ${npc.area} ${npc.location} ${npc.function} ${npc.gifts} ${npc.quests} ${npc.tags}`.toLowerCase();
                const functionMatch = fn === 'all'
                    || (fn === 'shop' && /shop|store|sell|merchant|goods|recipe|seeds|bait|adoption/.test(haystack))
                    || (fn === 'quest' && /quest|tutorial|story|route|unlock/.test(haystack))
                    || (fn === 'gift' && /gift|flowers|fish|food|crops|items/.test(haystack))
                    || (fn === 'hobby' && /mentor|hobby|fishing|gardening|cooking|insect|birdwatching|snow/.test(haystack));
                const stateMatch = state === 'all'
                    || (state === 'met' && sets.met.has(id))
                    || (state === 'gift' && sets.gift.has(id))
                    || (state === 'quest' && sets.quest.has(id))
                    || (state === 'unmarked' && !sets.met.has(id) && !sets.gift.has(id) && !sets.quest.has(id));
                return (!query || haystack.includes(query))
                    && (type === 'all' || npc.type === type)
                    && (area === 'all' || npc.area.toLowerCase().includes(area))
                    && functionMatch
                    && stateMatch;
            });

            list.innerHTML = filtered.map((npc) => {
                const id = slug(npc.name);
                return `
                    <article class="rounded-2xl border border-cozy-peach/40 bg-white p-5 shadow-sm" data-npc-card="${id}">
                        <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div>
                                <p class="text-xs font-bold uppercase tracking-wide text-cozy-coral">${npc.type}</p>
                                <h3 class="mt-1 text-xl font-bold text-cozy-bark"><a class="hover:text-cozy-coral" href="${npc.link}">${npc.name}</a></h3>
                                <p class="text-sm font-semibold text-cozy-wood">${npc.role}</p>
                            </div>
                            <a class="inline-flex items-center justify-center rounded-lg bg-cozy-coral px-4 py-2 text-sm font-bold text-white hover:bg-cozy-bark" href="${npc.link}">Open</a>
                        </div>
                        <div class="mt-4 grid gap-3 text-sm md:grid-cols-2">
                            <p><strong>Location:</strong> <span class="text-cozy-wood">${npc.location}</span></p>
                            <p><strong>Use:</strong> <span class="text-cozy-wood">${npc.function}</span></p>
                            <p><strong>Gifts:</strong> <span class="text-cozy-wood">${npc.gifts}</span></p>
                            <p><strong>Quests:</strong> <span class="text-cozy-wood">${npc.quests}</span></p>
                        </div>
                        <div class="mt-4 flex flex-wrap gap-2" data-npc-actions="${id}">
                            <button type="button" class="${buttonClass(sets.met.has(id))}" data-state="met" data-id="${id}">Met</button>
                            <button type="button" class="${buttonClass(sets.gift.has(id))}" data-state="gift" data-id="${id}">Gift</button>
                            <button type="button" class="${buttonClass(sets.quest.has(id))}" data-state="quest" data-id="${id}">Quest</button>
                        </div>
                    </article>`;
            }).join('');

            list.querySelectorAll('button[data-state]').forEach((button) => {
                button.addEventListener('click', () => {
                    const set = sets[button.dataset.state];
                    const id = button.dataset.id;
                    if (set.has(id)) set.delete(id); else set.add(id);
                    writeSet(stateKeys[button.dataset.state], set);
                    render();
                });
            });

            text('npc-visible-count', filtered.length);
            text('npc-total-count', npcs.length);
            text('npc-met-count', sets.met.size);
            text('npc-gift-count', sets.gift.size);
            text('npc-quest-count', sets.quest.size);
            empty?.classList.toggle('hidden', filtered.length !== 0);
        };

        [controls.search, controls.type, controls.area, controls.function, controls.state].forEach((control) => {
            control?.addEventListener('input', render);
            control?.addEventListener('change', render);
        });
        controls.reset?.addEventListener('click', () => {
            if (controls.search) controls.search.value = '';
            if (controls.type) controls.type.value = 'all';
            if (controls.area) controls.area.value = 'all';
            if (controls.function) controls.function.value = 'all';
            if (controls.state) controls.state.value = 'all';
            render();
        });

        render();
    };

    document.addEventListener('DOMContentLoaded', initNpcDatabase);
})();