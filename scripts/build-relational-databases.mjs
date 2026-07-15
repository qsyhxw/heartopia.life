import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const write = (file, value) => {
    const target = path.join(root, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, value);
};
const esc = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
const norm = (value) => String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
const slug = (value) => norm(value).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const formatDate = (value) => new Intl.DateTimeFormat('en-US', {
    month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC'
}).format(new Date(`${value}T00:00:00Z`));
const currentBuildDate = '2026-07-15';
const latestDate = (...values) => values.filter(value => /^\d{4}-\d{2}-\d{2}$/.test(value || '')).sort().at(-1) || currentBuildDate;

function pageStart({ title, description, canonical, h1, intro, date, heroClass, sectionName, storageKey, entityType, socialImage }) {
    const schema = JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
            { '@type': 'CollectionPage', name: title, description, url: canonical, dateModified: date },
            {
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://heartopia.life/' },
                    { '@type': 'ListItem', position: 2, name: 'Database', item: 'https://heartopia.life/database/' },
                    { '@type': 'ListItem', position: 3, name: sectionName, item: canonical }
                ]
            }
        ]
    });
    return `<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-FRJ91G3VRR"></script>
    <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-FRJ91G3VRR');</script>
    <script data-cfasync="false">window.nitroAds=window.nitroAds||{createAd:function(){return new Promise(e=>{window.nitroAds.queue.push(['createAd',arguments,e])})},addUserToken:function(){window.nitroAds.queue.push(['addUserToken',arguments])},queue:[]};</script>
    <script data-cfasync="false" async src="https://s.nitropay.com/ads-2368.js"></script>
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}">
    <meta name="robots" content="index,follow">
    <link rel="canonical" href="${canonical}">
    <meta property="og:type" content="website">
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(description)}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:site_name" content="Heartopia.Life">
    <meta property="og:image" content="https://heartopia.life${esc(socialImage)}">
    <meta property="og:image:alt" content="${esc(h1)}">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="${esc(title)}">
    <meta name="twitter:description" content="${esc(description)}">
    <meta name="twitter:image" content="https://heartopia.life${esc(socialImage)}">
    <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96">
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link rel="shortcut icon" href="/favicon.ico">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="manifest" href="/site.webmanifest">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>tailwind.config={theme:{extend:{colors:{cozy:{cream:'#FFF8F0',peach:'#FFE5D9',coral:'#FF9B85',sage:'#A8C686',mint:'#B8E0D2',sky:'#95C8D8',wood:'#8B7355',bark:'#5D4E37'}},fontFamily:{display:['Georgia','serif'],body:['system-ui','-apple-system','sans-serif']}}}}</script>
    <style>
        html{scroll-behavior:smooth}.relation-card{transition:border-color .16s ease,box-shadow .16s ease}.relation-card:hover{border-color:rgba(255,155,133,.72);box-shadow:0 8px 18px rgba(93,78,55,.09)}.relation-card[hidden]{display:none}.relation-detail summary{cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:.75rem;list-style:none}.relation-detail summary::-webkit-details-marker{display:none}.relation-toggle::before{content:'+';font-size:1rem}.relation-detail[open] .relation-toggle::before{content:'-'}
    </style>
    <script type="application/ld+json">${schema}</script>
</head>
<body class="bg-cozy-cream text-cozy-bark font-body">
<header class="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-cozy-peach/50">
    <nav class="max-w-6xl mx-auto px-4 py-3">
        <div class="flex items-center justify-between gap-4">
            <a href="/" class="flex items-center gap-2 shrink-0" aria-label="Heartopia.Life Home"><img src="/favicon-96x96.png" alt="Heartopia.Life" class="w-7 h-7"><span class="font-display text-xl font-bold">Heartopia<span class="text-cozy-sage">.Life</span></span></a>
            <ul class="hidden md:flex items-center gap-5 text-sm font-medium"><li><a href="/guides/map/" class="hover:text-cozy-coral">Map</a></li><li><a href="/codes/" class="hover:text-cozy-coral">Codes</a></li><li><a href="/guides/" class="hover:text-cozy-coral">Guides</a></li><li><a href="/hobbies/" class="hover:text-cozy-coral">Hobbies</a></li><li><a href="/events/" class="hover:text-cozy-coral">Events</a></li><li><a href="/database/" class="font-bold text-cozy-coral">Database</a></li><li><a href="/tools/" class="hover:text-cozy-coral">Tools</a></li><li><a href="/tools/search/" class="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-cozy-peach/50" aria-label="Search the Heartopia database" title="Search"><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-4.35-4.35m2.1-5.4a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" /></svg><span class="sr-only">Search</span></a></li></ul>
            <button type="button" class="md:hidden p-2 hover:bg-cozy-peach/50 rounded-md" aria-label="Open menu" aria-controls="mobile-menu" onclick="document.getElementById('mobile-menu').classList.toggle('hidden')"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg></button>
        </div>
        <div id="mobile-menu" class="hidden md:hidden mt-4 pb-4 border-t border-cozy-peach/50 pt-4"><ul class="flex flex-col gap-3 text-sm font-medium"><li><a href="/guides/map/" class="block py-2 hover:text-cozy-coral">Map</a></li><li><a href="/codes/" class="block py-2 hover:text-cozy-coral">Codes</a></li><li><a href="/guides/" class="block py-2 hover:text-cozy-coral">Guides</a></li><li><a href="/hobbies/" class="block py-2 hover:text-cozy-coral">Hobbies</a></li><li><a href="/events/" class="block py-2 hover:text-cozy-coral">Events</a></li><li><a href="/database/" class="block py-2 font-bold text-cozy-coral">Database</a></li><li><a href="/tools/" class="block py-2 hover:text-cozy-coral">Tools</a></li><li><a href="/tools/search/" class="block py-2 hover:text-cozy-coral">Search</a></li></ul></div>
    </nav>
</header>
<main data-relational-hub data-storage-key="${esc(storageKey)}" data-entity-type="${esc(entityType)}" class="max-w-6xl mx-auto px-4 py-8">
    <nav class="text-sm text-cozy-wood mb-6"><a href="/" class="hover:text-cozy-coral">Home</a><span class="mx-2">/</span><a href="/database/" class="hover:text-cozy-coral">Database</a><span class="mx-2">/</span><span>${esc(sectionName)}</span></nav>
    <section class="${heroClass} rounded-2xl p-6 md:p-8 mb-8">
        <p class="text-sm font-bold text-cozy-sage mb-3">Updated ${formatDate(date)}</p>
        <h1 class="font-display text-3xl md:text-4xl font-bold mb-3">${esc(h1)}</h1>
        <p class="text-cozy-wood text-lg max-w-3xl">${esc(intro)}</p>
    </section>`;
}

