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
// Instead of regex with [\s\S]*?, I'll use a string replacement of exactly the lines
const lines = content.split('\\n');
let newLines = [];
let skip = false;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('onClick={handleLoadDemoMode}')) {
        // Look back to remove the <button opening tag
        let j = newLines.length - 1;
        while (j >= 0 && !newLines[j].includes('<button')) {
            newLines.pop();
            j--;
        }
        newLines.pop(); // pop the <button line itself
        skip = true;
        continue;
    }
    if (skip && lines[i].includes('</button>')) {
        skip = false;
        continue;
    }
    if (!skip) {
        newLines.push(lines[i]);
    }
}
content = newLines.join('\\n');

fs.writeFileSync(path, content, 'utf8');
console.log("Patched successfully!");
