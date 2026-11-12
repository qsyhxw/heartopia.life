"""Independent DREADMOOR landing layout using the section's shared shell."""
import re

def render_home(article):
    title = 'DREADMOOR Guides — Fishing, Map & PC Help'
    description = 'Find Bloodgill for Father Matthias, use the map and choose your PC controller setup. DREADMOOR Early Access guides with current patch checks.'
    html = re.sub(r'<title>.*?</title>', f'<title>{title}</title>', article)
    html = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{description}">', html)
    html = html.replace('https://heartopia.life/dreadmoor/bloodgill/', 'https://heartopia.life/dreadmoor/')
    html = re.sub(r'<meta property="og:title" content="[^"]*">', f'<meta property="og:title" content="{title}">', html)
    html = html.replace('og:type" content="article', 'og:type" content="website')
    html = html.replace('https://heartopia.life/assets/dreadmoor/fishing.webp', 'https://heartopia.life/assets/dreadmoor/navigation.webp')
    html = re.sub(r'<script type="application/ld\+json">.*?</script>', '', html)
    html = html.replace('../../assets/', '/assets/').replace('href="../../', 'href="/')
    html = html.replace('href="../bloodgill/"', 'href="/dreadmoor/bloodgill/"').replace('href="../map/"', 'href="/dreadmoor/map/"').replace('href="../platforms/"', 'href="/dreadmoor/platforms/"')
    html = html.replace('dreadmoor-guide guide-layout', 'dreadmoor-guide dreadmoor-home')
    html = html.replace('</head>', '<link rel="stylesheet" href="/assets/dreadmoor/home.css"></head>')
    main = '''<main id="main">
<section class="hero" aria-labelledby="hero-title"><div class="hero-copy"><p class="eyebrow">UNOFFICIAL GUIDES · EARLY ACCESS · WINDOWS PC</p><h1 id="hero-title">DREADMOOR<span>Guides for the<br>Submerged Lands.</span></h1><p>Find the fish you need. Get your bearings. Prepare for the next trip across a flooded world.</p><div class="hero-actions"><a class="button primary" href="/dreadmoor/bloodgill/">Find Bloodgill <span aria-hidden="true">↗</span></a><a class="button" href="/dreadmoor/map/">Map help <span aria-hidden="true">→</span></a></div></div><figure class="hero-image"><img src="/assets/dreadmoor/navigation.webp" width="1280" height="720" alt="A fishing trawler approaching DREADMOOR's flooded Dry Dock settlement"><figcaption>Official gameplay imagery · Dream Dock / Digital Vortex Entertainment</figcaption></figure></section>
<div class="status-strip"><span>First-person fishing &amp; exploration</span><span>Single-player</span><span>Guides checked 12 November 2026</span></div>
<section id="guides" class="guide-groups" aria-labelledby="guides-title"><div class="section-heading"><p class="eyebrow">PLAN YOUR NEXT STEP</p><h2 id="guides-title">What brings you to shore?</h2></div><div class="task-grid">
<article class="task-card"><img src="/assets/dreadmoor/fishing.webp" width="1280" height="720" alt="A fishing rod over a flooded DREADMOOR waterway" loading="lazy"><div><p class="category">FISHING &amp; QUESTS</p><h3>Find the right catch</h3><p>Follow the Bloodgill marker, choose a predator lure and keep the fish needed for Father Matthias.</p><a href="/dreadmoor/bloodgill/">Bloodgill quest guide <span aria-hidden="true">→</span></a></div></article>
<article class="task-card map-card"><div class="map-texture" aria-hidden="true"><span>M</span></div><div><p class="category">NAVIGATION</p><h3>Get your bearings</h3><p>Open and close the map, check boat bindings and use the external fish finder when a marker is unclear.</p><a href="/dreadmoor/map/">Map controls &amp; fish finder <span aria-hidden="true">→</span></a></div></article>
<article class="task-card"><img src="/assets/dreadmoor/dock.webp" width="1280" height="720" alt="The DREADMOOR trawler beside the Dry Dock workshop" loading="lazy"><div><p class="category">BEFORE YOU PLAY</p><h3>Choose your setup</h3><p>Check the PC release, console announcement status and the DualSense or DualShock 4 setup path.</p><a href="/dreadmoor/platforms/">Platforms &amp; controllers <span aria-hidden="true">→</span></a></div></article>
</div></section>
<div id="heartopia_in_content" class="heartopia-ad-slot"></div>
<section class="patch-panel" aria-labelledby="patch-title"><div><p class="eyebrow">RETURNING TO THE WATER?</p><h2 id="patch-title">Check your update before retracing a route.</h2></div><div><p>Update #2 added Bloodgill fishing spots and a quest marker. Update #3 lets the same map button open and close the map and addresses lost body parts in Hymn to Deformity.</p><p>These changes can affect directions written for the launch build or the October Demo.</p><a href="https://steamcommunity.com/app/3629430/?l=english">Read the developer's Steam updates ↗</a></div></section>
<div id="heartopia_in_content_2" class="heartopia-ad-slot"></div>
<section class="game-context" aria-labelledby="game-title"><div><p class="eyebrow">ABOUT THE GAME</p><h2 id="game-title">A trawler. Murky water.<br>A world to piece together.</h2></div><div><p>DREADMOOR is Dream Dock's first-person fishing adventure, published by Digital Vortex Entertainment. Explore flooded settlements, catch and trade fish, craft equipment and upgrade your boat while facing threats on land and water.</p><p>The Windows PC game entered Steam Early Access on 9 November 2026. Features and quest behavior can change during development.</p><a class="button" href="https://store.steampowered.com/app/3629430/DREADMOOR/">View DREADMOOR on Steam ↗</a><p class="method">Steam and community links leave this site in the same tab. Guides use developer sources and attributed player accounts. We have not personally tested the gameplay routes.</p></div></section>
<div id="heartopia_in_content_3" class="heartopia-ad-slot"></div>
</main>'''
    return re.sub(r'<main id="main">.*?</main>', lambda _: main, html, flags=re.S)
