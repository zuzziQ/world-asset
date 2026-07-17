import re

with open('src/features/storyboard/hooks/useCopilotCalibration.ts', 'r') as f:
    content = f.read()

# Add import generateText
content = content.replace('import { createCharacter, updateCharacter, updateScene, fetchCharacters, updateProject, consolidateProjectStyle } from "@/lib/api";',
'import { createCharacter, updateCharacter, updateScene, fetchCharacters, updateProject, consolidateProjectStyle, generateText } from "@/lib/api";')

# Replace fetch block
fetch_pattern = r"const res = await fetch\('/api/generate/text', \{[\s\S]*?body: JSON\.stringify\(\{ prompt, accessToken \}\)\n\s*\}\);\n\n\s*if \(res\.ok\) \{\n\s*const data = await res\.json\(\);\n\s*if \(data\.text\) \{\n\s*const parsed = safeParseJson\(data\.text\);"

replacement = """const res = await generateText(prompt);
      if (res && res.data && res.data.text) {
        const parsed = safeParseJson(res.data.text);"""

content = re.sub(fetch_pattern, replacement, content)

with open('src/features/storyboard/hooks/useCopilotCalibration.ts', 'w') as f:
    f.write(content)
