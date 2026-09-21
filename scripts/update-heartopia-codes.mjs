import fs from 'node:fs/promises';
import path from 'node:path';
import {
  extractCandidateSignals,
  isPastExpiry,
  mergeSignal,
  normalizeCode,
  promotionDecision,
  shouldRetire,
  sourceIdentity,
  sourceRole
} from './lib/heartopia-code-quality.mjs';

const root = process.cwd();
const dataPath = path.join(root, 'data', 'heartopia-codes.json');
const pagePath = path.join(root, 'codes', 'index.html');
const sitemapPath = path.join(root, 'sitemap.xml');
const args = new Set(process.argv.slice(2));
const renderOnly = args.has('--render-only');
const dryRun = args.has('--dry-run');

const USER_AGENT = 'HeartopiaLifeCodeBot/1.0 (+https://heartopia.life/codes/)';
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

function uniq(values) {
  return [...new Set(values.filter(Boolean))];
}

async function fetchSource(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
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

function evidenceUrls(data, identities) {
  return data.sources.filter((url) => identities.has(sourceIdentity(url)));
}

function archiveItem(item, now, note) {
  return {
    ...item,
    status: undefined,
    verification: undefined,
    needsCheck: undefined,
    lastSeen: now,
    note
  };
}

function mergeFindings(data, findings, nowDate = new Date()) {
  const activeByKey = new Map(data.active.map((item) => [normalizeCode(item.code), item]));
  const expiredByKey = new Map(data.expired.map((item) => [normalizeCode(item.code), item]));
  const pendingByKey = new Map((data.pending || []).map((item) => [normalizeCode(item.code), item]));
  const now = data.lastChecked;

  for (const [key, item] of activeByKey) {
    if (!isPastExpiry(item, nowDate)) continue;
    activeByKey.delete(key);
    expiredByKey.set(key, archiveItem(item, now, 'Expired at the published deadline.'));
  }

  for (const [key, hit] of findings) {
    const activeUrls = evidenceUrls(data, hit.activeSources);
    const expiredUrls = evidenceUrls(data, hit.expiredSources);
    const decision = promotionDecision(hit);

    if (activeByKey.has(key)) {
      const item = activeByKey.get(key);
      if (hit.activeSources.size > 0) {
        item.lastSeen = now;
        item.sourceCount = hit.activeSources.size;
        item.sources = uniq([...(item.sources || []), ...activeUrls]);
      }
      if (shouldRetire(hit)) {
        activeByKey.delete(key);
        expiredByKey.set(key, archiveItem(item, now, 'Listed as expired by two independent current sources.'));
      } else {
        item.needsCheck = hit.expiredSources.size > 0;
      }
      continue;
    }

    if (expiredByKey.has(key)) {
      const item = expiredByKey.get(key);
      item.sources = uniq([...(item.sources || []), ...expiredUrls]);
      if (decision.publish) {
        expiredByKey.delete(key);
        activeByKey.set(key, {
          ...item,
          status: 'new',
          firstSeen: item.firstSeen || now,
          lastSeen: now,
          expires: 'No posted expiry',
          sourceCount: hit.activeSources.size,
          sources: activeUrls,
          verification: decision.reason === 'official_announcement' ? 'Official announcement' : 'Confirmed by 2 independent current sources',
          note: 'Automatically restored only after current-source consensus.'
        });
      }
      continue;
    }

    if (decision.publish) {
      activeByKey.set(key, {
        code: hit.code,
        reward: 'Free rewards',
        expires: 'No posted expiry',
        status: 'new',
        firstSeen: now,
        lastSeen: now,
        sourceCount: hit.activeSources.size,
        sources: activeUrls,
        verification: decision.reason === 'official_announcement' ? 'Official announcement' : 'Confirmed by 2 independent current sources',
        note: 'Automatically published after the code quality gate passed.'
      });
      pendingByKey.delete(key);
      continue;
    }

    const pending = pendingByKey.get(key) || {
      code: hit.code,
      reward: 'Unknown',
      firstSeen: now,
      status: hit.expiredSources.size > 0 ? 'possibly_expired' : 'awaiting_cross_check',
      sources: [],
      contexts: []
    };
    pending.lastSeen = now;
    pending.sourceCount = Math.max(pending.sourceCount || 0, hit.activeSources.size);
    pending.sources = uniq([...(pending.sources || []), ...activeUrls, ...expiredUrls]);
    pending.contexts = uniq([...(pending.contexts || []), ...hit.contexts]).slice(0, 5);
    pending.reason = decision.reason;
    pendingByKey.set(key, pending);
  }

  data.pending = [...pendingByKey.values()].sort((a, b) => String(b.lastSeen || '').localeCompare(String(a.lastSeen || '')));
  data.active = dedupeByCode([...activeByKey.values()]);
  data.expired = dedupeByCode([...expiredByKey.values()]);
}

function validatePublicList(data, nowDate = new Date()) {
  const active = new Set();
  const expired = new Set(data.expired.map((item) => normalizeCode(item.code)));
  for (const item of data.active) {
    const key = normalizeCode(item.code);
    if (!key || active.has(key)) throw new Error(`Duplicate active code: ${item.code}`);
    if (expired.has(key)) throw new Error(`Code appears in active and expired lists: ${item.code}`);
    if (isPastExpiry(item, nowDate)) throw new Error(`Expired code remained public: ${item.code}`);
    const identities = new Set((item.sources || []).map(sourceIdentity).filter(Boolean));
    const official = (item.sources || []).some((url) => sourceRole(url) === 'official');
    if (!official && identities.size < 2) throw new Error(`Active code lacks independent evidence: ${item.code}`);
    active.add(key);
  }
}

function renderActiveRows(data) {
  return data.active.map((item) => {
    const isNew = item.status === 'new';
    const rowClass = isNew ? ' class="bg-green-50"' : item.status === 'active' ? ' class="bg-cozy-sky/20"' : '';
    const badgeClass = isNew ? 'bg-green-600' : item.status === 'active' ? 'bg-cozy-coral' : 'bg-cozy-bark';
    const newBadge = isNew ? ' <span class="ml-1 text-xs bg-green-500 text-white px-1 rounded">NEW</span>' : '';
    return `                            <tr${rowClass}>
                                <td class="px-4 py-3"><code class="code-badge ${badgeClass} text-white px-2 py-1 rounded text-xs font-bold">${escapeHtml(item.code)}</code>${newBadge}</td>
                                <td class="px-4 py-3">${escapeHtml(item.reward || 'Free rewards')}</td>
                                <td class="px-4 py-3 text-cozy-wood">${escapeHtml(item.expires || 'No posted expiry')}</td>
                                <td class="px-4 py-3"><button type="button" class="copy-code-btn rounded-lg border border-cozy-bark bg-white px-3 py-2 font-bold text-cozy-bark" data-copy-code="${escapeHtml(item.code)}">Copy</button></td>
                            </tr>`;
  }).join('\n');
}

function renderExpiredList(data) {
  const recent = data.expired.slice(0, 8).map((item) => `                    <div class="flex items-center justify-between gap-3">
                        <code class="code-badge bg-gray-500 text-white px-2 py-1 rounded text-xs">${escapeHtml(item.code)}</code>
                        <span class="text-cozy-wood/60 text-right">${escapeHtml(item.note || 'Expired')}</span>
                    </div>`).join('\n');
  return `${recent}
                    <div class="border-t border-cozy-peach/40 pt-4 text-center">
                        <a href="/codes/expired/" class="inline-flex min-h-11 items-center justify-center rounded-lg border-2 border-cozy-bark px-4 py-2 font-bold text-cozy-bark hover:bg-white">Search all ${data.expired.length} expired codes</a>
                    </div>`;
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
  const newestCodes = data.active.map((item) => item.code).join(', ');

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

  if (!renderOnly) {
    const knownCodes = new Set([
      ...data.active.map((item) => normalizeCode(item.code)),
      ...data.expired.map((item) => normalizeCode(item.code)),
      ...data.pending.map((item) => normalizeCode(item.code))
    ]);
    const mergedFindings = new Map();
    const successfulSources = new Set();

    const sourceResults = await Promise.all(data.sources.map(async (url) => {
      try {
        const html = await fetchSource(url);
        return { url, hits: extractCandidateSignals(html, url, knownCodes, STOPWORDS) };
      } catch (error) {
        return { url, error };
      }
    }));

    for (const result of sourceResults) {
      if (result.error) {
        console.warn(`Could not fetch ${result.url}: ${result.error.message}`);
        continue;
      }
      const { url, hits } = result;
      const containsKnownCode = [...hits.keys()].some((key) => knownCodes.has(key));
      const meaningfulResponse = sourceRole(url) === 'official' || containsKnownCode || hits.size >= 2;
      if (!meaningfulResponse) {
        console.warn(`Ignored ${url}: response did not contain a recognizable code list.`);
        continue;
      }
      successfulSources.add(sourceIdentity(url));
      for (const [key, hit] of hits) {
        mergedFindings.set(key, mergeSignal(mergedFindings.get(key), hit));
      }
      console.log(`Fetched ${url}: ${hits.size} candidates`);
    }

    if (successfulSources.size < 2) {
      throw new Error(`Quality gate stopped publication: only ${successfulSources.size} independent source(s) were reachable.`);
    }
    const nowDate = new Date();
    data.lastChecked = nowDate.toISOString().slice(0, 10);
    mergeFindings(data, mergedFindings, nowDate);
    validatePublicList(data, nowDate);
    data.automation = {
      lastRun: nowDate.toISOString(),
      successfulIndependentSources: successfulSources.size,
      policy: 'Official announcement, or two independent current-source confirmations; conflicting candidates are withheld.'
    };
  } else {
    validatePublicList(data);
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
      pending: data.pending.length,
      pendingCodes: data.pending.map((item) => ({ code: item.code, reason: item.reason || item.status }))
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
