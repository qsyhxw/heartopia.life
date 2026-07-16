import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const readJson = (file) => JSON.parse(read(file));
const writeIfChanged = (file, value) => {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  if (fs.existsSync(target) && fs.readFileSync(target, 'utf8') === value) return false;
  fs.writeFileSync(target, value);
  return true;
};
const today = process.env.CHANGELOG_DATE || new Date().toISOString().slice(0, 10);
const now = process.env.CHANGELOG_TIMESTAMP || new Date().toISOString();
const baseRef = process.env.CHANGELOG_BASE_REF || 'HEAD';
const dryRun = process.env.CHANGELOG_DRY_RUN === '1';
const esc = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const specs = [
  { id: 'fish', label: 'Fish', singular: 'Fish', file: 'data/heartopia-fish.json', dataPath: ['fish'], key: 'name', url: '/database/fish/', media: 'image' },
  { id: 'birds', label: 'Birds', singular: 'Bird', file: 'data/heartopia-birds.json', dataPath: ['birds'], key: 'name', url: '/database/birds/', media: 'img' },
  { id: 'insects', label: 'Insects', singular: 'Insect', file: 'data/heartopia-insects.json', dataPath: ['insects'], key: 'slug', url: '/database/insects/', media: 'image' },
  { id: 'wildlife', label: 'Wildlife', singular: 'Wildlife entry', file: 'data/heartopia-wildlife.json', dataPath: ['wildlife'], key: 'id', url: '/database/wildlife/', media: 'image' },
  { id: 'crops', label: 'Crops', singular: 'Crop', file: 'data/heartopia-crops.json', dataPath: ['crops'], key: 'id', url: '/database/crops/', media: 'image' },
  { id: 'flowers', label: 'Flowers', singular: 'Flower', file: 'data/heartopia-flowers.json', dataPath: ['flowers'], key: 'id', url: '/database/flowers/', media: 'image' },
  { id: 'recipes', label: 'Recipes', singular: 'Recipe', file: 'data/heartopia-recipes.json', dataPath: ['recipes'], key: 'slug', url: '/database/recipes/', media: 'image' },
  { id: 'achievements', label: 'Achievements', singular: 'Achievement', file: 'data/heartopia-achievements.json', dataPath: ['achievements'], key: 'slug', url: '/guides/achievements/', media: 'image', ignore: ['version'] },
  { id: 'items', label: 'Items', singular: 'Item', file: 'data/heartopia-items.json', dataPath: ['items'], key: 'sourceSlug', url: '/database/items/', media: 'image' },
  { id: 'ingredients', label: 'Ingredients', singular: 'Ingredient', file: 'data/heartopia-ingredients.json', dataPath: ['ingredients'], key: 'sourceSlug', url: '/database/ingredients/', media: 'image' },
  { id: 'collectibles', label: 'Collectibles', singular: 'Collectible', file: 'data/heartopia-collectibles.json', dataPath: ['collectibles'], key: 'sourceSlug', url: '/database/collectibles/', media: 'image' },
  { id: 'npcs', label: 'NPCs', singular: 'NPC', file: 'data/heartopia-npcs.json', dataPath: ['npcs'], key: 'sourceSlug', url: '/npcs/', media: 'image' },
  { id: 'events', label: 'Events', singular: 'Event', file: 'data/heartopia-events.json', dataPath: ['events'], key: 'slug', url: '/events/', statusField: 'status' }
];

function getAt(value, keys) {
  return keys.reduce((current, key) => current?.[key], value);
}

function fromHead(file) {
  try {
    return JSON.parse(execFileSync('git', ['show', `${baseRef}:${file}`], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }));
  } catch (error) {
    if (error.status === 128) return null;
    throw new Error(`Could not read comparison baseline ${baseRef}:${file}: ${error.message}`);
  }
}

function normalizedKey(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function displayName(record, fallback) {
  return String(record?.name || record?.title || fallback || 'Unknown entry').trim();
}

function cleanValue(value, ignored) {
  if (Array.isArray(value)) return value.map((item) => cleanValue(item, ignored));
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort()
    .filter((key) => !ignored.has(key))
    .map((key) => [key, cleanValue(value[key], ignored)]));
}

