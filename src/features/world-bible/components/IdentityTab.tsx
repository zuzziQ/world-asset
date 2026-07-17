import React from "react";
import { Sparkles } from "lucide-react";
import { WorldBible } from "../schema";

interface IdentityTabProps {
  bible: WorldBible;
  onChange: (updatedBible: WorldBible) => void;
}

export default function IdentityTab({ bible, onChange }: IdentityTabProps) {
  const updateIdentity = (key: keyof WorldBible["coreIdentity"], value: any) => {
    onChange({
      ...bible,
      coreIdentity: {
        ...bible.coreIdentity,
        [key]: value,
      },
    });
  };

  const updateAmbiguity = (
    level: "level1" | "level2" | "level3",
    field: "name" | "ratio" | "example",
    value: any
  ) => {
    onChange({
      ...bible,
      coreIdentity: {
        ...bible.coreIdentity,
        paradigmAmbiguity: {
          ...bible.coreIdentity.paradigmAmbiguity,
          [level]: {
            ...bible.coreIdentity.paradigmAmbiguity[level],
            [field]: value,
          },
        },
      },
    });
  };

  const level1Ratio = bible.coreIdentity.paradigmAmbiguity.level1.ratio || 0;
  const level2Ratio = bible.coreIdentity.paradigmAmbiguity.level2.ratio || 0;
  const level3Ratio = bible.coreIdentity.paradigmAmbiguity.level3.ratio || 0;
  const totalRatio = level1Ratio + level2Ratio + level3Ratio;

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 block">Slogan / Tagline</label>
          <input
            type="text"
            value={bible.coreIdentity.tagline}
            onChange={(e) => updateIdentity("tagline", e.target.value)}
            placeholder="Ví dụ: Say it wrong, learn it right. / Nói sai để hiểu đúng."
            className="w-full bg-black/60 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-neutral-200 outline-none focus:border-purple-500/30 transition font-bold"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 block">Triết lý cốt lõi (Core Engine)</label>
          <input
            type="text"
            value={bible.coreIdentity.coreEngine}
            onChange={(e) => updateIdentity("coreEngine", e.target.value)}
            placeholder="Ví dụ: Sai đúng cách có giá trị hơn đúng mà không hiểu."
            className="w-full bg-black/60 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-neutral-200 outline-none focus:border-purple-500/30 transition font-bold"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 block">Nghịch lý cốt lõi (Paradox)</label>
        <textarea
          value={bible.coreIdentity.paradox}
          onChange={(e) => updateIdentity("paradox", e.target.value)}
          placeholder="Mô tả nghịch lý central của thế giới (Ví dụ: Con vẹt tưởng dốt lại là đứa giỏi nhất...)"
          className="w-full bg-black/60 border border-white/5 rounded-xl px-3.5 py-2 text-xs text-neutral-200 outline-none resize-none h-20 focus:border-purple-500/30 transition custom-scrollbar font-semibold leading-relaxed"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 block">Mô tả thiết lập IP (Core IP Description)</label>
        <textarea
          value={bible.coreIdentity.coreIpDescription}
          onChange={(e) => updateIdentity("coreIpDescription", e.target.value)}
          placeholder="Mô tả tóm tắt về IP cốt lõi và giới hạn kiến thức..."
          className="w-full bg-black/60 border border-white/5 rounded-xl px-3.5 py-2 text-xs text-neutral-200 outline-none resize-none h-20 focus:border-purple-500/30 transition custom-scrollbar font-semibold leading-relaxed"
        />
      </div>

      {/* Ambiguity Levels */}
      <div className="border-t border-white/5 pt-4 space-y-4">
        <h3 className="text-xs font-black text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-pink-500" /> Cấp Độ Ambiguity (Paradigm levels & Ratios)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {(["level1", "level2", "level3"] as const).map((lvl, index) => {
            const levelData = bible.coreIdentity.paradigmAmbiguity[lvl];
            return (
              <div key={lvl} className="bg-black/30 border border-white/5 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Cấp độ {index + 1}</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={levelData.ratio}
                      onChange={(e) => updateAmbiguity(lvl, "ratio", parseInt(e.target.value) || 0)}
                      className="w-12 bg-black border border-white/10 rounded px-1.5 py-0.5 text-center text-xs font-black text-purple-400"
                    />
                    <span className="text-[10px] text-neutral-500 font-bold">%</span>
                  </div>
                </div>

                <input
                  type="text"
                  value={levelData.name}
                  onChange={(e) => updateAmbiguity(lvl, "name", e.target.value)}
                  placeholder="Tên cấp độ..."
                  className="w-full bg-black border border-white/10 rounded-lg px-2 py-1 text-xs font-bold text-neutral-200"
                />

                <textarea
                  value={levelData.example}
                  onChange={(e) => updateAmbiguity(lvl, "example", e.target.value)}
                  placeholder="Ví dụ minh họa..."
                  className="w-full bg-black border border-white/10 rounded-lg p-2 text-[10px] text-neutral-400 resize-none h-14 outline-none custom-scrollbar leading-relaxed"
                />
              </div>
            );
          })}
        </div>

        {/* Visual progress bar of ratios */}
        <div className="space-y-1">
          <label className="text-[7.5px] font-black text-neutral-500 uppercase tracking-widest block">
            Tổng tỷ lệ kịch bản (Tổng: {totalRatio}%)
          </label>
          <div className="h-2 rounded-full overflow-hidden flex bg-neutral-900">
            <div
              style={{ width: `${level1Ratio}%` }}
              className="bg-blue-500 transition-all duration-300"
              title={`Cấp 1: ${level1Ratio}%`}
            />
            <div
              style={{ width: `${level2Ratio}%` }}
              className="bg-amber-500 transition-all duration-300"
              title={`Cấp 2: ${level2Ratio}%`}
            />
            <div
              style={{ width: `${level3Ratio}%` }}
              className="bg-emerald-500 transition-all duration-300"
              title={`Cấp 3: ${level3Ratio}%`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
