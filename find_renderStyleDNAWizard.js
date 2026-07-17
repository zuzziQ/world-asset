const fs = require('fs');
const content = fs.readFileSync('src/app/tools/drama-studio/page.tsx', 'utf8');
const lines = content.split('\n');

lines.forEach((line, idx) => {
  if (line.includes('renderStyleDNAWizard')) {
    console.log(`${idx + 1}: ${line}`);
  }
});
