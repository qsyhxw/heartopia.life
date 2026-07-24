import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { assertRemoteFields } from './sync-field-policy.mjs';

const root = path.resolve(import.meta.dirname, '..');
const dataPath = process.env.CALL_OF_WHALES_DATA_PATH
  ? path.resolve(process.env.CALL_OF_WHALES_DATA_PATH)
  : path.join(root, 'data', 'heartopia-call-of-whales-routes.json');
const routeTermsPath = path.join(root, 'scripts', 'config', 'call-of-whales-route-terms.json');
const routeTerms = JSON.parse(fs.readFileSync(routeTermsPath, 'utf8'));
const primaryUrl = 'https://www.taptap.cn/moment/824870918210718847';
const hubUrl = 'https://www.taptap.cn/app/45213/strategy/entity-collection/386564';
const eventEnd = new Date('2026-08-23T00:00:00Z');
const eventStart = new Date('2026-07-11T00:00:00Z');
const dryRun = process.argv.includes('--check') || process.env.DRY_RUN === '1';
const auditDir = process.env.HEARTOPIA_SYNC_DIR || '';
const auditPath = auditDir ? path.join(auditDir, 'call-of-whales-route-audit.json') : '';

const colorMap = new Map([
  ['黄绿色', 'Yellow-Green'], ['黄绿', 'Yellow-Green'], ['天蓝色', 'Sky Blue'], ['天蓝', 'Sky Blue'],
  ['浅蓝色', 'Light Blue'], ['浅蓝', 'Light Blue'], ['青色', 'Cyan'], ['灰色', 'Gray'],
  ['蓝紫色', 'Blue-Purple'], ['蓝紫', 'Blue-Purple'],
  ['深蓝色', 'Deep Blue'], ['深蓝', 'Deep Blue'], ['深紫色', 'Deep Purple'], ['深紫', 'Deep Purple'],
  ['米白色', 'Ivory'], ['米白', 'Ivory'], ['银色', 'Silver'], ['金色', 'Gold'], ['棕色', 'Brown'],
  ['粉色', 'Pink'], ['紫色', 'Purple'], ['黄色', 'Yellow'], ['橙色', 'Orange'],
  ['绿色', 'Green'], ['红色', 'Red'], ['白色', 'White'], ['黑色', 'Black'], ['彩虹', 'Rainbow'],
]);

const redditColorTerms = {
  'Yellow-Green': ['yellow green', 'yellow-green', 'green tail'],
  'Sky Blue': ['sky blue', 'blue purple tail'],
  'Light Blue': ['light blue'],
  Gray: ['gray', 'grey'],
  Cyan: ['cyan', 'teal'],
  'Blue-Purple': ['blue purple', 'blue-purple', 'indigo', 'violet blue'],
};

const decode = (value) => String(value || '')
  .replace(/&nbsp;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/&quot;/gi, '"')
  .replace(/&#39;|&apos;/gi, "'")
  .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
  .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number(number)));

function htmlToText(html) {
  return decode(html)
    .replace(/<script\b[\s\S]*?<\/script>/gi, '\n')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '\n')
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<\/(?:p|div|li|h[1-6]|article|section)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n')
    .trim();
}

const colorTokens = [
  ['蓝', 'Blue'], ['紫', 'Purple'], ['绿', 'Green'], ['黄', 'Yellow'], ['红', 'Red'],
  ['橙', 'Orange'], ['粉', 'Pink'], ['青', 'Cyan'], ['灰', 'Gray'], ['白', 'White'],
  ['黑', 'Black'], ['银', 'Silver'], ['金', 'Gold'], ['棕', 'Brown'],
];

const colorModifiers = new Map([
  ['浅', 'Light'], ['深', 'Deep'], ['亮', 'Bright'], ['淡', 'Pale'],
]);

