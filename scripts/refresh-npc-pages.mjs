import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const today = '2026-07-13';
const esc = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

const people = {
  atara: {
    name: 'Atara', image: 'Atara.webp', location: 'Central Square', role: 'Mayor',
    summary: 'Atara is Heartopia\'s mayor and a guide for the main story.',
    gifts: 'No favorite gifts are currently listed in the NPC database.',
    function: 'Main-story guidance',
    details: [
      ['Where to look', 'Central Square. Use the in-game map NPC icon if she is not in your immediate view.'],
      ['What she does', 'She is tied to town and main-story guidance. Follow the current quest marker for the exact next step.'],
      ['Gift note', 'No confirmed favorite-gift list is currently published, so use the in-game Friendship Journal before spending items.']
    ],
    links: [['/guides/npc-locations/', 'NPC locations'], ['/guides/quests/', 'Quest guides'], ['/guides/map/', 'Map & location finder']]
  },
  blanc: {
    name: 'Blanc', image: 'Blanc.webp', location: 'Central Square', role: 'Gardening mentor',
    summary: 'Blanc teaches gardening and provides the starter supplies used for planting.',
    gifts: 'Rare flowers and seeds are listed as favorites.',
    function: 'Gardening supplies',
    details: [
      ['Where to look', 'Central Square. Open the map and select Blanc\'s NPC icon when you need the exact position.'],
      ['Shop focus', 'The current NPC listing identifies seeds, fertilizer, and flower pots as gardening-shop supplies.'],
      ['Useful route', 'Visit Blanc before planting crops or flowers, then use the crop database to compare seed price and growth time.']
    ],
    links: [['/database/crops/', 'Crop database'], ['/hobbies/gardening/', 'Gardening guide'], ['/guides/flower-crossbreeding/', 'Flower crossbreeding']]
  },
  doris: {
    name: 'Doris', image: 'Doris.webp', location: 'Suburbs', role: 'Secret Merchant',
    summary: 'Doris is a weather-dependent merchant whose stock changes with special conditions.',
    gifts: 'No favorite gifts are currently listed in the NPC database.',
    function: 'Weather-event shop',
    details: [
      ['Where to look', 'Suburbs. Check the in-game map and current weather when you are looking for her.'],
      ['When she appears', 'The current NPC listing associates her with rain, snowfall, rainbow, and meteor-shower conditions.'],
      ['Shop note', 'Her listed specialties include exclusive recipes, ingredients, emotes, and meteorite furniture. Treat stock and currency requirements as event-dependent.']
    ],
    links: [['/guides/meteor-shower/', 'Meteor shower guide'], ['/events/', 'Current events'], ['/database/recipes/', 'Recipe database']]
  },
  dorothee: {
    name: 'Dorothee', image: 'Dorothee.webp', location: 'Central Square', role: 'Fashion designer',
    summary: 'Dorothee is the fashion designer and clothing-shop NPC in Central Square.',
    gifts: 'No favorite gifts are currently listed in the NPC database.',
    function: 'Fashion shop',
    details: [
      ['Where to look', 'Central Square. Use the map NPC icon if you need the exact shop position.'],
      ['Shop focus', 'Dorothee\'s shop is associated with shoes and clothing. The current listing notes that the clothing selection changes daily.'],
      ['Planning tip', 'Check the current shop selection in game before saving currency for a particular look.']
    ],
    links: [['/guides/gallery/', 'Gallery & exhibition pass'], ['/guides/painting-tools/', 'Clothing design guide'], ['/guides/npc-locations/', 'All NPC locations']]
  },
  eric: {
    name: 'Eric', image: 'Eric.webp', location: 'Onsen', role: 'Park manager',
    summary: 'Eric is the park manager in the Onsen area and is associated with daily community delegations.',
    gifts: 'No favorite gifts are currently listed in the NPC database.',
    function: 'Daily community delegations',
    details: [
      ['Where to look', 'Onsen. Follow Eric\'s icon on the in-game map for his exact position.'],
      ['What he does', 'The current NPC listing identifies Eric as the park manager who manages daily delegations for the community.'],
      ['Quest tip', 'Use the active quest tracker rather than old event guides: seasonal routes can change between updates.']
    ],
    links: [['/tools/daily-tasks/', 'Daily tasks'], ['/guides/egg-locations/', 'Egg locations'], ['/guides/npc-locations/', 'All NPC locations']]
  },
  vanya: {
    name: 'Vanya', image: 'Vanya.webp', location: 'Residential Street', role: 'Fishing mentor',
    summary: 'Vanya is the fishing mentor in Residential Street and is the key NPC for fishing supplies.',
    gifts: 'Any fish, seafood, and fishing supplies are listed as favorites.',
    function: 'Fishing supplies',
    details: [
      ['Where to look', 'Residential Street. Use the in-game map NPC icon when you need the exact shop position.'],
      ['Shop focus', 'The current NPC listing includes Mermaid Fish Attractor, Bait, and Mermaid Perfume. Availability can change with game updates.'],
      ['Useful route', 'Visit Vanya before a fishing session, then use the fish database to check target conditions and track catches.']
    ],
    links: [['/database/fish/', 'Fish database'], ['/guides/fish-locations/', 'Fish locations'], ['/tools/fish-tracker/', 'Fish tracker']]
  },
  massimo: {
    name: 'Massimo', image: 'Massimo.webp', location: 'Central Square', role: 'Cooking mentor',
    summary: 'Massimo is the restaurant chef and cooking mentor in Central Square.',
    gifts: 'Prepared meals and rare ingredients are listed as favorites.',
    function: 'Cooking supplies',
    details: [
      ['Where to look', 'Central Square. Use the in-game map NPC icon when you need the exact restaurant position.'],
      ['Shop focus', 'The current NPC listing includes Amazing Seasoning and Universal Ingredient. Check the in-game shop for the current stock and price.'],
      ['Useful route', 'Visit Massimo when a recipe or cooking step needs a special ingredient, then compare recipes and ingredients in the databases.']
    ],
    links: [['/database/recipes/', 'Recipe database'], ['/database/ingredients/', 'Ingredients database'], ['/guides/cooking/', 'Cooking guide']]
  },
  naniwa: {
    name: 'Naniwa', image: 'Naniwa.webp', location: 'Deer Tower', role: 'Entomologist',
    summary: 'Naniwa is the entomologist who supports insect catching and related equipment.',
    gifts: 'Rare insects are listed as favorites.',
    function: 'Insect-catching supplies',
    details: [
      ['Where to look', 'Deer Tower. Use the in-game map NPC icon for the exact position.'],
      ['Shop focus', 'The current NPC listing includes Inflatable Insect Attractor and Sense Booster. His hobby shop is also associated with terrariums.'],
      ['Useful route', 'Visit Naniwa before targeting a difficult bug, then check the insect database for the target location and conditions.']
    ],
    links: [['/database/insects/', 'Insect database'], ['/guides/insects/', 'Insect locations guide'], ['/hobbies/insect-catching/', 'Insect catching']]
  },
  'ka-ching': {
    name: 'Ka Ching', image: 'Ka-Ching.webp', location: 'Residential Street', role: 'General store owner',
    summary: 'Ka Ching owns the general store in Residential Street.',
    gifts: 'No favorite gifts are currently listed in the NPC database.',
    function: 'General store',
    details: [
      ['Where to look', 'Residential Street. Use the in-game map NPC icon for the exact general-store position.'],
      ['Shop focus', 'The current NPC listing includes a Drawing Board. Check the in-game shop for current availability and price.'],
      ['Useful route', 'Use Ka Ching for general-store needs, then open the Drawing Board guide if you are making a design.']
    ],
    links: [['/guides/painting-tools/', 'Drawing Board guide'], ['/guides/gallery/', 'Gallery guide'], ['/guides/npc-locations/', 'All NPC locations']]
  },
  'mrs-joan': {
    name: 'Mrs. Joan', image: 'Mrs.-Joan.webp', location: 'Central Square', role: 'Pet store owner',
    summary: 'Mrs. Joan runs the pet store in Central Square and carries animal food items.',
    gifts: 'No favorite gifts are currently listed in the NPC database.',
    function: 'Pet supplies',
    details: [
      ['Where to look', 'Central Square. Use the in-game map NPC icon when you need the exact pet-store position.'],
      ['Shop focus', 'The current listing includes Universal Animal Food, Dog Food, Energy Dog Food, Cat Food, and Energy Fish Jerky.'],
      ['Useful route', 'Check pet food needs before buying, then open the pet-food guide for species and favorite-food context.']
    ],
    links: [['/guides/pet-favorite-food/', 'Pet favorite food guide'], ['/hobbies/cat-care/favorite-food/', 'Cat favorite food'], ['/hobbies/dog-care/breeds/', 'Dog breeds']]
  },
  'bailey-j': {
    name: 'Bailey J', image: 'Bailey-J.webp', location: 'Central Square', role: 'Bird expert',
    summary: 'Bailey J is the bird expert who supports observations and bird-related supplies.',
    gifts: 'Bird photographs are listed as favorites.',
    function: 'Bird-observation supplies',
    details: [
      ['Where to look', 'Central Square. Use the in-game map NPC icon for the exact position.'],
      ['Shop focus', 'The current listing includes Camouflage Bush, Bird Food, and Auto Bird Whistle.'],
      ['Useful route', 'Visit Bailey J before a bird-observation session, then use the bird database to track the species you still need.']
    ],
    links: [['/database/birds/', 'Bird database'], ['/guides/bird-locations/', 'Bird locations'], ['/tools/my-progress/', 'My Progress']]
  },
  bill: {
    name: 'Bill', image: 'Bill.webp', location: 'Fishing Village Square', role: 'Advanced fishing mentor',
    summary: 'Bill is the advanced fishing mentor at Fishing Village Square and focuses on sea fishing.',
    gifts: 'Fish and seafood are listed as favorites.',
    function: 'Sea-fishing guidance',
    details: [
      ['Where to look', 'Fishing Village Square. Use the in-game map NPC icon for the exact position.'],
      ['What he does', 'The current NPC listing identifies Bill as the advanced fishing mentor and an expert in sea fishing.'],
      ['Useful route', 'Use Bill as the sea-fishing reference point, then check the fish database and sea-fishing event guide for your target.']
    ],
    links: [['/events/sea-fishing/', 'Sea fishing event'], ['/database/fish/', 'Fish database'], ['/guides/fish-locations/', 'Fish locations']]
  },
};

