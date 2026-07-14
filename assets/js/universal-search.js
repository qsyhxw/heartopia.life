(() => {
  const typeLabels = {
    all: 'All',
    fish: 'Fish',
    insects: 'Insects',
    birds: 'Birds',
    recipes: 'Recipes',
    ingredients: 'Ingredients',
    items: 'Items',
    npcs: 'NPCs',
    wildlife: 'Wildlife',
    crops: 'Crops',
    flowers: 'Flowers'
  };

  const typeOrder = ['fish', 'insects', 'birds', 'recipes', 'ingredients', 'items', 'npcs', 'wildlife', 'crops', 'flowers'];
  const maxVisible = 30;
  const elements = {
    input: document.getElementById('universal-search-input'),
    clear: document.getElementById('universal-search-clear'),
    chips: document.getElementById('universal-search-types'),
    status: document.getElementById('universal-search-status'),
    results: document.getElementById('universal-search-results'),
    more: document.getElementById('universal-search-more'),
    total: document.getElementById('universal-search-total'),
    updated: document.getElementById('universal-search-updated')
  };

  const state = {
    entries: [],
    query: '',
    type: 'all',
    limit: maxVisible
  };

  const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[character]));

  function normalize(value) {
    return String(value || '')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function dice(left, right) {
    if (!left || !right) return 0;
    if (left === right) return 1;
    if (left.length < 2 || right.length < 2) return 0;
    const pairs = new Map();
    for (let index = 0; index < left.length - 1; index += 1) {
      const pair = left.slice(index, index + 2);
      pairs.set(pair, (pairs.get(pair) || 0) + 1);
    }
    let matches = 0;
    for (let index = 0; index < right.length - 1; index += 1) {
      const pair = right.slice(index, index + 2);
      const count = pairs.get(pair) || 0;
      if (count) {
        pairs.set(pair, count - 1);
        matches += 1;
      }
    }
    return (2 * matches) / (left.length + right.length - 2);
  }

  function scoreEntry(entry, query) {
    if (!query) return 1;

    const compactQuery = query.replace(/\s/g, '');
    const name = entry.normalized || normalize(entry.name);
    const aliases = (entry.aliases || []).map(normalize);
    const searchText = entry.searchText || normalize([entry.name, entry.meta, ...(entry.aliases || [])].join(' '));
    let score = 0;

    if (name === query) score = 1000;
    else if (aliases.includes(query)) score = 970;
    else if (name.startsWith(query)) score = 900;
    else if (aliases.some((alias) => alias.startsWith(query))) score = 860;
    else if (name.includes(query)) score = 800;
    else if (searchText.includes(query)) score = 680;
    else {
      const terms = query.split(' ').filter(Boolean);
      const matchedTerms = terms.filter((term) => searchText.includes(term)).length;
      if (matchedTerms === terms.length) score = 520 + matchedTerms * 20;
      else if (matchedTerms) score = 180 + matchedTerms * 35;
    }

    const namesToCompare = [name, ...aliases].map((value) => value.replace(/\s/g, ''));
    const fuzzy = Math.max(...namesToCompare.map((value) => dice(value, compactQuery)));
    if (fuzzy >= 0.48) score = Math.max(score, Math.round(fuzzy * 620));

    return score;
  }

  function matchingEntries() {
    const query = normalize(state.query);
    return state.entries
      .filter((entry) => state.type === 'all' || entry.typeKey === state.type)
      .map((entry) => ({ entry, score: scoreEntry(entry, query) }))
      .filter(({ score }) => !query || score >= 260)
      .sort((left, right) => {
        if (right.score !== left.score) return right.score - left.score;
        const typeDifference = typeOrder.indexOf(left.entry.typeKey) - typeOrder.indexOf(right.entry.typeKey);
        return typeDifference || left.entry.name.localeCompare(right.entry.name);
      });
  }

  function resultCard(entry) {
    const image = entry.image || '/favicon-96x96.png';
    const databaseLabel = typeLabels[entry.typeKey] || entry.type;
    return `<article class="search-result-card bg-white border border-cozy-peach/50 rounded-xl p-3 sm:p-4 flex gap-3 sm:gap-4">
      <img src="${escapeHtml(image)}" alt="${escapeHtml(entry.name)} ${escapeHtml(entry.type)} image" class="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg bg-cozy-cream object-contain p-1" loading="lazy" onerror="this.src='/favicon-96x96.png'">
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-2">
          <span class="search-type search-type-${escapeHtml(entry.typeKey)}">${escapeHtml(entry.type)}</span>
          <p class="text-xs text-cozy-wood truncate">${escapeHtml(entry.meta || 'See database details')}</p>
        </div>
        <h2 class="font-display text-lg font-bold text-cozy-bark mt-2 leading-tight"><a href="${escapeHtml(entry.href)}" class="hover:text-cozy-coral hover:underline">${escapeHtml(entry.name)}</a></h2>
        <div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold">
          <a href="${escapeHtml(entry.href)}" class="text-cozy-coral hover:underline">Open entry</a>
          <a href="${escapeHtml(entry.listingHref)}" class="text-cozy-sage hover:underline">Open ${escapeHtml(databaseLabel)} database</a>
        </div>
      </div>
    </article>`;
  }

  function emptyState() {
    const label = state.type === 'all' ? 'the database' : typeLabels[state.type];
    return `<div class="bg-white border border-dashed border-cozy-peach rounded-xl p-7 text-center">
      <h2 class="font-display text-2xl font-bold">No matching ${escapeHtml(label)} entries</h2>
      <p class="text-cozy-wood mt-2">Try a shorter name, another spelling, or clear the current category.</p>
      <button type="button" data-clear-search class="mt-4 text-sm font-bold text-cozy-coral hover:underline">Clear search</button>
    </div>`;
  }

  function browseState(total) {
    const label = state.type === 'all' ? 'all categories' : typeLabels[state.type];
    return `<div class="bg-white border border-cozy-peach/50 rounded-xl p-6 text-center">
      <h2 class="font-display text-2xl font-bold">Browse ${escapeHtml(label)}</h2>
      <p class="text-cozy-wood mt-2">Type a name, place, role, or item to search ${total.toLocaleString('en-US')} current entries.</p>
    </div>`;
  }

  function updateUrl() {
    const params = new URLSearchParams();
    if (state.query) params.set('q', state.query);
    if (state.type !== 'all') params.set('type', state.type);
    const query = params.toString();
    window.history.replaceState({}, '', `${window.location.pathname}${query ? `?${query}` : ''}`);
  }

  function render() {
    const matches = matchingEntries();
    const hasQuery = Boolean(normalize(state.query));
    const visible = matches.slice(0, state.limit);
    const totalText = `${matches.length.toLocaleString('en-US')} result${matches.length === 1 ? '' : 's'}`;

    elements.clear.classList.toggle('hidden', !state.query);
    elements.chips.querySelectorAll('[data-search-type]').forEach((button) => {
      const active = button.dataset.searchType === state.type;
      button.classList.toggle('bg-cozy-coral', active);
      button.classList.toggle('text-white', active);
      button.classList.toggle('border-cozy-coral', active);
      button.classList.toggle('bg-white', !active);
      button.setAttribute('aria-pressed', String(active));
    });

    if (!hasQuery) {
      const scopeTotal = state.type === 'all' ? state.entries.length : state.entries.filter((entry) => entry.typeKey === state.type).length;
      elements.status.textContent = `${scopeTotal.toLocaleString('en-US')} entries ready to search`;
      elements.results.innerHTML = browseState(scopeTotal);
      elements.more.classList.add('hidden');
    } else if (!matches.length) {
      elements.status.textContent = 'No matches found';
      elements.results.innerHTML = emptyState();
      elements.more.classList.add('hidden');
    } else {
      elements.status.textContent = totalText;
      elements.results.innerHTML = visible.map(({ entry }) => resultCard(entry)).join('');
      elements.more.classList.toggle('hidden', visible.length >= matches.length);
      elements.more.textContent = `Show more results (${matches.length - visible.length})`;
    }

    elements.results.querySelector('[data-clear-search]')?.addEventListener('click', clearSearch);
    updateUrl();
  }

  function clearSearch() {
    state.query = '';
    state.limit = maxVisible;
    elements.input.value = '';
    elements.input.focus();
    render();
  }

  function bindEvents() {
    elements.input.addEventListener('input', () => {
      state.query = elements.input.value.trim();
      state.limit = maxVisible;
      render();
    });

    elements.clear.addEventListener('click', clearSearch);

    elements.chips.addEventListener('click', (event) => {
      const button = event.target.closest('[data-search-type]');
      if (!button) return;
      state.type = button.dataset.searchType;
      state.limit = maxVisible;
      render();
    });

    elements.more.addEventListener('click', () => {
      state.limit += maxVisible;
      render();
    });
  }

  async function init() {
    const params = new URLSearchParams(window.location.search);
    state.query = params.get('q')?.trim() || '';
    state.type = typeLabels[params.get('type')] ? params.get('type') : 'all';
    elements.input.value = state.query;

    try {
      const response = await fetch('/data/heartopia-search-index.json', { cache: 'no-store' });
      if (!response.ok) throw new Error(`Search index request failed: ${response.status}`);
      const index = await response.json();
      state.entries = Array.isArray(index.entries) ? index.entries : [];
      elements.total.textContent = index.count?.toLocaleString('en-US') || state.entries.length.toLocaleString('en-US');
      elements.updated.textContent = index.generatedAt || '';
      bindEvents();
      render();
      elements.input.focus();
    } catch (error) {
      elements.status.textContent = 'Search is temporarily unavailable';
      elements.results.innerHTML = `<div class="bg-white border border-cozy-peach rounded-xl p-6 text-center"><h2 class="font-display text-2xl font-bold">Open a database category</h2><p class="text-cozy-wood mt-2">Use a category below while the search list loads again.</p><div class="mt-4 flex flex-wrap justify-center gap-3"><a class="font-bold text-cozy-coral hover:underline" href="/database/fish/">Fish</a><a class="font-bold text-cozy-coral hover:underline" href="/database/insects/">Insects</a><a class="font-bold text-cozy-coral hover:underline" href="/database/birds/">Birds</a><a class="font-bold text-cozy-coral hover:underline" href="/database/flowers/">Flowers</a><a class="font-bold text-cozy-coral hover:underline" href="/database/recipes/">Recipes</a><a class="font-bold text-cozy-coral hover:underline" href="/npcs/">NPCs</a></div></div>`;
    }
  }

  init();
})();
