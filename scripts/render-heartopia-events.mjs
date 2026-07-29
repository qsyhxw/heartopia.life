import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const aliases = {
  'call-of-whales': 'call-of-whales',
  'my-little-pony': 'my-little-pony-collaboration',
  'winter-frost-season': 'winter-2026',
  'sanrio-characters': 'sanrio-characters-collaboration',
};

const profiles = {
  'sanrio-characters-collaboration': {
    type: 'Collaboration',
    summary: 'A limited character collaboration centered on themed recipes, furniture, accessories, pet outfits, and event rewards.',
    categories: ['SANRIO CHARACTERS'],
  },
  'call-of-whales': {
    type: 'Fashionwave',
    summary: 'An ocean-focused season with Whalefall Canyon, whale encounters, Ocean Cleanup, underwater housing, event cooking, and new collections.',
  },
  'midsummer-rhyme': {
    type: 'Seasonal festival',
    summary: 'A summer festival built around the Dryland Dragonboat Challenge, event currency, themed recipes, outfits, and furniture rewards.',
  },
  'rainbow-verse': {
    type: 'Seasonal event',
    summary: 'A color-themed limited event with event recipes, collection goals, and time-limited rewards.',
  },
  'modular-streets': {
    type: 'Fashionwave',
    summary: 'A brick-city season with themed fish, insects, birds, recipes, furniture, and limited collection activities.',
  },
  maltese: {
    type: 'Wildlife event',
    summary: 'A limited animal event featuring the Maltese visitor, interaction progress, themed recipes, and related rewards.',
  },
  'pleasant-goat-and-big-big-wolf': {
    type: 'Collaboration',
    summary: 'A crossover event with themed activities, cosmetics, furniture, and collaboration rewards.',
  },
  'dreamlight-cinematics': {
    type: 'Fashionwave',
    summary: 'A cinema-themed season with actor-styled fish, insects, birds, recipes, and limited collection rewards.',
  },
  'my-little-pony-collaboration': {
    type: 'Collaboration',
    summary: 'A limited collaboration with themed quests, collection rewards, outfits, furniture, and event activities.',
    categories: ['My Little Pony'],
  },
  'winter-2026': {
    type: 'Fashionwave',
    summary: 'A winter season with Frostspore wildlife, seasonal collections, recipes, and limited rewards.',
    categories: ['Winter Frost Season'],
  },
  'frostspore-butterflies': {
    type: 'Event collection',
    summary: 'A focused archive for the Frostspore butterfly collection introduced during Winter Frost Season.',
    artwork: 'winter-2026',
    categories: ['Winter Frost Season'],
  },
};

const relationSources = [
  { key: 'fish', label: 'Fish', file: 'data/heartopia-fish.json', fields: ['fish', 'items'], href: '/database/fish/' },
  { key: 'insects', label: 'Insects', file: 'data/heartopia-insects.json', fields: ['insects', 'items'], href: '/database/insects/' },
  { key: 'birds', label: 'Birds', file: 'data/heartopia-birds.json', fields: ['birds', 'items'], href: '/database/birds/' },
  { key: 'recipes', label: 'Recipes', file: 'data/heartopia-recipes.json', fields: ['recipes', 'items'], href: '/database/recipes/' },
  { key: 'wildlife', label: 'Wildlife', file: 'data/heartopia-wildlife.json', fields: ['wildlife', 'items'], href: '/database/wildlife/' },
];

const clean = (value) => String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const esc = (value) => String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const route = (event) => event.local || aliases[event.slug] || event.slug;
const eventFile = (event) => path.join(root, 'events', route(event), 'index.html');
const profileFor = (event) => profiles[route(event)] || {};
const label = (status) => status === 'active' ? 'Active now' : status === 'upcoming' ? 'Upcoming' : 'Past event';
const classes = (status) => status === 'active' ? 'bg-emerald-100 text-emerald-800' : status === 'upcoming' ? 'bg-sky-100 text-sky-800' : 'bg-stone-100 text-stone-700';
const period = (event) => event.startDate && event.endDate
  ? `${event.startDate} - ${event.endDate}`
  : event.startDate || event.endDate || event.date || 'Check the in-game event panel';

