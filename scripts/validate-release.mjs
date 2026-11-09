import {execFileSync} from 'node:child_process';
for(const file of ['scripts/build-recipes-page.mjs','scripts/build-loftia.mjs','scripts/check-loftia.mjs','scripts/audit-monthly-integrations.mjs']) execFileSync(process.execPath,[file],{stdio:'inherit'});