export function resolveWhaleColor(label) {
  const normalized = String(label || '').replace(/\s+/g, '').replace(/色$/u, '');
  for (const [chinese, english] of colorMap) {
    if (normalized === chinese.replace(/色$/u, '')) return { color: english, unknownTokens: [] };
  }

  let rest = normalized;
  let modifier = '';
  for (const [token, english] of colorModifiers) {
    if (rest.startsWith(token)) {
      modifier = english;
      rest = rest.slice(token.length);
      break;
    }
  }
  const parts = [];
  while (rest) {
    const token = colorTokens.find(([chinese]) => rest.startsWith(chinese));
    if (!token) break;
    parts.push(token[1]);
    rest = rest.slice(token[0].length);
  }
  if (!parts.length || rest) return { color: '', unknownTokens: rest ? [rest] : [normalized] };
  const color = parts.join('-');
  return { color: modifier ? `${modifier} ${color}` : color, unknownTokens: [] };
}

export function parseWhaleEntries(html) {
  const lines = htmlToText(html).split('\n').map((line) => line.trim()).filter(Boolean);
  const found = [];
  for (let index = 0; index < lines.length; index += 1) {
    const hit = lines[index].match(/([\u3400-\u9fff]{1,12})喷水小鲸鱼[：:]\s*(.+)$/);
    if (!hit) continue;
    let bubble = '';
    for (let lookahead = index + 1; lookahead < Math.min(lines.length, index + 8); lookahead += 1) {
      if (/喷水小鲸鱼[：:]/.test(lines[lookahead])) break;
      const bubbleHit = lines[lookahead].match(/家具泡泡[：:]\s*(.+)$/);
      if (bubbleHit) { bubble = bubbleHit[1]; break; }
    }
    const colorResult = resolveWhaleColor(hit[1]);
    if (!found.some((item) => item.rawLabel === hit[1])) {
      found.push({
        rawLabel: hit[1],
        color: colorResult.color,
        unknownColorTokens: colorResult.unknownTokens,
        locationZh: hit[2] || '',
        bubbleZh: bubble,
        missingFields: [!hit[2] && 'location', !bubble && 'rewardBubble'].filter(Boolean),
      });
    }
  }
  return found.reverse();
}

export function parseWhaleGuide(html, currentRoutes) {
  const chronological = parseWhaleEntries(html);
  const knownDays = new Map(currentRoutes.map((route) => [route.color, route.day]));
  for (let index = 0; index < chronological.length; index += 1) {
    const expected = index + 1;
    const known = knownDays.get(chronological[index].color);
    if (known && known !== expected) throw new Error(`Known whale order changed at Day ${expected}.`);
    chronological[index].day = expected;
  }
  return chronological;
}

