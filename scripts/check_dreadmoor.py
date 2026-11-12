"""Validate generated DREADMOOR content, internal destinations and inherited ads."""
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]

seo = json.loads((ROOT / 'config/dreadmoor-seo.json').read_text(encoding='utf-8'))
assert all(not p['faqs'] and not p['alternates'] for p in seo['pages'])
pages = json.loads((ROOT / 'config/dreadmoor-content.json').read_text(encoding='utf-8'))['pages']

def check_link(path, href):
    parts = urlsplit(href)
    if parts.scheme or parts.netloc:
        return
    target = (ROOT / unquote(parts.path).lstrip('/')).resolve() if parts.path.startswith('/') else (path.parent / unquote(parts.path)).resolve() if parts.path else path
    if target.is_dir():
        target /= 'index.html'
    assert target.is_file(), (path, href)
    if parts.fragment:
        assert BeautifulSoup(target.read_text(encoding='utf-8'), 'html.parser').find(id=parts.fragment), (path, href)

for page in pages:
    path = ROOT / 'dreadmoor' / page['slug'] / 'index.html'
    text = path.read_text(encoding='utf-8')
    soup = BeautifulSoup(text, 'html.parser')
    assert soup.select_one('header .brand')['href'] == '/dreadmoor/'
    assert len(soup.select('h1')) == 1
    assert soup.select_one('body.guide-layout')
    assert soup.select_one('link[rel="canonical"]')['href'] == f'https://heartopia.life/dreadmoor/{page["slug"]}/'
    assert text.count('ads-2368.js') == 1
    assert text.count("createAd('heartopia_") == 6
    assert text.count('umami-nine-rust.vercel.app/script.js') == 1
    assert soup.select_one('figure img')
    for link in soup.select('a[href]'):
        check_link(path, link['href'])
    for image in soup.select('img'):
        assert (path.parent / image['src']).resolve().is_file()
    for script in soup.select('script[type="application/ld+json"]'):
        json.loads(script.string)
home = ROOT / 'index.html'
cards = BeautifulSoup(home.read_text(encoding='utf-8'), 'html.parser').select_one('#more-games')
assert cards
for link in cards.select('a[href]'):
    assert not urlsplit(link['href']).scheme and not link.has_attr('target') and not link.has_attr('onclick')
    check_link(home, link['href'])
print('PASS 3 DREADMOOR pages, canonical/schema/media/anchors/ads and all discovery-card destinations')

path = ROOT / 'dreadmoor/index.html'
text = path.read_text(encoding='utf-8')
soup = BeautifulSoup(text, 'html.parser')
assert soup.select_one('header .brand')['href'] == '/dreadmoor/'
assert len(soup.select('h1')) == 1 and soup.select_one('body.dreadmoor-home')
assert soup.select_one('link[rel="canonical"]')['href'] == 'https://heartopia.life/dreadmoor/'
assert not soup.select_one('main .toc')
assert {a['href'] for a in soup.select('.task-row')} == {'/dreadmoor/'+p['slug']+'/' for p in pages}
assert text.count("createAd('heartopia_") == 6
for link in soup.select('a[href]'):
    check_link(path, link['href'])
for image in soup.select('img'):
    assert (ROOT / image['src'].lstrip('/')).is_file()
assert cards.find('a', href='/dreadmoor/')
print('PASS independent hub layout, all task groups and four section-brand targets')