const legacy = {
  will: { name: 'Will', old: 'Earlier versions of this page described a Lighthouse-area resident.', links: [['/npcs/', 'Current NPC database'], ['/guides/npc-locations/', 'NPC locations']] },
  vernie: { name: 'Vernie', old: 'Earlier versions of this page described a Flower Fields story NPC.', links: [['/npcs/', 'Current NPC database'], ['/hobbies/instruments/', 'Instrument guide']] }
};

function adScript() {
  return `<script>if(window.nitroAds){window.nitroAds.createAd('heartopia_anchor',{format:'anchor-v2',anchor:'bottom',anchorClose:true,mediaQuery:'(max-width:1024px)'});window.nitroAds.createAd('heartopia_side_rail',{format:'rail',rail:'right',railStickyTop:70,mediaQuery:'(min-width:1025px)'});window.nitroAds.createAd('heartopia_floating_video',{format:'floating',mediaQuery:'(min-width:1025px)'});['heartopia_in_content','heartopia_in_content_2'].forEach(id=>window.nitroAds.createAd(id,{format:'display',sizes:[[970,90],[970,250],[728,90],[300,250],[320,100],[320,50]],collapseEmpty:true,renderVisibleOnly:true,visibleMargin:800}))}</script>`;
}

function pageShell({ title, description, canonical, jsonLd, body }) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><script async src="https://www.googletagmanager.com/gtag/js?id=G-FRJ91G3VRR"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-FRJ91G3VRR');</script><script data-cfasync="false">window.nitroAds=window.nitroAds||{createAd:function(){return new Promise(e=>{window.nitroAds.queue.push(['createAd',arguments,e])})},addUserToken:function(){window.nitroAds.queue.push(['addUserToken',arguments])},queue:[]};</script><script data-cfasync="false" async src="https://s.nitropay.com/ads-2368.js"></script><script src="https://cdn.tailwindcss.com"></script><script>tailwind.config={theme:{extend:{colors:{cozy:{cream:'#FFF8F0',peach:'#FFE5D9',coral:'#FF9B85',sage:'#A8C686',mint:'#B8E0D2',sky:'#95C8D8',wood:'#8B7355',bark:'#5D4E37'}},fontFamily:{display:['Georgia','serif'],body:['system-ui','sans-serif']}}}}</script><link rel="icon" href="/favicon.ico"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${canonical}"><meta property="og:type" content="article"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${canonical}"><meta property="og:site_name" content="Heartopia.Life"><meta name="twitter:card" content="summary_large_image"><script type="application/ld+json">${JSON.stringify(jsonLd)}</script><style>html{scroll-behavior:smooth}.ad-slot{min-height:90px}</style></head><body class="bg-cozy-cream text-cozy-bark font-body"><header class="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-cozy-peach/50"><nav class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between"><a href="/" class="flex items-center gap-2"><img src="/favicon-96x96.png" alt="Heartopia.Life" class="w-7 h-7"><span class="font-display text-xl font-bold">Heartopia<span class="text-cozy-sage">.Life</span></span></a><div class="hidden md:flex gap-6 text-sm font-medium"><a href="/database/" class="hover:text-cozy-coral">Database</a><a href="/guides/map/" class="hover:text-cozy-coral">Map</a><a href="/guides/" class="hover:text-cozy-coral">Guides</a><a href="/npcs/" class="text-cozy-coral font-bold">NPCs</a><a href="/tools/my-progress/" class="hover:text-cozy-coral">My Progress</a></div></nav></header>${body}<footer class="bg-cozy-bark text-white py-10 mt-12"><div class="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-6 text-sm"><div><a href="/" class="font-display text-xl font-bold">Heartopia<span class="text-cozy-sage">.Life</span></a><p class="text-white/70 mt-2">Unofficial fan guide for Heartopia players.</p></div><div><h2 class="font-bold mb-2">Explore</h2><p class="text-white/70"><a href="/npcs/" class="hover:text-white">NPC database</a> · <a href="/guides/npc-locations/" class="hover:text-white">NPC locations</a></p></div><div><h2 class="font-bold mb-2">Tools</h2><p class="text-white/70"><a href="/guides/map/" class="hover:text-white">Map</a> · <a href="/tools/my-progress/" class="hover:text-white">My Progress</a></p></div></div></footer>${adScript()}</body></html>`;
}

