"""Apply the November 12 query additions without replacing existing task bodies."""
import re
from pathlib import Path
import json

root = Path(__file__).resolve().parent.parent
updates = json.loads((root / 'data/query-eight-updates.json').read_text(encoding='utf-8'))
for item in updates:
    target = root / item['file']
    html = target.read_text(encoding='utf-8')
    body = item['html']
    if item.get('chart'):
        data = json.loads((root / 'data/heartopia-flowers.json').read_text(encoding='utf-8'))
        rows = ''.join(f'<tr><td>{p["label"]}</td><td>{p["result"]}</td><td>{p["use"]}</td></tr>' for p in data['pairings'])
        body = body.replace('CHART_ROWS', rows)
    block = '<!-- QUERY EIGHT START -->' + body + '<!-- QUERY EIGHT END -->'
    if '<!-- QUERY EIGHT START -->' in html:
        html = re.sub(r'<!-- QUERY EIGHT START -->.*?<!-- QUERY EIGHT END -->', lambda _: block, html, flags=re.S)
    else:
        html = re.sub(r'(<main\b[^>]*>)', lambda m: m[0] + block, html, count=1)
    for before, after in item.get('replacements', []):
        html = html.replace(before, after)
    target.write_text(html, encoding='utf-8')
    print(item['file'])
