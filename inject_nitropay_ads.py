import os
import re

directory = "d:\\Antigravity\\heartopia.life"

GLOBAL_HEAD_SCRIPT = """    <!-- NitroPay Global Header -->
    <script data-cfasync="false">window.nitroAds=window.nitroAds||{createAd:function(){return new Promise(e=>{window.nitroAds.queue.push(["createAd",arguments,e])})},addUserToken:function(){window.nitroAds.queue.push(["addUserToken",arguments])},queue:[]};</script>
    <script data-cfasync="false" async src="https://s.nitropay.com/ads-2368.js"></script>
</head>"""

FOOTER_AD_SCRIPTS = """    <!-- NitroPay Ad Units -->
    <div id="heartopia_anchor"></div>
    <div id="heartopia_side_rail"></div>
    <div id="heartopia_floating_video"></div>
    <script>
        if(window['nitroAds']) {
            // Anchor Ad
            window['nitroAds'].createAd('heartopia_anchor', {
                "format": "anchor-v2",
                "anchor": "bottom",
                "anchorBgColor": "rgb(0 0 0 / 80%)",
                "anchorClose": true,
                "anchorPersistClose": false,
                "anchorStickyOffset": 0,
                "mediaQuery": "(min-width: 0px)",
                "report": { "enabled": true, "icon": true, "wording": "Report Ad", "position": "top-right" }
            });

            // Floating Video
            window['nitroAds'].createAd('heartopia_floating_video', {
                "format": "floating",
                "report": { "enabled": true, "icon": true, "wording": "Report Ad", "position": "top-left" }
            });

            // Sticky Side Rail
            window['nitroAds'].createAd('heartopia_side_rail', {
                "format": "rail",
                "rail": "right",
                "railOffsetTop": 0,
                "railOffsetBottom": 0,
                "railCollisionWhitelist": [],
                "railCloseColor": "#666666",
                "railSpacing": 10,
                "railStack": false,
                "railStickyTop": 0,
                "railVerticalAlign": "top",
                "report": { "enabled": true, "icon": true, "wording": "Report Ad", "position": "top-left" },
                "mediaQuery": "(min-width: 1025px)"
            });

            // In-Content Article
            window['nitroAds'].createAd('heartopia_in_content', {
                "format": "article",
                "articleOffsetTop": 0,
                "pageInterval": 1,
                "report": { "enabled": true, "icon": true, "wording": "Report Ad", "position": "bottom-right" }
            });
        }
    </script>
</body>"""

processed = 0
for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith(".html"):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            modified = False

            # 1. Inject global head script if missing
            if 'ads-2368.js' not in content:
                content = re.sub(r'</head>', GLOBAL_HEAD_SCRIPT, content, count=1, flags=re.IGNORECASE)
                modified = True

            # 2. Inject heartopia_in_content id into main tag if missing
            if '<main' in content and 'id="heartopia_in_content"' not in content:
                content = re.sub(r'(<main\b)(?![^>]*\bid="heartopia_in_content")', r'\1 id="heartopia_in_content"', content, count=1, flags=re.IGNORECASE)
                modified = True

            # 3. Inject footer ad scripts before body if missing
            if 'createAd(\'heartopia_anchor\'' not in content:
                content = re.sub(r'</body>', FOOTER_AD_SCRIPTS, content, count=1, flags=re.IGNORECASE)
                modified = True

            if modified:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                processed += 1

print(f"Injection complete. Updated {processed} HTML files.")
