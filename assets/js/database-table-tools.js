(() => {
    const buttonBase = 'inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-bold transition-colors';
    const buttonOff = 'border-cozy-peach/50 bg-white text-cozy-wood hover:border-cozy-coral';
    const buttonOn = 'border-cozy-coral bg-cozy-coral text-white';

    const slugify = (value) => value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    const readSet = (key) => {
        try {
            return new Set(JSON.parse(localStorage.getItem(key) || '[]'));
        } catch (error) {
            return new Set();
        }
    };

    const writeSet = (key, set) => {
        localStorage.setItem(key, JSON.stringify([...set]));
    };

    const setCount = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    };

    const setButtonState = (button, active) => {
        button.className = `${buttonBase} ${active ? buttonOn : buttonOff}`;
        button.setAttribute('aria-pressed', String(active));
    };

    const makeButton = (label, title, active, onClick) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = label;
        button.title = title;
        setButtonState(button, active);
        button.addEventListener('click', onClick);
        return button;
    };

    const parseGold = (text) => {
        const matches = text.match(/\d[\d,]*/g);
        if (!matches) return 0;
        return Math.max(...matches.map((value) => Number(value.replace(/,/g, '')) || 0));
    };

    const sectionName = (row) => {
        const section = row.closest('section');
        const heading = section?.querySelector('h2');
        return (heading?.textContent || section?.id || 'Other').replace(/\s+/g, ' ').trim();
    };

    const updateEmptyState = (container, count, emptyId) => {
        const empty = document.getElementById(emptyId);
        if (!empty) return;
        empty.classList.toggle('hidden', count !== 0);
        container?.classList.toggle('opacity-70', count === 0);
    };

    const initRecipeTools = () => {
        const panel = document.querySelector('[data-recipe-tools]');
        if (!panel) return;

        const tables = [...document.querySelectorAll('table[data-recipe-table]')];
        const unlockedKey = 'heartopia.database.recipes.unlocked';
        const wantKey = 'heartopia.database.recipes.want';
        const profitKey = 'heartopia.database.recipes.profit';
        const unlocked = readSet(unlockedKey);
        const want = readSet(wantKey);
        const profit = readSet(profitKey);

        const controls = {
            search: document.getElementById('recipe-db-search'),
            category: document.getElementById('recipe-db-category'),
            level: document.getElementById('recipe-db-level'),
            use: document.getElementById('recipe-db-use'),
            state: document.getElementById('recipe-db-state'),
            reset: document.getElementById('recipe-db-reset')
        };

        const rows = tables.flatMap((table) => {
            const headRow = table.querySelector('thead tr');
            if (headRow && !headRow.querySelector('[data-progress-heading]')) {
                const th = document.createElement('th');
                th.className = 'px-4 py-3 font-bold';
                th.textContent = 'My Notes';
                th.dataset.progressHeading = 'true';
                headRow.appendChild(th);
            }

            return [...table.querySelectorAll('tbody tr')].map((row) => {
                const cells = [...row.children];
                const name = (cells[0]?.textContent || '').replace(/\s+/g, ' ').trim();
                const id = slugify(name);
                const text = row.textContent.toLowerCase();
                const maxGold = parseGold(row.textContent);
                const category = row.closest('section')?.id || '';
                const levelText = cells[2]?.textContent || '';
                const level = Number((levelText.match(/\d+/) || ['0'])[0]);
                const highProfit = row.textContent.includes('⭐') || maxGold >= 260 || /mixed jam|mushroom stew|fish soup|black truffle|apple jam/i.test(row.textContent);
                const purpose = /energy|\b70\b|\b65\b|\b35\b|\b30\b/i.test(row.textContent)
                    ? 'energy'
                    : /quest|starter|massimo|unlock/i.test(row.textContent)
                        ? 'unlock'
                        : highProfit
                            ? 'profit'
                            : 'everyday';

                const td = document.createElement('td');
                td.className = 'px-4 py-3';
                const wrap = document.createElement('div');
                wrap.className = 'flex flex-wrap gap-2 min-w-[220px]';

                const refreshButtons = () => {
                    setButtonState(unlockedButton, unlocked.has(id));
                    setButtonState(wantButton, want.has(id));
                    setButtonState(profitButton, profit.has(id));
                };

                const toggleState = (set, key) => {
                    if (set.has(id)) {
                        set.delete(id);
                    } else {
                        set.add(id);
                    }
                    writeSet(key, set);
                    refreshButtons();
                    applyRecipeFilters();
                };

                const unlockedButton = makeButton('Unlocked', 'Mark this recipe as unlocked', unlocked.has(id), () => toggleState(unlocked, unlockedKey));
                const wantButton = makeButton('Want', 'Mark this recipe as something you want to cook', want.has(id), () => toggleState(want, wantKey));
                const profitButton = makeButton('Profit', 'Mark this recipe as a high-profit option for your route', profit.has(id), () => toggleState(profit, profitKey));
                wrap.append(unlockedButton, wantButton, profitButton);
                td.appendChild(wrap);
                row.appendChild(td);

                return { row, table, name, id, text, category, level, purpose, highProfit };
            });
        });

        const applyRecipeFilters = () => {
            const query = (controls.search?.value || '').trim().toLowerCase();
            const category = controls.category?.value || 'all';
            const level = controls.level?.value || 'all';
            const use = controls.use?.value || 'all';
            const state = controls.state?.value || 'all';
            let visible = 0;

            rows.forEach((item) => {
                const levelMatch = level === 'all'
                    || (level === 'early' && item.level <= 2)
                    || (level === 'mid' && item.level >= 3 && item.level <= 4)
                    || (level === 'late' && item.level >= 5);
                const stateMatch = state === 'all'
                    || (state === 'unlocked' && unlocked.has(item.id))
                    || (state === 'want' && want.has(item.id))
                    || (state === 'profit' && profit.has(item.id))
                    || (state === 'high-profit' && (item.highProfit || profit.has(item.id)))
                    || (state === 'unmarked' && !unlocked.has(item.id) && !want.has(item.id) && !profit.has(item.id));
                const match = (!query || item.text.includes(query) || item.name.toLowerCase().includes(query))
                    && (category === 'all' || item.category === category)
                    && levelMatch
                    && (use === 'all' || item.purpose === use)
                    && stateMatch;
                item.row.classList.toggle('hidden', !match);
                if (match) visible += 1;
            });

            tables.forEach((table) => {
                const section = table.closest('section');
                const hasVisible = [...table.querySelectorAll('tbody tr')].some((row) => !row.classList.contains('hidden'));
                section?.classList.toggle('hidden', !hasVisible);
            });

            setCount('recipe-db-visible-count', visible);
            setCount('recipe-db-total-count', rows.length);
            setCount('recipe-db-unlocked-count', unlocked.size);
            setCount('recipe-db-want-count', want.size);
            setCount('recipe-db-profit-count', profit.size);
            updateEmptyState(document.querySelector('[data-recipe-list]'), visible, 'recipe-db-empty');
        };

        [controls.search, controls.category, controls.level, controls.use, controls.state].forEach((control) => {
            control?.addEventListener('input', applyRecipeFilters);
            control?.addEventListener('change', applyRecipeFilters);
        });

        controls.reset?.addEventListener('click', () => {
            if (controls.search) controls.search.value = '';
            if (controls.category) controls.category.value = 'all';
            if (controls.level) controls.level.value = 'all';
            if (controls.use) controls.use.value = 'all';
            if (controls.state) controls.state.value = 'all';
            applyRecipeFilters();
        });

        applyRecipeFilters();
    };

    const initMaterialTools = () => {
        const panel = document.querySelector('[data-material-tools]');
        if (!panel) return;

        const table = document.querySelector('table[data-material-table]');
        if (!table) return;

        const haveKey = 'heartopia.database.materials.have';
        const needKey = 'heartopia.database.materials.need';
        const have = readSet(haveKey);
        const need = readSet(needKey);
        const controls = {
            search: document.getElementById('material-db-search'),
            type: document.getElementById('material-db-type'),
            use: document.getElementById('material-db-use'),
            state: document.getElementById('material-db-state'),
            reset: document.getElementById('material-db-reset')
        };

        const headRow = table.querySelector('thead tr');
        if (headRow && !headRow.querySelector('[data-progress-heading]')) {
            const th = document.createElement('th');
            th.className = 'px-4 py-3 text-left';
            th.textContent = 'My Notes';
            th.dataset.progressHeading = 'true';
            headRow.appendChild(th);
        }

        const rows = [...table.querySelectorAll('tbody tr')].map((row) => {
            const cells = [...row.children];
            const name = (cells[0]?.textContent || '').replace(/\s+/g, ' ').trim();
            const id = slugify(name);
            const text = row.textContent.toLowerCase();
            const type = /timber|wood|oak/.test(text)
                ? 'wood'
                : /fluorite|mine|mineral|crater/.test(text)
                    ? 'mineral'
                    : /poppy|flower|breeding/.test(text)
                        ? 'flower'
                        : /mushroom|truffle|cooking|recipe/.test(text)
                            ? 'cooking'
                            : 'other';
            const use = /craft|building|workbench/.test(text)
                ? 'crafting'
                : /cooking|recipe|profit/.test(text)
                    ? 'cooking'
                    : /flower|decor|request/.test(text)
                        ? 'decor'
                        : 'route';

            const td = document.createElement('td');
            td.className = 'px-4 py-3';
            const wrap = document.createElement('div');
            wrap.className = 'flex flex-wrap gap-2 min-w-[150px]';

            const refreshButtons = () => {
                setButtonState(haveButton, have.has(id));
                setButtonState(needButton, need.has(id));
            };

            const toggleState = (set, key) => {
                if (set.has(id)) {
                    set.delete(id);
                } else {
                    set.add(id);
                }
                writeSet(key, set);
                refreshButtons();
                applyMaterialFilters();
            };

            const haveButton = makeButton('Have', 'Mark this material as collected', have.has(id), () => toggleState(have, haveKey));
            const needButton = makeButton('Need', 'Mark this material as needed for later', need.has(id), () => toggleState(need, needKey));
            wrap.append(haveButton, needButton);
            td.appendChild(wrap);
            row.appendChild(td);

            return { row, name, id, text, type, use };
        });

        const applyMaterialFilters = () => {
            const query = (controls.search?.value || '').trim().toLowerCase();
            const type = controls.type?.value || 'all';
            const use = controls.use?.value || 'all';
            const state = controls.state?.value || 'all';
            let visible = 0;

            rows.forEach((item) => {
                const stateMatch = state === 'all'
                    || (state === 'have' && have.has(item.id))
                    || (state === 'need' && need.has(item.id))
                    || (state === 'unmarked' && !have.has(item.id) && !need.has(item.id));
                const match = (!query || item.text.includes(query) || item.name.toLowerCase().includes(query))
                    && (type === 'all' || item.type === type)
                    && (use === 'all' || item.use === use)
                    && stateMatch;
                item.row.classList.toggle('hidden', !match);
                if (match) visible += 1;
            });

            setCount('material-db-visible-count', visible);
            setCount('material-db-total-count', rows.length);
            setCount('material-db-have-count', have.size);
            setCount('material-db-need-count', need.size);
            updateEmptyState(table.closest('section'), visible, 'material-db-empty');
        };

        [controls.search, controls.type, controls.use, controls.state].forEach((control) => {
            control?.addEventListener('input', applyMaterialFilters);
            control?.addEventListener('change', applyMaterialFilters);
        });

        controls.reset?.addEventListener('click', () => {
            if (controls.search) controls.search.value = '';
            if (controls.type) controls.type.value = 'all';
            if (controls.use) controls.use.value = 'all';
            if (controls.state) controls.state.value = 'all';
            applyMaterialFilters();
        });

        applyMaterialFilters();
    };

    document.addEventListener('DOMContentLoaded', () => {
        initRecipeTools();
        initMaterialTools();
    });
})();
