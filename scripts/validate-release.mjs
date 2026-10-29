import {execFileSync} from 'node:child_process';
for(const file of ['scripts/build-recipes-page.mjs','scripts/audit-monthly-integrations.mjs']) execFileSync(process.execPath,[file],{stdio:'inherit'});
