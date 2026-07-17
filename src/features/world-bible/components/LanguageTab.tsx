import React from "react";
import { Trash2, Globe, Sparkles } from "lucide-react";
import { WorldBible, BilingualRule, ComedyFormula } from "../schema";

interface LanguageTabProps {
  bible: WorldBible;
  onChange: (updatedBible: WorldBible) => void;
}

export default function LanguageTab({ bible, onChange }: LanguageTabProps) {
  const addBilingualRule = () => {
    const rules = bible.languageEngine.bilingualRules || [];
    onChange({
      ...bible,
      languageEngine: {
        ...bible.languageEngine,
        bilingualRules: [...rules, { word: "", english: "", vietnameseExtensions: "", context: "" }],
      },
    });
  };

  const updateBilingualRule = (index: number, field: keyof BilingualRule, value: string) => {
    const list = [...(bible.languageEngine.bilingualRules || [])];
    list[index] = {
      ...list[index],
      [field]: value,
    };
    onChange({
      ...bible,
      languageEngine: {
        ...bible.languageEngine,
        bilingualRules: list,
      },
    });
  };

  const removeBilingualRule = (index: number) => {
    const list = (bible.languageEngine.bilingualRules || []).filter((_, i) => i !== index);
    onChange({
      ...bible,
      languageEngine: {
        ...bible.languageEngine,
        bilingualRules: list,
      },
    });
  };

  const addComedyFormula = () => {
    const formulas = bible.languageEngine.comedyFormulas || [];
    onChange({
      ...bible,
      languageEngine: {
        ...bible.languageEngine,
        comedyFormulas: [...formulas, { type: "", description: "" }],
      },
    });
  };

  const updateComedyFormula = (index: number, field: keyof ComedyFormula, value: string) => {
    const list = [...(bible.languageEngine.comedyFormulas || [])];
    list[index] = {
      ...list[index],
      [field]: value,
    };
    onChange({
      ...bible,
      languageEngine: {
        ...bible.languageEngine,
        comedyFormulas: list,
      },
    });
  };

  const removeComedyFormula = (index: number) => {
    const list = (bible.languageEngine.comedyFormulas || []).filter((_, i) => i !== index);
    onChange({
      ...bible,
      languageEngine: {
        ...bible.languageEngine,
        comedyFormulas: list,
      },
    });
  };

  const bilingualRules = bible.languageEngine.bilingualRules || [];
  const comedyFormulas = bible.languageEngine.comedyFormulas || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Bilingual vocabulary rules */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <h3 className="text-xs font-black text-purple-400 uppercase tracking-widest flex items-center gap-1">
            <Globe className="w-4 h-4 text-cyan-400" /> Bảng Từ Vựng Mở Rộng (Bilingual Rules)
          </h3>
          <button
            onClick={addBilingualRule}
            className="bg-purple-950/40 hover:bg-purple-600 border border-purple-500/20 text-purple-400 hover:text-white px-2.5 py-1 rounded-lg text-[8px] font-black uppercase transition cursor-pointer"
          >
            + Thêm Cặp Từ
          </button>
        </div>

        <div className="space-y-3">
          {bilingualRules.length === 0 ? (
            <div className="text-center text-xs text-neutral-600 py-6 border border-dashed border-white/5 rounded-2xl">
              Chưa nhập cặp từ vựng song ngữ nào.
            </div>
          ) : (
            bilingualRules.map((rule, idx) => (
              <div key={idx} className="bg-black/30 border border-white/5 rounded-2xl p-4 relative group/rule space-y-3">
                <div className="flex justify-between items-center border-b border-white/5 pb-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Cặp từ #{idx + 1}</span>
                  <button
                    onClick={() => removeBilingualRule(idx)}
                    className="p-0.5 text-neutral-600 hover:text-red-400 opacity-0 group-hover/rule:opacity-100 transition cursor-pointer"
                    title="Xóa cặp từ"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[7.5px] font-black text-neutral-500 uppercase tracking-widest block">Từ tiếng Anh (Word)</label>
                    <input
                      type="text"
                      value={rule.word}
                      onChange={(e) => updateBilingualRule(idx, "word", e.target.value)}
                      placeholder="Ví dụ: CARRY..."
                      className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1 text-xs font-bold text-neutral-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[7.5px] font-black text-neutral-500 uppercase tracking-widest block">Ý nghĩa tiếng Anh</label>
                    <input
                      type="text"
                      value={rule.english}
                      onChange={(e) => updateBilingualRule(idx, "english", e.target.value)}
                      placeholder="Nghĩa..."
                      className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-neutral-300"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[7.5px] font-black text-neutral-500 uppercase tracking-widest block">Sắc thái mở rộng tiếng Việt</label>
                    <input
                      type="text"
                      value={rule.vietnameseExtensions}
                      onChange={(e) => updateBilingualRule(idx, "vietnameseExtensions", e.target.value)}
                      placeholder="bưng, vác, cõng, bồng..."
                      className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-neutral-300"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[7.5px] font-black text-neutral-500 uppercase tracking-widest block">Ngữ cảnh kịch bản minh họa</label>
                  <input
                    type="text"
                    value={rule.context}
                    onChange={(e) => updateBilingualRule(idx, "context", e.target.value)}
                    placeholder="Diễn giải cốt truyện..."
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-neutral-300"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Comedy formulas */}
      <div className="space-y-3 border-t border-white/5 pt-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <h3 className="text-xs font-black text-purple-400 uppercase tracking-widest flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-pink-500" /> Công Thức Hài Ngôn Ngữ (Comedy Formulas)
          </h3>
          <button
            onClick={addComedyFormula}
            className="bg-purple-950/40 hover:bg-purple-600 border border-purple-500/20 text-purple-400 hover:text-white px-2.5 py-1 rounded-lg text-[8px] font-black uppercase transition cursor-pointer"
          >
            + Thêm Công Thức
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {comedyFormulas.length === 0 ? (
            <div className="col-span-2 text-center text-xs text-neutral-600 py-6 border border-dashed border-white/5 rounded-2xl">
              Chưa tạo công thức hài ngôn ngữ nào.
            </div>
          ) : (
            comedyFormulas.map((form, idx) => (
              <div key={idx} className="bg-black/30 border border-white/5 rounded-2xl p-4 relative group/form space-y-2">
                <button
                  onClick={() => removeComedyFormula(idx)}
                  className="absolute top-2 right-2 p-1 text-neutral-600 hover:text-red-400 opacity-0 group-hover/form:opacity-100 transition cursor-pointer"
                  title="Xóa công thức"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="space-y-1">
                  <label className="text-[7.5px] font-black text-neutral-500 uppercase tracking-widest block">Tên công thức</label>
                  <input
                    type="text"
                    value={form.type}
                    onChange={(e) => updateComedyFormula(idx, "type", e.target.value)}
                    placeholder="Ví dụ: Homophones (đồng âm)..."
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1 text-xs font-bold text-neutral-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[7.5px] font-black text-neutral-500 uppercase tracking-widest block">Cơ chế & Ví dụ kịch bản</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => updateComedyFormula(idx, "description", e.target.value)}
                    placeholder="Mô tả cơ chế..."
                    className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-[10px] text-neutral-300 resize-none h-14 custom-scrollbar leading-relaxed"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