function pageEnd(relatedLinks) {
    return `
    <div id="heartopia_in_content_2" class="my-8 text-center"></div>
    <section class="border-t border-cozy-peach/60 pt-7 mt-8">
        <h2 class="font-display text-2xl font-bold mb-4">Related tools and databases</h2>
        <div class="grid md:grid-cols-3 gap-4">${relatedLinks.map(link => `<a href="${link.href}" class="block border-b-2 border-cozy-peach bg-white px-5 py-4 hover:border-cozy-coral"><strong>${esc(link.title)}</strong><span class="block text-sm text-cozy-wood mt-1">${esc(link.description)}</span></a>`).join('')}</div>
    </section>
</main>
<footer class="bg-cozy-bark text-white py-8 mt-12"><div class="max-w-6xl mx-auto grid gap-6 px-4 text-sm md:grid-cols-3"><div><a href="/" class="font-display text-xl font-bold">Heartopia<span class="text-cozy-sage">.Life</span></a><p class="text-white/65 mt-2">Unofficial fan guide. Check current in-game shops, schedules, and values before spending limited currency.</p></div><div><strong>Database</strong><p class="text-white/65 mt-2"><a href="/database/recipes/">Recipes</a> · <a href="/database/ingredients/">Ingredients</a> · <a href="/database/items/">Items</a></p></div><div><strong>Tools</strong><p class="text-white/65 mt-2"><a href="/tools/search/">Universal Search</a> · <a href="/tools/my-progress/">My Progress</a></p></div></div></footer>
<script src="/assets/js/relational-database.js?v=20260715"></script>
<script>if(window.nitroAds){window.nitroAds.createAd('heartopia_anchor',{format:'anchor-v2',anchor:'bottom',mediaQuery:'(max-width:1024px)'});window.nitroAds.createAd('heartopia_side_rail',{format:'rail',rail:'right',railStickyTop:70,mediaQuery:'(min-width:1025px)'});window.nitroAds.createAd('heartopia_floating_video',{format:'floating',mediaQuery:'(min-width:1025px)'});['heartopia_in_content','heartopia_in_content_2'].forEach(id=>window.nitroAds.createAd(id,{format:'display',sizes:[[970,90],[970,250],[728,90],[300,250],[320,100],[320,50]],collapseEmpty:true,renderVisibleOnly:true,visibleMargin:800}))}</script>
</body></html>`;
}

function options(values) {
    return values.map(value => `<option value="${esc(value)}">${esc(value)}</option>`).join('');
}

function allFilterLabel(label) {
    return ({ Category: 'categories', Seller: 'sellers', Type: 'types', 'Planting window': 'planting windows', Location: 'locations', Availability: 'availability' })[label] || label.toLowerCase();
}

