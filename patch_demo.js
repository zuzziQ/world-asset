const fs = require('fs');
const path = 'c:/storymee/1-Harness-Apps/world-asset-management/src/app/tools/drama-studio/page.tsx';

let content = fs.readFileSync(path, 'utf8');

// 1. Remove handleLoadDemoMode
const demoModeRegex = /const handleLoadDemoMode = \(\) => \{[\s\S]*?setActiveRightTab\("calibration"\);\s*\n\s*\};\n/m;
content = content.replace(demoModeRegex, '');

// 2. Remove selectedEpisodeId === "demo-episode" early returns
content = content.replace(/if \(!selectedEpisodeId \|\| selectedEpisodeId === "demo-episode"\) return;/g, 'if (!selectedEpisodeId) return;');
content = content.replace(/if \(selectedEpisodeId === "demo-episode"\) \{\s*handleLoadDemoMode\(\);\s*return;\s*\}/g, '');

// 3. Fix handleDeleteEpisode fallback
content = content.replace(/setSelectedEpisodeId\("demo-episode"\);\s*handleSelectEpisode\("demo-episode", \[\]\);/g, 'setSelectedEpisodeId("");');

// 4. Fix condition at line 1773
content = content.replace(/\|\| selectedEpisodeId === "demo-episode"/g, '');

// 5. Fix condition at line 3847
content = content.replace(/&& selectedEpisodeId !== "demo-episode" /g, '');

// 6. Fix handleAnalyzeScript filteredCharacters
const charFilterRegex = /const filteredCharacters = \(resultData\.characters \|\| \[\]\)\.filter\(\(c: any\) => \{[\s\S]*?\}\);/m;
content = content.replace(charFilterRegex, 'const filteredCharacters = resultData.characters || [];');

// 7. Remove fallback to demo in handleEvaluateScript
const catchEvaluateRegex = /const confirmDemo = window\.confirm\([\s\S]*?handleLoadDemoMode\(\);\s*\}/m;
content = content.replace(catchEvaluateRegex, '');

// 8. Remove the Demo button from EmptyState (around line 4527)
const demoButtonRegex = /<button[\s\S]*?onClick=\{handleLoadDemoMode\}[\s\S]*?Chạy Thử Kịch Bản & Hiệu Chuẩn Demo[\s\S]*?<\/button>/m;
content = content.replace(demoButtonRegex, '');

// Also remove `const dbCharacterNames = ...` if it's unused now, but JS will just ignore it.

fs.writeFileSync(path, content, 'utf8');
console.log("Patched successfully!");