function contentValue(spec, record) {
  const ignored = new Set([
    spec.key,
    spec.media,
    spec.statusField,
    'imageUrl',
    'imageSourceName',
    'sourceUrl',
    ...(spec.ignore || [])
  ].filter(Boolean));
  return JSON.stringify(cleanValue(record, ignored));
}

function changeRecord(spec, action, items) {
  if (!items.length) return null;
  return {
    category: spec.label,
    singular: spec.singular,
    categoryId: spec.id,
    action,
    count: items.length,
    items: items.slice(0, 20),
    truncated: items.length > 20,
    url: spec.url
  };
}

function compareSpec(spec) {
  const currentRoot = readJson(spec.file);
  const priorRoot = fromHead(spec.file);
  const current = getAt(currentRoot, spec.dataPath);
  if (!Array.isArray(current)) throw new Error(`Missing ${spec.dataPath.join('.')} in ${spec.file}`);
  if (!priorRoot) return { changes: [], total: current.length };
  const prior = getAt(priorRoot, spec.dataPath);
  if (!Array.isArray(prior)) return { changes: [], total: current.length };

  const mapEntries = (items) => new Map(items.map((record) => {
    const rawKey = record?.[spec.key] || record?.name;
    return [normalizedKey(rawKey), record];
  }).filter(([key]) => key));
  const before = mapEntries(prior);
  const after = mapEntries(current);
  const added = [];
  const removed = [];
  const updated = [];
  const media = [];
  const status = [];

  for (const [key, record] of after) {
    if (!before.has(key)) {
      added.push(displayName(record, key));
      continue;
    }
    const oldRecord = before.get(key);
    const contentChanged = contentValue(spec, oldRecord) !== contentValue(spec, record);
    if (contentChanged) updated.push(displayName(record, key));
    if (!contentChanged && spec.media && String(oldRecord?.[spec.media] || '') !== String(record?.[spec.media] || '')) {
      media.push(displayName(record, key));
    }
    if (spec.statusField && String(oldRecord?.[spec.statusField] || '') !== String(record?.[spec.statusField] || '')) {
      status.push(`${displayName(record, key)}: ${oldRecord?.[spec.statusField] || 'unknown'} to ${record?.[spec.statusField] || 'unknown'}`);
    }
  }
  for (const [key, record] of before) {
    if (!after.has(key)) removed.push(displayName(record, key));
  }

  return {
    total: current.length,
    changes: [
      changeRecord(spec, 'added', added),
      changeRecord(spec, 'updated', updated),
      changeRecord(spec, 'status', status),
      changeRecord(spec, 'media', media),
      changeRecord(spec, 'removed', removed)
    ].filter(Boolean)
  };
}

function changeText(change) {
  if (change.action === 'system') return `${change.count} databases monitored`;
  const entityLabel = change.count === 1 ? change.singular : change.category;
  if (change.action === 'added') return `+${change.count} ${change.label || entityLabel}`;
  if (change.action === 'updated') return `${change.count} ${entityLabel} updated`;
  if (change.action === 'status') return change.count === 1
    ? `1 ${change.singular} status changed`
    : `${change.count} ${change.category} changed status`;
  if (change.action === 'media') return `${change.count} ${change.singular} image${change.count === 1 ? '' : 's'} refreshed`;
  return `${change.count} ${entityLabel} removed`;
}

function summaryFor(changes) {
  const parts = changes.slice(0, 3).map(changeText);
  if (changes.length > 3) parts.push(`+${changes.length - 3} more`);
  return parts.join(' · ');
}

