(() => {
  const query = new URLSearchParams(window.location.search).get('search')?.trim();
  if (!query) return;

  function applyQuery() {
    const input = document.querySelector('input[type="search"]');
    if (!input) return;

    input.value = query;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));

    const panel = input.closest('section') || input;
    panel.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  window.setTimeout(applyQuery, 0);
})();

(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('progress') !== 'uncollected') return;

  const path = window.location.pathname.replace(/\/+/g, '/');
  const cardConfigs = {
    '/database/collectibles/': { storageKey: 'heartopia.collection.collectibles', button: '.mark', list: '#list', counter: '#visible-count' },
    '/database/items/': { storageKey: 'heartopia.collection.items', button: '.owned', list: '#item-list', counter: '#shown' },
    '/database/ingredients/': { storageKey: 'heartopia.collection.ingredients', button: '.stock', list: '#ingredient-list', counter: '#shown-count' },
    '/npcs/': { storageKey: 'heartopia.collection.npcs', button: '.met', list: '#npc-list', counter: '#shown' }
  };

  function readSet(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || '[]');
      return new Set(Array.isArray(value) ? value.map((item) => String(item).toLowerCase()) : []);
    } catch (error) {
      return new Set();
    }
  }

  function clearProgressFilter() {
    const url = new URL(window.location.href);
    url.searchParams.delete('progress');
    window.location.href = url.pathname + url.search + url.hash;
  }

  function addNotice(anchor) {
    if (document.getElementById('progress-deep-link-notice')) return;
    const notice = document.createElement('div');
    notice.id = 'progress-deep-link-notice';
    notice.className = 'mx-auto mb-6 flex max-w-6xl flex-wrap items-center justify-between gap-3 rounded-xl border border-cozy-sky/40 bg-cozy-sky/10 px-4 py-3 text-sm text-cozy-bark';
    notice.innerHTML = '<span><strong>Uncollected only</strong> is active.</span><button type="button" class="font-bold text-cozy-coral hover:underline">Show all</button>';
    notice.querySelector('button').addEventListener('click', clearProgressFilter);
    if (anchor?.parentNode) anchor.parentNode.insertBefore(notice, anchor.nextSibling);
  }

  function applyControl(selector, value, checked) {
    const control = document.querySelector(selector);
    if (!control) return false;
    if (typeof checked === 'boolean') control.checked = checked;
    else control.value = value;
    control.dispatchEvent(new Event('input', { bubbles: true }));
    control.dispatchEvent(new Event('change', { bubbles: true }));
    addNotice(control.closest('section'));
    control.closest('section')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    return true;
  }

  function applyCardFilter(config) {
    const list = document.querySelector(config.list);
    if (!list) return;
    const refresh = function () {
      const saved = readSet(config.storageKey);
      let visible = 0;
      list.querySelectorAll(config.button).forEach((button) => {
        const card = button.closest('article');
        if (!card) return;
        const missing = !saved.has(String(button.dataset.name || '').toLowerCase());
        card.hidden = !missing;
        if (missing) visible += 1;
      });
      const counter = document.querySelector(config.counter);
      if (counter) counter.textContent = String(visible);
    };
    refresh();
    new MutationObserver(refresh).observe(list, { childList: true });
    addNotice(document.querySelector('input[type="search"]')?.closest('section'));
  }

  window.setTimeout(() => {
    if (path === '/database/flowers/') {
      applyControl('#flower-missing', '', true);
      return;
    }
    if (path === '/database/recipes/') {
      applyControl('#recipe-state', 'unlearned');
      return;
    }
    if (path === '/guides/achievements/') {
      applyControl('#state, #achievement-state', 'unearned');
      return;
    }
    const cardConfig = cardConfigs[path];
    if (cardConfig) applyCardFilter(cardConfig);
  }, 0);
})();
