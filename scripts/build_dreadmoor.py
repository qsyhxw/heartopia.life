"""Build the reviewed DREADMOOR task pages and their shared discovery entry."""
from pathlib import Path
import json
import re
from dreadmoor_home import render_home
from bs4 import BeautifulSoup
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / 'config/dreadmoor-content.json').read_text(encoding='utf-8'))
reference = (ROOT / 'loftia/fishing/index.html').read_text(encoding='utf-8')
blocks = re.findall(r'<script\b[^>]*>[\s\S]*?</script>', reference, re.I)
HEAD_SCRIPTS = '\n'.join(block for block in blocks if 'application/ld+json' not in block and "createAd('heartopia_anchor'" not in block)
AD_UNITS = next(block for block in blocks if "createAd('heartopia_anchor'" in block)

def build():
    nav = ''.join(f'<a href="../{p["slug"]}/">{p["label"]}</a>' for p in DATA['pages'])
    for page in DATA['pages']:
        slug = page['slug']
        canonical = f'https://heartopia.life/dreadmoor/{slug}/'
        image = f'../../assets/dreadmoor/{page["image"]}.webp'
        related = ''.join(f'<li><a href="../{p["slug"]}/">{p["title"]}</a></li>' for p in DATA['pages'] if p != page)
        toc = ''.join(f'<a href="#{s["id"]}">{s["title"]}</a>' for s in page['sections'])
        sections = ''.join(f'<section id="{s["id"]}"><h2>{s["title"]}</h2>{s["html"]}</section>' + ('<div id="heartopia_in_content" class="heartopia-ad-slot"></div>' if i == 0 else '') for i,s in enumerate(page['sections']))
        schema = json.dumps({'@context':'https://schema.org','@type':'Article','headline':page['title'],'dateModified':'2026-11-12','author':{'@type':'Organization','name':'Heartopia.Life'},'mainEntityOfPage':canonical,'image':f'https://heartopia.life/assets/dreadmoor/{page["image"]}.webp'})
        html = f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{page['title']}</title><meta name="description" content="{page['description']}"><link rel="canonical" href="{canonical}">
<meta property="og:image" content="https://heartopia.life/assets/dreadmoor/{page['image']}.webp"><meta property="og:title" content="{page['title']}"><meta property="og:type" content="article"><meta property="og:url" content="{canonical}"><meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg"><link rel="stylesheet" href="../../assets/guide-article-layout.css"><link rel="stylesheet" href="../../assets/dreadmoor/guide.css">
{HEAD_SCRIPTS}<script type="application/ld+json">{schema}</script></head>
<body class="dreadmoor-guide guide-layout"><a class="skip" href="#main">Skip to guide</a><header><a class="brand" href="/dreadmoor/">DREADMOOR <small>Fishing &amp; navigation guides</small></a><nav class="desktop" aria-label="DREADMOOR guides">{nav}</nav><details class="mobile"><summary>Menu</summary><nav aria-label="Mobile DREADMOOR guides">{nav}</nav></details></header>
<main id="main"><p class="eyebrow">EARLY ACCESS · CHECKED 12 NOVEMBER 2026</p><h1>{page['h1']}</h1><p class="answer">{page['answer']}</p><nav class="toc" aria-label="On this page">{toc}</nav>