function buildPerson(slug, person) {
  fs.mkdirSync(path.join(root, 'npcs', slug), { recursive: true });
  const canonical = `https://heartopia.life/npcs/${slug}/`;
  const title = `Heartopia ${person.name}: ${person.location} ${person.role} Guide`;
  const description = `Find ${person.name} in Heartopia: ${person.location} location, ${person.role.toLowerCase()} role, confirmed function, favorite-gift note, and related guides.`;
  const faq = person.details.map(([question, answer]) => ({ '@type': 'Question', name: `${person.name}: ${question}`, acceptedAnswer: { '@type': 'Answer', text: answer } }));
  const jsonLd = { '@context': 'https://schema.org', '@graph': [{ '@type': 'Article', headline: title, description, url: canonical, image: `https://heartopia.life/img/npcs/${person.image}`, dateModified: today, author: { '@type': 'Organization', name: 'Heartopia.Life' }, publisher: { '@type': 'Organization', name: 'Heartopia.Life' } }, { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://heartopia.life/' }, { '@type': 'ListItem', position: 2, name: 'NPCs', item: 'https://heartopia.life/npcs/' }, { '@type': 'ListItem', position: 3, name: person.name, item: canonical }] }, { '@type': 'FAQPage', mainEntity: faq }] };
  const detailCards = person.details.map(([heading, content]) => `<section class="rounded-xl bg-cozy-cream p-5 border border-cozy-peach/40"><h2 class="font-display text-xl font-bold mb-2">${esc(heading)}</h2><p class="text-cozy-wood leading-relaxed">${esc(content)}</p></section>`).join('');
  const links = person.links.map(([href, label]) => `<a href="${href}" class="rounded-xl border border-cozy-peach/50 bg-white px-4 py-3 font-bold text-cozy-coral hover:border-cozy-coral">${esc(label)}</a>`).join('');
  const body = `<main class="max-w-5xl mx-auto px-4 py-8"><nav class="text-sm text-cozy-wood mb-6"><a href="/" class="hover:text-cozy-coral">Home</a><span class="mx-2">/</span><a href="/npcs/" class="hover:text-cozy-coral">NPCs</a><span class="mx-2">/</span><span class="font-medium text-cozy-bark">${esc(person.name)}</span></nav><section class="bg-white rounded-2xl p-6 md:p-8 border border-cozy-peach/40 grid md:grid-cols-[240px_1fr] gap-7 items-center mb-8"><div class="aspect-square rounded-xl bg-cozy-mint/20 p-5"><img src="/img/npcs/${person.image}" alt="${esc(person.name)} Heartopia NPC portrait" class="h-full w-full object-contain" fetchpriority="high"></div><div><p class="text-sm font-bold text-cozy-sage mb-2">Updated July 13, 2026</p><h1 class="font-display text-3xl md:text-4xl font-bold mb-3">Heartopia ${esc(person.name)}</h1><p class="text-lg text-cozy-wood mb-5">${esc(person.summary)}</p><div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm"><div class="rounded-lg bg-cozy-cream p-3"><b>Location</b><br>${esc(person.location)}</div><div class="rounded-lg bg-blue-50 p-3"><b>Role</b><br>${esc(person.role)}</div><div class="rounded-lg bg-green-50 p-3"><b>Function</b><br>${esc(person.function)}</div><div class="rounded-lg bg-amber-50 p-3"><b>Gift note</b><br>${esc(person.gifts)}</div></div></div></section><section class="grid md:grid-cols-3 gap-5 mb-8">${detailCards}</section><div id="heartopia_in_content" class="ad-slot my-6 text-center"></div><section class="rounded-2xl bg-white p-6 border border-cozy-peach/40 mb-8"><h2 class="font-display text-2xl font-bold mb-3">Use the Map for Exact Position</h2><p class="text-cozy-wood leading-relaxed">NPC positions can vary with quest state, event state, or updates. For the exact spot in your current session, open the in-game map and select ${esc(person.name)}\'s icon. This page keeps the stable role and area information in one place.</p></section><section class="rounded-2xl bg-cozy-mint/20 p-6 border border-cozy-mint"><h2 class="font-display text-xl font-bold mb-4">Related Heartopia Pages</h2><div class="grid sm:grid-cols-3 gap-3">${links}</div></section><div id="heartopia_in_content_2" class="ad-slot my-6 text-center"></div></main>`;
  fs.writeFileSync(path.join(root, 'npcs', slug, 'index.html'), pageShell({ title, description, canonical, jsonLd, body }));
}

function buildLegacy(slug, person) {
  const canonical = `https://heartopia.life/npcs/${slug}/`;
  const title = `Heartopia ${person.name}: Current NPC Listing Check`;
  const description = `Current listing check for ${person.name} in Heartopia. Use the live NPC database and in-game map for confirmed character information.`;
  const jsonLd = { '@context': 'https://schema.org', '@type': 'Article', headline: title, description, url: canonical, dateModified: today, author: { '@type': 'Organization', name: 'Heartopia.Life' } };
  const links = person.links.map(([href, label]) => `<a href="${href}" class="rounded-xl border border-cozy-peach/50 bg-white px-4 py-3 font-bold text-cozy-coral hover:border-cozy-coral">${esc(label)}</a>`).join('');
  const body = `<main class="max-w-4xl mx-auto px-4 py-8"><nav class="text-sm text-cozy-wood mb-6"><a href="/" class="hover:text-cozy-coral">Home</a><span class="mx-2">/</span><a href="/npcs/" class="hover:text-cozy-coral">NPCs</a><span class="mx-2">/</span><span class="font-medium text-cozy-bark">${esc(person.name)}</span></nav><section class="bg-white rounded-2xl p-6 md:p-8 border border-cozy-peach/40"><p class="text-sm font-bold text-amber-700 mb-2">Listing status checked July 13, 2026</p><h1 class="font-display text-3xl md:text-4xl font-bold mb-4">Heartopia ${esc(person.name)}: Listing Check</h1><p class="text-cozy-wood text-lg leading-relaxed">${esc(person.old)} The current 19-character NPC listing does not include ${esc(person.name)}. We have removed unverified location, gift, unlock, and quest claims from this page rather than presenting them as current game facts.</p><div class="mt-6 rounded-xl bg-amber-50 border border-amber-200 p-5 text-cozy-wood"><strong class="text-cozy-bark">What to do in game:</strong> use the current in-game map and quest tracker. If a future official update confirms this character, this page can be restored with a local portrait and confirmed details.</div></section><div id="heartopia_in_content" class="ad-slot my-6 text-center"></div><section class="rounded-2xl bg-cozy-mint/20 p-6 border border-cozy-mint"><h2 class="font-display text-xl font-bold mb-4">Use Confirmed Pages Instead</h2><div class="grid sm:grid-cols-2 gap-3">${links}</div></section></main>`;
  fs.writeFileSync(path.join(root, 'npcs', slug, 'index.html'), pageShell({ title, description, canonical, jsonLd, body }));
}


function buildKaChingGuide() {
  const canonical = 'https://heartopia.life/guides/ka-ching/';
  const title = 'Heartopia Ka Ching: Residential Street General Store Guide';
  const description = 'Find Ka Ching in Heartopia: Residential Street location, general-store role, local NPC portrait, and safe shopping guidance.';
  const jsonLd = { '@context': 'https://schema.org', '@graph': [{ '@type': 'Article', headline: title, description, url: canonical, image: 'https://heartopia.life/img/npcs/Ka-Ching.webp', dateModified: today, author: { '@type': 'Organization', name: 'Heartopia.Life' } }, { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://heartopia.life/' }, { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://heartopia.life/guides/' }, { '@type': 'ListItem', position: 3, name: 'Ka Ching', item: canonical }] }] };
  const body = `<main class="max-w-5xl mx-auto px-4 py-8"><nav class="text-sm text-cozy-wood mb-6"><a href="/" class="hover:text-cozy-coral">Home</a><span class="mx-2">/</span><a href="/guides/" class="hover:text-cozy-coral">Guides</a><span class="mx-2">/</span><span class="font-medium text-cozy-bark">Ka Ching</span></nav><section class="bg-white rounded-2xl p-6 md:p-8 border border-cozy-peach/40 grid md:grid-cols-[240px_1fr] gap-7 items-center mb-8"><div class="aspect-square rounded-xl bg-cozy-mint/20 p-5"><img src="/img/npcs/Ka-Ching.webp" alt="Ka Ching Heartopia NPC portrait" class="h-full w-full object-contain" fetchpriority="high"></div><div><p class="text-sm font-bold text-cozy-sage mb-2">Updated July 13, 2026</p><h1 class="font-display text-3xl md:text-4xl font-bold mb-3">Heartopia Ka Ching</h1><p class="text-lg text-cozy-wood mb-5">Ka Ching is the owner of the general store in Residential Street. Visit her when an active quest or your in-game map points you to the general store.</p><div class="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm"><div class="rounded-lg bg-cozy-cream p-3"><b>Location</b><br>Residential Street</div><div class="rounded-lg bg-blue-50 p-3"><b>Role</b><br>General store owner</div><div class="rounded-lg bg-amber-50 p-3"><b>Gift note</b><br>Not currently listed</div></div></div></section><section class="grid md:grid-cols-3 gap-5 mb-8"><section class="rounded-xl bg-cozy-cream p-5 border border-cozy-peach/40"><h2 class="font-display text-xl font-bold mb-2">Where to Find Ka Ching</h2><p class="text-cozy-wood leading-relaxed">Use the NPC icon on the in-game map for Ka Ching's exact position in Residential Street. That is more reliable than old landmark directions after updates or event changes.</p></section><section class="rounded-xl bg-cozy-cream p-5 border border-cozy-peach/40"><h2 class="font-display text-xl font-bold mb-2">General Store Stock</h2><p class="text-cozy-wood leading-relaxed">The current NPC directory confirms the general-store role, but does not publish a stable full stock list. Check the shop in game before planning currency or a specific purchase.</p></section><section class="rounded-xl bg-cozy-cream p-5 border border-cozy-peach/40"><h2 class="font-display text-xl font-bold mb-2">Gift & Quest Note</h2><p class="text-cozy-wood leading-relaxed">No confirmed favorite gifts are currently listed. Use the Friendship Journal and your active quest tracker instead of treating old gift tables as fixed.</p></section></section><div id="heartopia_in_content" class="ad-slot my-6 text-center"></div><section class="rounded-2xl bg-cozy-mint/20 p-6 border border-cozy-mint"><h2 class="font-display text-xl font-bold mb-4">Related Heartopia Pages</h2><div class="grid sm:grid-cols-3 gap-3"><a href="/npcs/" class="rounded-xl border border-cozy-peach/50 bg-white px-4 py-3 font-bold text-cozy-coral hover:border-cozy-coral">NPC database</a><a href="/guides/npc-locations/" class="rounded-xl border border-cozy-peach/50 bg-white px-4 py-3 font-bold text-cozy-coral hover:border-cozy-coral">NPC locations</a><a href="/guides/map/" class="rounded-xl border border-cozy-peach/50 bg-white px-4 py-3 font-bold text-cozy-coral hover:border-cozy-coral">Map & location finder</a></div></section><div id="heartopia_in_content_2" class="ad-slot my-6 text-center"></div></main>`;
  fs.writeFileSync(path.join(root, 'guides', 'ka-ching', 'index.html'), pageShell({ title, description, canonical, jsonLd, body }));
}

function buildGuide() {
  const npcs = [
    ['Albert Jr.', 'Albert-Jr.webp', 'Suburbs', 'Merchant'], ['Andrew', 'Andrew.webp', 'Suburbs', 'Driving mentor'], ['Annie', 'Annie.webp', 'Central Square', 'Town guide'], ['Atara', 'Atara.webp', 'Central Square', 'Mayor', '/npcs/atara/'], ['Azure', 'Azure.webp', 'Central Square', 'Winter saleswoman'], ['Bailey J', 'Bailey-J.webp', 'Central Square', 'Bird expert', '/npcs/bailey-j/'], ['Bill', 'Bill.webp', 'Fishing Village Square', 'Advanced fishing mentor', '/npcs/bill/'], ['Blanc', 'Blanc.webp', 'Central Square', 'Gardening mentor', '/npcs/blanc/'], ['Bob', 'Bob.webp', 'Central Square', 'Artisan'], ['Cassie', 'Cassie.webp', 'Forest Jump Puzzle', 'Park ranger'], ['Doris', 'Doris.webp', 'Suburbs', 'Secret Merchant', '/npcs/doris/'], ['Dorothee', 'Dorothee.webp', 'Central Square', 'Fashion designer', '/npcs/dorothee/'], ['Eric', 'Eric.webp', 'Onsen', 'Park manager', '/npcs/eric/'], ['Ka Ching', 'Ka-Ching.webp', 'Residential Street', 'General store owner', '/npcs/ka-ching/'], ['Massimo', 'Massimo.webp', 'Central Square', 'Cooking mentor', '/npcs/massimo/'], ['Mrs. Joan', 'Mrs.-Joan.webp', 'Central Square', 'Pet store owner', '/npcs/mrs-joan/'], ['Naniwa', 'Naniwa.webp', 'Deer Tower', 'Entomologist', '/npcs/naniwa/'], ['Patti', 'Patti.webp', 'Deer Tower', 'Ranger'], ['Vanya', 'Vanya.webp', 'Residential Street', 'Fishing mentor', '/npcs/vanya/']
  ];
  const cards = npcs.map(([name, image, location, role, page]) => `<article class="bg-white rounded-xl p-4 border border-cozy-peach/40 flex gap-4"><img src="/img/npcs/${image}" alt="${name} NPC portrait" class="w-20 h-20 object-contain rounded-lg bg-cozy-cream p-1 shrink-0" loading="lazy"><div class="min-w-0"><p class="text-xs font-bold text-cozy-sage">${location}</p><h2 class="font-bold text-lg mt-1">${name}</h2><p class="text-sm text-cozy-wood mt-1">${role}</p>${page ? `<a href="${page}" class="inline-block mt-3 text-sm font-bold text-cozy-coral hover:underline">Open ${name} guide</a>` : '<p class="mt-3 text-xs text-cozy-wood">Use the in-game map for the exact position.</p>'}</div></article>`).join('');
  const canonical = 'https://heartopia.life/guides/npc-locations/';
  const title = 'Heartopia NPC Locations: All 19 Characters, Roles & Shops';
  const description = 'Find all 19 registered Heartopia NPCs by area and role, with local portraits, direct detail links, and map-based location advice.';
  const jsonLd = { '@context': 'https://schema.org', '@type': 'Article', headline: title, description, url: canonical, dateModified: today, author: { '@type': 'Organization', name: 'Heartopia.Life' } };
  const body = `<main class="max-w-6xl mx-auto px-4 py-8"><nav class="text-sm text-cozy-wood mb-6"><a href="/" class="hover:text-cozy-coral">Home</a><span class="mx-2">/</span><a href="/guides/" class="hover:text-cozy-coral">Guides</a><span class="mx-2">/</span><span class="font-medium text-cozy-bark">NPC Locations</span></nav><section class="bg-white rounded-2xl p-6 md:p-8 border border-cozy-peach/40 mb-8"><p class="text-sm font-bold text-cozy-sage mb-2">Updated July 13, 2026</p><h1 class="font-display text-3xl md:text-4xl font-bold mb-3">Heartopia NPC Locations: All 19 Characters</h1><p class="text-lg text-cozy-wood max-w-4xl">Use this quick roster to find the stable area and role for every currently registered NPC. For the exact spot in your session, use the in-game map NPC icon because active quests and events can affect where you see a character.</p></section><section class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"><div class="bg-white rounded-xl border border-cozy-peach p-4 text-center"><b class="text-2xl text-cozy-coral">19</b><p class="text-xs text-cozy-wood">Registered NPCs</p></div><div class="bg-white rounded-xl border border-cozy-peach p-4 text-center"><b class="text-2xl text-cozy-sage">7</b><p class="text-xs text-cozy-wood">Areas</p></div><div class="bg-white rounded-xl border border-cozy-peach p-4 text-center"><b class="text-2xl text-cozy-sky">4</b><p class="text-xs text-cozy-wood">Hobby mentors</p></div><div class="bg-white rounded-xl border border-cozy-peach p-4 text-center"><b class="text-2xl text-violet-600">1</b><p class="text-xs text-cozy-wood">Weather merchant</p></div></section><section class="rounded-2xl bg-cozy-mint/20 border border-cozy-mint p-6 mb-8"><h2 class="font-display text-2xl font-bold mb-3">Fastest Way to Find an NPC</h2><ol class="list-decimal list-inside space-y-2 text-cozy-wood"><li>Open the in-game map.</li><li>Select or hover the NPC icon for the character you need.</li><li>Use this page to confirm the character's role and which guide or database to open next.</li></ol></section><div id="heartopia_in_content" class="ad-slot my-6 text-center"></div><section class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">${cards}</section><div id="heartopia_in_content_2" class="ad-slot my-8 text-center"></div><section class="grid md:grid-cols-3 gap-4"><a href="/npcs/" class="rounded-xl bg-white border border-cozy-peach p-5"><h2 class="font-bold">NPC database</h2><p class="text-sm text-cozy-wood mt-1">Filter all characters by location and role.</p></a><a href="/guides/map/" class="rounded-xl bg-white border border-cozy-peach p-5"><h2 class="font-bold">Map & location finder</h2><p class="text-sm text-cozy-wood mt-1">Plan resource and NPC routes.</p></a><a href="/tools/my-progress/" class="rounded-xl bg-white border border-cozy-peach p-5"><h2 class="font-bold">My Progress</h2><p class="text-sm text-cozy-wood mt-1">Keep your local collection progress together.</p></a></section></main>`;
  fs.writeFileSync(path.join(root, 'guides', 'npc-locations', 'index.html'), pageShell({ title, description, canonical, jsonLd, body }));
}

for (const [slug, person] of Object.entries(people)) buildPerson(slug, person);
for (const [slug, person] of Object.entries(legacy)) buildLegacy(slug, person);
buildGuide();
buildKaChingGuide();

const sitemapPath = path.join(root, 'sitemap.xml');
let sitemap = fs.readFileSync(sitemapPath, 'utf8');
for (const url of ['/guides/npc-locations/', '/guides/ka-ching/', ...Object.keys(people).map((slug) => `/npcs/${slug}/`), ...Object.keys(legacy).map((slug) => `/npcs/${slug}/`)]) {
  const expression = new RegExp(`(<loc>https://heartopia.life${url.replace(/[.*+?^${}()|[\]]/g, '$&')}</loc>s*<lastmod>)[^<]+`, 'g');
  sitemap = sitemap.replace(expression, `$1${today}`);
}
fs.writeFileSync(sitemapPath, sitemap);

