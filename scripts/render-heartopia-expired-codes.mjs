import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const data = JSON.parse(await fs.readFile(path.join(root, 'data', 'heartopia-codes.json'), 'utf8'));
const sourcePath = path.join(root, 'codes', 'index.html');
const outputPath = path.join(root, 'codes', 'expired', 'index.html');
const sitemapPath = path.join(root, 'sitemap.xml');

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const cards = data.expired.map((item) => {
  const reward = item.rewardVerified && item.reward && item.reward !== 'Free rewards'
    ? item.reward
    : 'Historical reward details not recorded';
  return `                <article class="rounded-xl border border-cozy-peach/40 bg-white p-4" data-expired-code="${escapeHtml(String(item.code).toLowerCase())}">
                    <div class="flex flex-wrap items-center justify-between gap-3">
                        <code class="code-badge rounded bg-gray-600 px-2 py-1 text-sm font-bold text-white">${escapeHtml(item.code)}</code>
                        <button type="button" class="copy-code-btn rounded-lg border border-cozy-bark bg-white px-3 py-2 text-sm font-bold text-cozy-bark" data-copy-code="${escapeHtml(item.code)}">Copy</button>
                    </div>
                    <p class="mt-3 text-sm text-cozy-bark">${escapeHtml(reward)}</p>
                    <p class="mt-1 text-xs leading-5 text-cozy-wood">${escapeHtml(item.note || 'Expired')}</p>
                </article>`;
}).join('\n');

const main = `    <main class="mx-auto max-w-6xl px-4 py-8">
        <nav class="mb-6 text-sm text-cozy-wood" aria-label="Breadcrumb">
            <a href="/" class="hover:text-cozy-coral">Home</a> <span aria-hidden="true">›</span>
            <a href="/codes/" class="hover:text-cozy-coral">Codes</a> <span aria-hidden="true">›</span>
            <span>Expired archive</span>
        </nav>

        <header class="mb-8 rounded-2xl border border-cozy-peach bg-white p-6 shadow-sm md:p-8">
            <p class="text-sm font-bold uppercase tracking-wide text-cozy-coral">Historical lookup</p>
            <h1 class="mt-2 font-display text-3xl font-bold text-cozy-bark md:text-4xl">Expired Heartopia Codes Archive</h1>
            <p class="mt-4 max-w-3xl leading-7 text-cozy-wood">Search ${data.expired.length} old Heartopia redeem codes before retrying one you found in an older guide or social post. These codes are kept off the active list because their published deadline passed or current sources now place them in history.</p>
            <a href="/codes/" class="mt-5 inline-flex min-h-11 items-center rounded-lg bg-cozy-bark px-5 py-3 font-bold text-white">View current working codes</a>
        </header>

        <section class="mb-10" aria-labelledby="archive-heading">
            <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 id="archive-heading" class="font-display text-2xl font-bold">Search the expired code list</h2>
                    <p id="archive-count" class="mt-1 text-sm text-cozy-wood">Showing all ${data.expired.length} expired codes.</p>
                </div>
                <label class="block sm:w-80">
                    <span class="sr-only">Search expired codes</span>
                    <input id="expired-code-search" type="search" autocomplete="off" placeholder="Type a code, for example Junegift" class="min-h-11 w-full rounded-lg border border-cozy-wood/40 bg-white px-4 py-2 text-cozy-bark focus:border-cozy-coral focus:outline-none focus:ring-2 focus:ring-cozy-coral/30">
                </label>
            </div>
            <div id="expired-code-list" class="grid gap-3 md:grid-cols-2">
${cards}
            </div>
            <p id="expired-code-empty" class="hidden rounded-xl border border-cozy-peach bg-white p-5 text-cozy-wood">No archived code matches that search.</p>
        </section>

        <section class="mb-8 rounded-xl border border-cozy-peach bg-white p-5">
            <h2 class="font-display text-2xl font-bold">Archive verification</h2>
            <p class="mt-2 text-sm leading-6 text-cozy-wood">An old code remains archived unless a current official announcement or at least two independent current lists place it back in the active section. The September 21 review found no archived code that met that restoration rule.</p>
            <ul class="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                <li><a class="font-bold text-cozy-coral underline" href="https://tryhardguides.com/heartopia-codes/" target="_blank" rel="noopener noreferrer">English current/expired list <span aria-hidden="true">↗</span><span class="sr-only"> (external link)</span></a></li>
                <li><a class="font-bold text-cozy-coral underline" href="https://heartopia-plus.com/giftcode/" target="_blank" rel="noopener noreferrer">Japanese distribution history <span aria-hidden="true">↗</span><span class="sr-only"> (external link)</span></a></li>
                <li><a class="font-bold text-cozy-coral underline" href="https://heartopia-life.me/wiki/codes" target="_blank" rel="noopener noreferrer">Korean active/expired list <span aria-hidden="true">↗</span><span class="sr-only"> (external link)</span></a></li>
            </ul>
        </section>

        <section class="mb-8 rounded-xl bg-cozy-bark/10 p-4 text-sm text-cozy-wood">
            <p><strong>Last checked:</strong> ${escapeHtml(data.lastChecked)}. “Expired” describes the current evidence, not a permanent technical guarantee. Region, account state and claim limits can affect the in-game result.</p>
        </section>
    </main>`;

