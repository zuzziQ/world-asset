const fs = require('fs');
const content = fs.readFileSync('src/app/tools/drama-studio/page.tsx', 'utf8');
const lines = content.split('\n');

console.log('--- Lines 4695 to 4725 ---');
lines.slice(4694, 4725).forEach((l, i) => console.log(`${4695 + i}: ${l}`));

console.log('\n--- Lines 4925 to 4955 ---');
lines.slice(4924, 4955).forEach((l, i) => console.log(`${4925 + i}: ${l}`));
