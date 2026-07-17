import React from "react";
import { Trash2 } from "lucide-react";
import { WorldBible, CulturalZoneDetail, SpatialRelation, CharacterRelationship } from "../schema";

interface SettingTabProps {
  bible: WorldBible;
  onChange: (updatedBible: WorldBible) => void;
}

export default function SettingTab({ bible, onChange }: SettingTabProps) {
  const updateMainSetting = (mainSetting: string) => {
    onChange({
      ...bible,
      settings: {
        ...bible.settings,
        mainSetting,
      },
    });
  };

  const addCulturalDetail = () => {
    const details = bible.settings.culturalDetails || [];
    onChange({
      ...bible,
      settings: {
        ...bible.settings,
        culturalDetails: [...details, { zone: "", detail: "" }],
      },
    });
  };

  const updateCulturalDetail = (index: number, field: keyof CulturalZoneDetail, value: string) => {
    const list = [...(bible.settings.culturalDetails || [])];
    list[index] = {
      ...list[index],
      [field]: value,
    };
    onChange({
      ...bible,
      settings: {
        ...bible.settings,
        culturalDetails: list,
      },
    });
  };

  const removeCulturalDetail = (index: number) => {
    const list = (bible.settings.culturalDetails || []).filter((_, i) => i !== index);
    onChange({
      ...bible,
      settings: {
        ...bible.settings,
        culturalDetails: list,
      },
    });
  };

  const addSpatialRelation = () => {
    const relations = bible.settings.spatialRelations || [];
    onChange({
      ...bible,
      settings: {
        ...bible.settings,
        spatialRelations: [...relations, { from: "", to: "", relation: "connected to", sharedDNA: "" }],
      },
    });
  };

  const updateSpatialRelation = (index: number, field: keyof SpatialRelation, value: string) => {
    const list = [...(bible.settings.spatialRelations || [])];
    list[index] = {
      ...list[index],
      [field]: value,
    };
    onChange({
      ...bible,
      settings: {
        ...bible.settings,
        spatialRelations: list,
      },
    });
  };

  const removeSpatialRelation = (index: number) => {
    const list = (bible.settings.spatialRelations || []).filter((_, i) => i !== index);
    onChange({
      ...bible,
      settings: {
        ...bible.settings,
        spatialRelations: list,
      },
    });
  };

  const addCharacterRelationship = () => {
    const relations = bible.settings.characterRelationships || [];
    onChange({
      ...bible,
      settings: {
        ...bible.settings,
        characterRelationships: [...relations, { from: "", to: "", relation: "Bạn bè", description: "" }],
      },
    });
  };

  const updateCharacterRelationship = (index: number, field: keyof CharacterRelationship, value: string) => {
    const list = [...(bible.settings.characterRelationships || [])];
    list[index] = {
      ...list[index],
      [field]: value,
    };
    onChange({
      ...bible,
      settings: {
        ...bible.settings,
        characterRelationships: list,
      },
    });
  };

  const removeCharacterRelationship = (index: number) => {
    const list = (bible.settings.characterRelationships || []).filter((_, i) => i !== index);
    onChange({
      ...bible,
      settings: {
        ...bible.settings,
        characterRelationships: list,
      },
    });
  };

  const culturalDetails = bible.settings.culturalDetails || [];
  const spatialRelations = bible.settings.spatialRelations || [];
  const characterRelationships = bible.settings.characterRelationships || [];

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="space-y-1.5 bg-black/20 border border-white/5 p-4 rounded-2xl">
        <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 block">
          Bối cảnh cốt lõi của thế giới (Main Setting)
        </label>
        <input
          type="text"
          value={bible.settings.mainSetting}
          onChange={(e) => updateMainSetting(e.target.value)}
          placeholder="Ví dụ: Chung cư Hà Nội tầng cao..."
          className="w-full bg-black/60 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-neutral-200 outline-none focus:border-purple-500/30 transition font-bold"
        />
      </div>

      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
          Chi tiết đời thường tạo bản sắc (Cultural Zone Details)
        </span>
        <button
          onClick={addCulturalDetail}
          className="bg-purple-950/40 hover:bg-purple-600 border border-purple-500/20 text-purple-400 hover:text-white px-2.5 py-1 rounded-lg text-[8px] font-black uppercase transition cursor-pointer"
        >
          + Thêm Chi Tiết
        </button>
      </div>

      <div className="space-y-3">
        {culturalDetails.length === 0 ? (
          <div className="text-center text-xs text-neutral-600 py-10 border border-dashed border-white/5 rounded-2xl">
            Chưa thiết lập chi tiết bản sắc văn hóa nào.
          </div>
        ) : (
          culturalDetails.map((item, idx) => (
            <div key={idx} className="bg-black/30 border border-white/5 rounded-2xl p-4 relative group/detail flex gap-4 items-start">
              <button
                onClick={() => removeCulturalDetail(idx)}
                className="absolute top-2 right-2 p-1 text-neutral-600 hover:text-red-400 opacity-0 group-hover/detail:opacity-100 transition cursor-pointer"
                title="Xóa chi tiết"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <div className="w-40 space-y-1">
                <label className="text-[7.5px] font-black text-neutral-500 uppercase tracking-widest block">Phân khu / Địa điểm</label>
                <input
                  type="text"
                  value={item.zone}
                  onChange={(e) => updateCulturalDetail(idx, "zone", e.target.value)}
                  placeholder="Ví dụ: Trong nhà..."
                  className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1 text-xs font-bold text-neutral-200"
                />
              </div>

              <div className="flex-1 space-y-1">
                <label className="text-[7.5px] font-black text-neutral-500 uppercase tracking-widest block">Chi tiết đời thường Việt Nam đặc trưng</label>
                <input
                  type="text"
                  value={item.detail}
                  onChange={(e) => updateCulturalDetail(idx, "detail", e.target.value)}
                  placeholder="Nồi cơm điện, phơi quần áo, ban công..."
                  className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-neutral-300"
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Spatial Relations & DNA Connection */}
      <div className="space-y-3 border-t border-white/5 pt-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
            Bối cảnh liền kề & Mối quan hệ không gian (Connected Locations & Spatial Relations)
          </span>
          <button
            type="button"
            onClick={addSpatialRelation}
            className="bg-purple-950/40 hover:bg-purple-600 border border-purple-500/20 text-purple-400 hover:text-white px-2.5 py-1 rounded-lg text-[8px] font-black uppercase transition cursor-pointer"
          >
            + Thêm Mối Quan Hệ
          </button>
        </div>

        <div className="space-y-3">
          {spatialRelations.length === 0 ? (
            <div className="text-center text-xs text-neutral-600 py-6 border border-dashed border-white/5 rounded-2xl">
              Chưa có mối quan hệ không gian nào được thiết lập.
            </div>
          ) : (
            spatialRelations.map((item, idx) => (
              <div key={idx} className="bg-black/30 border border-white/5 rounded-2xl p-4 relative group/relation grid grid-cols-4 gap-4 items-start animate-in fade-in duration-200">
                <button
                  type="button"
                  onClick={() => removeSpatialRelation(idx)}
                  className="absolute top-2 right-2 p-1 text-neutral-600 hover:text-red-400 opacity-0 group-hover/relation:opacity-100 transition cursor-pointer"
                  title="Xóa quan hệ"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="space-y-1">
                  <label className="text-[7.5px] font-black text-neutral-500 uppercase tracking-widest block">Bối cảnh nguồn (From)</label>
                  <input
                    type="text"
                    value={item.from}
                    onChange={(e) => updateSpatialRelation(idx, "from", e.target.value)}
                    placeholder="Ví dụ: Phòng bếp..."
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1 text-xs font-bold text-neutral-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[7.5px] font-black text-neutral-500 uppercase tracking-widest block">Bối cảnh đích (To)</label>
                  <input
                    type="text"
                    value={item.to}
                    onChange={(e) => updateSpatialRelation(idx, "to", e.target.value)}
                    placeholder="Ví dụ: Phòng khách..."
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1 text-xs font-bold text-neutral-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[7.5px] font-black text-neutral-500 uppercase tracking-widest block">Mối liên kết (Relation)</label>
                  <input
                    type="text"
                    value={item.relation}
                    onChange={(e) => updateSpatialRelation(idx, "relation", e.target.value)}
                    placeholder="connected to, adjacent to, overlooking..."
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-neutral-300"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[7.5px] font-black text-neutral-500 uppercase tracking-widest block">Điểm chung thiết kế (Shared DNA)</label>
                  <input
                    type="text"
                    value={item.sharedDNA}
                    onChange={(e) => updateSpatialRelation(idx, "sharedDNA", e.target.value)}
                    placeholder="sàn gỗ, ánh sáng ấm..."
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-neutral-300"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Character Relationships */}
      <div className="space-y-3 border-t border-white/5 pt-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
            Mối quan hệ nhân vật (Character Relationships)
          </span>
          <button
            type="button"
            onClick={addCharacterRelationship}
            className="bg-purple-950/40 hover:bg-purple-600 border border-purple-500/20 text-purple-400 hover:text-white px-2.5 py-1 rounded-lg text-[8px] font-black uppercase transition cursor-pointer"
          >
            + Thêm Mối Quan Hệ
          </button>
        </div>

        <div className="space-y-3">
          {characterRelationships.length === 0 ? (
            <div className="text-center text-xs text-neutral-600 py-6 border border-dashed border-white/5 rounded-2xl">
              Chưa có mối quan hệ nhân vật nào được thiết lập.
            </div>
          ) : (
            characterRelationships.map((item, idx) => (
              <div key={idx} className="bg-black/30 border border-white/5 rounded-2xl p-4 relative group/char-relation grid grid-cols-4 gap-4 items-start animate-in fade-in duration-200">
                <button
                  type="button"
                  onClick={() => removeCharacterRelationship(idx)}
                  className="absolute top-2 right-2 p-1 text-neutral-600 hover:text-red-400 opacity-0 group-hover/char-relation:opacity-100 transition cursor-pointer"
                  title="Xóa quan hệ"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="space-y-1">
                  <label className="text-[7.5px] font-black text-neutral-500 uppercase tracking-widest block">Nhân vật nguồn (From)</label>
                  <select
                    value={item.from}
                    onChange={(e) => updateCharacterRelationship(idx, "from", e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-2 py-1 text-xs font-bold text-neutral-200 outline-none cursor-pointer"
                  >
                    <option value="">Chọn...</option>
                    {(bible.peerGroup?.characters || []).map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[7.5px] font-black text-neutral-500 uppercase tracking-widest block">Nhân vật đích (To)</label>
                  <select
                    value={item.to}
                    onChange={(e) => updateCharacterRelationship(idx, "to", e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-2 py-1 text-xs font-bold text-neutral-200 outline-none cursor-pointer"
                  >
                    <option value="">Chọn...</option>
                    {(bible.peerGroup?.characters || []).map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[7.5px] font-black text-neutral-500 uppercase tracking-widest block">Mối quan hệ (Relation)</label>
                  <select
                    value={item.relation}
                    onChange={(e) => updateCharacterRelationship(idx, "relation", e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-2 py-1 text-xs text-neutral-300 outline-none cursor-pointer font-bold"
                  >
                    <option value="Bạn bè">Bạn bè</option>
                    <option value="Đối thủ">Đối thủ</option>
                    <option value="Gia đình">Gia đình</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[7.5px] font-black text-neutral-500 uppercase tracking-widest block">Mô tả chi tiết</label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateCharacterRelationship(idx, "description", e.target.value)}
                    placeholder="Vd: Đồng đội cũ..."
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-neutral-300"
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
