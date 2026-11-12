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
    html = html.replace('https://heartopia.life/assets/dreadmoor/fishing.webp', 'https://heartopia.life/assets/dreadmoor/harbour.webp')
    html = re.sub(r'<script type="application/ld\+json">.*?</script>', '', html)
    html = html.replace('../../assets/', '/assets/').replace('href="../../', 'href="/')
    html = html.replace('href="../bloodgill/"', 'href="/dreadmoor/bloodgill/"').replace('href="../map/"', 'href="/dreadmoor/map/"').replace('href="../platforms/"', 'href="/dreadmoor/platforms/"')
    html = html.replace('dreadmoor-guide guide-layout', 'dreadmoor-guide dreadmoor-home')
    html = html.replace('</head>', '<link rel="stylesheet" href="/assets/dreadmoor/home.css"></head>')
    main = '''<main id="main">
<section class="hero" aria-labelledby="hero-title">
<img class="harbour-scene" src="/assets/dreadmoor/harbour.webp" width="1920" height="1080" alt="A lantern-lit trawler beside a decaying fishing settlement in DREADMOOR's dark wetlands" fetchpriority="high">
<div class="hero-title"><p class="eyebrow">UNOFFICIAL FIELD GUIDE · EARLY ACCESS</p><h1 id="hero-title">DREADMOOR<span>Guides for the Submerged Lands.</span></h1></div>
<div class="hero-bottom"><div><p>Fishing routes. Map controls. PC setup.</p><span>Fishing, navigation and a way back to shore.</span></div><a href="#guides" class="chart-link">Find your next step <span aria-hidden="true">↓</span></a></div>
</section>
<div class="harbour-strip"><span>WINDOWS PC <i aria-hidden="true">/</i> SINGLE-PLAYER</span><span>Checked 12 November 2026</span><span class="art-credit">Game imagery © Dream Dock / Digital Vortex Entertainment</span></div>
<section id="guides" class="guide-groups">
<div class="guide-heading"><p class="eyebrow">THE FIELD NOTES</p><h2>Choose your<br>next step.</h2><p>Pick up where your expedition left off.</p></div>
<div class="field-layout"><div class="task-list">
<a class="task-row" href="/dreadmoor/bloodgill/"><img src="/assets/dreadmoor/fishing.webp" width="1280" height="720" alt="First-person fishing in DREADMOOR" loading="lazy"><div><span class="category">FISHING &amp; QUESTS</span><h3>Where is the Bloodgill?</h3><p>Find Father Matthias's fish, choose your lure and keep the catch for delivery.</p></div><span class="row-arrow" aria-hidden="true">↗</span></a>
<a class="task-row" href="/dreadmoor/map/"><img src="/assets/dreadmoor/navigation.webp" width="1280" height="720" alt="A trawler approaching the Dry Dock" loading="lazy"><div><span class="category">MAP &amp; NAVIGATION</span><h3>Find your bearings.</h3><p>Map controls, boat bindings and the fish finder for an unclear marker.</p></div><span class="row-arrow" aria-hidden="true">↗</span></a>
<a class="task-row" href="/dreadmoor/platforms/"><img src="/assets/dreadmoor/dock.webp" width="1280" height="720" alt="DREADMOOR's Dry Dock workshop" loading="lazy"><div><span class="category">PLATFORMS &amp; CONTROLLERS</span><h3>Before you set sail.</h3><p>PC availability, console status and PlayStation controller setup.</p></div><span class="row-arrow" aria-hidden="true">↗</span></a>
</div><aside class="dispatch" aria-labelledby="dispatch-title"><span class="dispatch-label">FROM THE DOCK</span><h2 id="dispatch-title">Old directions? <br>Check your update.</h2><p>Update #2 added Bloodgill fishing spots and a quest marker.</p><p>Update #3 lets the same map button open and close the map and addresses lost body parts in Hymn to Deformity.</p><a href="https://steamcommunity.com/app/3629430/?l=english">Developer updates on Steam <span aria-hidden="true">↗</span></a><span class="dispatch-note">Early Access routes can change.</span></aside></div>
</section>
<div id="heartopia_in_content" class="heartopia-ad-slot"></div>
<section class="game-context" aria-labelledby="game-title"><div class="game-heading"><p class="eyebrow">THE WORLD BEYOND THE DOCK</p><h2 id="game-title">Fishing in a<br>flooded world.</h2></div><div class="game-copy"><p>DREADMOOR is Dream Dock's first-person fishing adventure, published by Digital Vortex Entertainment. Catch and trade fish, craft equipment and upgrade your boat as you explore flooded settlements and face threats on land and water.</p><p>Available on Windows PC through Steam Early Access since 9 November 2026.</p><a href="https://store.steampowered.com/app/3629430/DREADMOOR/">Explore DREADMOOR on Steam <span aria-hidden="true">↗</span></a></div></section>
<div id="heartopia_in_content_2" class="heartopia-ad-slot"></div>
<div class="editorial-note"><p>Independent guides built from developer sources and attributed player accounts. Gameplay routes have not been personally tested. External Steam links open in this tab.</p></div>
<div id="heartopia_in_content_3" class="heartopia-ad-slot"></div>
</main>'''
    return re.sub(r'<main id="main">.*?</main>', lambda _: main, html, flags=re.S)
