import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const write=(file,value)=>{const target=path.join(root,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,value);};
const decode=value=>String(value||'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&nbsp;/g,' ');
const text=value=>decode(value.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim());
const source='https://www.heartodex.com/en/';
const assetName=value=>String(value).replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'').replace(/(^|-)\w/g,match=>match.toUpperCase()).replaceAll('-','-')+'.webp';
async function downloadImage(kind,item){const response=await fetch(item.imageUrl,{headers:{'user-agent':'HeartopiaLifeAutoSync/1.0 (+https://heartopia.life/)'}});if(!response.ok)throw new Error('image returned '+response.status);const bytes=Buffer.from(await response.arrayBuffer());if(bytes.length<100||bytes.subarray(0,4).toString()!=='RIFF'||bytes.subarray(8,12).toString()!=='WEBP')throw new Error('image is not a valid WebP');const target=path.join(root,'img',kind,assetName(item.name));fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,bytes);return '/img/'+kind+'/'+path.basename(target);}

async function detail(kind,item){
  const response=await fetch(source+kind+'/'+item.slug+'/',{headers:{'user-agent':'HeartopiaLifeAutoSync/1.0 (+https://heartopia.life/)'}});
  if(!response.ok) throw new Error(kind+'/'+item.slug+' returned '+response.status);
  const html=await response.text();
  const image=html.match(/<meta property="og:image" content="([^"]+)"/i)?.[1]||null;
  const level=Number(html.match(/>Level<\/span>\s*<span[^>]*>(\d+)<\/span>/i)?.[1]);
  const weather=[...html.matchAll(/Weather<\/h2>[\s\S]{0,9000}?<span[^>]*>(Rainbow|Sunny|Rainy)<\/span>/gi)].map(match=>match[1]);
  if(!image||!Number.isFinite(level)||!weather.length) throw new Error(kind+'/'+item.slug+' is missing image, level, or weather');
  return {slug:item.slug,name:item.name,imageUrl:image,level,weather:[...new Set(weather)]};
}

const snapshot=JSON.parse(read('data/monitor/heartodex-collections.json'));
const output={source,ready:{fish:[],birds:[],insects:[]},blocked:{fish:[],birds:[],insects:[]}};
for(const kind of ['fish','birds','insects']){
  for(const item of snapshot.collections[kind].pendingReview.remoteAdded){
    try{const parsed=await detail(kind,item);parsed.image=await downloadImage(kind,parsed);output.ready[kind].push(parsed);}
    catch(error){output.blocked[kind].push({slug:item.slug,name:item.name,error:error.message});}
  }
}
write('data/monitor/heartodex-sync-readiness.json',JSON.stringify(output,null,2)+'\n');
const blocked=output.blocked.fish.length+output.blocked.birds.length+output.blocked.insects.length;
const ready=output.ready.fish.length+output.ready.birds.length+output.ready.insects.length;
console.log('Prepared '+ready+' additions; '+blocked+' additions blocked by required-field validation.');
if(blocked) process.exitCode=2;