function stats(items) {
    return `<section class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">${items.map(item => `<div class="bg-white border-b-2 border-cozy-peach p-4"><strong class="block text-2xl ${item.color}">${esc(item.value)}</strong><span class="text-xs text-cozy-wood">${esc(item.label)}</span></div>`).join('')}</section>`;
}

function controls({ searchPlaceholder, filters, sortOptions }) {
    return `<section class="bg-white border border-cozy-peach/50 p-5 md:p-6 mb-8">
        <div class="flex flex-wrap items-end justify-between gap-4">
            <div><h2 class="font-display text-2xl font-bold">Search and compare</h2><p class="text-sm text-cozy-wood mt-1">Open a record to see its connected recipes, source, use, or availability.</p></div>
            <button type="button" data-clear-saved class="rounded-md border border-cozy-peach/70 px-4 py-2 text-sm font-bold text-cozy-wood hover:border-cozy-coral">Clear saved marks</button>
        </div>
        <div class="grid md:grid-cols-2 lg:grid-cols-${Math.min(5, filters.length + 2)} gap-3 mt-5">
            <label><span class="block text-xs font-bold text-cozy-wood mb-1">Search</span><input data-relation-search type="search" placeholder="${esc(searchPlaceholder)}" class="w-full rounded-md border border-cozy-peach/60 bg-cozy-cream px-4 py-3 text-sm"></label>
            ${filters.map(filter => `<label><span class="block text-xs font-bold text-cozy-wood mb-1">${esc(filter.label)}</span><select data-relation-filter class="w-full rounded-md border border-cozy-peach/60 bg-white px-3 py-3 text-sm"><option value="all">All ${esc(allFilterLabel(filter.label))}</option>${options(filter.values)}</select></label>`).join('')}
            <label><span class="block text-xs font-bold text-cozy-wood mb-1">Sort</span><select data-relation-sort class="w-full rounded-md border border-cozy-peach/60 bg-white px-3 py-3 text-sm">${sortOptions.map(option => `<option value="${option.value}">${esc(option.label)}</option>`).join('')}</select></label>
        </div>
        <p class="text-sm text-cozy-wood mt-4"><strong data-visible-count>0</strong> records shown · <strong data-saved-count>0</strong> saved in this browser</p>
    </section>`;
}

function markButton(key, inactiveLabel, activeLabel) {
    return `<button type="button" data-save-record data-record-key="${esc(key)}" data-inactive-label="${esc(inactiveLabel)}" data-active-label="${esc(activeLabel)}" aria-pressed="false" class="mt-4 rounded-md border border-cozy-peach/70 px-3 py-2 text-xs font-bold text-cozy-wood">${esc(inactiveLabel)}</button>`;
}

function recipeLinks(names) {
    if (!names.length) return '<p class="text-sm text-cozy-wood">No named recipe connection appears in the current recipe index.</p>';
    return `<div class="flex flex-wrap gap-2">${names.map(name => `<a href="/database/recipes/?search=${encodeURIComponent(name)}" class="rounded-full border border-cozy-peach/70 bg-white px-3 py-1 text-xs font-bold text-cozy-coral hover:border-cozy-coral">${esc(name)}</a>`).join('')}</div>`;
}

function relationCardAttributes({ name, key, search, filters, sortValue, relations }) {
    return `data-relation-card data-record-key="${esc(key)}" data-name="${esc(name)}" data-search="${esc(norm(search))}" ${filters.map((value, index) => `data-filter-${index + 1}="${esc(value)}"`).join(' ')} data-sort-value="${Number.isFinite(sortValue) ? sortValue : -1}" data-relations="${relations || 0}"`;
}