const recordsBySource = relationSources.map((source) => {
  const data = JSON.parse(fs.readFileSync(path.join(root, source.file), 'utf8'));
  const records = source.fields.map((field) => data[field]).find(Array.isArray) || [];
  return { ...source, records };
});

function relationsFor(event) {
  const profile = profileFor(event);
  const categories = new Set([event.name, ...(profile.categories || [])].map((item) => clean(item).toLowerCase()));
  return recordsBySource.map((source) => ({
    ...source,
    count: source.records.filter((item) => categories.has(clean(item.category).toLowerCase())).length,
  })).filter((source) => source.count > 0);
}

function artworkFor(event) {
  const profile = profileFor(event);
  const names = [route(event), event.slug, profile.artwork].filter(Boolean);
  for (const name of names) {
    for (const extension of ['webp', 'jpg', 'jpeg', 'png']) {
      const relative = `img/events/${name}.${extension}`;
      if (fs.existsSync(path.join(root, relative))) return `/${relative}`;
    }
  }
  return '';
}

function summaryFor(event) {
  const profile = profileFor(event);
  if (profile.summary) return profile.summary;
  const relations = relationsFor(event);
  if (relations.length) {
    const contents = relations.map((item) => `${item.count} ${item.label.toLowerCase()}`).join(', ');
    return `A limited Heartopia event connected to ${contents} in the current database.`;
  }
  return 'A limited Heartopia event with a recorded schedule, status, and links to related guides and database entries.';
}

function typeFor(event) {
  return clean(event.type) || profileFor(event).type || 'Limited-time event';
}

function head(title, description, url, schema, body) {
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${url}"><meta name="robots" content="index,follow"><link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"><link rel="manifest" href="/site.webmanifest"><script src="https://cdn.tailwindcss.com"></script><script>tailwind.config={theme:{extend:{colors:{cozy:{cream:'#FFF8F0',peach:'#FFE5D9',coral:'#FF9B85',rose:'#D4A5A5',sage:'#A8C686',mint:'#B8E0D2',sky:'#95C8D8',wood:'#8B7355',bark:'#5D4E37'}},fontFamily:{display:['Georgia','serif'],body:['system-ui','-apple-system','sans-serif']}}}}</script><script async src="https://www.googletagmanager.com/gtag/js?id=G-FRJ91G3VRR"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-FRJ91G3VRR');</script><script data-cfasync="false">window.nitroAds=window.nitroAds||{createAd:function(){return new Promise(e=>{window.nitroAds.queue.push(["createAd",arguments,e])})},addUserToken:function(){window.nitroAds.queue.push(["addUserToken",arguments])},queue:[]};</script><script data-cfasync="false" async src="https://s.nitropay.com/ads-2368.js"></script><script type="application/ld+json">${JSON.stringify(schema)}</script><style>html{scroll-behavior:smooth}.card{background:#fff;border:1px solid #e7d5c8;border-radius:.5rem}.event-card{box-shadow:0 5px 16px rgb(93 78 55 / .08);transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease}.event-card:hover{transform:translateY(-3px);border-color:#FF9B85;box-shadow:0 14px 28px rgb(93 78 55 / .14)}.event-card:focus-visible{outline:3px solid #95C8D8;outline-offset:3px}.link{color:#8B7355;font-weight:700}.link:hover{color:#FF9B85}</style></head><body class="bg-cozy-cream text-cozy-bark font-body">${body}<script>(function(){function a(){if(window.__heartopiaEventAds||!window.nitroAds)return;window.__heartopiaEventAds=true;window.nitroAds.createAd('heartopia_anchor',{format:'anchor-v2',anchor:'bottom',anchorBgColor:'rgb(0 0 0 / 80%)',anchorClose:true,mediaQuery:'(max-width: 1024px)'});window.nitroAds.createAd('heartopia_side_rail',{format:'rail',rail:'right',railStickyTop:70,mediaQuery:'(min-width: 1025px)'});window.nitroAds.createAd('heartopia_floating_video',{format:'floating',floating:{position:'left'},mediaQuery:'(min-width: 1025px)'});for(const id of ['heartopia_in_content','heartopia_in_content_2'])window.nitroAds.createAd(id,{format:'display',sizes:[[300,250],[336,280],[728,90]],collapseEmpty:true})}if(window.nitroAds&&window.nitroAds.loaded)a();else document.addEventListener('nitroAds.loaded',a,{once:true})})();</script></body></html>`;
}

