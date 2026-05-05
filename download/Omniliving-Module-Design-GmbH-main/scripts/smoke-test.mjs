import fs from 'node:fs';
const needed = ['src/App.jsx','src/main.jsx','src/styles.css','index.html'];
for (const file of needed) {
  if (!fs.existsSync(file)) throw new Error(`Missing ${file}`);
}
console.log('Smoke test passed. Core files exist.');