const sellerPaths = {
    'Naniwa': '/npcs/naniwa/', 'Vanya': '/npcs/vanya/', 'Blanc': '/npcs/blanc/', 'Bailey J': '/npcs/bailey-j/',
    'Joan': '/npcs/mrs-joan/', 'Massimo': '/npcs/massimo/', 'Ka Ching': '/npcs/ka-ching/'
};
const activityPaths = {
    'Bug Catching': '/hobbies/insect-catching/', Fishing: '/hobbies/fishing/', Gardening: '/hobbies/gardening/',
    Birdwatching: '/hobbies/birdwatching/', Pets: '/database/pets/', Cooking: '/database/recipes/', General: '/guides/painting-tools/'
};
const itemUses = {
    'Inflatable Insect Attractor': 'A bug-catching supply used with insect-attractor setups.',
    'Mermaid Fish Attractor': 'A fishing supply used with fish-attractor setups.',
    'Growth Booster': 'A gardening booster for crop-growth routines.',
    'Quality Growth Booster': 'A higher-tier gardening booster for crop-growth routines.',
    'Camouflage Bush': 'Creates camouflage from birds for 240 seconds after use.',
    'Bait': 'A fishing supply sold by Vanya.',
    'Bird Food': 'Obtained by exchanging delivered bird cards with Bailey J.',
    'Universal Animal Food': 'Provides balanced nutrition for animals.',
    'Amazing Seasoning': 'Used while cooking. A successful dish is at least 2-star quality; it has no effect on a failed dish.',
    'Dog Food': 'Balanced food used for dog care.',
    'Energy Dog Food': 'Feeds a dog and restores vitality.',
    'Cat Food': 'Nutritious food used for cat care.',
    'Fertilizer': 'A gardening supply used in crop-care routines.',
    'Quality Fertilizer': 'A higher-tier gardening supply used in crop-care routines.',
    'Universal Ingredient': 'Can substitute for an ingredient while cooking.',
    'Drawing Board': 'Used for custom drawing and design activities.',
    'Mermaid Perfume': 'A fishing utility sold by Vanya.',
    'Energy Fish Jerky': 'Feeds a cat and restores vitality.',
    'Rainbow Breeding Powder': 'A gardening supply connected to flower breeding.',
    'Sense Booster': 'A utility item for bug-catching sessions.',
    'Auto Bird Whistle': 'Makes nearby birds, except birds on stands, act more often for 3 minutes.',
    'Top Growth Booster': 'A top-tier gardening booster for crop-growth routines.',
    'Top Fertilizer': 'A top-tier gardening supply used in crop-care routines.'
};

function existingLink(href, label) {
    const target = href ? path.join(root, href.slice(1), 'index.html') : '';
    return href && fs.existsSync(target) ? `<a href="${href}" class="font-bold text-cozy-coral hover:underline">${esc(label)}</a>` : esc(label);
}

function buildItems() {
    const source = readJson('data/heartopia-items.json');
    const entries = source.items;
    if (entries.length !== 23) throw new Error(`Item safety check failed: ${entries.length}`);
    const date = latestDate(currentBuildDate, source.generatedAt);
    const cards = entries.map(item => {
        const use = itemUses[item.name] || item.about || `${item.category} supply sold by ${item.soldBy}.`;
        const price = Number.isFinite(item.price) ? item.price : null;
        const seller = existingLink(sellerPaths[item.soldBy], item.soldBy || 'Seller not shown');
        const activity = existingLink(activityPaths[item.category], item.category);
        return `<article ${relationCardAttributes({ name: item.name, key: item.name, search: `${item.name} ${item.category} ${item.soldBy} ${use}`, filters: [item.category, item.soldBy], sortValue: price, relations: 1 })} class="relation-card bg-white border border-cozy-peach/40 p-4">
            <div class="flex gap-4"><img src="${item.image}" alt="${esc(item.name)} item image" class="w-16 h-16 object-contain bg-cozy-cream p-1 shrink-0" loading="lazy"><div class="min-w-0"><p class="text-xs font-bold text-cozy-sage">${esc(item.category)}</p><h2 class="font-display text-xl font-bold mt-1">${esc(item.name)}</h2></div></div>
            <dl class="grid grid-cols-2 gap-x-4 gap-y-2 border-y border-cozy-peach/50 py-3 mt-4 text-sm"><div><dt class="text-xs text-cozy-wood">Listed price</dt><dd class="font-bold">${price === null ? 'No price shown' : esc(price)}</dd></div><div><dt class="text-xs text-cozy-wood">Seller</dt><dd>${seller}</dd></div></dl>
            <details class="relation-detail mt-3 border-b border-cozy-peach/50 pb-3"><summary class="font-bold text-sm text-cozy-coral">Expand details<span class="relation-toggle shrink-0" aria-hidden="true"></span></summary><div class="mt-3 space-y-3 text-sm"><div><strong class="block text-xs text-cozy-wood">Use</strong><p>${esc(use)}</p></div><div><strong class="block text-xs text-cozy-wood">Related activity</strong><p>${activity}</p></div><div><strong class="block text-xs text-cozy-wood">Availability</strong><p>Check ${esc(item.soldBy || 'the seller')}\'s current shop or exchange list.</p></div>${price === null ? '' : '<p class="text-xs text-cozy-wood">The current listing includes a number but not its currency icon; use the seller screen for the currency type.</p>'}</div></details>
            ${markButton(item.name, 'Mark owned', 'Owned')}
        </article>`;
    }).join('');
    const html = pageStart({ title: 'Heartopia Items Database: Sellers, Prices & Uses', description: 'Compare 23 Heartopia items by seller, listed price, use and related activity with expandable records and local images.', canonical: 'https://heartopia.life/database/items/', h1: 'Heartopia Items: Sellers, Prices & Uses', intro: 'Compare each item with the NPC who sells it, its recorded price, practical use, and related activity from one searchable list.', date, heroClass: 'bg-gradient-to-br from-violet-100 to-cozy-mint/40', sectionName: 'Items', storageKey: 'heartopia.collection.items', entityType: 'items', socialImage: '/img/items/Amazing-Seasoning.webp' })
        + stats([{ value: entries.length, label: 'Registered items', color: 'text-cozy-coral' }, { value: new Set(entries.map(x => x.soldBy)).size, label: 'Seller connections', color: 'text-cozy-sage' }, { value: entries.filter(x => Number.isFinite(x.price)).length, label: 'Listed prices', color: 'text-amber-600' }, { value: entries.length, label: 'Expandable records', color: 'text-cozy-sky' }])
        + controls({ searchPlaceholder: 'Item, seller, activity, or use...', filters: [{ label: 'Category', values: [...new Set(entries.map(x => x.category))].sort() }, { label: 'Seller', values: [...new Set(entries.map(x => x.soldBy))].sort() }], sortOptions: [{ value: 'name', label: 'Name A-Z' }, { value: 'low', label: 'Listed price: low to high' }, { value: 'high', label: 'Listed price: high to low' }] })
        + '<div id="heartopia_in_content" class="my-6 text-center"></div><section><div class="flex flex-wrap items-end justify-between gap-3 mb-4"><div><h2 class="font-display text-2xl font-bold">Item records</h2><p class="text-sm text-cozy-wood">Price numbers keep their source value without guessing the shop currency icon.</p></div></div><div data-empty-state class="hidden bg-white border border-cozy-peach p-5 text-cozy-wood">No items match these filters.</div><div data-record-list class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">' + cards + '</div></section>'
        + pageEnd([{ href: '/npcs/', title: 'NPC database', description: 'Find sellers, locations, and functions.' }, { href: '/database/recipes/', title: 'Recipes', description: 'Compare cooking uses and ingredients.' }, { href: '/tools/my-progress/', title: 'My Progress', description: 'Review saved collection marks.' }]);
    write('database/items/index.html', html);
}