const nav = () => `<header class="sticky top-0 z-50 border-b border-cozy-peach/50 bg-white/90 backdrop-blur-md"><nav class="mx-auto max-w-6xl px-4 py-3"><div class="flex items-center justify-between gap-4"><a href="/" class="flex shrink-0 items-center gap-2 group"><img src="/favicon-96x96.png" alt="Heartopia.Life" class="h-7 w-7"><span class="font-display text-xl font-bold text-cozy-bark">Heartopia<span class="text-cozy-sage">.Life</span></span></a><ul class="hidden items-center gap-5 text-sm font-medium md:flex"><li><a href="/guides/map/" class="transition-colors hover:text-cozy-coral">Map</a></li><li><a href="/codes/" class="transition-colors hover:text-cozy-coral">Codes</a></li><li><a href="/guides/" class="transition-colors hover:text-cozy-coral">Guides</a></li><li><a href="/hobbies/" class="transition-colors hover:text-cozy-coral">Hobbies</a></li><li><a href="/events/" class="font-bold text-cozy-coral">Events</a></li><li><a href="/database/" class="transition-colors hover:text-cozy-coral">Database</a></li><li><a href="/npcs/" class="transition-colors hover:text-cozy-coral">NPCs</a></li><li class="relative group"><a href="/tools/" class="transition-colors hover:text-cozy-coral">More</a><div class="invisible absolute right-0 top-full z-50 mt-2 w-52 translate-y-1 rounded-lg border border-cozy-peach bg-white p-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100"><a href="/tools/" class="block rounded-lg px-3 py-2 hover:bg-cozy-cream">Tools</a><a href="/guides/top-up/" class="block rounded-lg px-3 py-2 hover:bg-amber-50">Top-Up Options</a></div></li></ul><a href="/tools/daily-tasks/" class="rounded-lg bg-cozy-peach px-3 py-2 text-xs font-bold text-cozy-bark transition-colors hover:bg-cozy-coral md:hidden">Tasks</a></div></nav></header>`;
const footer = () => `<footer class="mt-12 bg-cozy-bark py-8 text-white"><div class="mx-auto grid max-w-6xl gap-8 px-4 text-sm md:grid-cols-3"><div><a href="/" class="inline-flex items-center gap-2"><img src="/favicon-96x96.png" alt="Heartopia.Life" class="h-7 w-7"><span class="font-display text-lg font-bold">Heartopia<span class="text-cozy-sage">.Life</span></span></a><p class="mt-3 leading-6 text-white/65">Unofficial fan guide. Event availability can differ by server, so confirm the live in-game event panel.</p></div><div><h2 class="font-display text-base font-bold">Explore</h2><div class="mt-3 grid gap-2 text-white/70"><a class="hover:text-cozy-sage" href="/events/">Events</a><a class="hover:text-cozy-sage" href="/guides/">Guides</a><a class="hover:text-cozy-sage" href="/database/">Database</a></div></div><div><h2 class="font-display text-base font-bold">Tools</h2><div class="mt-3 grid gap-2 text-white/70"><a class="hover:text-cozy-sage" href="/tools/daily-tasks/">Daily Tasks</a><a class="hover:text-cozy-sage" href="/tools/my-progress/">My Progress</a><a class="hover:text-cozy-sage" href="/guides/map/">Map &amp; Locations</a></div></div></div><div class="mx-auto mt-7 flex max-w-6xl flex-wrap justify-between gap-3 border-t border-white/10 px-4 pt-5 text-xs text-white/45"><p>&copy; 2026 Heartopia.Life</p><p><a class="hover:text-white" href="/privacy-policy/">Privacy Policy</a><span class="mx-2">&middot;</span><a class="hover:text-white" href="/contact/">Contact</a></p></div></footer>`;

