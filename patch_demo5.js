const fs = require('fs');
const path = 'c:/storymee/1-Harness-Apps/world-asset-management/src/app/tools/drama-studio/page.tsx';

let content = fs.readFileSync(path, 'utf8');

// 1. Remove handleLoadDemoMode entirely
content = content.replace(/  const handleLoadDemoMode = \(\) => \{\n    if \(\!selectedEpisodeId\) \{\n      const defaultDemoId = "demo-episode";\n      setSelectedEpisodeId\(defaultDemoId\);\n      handleSelectEpisode\(defaultDemoId, \[]\);\n    \}\n    setActiveRightTab\("calibration"\);\n  \};\n/g, '');

// 2. Fix selectedEpisodeId early returns
content = content.replace(/if \(!selectedEpisodeId \|\| selectedEpisodeId === "demo-episode"\) return;/g, 'if (!selectedEpisodeId) return;');
content = content.replace(/    if \(selectedEpisodeId === "demo-episode"\) \{\n      handleLoadDemoMode\(\);\n      return;\n    \}\n/g, '');

// 3. Fix handleDeleteEpisode fallback
content = content.replace(/setSelectedEpisodeId\("demo-episode"\);\n      handleSelectEpisode\("demo-episode", \[]\);/g, 'setSelectedEpisodeId("");');

// 4. Fix condition at line 1773 and 3847
content = content.replace(/\|\| selectedEpisodeId === "demo-episode"/g, '');
content = content.replace(/&& selectedEpisodeId !== "demo-episode" /g, '');

// 5. Remove charFilterDemo
content = content.replace(/        const filteredCharacters = \(resultData\.characters \|\| \[\]\)\.filter\(\(c: any\) => \{\n          if \(c\.isDemo\) return false;\n          if \(c\.name && c\.name\.toLowerCase\(\)\.includes\("demo"\)\) return false;\n          return true;\n        \}\);/g, '        const filteredCharacters = resultData.characters || [];');

// 6. Remove fallback to demo in handleEvaluateScript
content = content.replace(/      } else {\n        const confirmDemo = window\.confirm\(\n          "Đánh giá kịch bản AI tạm thời không phản hồi. Bạn có muốn tải phân tích Demo mẫu để tiếp tục không\?"\n        \);\n        if \(confirmDemo\) \{\n          handleLoadDemoMode\(\);\n        \}\n      }/g, '      } else {\n        toast.error("Không thể đánh giá kịch bản. Vui lòng thử lại.");\n      }');

// 7. Remove the Demo button from EmptyState (around line 4527)
content = content.replace(/                    <button\n                      onClick=\{handleLoadDemoMode\}\n                      className="flex items-center gap-2 px-5 py-2\.5 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-500\/25 active:scale-95 transition-all border border-purple-500\/30 animate-pulse hover:animate-none font-sans"\n                    >\n                      <Sparkles className="w-4 h-4 text-purple-200" \/>\n                      ⚡ Chạy Thử Kịch Bản & Hiệu Chuẩn Demo\n                    <\/button>\n/g, '');


fs.writeFileSync(path, content, 'utf8');
console.log("Patched successfully via exact strings!");
