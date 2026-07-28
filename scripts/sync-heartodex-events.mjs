import fs from 'node:fs';
import path from 'node:path';
import { pickRemoteFields } from './sync-field-policy.mjs';

const root = path.resolve(import.meta.dirname, '..');
const today = new Date().toISOString().slice(0, 10);
const currentEventDataFile = path.join(root, 'data', 'heartopia-events.json');
const currentEventData = fs.existsSync(currentEventDataFile)
  ? JSON.parse(fs.readFileSync(currentEventDataFile, 'utf8'))
  : { generatedAt: today, events: [] };
const base = 'https://www.heartodex.com';
const aliases = {'call-of-whales':'call-of-whales','my-little-pony':'my-little-pony-collaboration','winter-frost-season':'winter-2026','sanrio-characters':'sanrio-characters-collaboration'};
const manual = [
  {slug:'sanrio-characters-collaboration',name:'Heartopia x SANRIO CHARACTERS',status:'upcoming',date:'July 17, 2026',type:'Collaboration',local:'sanrio-characters-collaboration'},
  {slug:'frostspore-butterflies',name:'Frostspore Butterflies',status:'archive',date:'January 24 - March 14, 2026',type:'Winter Frost Season insects',local:'frostspore-butterflies'}
];
const clean = s => String(s || '').replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/\s+/g,' ').trim();
const esc = s => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const slug = s => clean(s).toLowerCase().normalize('NFKD').replace(/[’']/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const read = file => fs.readFileSync(path.join(root,file),'utf8');
const write = (file,body) => {const target=path.join(root,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,body)};
const route = e => e.local || aliases[e.slug] || e.slug;
const file = e => 'events/'+route(e)+'/index.html';
const exists = e => fs.existsSync(path.join(root,file(e)));
const label = s => s==='active'?'Active':s==='upcoming'?'Upcoming':'Archive';
const classes = s => s==='active'?'bg-emerald-100 text-emerald-800':s==='upcoming'?'bg-sky-100 text-sky-800':'bg-stone-100 text-stone-700';
const period = e => e.startDate&&e.endDate ? e.startDate+' - '+e.endDate : e.startDate || e.endDate || e.date || 'Check the in-game event panel';

async function get(url) {
  const headers={'user-agent':'HeartopiaLifeEventMonitor/1.0 (+https://heartopia.life/)','accept':'text/html,application/xhtml+xml'};
  let response=null;
  if(process.env.HEARTOPIA_EVENT_FORCE_READER!=='1') {
    try {response=await fetch(url,{headers});} catch {}
  }
  if(response?.ok) return response.text();
  if(response&&response.status!==403) throw Error(response.status+' '+response.statusText);
  const pathname=new URL(url).pathname;
  const readerUrl='https://r.jina.ai/http://www.heartodex.com'+pathname;
  const reader=await fetch(readerUrl,{headers:{...headers,accept:'text/plain'}});
  if(!reader.ok) throw Error('Reader fallback '+reader.status+' '+reader.statusText);
  return reader.text();
}
function detail(html,name) {
  const safe=name.replace(/[.*+?^$(){}|[\]\\]/g,'\\$&');
  const htmlValue=html.match(new RegExp('>\\s*'+safe+'\\s*<\\/span>[\\s\\S]{0,700}?<span[^>]*>\\s*([\\s\\S]*?)\\s*<\\/span>','i'))?.[1];
  if(htmlValue) return clean(htmlValue);
  const markdownValue=html.match(new RegExp('(?:^|\\s)'+safe+'\\s+([A-Za-z]+\\s+\\d{1,2},\\s+\\d{4})','i'))?.[1];
  return clean(markdownValue||'');
}
function parse(html) {
  const map=new Map(), re=/<a\b[^>]*href=(["'])(?:https?:\/\/www\.heartodex\.com)?\/en\/events\/([^"'/?#]+)\/?[^"']*\1[^>]*>([\s\S]*?)<\/a>/gi;
  for(const hit of html.matchAll(re)) {
    const block=hit[3], name=clean(block.match(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/i)?.[1]);
    if(!name) continue;
    const nearby=html.slice(Math.max(0,hit.index-1800),hit.index+block.length+200).toLowerCase();
    const status=/past event|ended/i.test(block)?'archive':/active now|active event/i.test(block)?'active':/upcoming/i.test(block)?'upcoming':/active now|active event/.test(nearby)?'active':/upcoming/.test(nearby)?'upcoming':'archive';
    const card=clean(block), date=card.match(/(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}(?:\s*(?:→|–|-)\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2})?(?:,?\s+\d{4})?/i)?.[0]||'';
    map.set(slug(hit[2]),{slug:slug(hit[2]),name,status,date,sourceUrl:base+'/en/events/'+slug(hit[2])});
  }
  if(map.size) return [...map.values()];
  const markdownRe=/\[!\[Image \d+:\s*([^\]]+)\]\([^)\n]+\)\s*((?:(?!\[!\[Image)[\s\S])*?)\]\(https?:\/\/www\.heartodex\.com\/en\/events\/([^)\s/]+)\/?\)/gi;
  for(const hit of html.matchAll(markdownRe)) {
    const name=clean(hit[1]), card=clean(hit[2]), eventSlug=slug(hit[3]);
    if(!name||!eventSlug) continue;
    const status=/active now|active event/i.test(card)?'active':/upcoming/i.test(card)?'upcoming':'archive';
    const date=card.match(/(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}(?:\s*(?:→|–|-)\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2})?(?:,?\s+\d{4})?/i)?.[0]||'';
    const type=status==='active'?clean(card.match(/Active Now\s+(.+?)\s+(?=(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec))/i)?.[1]||''):'';
    map.set(eventSlug,{slug:eventSlug,name,status,date,type,sourceUrl:base+'/en/events/'+eventSlug});
  }
  return [...map.values()];
}
async function enrich(e) {
  if(e.status==='archive') return e;
  try {const html=await get(e.sourceUrl);const startDate=detail(html,'Start Date'),endDate=detail(html,'End Date'),eventType=detail(html,'Event Type');return pickRemoteFields('events',{...e,...(startDate?{startDate}:{}),...(endDate?{endDate}:{}),type:eventType||e.type||''});}
  catch {return e;}
}
function merge(remote) {
  const all = [...remote];
  for (const item of manual) {
    const found = all.find((event) => route(event) === (item.local || item.slug) || event.slug === item.slug || slug(event.name).replace(/^heartopia-/, '') === slug(item.name).replace(/^heartopia-/, ''));
    if (found) Object.assign(found, {...item, ...found, name: item.name || found.name, type: found.type || item.type || '', local: item.local || found.local});
    else all.push({...item, sourceUrl: '', startDate: item.startDate || '', endDate: item.endDate || ''});
  }
  return all;
}

