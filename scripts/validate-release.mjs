import {execFileSync} from 'node:child_process';
execFileSync('python',['scripts/build-query-guides.py'],{stdio:'inherit'});
for(const file of ['scripts/build-recipes-page.mjs','scripts/build-loftia.mjs','scripts/check-loftia.mjs','scripts/build-petit-planet.mjs','scripts/check-petit-planet.mjs','scripts/audit-monthly-integrations.mjs']) execFileSync(process.execPath,[file],{stdio:'inherit'});
