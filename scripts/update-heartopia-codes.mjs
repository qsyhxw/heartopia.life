import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const dataPath = path.join(root, 'data', 'heartopia-codes.json');
const pagePath = path.join(root, 'codes', 'index.html');
const sitemapPath = path.join(root, 'sitemap.xml');
const args = new Set(process.argv.slice(2));
const renderOnly = args.has('--render-only');
const dryRun = args.has('--dry-run');

const USER_AGENT = 'HeartopiaLifeCodeBot/1.0 (+https://heartopia.life/codes/)';
const TRUSTED_SOURCE_THRESHOLD = 2;
const TODAY = new Date().toISOString().slice(0, 10);

const STOPWORDS = new Set([
  'heartopia', 'codes', 'code', 'redeem', 'reward', 'rewards', 'active', 'expired', 'expires',
  'updated', 'update', 'guide', 'guides', 'gaming', 'android', 'iphone', 'mobile', 'steam',
  'polygon', 'eurogamer', 'pockettactics', 'features', 'official', 'discord', 'facebook',
  'twitter', 'youtube', 'google', 'privacy', 'contact', 'newsletter', 'comments', 'article',
  'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september',
  'october', 'november', 'december', 'heartopia0108'
]);

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function longDate(isoDate) {
  const date = new Date(`${isoDate}T12:00:00Z`);
  return new Intl.DateTimeFormat('en-US', {
    month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC'
  }).format(date);
}

function normalizeCode(code) {
  return String(code || '').trim().toLowerCase();
}

function uniq(values) {
  return [...new Set(values.filter(Boolean))];
}

