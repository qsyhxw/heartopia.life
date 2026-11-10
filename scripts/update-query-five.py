"""Apply the November 10 query additions without replacing existing task bodies."""
import re
from pathlib import Path
import json

root = Path(__file__).resolve().parent.parent
updates = json.loads((root / 'data/query-five-updates.json').read_text(encoding='utf-8'))
for item in updates:
    target = root / item['file']
    html = target.read_text(encoding='utf-8')
    body = item['html']
    if item.get('chart'):
        data = json.loads((root / 'data/heartopia-flowers.json').read_text(encoding='utf-8'))
        rows = ''.join(f'<tr><td>{p["label"]}</td><td>{p["result"]}</td><td>{p["use"]}</td></tr>' for p in data['pairings'])
        body = body.replace('CHART_ROWS', rows)
    block = '<!-- QUERY FIVE START -->' + body + '<!-- QUERY FIVE END -->'
    if '<!-- QUERY FIVE START -->' in html:
        html = re.sub(r'<!-- QUERY FIVE START -->.*?<!-- QUERY FIVE END -->', lambda _: block, html, flags=re.S)
    else:
        html = re.sub(r'(<main\b[^>]*>)', lambda m: m[0] + block, html, count=1)
    for before, after in item.get('replacements', []):
        html = html.replace(before, after)
    target.write_text(html, encoding='utf-8')
    print(item['file'])