function formatDate(value, style = 'long') {
  const [year, month, day] = value.split('-').map(Number);
  return new Intl.DateTimeFormat('en-US', style === 'short'
    ? { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }
    : { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(Date.UTC(year, month - 1, day)));
}

function entryTitle(changes) {
  const first = changes[0];
  if (!first) return 'Database records updated';
  if (first.action === 'added') return `New ${first.category} added`;
  if (first.action === 'status') return 'Event availability changed';
  if (first.action === 'media') return `${first.category} images refreshed`;
  return 'Database records updated';
}

const comparisons = specs.map((spec) => [spec, compareSpec(spec)]);
const changes = comparisons.flatMap(([, result]) => result.changes);
const totals = Object.fromEntries(comparisons.map(([spec, result]) => [spec.id, result.total]));
if (dryRun) {
  console.log(JSON.stringify({ baseRef, summary: changes.length ? summaryFor(changes) : 'No entity differences', changes, totals }, null, 2));
  process.exit(0);
}
const stateFile = 'data/database-changelog.json';
const state = fs.existsSync(path.join(root, stateFile)) ? readJson(stateFile) : {
  schemaVersion: 1,
  updatedAt: today,
  trackedCategories: specs.map(({ id, label, url }) => ({ id, label, url })),
  totals,
  entries: []
};

if (!state.entries.length && !changes.length) {
  state.entries.push({
    id: `${today}-tracking-launched`,
    timestamp: `${today}T00:00:00.000Z`,
    date: today,
    title: 'Automatic database change tracking is live',
    summary: `${specs.length} databases now publish real content changes`,
    signature: 'tracking-launch-v1',
    changes: [{
      category: 'Database',
      singular: 'Database',
      categoryId: 'database',
      action: 'system',
      count: specs.length,
      label: 'databases monitored',
      items: specs.map((spec) => spec.label),
      truncated: false,
      url: '/database/'
    }]
  });
}

if (changes.length) {
  const signature = crypto.createHash('sha256').update(JSON.stringify(changes)).digest('hex').slice(0, 16);
  if (!state.entries.some((entry) => entry.signature === signature)) {
    state.entries.unshift({
      id: `${today}-${signature}`,
      timestamp: now,
      date: today,
      title: entryTitle(changes),
      summary: summaryFor(changes),
      signature,
      changes
    });
  }
}

state.updatedAt = state.entries[0].date;
state.totals = totals;
state.trackedCategories = specs.map(({ id, label, url }) => ({ id, label, url }));
state.entries = state.entries.slice(0, 60);
writeIfChanged(stateFile, JSON.stringify(state, null, 2) + '\n');

function actionClass(action) {
  return action === 'added' ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
    : action === 'status' ? 'border-sky-200 bg-sky-50 text-sky-800'
      : action === 'removed' ? 'border-red-200 bg-red-50 text-red-800'
        : action === 'media' ? 'border-violet-200 bg-violet-50 text-violet-800'
          : action === 'system' ? 'border-cozy-sage/50 bg-cozy-mint/30 text-cozy-bark'
            : 'border-amber-200 bg-amber-50 text-amber-800';
}

function changeChip(change) {
  return `<a href="${change.url}" class="inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-bold ${actionClass(change.action)}">${esc(changeText(change))}</a>`;
}

function itemDetails(change) {
  if (!change.items?.length) return '';
  const label = change.action === 'status' ? 'Status details' : change.action === 'system' ? 'Tracked sections' : 'Affected entries';
  return `<details class="border-t border-cozy-peach/50 pt-3"><summary class="cursor-pointer text-sm font-bold text-cozy-coral">${label}</summary><p class="mt-2 text-sm leading-6 text-cozy-wood">${change.items.map(esc).join(' · ')}${change.truncated ? ' · More entries in this update' : ''}</p></details>`;
}

function renderPage(data) {
  const latest = data.entries[0];
  const schema = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'CollectionPage', name: 'Heartopia Database Changelog', description: 'Dated Heartopia database additions, record corrections, image refreshes, and event status changes.', url: 'https://heartopia.life/database/changelog/', dateModified: latest.date },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://heartopia.life/' },
        { '@type': 'ListItem', position: 2, name: 'Database', item: 'https://heartopia.life/database/' },
        { '@type': 'ListItem', position: 3, name: 'Changelog', item: 'https://heartopia.life/database/changelog/' }
      ] }
    ]
  });
  const entries = data.entries.map((entry, index) => `<article class="border-b border-cozy-peach/70 py-7 last:border-0">
    <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between"><div><time datetime="${entry.date}" class="text-xs font-bold uppercase text-cozy-sage">${esc(formatDate(entry.date))}</time><h2 class="mt-2 font-display text-2xl font-bold">${esc(entry.title)}</h2><p class="mt-2 text-cozy-wood">${esc(entry.summary)}</p></div>${index === 0 ? '<span class="w-fit rounded-full bg-cozy-coral px-3 py-1 text-xs font-bold text-white">Latest</span>' : ''}</div>
    <div class="mt-4 flex flex-wrap gap-2">${entry.changes.map(changeChip).join('')}</div>
    <div class="mt-4 space-y-3">${entry.changes.map(itemDetails).join('')}</div>
  </article>`).join('');
  const secondAd = data.entries.length > 3 ? '<div id="heartopia_in_content_2" class="my-8 text-center"></div>' : '';
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><script async src="https://www.googletagmanager.com/gtag/js?id=G-FRJ91G3VRR"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-FRJ91G3VRR');</script><script data-cfasync="false">window.nitroAds=window.nitroAds||{createAd:function(){return new Promise(e=>{window.nitroAds.queue.push(['createAd',arguments,e])})},addUserToken:function(){window.nitroAds.queue.push(['addUserToken',arguments])},queue:[]};</script><script data-cfasync="false" async src="https://s.nitropay.com/ads-2368.js"></script><title>Heartopia Database Changelog: Latest Data Updates</title><meta name="description" content="See dated Heartopia database additions, corrected records, refreshed images, and event status changes generated from real data differences."><meta name="robots" content="index,follow"><link rel="canonical" href="https://heartopia.life/database/changelog/"><meta property="og:type" content="website"><meta property="og:title" content="Heartopia Database Changelog"><meta property="og:description" content="Recent additions and corrections across the Heartopia.Life database."><meta property="og:url" content="https://heartopia.life/database/changelog/"><meta property="og:image" content="https://heartopia.life/img/home/my-progress.webp"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="Heartopia Database Changelog"><meta name="twitter:description" content="Recent additions and corrections across the Heartopia.Life database."><meta name="twitter:image" content="https://heartopia.life/img/home/my-progress.webp"><link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"><link rel="manifest" href="/site.webmanifest"><script src="https://cdn.tailwindcss.com"></script><script>tailwind.config={theme:{extend:{colors:{cozy:{cream:'#FFF8F0',peach:'#FFE5D9',coral:'#FF9B85',rose:'#D4A5A5',sage:'#A8C686',mint:'#B8E0D2',sky:'#95C8D8',wood:'#8B7355',bark:'#5D4E37'}},fontFamily:{display:['Georgia','serif'],body:['system-ui','-apple-system','sans-serif']}}}}</script><script type="application/ld+json">${schema}</script></head><body class="bg-cozy-cream font-body text-cozy-bark"><header class="sticky top-0 z-50 border-b border-cozy-peach/50 bg-white/90 backdrop-blur-md"><nav class="mx-auto max-w-6xl px-4 py-3"><div class="flex items-center justify-between gap-4"><a href="/" class="flex items-center gap-2" aria-label="Heartopia.Life Home"><img src="/favicon-96x96.png" alt="Heartopia.Life" class="h-7 w-7"><span class="font-display text-xl font-bold">Heartopia<span class="text-cozy-sage">.Life</span></span></a><div class="hidden items-center gap-6 text-sm font-medium md:flex"><a href="/guides/map/" class="hover:text-cozy-coral">Map</a><a href="/codes/" class="hover:text-cozy-coral">Codes</a><a href="/guides/" class="hover:text-cozy-coral">Guides</a><a href="/events/" class="hover:text-cozy-coral">Events</a><a href="/database/" class="font-bold text-cozy-coral">Database</a><a href="/tools/" class="hover:text-cozy-coral">Tools</a></div><button type="button" class="rounded-md p-2 hover:bg-cozy-peach/50 md:hidden" aria-label="Open menu" aria-controls="mobile-menu" onclick="document.getElementById('mobile-menu').classList.toggle('hidden')"><svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg></button></div><div id="mobile-menu" class="mt-4 hidden border-t border-cozy-peach/50 pb-4 pt-4 md:hidden"><div class="grid gap-3 text-sm font-medium"><a href="/guides/map/">Map</a><a href="/codes/">Codes</a><a href="/guides/">Guides</a><a href="/events/">Events</a><a href="/database/" class="font-bold text-cozy-coral">Database</a><a href="/tools/">Tools</a></div></div></nav></header><main class="mx-auto max-w-5xl px-4 py-8"><nav class="mb-6 text-sm text-cozy-wood"><a href="/">Home</a><span class="mx-2">/</span><a href="/database/">Database</a><span class="mx-2">/</span>Changelog</nav><section class="border-y border-cozy-sky/40 bg-white px-5 py-9 md:px-8"><p class="text-xs font-bold uppercase text-cozy-sage">Data transparency</p><h1 class="mt-2 font-display text-3xl font-bold md:text-5xl">Heartopia Database Changelog</h1><p class="mt-4 max-w-3xl text-lg leading-7 text-cozy-wood">See what was added, corrected, or changed across the database. Build timestamps alone do not create an entry.</p><div class="mt-6 flex flex-wrap gap-5 text-sm"><span><strong>${data.trackedCategories.length}</strong> sections monitored</span><span><strong>${data.entries.length}</strong> recorded update${data.entries.length === 1 ? '' : 's'}</span><span>Latest: <strong>${esc(formatDate(latest.date, 'short'))}</strong></span></div></section><section class="mt-8 border-l-4 border-cozy-coral bg-white px-5 py-5"><p class="text-xs font-bold uppercase text-cozy-coral">Latest database update</p><p class="mt-2 font-bold">${esc(latest.summary)}</p><div class="mt-3 flex flex-wrap gap-2">${latest.changes.map(changeChip).join('')}</div></section><div id="heartopia_in_content" class="my-8 text-center"></div><section class="mt-8"><h2 class="font-display text-3xl font-bold">Update history</h2><p class="mt-2 text-cozy-wood">Newest changes appear first. Open an affected database directly from each update label.</p><div class="mt-3">${entries}</div></section>${secondAd}<section class="mt-10 border-y border-cozy-peach/70 py-7"><h2 class="font-display text-2xl font-bold">What creates an entry</h2><div class="mt-5 grid gap-5 md:grid-cols-3"><div class="border-l-2 border-emerald-300 pl-4"><strong>Entity changes</strong><p class="mt-1 text-sm text-cozy-wood">New, removed, or corrected database records.</p></div><div class="border-l-2 border-sky-300 pl-4"><strong>Availability changes</strong><p class="mt-1 text-sm text-cozy-wood">Event status moving between upcoming, active, and archive.</p></div><div class="border-l-2 border-violet-300 pl-4"><strong>Media changes</strong><p class="mt-1 text-sm text-cozy-wood">Local entity images refreshed without a data-field change.</p></div></div><p class="mt-5 text-sm text-cozy-wood">A scheduled check with no entity difference does not change the public update date.</p></section><section class="mt-8 flex flex-wrap gap-4"><a href="/database/" class="font-bold text-cozy-coral hover:underline">Database hub</a><a href="/tools/my-progress/" class="font-bold text-cozy-coral hover:underline">My Progress</a><a href="/events/" class="font-bold text-cozy-coral hover:underline">Events</a></section></main><footer class="mt-12 bg-cozy-bark py-8 text-white"><div class="mx-auto grid max-w-6xl gap-6 px-4 text-sm md:grid-cols-3"><div><a href="/" class="font-display text-lg font-bold">Heartopia<span class="text-cozy-sage">.Life</span></a><p class="mt-2 text-white/65">Unofficial fan guide. Game data can change with updates.</p></div><div><strong>Database</strong><p class="mt-2 text-white/65"><a href="/database/">All sections</a> · <a href="/database/changelog/">Changelog</a></p></div><div><strong>Tools</strong><p class="mt-2 text-white/65"><a href="/tools/search/">Search</a> · <a href="/tools/my-progress/">My Progress</a></p></div></div></footer><script>if(window.nitroAds){window.nitroAds.createAd('heartopia_anchor',{format:'anchor-v2',anchor:'bottom',mediaQuery:'(max-width:1024px)'});window.nitroAds.createAd('heartopia_side_rail',{format:'rail',rail:'right',railStickyTop:70,mediaQuery:'(min-width:1025px)'});window.nitroAds.createAd('heartopia_floating_video',{format:'floating',floating:{position:'left'},mediaQuery:'(min-width:1025px)'});window.nitroAds.createAd('heartopia_in_content',{format:'display',sizes:[[970,250],[728,90],[336,280],[300,250]],collapseEmpty:true,renderVisibleOnly:true,visibleMargin:800});${data.entries.length > 3 ? "window.nitroAds.createAd('heartopia_in_content_2',{format:'display',sizes:[[970,250],[728,90],[336,280],[300,250]],collapseEmpty:true,renderVisibleOnly:true,visibleMargin:800});" : ''}}</script></body></html>`;
}

