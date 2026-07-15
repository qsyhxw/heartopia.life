(function () {
    function readSaved(key) {
        try {
            const value = JSON.parse(localStorage.getItem(key) || '[]');
            return new Set(Array.isArray(value) ? value : []);
        } catch (error) {
            return new Set();
        }
    }

    function writeSaved(key, values) {
        try {
            localStorage.setItem(key, JSON.stringify(Array.from(values).sort()));
        } catch (error) {
            return;
        }
    }

    function initHub(hub) {
        const list = hub.querySelector('[data-record-list]');
        const search = hub.querySelector('[data-relation-search]');
        const sort = hub.querySelector('[data-relation-sort]');
        const filters = Array.from(hub.querySelectorAll('[data-relation-filter]'));
        const count = hub.querySelector('[data-visible-count]');
        const savedCount = hub.querySelector('[data-saved-count]');
        const empty = hub.querySelector('[data-empty-state]');
        const clear = hub.querySelector('[data-clear-saved]');
        if (!list || !search) return;

        const cards = Array.from(list.querySelectorAll('[data-relation-card]'));
        const storageKey = hub.dataset.storageKey || `heartopia.collection.${hub.dataset.entityType || 'records'}`;
        const saved = readSaved(storageKey);
        const pageParams = new URLSearchParams(window.location.search);
        const uncollectedOnly = pageParams.get('progress') === 'uncollected';

        if (uncollectedOnly) {
            const notice = document.createElement('div');
            notice.className = 'mb-8 flex flex-wrap items-center justify-between gap-3 border border-cozy-sky/40 bg-cozy-sky/10 px-4 py-3 text-sm text-cozy-bark';
            notice.innerHTML = '<span><strong>Uncollected only</strong> is active.</span><button type="button" class="font-bold text-cozy-coral hover:underline">Show all</button>';
            notice.querySelector('button').addEventListener('click', () => {
                const url = new URL(window.location.href);
                url.searchParams.delete('progress');
                window.location.href = url.pathname + url.search + url.hash;
            });
            search.closest('section')?.insertAdjacentElement('afterend', notice);
        }

        function updateSavedUi() {
            cards.forEach(card => {
                const button = card.querySelector('[data-save-record]');
                if (!button) return;
                const active = saved.has(card.dataset.recordKey);
                button.textContent = active ? button.dataset.activeLabel : button.dataset.inactiveLabel;
                button.setAttribute('aria-pressed', String(active));
                button.classList.toggle('border-cozy-sage', active);
                button.classList.toggle('bg-cozy-mint/30', active);
                button.classList.toggle('text-cozy-bark', active);
                button.classList.toggle('border-cozy-peach/70', !active);
                button.classList.toggle('text-cozy-wood', !active);
            });
            if (savedCount) savedCount.textContent = String(cards.filter(card => saved.has(card.dataset.recordKey)).length);
        }

        function numeric(card, key) {
            const value = Number(card.dataset[key]);
            return Number.isFinite(value) ? value : -1;
        }

        function applyFilters() {
            const query = search.value.trim().toLowerCase();
            const visible = cards.filter(card => {
                const searchMatch = !query || (card.dataset.search || '').includes(query);
                const progressMatch = !uncollectedOnly || !saved.has(card.dataset.recordKey);
                const filterMatch = filters.every((filter, index) => {
                    const value = filter.value;
                    return value === 'all' || card.dataset[`filter${index + 1}`] === value;
                });
                const show = searchMatch && progressMatch && filterMatch;
                card.hidden = !show;
                return show;
            });

            const mode = sort?.value || 'name';
            visible.sort((left, right) => {
                const leftValue = numeric(left, 'sortValue');
                const rightValue = numeric(right, 'sortValue');
                if (mode === 'low') return (leftValue < 0 ? Infinity : leftValue) - (rightValue < 0 ? Infinity : rightValue) || left.dataset.name.localeCompare(right.dataset.name);
                if (mode === 'high') return (rightValue < 0 ? -Infinity : rightValue) - (leftValue < 0 ? -Infinity : leftValue) || left.dataset.name.localeCompare(right.dataset.name);
                if (mode === 'relations') return numeric(right, 'relations') - numeric(left, 'relations') || left.dataset.name.localeCompare(right.dataset.name);
                return left.dataset.name.localeCompare(right.dataset.name);
            });
            visible.forEach(card => list.appendChild(card));

            if (count) count.textContent = String(visible.length);
            if (empty) empty.classList.toggle('hidden', visible.length !== 0);
        }

        list.addEventListener('click', event => {
            const button = event.target.closest('[data-save-record]');
            if (!button) return;
            const card = button.closest('[data-relation-card]');
            if (!card) return;
            const key = card.dataset.recordKey;
            saved.has(key) ? saved.delete(key) : saved.add(key);
            writeSaved(storageKey, saved);
            updateSavedUi();
            applyFilters();
        });

        clear?.addEventListener('click', () => {
            saved.clear();
            writeSaved(storageKey, saved);
            updateSavedUi();
            applyFilters();
        });

        search.addEventListener('input', applyFilters);
        filters.forEach(filter => filter.addEventListener('change', applyFilters));
        sort?.addEventListener('change', applyFilters);

        const requestedSearch = pageParams.get('search') || pageParams.get('q');
        if (requestedSearch) search.value = requestedSearch;
        updateSavedUi();
        applyFilters();
    }

    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('[data-relational-hub]').forEach(initHub);
    });
})();