function card(event, compact = false) {
  const image = artworkFor(event);
  const summary = summaryFor(event);
  const type = typeFor(event);
  const media = image
    ? `<div class="aspect-[16/9] overflow-hidden bg-[#edf4f4]"><img src="${image}" alt="${esc(event.name)} event artwork" class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.025]" loading="lazy"></div>`
    : `<div class="flex aspect-[16/9] items-end bg-[#edf4f4] p-5"><span class="text-xs font-black uppercase text-[#735f4d]">Artwork not available</span></div>`;
  return `<a class="card event-card group flex h-full flex-col overflow-hidden" href="/events/${route(event)}/" aria-label="View ${esc(event.name)} event guide">${media}<div class="flex flex-1 flex-col ${compact ? 'p-4' : 'p-5'}"><div class="flex flex-wrap items-center gap-2"><span class="inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${classes(event.status)}">${label(event.status)}</span><span class="text-xs font-bold uppercase text-[#8b7355]">${esc(type)}</span></div><h3 class="mt-3 ${compact ? 'text-lg' : 'text-xl'} font-bold leading-snug">${esc(event.name)}</h3><p class="mt-2 text-sm font-semibold text-[#735f4d]">${esc(period(event))}</p><p class="mt-3 flex-1 text-sm leading-6 text-[#735f4d]">${esc(summary)}</p><span class="mt-5 inline-flex w-fit items-center gap-2 rounded-lg bg-cozy-bark px-3.5 py-2 text-sm font-bold text-white transition-colors group-hover:bg-cozy-coral">View guide <span aria-hidden="true">&rarr;</span></span></div></a>`;
}