function replaceBlock(html, name, content) {
  const pattern = new RegExp(`<!-- ${name}_START -->[\\s\\S]*?<!-- ${name}_END -->`);
  if (!pattern.test(html)) throw new Error(`Missing ${name} markers`);
  return html.replace(pattern, `<!-- ${name}_START -->\n${content}\n<!-- ${name}_END -->`);
}

function renderHomeBadge(latest) {
  const label = latest.signature === 'tracking-launch-v1' ? 'Database tracking live' : 'Database updated';
  return `<a href="/database/changelog/" class="mb-6 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-medium text-cozy-sage backdrop-blur hover:bg-white" aria-label="Open database changelog"><span class="h-2 w-2 rounded-full bg-green-500"></span><span>${label} · ${esc(formatDate(latest.date))}</span></a>`;
}

function renderHomeSummary(latest) {
  return `<a href="/database/changelog/" class="mb-7 flex flex-col gap-3 border-y border-cozy-sky/40 bg-cozy-cream/60 px-4 py-4 text-left hover:border-cozy-coral md:flex-row md:items-center md:justify-between"><span><span class="block text-xs font-bold uppercase text-cozy-sage">Latest database update · ${esc(formatDate(latest.date, 'short'))}</span><strong class="mt-1 block text-cozy-bark">${esc(latest.summary)}</strong></span><span class="shrink-0 text-sm font-bold text-cozy-coral">View changes →</span></a>`;
}

