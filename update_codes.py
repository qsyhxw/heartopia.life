import re

try:
    with open(r'D:\Antigravity\heartopia.life\codes\index.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # 1. Update Title and Meta Tags
    html = html.replace('All Heartopia Codes (February 2026)', 'All Heartopia Codes (March 2026)')
    html = html.replace('for February 2026', 'for March 2026')
    html = html.replace('"datePublished": "2026-01-22",\n        "dateModified": "2026-02-12"', '"datePublished": "2026-01-22",\n        "dateModified": "2026-03-11"')
    
    # 2. Add JSON-LD FAQ Schema
    old_json_ld = '''<script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "All Heartopia Codes (March 2026) - Free Rewards",
        "description": "Complete list of all working Heartopia codes for March 2026.",
        "datePublished": "2026-01-22",
        "dateModified": "2026-03-11",
        "author": {"@type": "Organization", "name": "Heartopia.Life"},
        "publisher": {"@type": "Organization", "name": "Heartopia.Life"}
    }
    </script>'''
    
    new_json_ld = old_json_ld + '''
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [{
        "@type": "Question",
        "name": "How do I redeem codes in Heartopia?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "1. Launch the game. 2. Press TAB (PC) or the watch icon (Mobile). 3. Go to Settings. 4. Click 'Redeem Code' in the General tab. 5. Enter your code and check your in-game mailbox."
        }
      }, {
        "@type": "Question",
        "name": "Are there any new Heartopia codes for March 2026?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, new March 2026 codes include k9r8m2q7a5, tangyuan0303y, and SPRINGFEST2026 which give free Wishing Stars, Crystals, and Gold."
        }
      }]
    }
    </script>'''
    
    html = html.replace(old_json_ld, new_json_ld)

    # 3. Update Text Content
    html = html.replace('Last Updated: February 12, 2026', 'Last Updated: March 11, 2026')
    html = html.replace('<strong>18 working codes</strong>', '<strong>29 working codes</strong>')
    html = html.replace('<div class="text-2xl font-bold text-cozy-coral">18</div>', '<div class="text-2xl font-bold text-cozy-coral">29</div>')
    html = html.replace('February 12, 2026. Codes may expire', 'March 11, 2026. Codes may expire')

    # 4. Fix Typo
    html = html.replace('Wishing Star ×10, Mermaid Fish Attractor ×3, Fertilizer ×10</td>\n                                <td class="px-4 py-3 text-cozy-wood">Mar 31, 2026</td>', 'Wishing Star ×5, Mermaid Fish Attractor ×3, Fertilizer ×10</td>\n                                <td class="px-4 py-3 text-cozy-wood">Mar 31, 2026</td>')

    # 5. Insert New Codes
    new_codes_html = '''
                            <!-- NEW: Added March 11, 2026 -->
                            <tr class="bg-cozy-sky/20">
                                <td class="px-4 py-3"><code class="code-badge bg-cozy-coral text-white px-2 py-1 rounded text-xs font-bold">k9r8m2q7a5</code> <span class="ml-1 text-xs bg-green-500 text-white px-1 rounded">NEW</span></td>
                                <td class="px-4 py-3">Wishing Star ×5, Mermaid Fish Attractor ×3, Fertilizer ×10</td>
                                <td class="px-4 py-3 text-cozy-wood">Unknown</td>
                            </tr>
                            <tr class="bg-cozy-sky/20">
                                <td class="px-4 py-3"><code class="code-badge bg-cozy-coral text-white px-2 py-1 rounded text-xs font-bold">tangyuan0303y</code> <span class="ml-1 text-xs bg-green-500 text-white px-1 rounded">NEW</span></td>
                                <td class="px-4 py-3">Wishing Star ×5, Apple ×10, Fertilizer ×10</td>
                                <td class="px-4 py-3 text-cozy-wood">Unknown</td>
                            </tr>
                            <tr class="bg-cozy-sky/20">
                                <td class="px-4 py-3"><code class="code-badge bg-cozy-coral text-white px-2 py-1 rounded text-xs font-bold">SPRINGFEST2026</code> <span class="ml-1 text-xs bg-green-500 text-white px-1 rounded">NEW</span></td>
                                <td class="px-4 py-3">Moonlight Crystal ×10, Gold ×8,888</td>
                                <td class="px-4 py-3 text-cozy-wood">Unknown</td>
                            </tr>
                            <tr class="bg-cozy-sky/20">
                                <td class="px-4 py-3"><code class="code-badge bg-cozy-coral text-white px-2 py-1 rounded text-xs font-bold">happy2026</code> <span class="ml-1 text-xs bg-green-500 text-white px-1 rounded">NEW</span></td>
                                <td class="px-4 py-3">Moonlight Crystal ×10, Gold ×8,888</td>
                                <td class="px-4 py-3 text-cozy-wood">Unknown</td>
                            </tr>
                            <tr class="bg-cozy-sky/20">
                                <td class="px-4 py-3"><code class="code-badge bg-cozy-coral text-white px-2 py-1 rounded text-xs font-bold">n5q7m9l2a4</code> <span class="ml-1 text-xs bg-green-500 text-white px-1 rounded">NEW</span></td>
                                <td class="px-4 py-3">Wishing Star ×5, Mermaid Fish Attractor ×3, Fertilizer ×10</td>
                                <td class="px-4 py-3 text-cozy-wood">Unknown</td>
                            </tr>
                            <tr class="bg-cozy-sky/20">
                                <td class="px-4 py-3"><code class="code-badge bg-cozy-coral text-white px-2 py-1 rounded text-xs font-bold">p7a9k2m6r8</code> <span class="ml-1 text-xs bg-green-500 text-white px-1 rounded">NEW</span></td>
                                <td class="px-4 py-3">Wishing Star ×5, Mermaid Fish Attractor ×3, Fertilizer ×10</td>
                                <td class="px-4 py-3 text-cozy-wood">Unknown</td>
                            </tr>
                            <tr class="bg-cozy-sky/20">
                                <td class="px-4 py-3"><code class="code-badge bg-cozy-coral text-white px-2 py-1 rounded text-xs font-bold">x8r2m9q5l7</code> <span class="ml-1 text-xs bg-green-500 text-white px-1 rounded">NEW</span></td>
                                <td class="px-4 py-3">Wishing Star ×5, Mermaid Fish Attractor ×3, Fertilizer ×10</td>
                                <td class="px-4 py-3 text-cozy-wood">Unknown</td>
                            </tr>
                            <tr class="bg-cozy-sky/20">
                                <td class="px-4 py-3"><code class="code-badge bg-cozy-coral text-white px-2 py-1 rounded text-xs font-bold">love214</code> <span class="ml-1 text-xs bg-green-500 text-white px-1 rounded">NEW</span></td>
                                <td class="px-4 py-3">Snowfeather Rose ×5, Pink Sparkler ×2, Pink Firework ×2</td>
                                <td class="px-4 py-3 text-cozy-wood">Unknown</td>
                            </tr>
                            <tr class="bg-cozy-sky/20">
                                <td class="px-4 py-3"><code class="code-badge bg-cozy-coral text-white px-2 py-1 rounded text-xs font-bold">38bloom2026</code> <span class="ml-1 text-xs bg-green-500 text-white px-1 rounded">NEW</span></td>
                                <td class="px-4 py-3">Mermaid Fish Attractor ×2, Egg ×10, Gold ×10,000</td>
                                <td class="px-4 py-3 text-cozy-wood">Unknown</td>
                            </tr>
    '''
    
    # Remove 'NEW' tags from old ones
    html = html.replace('<!-- NEW: Added February 9, 2026 -->', '')
    html = html.replace('<!-- NEW: Added February 2, 2026 -->', '')
    html = html.replace('<tr class="bg-cozy-sky/20">\n                                <td class="px-4 py-3"><code\n                                        class="code-badge bg-cozy-coral text-white px-2 py-1 rounded text-xs font-bold">q6p9m4a7k</code>\n                                    <span class="ml-1 text-xs bg-green-500 text-white px-1 rounded">NEW</span>', '<tr>\n                                <td class="px-4 py-3"><code\n                                        class="code-badge bg-cozy-bark text-white px-2 py-1 rounded text-xs font-bold">q6p9m4a7k</code>')
    html = html.replace('<tr class="bg-cozy-sky/20">\n                                <td class="px-4 py-3"><code\n                                        class="code-badge bg-cozy-coral text-white px-2 py-1 rounded text-xs font-bold">a9l5k7m2r8</code>\n                                    <span class="ml-1 text-xs bg-green-500 text-white px-1 rounded">NEW</span>', '<tr>\n                                <td class="px-4 py-3"><code\n                                        class="code-badge bg-cozy-bark text-white px-2 py-1 rounded text-xs font-bold">a9l5k7m2r8</code>')
    
    # Insert new codes after tbody tag
    html = html.replace('<tbody class="divide-y divide-cozy-peach/30">', '<tbody class="divide-y divide-cozy-peach/30">\n' + new_codes_html)
    
    with open(r'D:\Antigravity\heartopia.life\codes\index.html', 'w', encoding='utf-8') as f:
        f.write(html)
        
    print("Codes updated successfully!")

except Exception as e:
    print(e)
