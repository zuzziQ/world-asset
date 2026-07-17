import re

with open('src/features/storyboard/hooks/useStoryboardState.ts', 'r') as f:
    content = f.read()

replacement = """
      const res = await generateText(prompt);
      if (!res || !res.data || !res.data.text) throw new Error("Empty AI result");
      const generated = res.data.text;
      const cleanJsonStr = generated.replace(/```json/g, '').replace(/```/g, '').trim();

      const parsedResponse = safeParseJson(cleanJsonStr);
      const compiled = parsedResponse.rawScript;
      const scenesArray = parsedResponse.scenes;
      const charactersList = parsedResponse.characters || [];
      const locationsList = parsedResponse.locations || [];
      const charNames = charactersList.map((c: any) => c.name);
"""

content = re.sub(
    r'3\. Output ONLY a valid JSON with keys: "rawScript", "characters", "locations", "scenes"\. Do NOT include markdown code blocks\.`;\s*pe\.setScriptText\(compiled\);',
    '3. Output ONLY a valid JSON with keys: "rawScript", "characters", "locations", "scenes". Do NOT include markdown code blocks.`;\n' + replacement + '\n\n      pe.setScriptText(compiled);',
    content
)

with open('src/features/storyboard/hooks/useStoryboardState.ts', 'w') as f:
    f.write(content)
