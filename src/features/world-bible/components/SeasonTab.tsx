import React from "react";
import { Trash2 } from "lucide-react";
import { WorldBible, SeasonalEvent } from "../schema";

interface SeasonTabProps {
  bible: WorldBible;
  onChange: (updatedBible: WorldBible) => void;
}

export default function SeasonTab({ bible, onChange }: SeasonTabProps) {
  const addSeasonalEvent = () => {
    const list = bible.seasonality || [];
    onChange({
      ...bible,
      seasonality: [...list, { month: "", event: "", episodeTheme: "" }],
    });
  };

  const updateSeasonalEvent = (index: number, field: keyof SeasonalEvent, value: string) => {
    const list = [...(bible.seasonality || [])];
    list[index] = {
      ...list[index],
      [field]: value,
    };
    onChange({
      ...bible,
      seasonality: list,
    });
  };

  const removeSeasonalEvent = (index: number) => {
    const list = (bible.seasonality || []).filter((_, i) => i !== index);
    onChange({
      ...bible,
      seasonality: list,
    });
  };

  const seasonality = bible.seasonality || [];

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
          Lịch sự kiện và kịch bản theo mùa (Production Seasonality)
        </span>
        <button
          onClick={addSeasonalEvent}
          className="bg-purple-950/40 hover:bg-purple-600 border border-purple-500/20 text-purple-400 hover:text-white px-2.5 py-1 rounded-lg text-[8px] font-black uppercase transition cursor-pointer"
        >
          + Thêm Sự Kiện
        </button>
      </div>

      <div className="space-y-3">
        {seasonality.length === 0 ? (
          <div className="text-center text-xs text-neutral-600 py-10 border border-dashed border-white/5 rounded-2xl">
            Chưa thiết lập sự kiện mùa vụ nào.
          </div>
        ) : (
          seasonality.map((event, idx) => (
            <div key={idx} className="bg-black/30 border border-white/5 rounded-2xl p-4 relative group/season flex gap-4 items-start">
              <button
                onClick={() => removeSeasonalEvent(idx)}
                className="absolute top-2 right-2 p-1 text-neutral-600 hover:text-red-400 opacity-0 group-hover/season:opacity-100 transition cursor-pointer"
                title="Xóa sự kiện"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <div className="w-28 space-y-1">
                <label className="text-[7.5px] font-black text-neutral-500 uppercase tracking-widest block">Tháng / Mùa vụ</label>
                <input
                  type="text"
                  value={event.month}
                  onChange={(e) => updateSeasonalEvent(idx, "month", e.target.value)}
                  placeholder="Ví dụ: Tháng 9..."
                  className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1 text-xs font-bold text-neutral-200"
                />
              </div>

              <div className="w-48 space-y-1">
                <label className="text-[7.5px] font-black text-neutral-500 uppercase tracking-widest block">Sự kiện văn hóa</label>
                <input
                  type="text"
                  value={event.event}
                  onChange={(e) => updateSeasonalEvent(idx, "event", e.target.value)}
                  placeholder="Khai giảng, Trung Thu..."
                  className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-neutral-300"
                />
              </div>

              <div className="flex-1 space-y-1">
                <label className="text-[7.5px] font-black text-neutral-500 uppercase tracking-widest block">Tên tập phim / Ý tưởng kịch bản</label>
                <input
                  type="text"
                  value={event.episodeTheme}
                  onChange={(e) => updateSeasonalEvent(idx, "episodeTheme", e.target.value)}
                  placeholder="Tên tập phim và diễn biến chủ đạo..."
                  className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-neutral-300"
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
