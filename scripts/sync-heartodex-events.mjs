import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const today = new Date().toISOString().slice(0, 10);
const base = 'https://www.heartodex.com';
const aliases = {'call-of-whales':'call-of-whales','my-little-pony':'my-little-pony-collaboration','winter-frost-season':'winter-2026'};
const manual = [{slug:'sanrio-characters-collaboration',name:'Heartopia x SANRIO CHARACTERS',status:'upcoming',date:'July 17, 2026',type:'Collaboration',local:'sanrio-characters-collaboration'}];
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
  const response=await fetch(url,{headers:{'user-agent':'HeartopiaLifeEventMonitor/1.0 (+https://heartopia.life/)','accept':'text/html,application/xhtml+xml'}});
  if(!response.ok) throw Error(response.status+' '+response.statusText);
  return response.text();
}
function detail(html,name) {
  const safe=name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  return clean(html.match(new RegExp('>\\s*'+safe+'\\s*<\\/span>[\\s\\S]{0,700}?<span[^>]*>\\s*([\\s\\S]*?)\\s*<\\/span>','i'))?.[1]||'');
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
  return [...map.values()];
}
async function enrich(e) {
  if(e.status==='archive') return e;
  try {const html=await get(e.sourceUrl);return {...e,startDate:detail(html,'Start Date'),endDate:detail(html,'End Date'),type:detail(html,'Event Type'),requirements:detail(html,'Requirements')};}
  catch {return e;}
}
function merge(remote) {
  const all = [...remote];
  for (const item of manual) {
    const found = all.find((event) => event.slug === item.slug || slug(event.name).replace(/^heartopia-/, '') === slug(item.name).replace(/^heartopia-/, ''));
    if (found) Object.assign(found, {...item, ...found, local: item.local || found.local});
    else all.push({...item, sourceUrl: '', startDate: item.startDate || '', endDate: item.endDate || '', requirements: item.requirements || ''});
  }
  return all;
}