function syncCustomEventStatus(e) {
  if (!exists(e)) return;
  const current = read(file(e));
  if (!current.includes('data-sync-event-status') || current.includes('data-event-sync="managed"')) return;
  const visible = e.status === 'archive' ? 'Archived event' : e.status === 'upcoming' ? 'Upcoming event' : 'Active event';
  const schemaStatus = e.status === 'archive' ? 'EventCompleted' : 'EventScheduled';
  const statusUpdated = current
    .replace(/(<[^>]+data-sync-event-status[^>]*>)[^<]*(<\/[^>]+>)/, `$1${visible}$2`)
    .replace(/"eventStatus":"https:\/\/schema\.org\/(?:EventScheduled|EventCompleted)"/, `"eventStatus":"https://schema.org/${schemaStatus}"`);
  const next = statusUpdated === current
    ? current
    : statusUpdated.replace(/"dateModified":"\d{4}-\d{2}-\d{2}"/, `"dateModified":"${today}"`);
  if (next !== current) write(file(e), next);
}
function head(title,description,url,schema,body) {
 return `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${url}"><meta name="robots" content="index,follow"><link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"><link rel="manifest" href="/site.webmanifest"><script src="https://cdn.tailwindcss.com"></script><script>tailwind.config={theme:{extend:{colors:{cozy:{cream:'#FFF8F0',peach:'#FFE5D9',coral:'#FF9B85',rose:'#D4A5A5',sage:'#A8C686',mint:'#B8E0D2',sky:'#95C8D8',wood:'#8B7355',bark:'#5D4E37'}},fontFamily:{display:['Georgia','serif'],body:['system-ui','-apple-system','sans-serif']}}}}</script><script async src="https://www.googletagmanager.com/gtag/js?id=G-FRJ91G3VRR"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-FRJ91G3VRR');</script><script data-cfasync="false">window.nitroAds=window.nitroAds||{createAd:function(){return new Promise(e=>{window.nitroAds.queue.push(["createAd",arguments,e])})},addUserToken:function(){window.nitroAds.queue.push(["addUserToken",arguments])},queue:[]};</script><script data-cfasync="false" async src="https://s.nitropay.com/ads-2368.js"></script><script type="application/ld+json">${JSON.stringify(schema)}</script><style>html{scroll-behavior:smooth}.card{background:#fff;border:1px solid rgb(255 229 217 / .8);border-radius:1rem;transition:transform .2s ease,box-shadow .2s ease}.card:hover{transform:translateY(-3px);box-shadow:0 12px 24px rgb(139 115 85 / .14)}.link{color:#8B7355;font-weight:700}.link:hover{color:#FF9B85}</style></head><body class="bg-cozy-cream text-cozy-bark font-body">${body}<script>(function(){function a(){if(window.__heartopiaEventAds||!window.nitroAds)return;window.__heartopiaEventAds=true;window.nitroAds.createAd('heartopia_anchor',{format:'anchor-v2',anchor:'bottom',anchorBgColor:'rgb(0 0 0 / 80%)',anchorClose:true,mediaQuery:'(max-width: 1024px)'});window.nitroAds.createAd('heartopia_side_rail',{format:'rail',rail:'right',railStickyTop:70,mediaQuery:'(min-width: 1025px)'});window.nitroAds.createAd('heartopia_floating_video',{format:'floating',floating:{position:'left'},mediaQuery:'(min-width: 1025px)'});for(const id of ['heartopia_in_content','heartopia_in_content_2'])window.nitroAds.createAd(id,{format:'display',sizes:[[300,250],[336,280],[728,90]],collapseEmpty:true})}if(window.nitroAds&&window.nitroAds.loaded)a();else document.addEventListener('nitroAds.loaded',a,{once:true})})();</script></body></html>`;
}
const nav = () => `<header class="sticky top-0 z-50 border-b border-cozy-peach/50 bg-white/90 backdrop-blur-md"><nav class="mx-auto max-w-6xl px-4 py-3"><div class="flex items-center justify-between gap-4"><a href="/" class="flex shrink-0 items-center gap-2 group"><img src="/favicon-96x96.png" alt="Heartopia.Life" class="h-7 w-7"><span class="font-display text-xl font-bold text-cozy-bark">Heartopia<span class="text-cozy-sage">.Life</span></span></a><ul class="hidden items-center gap-5 text-sm font-medium md:flex"><li><a href="/guides/map/" class="transition-colors hover:text-cozy-coral">Map</a></li><li><a href="/codes/" class="transition-colors hover:text-cozy-coral">Codes</a></li><li><a href="/guides/" class="transition-colors hover:text-cozy-coral">Guides</a></li><li><a href="/hobbies/" class="transition-colors hover:text-cozy-coral">Hobbies</a></li><li><a href="/events/" class="font-bold text-cozy-coral">Events</a></li><li><a href="/database/" class="transition-colors hover:text-cozy-coral">Database</a></li><li><a href="/npcs/" class="transition-colors hover:text-cozy-coral">NPCs</a></li><li class="relative group"><a href="/tools/" class="transition-colors hover:text-cozy-coral">More</a><div class="invisible absolute right-0 top-full z-50 mt-2 w-52 translate-y-1 rounded-lg border border-cozy-peach bg-white p-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100"><a href="/tools/" class="block rounded-lg px-3 py-2 hover:bg-cozy-cream">Tools</a><a href="/guides/top-up/" class="block rounded-lg px-3 py-2 hover:bg-amber-50">Top-Up Options</a></div></li></ul><a href="/tools/daily-tasks/" class="rounded-lg bg-cozy-peach px-3 py-2 text-xs font-bold text-cozy-bark transition-colors hover:bg-cozy-coral md:hidden">Tasks</a></div></nav></header>`;
const footer = () => `<footer class="mt-12 bg-cozy-bark py-8 text-white"><div class="mx-auto grid max-w-6xl gap-8 px-4 text-sm md:grid-cols-3"><div><a href="/" class="inline-flex items-center gap-2"><img src="/favicon-96x96.png" alt="Heartopia.Life" class="h-7 w-7"><span class="font-display text-lg font-bold">Heartopia<span class="text-cozy-sage">.Life</span></span></a><p class="mt-3 leading-6 text-white/65">Unofficial fan guide. Event availability can differ by server, so confirm the live in-game event panel.</p></div><div><h2 class="font-display text-base font-bold">Explore</h2><div class="mt-3 grid gap-2 text-white/70"><a class="hover:text-cozy-sage" href="/events/">Events</a><a class="hover:text-cozy-sage" href="/guides/">Guides</a><a class="hover:text-cozy-sage" href="/database/">Database</a></div></div><div><h2 class="font-display text-base font-bold">Tools</h2><div class="mt-3 grid gap-2 text-white/70"><a class="hover:text-cozy-sage" href="/tools/daily-tasks/">Daily Tasks</a><a class="hover:text-cozy-sage" href="/tools/my-progress/">My Progress</a><a class="hover:text-cozy-sage" href="/guides/map/">Map & Locations</a></div></div></div><div class="mx-auto mt-7 flex max-w-6xl flex-wrap justify-between gap-3 border-t border-white/10 px-4 pt-5 text-xs text-white/45"><p>&copy; 2026 Heartopia.Life</p><p><a class="hover:text-white" href="/privacy-policy/">Privacy Policy</a><span class="mx-2">&middot;</span><a class="hover:text-white" href="/contact/">Contact</a></p></div></footer>`;

