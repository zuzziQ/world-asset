"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Save, Trash2, Network, Tag as TagIcon } from "lucide-react";
import Link from "next/link";

const getApiBaseUrl = () => {
  const rawUrl = process.env.NEXT_PUBLIC_CORE_API_URL || 'https://dev-hub.storymee.com';
  return rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
};
const API_BASE_URL = getApiBaseUrl();

interface SemanticRule {
  id: string;
  tagId: string;
  category: string;
  fallbacks: string[];
}

export default function SemanticDictionaryPage() {
  const [rules, setRules] = useState<SemanticRule[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newTagId, setNewTagId] = useState("");
  const [newCategory, setNewCategory] = useState("emotion");
  const [newFallbacks, setNewFallbacks] = useState("");

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/internal/v1/asset/world/orchestrator/semantics`);
      const data = await res.json();
      setRules(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    const fallbacksArray = newFallbacks.split(",").map(s => s.trim()).filter(Boolean);
    if (!newTagId || fallbacksArray.length === 0) return alert("Vui lòng điền đủ Tag ID và danh sách Fallback!");

    try {
      const res = await fetch(`${API_BASE_URL}/internal/v1/asset/world/orchestrator/semantics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tagId: newTagId,
          category: newCategory,
          fallbacks: fallbacksArray
        })
      });
      if (res.ok) {
        setNewTagId("");
        setNewFallbacks("");
        fetchRules();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa rule này?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/internal/v1/asset/world/orchestrator/semantics/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) fetchRules();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-50 p-8 font-sans">
      {/* Header */}
      <header className="mb-8 flex items-center justify-between border-b border-neutral-900 pb-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-emerald-500 bg-clip-text text-transparent flex items-center gap-3">
            <Network className="text-teal-400" /> Semantic Dictionary Hub
          </h1>
          <p className="text-neutral-400 mt-2">Quản trị Tầng 3 Fallback - Dạy AI cách tái sử dụng ảnh họ hàng</p>
        </div>
        <Link href="/orchestrator" className="px-4 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-medium transition flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Về Fallback Trace Monitor
        </Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Thêm Mới */}
        <div className="col-span-1 border border-neutral-900 rounded-xl p-6 bg-neutral-900/30 h-fit">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-teal-400">
            <Plus className="w-5 h-5" /> Thêm Luật Nối Mới
          </h2>
          
          <form onSubmit={handleSaveRule} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">Tag Gốc (Miss Tag)</label>
              <input 
                type="text" 
                value={newTagId}
                onChange={e => setNewTagId(e.target.value)}
                placeholder="VD: emo_smi"
                className="w-full bg-black border border-neutral-800 rounded-lg px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">Category</label>
              <select 
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                className="w-full bg-black border border-neutral-800 rounded-lg px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition"
              >
                <optgroup label="Character (Nhân vật)">
                  <option value="emotion">Emotion (Cảm xúc)</option>
                  <option value="action">Action (Hành động)</option>
                  <option value="camera">Camera (Góc quay)</option>
                  <option value="environment">Environment (Môi trường)</option>
                </optgroup>
                <optgroup label="Location (Bối cảnh)">
                  <option value="time">Time (Thời gian)</option>
                  <option value="weather">Weather (Thời tiết)</option>
                  <option value="atmosphere">Atmosphere (Khí quyển)</option>
                </optgroup>
                <optgroup label="Prop (Đạo cụ)">
                  <option value="condition">Condition (Trạng thái)</option>
                  <option value="material">Material (Chất liệu)</option>
                  <option value="perspective">Perspective (Góc nhìn)</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">Fallback Tags (Cách nhau dấu phẩy)</label>
              <input 
                type="text" 
                value={newFallbacks}
                onChange={e => setNewFallbacks(e.target.value)}
                placeholder="VD: emo_hap, emo_lau"
                className="w-full bg-black border border-neutral-800 rounded-lg px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition"
              />
            </div>

            <button type="submit" className="mt-2 w-full py-2.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold transition flex justify-center items-center gap-2">
              <Save className="w-4 h-4" /> Lưu Luật
            </button>
          </form>
        </div>

        {/* Danh sách Luật (Tree View) */}
        <div className="col-span-1 lg:col-span-2 border border-neutral-900 rounded-xl p-6 bg-neutral-900/30">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-neutral-100">
            <TagIcon className="w-5 h-5 text-purple-400" /> Cây Phả Hệ Fallback
          </h2>

          {loading ? (
            <div className="text-neutral-500 animate-pulse">Đang tải từ điển...</div>
          ) : rules.length === 0 ? (
            <div className="text-neutral-500 italic p-4 border border-dashed border-neutral-800 rounded-lg text-center">
              Chưa có luật nối nào. Hãy thêm luật đầu tiên ở cột bên trái.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {rules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between p-4 rounded-lg bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 transition group">
                  <div className="flex items-center gap-6">
                    {/* Source Tag */}
                    <div className="flex flex-col">
                      <span className="text-xs text-neutral-500 uppercase tracking-wider mb-1">{rule.category}</span>
                      <span className="text-lg font-bold text-teal-300 font-mono bg-teal-900/20 px-3 py-1 rounded-md border border-teal-900/50">
                        {rule.tagId}
                      </span>
                    </div>

                    {/* Arrow */}
                    <div className="text-neutral-600 animate-pulse">
                      ━━━━▶
                    </div>

                    {/* Fallback Targets */}
                    <div className="flex flex-wrap gap-2">
                      {rule.fallbacks.map((fb, idx) => (
                        <span key={idx} className="text-sm font-medium text-purple-300 font-mono bg-purple-900/20 px-3 py-1.5 rounded-md border border-purple-900/50">
                          {fb}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <button 
                    onClick={() => handleDelete(rule.id)}
                    className="p-2 rounded-md bg-red-950/30 text-red-400 hover:bg-red-900/50 hover:text-red-300 transition opacity-0 group-hover:opacity-100"
                    title="Xóa luật này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