function recipeRelationMap(recipes) {
    const map = new Map();
    for (const recipe of recipes) {
        for (const ingredient of recipe.ingredients || []) {
            const key = norm(ingredient.name);
            if (!map.has(key)) map.set(key, new Map());
            map.get(key).set(recipe.name, { name: recipe.name, amount: ingredient.amount, availability: recipe.availability });
        }
    }
    return new Map(Array.from(map, ([key, values]) => [key, Array.from(values.values()).sort((a, b) => a.name.localeCompare(b.name))]));
}

function buildIngredients(recipes, recipeDate) {
    const source = readJson('data/heartopia-ingredients.json');
    const entries = source.ingredients;
    if (entries.length !== 26) throw new Error(`Ingredient safety check failed: ${entries.length}`);
    const date = latestDate(currentBuildDate, source.generatedAt, recipeDate);
    const relations = recipeRelationMap(recipes);
    const cards = entries.map(item => {
        const linked = relations.get(norm(item.name)) || [];
        const sourceCount = Math.max(Number(item.recipeCount) || 0, linked.length);
        const names = linked.map(recipe => recipe.name);
        const relationshipNote = sourceCount > linked.length
            ? `${linked.length} named recipe${linked.length === 1 ? '' : 's'} currently appear in the local recipe index; the ingredient entry lists ${sourceCount} total culinary uses.`
            : `${linked.length} named recipe${linked.length === 1 ? '' : 's'} currently use this ingredient.`;
        return `<article ${relationCardAttributes({ name: item.name, key: item.name, search: `${item.name} ${item.category} ${item.availability} ${item.about} ${names.join(' ')}`, filters: [item.category, item.availability], sortValue: item.buyPrice, relations: sourceCount })} class="relation-card bg-white border border-cozy-peach/40 p-4">
            <div class="flex gap-4"><img src="${item.image}" alt="${esc(item.name)} ingredient image" class="w-16 h-16 object-contain bg-cozy-cream p-1 shrink-0" loading="lazy"><div class="min-w-0"><p class="text-xs font-bold text-cozy-sage">${esc(item.category)}</p><h2 class="font-display text-xl font-bold mt-1">${esc(item.name)}</h2><p class="text-xs mt-1 ${item.availability === 'Event ended' ? 'text-red-600 font-bold' : 'text-cozy-wood'}">${esc(item.availability)}</p></div></div>
            <dl class="grid grid-cols-2 gap-x-4 gap-y-2 border-y border-cozy-peach/50 py-3 mt-4 text-sm"><div><dt class="text-xs text-cozy-wood">Buy price</dt><dd class="font-bold">${Number.isFinite(item.buyPrice) ? `${item.buyPrice.toLocaleString()} Gold` : 'No price shown'}</dd></div><div><dt class="text-xs text-cozy-wood">Recipe uses</dt><dd class="font-bold">${sourceCount}</dd></div></dl>
            <details class="relation-detail mt-3 border-b border-cozy-peach/50 pb-3"><summary class="font-bold text-sm text-cozy-coral">Expand recipe connections<span class="relation-toggle shrink-0" aria-hidden="true"></span></summary><div class="mt-3 space-y-3"><p class="text-xs text-cozy-wood">${esc(relationshipNote)}</p>${recipeLinks(names)}${item.about ? `<p class="text-sm text-cozy-wood"><strong class="text-cozy-bark">About:</strong> ${esc(item.about)}</p>` : ''}</div></details>
            ${markButton(item.name, 'Mark stocked', 'Stocked')}
        </article>`;
    }).join('');
    const namedRelations = entries.reduce((sum, item) => sum + (relations.get(norm(item.name)) || []).length, 0);
    const html = pageStart({ title: 'Heartopia Ingredients: Recipe Uses & Buy Prices', description: 'Find 26 Heartopia ingredients with buy prices, availability and expandable links to the recipes that use each ingredient.', canonical: 'https://heartopia.life/database/ingredients/', h1: 'Heartopia Ingredients & Recipe Connections', intro: 'Search an ingredient once, then expand its record to see the recipes that use it, buy price, availability, and description.', date, heroClass: 'bg-gradient-to-br from-amber-100 to-cozy-peach/60', sectionName: 'Ingredients', storageKey: 'heartopia.collection.ingredients', entityType: 'ingredients', socialImage: '/img/ingredients/Butter.webp' })
        + stats([{ value: entries.length, label: 'Ingredients', color: 'text-cozy-coral' }, { value: namedRelations, label: 'Named recipe links', color: 'text-cozy-sage' }, { value: entries.filter(x => x.availability === 'Available').length, label: 'Currently available', color: 'text-emerald-600' }, { value: entries.filter(x => x.availability === 'Event ended').length, label: 'Event-ended entries', color: 'text-red-600' }])
        + controls({ searchPlaceholder: 'Ingredient or recipe name...', filters: [{ label: 'Category', values: [...new Set(entries.map(x => x.category))].sort() }, { label: 'Availability', values: [...new Set(entries.map(x => x.availability))].sort() }], sortOptions: [{ value: 'name', label: 'Name A-Z' }, { value: 'relations', label: 'Most recipe uses' }, { value: 'low', label: 'Buy price: low to high' }, { value: 'high', label: 'Buy price: high to low' }] })
        + '<div id="heartopia_in_content" class="my-6 text-center"></div><section><h2 class="font-display text-2xl font-bold mb-1">Ingredient records</h2><p class="text-sm text-cozy-wood mb-4">Recipe chips open the recipe database with that recipe already searched.</p><div data-empty-state class="hidden bg-white border border-cozy-peach p-5 text-cozy-wood">No ingredients match these filters.</div><div data-record-list class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">' + cards + '</div></section>'
        + pageEnd([{ href: '/database/recipes/', title: 'Recipe database', description: 'Compare ingredients, value, energy, and level.' }, { href: '/database/crops/', title: 'Crop database', description: 'See seeds, growth times, and recipe uses.' }, { href: '/tools/recipe-calculator/', title: 'Recipe calculator', description: 'Plan ingredients and market values.' }]);
    write('database/ingredients/index.html', html);
}

