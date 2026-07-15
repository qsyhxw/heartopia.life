import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const write = (file, value) => fs.writeFileSync(path.join(root, file), value);
const source = JSON.parse(read('data/heartopia-achievements.json'));
const achievements = Array.isArray(source.achievements) ? source.achievements : [];
const total = achievements.length;
const updated = /^\d{4}-\d{2}-\d{2}$/.test(source.generatedAt) ? source.generatedAt : new Date().toISOString().slice(0, 10);
const updatedLabel = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${updated}T00:00:00Z`));
const esc = (value) => String(value || '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);

if (!total || Number(source.count) !== total) throw new Error('Canonical achievement data is missing or its count is stale');
for (const achievement of achievements) {
  const image = achievement.image?.startsWith('/') ? path.join(root, achievement.image.slice(1)) : '';
  if (!achievement.name || !achievement.objective || !achievement.reward || !image || !fs.existsSync(image)) {
    throw new Error(`Incomplete achievement entry: ${achievement.name || '(unnamed)'}`);
  }
}

const challengeNames = new Set(['Fast & Flawless', 'Rainbow Luck', 'Plentiful Harvest']);
const challenges = achievements.filter((entry) => entry.status === 'Activity-dependent' || challengeNames.has(entry.name));

function head(title, description, canonical) {
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><script async src="https://www.googletagmanager.com/gtag/js?id=G-FRJ91G3VRR"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-FRJ91G3VRR');</script><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><meta name="robots" content="index,follow"><link rel="canonical" href="${canonical}"><script src="https://cdn.tailwindcss.com"></script><script>tailwind.config={theme:{extend:{colors:{cozy:{cream:'#FFF8F0',peach:'#FFE5D9',coral:'#FF9B85',sage:'#A8C686',mint:'#B8E0D2',sky:'#95C8D8',wood:'#8B7355',bark:'#5D4E37'}},fontFamily:{display:['Georgia','serif'],body:['system-ui','sans-serif']}}}}</script><style>.achievement-card{transition:transform .18s ease,box-shadow .18s ease}.achievement-card:hover{transform:translateY(-2px);box-shadow:0 8px 16px rgba(139,115,85,.12)}</style><script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'CollectionPage', name: title, description, url: canonical, dateModified: updated })}</script><script data-cfasync="false">window.nitroAds=window.nitroAds||{createAd:function(){return new Promise(e=>{window.nitroAds.queue.push(['createAd',arguments,e])})},queue:[]};</script><script data-cfasync="false" async src="https://s.nitropay.com/ads-2368.js"></script></head>`;
}

const header = `<body class="bg-cozy-cream text-cozy-bark font-body"><header class="sticky top-0 z-50 border-b border-cozy-peach/50 bg-white/90 backdrop-blur-md"><nav class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3"><a href="/" class="flex items-center gap-2"><img src="/favicon-96x96.png" class="h-7 w-7" alt="Heartopia.Life"><span class="font-display text-xl font-bold">Heartopia<span class="text-cozy-sage">.Life</span></span></a><div class="hidden gap-6 text-sm font-bold md:flex"><a href="/guides/achievements/">Achievements</a><a href="/guides/hidden-achievements/">Hidden Achievements</a><a href="/tools/my-progress/">My Progress</a></div></nav></header>`;
const footer = `<footer class="mt-12 bg-cozy-bark py-8 text-white"><div class="mx-auto max-w-6xl px-4 text-center text-sm"><a href="/" class="font-display text-xl font-bold">Heartopia<span class="text-cozy-sage">.Life</span></a><p class="mt-2 text-white/60">Unofficial fan guide. Not affiliated with XD Entertainment.</p></div></footer><script>if(window.nitroAds){window.nitroAds.createAd('heartopia_anchor',{format:'anchor-v2',anchor:'bottom',anchorClose:true,mediaQuery:'(max-width: 1024px)'});window.nitroAds.createAd('heartopia_floating_video',{format:'floating',mediaQuery:'(min-width: 1025px)'});window.nitroAds.createAd('heartopia_side_rail',{format:'rail',rail:'right',railStickyTop:70,mediaQuery:'(min-width: 1025px)'});['heartopia_in_content','heartopia_in_content_2'].forEach(id=>window.nitroAds.createAd(id,{format:'display',sizes:[[970,90],[970,250],[728,90],[300,250],[320,100],[320,50]],collapseEmpty:true,renderVisibleOnly:true,visibleMargin:800}))}</script></body></html>`;

function card(entry) {
  return `<article class="achievement-card flex gap-3 rounded-xl border border-cozy-peach/40 bg-white p-4"><img src="${entry.image}" alt="${esc(entry.name)} achievement badge" class="h-16 w-16 shrink-0 rounded-lg bg-cozy-cream object-contain p-1" loading="lazy"><div class="min-w-0"><p class="text-xs font-bold text-cozy-sage">${esc(entry.group)}</p><h2 class="mt-1 font-bold">${esc(entry.name)}</h2><p class="mt-2 text-xs leading-relaxed text-cozy-wood"><strong class="text-cozy-bark">Objective:</strong> ${esc(entry.objective)}</p><p class="mt-1 text-xs text-cozy-wood"><strong class="text-cozy-bark">Title:</strong> ${esc(entry.reward)}</p>${entry.status === 'Activity-dependent' ? '<p class="mt-2 text-xs font-bold text-amber-700">Activity-dependent</p>' : ''}</div></article>`;
}

