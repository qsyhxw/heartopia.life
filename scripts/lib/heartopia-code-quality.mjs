const OFFICIAL_HOSTS = new Set(['x.com', 'twitter.com']);
const OFFICIAL_MIRRORS = new Set(['w.twstalker.com']);

export function normalizeCode(value) {
  return String(value || '').trim().toLowerCase();
}

export function sourceIdentity(url) {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return String(url || '').toLowerCase();
  }
}

export function sourceRole(url) {
  const host = sourceIdentity(url);
  const path = (() => {
    try { return new URL(url).pathname.toLowerCase(); } catch { return ''; }
  })();
  if (OFFICIAL_HOSTS.has(host) && /myheartopia/.test(path)) return 'official';
  if (OFFICIAL_MIRRORS.has(host) && /myheartopia/.test(path)) return 'official-mirror';
  return 'tracker';
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

function htmlToLines(html) {
  return decodeHtml(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<\/(?:h[1-6]|p|li|tr|td|th|div|section|article|br)>/gi, '\n')
    .replace(/<(?:br|hr)\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

function sectionFromLine(line) {
  if (/(expired|inactive|no longer (?:work|valid)|not working|invalid)\s+(?:heartopia\s+)?codes?/i.test(line)) return 'expired';
  if (/(active|working|current|new|latest)\s+(?:heartopia\s+)?codes?/i.test(line)) return 'active';
  return null;
}

function signalFromContext(line, section, role) {
  const expired = /\b(expired|inactive|invalid|no longer (?:works?|valid)|not working)\b/i.test(line);
  const active = /\b(active|working|current|new|latest|redeem|claim)\b/i.test(line);
  if (expired && !active) return 'expired';
  if (active && !expired) return 'active';
  if (section) return section;
  if (role === 'official' && /\b(code|redeem|gift|reward)\b/i.test(line)) return 'active';
  return 'ambiguous';
}

export function extractCandidateSignals(html, url, knownCodes, stopwords) {
  const role = sourceRole(url);
  const source = sourceIdentity(url);
  const candidates = new Map();
  let section = null;
  const tokenRe = /\b[A-Za-z0-9][A-Za-z0-9_-]{5,31}\b/g;

  for (const line of htmlToLines(html)) {
    section = sectionFromLine(line) || section;
    let match;
    while ((match = tokenRe.exec(line))) {
      const code = match[0];
      const key = normalizeCode(code);
      if (code.length < 6 || code.length > 32) continue;
      if (stopwords.has(key) || /^\d+$/.test(code) || /^20\d{2}$/.test(code)) continue;
      if (!knownCodes.has(key)) {
        if (!/^[a-z0-9_-]+$/i.test(code) || !/\d/.test(code) || !/[a-z]/i.test(code)) continue;
        if (!/\b(codes?|redeem|gift|rewards?|active|expired|working|claim)\b/i.test(line)) continue;
      }

      const signal = signalFromContext(line, section, role);
      const item = candidates.get(key) || {
        code,
        activeSources: new Set(),
        expiredSources: new Set(),
        ambiguousSources: new Set(),
        officialSources: new Set(),
        mirrorSources: new Set(),
        contexts: []
      };
      item[`${signal}Sources`].add(source);
      if (role === 'official') item.officialSources.add(source);
      if (role === 'official-mirror') item.mirrorSources.add(source);
      item.contexts.push(line.slice(0, 300));
      candidates.set(key, item);
    }
  }
  return candidates;
}

export function mergeSignal(target, incoming) {
  const output = target || {
    code: incoming.code,
    activeSources: new Set(), expiredSources: new Set(), ambiguousSources: new Set(),
    officialSources: new Set(), mirrorSources: new Set(), contexts: []
  };
  for (const field of ['activeSources', 'expiredSources', 'ambiguousSources', 'officialSources', 'mirrorSources']) {
    for (const value of incoming[field]) output[field].add(value);
  }
  output.contexts = [...new Set([...output.contexts, ...incoming.contexts])].slice(0, 6);
  return output;
}

export function promotionDecision(hit) {
  const active = hit.activeSources.size;
  const expired = hit.expiredSources.size;
  const official = hit.officialSources.size > 0 && active > 0;
  const mirroredOfficialPlusTracker = hit.mirrorSources.size > 0
    && [...hit.activeSources].some((source) => !hit.mirrorSources.has(source));

  if (expired > 0) return { publish: false, reason: 'conflicting_or_expired_evidence' };
  if (official) return { publish: true, reason: 'official_announcement' };
  if (active >= 2 && (mirroredOfficialPlusTracker || hit.mirrorSources.size === 0)) {
    return { publish: true, reason: 'two_independent_current_sources' };
  }
  return { publish: false, reason: 'insufficient_independent_evidence' };
}

export function shouldRetire(hit) {
  return hit && hit.expiredSources.size >= 2 && hit.activeSources.size === 0;
}

export function isPastExpiry(item, now = new Date()) {
  if (!item.expiresAt) return false;
  const expiry = new Date(item.expiresAt);
  return !Number.isNaN(expiry.valueOf()) && expiry <= now;
}