async function fetchText(url, accept = 'text/html,application/xhtml+xml') {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(url, {
      headers: { 'user-agent': 'HeartopiaLifeEventFactMonitor/1.0 (+https://heartopia.life/)', accept },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Remote request failed with ${response.status}.`);
    return response.text();
  } finally {
    clearTimeout(timeout);
  }
}

async function redditConfirms(day, color) {
  const query = encodeURIComponent(`Oceanbound Whale Hunt Day ${day}`);
  try {
    const raw = await fetchText(`https://www.reddit.com/r/heartopia/search.json?q=${query}&restrict_sr=1&sort=new&t=month`, 'application/json');
    const json = JSON.parse(raw);
    const text = (json.data?.children || []).map(({ data }) => `${data.title || ''} ${data.selftext || ''}`.toLowerCase()).join(' ');
    const terms = redditColorTerms[color] || [color.toLowerCase()];
    return text.includes(`day ${day}`) && terms.some((term) => text.includes(term));
  } catch {
    return false;
  }
}

function normalizedFact(value) {
  try {
    return structureRouteFact(value).toLowerCase().replace(/\s+/g, ' ').trim();
  } catch {
    return '';
  }
}

export function hubConfirmsRoute(candidate, hubHtml) {
  const match = parseWhaleEntries(hubHtml).find((item) => item.rawLabel === candidate.rawLabel);
  if (!match) return false;
  const hubLocation = normalizedFact(match.locationZh);
  const candidateLocation = normalizedFact(candidate.locationZh);
  const hubBubble = normalizedFact(match.bubbleZh);
  const candidateBubble = normalizedFact(candidate.bubbleZh);
  return Boolean(hubLocation && candidateLocation && hubBubble && candidateBubble)
    && hubLocation === candidateLocation
    && hubBubble === candidateBubble;
}

function writeAudit(report) {
  if (!auditPath) return;
  fs.mkdirSync(auditDir, { recursive: true });
  fs.writeFileSync(auditPath, `${JSON.stringify(report, null, 2)}\n`);
}

export class UnmappedRouteTermError extends Error {
  constructor(terms) {
    super(`Unmapped route terms: ${terms.join(', ')}`);
    this.name = 'UnmappedRouteTermError';
    this.code = 'UNMAPPED_ROUTE_TERMS';
    this.terms = terms;
  }
}

export function structureRouteFact(value) {
  let rest = String(value || '').replace(/\s+/g, '');
  const consumeFirst = (entries) => {
    for (const entry of entries) {
      for (const pattern of [...entry.patterns].sort((a, b) => b.length - a.length)) {
        if (rest.includes(pattern)) {
          rest = rest.replace(pattern, '');
          return entry.value;
        }
      }
    }
    return '';
  };
  const area = consumeFirst(routeTerms.areas);
  const landmark = consumeFirst(routeTerms.landmarks);
  const positions = [];
  for (const entry of routeTerms.positions) {
    for (const pattern of [...entry.patterns].sort((a, b) => b.length - a.length)) {
      if (rest.includes(pattern)) {
        rest = rest.replace(pattern, '');
        positions.push(entry.value);
        break;
      }
    }
  }
  if (rest.includes('安妮') && rest.includes('皑皑')) {
    rest = rest.replace('安妮', '').replace('皑皑', '').replace(/和|与|中间/g, '');
    positions.push('between Annie and Aiai');
  }
  if (rest.includes('奥利弗')) {
    rest = rest.replace('奥利弗', '');
    positions.push('near Oliver');
  }
  for (const ignored of [...routeTerms.ignored].sort((a, b) => b.length - a.length)) rest = rest.split(ignored).join('');
  rest = rest.replace(/\s+/g, '');
  const unknownTerms = [...new Set(rest.match(/[\u3400-\u9fff]+/g) || [])];
  if (unknownTerms.length) throw new UnmappedRouteTermError(unknownTerms);
  if (!area && !landmark) throw new Error('A route is missing a recognized area or landmark.');
  return [
    area && `Area: ${area}`,
    landmark && `${area ? 'landmark' : 'Landmark'}: ${landmark}`,
    positions.length && `position: ${[...new Set(positions)].join(', ')}`,
  ].filter(Boolean).join('; ') + '.';
}

function unlockDate(day) {
  const date = new Date(eventStart);
  date.setUTCDate(date.getUTCDate() + day - 1);
  return date;
}

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function main() {
  const now = process.env.CALL_OF_WHALES_NOW ? new Date(process.env.CALL_OF_WHALES_NOW) : new Date();
  if (Number.isNaN(now.getTime())) throw new Error('CALL_OF_WHALES_NOW is not a valid date.');
  if (now >= eventEnd && !process.env.CALL_OF_WHALES_PRIMARY_HTML) {
    console.log('Call of Whales route monitor is outside the active event window.');
    return;
  }

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  for (const route of data.routes) assertRemoteFields('eventRoutes', route);
  const primaryHtml = process.env.CALL_OF_WHALES_PRIMARY_HTML
    ? fs.readFileSync(path.resolve(process.env.CALL_OF_WHALES_PRIMARY_HTML), 'utf8')
    : await fetchText(primaryUrl);
  const hubHtml = process.env.CALL_OF_WHALES_HUB_HTML
    ? fs.readFileSync(path.resolve(process.env.CALL_OF_WHALES_HUB_HTML), 'utf8')
    : await fetchText(hubUrl).catch(() => '');
  const parsed = parseWhaleGuide(primaryHtml, data.routes);

  if (parsed.length < data.routes.length || parsed.length > data.total) throw new Error('Guide count failed the monotonic range check.');
  const known = parsed.slice(0, data.routes.length);
  if (known.some((item, index) => item.day !== data.routes[index].day || item.color !== data.routes[index].color)) {
    throw new Error('Existing whale sequence no longer matches the verified local baseline.');
  }

  const additions = [];
  const candidates = [];
  for (const candidate of parsed.slice(data.routes.length)) {
    if (candidate.day !== data.routes.length + additions.length + 1) break;
    if (unlockDate(candidate.day) > now) break;
    const auditCandidate = {
      day: candidate.day,
      sourceLabel: candidate.rawLabel,
      color: candidate.color || null,
      location: candidate.locationZh,
      rewardBubble: candidate.bubbleZh,
      unknownTerms: [...candidate.unknownColorTokens],
      missingFields: candidate.missingFields,
      confidence: 'low',
      confirmation: { hubExact: false, redditSignal: false },
      publishable: false,
    };
    if (!candidate.color || candidate.missingFields.length) {
      candidates.push(auditCandidate);
      writeAudit({ checkedAt: new Date().toISOString(), status: 'needs-mapping', publishedThrough: data.routes.length, candidates });
      throw new Error(`Day ${candidate.day} was detected but needs a color mapping or required field; see the private route audit artifact.`);
    }
    let location;
    let rewardBubble;
    try {
      location = structureRouteFact(candidate.locationZh);
      rewardBubble = structureRouteFact(candidate.bubbleZh);
    } catch (error) {
      auditCandidate.unknownTerms = [...new Set([...auditCandidate.unknownTerms, ...(Array.isArray(error.terms) ? error.terms : [])])];
      candidates.push(auditCandidate);
      writeAudit({ checkedAt: new Date().toISOString(), status: 'needs-mapping', publishedThrough: data.routes.length, candidates });
      throw new Error(`Day ${candidate.day} contains an unmapped route term; see the private route audit artifact.`);
    }
    const hubExact = hubConfirmsRoute(candidate, hubHtml);
    const redditSignal = await redditConfirms(candidate.day, candidate.color);
    auditCandidate.location = location;
    auditCandidate.rewardBubble = rewardBubble;
    auditCandidate.confirmation = { hubExact, redditSignal };
    auditCandidate.confidence = hubExact ? 'high' : redditSignal ? 'medium' : 'low';
    auditCandidate.publishable = hubExact;
    candidates.push(auditCandidate);
    if (!hubExact) {
      console.log(`Day ${candidate.day} is pending an exact second-guide route confirmation.`);
      break;
    }
    const route = {
      day: candidate.day,
      id: `day-${candidate.day}-${slug(candidate.color)}-splash-whale`,
      name: `${candidate.color} Splash Whale`,
      color: candidate.color,
      location,
      rewardBubble,
    };
    assertRemoteFields('eventRoutes', route);
    additions.push(route);
  }

  if (!additions.length) {
    writeAudit({ checkedAt: new Date().toISOString(), publishedThrough: data.routes.length, candidates });
    console.log(`Verified ${data.routes.length} published whale routes; no publishable addition found.`);
    return;
  }

  const next = {
    ...data,
    updatedAt: new Date().toISOString().slice(0, 10),
    routes: [...data.routes, ...additions],
  };
  if (dryRun) {
    writeAudit({ checkedAt: new Date().toISOString(), publishedThrough: data.routes.length, candidates, dryRun: true });
    console.log(`Dry run verified ${additions.length} new whale route(s).`);
    return;
  }
  fs.writeFileSync(dataPath, `${JSON.stringify(next, null, 2)}\n`);
  writeAudit({ checkedAt: new Date().toISOString(), publishedThrough: next.routes.length, candidates, published: additions.map((route) => route.day) });
  const build = spawnSync(process.execPath, [path.join(root, 'scripts', 'build-call-of-whales-routes.mjs')], { cwd: root, stdio: 'inherit' });
  if (build.status !== 0) throw new Error('Call of Whales page rebuild failed.');
  console.log(`Published ${additions.length} newly cross-checked whale route(s).`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) await main();
