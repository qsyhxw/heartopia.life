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
