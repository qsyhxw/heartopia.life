import fs from 'node:fs';
import path from 'node:path';
import {renderHome} from './loftia-home.mjs';

const pages = JSON.parse(fs.readFileSync('data/loftia/pages.json', 'utf8'));
const reference = fs.readFileSync('beginner-guide/index.html', 'utf8');
const scripts = [...reference.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
  .filter(match => /nitro|googletagmanager|gtag\(/i.test(match[0]));
const headScripts = scripts.filter(match => !match[0].includes("createAd('heartopia_anchor'")).map(match => match[0]).join('\n');
const adUnits = scripts.find(match => match[0].includes("createAd('heartopia_anchor'"))?.[0];
if (!adUnits || !headScripts.includes('ads-2368.js')) throw new Error('Missing inherited integrations');
const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
const links = pages.map(page => `<a href="/loftia/${page.slug}/">${page.title}</a>`).join('');
const css = `*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:110px}body{margin:0;color:#203f43;background:#f5f6e9;font:17px/1.7 system-ui,sans-serif}a{color:#176165;text-underline-offset:4px}a:focus-visible,summary:focus-visible{outline:3px solid #b55a36;outline-offset:4px}header{background:#e5f0e8;border-bottom:1px solid #b3ccbd}header>div{max-width:1080px;margin:auto;padding:16px 24px;display:flex;gap:24px;justify-content:space-between;align-items:center}.brand{font:700 23px Georgia,serif;text-decoration:none}nav{display:flex;gap:24px}main{max-width:1000px;margin:auto;padding:38px 24px}article{max-width:76ch;margin:auto}h1{font:700 clamp(32px,5vw,52px)/1.15 Georgia,serif;margin:18px 0 24px}h2{font:700 28px/1.3 Georgia,serif;margin-top:42px}.answer{font-size:21px;border-left:5px solid #a9be69;padding:16px 24px;background:#e8efda}.label,figcaption{font-size:14px;color:#496265}figure{margin:32px 0}figure img{width:100%;height:auto;max-height:520px;object-fit:contain;background:#e5eee5;border-radius:16px}table{width:100%;border-collapse:collapse;font-size:16px}th,td{text-align:left;vertical-align:top;border-bottom:1px solid #bfcec1;padding:12px}th{background:#e4ebdb}.toc,.related{display:flex;flex-wrap:wrap;gap:12px 24px;padding:18px 0}.related a{flex-basis:42%}footer{background:#203f43;color:#f5f6e9;padding:32px 24px}footer>div{max-width:1000px;margin:auto}footer a{color:#f5f6e9;margin-right:20px}.heartopia-ad-slot{margin:32px auto;text-align:center}details{display:none}@media(max-width:700px){nav{display:none}details{display:block}details a{display:block;padding:8px}header>div{align-items:flex-start}.related a{flex-basis:100%}main{padding:24px 18px}th,td{padding:9px;font-size:14px}.answer{padding:12px 16px;font-size:19px}}`;
fs.mkdirSync('assets/loftia', {recursive:true});
fs.writeFileSync('assets/loftia/style.css', css);
function render(page) {
  const route = `/loftia/${page.slug}/`;
  const sectionHtml = page.sections.map(([title, body], index) => `<section id="step-${index}"><h2>${title}</h2>${body}</section>${index === 0 ? '<div id="heartopia_in_content" class="heartopia-ad-slot"></div>' : ''}`).join('');
  const image = `/assets/loftia/${page.image}`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><script defer src="https://umami-nine-rust.vercel.app/script.js" data-website-id="c26db431-b7f2-41af-8453-25f9017d12ff"></script><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(page.title)} | Heartopia.Life</title><meta name="description" content="${escape(page.answer)}"><link rel="canonical" href="https://heartopia.life${route}"><meta property="og:title" content="${escape(page.title)}"><meta property="og:description" content="${escape(page.answer)}"><meta property="og:type" content="article"><meta property="og:url" content="https://heartopia.life${route}"><meta property="og:image" content="https://heartopia.life${image}"><link rel="icon" href="/favicon.svg"><link rel="stylesheet" href="/assets/loftia/style.css">${headScripts}</head><body><header><div><a class="brand" href="/loftia/">Loftia<small style="display:block;font:10px/1.5 system-ui,sans-serif;letter-spacing:1px">EXPLORATION & EVERYDAY GUIDES</small></a><nav aria-label="Loftia"><a href="/loftia/">Loftia guides</a><a href="/loftia/fishing/">Fish locations</a><a href="/loftia/materials/">Materials</a></nav><details><summary>Loftia menu</summary><a href="/loftia/">Loftia guides</a><a href="/loftia/fishing/">Fish locations</a><a href="/loftia/materials/">Materials</a></details></div></header><main><article><p class="label">Loftia · Early Access · Updated November 9, 2026</p><h1>${page.title}</h1><p class="answer">${page.answer}</p><div class="toc" aria-label="On this page">${page.sections.map(([title], index) => `<a href="#step-${index}">${title}</a>`).join('')}</div><figure><img src="${image}" alt="${escape(page.alt)}" width="${(page.image === 'hanging-gardens.webp') ? 1600 : 1920}" height="${(page.image === 'hanging-gardens.webp') ? 1600 : 1080}"><figcaption>${(page.image === 'hanging-gardens.webp') ? 'Hanging Gardens in-game world map. Regional orientation, without fishing markers.' : 'Qloud Games promotional screenshot. Early Access gameplay may differ.'}</figcaption></figure>${sectionHtml}<div id="heartopia_in_content_2" class="heartopia-ad-slot"></div><h2>More Loftia guides</h2><div class="related">${links}</div><div id="heartopia_in_content_3" class="heartopia-ad-slot"></div><p class="label">Independent fan guides. Community accounts are attributed in the relevant sections.</p></article></main><footer><div><p>Heartopia.Life · Unofficial game guides</p><a href="/about/">About</a><a href="/contact/">Contact</a><a href="/privacy/">Privacy</a><a href="/#more-games">More games</a></div></footer>${adUnits}</body></html>`;
}
for (const page of pages) {
  const dir = path.join('loftia', page.slug);
  fs.mkdirSync(dir, {recursive:true});
  fs.writeFileSync(path.join(dir, 'index.html'), render(page));
}
fs.writeFileSync('loftia/index.html', renderHome({headScripts, adUnits}));
console.log(`Built ${pages.length + 1} Loftia pages`);
const homePath = 'index.html';
let home = fs.readFileSync(homePath, 'utf8');
const recommendation = '<section id="more-games" class="max-w-6xl mx-auto px-4 py-8"><h2 class="font-display text-2xl font-bold mb-4">More games</h2><a href="/loftia/" class="flex items-center gap-4 rounded-xl bg-white p-4" style="max-width:560px"><img src="/assets/loftia/world.jpg" width="120" height="68" alt="Loftia waterfall landscape" style="width:120px;height:68px;object-fit:cover;border-radius:8px"><span><strong>Loftia</strong><br>Fishing, crafting and early progression guides</span></a></section>';
const marker = /<!-- LOFTIA RECOMMENDATION -->[\s\S]*?<!-- END LOFTIA RECOMMENDATION -->/;
const petitPlanetCard = home.match(/<!-- PETIT PLANET CARD -->[\s\S]*?<!-- END PETIT PLANET CARD -->/)?.[0] || '';
const dreadmoorCard = home.match(/<!-- DREADMOOR CARD -->[\s\S]*?<!-- END DREADMOOR CARD -->/)?.[0] || '';
const block = `<!-- LOFTIA RECOMMENDATION -->${recommendation.replace('</section>', `${petitPlanetCard}${dreadmoorCard}</section>`)}<!-- END LOFTIA RECOMMENDATION -->`;
if (marker.test(home)) home = home.replace(marker, block);
else home = home.replace('</main>', `${block}\n</main>`);
fs.writeFileSync(homePath, home);