function rootPage(events, updatedAt) {
  const group = (status) => events.filter((event) => event.status === status);
  const list = (status, empty, compact = false) => group(status).length
    ? group(status).map((event) => card(event, compact)).join('')
    : `<p class="rounded-lg border border-dashed border-[#d9c8bb] bg-white/60 p-5 text-sm text-[#735f4d]">${empty}</p>`;
  const body = `${nav()}<main><section class="border-b border-[#eaded2] bg-[#fff4f3]"><div class="mx-auto max-w-6xl px-5 py-14"><p class="text-xs font-black uppercase text-[#bd506b]">Heartopia event calendar</p><h1 class="mt-3 text-4xl font-bold md:text-5xl">Heartopia Events</h1><p class="mt-4 max-w-3xl text-lg leading-8 text-[#735f4d]">Track active events, preview announced updates, and open archived event guides with their related collections and database entries.</p><div class="mt-6 flex flex-wrap gap-3 text-sm font-bold"><a href="#active-events" class="rounded-lg bg-cozy-bark px-4 py-2 text-white">Active now</a><a href="#past-events" class="rounded-lg border border-[#d9c8bb] bg-white px-4 py-2">Past events</a><span class="self-center text-[#735f4d]">Updated ${esc(updatedAt)}</span></div></div></section><section id="active-events" class="mx-auto max-w-6xl px-5 py-12"><p class="text-xs font-black uppercase text-emerald-700">Active now</p><h2 class="mt-2 text-3xl font-bold">Current event guides</h2><p class="mt-3 max-w-3xl text-[#735f4d]">Open an event to check its schedule, activities, collections, locations, recipes, and linked tools.</p><div class="mt-6 grid items-stretch gap-6 md:grid-cols-2">${list('active', 'No active event is listed right now.')}</div><div id="heartopia_in_content" class="my-8"></div></section><section class="border-y border-[#e0eaf2] bg-[#f5f9ff]"><div class="mx-auto max-w-6xl px-5 py-12"><p class="text-xs font-black uppercase text-sky-700">Upcoming</p><h2 class="mt-2 text-3xl font-bold">Next on the calendar</h2><div class="mt-6 grid gap-6 md:grid-cols-2">${list('upcoming', 'No upcoming event is currently listed.')}</div></div></section><section class="mx-auto max-w-6xl px-5 py-12"><p class="text-xs font-black uppercase text-amber-700">Recurring activities</p><h2 class="mt-2 text-3xl font-bold">Permanent event-style activities</h2><div class="mt-5 grid gap-4 md:grid-cols-3"><a class="card event-card p-5 font-bold" href="/events/sea-fishing/">Sea Fishing <span aria-hidden="true">&rarr;</span></a><a class="card event-card p-5 font-bold" href="/events/bait-insects/">Bait the Insects <span aria-hidden="true">&rarr;</span></a><a class="card event-card p-5 font-bold" href="/events/nest-of-hundreds/">Nest of Hundreds <span aria-hidden="true">&rarr;</span></a></div></section><section id="past-events" class="border-t border-[#eaded2] bg-[#fff6ef]"><div class="mx-auto max-w-6xl px-5 py-12"><p class="text-xs font-black uppercase text-stone-600">Archive</p><h2 class="mt-2 text-3xl font-bold">Past event guides</h2><p class="mt-3 max-w-3xl text-[#735f4d]">Use these archives to identify limited collections, recipes, wildlife, and rewards that may return in a future rerun.</p><div class="mt-6 grid items-stretch gap-5 md:grid-cols-2 lg:grid-cols-3">${list('archive', 'No archived events recorded yet.', true)}</div><div id="heartopia_in_content_2" class="my-8"></div></div></section></main>${footer()}`;
  return head('Heartopia Events: Active, Upcoming & Past Event Guides', 'Browse current and past Heartopia events with schedules, artwork, guide links, and related database collections.', 'https://heartopia.life/events/', { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Heartopia Events', dateModified: updatedAt }, body);
}

function relationCards(event) {
  const relations = relationsFor(event);
  if (!relations.length) return `<p class="mt-4 text-[#735f4d]">No event-tagged database entries are currently recorded for this event.</p>`;
  return `<div class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">${relations.map((item) => `<a class="card event-card p-5" href="${item.href}?search=${encodeURIComponent(event.name)}"><span class="text-xs font-black uppercase text-[#bd506b]">Related database</span><h3 class="mt-2 text-xl font-bold">${item.count} ${esc(item.label)}</h3><p class="mt-2 text-sm text-[#735f4d]">Open the filtered ${item.label.toLowerCase()} list.</p><span class="mt-4 inline-block text-sm font-bold">Browse entries &rarr;</span></a>`).join('')}</div>`;
}

function detailPage(event) {
  const image = artworkFor(event);
  const summary = summaryFor(event);
  const type = typeFor(event);
  const archived = event.status === 'archive';
  const heroMedia = image
    ? `<img src="${image}" alt="${esc(event.name)} event artwork" class="absolute inset-0 h-full w-full object-cover">`
    : '<div class="absolute inset-0 bg-[#8ab9c2]"></div>';
  const statusPanel = archived
    ? `<section class="border-y border-[#eaded2] bg-[#fff4ed]"><div class="mx-auto max-w-6xl px-5 py-8"><p class="text-sm font-bold text-[#8a4b35]">This event has ended.</p><p class="mt-2 max-w-3xl leading-7 text-[#735f4d]">The archive remains useful for identifying limited entries and preparing for a possible rerun. Availability can differ by server.</p></div></section>`
    : `<section class="border-y border-[#d9e8df] bg-[#eff9f3]"><div class="mx-auto max-w-6xl px-5 py-8"><p class="text-sm font-bold text-emerald-800">Check before you play</p><p class="mt-2 max-w-3xl leading-7 text-[#466554]">Confirm the live server-time window, unlock requirements, task list, and claim deadlines in the in-game event panel.</p></div></section>`;
  const action = archived
    ? `<h2 class="text-2xl font-bold">Using this archive</h2><ul class="mt-4 space-y-3 leading-7 text-[#735f4d]"><li>Check which collections and recipes were tied to the event.</li><li>Use the linked database filters to identify missing entries.</li><li>Confirm rerun availability in the current in-game event panel.</li></ul>`
    : `<h2 class="text-2xl font-bold">Start here</h2><ol class="mt-4 space-y-3 leading-7 text-[#735f4d]"><li>1. Confirm the event window in server time.</li><li>2. Check story, hobby, or level requirements.</li><li>3. Prioritize limited tasks and claim rewards before reset.</li></ol>`;
  const officialLink = event.officialUrl ? `<a class="link" href="${esc(event.officialUrl)}" target="_blank" rel="noopener nofollow">Official announcement &rarr;</a>` : '';
  const body = `${nav()}<main data-event-sync="managed"><section class="relative min-h-[430px] overflow-hidden bg-cozy-bark">${heroMedia}<div class="absolute inset-0 bg-black/55"></div><div class="relative mx-auto flex min-h-[430px] max-w-6xl flex-col justify-end px-5 py-12 text-white"><div class="flex flex-wrap items-center gap-2"><span class="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-cozy-bark">${label(event.status)}</span><span class="rounded-full border border-white/40 bg-black/25 px-3 py-1 text-xs font-bold">${esc(type)}</span></div><h1 class="mt-4 max-w-4xl text-4xl font-bold md:text-5xl">Heartopia ${esc(event.name)}</h1><p class="mt-4 text-lg font-semibold">${esc(period(event))}</p><p class="mt-4 max-w-3xl text-base leading-7 text-white/90">${esc(summary)}</p></div></section>${statusPanel}<section class="mx-auto max-w-6xl px-5 py-12"><div class="grid gap-8 lg:grid-cols-[1.15fr_.85fr]"><div><p class="text-xs font-black uppercase text-[#bd506b]">Event overview</p><h2 class="mt-2 text-3xl font-bold">What this event included</h2><p class="mt-4 max-w-3xl text-lg leading-8 text-[#735f4d]">${esc(summary)}</p>${officialLink ? `<p class="mt-5">${officialLink}</p>` : ''}</div><aside class="border-l-4 border-cozy-coral bg-white p-6"><dl class="grid gap-4 text-sm"><div><dt class="font-bold">Status</dt><dd class="mt-1 text-[#735f4d]">${label(event.status)}</dd></div><div><dt class="font-bold">Schedule</dt><dd class="mt-1 text-[#735f4d]">${esc(period(event))}</dd></div><div><dt class="font-bold">Event type</dt><dd class="mt-1 text-[#735f4d]">${esc(type)}</dd></div></dl></aside></div><div class="mt-10 border-t border-[#eaded2] pt-10">${action}</div><div id="heartopia_in_content" class="my-8"></div><section class="mt-10"><p class="text-xs font-black uppercase text-[#bd506b]">Connected content</p><h2 class="mt-2 text-3xl font-bold">Related collections and recipes</h2><p class="mt-3 max-w-3xl text-[#735f4d]">These counts come from Heartopia.Life database entries tagged to this event.</p>${relationCards(event)}</section><div class="mt-10 flex flex-wrap gap-3 border-t border-[#eaded2] pt-8"><a class="rounded-lg bg-cozy-bark px-4 py-2 text-sm font-bold text-white" href="/events/">All events</a><a class="rounded-lg border border-[#d9c8bb] bg-white px-4 py-2 text-sm font-bold" href="/tools/my-progress/">My Progress</a><a class="rounded-lg border border-[#d9c8bb] bg-white px-4 py-2 text-sm font-bold" href="/tools/daily-tasks/">Daily Tasks</a></div><div id="heartopia_in_content_2" class="my-8"></div></section></main>${footer()}`;
  const url = `https://heartopia.life/events/${route(event)}/`;
  const description = `${event.name} event guide with schedule, status, artwork, overview, and related Heartopia database collections.`;
  return head(`Heartopia ${event.name}: Event Guide, Dates & Collections`, description, url, { '@context': 'https://schema.org', '@type': 'Event', name: event.name, startDate: event.startDate || undefined, endDate: event.endDate || undefined, eventStatus: archived ? 'https://schema.org/EventCompleted' : 'https://schema.org/EventScheduled', url }, body);
}

export function renderHeartopiaEvents(events, updatedAt) {
  for (const event of events) {
    const target = eventFile(event);
    const existing = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : '';
    if (!existing || existing.includes('data-event-sync="managed"')) {
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, detailPage(event));
    }
  }
  fs.writeFileSync(path.join(root, 'events', 'index.html'), rootPage(events, updatedAt));
}

if (process.argv[1] && path.resolve(process.argv[1]) === import.meta.filename) {
  const data = JSON.parse(fs.readFileSync(path.join(root, 'data', 'heartopia-events.json'), 'utf8'));
  const events = (data.events || []).map((event) => ({
    ...event,
    local: event.localSlug || event.slug,
    date: event.dateLabel || '',
  }));
  renderHeartopiaEvents(events, data.generatedAt || new Date().toISOString().slice(0, 10));
  console.log(`Rendered ${events.length} Heartopia event pages from local facts.`);
}