function head(title,description,url,schema,body) {
 return `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${url}"><meta name="robots" content="index,follow"><script src="https://cdn.tailwindcss.com"></script><script async src="https://www.googletagmanager.com/gtag/js?id=G-FRJ91G3VRR"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-FRJ91G3VRR');</script><script data-cfasync="false">window.nitroAds=window.nitroAds||{createAd:function(){return new Promise(e=>{window.nitroAds.queue.push(["createAd",arguments,e])})},queue:[]};</script><script data-cfasync="false" async src="https://s.nitropay.com/ads-2368.js"></script><script type="application/ld+json">${JSON.stringify(schema)}</script><style>body{background:#fff8f1;color:#2d241e;font-family:system-ui,sans-serif}h1,h2,h3{font-family:Georgia,serif}.card{background:#fff;border:1px solid #eaded2;border-radius:8px}.link{color:#a34459;font-weight:700}</style></head><body>${body}<script>(function(){function a(){if(window.__heartopiaEventAds||!window.nitroAds)return;window.__heartopiaEventAds=true;window.nitroAds.createAd('heartopia_anchor',{format:'anchor-v2',anchor:'bottom',mediaQuery:'(max-width: 1024px)'});window.nitroAds.createAd('heartopia_side_rail',{format:'rail',rail:'right',mediaQuery:'(min-width: 1025px)'});window.nitroAds.createAd('heartopia_floating_video',{format:'floating',mediaQuery:'(min-width: 1025px)'});for(const id of ['heartopia_in_content','heartopia_in_content_2'])window.nitroAds.createAd(id,{format:'display',sizes:[[300,250],[336,280],[728,90]]})}if(window.nitroAds&&window.nitroAds.loaded)a();else document.addEventListener('nitroAds.loaded',a,{once:true})})();</script></body></html>`;
}
const nav = p => { const link = section => p ? p + section + '/' : '/' + section + '/'; return `<header class="border-b border-[#eaded2] bg-white"><nav class="mx-auto flex max-w-6xl flex-wrap justify-between gap-3 px-5 py-4"><a class="text-xl font-black text-[#c85069]" href="${p || '/'}">Heartopia Life</a><div class="flex gap-5 text-sm font-bold"><a href="${link('database')}">Database</a><a href="${link('guides')}">Guides</a><a href="${link('events')}">Events</a><a href="${link('tools')}">Tools</a><a href="${link('codes')}">Codes</a></div></nav></header>`; };
const footer = p => `<footer class="mt-16 border-t border-[#eaded2] bg-white"><div class="mx-auto max-w-6xl px-5 py-8 text-sm text-[#735f4d]">Heartopia Life is an independent fan guide. Check the in-game event panel for live availability.</div></footer>`;
function card(e) { const body=`<div class="p-5"><span class="inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${classes(e.status)}">${label(e.status)}</span><h3 class="mt-3 text-xl font-bold">${esc(e.name)}</h3><p class="mt-2 text-sm text-[#735f4d]">${esc(period(e))}</p>${e.type?`<p class="mt-2 text-sm text-[#735f4d]">${esc(e.type)}</p>`:''}</div>`; return exists(e)?`<a class="card hover:shadow-md" href="/events/${route(e)}/">${body}</a>`:`<article class="card">${body}</article>`; }
function rootPage(events) {
  const group=s=>events.filter(e=>e.status===s), list=(s,empty)=>group(s).length?group(s).map(card).join(''):`<article class="card p-5 text-sm text-[#735f4d]">${empty}</article>`;
  const body=`${nav('')}<main><section class="border-b border-[#eaded2] bg-[#fff4f3]"><div class="mx-auto max-w-6xl px-5 py-14"><p class="text-xs font-black uppercase text-[#bd506b]">Heartopia event calendar</p><h1 class="mt-3 text-4xl font-bold md:text-5xl">Heartopia Events</h1><p class="mt-4 max-w-3xl text-lg text-[#735f4d]">Current events, announced collaborations, permanent activities, and a clear archive of older event windows.</p><p class="mt-5 text-sm font-bold text-[#735f4d]">Updated: ${today}</p></div></section><section class="mx-auto max-w-6xl px-5 py-12"><p class="text-xs font-black uppercase text-emerald-700">Active now</p><h2 class="mt-2 text-3xl font-bold">Play now</h2><div class="mt-5 grid gap-5 md:grid-cols-2">${list('active','No active event is listed right now.')}</div><div id="heartopia_in_content" class="my-8"></div></section><section class="border-y border-[#e0eaf2] bg-[#f5f9ff]"><div class="mx-auto max-w-6xl px-5 py-12"><p class="text-xs font-black uppercase text-sky-700">Upcoming</p><h2 class="mt-2 text-3xl font-bold">Next on the calendar</h2><div class="mt-5 grid gap-5 md:grid-cols-2">${list('upcoming','No upcoming event is currently listed.')}</div></div></section><section class="mx-auto max-w-6xl px-5 py-12"><p class="text-xs font-black uppercase text-amber-700">Permanent activities</p><div class="mt-5 grid gap-5 md:grid-cols-3"><a class="card p-5" href="/events/sea-fishing/">Sea Fishing</a><a class="card p-5" href="/events/bait-insects/">Bait the Insects</a><a class="card p-5" href="/events/nest-of-hundreds/">Nest of Hundreds</a></div></section><section class="border-t border-[#eaded2] bg-[#fff6ef]"><div class="mx-auto max-w-6xl px-5 py-12"><p class="text-xs font-black uppercase text-stone-600">Archive</p><h2 class="mt-2 text-3xl font-bold">Ended events</h2><div class="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">${list('archive','No archived events recorded yet.')}</div><div id="heartopia_in_content_2" class="my-8"></div></div></section></main>${footer('')}`;
  return head('Heartopia Events: Active, Upcoming & Past Events','Check Heartopia events by active, upcoming, archive, and permanent activity status.','https://heartopia.life/events/',{'@context':'https://schema.org','@type':'CollectionPage',name:'Heartopia Events',dateModified:today},body);
}
function detailPage(e) {
 const url='https://heartopia.life/events/'+route(e)+'/', desc='Heartopia '+e.name+' event guide with schedule, type, requirements, and a live event checklist.';
 const body=`${nav('../../')}<main data-event-sync="managed"><section class="border-b border-[#eaded2] bg-[#fff4f3]"><div class="mx-auto max-w-6xl px-5 py-14"><span class="inline-flex rounded-full px-3 py-1 text-xs font-bold ${classes(e.status)}">${label(e.status)}</span><h1 class="mt-4 text-4xl font-bold">Heartopia ${esc(e.name)}</h1><p class="mt-4 text-lg text-[#735f4d]">${esc(period(e))}</p></div></section><section class="mx-auto max-w-6xl px-5 py-12"><div class="grid gap-5 md:grid-cols-3"><article class="card p-5"><h2 class="text-xl font-bold">Status</h2><p class="mt-2">${label(e.status)}</p></article><article class="card p-5"><h2 class="text-xl font-bold">Schedule</h2><p class="mt-2">${esc(period(e))}</p></article><article class="card p-5"><h2 class="text-xl font-bold">Type</h2><p class="mt-2">${esc(e.type||'Event')}</p></article></div><div class="mt-8 grid gap-6 md:grid-cols-2"><article class="card p-6"><h2 class="text-2xl font-bold">How to join</h2><ol class="mt-4 space-y-3 text-[#735f4d]"><li>1. Open the in-game event panel and confirm the server-time window.</li><li>2. Check your level, story, or account requirement.</li><li>3. Claim listed tasks before the final server reset.</li></ol></article><article class="card p-6"><h2 class="text-2xl font-bold">Listed requirement</h2><p class="mt-4 text-[#735f4d]">${esc(e.requirements||'Check the live event panel for the current entry steps and availability.')}</p></article></div><div id="heartopia_in_content" class="my-8"></div><section class="card p-6"><a class="link" href="/events/">All events</a> <a class="link ml-4" href="/tools/daily-tasks/">Daily Tasks</a> <a class="link ml-4" href="/tools/my-progress/">My Progress</a></section><div id="heartopia_in_content_2" class="my-8"></div></section></main>${footer('../../')}`;
 return head('Heartopia '+e.name+': Dates, Requirements & Event Guide',desc,url,{'@context':'https://schema.org','@type':'Event',name:e.name,startDate:e.startDate||undefined,endDate:e.endDate||undefined,eventStatus:e.status==='archive'?'https://schema.org/EventCompleted':'https://schema.org/EventScheduled',url},body);
}
function updateSitemap(events) {
 let xml=read('sitemap.xml');
 for(const e of events) if(exists(e)) {const url='https://heartopia.life/events/'+route(e)+'/';if(!xml.includes('<loc>'+url+'</loc>'))xml=xml.replace('</urlset>',`  <url>\n    <loc>${url}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n</urlset>`);}
 write('sitemap.xml',xml);
}
const remote=parse(await get(base+'/en/events/'));
if(!remote.length) throw Error('Event parse safety check failed: no event cards found.');
const details=await Promise.all(remote.map(enrich)), events=merge(details);
for(const e of events){const old=exists(e)?read(file(e)):'';if((e.status==='active'||e.status==='upcoming')&&(!old||old.includes('data-event-sync="managed"')))write(file(e),detailPage(e));}
write('events/index.html',rootPage(events));
updateSitemap(events);
write('data/monitor/heartodex-events.json',JSON.stringify({schemaVersion:1,updatedAt:today,source:base+'/en/events/',policy:{mode:'auto-publish-listing-facts',images:'Source image URLs are recorded for review only. Third-party images are not downloaded or copied automatically.'},events:events.map(e=>({slug:e.slug,localSlug:route(e),name:e.name,status:e.status,type:e.type||'',startDate:e.startDate||'',endDate:e.endDate||'',dateLabel:e.date||'',requirements:e.requirements||'',sourceUrl:e.sourceUrl||''}))},null,2)+'\n');
console.log('Synced '+events.length+' event listings.');
