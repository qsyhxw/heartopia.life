#!/usr/bin/env python3
"""Summarise real code changes between the previous commit and HEAD (ignores lastChecked/lastSeen dates).

Prints the summary and writes changed=true/false to $GITHUB_OUTPUT; used to email only meaningful updates.
"""
import json
import os
import subprocess
import sys

PATH = 'data/heartopia-codes.json'


def codes(rev):
    raw = subprocess.run(['git', 'show', f'{rev}:{PATH}'], capture_output=True, text=True, encoding='utf8').stdout
    d = json.loads(raw) if raw.strip() else {}
    out = {}
    for group in ('active', 'expired'):
        for c in d.get(group, []) or []:
            if isinstance(c, dict) and c.get('code'):
                out[c['code']] = (group, c.get('reward', ''))
    return out


old, new = codes('HEAD~1'), codes('HEAD')
lines = []
for code, (g, reward) in sorted(new.items()):
    if code not in old:
        lines.append(f'+ 新增{"有效" if g == "active" else "过期"}码 {code}（{reward}）')
    elif old[code][0] != g:
        lines.append(f'~ {code}：{"有效" if old[code][0] == "active" else "过期"} → {"有效" if g == "active" else "过期"}')
for code in sorted(set(old) - set(new)):
    lines.append(f'- 移除 {code}')
text = '\n'.join(lines)
print(text or 'No code changes (only check dates moved).')
if os.environ.get('GITHUB_OUTPUT'):
    with open(os.environ['GITHUB_OUTPUT'], 'a', encoding='utf8') as f:
        f.write(f"changed={'true' if lines else 'false'}\n")
if len(sys.argv) > 1:
    open(sys.argv[1], 'w', encoding='utf8').write(text + '\n')