function renderDatabaseSummary(latest) {
  return `<section id="latest-database-updates" class="mb-8 border-y border-cozy-sky/40 bg-white px-5 py-5"><div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><p class="text-xs font-bold uppercase text-cozy-sage">Latest database update · ${esc(formatDate(latest.date, 'short'))}</p><h2 class="mt-1 font-display text-xl font-bold">${esc(latest.summary)}</h2><div class="mt-3 flex flex-wrap gap-2">${latest.changes.map(changeChip).join('')}</div></div><a href="/database/changelog/" class="shrink-0 text-sm font-bold text-cozy-coral hover:underline">View full changelog →</a></div></section>`;
}

const latest = state.entries[0];
let home = read('index.html');
home = replaceBlock(home, 'DATABASE_CHANGELOG_BADGE', renderHomeBadge(latest));
home = replaceBlock(home, 'DATABASE_CHANGELOG_SUMMARY', renderHomeSummary(latest));
writeIfChanged('index.html', home);

let database = read('database/index.html');
database = replaceBlock(database, 'DATABASE_CHANGELOG_SUMMARY', renderDatabaseSummary(latest));
writeIfChanged('database/index.html', database);
writeIfChanged('database/changelog/index.html', renderPage(state));

let sitemap = read('sitemap.xml');
const changelogUrl = 'https://heartopia.life/database/changelog/';
const sitemapEntry = `    <url>\n        <loc>${changelogUrl}</loc>\n        <lastmod>${latest.date}</lastmod>\n        <changefreq>daily</changefreq>\n        <priority>0.7</priority>\n    </url>`;
if (sitemap.includes(`<loc>${changelogUrl}</loc>`)) {
  sitemap = sitemap.replace(new RegExp(`<url>\\s*<loc>${changelogUrl.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}<\\/loc>[\\s\\S]*?<\\/url>`), sitemapEntry.trim());
} else {
  sitemap = sitemap.replace('</urlset>', `${sitemapEntry}\n</urlset>`);
}
writeIfChanged('sitemap.xml', sitemap);

console.log(changes.length
  ? `Recorded ${changes.length} database change groups: ${summaryFor(changes)}.`
  : `No entity differences detected; public update date remains ${state.updatedAt}.`);
