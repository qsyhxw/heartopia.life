(function () {
    const MAP_STATE_KEY = 'heartopia.map.filterState';
    const MAP_PATH = '/guides/map/';
    const tableConfigs = {
        fish: { selector: 'table.fish-table', nameHeaders: ['fish'], locationHeaders: ['location'] },
        bird: { selector: 'table.bird-table', nameHeaders: ['bird'], locationHeaders: ['location'] },
        wildlife: { selector: 'table.wildlife-table', nameHeaders: ['wildlife'], locationHeaders: ['location'] },
        material: { selector: 'table[data-material-table]', nameHeaders: ['material'], locationHeaders: ['best route', 'route', 'location'] }
    };

    function normalize(value) {
        return String(value || '').replace(/\s+/g, ' ').trim().toLowerCase();
    }

    function pageType() {
        const match = window.location.pathname.match(/^\/database\/(fish|birds|wildlife|materials)(?:\/|$)/i);
        if (!match) return '';
        const type = match[1].toLowerCase();
        return type === 'birds' ? 'bird' : type === 'materials' ? 'material' : type;
    }

    function isDetailPage() {
        return /^\/database\/(fish|birds|wildlife|materials)\/[^/]+\/?$/i.test(window.location.pathname);
    }

    function readMapState() {
        try {
            const raw = localStorage.getItem(MAP_STATE_KEY);
            const state = raw ? JSON.parse(raw) : null;
            return state && typeof state === 'object' ? state : null;
        } catch (error) {
            return null;
        }
    }

    function resolveMapTarget(type, name, location) {
        const source = `${name} ${location}`.toLowerCase();

        if (type === 'wildlife') {
            return { type: 'wildlife', focus: name };
        }

        if (type === 'material') {
            if (/roaming oak|rare timber|timber|\bwood\b/.test(source)) return { type: 'resource', focus: 'Roaming Oak' };
            if (/fluorite|crater lake/.test(source)) return { type: 'resource', focus: 'Fluorite Mine' };
            if (/shiitake/.test(source)) return { type: 'resource', focus: 'Shiitake Mushrooms' };
            if (/oyster mushroom/.test(source)) return { type: 'resource', focus: 'Oyster Mushrooms' };
            if (/truffle/.test(source)) return { type: 'resource', focus: 'Black Truffle' };
            if (/bamboo/.test(source)) return { type: 'resource', focus: 'Bamboo' };
            if (/poppy|flower/.test(source)) return { type: 'resource', focus: 'Flower Field Materials' };
            return { type: 'resource', focus: '' };
        }

        if (type === 'fish') {
            if (/river/.test(source)) return { type: 'fish', focus: 'Any River' };
            if (/forest lake/.test(source)) return { type: 'fish', focus: 'Forest Lake Fishing' };
            if (/onsen|crater lake/.test(source)) return { type: 'fish', focus: 'Onsen Lake Fishing' };
            if (/meadow lake|flower field/.test(source)) return { type: 'fish', focus: 'Meadow Lake' };
            if (/fishing village|lighthouse|wharf|coast/.test(source)) return { type: 'fish', focus: 'Fishing Village Coast' };
            if (/sea|ocean|zephyr|whale|old sea|east sea/.test(source)) return { type: 'fish', focus: 'Whale Sea' };
            return { type: 'fish', focus: '' };
        }

        if (type === 'bird') {
            if (/nest of hundreds|\[event\]|event/.test(source)) return { type: 'bird', focus: 'Nest of Hundreds Birds' };
            if (/lighthouse|fishing village/.test(source)) return { type: 'bird', focus: 'Fishing Village Lighthouse Birds' };
            if (/onsen|crater lake/.test(source)) return { type: 'bird', focus: 'Onsen Mountain Birds' };
            if (/flower field|meadow lake/.test(source)) return { type: 'bird', focus: 'Flower Field Birds' };
            if (/forest/.test(source)) return { type: 'bird', focus: 'Forest Bird Route' };
            if (/beach|coast|sea/.test(source)) return { type: 'bird', focus: 'Seaside Bird Route' };
            if (/suburb/.test(source)) return { type: 'bird', focus: 'Suburbs Bird Route' };
            if (/central|town/.test(source)) return { type: 'bird', focus: 'Central Area Birds' };
            return { type: 'bird', focus: '' };
        }

        return { type: '', focus: '' };
    }

    function buildMapUrl(target, entity, sourceLocation, preservedState) {
        const url = new URL(MAP_PATH, window.location.origin);
        const state = preservedState || null;
        if (state) {
            if (state.search) url.searchParams.set('search', state.search);
            if (state.type && state.type !== 'all') url.searchParams.set('type', state.type);
            if (state.area && state.area !== 'all') url.searchParams.set('area', state.area);
            if (state.hideVisited) url.searchParams.set('progress', 'uncollected');
            if (state.focus) url.searchParams.set('focus', state.focus);
            if (state.entity) url.searchParams.set('entity', state.entity);
        } else {
            url.searchParams.set('view', 'entity');
            if (target.type) url.searchParams.set('type', target.type);
            if (target.focus) url.searchParams.set('focus', target.focus);
            if (entity) url.searchParams.set('entity', entity);
            if (sourceLocation) url.searchParams.set('source', sourceLocation);
        }
        url.hash = 'location-tool';
        return url.pathname + url.search + url.hash;
    }

    function addStyles() {
        if (document.getElementById('heartopia-map-entity-link-styles')) return;
        const style = document.createElement('style');
        style.id = 'heartopia-map-entity-link-styles';
        style.textContent = `
            .heartopia-map-table-cell { min-width: 48px; text-align: center; white-space: nowrap; }
            .heartopia-map-table-link { display: inline-flex; width: 32px; height: 32px; align-items: center; justify-content: center; border: 1px solid rgba(255,155,133,.55); border-radius: 6px; color: #d86f5b; background: #fff; transition: border-color .15s ease, background-color .15s ease, color .15s ease; }
            .heartopia-map-table-link:hover, .heartopia-map-table-link:focus-visible { border-color: #ff9b85; color: #5d4e37; background: #fff8f0; outline: none; }
            .heartopia-map-detail-link { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 14px; margin: 0 0 28px; padding: 14px 0; border-bottom: 1px solid rgba(255,229,217,.9); }
            .heartopia-map-detail-link p { margin: 0; color: #8b7355; font-size: .875rem; }
            .heartopia-map-detail-link strong { display: block; color: #5d4e37; margin-bottom: 2px; }
            .heartopia-map-detail-link a { display: inline-flex; align-items: center; gap: 8px; border-radius: 6px; background: #ff9b85; color: #fff; padding: 9px 13px; font-size: .875rem; font-weight: 700; text-decoration: none; }
            .heartopia-map-detail-link a:hover, .heartopia-map-detail-link a:focus-visible { background: #5d4e37; outline: none; }
            .heartopia-map-icon { width: 16px; height: 16px; flex: 0 0 auto; }
        `;
        document.head.appendChild(style);
    }

    function mapIcon() {
        return '<svg class="heartopia-map-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18-6-3V5l6 3 6-3 6 3v10l-6-3z"></path><path d="M9 8v10"></path><path d="M15 5v10"></path></svg>';
    }

    function headerIndex(table, labels) {
        const headers = Array.from(table.querySelectorAll('thead th'));
        return headers.findIndex(header => {
            const value = normalize(header.textContent);
            return labels.some(label => value === label || value.startsWith(`${label} `));
        });
    }

    function addTableLinks(type) {
        const config = tableConfigs[type];
        if (!config) return;

        document.querySelectorAll(config.selector).forEach(table => {
            const headRow = table.querySelector('thead tr');
            const nameIndex = headerIndex(table, config.nameHeaders);
            const locationIndex = headerIndex(table, config.locationHeaders);
            if (!headRow || nameIndex === -1 || locationIndex === -1) return;

            if (!headRow.querySelector('[data-map-column-heading]')) {
                const heading = document.createElement('th');
                heading.className = 'heartopia-map-table-cell';
                heading.dataset.mapColumnHeading = 'true';
                heading.textContent = 'Map';
                heading.title = 'Open a related map route';
                headRow.insertBefore(heading, headRow.children[locationIndex + 1] || null);
            }

            table.querySelectorAll('tbody tr').forEach(row => {
                if (row.dataset.mapLinkReady === 'true') return;
                const cells = Array.from(row.children);
                const entity = cells[nameIndex]?.textContent.replace(/\s+/g, ' ').trim() || '';
                const sourceLocation = cells[locationIndex]?.textContent.replace(/\s+/g, ' ').trim() || row.dataset.birdLocation || row.dataset.location || '';
                if (!entity) return;

                const target = resolveMapTarget(type, entity, sourceLocation);
                const cell = document.createElement('td');
                cell.className = 'heartopia-map-table-cell';
                const link = document.createElement('a');
                link.className = 'heartopia-map-table-link';
                link.href = buildMapUrl(target, entity, sourceLocation);
                link.title = `View ${entity} on map`;
                link.setAttribute('aria-label', `View ${entity} on map`);
                link.innerHTML = `${mapIcon()}<span class="sr-only">View on map</span>`;
                cell.appendChild(link);
                row.insertBefore(cell, row.children[locationIndex + 1] || null);
                row.dataset.mapLinkReady = 'true';
            });
        });
    }

    function detailName() {
        const heading = document.querySelector('h1')?.textContent.replace(/\s+/g, ' ').trim() || '';
        return heading
            .replace(/^Heartopia\s+/i, '')
            .replace(/\s+(Location|Locations|Guide|Database|Wildlife)(?:(?:\s*[:&].*)|$)/i, '')
            .trim();
    }

    function detailLocation() {
        const direct = document.querySelector('[data-map-location]')?.getAttribute('data-map-location');
        if (direct) return direct.trim();

        for (const row of document.querySelectorAll('tr')) {
            const cells = Array.from(row.children);
            if (cells.length < 2) continue;
            const label = normalize(cells[0].textContent);
            if (label === 'location' || label === 'best route' || label === 'route') {
                return cells[1].textContent.replace(/\s+/g, ' ').trim();
            }
        }

        const labelNodes = document.querySelectorAll('strong, b, span, dt');
        for (const node of labelNodes) {
            const label = normalize(node.textContent);
            if (label !== 'location' && label !== 'best route' && label !== 'route') continue;
            const parentText = node.parentElement?.textContent.replace(/\s+/g, ' ').trim() || '';
            const value = parentText.replace(new RegExp(`^${node.textContent.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'i'), '').trim();
            if (value) return value;
        }
        return '';
    }

    function addDetailLink(type) {
        if (!isDetailPage() || document.querySelector('[data-map-detail-link]')) return;
        const entity = detailName();
        if (!entity) return;

        const sourceLocation = detailLocation();
        const target = resolveMapTarget(type, entity, sourceLocation);
        const params = new URLSearchParams(window.location.search);
        const returnRequested = params.get('map-return') === '1';
        const href = buildMapUrl(target, entity, sourceLocation, returnRequested ? readMapState() : null);
        const hero = document.querySelector('main > section') || document.querySelector('main section');
        if (!hero) return;

        const wrapper = document.createElement('section');
        wrapper.className = 'heartopia-map-detail-link';
        wrapper.dataset.mapDetailLink = 'true';
        wrapper.innerHTML = `<div><strong>Map route</strong><p>${returnRequested ? 'Your previous map filters are ready to restore.' : 'Open the matching route, then keep the database conditions beside the map.'}</p></div><a href="${href}">${mapIcon()}<span>View on map</span></a>`;
        hero.insertAdjacentElement('afterend', wrapper);

        if (returnRequested && window.history?.replaceState) {
            params.delete('map-return');
            const query = params.toString();
            window.history.replaceState({}, '', window.location.pathname + (query ? `?${query}` : '') + window.location.hash);
        }
    }

    function init() {
        const type = pageType();
        if (!type) return;
        addStyles();
        if (isDetailPage()) {
            addDetailLink(type);
        } else {
            addTableLinks(type);
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        init();
        window.setTimeout(init, 100);
    });
})();