function buildCrops() {
    const source = readJson('data/heartopia-crops.json');
    const entries = source.crops;
    if (entries.length !== 17) throw new Error(`Crop safety check failed: ${entries.length}`);
    const date = latestDate(currentBuildDate, source.generatedAt);
    const cards = entries.map(item => {
        const names = item.recipes || [];
        const search = `${item.name} ${item.type} ${item.plantingWindow} ${names.join(' ')}`;
        const title = existingLink(`/database/crops/${item.id}/`, item.name);
        return `<article ${relationCardAttributes({ name: item.name, key: norm(item.name), search, filters: [item.type, item.plantingWindow], sortValue: item.seedPrice, relations: item.recipeCount })} class="relation-card bg-white border border-cozy-peach/40 p-4">
            <div class="flex gap-4"><img src="${item.image}" alt="${esc(item.name)} crop image" class="w-16 h-16 object-contain bg-cozy-cream p-1 shrink-0" loading="lazy"><div class="min-w-0"><p class="text-xs font-bold text-cozy-sage">${esc(item.type)}</p><h2 class="font-display text-xl font-bold mt-1">${title}</h2><p class="text-xs text-cozy-wood mt-1">${esc(item.plantingWindow)}</p></div></div>
            <dl class="grid grid-cols-3 gap-x-3 border-y border-cozy-peach/50 py-3 mt-4 text-sm"><div><dt class="text-xs text-cozy-wood">Seed</dt><dd class="font-bold">${item.seedPrice} G</dd></div><div><dt class="text-xs text-cozy-wood">Growth</dt><dd class="font-bold">${esc(item.growthTime)}</dd></div><div><dt class="text-xs text-cozy-wood">Recipes</dt><dd class="font-bold">${item.recipeCount}</dd></div></dl>
            <details class="relation-detail mt-3 border-b border-cozy-peach/50 pb-3"><summary class="font-bold text-sm text-cozy-coral">Expand recipe connections<span class="relation-toggle shrink-0" aria-hidden="true"></span></summary><div class="mt-3">${recipeLinks(names)}</div></details>
            ${markButton(norm(item.name), 'Mark harvested', 'Harvested')}
        </article>`;
    }).join('');
    const html = pageStart({ title: 'Heartopia Crops: Recipe Uses, Seeds & Growth Times', description: 'Compare 17 Heartopia crops by seed price, growth time and expandable recipe connections with local crop images.', canonical: 'https://heartopia.life/database/crops/', h1: 'Heartopia Crops & Recipe Connections', intro: 'Choose a crop by seed budget and return time, then expand it to see every recipe currently connected to that crop.', date, heroClass: 'bg-gradient-to-br from-green-100 to-cozy-mint/50', sectionName: 'Crops', storageKey: 'heartopia.collection.crops', entityType: 'crops', socialImage: '/img/crops/Grape.webp' })
        + stats([{ value: entries.length, label: 'Crops', color: 'text-cozy-coral' }, { value: entries.reduce((sum, item) => sum + item.recipeCount, 0), label: 'Recipe connections', color: 'text-cozy-sage' }, { value: `${Math.min(...entries.map(x => x.seedPrice))} G`, label: 'Lowest seed price', color: 'text-emerald-600' }, { value: `${Math.max(...entries.map(x => x.growthMinutes)) / 60}h`, label: 'Longest growth time', color: 'text-amber-600' }])
        + controls({ searchPlaceholder: 'Crop or recipe name...', filters: [{ label: 'Type', values: [...new Set(entries.map(x => x.type))].sort() }, { label: 'Planting window', values: [...new Set(entries.map(x => x.plantingWindow))].sort() }], sortOptions: [{ value: 'name', label: 'Name A-Z' }, { value: 'relations', label: 'Most recipe uses' }, { value: 'low', label: 'Seed price: low to high' }, { value: 'high', label: 'Seed price: high to low' }] })
        + '<div id="heartopia_in_content" class="my-6 text-center"></div><section><h2 class="font-display text-2xl font-bold mb-1">Crop records</h2><p class="text-sm text-cozy-wood mb-4">Use the recipe list to decide what to plant before your next cooking session.</p><div data-empty-state class="hidden bg-white border border-cozy-peach p-5 text-cozy-wood">No crops match these filters.</div><div data-record-list class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">' + cards + '</div></section>'
        + pageEnd([{ href: '/tools/crop-planner/', title: 'Crop planner', description: 'Calculate seed cost and harvest timing.' }, { href: '/guides/best-crops/', title: 'Best crops by schedule', description: 'Pick crops for short or long breaks.' }, { href: '/database/recipes/', title: 'Recipe database', description: 'Search the finished dishes connected here.' }]);
    write('database/crops/index.html', html);
}

