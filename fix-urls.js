const fs = require('fs');
const path = require('path');

const files = [
  'src/app/character/[id]/page.tsx',
  'src/app/orchestrator/page.tsx',
  'src/app/orchestrator/semantics/page.tsx',
  'src/app/page.tsx',
];

const OLD = /process\.env\.NEXT_PUBLIC_OMNI_CORE_API \|\| ['"]https?:\/\/(localhost:4500|core\.storymee\.com)\/api['"]/g;
const NEW = 'API_BASE_URL';

files.forEach(f => {
  const fullPath = path.join(__dirname, f);
  if (!fs.existsSync(fullPath)) { console.log('SKIP (not found):', f); return; }
  const before = fs.readFileSync(fullPath, 'utf8');
  const after = before.replace(OLD, NEW);
  if (before === after) { console.log('NO CHANGE:', f); return; }
  fs.writeFileSync(fullPath, after, 'utf8');
  const count = (before.match(OLD) || []).length;
  console.log(`FIXED (${count} replacements):`, f);
});

// Also replace any leftover bare core.storymee.com in these files
files.forEach(f => {
  const fullPath = path.join(__dirname, f);
  if (!fs.existsSync(fullPath)) return;
  const before = fs.readFileSync(fullPath, 'utf8');
  const after = before.replace(/https:\/\/core\.storymee\.com\/api/g, 'https://dev-hub.storymee.com/api');
  if (before !== after) {
    fs.writeFileSync(fullPath, after, 'utf8');
    console.log('FIXED bare URL:', f);
  }
});

console.log('Done!');