function decodeHtml(text) {
  return text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function htmlToText(html) {
  return decodeHtml(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function looksLikeCode(token, context, knownCodes) {
  const value = token.trim();
  const lower = value.toLowerCase();
  if (value.length < 6 || value.length > 32) return false;
  if (STOPWORDS.has(lower)) return false;
  if (/^\d+$/.test(value)) return false;
  if (/^20\d{2}$/.test(value)) return false;
  if (/^(https?|www|com|net|html|json)$/i.test(value)) return false;
  if (knownCodes.has(lower)) return true;

  const hasDigit = /\d/.test(value);
  const compactLower = /^[a-z0-9_-]+$/.test(value);
  if (!compactLower) return false;

  const usefulContext = /(code|redeem|reward|gift|active|expired|working|claim)/i.test(context);
  const tooWordy = /^[a-z]+$/.test(value) && value.length > 18;
  if (tooWordy) return false;

  // For unknown codes, stay conservative. Plain words without digits create too many false positives.
  if (!hasDigit) return false;
  if (!/[a-z]/i.test(value)) return false;

  return usefulContext;
}

function extractCandidates(html, url, knownCodes) {
  const text = htmlToText(html);
  const found = new Map();
  const tokenRe = /\b[A-Za-z0-9][A-Za-z0-9_-]{5,31}\b/g;
  let match;
  while ((match = tokenRe.exec(text))) {
    const token = match[0];
    const start = Math.max(0, match.index - 160);
    const end = Math.min(text.length, match.index + token.length + 160);
    const context = text.slice(start, end);
    if (!looksLikeCode(token, context, knownCodes)) continue;

    const key = normalizeCode(token);
    const expiredHint = /expired|no longer|not working|invalid|inactive/i.test(context);
    const activeHint = /active|working|new|redeem|reward|claim|try/i.test(context);
    const existing = found.get(key) || {
      code: token,
      sources: [],
      expiredHints: 0,
      activeHints: 0,
      contexts: []
    };
    existing.sources.push(url);
    existing.expiredHints += expiredHint ? 1 : 0;
    existing.activeHints += activeHint ? 1 : 0;
    existing.contexts.push(context.slice(0, 220));
    found.set(key, existing);
  }
  return found;
}

async function fetchSource(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);
  try {
    const res = await fetch(url, {
      headers: { 'user-agent': USER_AGENT, 'accept': 'text/html,application/xhtml+xml' },
      signal: controller.signal
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timeout);
  }
}

function dedupeByCode(items) {
  const seen = new Set();
  const output = [];
  for (const item of items) {
    const key = normalizeCode(item.code);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    output.push(item);
  }
  return output;
}

function mergeFindings(data, findings) {
  const activeByKey = new Map(data.active.map((item) => [normalizeCode(item.code), item]));
  const expiredByKey = new Map(data.expired.map((item) => [normalizeCode(item.code), item]));
  const pendingByKey = new Map((data.pending || []).map((item) => [normalizeCode(item.code), item]));
  const now = data.lastChecked;

  for (const [key, hit] of findings) {
    const sourceList = uniq(hit.sources);
    const sourceCount = sourceList.length;
    const isExpiredHint = hit.expiredHints > 0 && hit.expiredHints >= hit.activeHints;

    if (activeByKey.has(key)) {
      const item = activeByKey.get(key);
      item.lastSeen = now;
      item.sourceCount = Math.max(item.sourceCount || 0, sourceCount);
      item.sources = uniq([...(item.sources || []), ...sourceList]);
      if (isExpiredHint) item.needsCheck = true;
      continue;
    }

    if (expiredByKey.has(key)) {
      const item = expiredByKey.get(key);
      item.lastSeen = now;
      item.sources = uniq([...(item.sources || []), ...sourceList]);
      if (!isExpiredHint && sourceCount >= TRUSTED_SOURCE_THRESHOLD) item.needsCheck = true;
      continue;
    }

    if (sourceCount >= TRUSTED_SOURCE_THRESHOLD && !isExpiredHint) {
      data.active.unshift({
        code: hit.code,
        reward: 'Free rewards',
        expires: 'No posted expiry',
        status: 'new',
        firstSeen: now,
        lastSeen: now,
        sourceCount,
        sources: sourceList,
        note: 'Auto-detected from multiple code trackers; verify in game.'
      });
      activeByKey.set(key, data.active[0]);
      pendingByKey.delete(key);
      continue;
    }

    const pending = pendingByKey.get(key) || {
      code: hit.code,
      reward: 'Unknown',
      firstSeen: now,
      status: isExpiredHint ? 'possibly_expired' : 'needs_review',
      sources: [],
      contexts: []
    };
    pending.lastSeen = now;
    pending.sourceCount = Math.max(pending.sourceCount || 0, sourceCount);
    pending.sources = uniq([...(pending.sources || []), ...sourceList]);
    pending.contexts = uniq([...(pending.contexts || []), ...hit.contexts]).slice(0, 5);
    pendingByKey.set(key, pending);
  }

  data.pending = [...pendingByKey.values()].sort((a, b) => String(b.lastSeen || '').localeCompare(String(a.lastSeen || '')));
  data.active = dedupeByCode(data.active);
  data.expired = dedupeByCode(data.expired);
}

function renderActiveRows(data) {
  return data.active.map((item) => {
    const isNew = item.status === 'new';
    const rowClass = isNew ? ' class="bg-green-50"' : item.status === 'active' ? ' class="bg-cozy-sky/20"' : '';
    const badgeClass = isNew ? 'bg-green-600' : item.status === 'active' ? 'bg-cozy-coral' : 'bg-cozy-bark';
    const newBadge = isNew ? ' <span class="ml-1 text-xs bg-green-500 text-white px-1 rounded">NEW</span>' : '';
    const sourceNote = item.sourceCount && item.sourceCount > 1
      ? `<div class="text-[11px] text-cozy-wood/60 mt-1">Seen on ${item.sourceCount} sources</div>`
      : item.needsCheck
        ? '<div class="text-[11px] text-amber-700 mt-1">Needs re-check</div>'
        : '';
    return `                            <tr${rowClass}>
                                <td class="px-4 py-3"><code class="code-badge ${badgeClass} text-white px-2 py-1 rounded text-xs font-bold">${escapeHtml(item.code)}</code>${newBadge}${sourceNote}</td>
                                <td class="px-4 py-3">${escapeHtml(item.reward || 'Free rewards')}</td>
                                <td class="px-4 py-3 text-cozy-wood">${escapeHtml(item.expires || 'No posted expiry')}</td>
                                <td class="px-4 py-3"><button type="button" class="copy-code-btn rounded-lg border border-cozy-bark bg-white px-3 py-2 font-bold text-cozy-bark" data-copy-code="${escapeHtml(item.code)}">Copy</button></td>
                            </tr>`;
  }).join('\n');
}

function renderExpiredList(data) {
  return data.expired.map((item) => `                    <div class="flex items-center justify-between gap-3">
                        <code class="code-badge bg-gray-500 text-white px-2 py-1 rounded text-xs">${escapeHtml(item.code)}</code>
                        <span class="text-cozy-wood/60 text-right">${escapeHtml(item.note || 'Expired')}</span>
                    </div>`).join('\n');
}

function replaceJsonLdDates(html, isoDate, displayDate, newestCodes) {
  return html
    .replace(/"dateModified":\s*"\d{4}-\d{2}-\d{2}"/g, `"dateModified": "${isoDate}"`)
    .replace(/As of [A-Z][a-z]+ \d{1,2}, \d{4}, the newest codes to try first include [^"]+\./g,
      `As of ${displayDate}, the newest codes to try first include ${newestCodes}.`);
}

function renderPage(html, data) {
  const isoDate = data.lastChecked;
  const displayDate = longDate(isoDate);
  const compactDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${isoDate}T12:00:00Z`));
  const newestCodes = data.active.slice(0, 7).map((item) => item.code).join(', ');

  html = html
    .replace(/<!-- S[E]O Meta Tags -->/g, '<!-- Meta Tags -->')
    .replace(/Heartopia Codes \(Updated [^)]+\): Active Redeem Codes & Rewards/g, `Heartopia Codes (Updated ${displayDate}): Active Redeem Codes & Rewards`)
    .replace(/Updated [A-Z][a-z]+ \d{1,2}, \d{4}: active Heartopia redeem codes/g, `Updated ${displayDate}: active Heartopia redeem codes`)
    .replace(/Last Updated: [A-Z][a-z]+ \d{1,2}, \d{4}/g, `Last Updated: ${displayDate}`)
    .replace(/Heartopia Codes \(Updated [^)]+\)/g, `Heartopia Codes (Updated ${displayDate})`)
    .replace(/Last checked on [A-Z][a-z]+ \d{1,2}, \d{4}/g, `Last checked on ${displayDate}`)
    .replace(/checked on [A-Z][a-z]+ \d{1,2}, \d{4}/g, `checked on ${displayDate}`)
    .replace(/current list was checked on [A-Z][a-z]+ \d{1,2}, \d{4}/g, `current list was checked on ${displayDate}`)
    .replace(/<!-- Latest codes: checked [^-]+-->/, `<!-- Latest codes: checked ${displayDate} -->`);

  html = html
    .replace(/(<div data-code-active-count[^>]*>)[^<]+(<\/div>)/, `$1${data.active.length}$2`)
    .replace(/(<div data-code-last-checked[^>]*>)[^<]+(<\/div>)/, `$1${compactDate}$2`)
    .replace(/(<div data-code-expired-count[^>]*>)[^<]+(<\/div>)/, `$1${data.expired.length}$2`);

  html = replaceJsonLdDates(html, isoDate, displayDate, newestCodes);

  html = html.replace(
    /(<section id="active-codes"[\s\S]*?<tbody class="divide-y divide-cozy-peach\/30">)[\s\S]*?(<\/tbody>)/,
    `$1\n                            <!-- Latest codes: checked ${displayDate} -->\n${renderActiveRows(data)}\n                        $2`
  );

  html = html.replace(
    /(<section id="expired-codes"[\s\S]*?<div class="space-y-2 text-sm">)[\s\S]*?(<\/div>\s*<\/div>\s*<\/section>)/,
    `$1\n${renderExpiredList(data)}\n                $2`
  );

  return html;
}

function cleanOutput(text) {
  return `${text.replace(/[ \t]+$/gm, '').trimEnd()}\n`;
}
function renderSitemap(xml, isoDate) {
  return xml.replace(
    /(<loc>https:\/\/heartopia\.life\/codes\/<\/loc>\s*<lastmod>)[^<]+(<\/lastmod>)/,
    `$1${isoDate}$2`
  );
}
async function main() {
  const data = JSON.parse(await fs.readFile(dataPath, 'utf8'));
  data.sources ||= [];
  data.pending ||= [];
  if (!renderOnly) data.lastChecked = TODAY;

  if (!renderOnly) {
    const knownCodes = new Set([
      ...data.active.map((item) => normalizeCode(item.code)),
      ...data.expired.map((item) => normalizeCode(item.code)),
      ...data.pending.map((item) => normalizeCode(item.code))
    ]);
    const mergedFindings = new Map();

    for (const url of data.sources) {
      try {
        const html = await fetchSource(url);
        const hits = extractCandidates(html, url, knownCodes);
        for (const [key, hit] of hits) {
          const existing = mergedFindings.get(key) || { ...hit, sources: [], contexts: [], activeHints: 0, expiredHints: 0 };
          existing.sources = uniq([...existing.sources, ...hit.sources]);
          existing.contexts = uniq([...existing.contexts, ...hit.contexts]);
          existing.activeHints += hit.activeHints;
          existing.expiredHints += hit.expiredHints;
          mergedFindings.set(key, existing);
        }
        console.log(`Fetched ${url}: ${hits.size} candidates`);
      } catch (error) {
        console.warn(`Could not fetch ${url}: ${error.message}`);
      }
    }

    mergeFindings(data, mergedFindings);
  }

  const html = await fs.readFile(pagePath, 'utf8');
  const rendered = renderPage(html, data);
  const sitemap = await fs.readFile(sitemapPath, 'utf8');
  const renderedSitemap = renderSitemap(sitemap, data.lastChecked);

  if (dryRun) {
    console.log(JSON.stringify({
      lastChecked: data.lastChecked,
      active: data.active.length,
      expired: data.expired.length,
      pending: data.pending.length
    }, null, 2));
    return;
  }

  await fs.writeFile(dataPath, `${JSON.stringify(data, null, 2)}\n`);
  await fs.writeFile(pagePath, cleanOutput(rendered));
  await fs.writeFile(sitemapPath, cleanOutput(renderedSitemap));
  console.log(`Updated codes page: ${data.active.length} active, ${data.expired.length} expired, ${data.pending.length} pending`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
