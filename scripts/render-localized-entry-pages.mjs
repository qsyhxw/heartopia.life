import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const eventData = JSON.parse(fs.readFileSync(path.join(root, 'data/heartopia-events.json'), 'utf8'));
const current = eventData.events.filter((event) => ['active', 'upcoming'].includes(event.status));
const today = eventData.generatedAt || new Date().toISOString().slice(0, 10);
const officialSite = 'https://heartopia.xd.com';
const googlePlay = 'https://play.google.com/store/apps/details?id=com.xd.xdtglobal.gp';

const locales = {
  id: {
    lang: 'id', og: 'id_ID', prefix: '/id', site: `${officialSite}/id/`,
    events: 'Event Heartopia', active: 'Sedang berlangsung', upcoming: 'Segera hadir',
    intro: 'Lihat event yang sedang aktif dan diumumkan, lengkap dengan jadwal yang diperbarui dari data event Heartopia.Life.',
    verify: 'Konfirmasikan waktu server, syarat masuk, tugas, dan hadiah di panel event dalam game.',
    download: 'Download Heartopia dengan Aman', safety: 'Keamanan Heartopia',
    downloadIntro: 'Gunakan situs resmi XD atau halaman Google Play yang terverifikasi. Untuk platform lain, mulai dari situs resmi agar tidak salah membuka tautan toko.',
    play: 'Buka Google Play resmi', xd: 'Buka situs resmi Heartopia',
    storeNote: 'Mencari Steam, iPhone, iPad, atau platform lain? Pilih platform dari situs resmi Heartopia. Kami tidak menautkan halaman toko yang belum diverifikasi di repositori ini.',
    safeTitle: 'Cara mengecek unduhan, akun, dan pembayaran',
    safeIntro: 'Pisahkan risiko file palsu, pencurian akun, chat, dan pembayaran pihak ketiga. Semuanya memerlukan pemeriksaan yang berbeda.',
    checks: ['Pastikan domainnya heartopia.xd.com atau play.google.com.', 'Di Google Play, periksa paket com.xd.xdtglobal.gp dan developer XD Entertainment.', 'Jangan instal APK, MOD, crack, atau launcher dari situs tidak dikenal.', 'Jangan berikan kata sandi atau kode sekali pakai kepada siapa pun.'],
    footer: 'Situs penggemar tidak resmi. Selalu konfirmasikan informasi langsung di dalam game dan kanal resmi XD.',
    nav: { codes: 'Kode', gacha: 'Gacha', topup: 'Top Up', events: 'Event', download: 'Download' },
  },
  'pt-br': {
    lang: 'pt-BR', og: 'pt_BR', prefix: '/pt-br', site: `${officialSite}/pt/`,
    events: 'Eventos de Heartopia', active: 'Acontecendo agora', upcoming: 'Em breve',
    intro: 'Veja os eventos ativos e anunciados, com datas atualizadas a partir dos dados de eventos do Heartopia.Life.',
    verify: 'Confirme o horário do servidor, os requisitos, as tarefas e as recompensas no painel do evento dentro do jogo.',
    download: 'Baixar Heartopia com Segurança', safety: 'Segurança no Heartopia',
    downloadIntro: 'Use o site oficial da XD ou a página verificada do Google Play. Para outras plataformas, comece pelo site oficial para evitar links incorretos de lojas.',
    play: 'Abrir Google Play oficial', xd: 'Abrir site oficial de Heartopia',
    storeNote: 'Procurando Steam, iPhone, iPad ou outra plataforma? Escolha a plataforma no site oficial de Heartopia. Não incluímos links de lojas que ainda não foram verificados neste repositório.',
    safeTitle: 'Como verificar download, conta e pagamento',
    safeIntro: 'Separe os riscos de arquivos falsos, roubo de conta, chat e pagamentos de terceiros. Cada caso exige verificações diferentes.',
    checks: ['Confirme se o domínio é heartopia.xd.com ou play.google.com.', 'No Google Play, confira o pacote com.xd.xdtglobal.gp e a desenvolvedora XD Entertainment.', 'Não instale APK, MOD, crack ou launcher de sites desconhecidos.', 'Nunca envie senha ou código de uso único para outra pessoa.'],
    footer: 'Site de fãs não oficial. Sempre confirme as informações no jogo e nos canais oficiais da XD.',
    nav: { codes: 'Códigos', gacha: 'Gacha', topup: 'Recarga', events: 'Eventos', download: 'Download' },
  },
  ja: {
    lang: 'ja', og: 'ja_JP', prefix: '/ja',
    events: 'ハートピア開催中イベント', active: '開催中', upcoming: '開催予定',
    intro: 'Heartopia.Lifeのイベントデータから、開催中・発表済みイベントと日程を日本語で確認できます。',
    verify: 'サーバー時間、参加条件、タスク、報酬はゲーム内のイベント画面で最終確認してください。',
    footer: '非公式ファンサイトです。最新情報はゲーム内とXD公式チャンネルで確認してください。',
    nav: { codes: 'コード', gacha: 'ガチャ', topup: '課金', events: 'イベント', download: 'ダウンロード' },
  },
  'zh-tw': {
    lang: 'zh-Hant', og: 'zh_TW', prefix: '/zh-tw', gachaHref: '/guides/gacha/',
    events: '心動小鎮目前活動', active: '進行中', upcoming: '即將開始',
    intro: '依 Heartopia.Life 活動資料整理目前進行中與已公布活動，並同步最新日期。',
    verify: '伺服器時間、參加條件、任務與獎勵請以遊戲內活動頁面為準。',
    footer: '非官方粉絲網站。最新資訊請以遊戲內與 XD 官方頻道為準。',
    nav: { codes: '兌換碼', gacha: '轉蛋', topup: '儲值', events: '活動', download: '下載' },
  },
};

