import fs from 'node:fs';
const now = new Date().toISOString();
const line = `- ${now}: Automated worklog heartbeat for Omniliving site build\n`;
fs.appendFileSync('WORKLOG.md', line);
console.log('Worklog updated');