function cleanCollectibleAbout(item) {
    const overrides = {
        'Tall Mustard': 'Despite its name, it carries the pungent, spicy character associated with garlic and mustard greens.',
        'Fiddlehead': 'Often described as the king of wild greens; blanch it before cooking.',
        'Drawing Board': 'Use it for custom drawing and design activities.'
    };
    return overrides[item.name] || String(item.about || '')
        .replace(/\btupe\b/gi, 'type')
        .replace(/\bverg\b/gi, 'very')
        .replace(/\bStag away\b/g, 'Stay away')
        .replace(/\bspicg\b/gi, 'spicy');
}

function buildCollectibles() {
    const source = readJson('data/heartopia-collectibles.json');
    const entries = source.collectibles;
    if (entries.length !== 37) throw new Error(`Collectible safety check failed: ${entries.length}`);
    const date = latestDate(currentBuildDate, source.generatedAt);
    const cards = entries.map(item => {
        const about = cleanCollectibleAbout(item);
        return `<article ${relationCardAttributes({ name: item.name, key: item.name, search: `${item.name} ${item.category} ${item.location} ${item.availability} ${about}`, filters: [item.location, item.category, item.availability], sortValue: item.sellValue, relations: Number.isFinite(item.energy) ? 1 : 0 })} class="relation-card bg-white border border-cozy-peach/40 p-4">
            <div class="flex gap-4"><img src="${item.image}" alt="${esc(item.name)} collectible image" class="w-16 h-16 object-contain bg-cozy-cream p-1 shrink-0" loading="lazy"><div class="min-w-0"><p class="text-xs font-bold text-cozy-sage">${esc(item.category)}</p><h2 class="font-display text-xl font-bold mt-1">${esc(item.name)}</h2><p class="text-xs mt-1 ${item.availability === 'Event ended' ? 'font-bold text-red-600' : 'text-cozy-wood'}">${esc(item.availability)}</p></div></div>
            <dl class="grid grid-cols-3 gap-x-3 border-y border-cozy-peach/50 py-3 mt-4 text-sm"><div><dt class="text-xs text-cozy-wood">Location</dt><dd class="font-bold">${esc(item.location)}</dd></div><div><dt class="text-xs text-cozy-wood">Sell</dt><dd class="font-bold">${Number.isFinite(item.sellValue) ? `${item.sellValue} G` : '-'}</dd></div><div><dt class="text-xs text-cozy-wood">Energy</dt><dd class="font-bold">${Number.isFinite(item.energy) ? `+${item.energy}` : '-'}</dd></div></dl>
            <details class="relation-detail mt-3 border-b border-cozy-peach/50 pb-3"><summary class="font-bold text-sm text-cozy-coral">Expand details<span class="relation-toggle shrink-0" aria-hidden="true"></span></summary><dl class="mt-3 grid gap-3 text-sm"><div><dt class="text-xs text-cozy-wood">Availability</dt><dd>${esc(item.availability)}</dd></div><div><dt class="text-xs text-cozy-wood">Where to look</dt><dd>${esc(item.location)}</dd></div><div><dt class="text-xs text-cozy-wood">Use / description</dt><dd>${esc(about || 'Use the current in-game description for this collectible.')}</dd></div></dl></details>
            ${markButton(item.name, 'Mark found', 'Found')}
        </article>`;
    }).join('');
    const html = pageStart({ title: 'Heartopia Collectibles: Locations, Values & Energy', description: 'Browse 37 Heartopia collectibles with locations, sell values, energy, availability and expandable descriptions.', canonical: 'https://heartopia.life/database/collectibles/', h1: 'Heartopia Collectibles: Locations & Values', intro: 'Compare where each collectible appears, what it sells for, whether it restores energy, and whether its activity is currently available.', date, heroClass: 'bg-gradient-to-br from-emerald-100 to-cozy-mint/50', sectionName: 'Collectibles', storageKey: 'heartopia.collection.collectibles', entityType: 'collectibles', socialImage: '/img/collectibles/Apple.webp' })
        + stats([{ value: entries.length, label: 'Collectibles', color: 'text-cozy-coral' }, { value: entries.filter(x => Number.isFinite(x.sellValue)).length, label: 'Listed sell values', color: 'text-cozy-sage' }, { value: entries.filter(x => Number.isFinite(x.energy)).length, label: 'Energy entries', color: 'text-emerald-600' }, { value: entries.filter(x => x.availability === 'Event ended').length, label: 'Event-ended entries', color: 'text-red-600' }])
        + controls({ searchPlaceholder: 'Collectible, location, or use...', filters: [{ label: 'Location', values: [...new Set(entries.map(x => x.location))].sort() }, { label: 'Category', values: [...new Set(entries.map(x => x.category))].sort() }, { label: 'Availability', values: [...new Set(entries.map(x => x.availability))].sort() }], sortOptions: [{ value: 'name', label: 'Name A-Z' }, { value: 'low', label: 'Sell value: low to high' }, { value: 'high', label: 'Sell value: high to low' }] })
        + '<div id="heartopia_in_content" class="my-6 text-center"></div><section><h2 class="font-display text-2xl font-bold mb-1">Collectible records</h2><p class="text-sm text-cozy-wood mb-4">Event-ended records remain visible for collection reference and are labeled on each card.</p><div data-empty-state class="hidden bg-white border border-cozy-peach p-5 text-cozy-wood">No collectibles match these filters.</div><div data-record-list class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">' + cards + '</div></section>'
        + pageEnd([{ href: '/database/materials/', title: 'Materials database', description: 'Open focused timber, mineral, and mushroom routes.' }, { href: '/guides/map/', title: 'Map and locations', description: 'Plan a route around the listed areas.' }, { href: '/tools/my-progress/', title: 'My Progress', description: 'Review saved collectible marks.' }]);
    write('database/collectibles/index.html', html);
}

export function buildRelationalDatabases({ only = ['items', 'ingredients', 'crops', 'collectibles'] } = {}) {
    const requested = new Set(only);
    const recipeSource = readJson('data/heartopia-recipes.json');
    if (requested.has('items')) buildItems();
    if (requested.has('ingredients')) buildIngredients(recipeSource.recipes, recipeSource.generatedAt);
    if (requested.has('crops')) buildCrops();
    if (requested.has('collectibles')) buildCollectibles();
    console.log(`Built relational database pages: ${Array.from(requested).join(', ')}.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    buildRelationalDatabases();
}
