import fs from 'node:fs';
const root=process.cwd();
const data=JSON.parse(fs.readFileSync(root+'/data/heartopia-collectibles.json','utf8'));
if(data.collectibles.length!==37)throw Error('Expected 37 collectibles');
for(const item of data.collectibles){if(!fs.existsSync(root+item.image))throw Error('Missing image: '+item.image)}
console.log('Verified '+data.collectibles.length+' collectibles and local images.');
