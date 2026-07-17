import React from "react";
import { Trash2 } from "lucide-react";
import { WorldBible, PeerCharacter } from "../schema";

interface PeerTabProps {
  bible: WorldBible;
  onChange: (updatedBible: WorldBible) => void;
}

export default function PeerTab({ bible, onChange }: PeerTabProps) {
  const updateTheme = (theme: string) => {
    onChange({
      ...bible,
      peerGroup: {
        ...bible.peerGroup,
        theme,
      },
    });
  };

  const addCharacter = () => {
    const chars = bible.peerGroup.characters || [];
    onChange({
      ...bible,
      peerGroup: {
        ...bible.peerGroup,
        characters: [
          ...chars,
          { name: "", role: "", attitude: "", flaw: "", signatureProp: "", dynamic: "" },
        ],
      },
    });
  };

  const updateCharacter = (index: number, field: keyof PeerCharacter, value: string) => {
    const list = [...(bible.peerGroup.characters || [])];
    list[index] = {
      ...list[index],
      [field]: value,
    };
    onChange({
      ...bible,
      peerGroup: {
        ...bible.peerGroup,
        characters: list,
      },
    });
  };

  const removeCharacter = (index: number) => {
    const list = (bible.peerGroup.characters || []).filter((_, i) => i !== index);
    onChange({
      ...bible,
      peerGroup: {
        ...bible.peerGroup,
        characters: list,
      },
    });
  };

  const characters = bible.peerGroup.characters || [];

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="space-y-1.5 bg-black/20 border border-white/5 p-4 rounded-2xl">
        <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 block">
          Chủ đề Thái độ chung của Nhóm bạn (Core Peer Theme)
        </label>
        <input
          type="text"
          value={bible.peerGroup.theme}
          onChange={(e) => updateTheme(e.target.value)}
          placeholder="Ví dụ: Thái độ với việc SAI..."
          className="w-full bg-black/60 border border-white/5 rounded-xl px-3.5 py-2 text-xs text-neutral-200 outline-none focus:border-purple-500/30 transition font-bold"
        />
      </div>

      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
          Nhóm nhân vật chính (Peer Characters - {characters.length})
        </span>
        <button
          onClick={addCharacter}
          className="bg-purple-950/40 hover:bg-purple-600 border border-purple-500/20 text-purple-400 hover:text-white px-2.5 py-1 rounded-lg text-[8px] font-black uppercase transition cursor-pointer"
        >
          + Thêm Nhân Vật
        </button>
      </div>

      <div className="space-y-4">
        {characters.length === 0 ? (
          <div className="text-center text-xs text-neutral-600 py-10 border border-dashed border-white/5 rounded-2xl">
            Chưa thiết lập nhân vật nào.
          </div>
        ) : (
          characters.map((char, idx) => (
            <div key={idx} className="bg-black/30 border border-white/5 rounded-2xl p-4 relative group/char space-y-3">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-purple-400"># Nhân vật {idx + 1}</span>
                <button
                  onClick={() => removeCharacter(idx)}
                  className="p-1 text-neutral-600 hover:text-red-400 opacity-0 group-hover/char:opacity-100 transition cursor-pointer"
                  title="Xóa nhân vật"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[7.5px] font-black text-neutral-500 uppercase tracking-widest block">Tên nhân vật</label>
                  <input
                    type="text"
                    value={char.name}
                    onChange={(e) => updateCharacter(idx, "name", e.target.value)}
                    placeholder="Tên..."
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1 text-xs font-bold text-neutral-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[7.5px] font-black text-neutral-500 uppercase tracking-widest block">Vai trò / Tuổi</label>
                  <input
                    type="text"
                    value={char.role}
                    onChange={(e) => updateCharacter(idx, "role", e.target.value)}
                    placeholder="Ví dụ: Đứa trẻ sợ sai (4 tuổi)..."
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-neutral-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[7.5px] font-black text-neutral-500 uppercase tracking-widest block">Thái độ với chủ đề chung</label>
                  <input
                    type="text"
                    value={char.attitude}
                    onChange={(e) => updateCharacter(idx, "attitude", e.target.value)}
                    placeholder="Thái độ phản ứng..."
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-neutral-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[7.5px] font-black text-neutral-500 uppercase tracking-widest block">Điểm yếu (Flaw)</label>
                  <input
                    type="text"
                    value={char.flaw}
                    onChange={(e) => updateCharacter(idx, "flaw", e.target.value)}
                    placeholder="Điểm yếu..."
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-neutral-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[7.5px] font-black text-neutral-500 uppercase tracking-widest block">Đạo cụ đặc trưng (Signature Prop)</label>
                  <input
                    type="text"
                    value={char.signatureProp}
                    onChange={(e) => updateCharacter(idx, "signatureProp", e.target.value)}
                    placeholder="Đồ vật mang theo..."
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-neutral-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[7.5px] font-black text-neutral-500 uppercase tracking-widest block">Mối quan hệ (Dynamic Matrix)</label>
                  <input
                    type="text"
                    value={char.dynamic}
                    onChange={(e) => updateCharacter(idx, "dynamic", e.target.value)}
                    placeholder="Ví dụ: Sợ Tú, thích Cam..."
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-neutral-300"
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