<figure><img src="{image}" width="1280" height="720" alt="{page['alt']}"><figcaption>{page['caption']} Official Steam promotional gameplay image, Dream Dock / Digital Vortex Entertainment. Build unspecified.</figcaption></figure>
{sections}<div id="heartopia_in_content_2" class="heartopia-ad-slot"></div><section><h2>Related DREADMOOR guides</h2><ul>{related}</ul></section><p class="method">Prepared from linked developer information and attributed player reports. Gameplay steps have not been personally tested. Early Access behavior may change after this check.</p><div id="heartopia_in_content_3" class="heartopia-ad-slot"></div></main>
<footer><p>Published by <a href="../../">Heartopia.Life</a>. Independent fan resource, unaffiliated with Dream Dock or Digital Vortex Entertainment.</p><nav aria-label="Site information"><a href="../../about/">About</a><a href="../../contact/">Contact</a><a href="../../privacy/">Privacy</a><a href="/#more-games">More games</a></nav></footer>{AD_UNITS}</body></html>'''
        if slug == 'bloodgill':
            home_source = html
        soup = BeautifulSoup(html, 'html.parser')
        soup.body['class'].extend(['dreadmoor-article', 'task-' + slug])
        style = soup.new_tag('link', rel='stylesheet', href='/assets/dreadmoor/article.css')
        soup.head.append(style)
        main = soup.select_one('main')
        intro = soup.new_tag('div', attrs={'class':'article-intro'})
        copy = soup.new_tag('div', attrs={'class':'intro-copy'})
        crumb = soup.new_tag('a', href='/dreadmoor/', attrs={'class':'back-link'})
        crumb.string = 'All DREADMOOR guides'
        copy.append(crumb)
        for node in [main.select_one('.eyebrow'), main.h1, main.select_one('.answer')]:
            copy.append(node.extract())
        intro.append(copy)
        figure = main.figure.extract()
        figure.img['loading'] = 'eager'
        intro.append(figure)
        main.insert(0, intro)
        if slug in ['map', 'platforms']:
            main.select_one('section').insert_after(figure.extract())
        labels = {'bloodgill':'Fishing & quests', 'map':'Map & navigation', 'platforms':'Platforms & controllers'}
        copy.select_one('.eyebrow').string = labels[slug] + ' / Checked 12 November 2026'
        for table in main.select('table'):
            headings = [th.get_text() for th in table.select('thead th')]
            for row in table.select('tbody tr'):
                for cell, label in zip(row.select('td'), headings):
                    cell['data-label'] = label
        original_head = html[:html.index('<body')]
        original_head = original_head.replace('</head>', '<link rel="stylesheet" href="/assets/dreadmoor/article.css"></head>')
        body = str(soup.body)
        body = re.sub(r'<script\b[^>]*>[\s\S]*?</script>', lambda m: AD_UNITS, body)
        html = original_head + body + '</html>'
        target = ROOT / 'dreadmoor' / slug / 'index.html' 
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(html, encoding='utf-8', newline='\n')
    (ROOT / 'dreadmoor/index.html').write_text(render_home(home_source), encoding='utf-8', newline='\n')
    card = '<!-- DREADMOOR CARD --><a href="/dreadmoor/" class="flex items-center gap-4 rounded-xl bg-white p-4 mt-4" style="max-width:560px"><img src="/assets/dreadmoor/fishing.webp" alt="DREADMOOR first-person fishing" width="120" height="68" loading="lazy" style="width:120px;height:68px;object-fit:cover;border-radius:8px"><span><strong>DREADMOOR</strong><br>Bloodgill fishing, map help and PC controller choices</span></a><!-- END DREADMOOR CARD -->'
    path = ROOT / 'index.html'
    home = path.read_text(encoding='utf-8')
    home = re.sub(r'<!-- DREADMOOR CARD -->.*?<!-- END DREADMOOR CARD -->', '', home, flags=re.S)
    assert 'id="more-games"' in home
    home = re.sub(r'(<section id="more-games"[\s\S]*?)(</section>)', lambda m: m[1] + card + m[2], home, count=1)
    path.write_text(home, encoding='utf-8', newline='\n')
    path = ROOT / 'sitemap.xml'
    sitemap = path.read_text(encoding='utf-8')
    for page in [{'slug':''}] + DATA['pages']:
        url = 'https://heartopia.life/dreadmoor/' + (page['slug'] + '/' if page['slug'] else '')
        if f'<loc>{url}</loc>' not in sitemap:
            sitemap = sitemap.replace('</urlset>', f'<url><loc>{url}</loc><lastmod>2026-11-12</lastmod></url></urlset>')
    ET.fromstring(sitemap)
    path.write_text(sitemap, encoding='utf-8', newline='\n')

if __name__ == '__main__':
    build()
    # v3.20 presentation pass (SOP 00 §1.4/§4)
    import subprocess, sys
    subprocess.run([sys.executable, str(Path(__file__).resolve().parent / 'v320_present.py'), str(Path(__file__).resolve().parents[1])] + [f'dreadmoor/{p}' for p in ('index.html','bloodgill/index.html','map/index.html','platforms/index.html')], check=True)