let html = await fs.readFile(sourcePath, 'utf8');
html = html
  .replace(/<title>[\s\S]*?<\/title>/, '<title>Expired Heartopia Codes Archive — Old & Invalid Codes</title>')
  .replace(/<meta name="description"[\s\S]*?>/, '<meta name="description" content="Search the expired Heartopia codes archive to check old redeem codes, previous rewards, and why a code is no longer on the active list.">')
  .replace(/<meta name="keywords"[\s\S]*?>/, '<meta name="keywords" content="expired Heartopia codes, old Heartopia codes, invalid Heartopia redeem codes">')
  .replace(/<link rel="canonical" href="[^"]+">/, '<link rel="canonical" href="https://heartopia.life/codes/expired/">')
  .replace(/\s*<link rel="alternate"[^>]+>/g, '')
  .replace(/<meta property="og:title"[^>]+>/, '<meta property="og:title" content="Expired Heartopia Codes Archive">')
  .replace(/<meta property="og:description"[\s\S]*?>/, '<meta property="og:description" content="Search old and expired Heartopia redeem codes without cluttering the current working-code list.">')
  .replace(/<meta property="og:url"[^>]+>/, '<meta property="og:url" content="https://heartopia.life/codes/expired/">')
  .replace(/<meta name="twitter:title"[^>]+>/, '<meta name="twitter:title" content="Expired Heartopia Codes Archive">')
  .replace(/<meta name="twitter:description"[\s\S]*?>/, '<meta name="twitter:description" content="Search old and expired Heartopia redeem codes and previous rewards.">')
  .replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '')
  .replace('</head>', `    <script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Expired Heartopia Codes Archive',
    url: 'https://heartopia.life/codes/expired/',
    dateModified: data.lastChecked,
    isPartOf: { '@type': 'WebSite', name: 'Heartopia.Life', url: 'https://heartopia.life/' }
  })}</script>\n</head>`)
  .replace(/\s*<main class="max-w-6xl mx-auto px-4 py-8">[\s\S]*?<\/main>/, `\n${main}`)
  .replace('</body>', `    <script>
        (function () {
            var input = document.getElementById('expired-code-search');
            var cards = Array.from(document.querySelectorAll('[data-expired-code]'));
            var count = document.getElementById('archive-count');
            var empty = document.getElementById('expired-code-empty');
            if (!input) return;
            input.addEventListener('input', function () {
                var query = input.value.trim().toLowerCase();
                var visible = 0;
                cards.forEach(function (card) {
                    var show = !query || card.getAttribute('data-expired-code').includes(query);
                    card.classList.toggle('hidden', !show);
                    if (show) visible += 1;
                });
                count.textContent = query ? 'Showing ' + visible + ' matching archived code' + (visible === 1 ? '.' : 's.') : 'Showing all ${data.expired.length} expired codes.';
                empty.classList.toggle('hidden', visible !== 0);
            });
        })();
    </script>\n</body>`);

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, `${html.trimEnd()}\n`);

let sitemap = await fs.readFile(sitemapPath, 'utf8');
const entry = `  <url>\n    <loc>https://heartopia.life/codes/expired/</loc>\n    <lastmod>${data.lastChecked}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.5</priority>\n  </url>\n`;
if (sitemap.includes('<loc>https://heartopia.life/codes/expired/</loc>')) {
  sitemap = sitemap.replace(/(<loc>https:\/\/heartopia\.life\/codes\/expired\/<\/loc>\s*<lastmod>)[^<]+(<\/lastmod>)/, `$1${data.lastChecked}$2`);
} else {
  sitemap = sitemap.replace('</urlset>', `${entry}</urlset>`);
}
await fs.writeFile(sitemapPath, `${sitemap.trimEnd()}\n`);
console.log(`Rendered expired code archive: ${data.expired.length} codes.`);
