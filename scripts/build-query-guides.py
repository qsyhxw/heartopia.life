"""Build the task pages in data/query-guides.json using the regular Heartopia shell."""
import json
import re
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
pages = json.loads((ROOT / 'data/query-guides.json').read_text(encoding='utf-8'))
reference = (ROOT / 'beginner-guide/index.html').read_text(encoding='utf-8')
for page in pages:
    url = 'https://heartopia.life' + page['route']
    html = re.sub(r'<script type="application/ld\+json">.*?</script>', '', reference, flags=re.S)
    html = re.sub(r'<title>.*?</title>', '<title>' + escape(page['title']) + '</title>', html, flags=re.S)
    html = re.sub(r'<meta\b[^>]*(?:name="description"|property="og:[^"]+")[^>]*>', '', html)
    html = re.sub(r'<link rel="canonical"[^>]*>', '', html)
    html = html.replace('<html lang="en">', '<html lang="' + page.get('lang', 'en') + '">')
    metadata = f'<meta name="description" content="{escape(page["description"], quote=True)}"><link rel="canonical" href="{url}"><meta property="og:type" content="article"><meta property="og:title" content="{escape(page["title"], quote=True)}"><meta property="og:url" content="{url}"><meta property="og:image" content="https://heartopia.life{page["image"]}">'
    html = html.replace('</head>', metadata + '<style>.query-body{max-width:76ch;margin:auto}.query-body h2{font-size:1.65rem;font-weight:700;margin:2rem 0 1rem}.query-body p,.query-body ul,.query-body ol{margin:1rem 0;line-height:1.85}.query-body ul,.query-body ol{padding-left:1.5rem}.query-body ul{list-style:disc}.query-body ol{list-style:decimal}.query-body a{color:#995342;text-decoration:underline}.query-body img{max-width:100%;height:auto}.query-body figure img{max-height:460px;width:100%;object-fit:contain}.query-body table{width:100%;border-collapse:collapse}.query-body td,.query-body th{padding:.7rem;border:1px solid #eaded2;text-align:left;vertical-align:top}html{scroll-padding-top:100px}</style></head>')
    sections = ''.join(f'<section id="{section[0]}"><h2>{section[1]}</h2>{section[2]}</section>' for section in page['sections'])
    toc = ' · '.join(f'<a href="#{s[0]}">{s[1]}</a>' for s in page['sections'])
    main = f'<main class="max-w-6xl mx-auto px-4 py-10"><article class="query-body"><p>Heartopia · {page["dateLabel"]}</p><h1 class="font-display text-3xl md:text-5xl font-bold my-5">{page["title"]}</h1><p class="text-xl bg-white rounded-lg p-5">{page["answer"]}</p><nav aria-label="On this page">{toc}</nav><figure class="my-8"><img src="{page["image"]}" width="{page["width"]}" height="{page["height"]}" alt="{escape(page["alt"], quote=True)}"><figcaption class="text-sm text-cozy-wood">{page["caption"]}</figcaption></figure><div id="heartopia_in_content" class="heartopia-ad-slot"></div>{sections}<div id="heartopia_in_content_2" class="heartopia-ad-slot"></div><p>{page["related"]}</p><div id="heartopia_in_content_3" class="heartopia-ad-slot"></div></article></main>'
    html = re.sub(r'<main\b[^>]*>.*?</main>', lambda _: main, html, flags=re.S)
    if page.get('localNav'):
        links = ''.join(f'<a href="{url}" class="px-2 py-2">{label}</a>' for label, url in page['localNav'])
        header = f'<header class="sticky top-0 z-50 bg-white border-b border-cozy-peach"><div class="max-w-6xl mx-auto px-4 py-3"><a class="font-display text-xl font-bold" href="{page["home"]}">{page["brand"]}</a><nav class="hidden md:flex gap-4 mt-3">{links}</nav><details class="md:hidden mt-2"><summary>{page["menu"]}</summary><nav class="flex flex-wrap">{links}</nav></details></div></header>'
        html = re.sub(r'<header\b[^>]*>.*?</header>', lambda _: header, html, count=1, flags=re.S)
    trust = '<p class="text-sm mt-4"><a href="/about/">About</a> · <a href="/contact/">Contact</a> · <a href="/privacy/">Privacy</a></p>'
    html = html.replace('</footer>', trust + '</footer>')
    target = ROOT / page['route'].strip('/') / 'index.html'
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(html, encoding='utf-8')
    print(target.relative_to(ROOT))

updates = json.loads((ROOT / 'data/query-guide-updates.json').read_text(encoding='utf-8'))
for update in updates:
    target = ROOT / update['file']
    html = target.read_text(encoding='utf-8')
    block = '<!-- QUERY TASK START -->' + update['html'] + '<!-- QUERY TASK END -->'
    if '<!-- QUERY TASK START -->' in html:
        html = re.sub(r'<!-- QUERY TASK START -->.*?<!-- QUERY TASK END -->', lambda _: block, html, flags=re.S)
    else:
        html = re.sub(r'(<main\b[^>]*>)', lambda match: match[0] + block, html, count=1)
    for before, after in update.get('replacements', []):
        html = html.replace(before, after)
    target.write_text(html, encoding='utf-8')
    print(target.relative_to(ROOT))
