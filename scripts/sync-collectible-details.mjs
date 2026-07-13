import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs';
const exec=promisify(execFile),file='data/heartopia-collectibles.json';
const data=JSON.parse(fs.readFileSync(file,'utf8'));
const slug=name=>name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
const plain=html=>html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g,' ').trim();
function detail(html){const text=plain(html),value=Number(text.match(/SELL VALUE\s+(\d+)/i)?.[1]),energy=Number(text.match(/ENERGY BOOST\s+\+?(\d+)/i)?.[1]);return {sellValue:Number.isFinite(value)?value:null,energy:Number.isFinite(energy)?energy:null,availability:/Unavailable\s+[—-]\s+Event ended/i.test(text)?'Event ended':'Available',about:text.match(/About\s+(.+?)(?:\s+SELL VALUE|\s+Location on Map)/i)?.[1]||'',sourceSlug:null};}
const failures=[];
for(let i=0;i<data.collectibles.length;i+=3){await Promise.all(data.collectibles.slice(i,i+3).map(async item=>{try{const url='https://www.heartodex.com/en/collectibles/'+slug(item.name)+'/';const {stdout}=await exec('curl.exe',['-L','--max-time','30','-sS','-A','Mozilla/5.0',url],{maxBuffer:3*1024*1024});if(!stdout.includes('<html'))throw Error('No page data');Object.assign(item,detail(stdout),{sourceSlug:slug(item.name)});delete item.culinaryUses;}catch(error){failures.push({name:item.name,error:error.message});}}));console.log(`Fetched ${Math.min(i+3,data.collectibles.length)} / ${data.collectibles.length}`)}
fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');console.log(JSON.stringify({priced:data.collectibles.filter(x=>Number.isFinite(x.sellValue)).length,failures},null,2));
