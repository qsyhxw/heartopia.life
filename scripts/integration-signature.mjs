import fs from 'node:fs';import crypto from 'node:crypto';
export const signature=html=>[...html.replaceAll('\r\n','\n').matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].filter(m=>!/application\/ld\+json/i.test(m[1])).map(m=>({attributes:m[1].trim(),sha256:crypto.createHash('sha256').update(m[2].replace(/const recipes=\[.*?\];const detailMap=/s,'const recipes=DATA;const detailMap=')).digest('hex')}));
export const inventory=html=>({scripts:signature(html),containers:[...html.replaceAll('\r\n','\n').matchAll(/id=["'](heartopia_(?:in_content(?:_2)?|anchor|side_rail|floating_video))["']/g)].map(m=>m[1])});

