from pathlib import Path
from bs4 import BeautifulSoup
for path in Path('dreadmoor').glob('*/index.html'):
    soup = BeautifulSoup(path.read_text(encoding='utf-8'), 'html.parser')
    assert soup.select_one('body.guide-layout')
    assert any('assets/guide-article-layout.css' in link.get('href', '') for link in soup.select('link'))
    assert soup.select_one('.toc') and soup.select_one('figure img')
print('PASS DREADMOOR shared guide layout')