function render({ title, description, canonical, crumb, heading, intro, help, entries, note }) {
  return `${head(title, description, canonical)}${header}<main class="mx-auto max-w-6xl px-4 py-8"><nav class="mb-6 text-sm text-cozy-wood"><a href="/">Home</a><span class="mx-2">&rsaquo;</span><a href="/guides/">Guides</a><span class="mx-2">&rsaquo;</span>${crumb}</nav><section class="mb-8 rounded-2xl bg-gradient-to-br from-yellow-100 to-amber-100 p-6 md:p-8"><p class="mb-3 text-sm font-bold text-cozy-sage">Updated ${updatedLabel}</p><h1 class="font-display text-3xl font-bold md:text-4xl">${heading}</h1><p class="mt-3 max-w-3xl text-lg text-cozy-wood">${intro}</p></section><section class="mb-8 grid grid-cols-3 gap-4"><div class="rounded-xl border border-cozy-peach bg-white p-4 text-center"><p class="text-2xl font-bold text-cozy-coral">${entries.length}</p><p class="text-xs text-cozy-wood">Entries shown</p></div><div class="rounded-xl border border-cozy-peach bg-white p-4 text-center"><p class="text-2xl font-bold text-cozy-sage">${total}</p><p class="text-xs text-cozy-wood">Full achievement list</p></div><div class="rounded-xl border border-cozy-peach bg-white p-4 text-center"><p class="text-2xl font-bold text-cozy-sky">Local</p><p class="text-xs text-cozy-wood">Badge images</p></div></section><section class="mb-8 rounded-2xl border border-cozy-peach bg-white p-6"><h2 class="font-display text-2xl font-bold">How to use this page</h2><p class="mt-3 text-cozy-wood">${help}</p>${note ? `<p class="mt-4 rounded-lg bg-cozy-cream p-4 text-sm text-cozy-wood">${note}</p>` : ''}</section><div id="heartopia_in_content" class="my-6 text-center"></div><section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">${entries.map(card).join('')}</section><div id="heartopia_in_content_2" class="my-8 text-center"></div><section class="grid gap-4 md:grid-cols-3"><a href="/guides/achievements/" class="rounded-xl border border-cozy-peach bg-white p-5"><h2 class="font-bold">All ${total} achievements</h2><p class="mt-1 text-sm text-cozy-wood">Search and track every current entry.</p></a><a href="/guides/hidden-achievements/" class="rounded-xl border border-cozy-peach bg-white p-5"><h2 class="font-bold">Challenge objectives</h2><p class="mt-1 text-sm text-cozy-wood">Event and special-action goals.</p></a><a href="/tools/my-progress/" class="rounded-xl border border-cozy-peach bg-white p-5"><h2 class="font-bold">My Progress</h2><p class="mt-1 text-sm text-cozy-wood">Keep your collection checklist together.</p></a></section></main>${footer}`;
}

write('guides/badges/index.html', render({
  title: `Heartopia Badges Guide: All ${total} Achievement Titles`,
  description: `Browse all ${total} Heartopia badges with objectives, title rewards, categories, and local badge images.`,
  canonical: 'https://heartopia.life/guides/badges/', crumb: 'Badges',
  heading: `Heartopia Badges: ${total} Achievement Titles`,
  intro: 'A visual badge reference that pairs every current achievement with its objective and profile-title reward.',
  help: 'Find a badge by name, read its objective and title, then use the complete achievements list to search, filter, and save progress in your browser.',
  entries: achievements,
  note: 'Achievement requirements, event availability, and title wording can change with game updates. Check the in-game achievement display if a current update differs.'
}));

write('guides/hidden-achievements/index.html', render({
  title: 'Heartopia Hidden Achievements & Secret Badge Objectives',
  description: `Browse challenge-style objectives from the current ${total}-achievement Heartopia list with badge images and title rewards.`,
  canonical: 'https://heartopia.life/guides/hidden-achievements/', crumb: 'Hidden Achievements',
  heading: 'Heartopia Hidden Achievements & Challenge Objectives',
  intro: 'A focused reference for event, timing, and special-action achievement objectives often searched as secret or hidden badges.',
  help: 'Use each listed objective as an in-game checklist. This page groups challenge-style goals instead of claiming a fixed hidden-badge count.',
  entries: challenges,
  note: `For collection, hobby, dreams, and the rest of the current ${total} entries, use the complete achievements list.`
}));

console.log(`Built achievement support pages from ${total} canonical entries (${challenges.length} challenge-style entries).`);
