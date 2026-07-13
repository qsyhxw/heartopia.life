import fs from 'node:fs';
const data=JSON.parse(fs.readFileSync('data/heartopia-collectibles.json','utf8')).collectibles;
const html=fs.readFileSync('database/collectibles/index.html','utf8');
const images=data.filter(x=>!fs.existsSync('.'+x.image));
const script=html.match(/<script>const items=([\s\S]*?)<\/script><\/body>/)?.[1];
if(!script)throw Error('Page script missing');new Function(script);
if(data.length!==37||data.filter(x=>Number.isFinite(x.sellValue)).length!==36||images.length)throw Error('Collectible data verification failed');
if(!html.includes('G-FRJ91G3VRR')||!html.includes('ads-2368.js'))throw Error('Missing GA or Nitro');
console.log('Verified 37 entries, 36 sell values, local images, page JavaScript, GA, and Nitro.');