const paidRelevant = e => /shop|pack|diamond|membership|fashionwave|collaboration|exhibition/i.test([e.name,e.type].filter(Boolean).join(' '));
const paidCta = e => paidRelevant(e) ? `<section class="mx-auto max-w-6xl px-5 pb-12"><div class="card flex flex-col gap-5 border-amber-200 bg-amber-50 p-6 md:flex-row md:items-center md:justify-between"><div><p class="text-xs font-black uppercase text-amber-800">Optional paid content</p><h2 class="mt-2 text-2xl font-bold">Comparing event packs or Heart Diamonds?</h2><p class="mt-2 max-w-2xl text-sm leading-6 text-[#735f4d]">If this event includes paid items, compare payment routes and confirm your account, region, server, product, and checkout total first.</p></div><a class="link shrink-0" href="/guides/top-up/">Compare top-up options</a></div></section>` : '';

function card(e) { const body=`<div class="p-5"><span class="inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${classes(e.status)}">${label(e.status)}</span><h3 class="mt-3 text-xl font-bold">${esc(e.name)}</h3><p class="mt-2 text-sm text-[#735f4d]">${esc(period(e))}</p>${e.type?`<p class="mt-2 text-sm text-[#735f4d]">${esc(e.type)}</p>`:''}</div>`; return exists(e)?`<a class="card hover:shadow-md" href="/events/${route(e)}/">${body}</a>`:`<article class="card">${body}</article>`; }
function rootPage(events, updatedAt) {
  const group=s=>events.filter(e=>e.status===s), list=(s,empty)=>group(s).length?group(s).map(card).join(''):`<article class="card p-5 text-sm text-[#735f4d]">${empty}</article>`;
  const body=`${nav('')}<main><section class="border-b border-[#eaded2] bg-[#fff4f3]"><div class="mx-auto max-w-6xl px-5 py-14"><p class="text-xs font-black uppercase text-[#bd506b]">Heartopia event calendar</p><h1 class="mt-3 text-4xl font-bold md:text-5xl">Heartopia Events</h1><p class="mt-4 max-w-3xl text-lg text-[#735f4d]">Current events, announced collaborations, permanent activities, and a clear archive of older event windows.</p><p class="mt-5 text-sm font-bold text-[#735f4d]">Updated: ${updatedAt}</p></div></section><section class="mx-auto max-w-6xl px-5 py-12"><p class="text-xs font-black uppercase text-emerald-700">Active now</p><h2 class="mt-2 text-3xl font-bold">Play now</h2><div class="mt-5 grid gap-5 md:grid-cols-2">${list('active','No active event is listed right now.')}</div><div id="heartopia_in_content" class="my-8"></div></section><section class="border-y border-[#e0eaf2] bg-[#f5f9ff]"><div class="mx-auto max-w-6xl px-5 py-12"><p class="text-xs font-black uppercase text-sky-700">Upcoming</p><h2 class="mt-2 text-3xl font-bold">Next on the calendar</h2><div class="mt-5 grid gap-5 md:grid-cols-2">${list('upcoming','No upcoming event is currently listed.')}</div></div></section><section class="mx-auto max-w-6xl px-5 py-12"><p class="text-xs font-black uppercase text-amber-700">Permanent activities</p><div class="mt-5 grid gap-5 md:grid-cols-3"><a class="card p-5" href="/events/sea-fishing/">Sea Fishing</a><a class="card p-5" href="/events/bait-insects/">Bait the Insects</a><a class="card p-5" href="/events/nest-of-hundreds/">Nest of Hundreds</a></div></section><section class="border-t border-[#eaded2] bg-[#fff6ef]"><div class="mx-auto max-w-6xl px-5 py-12"><p class="text-xs font-black uppercase text-stone-600">Archive</p><h2 class="mt-2 text-3xl font-bold">Ended events</h2><div class="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">${list('archive','No archived events recorded yet.')}</div><div id="heartopia_in_content_2" class="my-8"></div></div></section></main>${footer('')}`;
  return head('Heartopia Events: Active, Upcoming & Past Events','Check Heartopia events by active, upcoming, archive, and permanent activity status.','https://heartopia.life/events/',{'@context':'https://schema.org','@type':'CollectionPage',name:'Heartopia Events',dateModified:updatedAt},body);
}
function detailPage(e) {
 const url='https://heartopia.life/events/'+route(e)+'/', desc='Heartopia '+e.name+' event page with schedule, type, status, and a local checklist.';
 const body=`${nav('../../')}<main data-event-sync="managed"><section class="border-b border-[#eaded2] bg-[#fff4f3]"><div class="mx-auto max-w-6xl px-5 py-14"><span class="inline-flex rounded-full px-3 py-1 text-xs font-bold ${classes(e.status)}">${label(e.status)}</span><h1 class="mt-4 text-4xl font-bold">Heartopia ${esc(e.name)}</h1><p class="mt-4 text-lg text-[#735f4d]">${esc(period(e))}</p></div></section><section class="mx-auto max-w-6xl px-5 py-12"><div class="grid gap-5 md:grid-cols-3"><article class="card p-5"><h2 class="text-xl font-bold">Status</h2><p class="mt-2">${label(e.status)}</p></article><article class="card p-5"><h2 class="text-xl font-bold">Schedule</h2><p class="mt-2">${esc(period(e))}</p></article><article class="card p-5"><h2 class="text-xl font-bold">Type</h2><p class="mt-2">${esc(e.type||'Event')}</p></article></div><div class="mt-8 grid gap-6 md:grid-cols-2"><article class="card p-6"><h2 class="text-2xl font-bold">How to join</h2><ol class="mt-4 space-y-3 text-[#735f4d]"><li>1. Open the in-game event panel and confirm the server-time window.</li><li>2. Check your level, story, or account requirement.</li><li>3. Claim listed tasks before the final server reset.</li></ol></article><article class="card p-6"><h2 class="text-2xl font-bold">Before you join</h2><p class="mt-4 text-[#735f4d]">Event entry conditions can vary by server and version. Confirm the current level, story progress, and task list in the live in-game event panel.</p></article></div><div id="heartopia_in_content" class="my-8"></div><section class="card p-6"><a class="link" href="/events/">All events</a> <a class="link ml-4" href="/tools/daily-tasks/">Daily Tasks</a> <a class="link ml-4" href="/tools/my-progress/">My Progress</a></section><div id="heartopia_in_content_2" class="my-8"></div></section>${paidCta(e)}</main>${footer('../../')}`;
 return head('Heartopia '+e.name+': Dates, Status & Event Guide',desc,url,{'@context':'https://schema.org','@type':'Event',name:e.name,startDate:e.startDate||undefined,endDate:e.endDate||undefined,eventStatus:e.status==='archive'?'https://schema.org/EventCompleted':'https://schema.org/EventScheduled',url},body);
}
function updateSitemap(events) {
 let xml=read('sitemap.xml');
 for(const e of events) if(exists(e)) {const url='https://heartopia.life/events/'+route(e)+'/';if(!xml.includes('<loc>'+url+'</loc>'))xml=xml.replace('</urlset>',`  <url>\n    <loc>${url}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n</urlset>`);}
 write('sitemap.xml',xml);
}
if(process.argv[2]==='--parse-fixture') {
  const parsed=parse(fs.readFileSync(process.argv[3],'utf8'));
  if(!parsed.length) throw Error('Event fixture parse safety check failed.');
  console.log(JSON.stringify(parsed,null,2));
  process.exit(0);
}
const remote=parse(await get(base+'/en/events/'));
if(!remote.length) throw Error('Event parse safety check failed: no event cards found.');
const details=await Promise.all(remote.map(enrich)), events=merge(details);
const previousByRoute = new Map((currentEventData.events || []).map(event => [event.localSlug || event.slug, event]));
for (const event of events) {
  const previous = previousByRoute.get(route(event));
  if (previous) {
    event.slug = previous.slug;
    event.type = event.type || previous.type || '';
    event.startDate = event.startDate || previous.startDate || '';
    event.endDate = event.endDate || previous.endDate || '';
    event.date = event.date || previous.dateLabel || '';
  }
}
const publicEvents=events.map(e=>pickRemoteFields('events',{slug:e.slug,localSlug:route(e),name:e.name,status:e.status,type:e.type||'',startDate:e.startDate||'',endDate:e.endDate||'',dateLabel:e.date||''}));
const eventFactsChanged = JSON.stringify(publicEvents) !== JSON.stringify(currentEventData.events || []);
const updatedAt = eventFactsChanged ? today : (currentEventData.generatedAt || today);
for(const e of events){const old=exists(e)?read(file(e)):'';if((e.status==='active'||e.status==='upcoming')&&(!old||old.includes('data-event-sync="managed"')))write(file(e),detailPage(e));else syncCustomEventStatus(e);}
write('events/index.html',rootPage(events, updatedAt));
updateSitemap(events);
write('data/heartopia-events.json',JSON.stringify({schemaVersion:1,generatedAt:updatedAt,count:publicEvents.length,events:publicEvents},null,2)+'\n');
console.log('Synced '+events.length+' event listings.');
