import React from "react";
import { Trash2 } from "lucide-react";
import { WorldBible } from "../schema";

interface RitualTabProps {
  bible: WorldBible;
  onChange: (updatedBible: WorldBible) => void;
}

export default function RitualTab({ bible, onChange }: RitualTabProps) {
  const addRitualHook = () => {
    const steps = bible.ritualHooks || [];
    const nextNum = steps.length + 1;
    onChange({
      ...bible,
      ritualHooks: [...steps, { step: `R${nextNum}`, name: "", description: "" }],
    });
  };

  const updateRitualHook = (index: number, field: "name" | "description", value: string) => {
    const list = [...(bible.ritualHooks || [])];
    list[index] = {
      ...list[index],
      [field]: value,
    };
    onChange({
      ...bible,
      ritualHooks: list,
    });
  };

  const removeRitualHook = (index: number) => {
    const list = (bible.ritualHooks || []).filter((_, i) => i !== index);
    onChange({
      ...bible,
      ritualHooks: list,
    });
  };

  const hooks = bible.ritualHooks || [];

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
          Nghi lễ lặp lại theo tập (Ritual Steps)
        </span>
        <button
          onClick={addRitualHook}
          className="bg-purple-950/40 hover:bg-purple-600 border border-purple-500/20 text-purple-400 hover:text-white px-2.5 py-1 rounded-lg text-[8px] font-black uppercase transition cursor-pointer"
        >
          + Thêm Nhịp Ritual
        </button>
      </div>

      <div className="space-y-3">
        {hooks.length === 0 ? (
          <div className="text-center text-xs text-neutral-600 py-10 border border-dashed border-white/5 rounded-2xl">
            Chưa cấu hình nhịp ritual nào.
          </div>
        ) : (
          hooks.map((step, idx) => (
            <div key={idx} className="bg-black/30 border border-white/5 rounded-2xl p-4 flex gap-4 items-start relative group">
              <span className="w-12 bg-purple-950/30 border border-purple-500/20 text-purple-400 px-2.5 py-1.5 rounded-xl font-mono text-xs font-black text-center uppercase shrink-0">
                {step.step || `R${idx + 1}`}
              </span>

              <div className="flex-1 grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[7.5px] font-black text-neutral-500 uppercase tracking-widest">Tên nhịp</label>
                  <input
                    type="text"
                    value={step.name}
                    onChange={(e) => updateRitualHook(idx, "name", e.target.value)}
                    placeholder="Ví dụ: Từ rơi vào nhà..."
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-neutral-200 font-bold"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-[7.5px] font-black text-neutral-500 uppercase tracking-widest">Hành động / Script Detail</label>
                  <input
                    type="text"
                    value={step.description}
                    onChange={(e) => updateRitualHook(idx, "description", e.target.value)}
                    placeholder="Chi tiết diễn biến..."
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-neutral-300"
                  />
                </div>
              </div>

              <button
                onClick={() => removeRitualHook(idx)}
                className="absolute top-2 right-2 p-1 text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                title="Xóa nhịp"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
