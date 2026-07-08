(function () {
    const STORAGE_PREFIX = 'heartopia.collection.';

    function normalizeItemName(text) {
        return text
            .replace(/[★☆]/g, '')
            .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
            .replace(/\([^)]*\)/g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase();
    }

    function displayNameFromCell(cell) {
        return cell.textContent
            .replace(/[★☆]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function readSet(key) {
        try {
            const raw = localStorage.getItem(STORAGE_PREFIX + key);
            const values = raw ? JSON.parse(raw) : [];
            return new Set(Array.isArray(values) ? values : []);
        } catch (error) {
            return new Set();
        }
    }

    function writeSet(key, set) {
        localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(Array.from(set).sort()));
    }

    function collectRows(tableSelector) {
        return Array.from(document.querySelectorAll(tableSelector))
            .flatMap(table => Array.from(table.querySelectorAll('tbody tr')))
            .filter(row => row.cells.length > 0);
    }

    function injectCollectionColumn(table, config, savedSet, updateProgress) {
        if (table.dataset.collectionReady === 'true') return;
        table.dataset.collectionReady = 'true';

        const headerRow = table.querySelector('thead tr');
        if (headerRow) {
            const th = document.createElement('th');
            th.className = 'px-4 py-3 font-bold text-center whitespace-nowrap';
            th.textContent = 'Got';
            headerRow.insertBefore(th, headerRow.firstElementChild);
        }

        Array.from(table.querySelectorAll('tbody tr')).forEach(row => {
            const nameCell = row.cells[0];
            if (!nameCell) return;

            const itemId = normalizeItemName(nameCell.textContent);
            if (!itemId) return;
            row.dataset.collectionId = itemId;

            const itemName = displayNameFromCell(nameCell);
            const td = document.createElement('td');
            td.className = 'px-4 py-3 text-center align-middle';

            const label = document.createElement('label');
            label.className = 'inline-flex items-center justify-center cursor-pointer';
            label.title = 'Mark collected: ' + itemName;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'heartopia-collection-checkbox h-5 w-5 rounded border-cozy-peach text-cozy-coral accent-[#ff8a7a]';
            checkbox.dataset.collectionId = itemId;
            checkbox.checked = savedSet.has(itemId);
            checkbox.setAttribute('aria-label', 'Mark collected: ' + itemName);

            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    savedSet.add(itemId);
                } else {
                    savedSet.delete(itemId);
                }
                writeSet(config.key, savedSet);
                syncCheckboxes(itemId, checkbox.checked);
                updateProgress();
            });

            label.appendChild(checkbox);
            td.appendChild(label);
            row.insertBefore(td, row.firstElementChild);
        });
    }

    function syncCheckboxes(itemId, checked) {
        document.querySelectorAll('.heartopia-collection-checkbox').forEach(input => {
            if (input.dataset.collectionId === itemId) {
                input.checked = checked;
            }
        });
    }

    function initCollection(panel) {
        const config = {
            key: panel.dataset.collectionKey || location.pathname,
            itemLabel: panel.dataset.collectionLabel || 'items',
            tableSelector: panel.dataset.tableSelector || 'table'
        };
        const savedSet = readSet(config.key);
        const countEl = panel.querySelector('[data-collection-count]');
        const totalEl = panel.querySelector('[data-collection-total]');
        const percentEl = panel.querySelector('[data-collection-percent]');
        const barEl = panel.querySelector('[data-collection-bar]');
        const clearButton = panel.querySelector('[data-collection-clear]');

        function getUniqueIds() {
            const ids = collectRows(config.tableSelector)
                .map(row => row.dataset.collectionId || (row.cells[0] ? normalizeItemName(row.cells[0].textContent) : ''))
                .filter(Boolean);
            return Array.from(new Set(ids));
        }

        function updateProgress() {
            const ids = getUniqueIds();
            const collected = ids.filter(id => savedSet.has(id)).length;
            const total = ids.length;
            const percent = total ? Math.round((collected / total) * 100) : 0;

            if (countEl) countEl.textContent = String(collected);
            if (totalEl) totalEl.textContent = String(total);
            if (percentEl) percentEl.textContent = String(percent) + '%';
            if (barEl) barEl.style.width = percent + '%';
        }

        document.querySelectorAll(config.tableSelector).forEach(table => {
            injectCollectionColumn(table, config, savedSet, updateProgress);
        });

        if (clearButton) {
            clearButton.addEventListener('click', () => {
                if (!confirm('Clear saved progress for this page?')) return;
                savedSet.clear();
                writeSet(config.key, savedSet);
                panel.ownerDocument.querySelectorAll('.heartopia-collection-checkbox').forEach(input => {
                    input.checked = false;
                });
                updateProgress();
            });
        }

        updateProgress();
    }

    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('[data-collection-progress]').forEach(initCollection);
    });
})();