const esc = (value) => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const write = (relative, html) => {
  const target = path.join(root, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${html}\n`);
};
const alternates = (route, localeKeys = Object.keys(locales)) => [
  ['en', `https://heartopia.life/${route}`],
  ...localeKeys.map((key) => [key === 'zh-tw' ? 'zh-Hant' : key === 'pt-br' ? 'pt-BR' : key, `https://heartopia.life/${key}/${route}`]),
  ['x-default', `https://heartopia.life/${route}`],
].map(([lang, href]) => `<link rel="alternate" hreflang="${lang}" href="${href}">`).join('');

function head(locale, route, title, description, localeKeys) {
  const url = `https://heartopia.life${locale.prefix}/${route}`;
  return `<!doctype html><html lang="${locale.lang}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><meta name="robots" content="index,follow"><link rel="canonical" href="${url}">${alternates(route, localeKeys)}<meta property="og:type" content="article"><meta property="og:locale" content="${locale.og}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${url}"><meta property="og:site_name" content="Heartopia.Life"><meta property="og:image" content="https://heartopia.life/img/header.jpg"><link rel="icon" href="/favicon-96x96.png"><script src="https://cdn.tailwindcss.com"></script><script>tailwind.config={theme:{extend:{colors:{cozy:{cream:'#FFF8F0',peach:'#FFE5D9',coral:'#FF9B85',sage:'#A8C686',wood:'#8B7355',bark:'#5D4E37'}},fontFamily:{display:['Georgia','serif'],body:['system-ui','sans-serif']}}}}</script><script async src="https://www.googletagmanager.com/gtag/js?id=G-FRJ91G3VRR"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-FRJ91G3VRR');</script><style>.surface{background:#fff;border:1px solid #eaded2;border-radius:.65rem}.safe{border-left:4px solid #78a85a}.warn{border-left:4px solid #d59b2d}</style></head><body class="bg-cozy-cream text-cozy-bark font-body">`;
}
function nav(locale) {
  const n = locale.nav;
  return `<header class="sticky top-0 z-50 border-b border-cozy-peach bg-white/95"><nav class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3"><a href="/" class="flex items-center gap-2"><img src="/favicon-96x96.png" alt="Heartopia.Life" class="h-7 w-7"><strong class="font-display text-xl">Heartopia<span class="text-cozy-sage">.Life</span></strong></a><div class="flex flex-wrap justify-end gap-3 text-sm font-bold"><a href="${locale.prefix}/events/">${n.events}</a><a href="${locale.prefix}/codes/">${n.codes}</a><a href="${locale.gachaHref || `${locale.prefix}/guides/gacha/`}">${n.gacha}</a><a href="${locale.prefix}/guides/top-up/">${n.topup}</a>${locale.download ? `<a href="${locale.prefix}/download/">${n.download}</a>` : ''}</div></nav></header>`;
}
const footer = (locale) => `<footer class="mt-12 bg-cozy-bark py-10 text-white"><div class="mx-auto max-w-6xl px-4"><strong class="font-display text-xl">Heartopia.Life</strong><p class="mt-3 text-sm text-white/70">${esc(locale.footer)}</p></div></footer></body></html>`;
const imageFor = (event) => fs.existsSync(path.join(root, 'img', 'events', `${event.localSlug || event.slug}.jpg`)) ? `/img/events/${event.localSlug || event.slug}.jpg` : '/img/header.jpg';
const labelDate = (event) => event.dateLabel || [event.startDate, event.endDate].filter(Boolean).join(' – ') || '—';

function eventIndex(locale) {
  const cards = current.map((event) => {
    const route = event.localSlug || event.slug;
    const status = event.status === 'upcoming' ? locale.upcoming : locale.active;
    return `<a class="surface overflow-hidden transition hover:-translate-y-1 hover:shadow-lg" href="${locale.prefix}/events/${route}/"><img src="${imageFor(event)}" alt="${esc(event.name)}" class="aspect-[16/9] w-full object-cover" loading="lazy"><div class="p-5"><span class="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">${status}</span><h2 class="mt-3 font-display text-2xl font-bold">${esc(event.name)}</h2><p class="mt-2 text-sm text-cozy-wood">${esc(labelDate(event))}</p></div></a>`;
  }).join('');
  return `${head(locale, 'events/', locale.events, locale.intro)}${nav(locale)}<main><section class="border-b border-cozy-peach bg-white"><div class="mx-auto max-w-6xl px-4 py-12"><p class="text-sm font-bold uppercase text-cozy-coral">${locale.active}</p><h1 class="font-display mt-3 text-4xl font-bold">${locale.events}</h1><p class="mt-4 max-w-3xl text-lg leading-8 text-cozy-wood">${locale.intro}</p><p class="mt-4 text-sm font-bold">${today}</p></div></section><section class="mx-auto max-w-6xl px-4 py-10"><div class="grid gap-6 md:grid-cols-2">${cards || `<div class="surface p-6">${locale.verify}</div>`}</div><div class="warn mt-8 rounded-md bg-amber-50 p-5 text-sm leading-6">${locale.verify}</div></section></main>${footer(locale)}`;
}

function eventDetail(locale, event) {
  const route = event.localSlug || event.slug;
  const title = `${event.name} — ${event.status === 'upcoming' ? locale.upcoming : locale.active}`;
  const description = `${event.name}: ${labelDate(event)}. ${locale.verify}`;
  return `${head(locale, `events/${route}/`, title, description)}${nav(locale)}<main><section class="border-b border-cozy-peach bg-white"><div class="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-2 md:items-center"><div><span class="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">${event.status === 'upcoming' ? locale.upcoming : locale.active}</span><h1 class="font-display mt-4 text-4xl font-bold">${esc(event.name)}</h1><p class="mt-4 text-lg text-cozy-wood">${esc(labelDate(event))}</p></div><img src="${imageFor(event)}" alt="${esc(event.name)}" class="aspect-[16/9] w-full rounded-lg border border-cozy-peach object-cover"></div></section><section class="mx-auto max-w-6xl px-4 py-10"><div class="grid gap-5 md:grid-cols-3"><div class="surface p-5"><strong>${locale.active}</strong><p class="mt-2">${esc(event.status)}</p></div><div class="surface p-5"><strong>Schedule</strong><p class="mt-2">${esc(labelDate(event))}</p></div><div class="surface p-5"><strong>Type</strong><p class="mt-2">${esc(event.type || 'Event')}</p></div></div><div class="warn mt-8 rounded-md bg-amber-50 p-6 leading-7">${locale.verify}</div><a class="mt-8 inline-flex rounded bg-cozy-bark px-5 py-3 font-bold text-white" href="${locale.prefix}/events/">${locale.events}</a></section></main>${footer(locale)}`;
}

function downloadPage(locale) {
  return `${head(locale, 'download/', locale.download, locale.downloadIntro, ['id', 'pt-br'])}${nav(locale)}<main><section class="border-b border-cozy-peach bg-white"><div class="mx-auto max-w-6xl px-4 py-12"><p class="text-sm font-bold uppercase text-cozy-coral">Official routes only</p><h1 class="font-display mt-3 text-4xl font-bold">${locale.download}</h1><p class="mt-4 max-w-3xl text-lg leading-8 text-cozy-wood">${locale.downloadIntro}</p></div></section><section class="mx-auto max-w-6xl px-4 py-10"><div class="grid gap-6 md:grid-cols-2"><a class="surface safe p-6" href="${locale.site}" target="_blank" rel="noopener"><h2 class="font-display text-2xl font-bold">${locale.xd}</h2><p class="mt-3 break-all text-sm text-cozy-wood">${locale.site}</p></a><a class="surface safe p-6" href="${googlePlay}&hl=${locale.lang === 'pt-BR' ? 'pt' : 'id'}" target="_blank" rel="noopener"><h2 class="font-display text-2xl font-bold">${locale.play}</h2><p class="mt-3 break-all text-sm text-cozy-wood">com.xd.xdtglobal.gp</p></a></div><div class="warn mt-7 rounded-md bg-amber-50 p-5 leading-7">${locale.storeNote}</div><div class="mt-7"><a class="rounded bg-cozy-bark px-5 py-3 font-bold text-white" href="${locale.prefix}/faq/safety/">${locale.safety}</a></div></section></main>${footer(locale)}`;
}

function safetyPage(locale) {
  return `${head(locale, 'faq/safety/', locale.safety, locale.safeIntro, ['id', 'pt-br'])}${nav(locale)}<main><section class="border-b border-cozy-peach bg-white"><div class="mx-auto max-w-6xl px-4 py-12"><p class="text-sm font-bold uppercase text-cozy-coral">${locale.safety}</p><h1 class="font-display mt-3 text-4xl font-bold">${locale.safeTitle}</h1><p class="mt-4 max-w-3xl text-lg leading-8 text-cozy-wood">${locale.safeIntro}</p></div></section><section class="mx-auto max-w-6xl px-4 py-10"><div class="grid gap-4 md:grid-cols-2">${locale.checks.map((check, index) => `<div class="surface ${index < 2 ? 'safe' : 'warn'} p-5"><strong>${index + 1}.</strong><p class="mt-2 leading-7">${check}</p></div>`).join('')}</div><section class="surface mt-8 p-6"><h2 class="font-display text-2xl font-bold">${locale.download}</h2><p class="mt-3 leading-7">${locale.downloadIntro}</p><div class="mt-5 flex flex-wrap gap-3"><a class="rounded bg-cozy-bark px-5 py-3 font-bold text-white" href="${locale.prefix}/download/">${locale.download}</a><a class="rounded border border-cozy-bark px-5 py-3 font-bold" href="${locale.site}" target="_blank" rel="noopener">${locale.xd}</a></div></section></section></main>${footer(locale)}`;
}

function injectAlternates(relative, route, localeKeys = Object.keys(locales)) {
  const target = path.join(root, relative);
  if (!fs.existsSync(target)) return;
  let html = fs.readFileSync(target, 'utf8');
  html = html.replace(/<link rel="alternate" hreflang="[^"]+" href="[^"]+">\s*/g, '');
  html = html.replace(/(<link rel="canonical"[^>]+>)/, `$1${alternates(route, localeKeys)}`);
  fs.writeFileSync(target, html);
}

for (const [key, locale] of Object.entries(locales)) {
  write(`${key}/events/index.html`, eventIndex(locale));
  for (const event of current) {
    const route = event.localSlug || event.slug;
    if (!(['ja', 'zh-tw'].includes(key) && route === 'call-of-whales')) write(`${key}/events/${route}/index.html`, eventDetail(locale, event));
  }
}
for (const key of ['id', 'pt-br']) {
  write(`${key}/download/index.html`, downloadPage(locales[key]));
  write(`${key}/faq/safety/index.html`, safetyPage(locales[key]));
}

injectAlternates('events/index.html', 'events/');
for (const event of current) {
  const route = event.localSlug || event.slug;
  injectAlternates(`events/${route}/index.html`, `events/${route}/`);
  if (route === 'call-of-whales') {
    injectAlternates('ja/events/call-of-whales/index.html', 'events/call-of-whales/');
    injectAlternates('zh-tw/events/call-of-whales/index.html', 'events/call-of-whales/');
  }
}
injectAlternates('download/index.html', 'download/', ['id', 'pt-br']);

for (const key of ['id', 'pt-br']) {
  for (const relative of ['codes/index.html', 'guides/gacha/index.html', 'guides/top-up/index.html']) {
    const target = path.join(root, key, relative);
    if (!fs.existsSync(target)) continue;
    let html = fs.readFileSync(target, 'utf8');
    if (!html.includes(`${locales[key].prefix}/events/`)) {
      html = html.replace(/(<div class="flex gap-4 text-sm font-bold">)/, `$1<a href="${locales[key].prefix}/events/">${locales[key].nav.events}</a><a href="${locales[key].prefix}/download/">${locales[key].nav.download}</a>`);
      html = html.replaceAll('href="/events/"', `href="${locales[key].prefix}/events/"`);
    }
    fs.writeFileSync(target, html);
  }
}

console.log(`Rendered localized entry pages for ${current.length} current events.`);
