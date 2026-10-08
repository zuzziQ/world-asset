"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Activity, X } from "lucide-react";
import { useProjectStore } from "@/lib/projectStore";
import { 
  createProject, updateProject, deleteProject, 
  createEpisode, updateEpisode, deleteEpisode, 
  fetchScenes, createScene, updateScene, deleteScene,
  fetchStoryboardAssets
} from "@/lib/api";

import ProjectList from "@/features/project-dashboard/components/ProjectList";
import CinematicOverview from "@/features/project-dashboard/components/CinematicOverview";
import CharacterProfileStudio from "@/features/project-dashboard/components/CharacterProfileStudio";
import StoryboardTimeline from "@/features/project-dashboard/components/StoryboardTimeline";
import WorldBibleMatrix from "@/features/world-bible/components/WorldBibleMatrix";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("createdAt_desc");
  
  // Read from global project store
  const {
    projectsList,
    loading,
    selectedProjectId,
    selectProject,
    setProjectsList,
    episodes,
    selectedEpisodeId,
    setSelectedEpisodeId,
    dbAssetsList,
    setDbAssetsList,
    loadProjects,
    loadEpisodes
  } = useProjectStore();

  const [epScript, setEpScript] = useState("");
  const [scenes, setScenes] = useState<any[]>([]);
  const [storyboardAssets, setStoryboardAssets] = useState<any[]>([]);
  const [isLoadingStoryboard, setIsLoadingStoryboard] = useState(false);

  // States mới cho dàn Cast & Modals
  const [selectedCharacterName, setSelectedCharacterName] = useState("Mica");
  const [scriptModalEpisode, setScriptModalEpisode] = useState<any | null>(null);
  const [isWorldBibleModalOpen, setIsWorldBibleModalOpen] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Tải storyboard assets khi episode thay đổi
  useEffect(() => {
    if (selectedEpisodeId) {
      setIsLoadingStoryboard(true);
      fetchStoryboardAssets(selectedEpisodeId)
        .then((res) => {
          const assetsList = res && Array.isArray(res) ? res : (res && Array.isArray(res.assets) ? res.assets : []);
          setStoryboardAssets(assetsList);
        })
        .catch((err) => console.error("Failed to fetch storyboard assets on dashboard:", err))
        .finally(() => setIsLoadingStoryboard(false));
    } else {
      setStoryboardAssets([]);
    }
  }, [selectedEpisodeId]);

  // Compute selectedEpisode object based on selectedEpisodeId
  const selectedEpisode = episodes.find((ep) => ep.id === selectedEpisodeId) || null;

  // Tính các chỉ số tiến độ sản xuất thực tế để truyền cho ProjectList
  const totalDnaAssetsCount = useMemo(() => {
    return dbAssetsList.filter(a => a.entityType === "character" || a.entityType === "location").length;
  }, [dbAssetsList]);

  const missingRootImageCount = useMemo(() => {
    return dbAssetsList.filter(a => (a.entityType === "character" || a.entityType === "location") && !a.rootImageUrl).length;
  }, [dbAssetsList]);

  const totalShotsCount = useMemo(() => {
    return storyboardAssets.length;
  }, [storyboardAssets]);

  const generatedShotsCount = useMemo(() => {
    return storyboardAssets.filter(s => s.driveUrl || s.url).length;
  }, [storyboardAssets]);

  const generatedVideosCount = useMemo(() => {
    return storyboardAssets.filter(s => s.videoUrl || s.video_url).length;
  }, [storyboardAssets]);

  // Active project helper
  const activeProject = useMemo(() => {
    return projectsList.find(p => p.id === selectedProjectId) || null;
  }, [projectsList, selectedProjectId]);

  // Parse world bible from activeProject description
  const bible = useMemo(() => {
    if (!activeProject || !activeProject.description) return null;
    try {
      if (activeProject.description.trim().startsWith("{")) {
        const parsed = JSON.parse(activeProject.description);
        return parsed.worldBible || null;
      }
    } catch (e) {
      console.error("Failed to parse world bible in page:", e);
    }
    return null;
  }, [activeProject]);

  // Reset selected character when project changes
  useEffect(() => {
    if (selectedProjectId) {
      setSelectedCharacterName("Mica");
    }
  }, [selectedProjectId]);

  // Sync epScript when modal opens or edits
  useEffect(() => {
    if (scriptModalEpisode) {
      setEpScript(scriptModalEpisode.script || "");
    }
  }, [scriptModalEpisode]);

  // Adapt store state setters to be compatible with react state dispatch type
  const handleSetDbAssetsList = (val: any) => {
    if (typeof val === "function") {
      const nextVal = val(useProjectStore.getState().dbAssetsList);
      setDbAssetsList(nextVal);
    } else {
      setDbAssetsList(val);
    }
  };

  const handleSetProjectsList = (val: any) => {
    if (typeof val === "function") {
      const nextVal = val(useProjectStore.getState().projectsList);
      setProjectsList(nextVal);
    } else {
      setProjectsList(val);
    }
  };

  const loadData = async (selectId?: string) => {
    await loadProjects();
    if (selectId) {
      await selectProject(selectId);
    }
  };

  return (
    <div className="h-screen bg-[#07070a] text-slate-100 p-4 font-sans antialiased selection:bg-purple-655 selection:text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-12 shrink-0 border-b border-white/5 pb-2 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black bg-gradient-to-r from-blue-400 via-purple-500 to-amber-500 bg-clip-text text-transparent uppercase tracking-wider">
            Project Command Center
          </h1>
          <p className="text-neutral-505 text-[9px] font-bold uppercase tracking-wider mt-0.5 flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-cyan-400 animate-pulse" /> Hệ thống chỉ huy kịch bản & tài sản sản xuất
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/jobs" className="bg-neutral-900 border border-white/5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-355 hover:bg-neutral-800 transition">Jobs Manager</Link>
          <Link href="/tools/xray" className="bg-neutral-900 border border-white/5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-355 hover:bg-neutral-800 transition">X-Ray Decoder</Link>
          <Link href={`/tools/storyboard?projectId=${selectedProjectId}`} className="bg-purple-950/40 border border-purple-500/20 text-purple-400 hover:text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition">Storyboard</Link>
          <button 
            onClick={() => {
              if (selectedProjectId) setIsWorldBibleModalOpen(true);
              else alert("Vui lòng chọn dự án trước!");
            }} 
            className="bg-amber-955/40 border border-amber-500/20 text-amber-400 hover:text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition cursor-pointer"
          >
            World Bible Matrix
          </button>
        </div>
      </header>

      {/* Workspace Area */}
      <div className="flex-1 min-h-0 flex gap-4 mt-3 overflow-hidden">
        {/* Left Column: Project Sidebar (Projects & Episodes gộp chung cực gọn) */}
        <div className="w-[22%] shrink-0 flex flex-col overflow-hidden h-full">
          <ProjectList 
            projectsList={projectsList} 
            loading={loading} 
            selectedProjectId={selectedProjectId} 
            setSelectedProjectId={selectProject}
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
            sortBy={sortBy} 
            setSortBy={setSortBy}
            openCreateProjModal={() => {
              const name = prompt("Nhập tên dự án mới:");
              if (name) createProject({ name }).then(() => loadProjects());
            }} 
            handleEditProjClick={(p) => {
              const name = prompt("Sửa tên dự án:", p.name);
              if (name) updateProject(p.id, { name }).then(() => loadData(p.id));
            }} 
            handleDeleteProj={(id, name) => {
              if (confirm(`Xóa dự án "${name}"?`)) deleteProject(id).then(() => loadData());
            }}
            episodes={episodes}
            selectedEpisodeId={selectedEpisodeId}
            setSelectedEpisodeId={(epId) => {
              setSelectedEpisodeId(epId);
            }}
            handleOpenEpModal={(ep) => {
              if (ep) {
                const title = prompt("Sửa tên tập:", ep.title);
                if (title) updateEpisode({ id: ep.id, title }).then(() => loadEpisodes(selectedProjectId));
              } else {
                const title = prompt("Nhập tên tập mới:");
                if (title) createEpisode({ projectId: selectedProjectId, title }).then(() => loadEpisodes(selectedProjectId));
              }
            }} 
            handleDeleteEp={(id, title) => {
              if (confirm(`Xóa tập "${title}"?`)) deleteEpisode(id).then(() => loadEpisodes(selectedProjectId));
            }} 
            onOpenScriptModal={(ep) => setScriptModalEpisode(ep)}
            onOpenWorldBibleModal={() => setIsWorldBibleModalOpen(true)}
            totalDnaAssetsCount={totalDnaAssetsCount}
            missingRootImageCount={missingRootImageCount}
            totalShotsCount={totalShotsCount}
            generatedShotsCount={generatedShotsCount}
            generatedVideosCount={generatedVideosCount}
          />
        </div>

        {/* Right Area: Grid content (Giữa & Phải chiếm trọn 100% chiều cao) */}
        <div className="flex-1 min-h-0 flex gap-4 h-full overflow-hidden">
          {/* Middle Column: Cinematic Overview (Cast list & locations) */}
          <div className="w-[45%] shrink-0 h-full overflow-hidden">
            <CinematicOverview 
              bible={bible}
              projectName={activeProject?.name || "Dự án"}
              dbAssetsList={dbAssetsList}
              selectedCharacterName={selectedCharacterName}
              onSelectCharacter={(name) => setSelectedCharacterName(name)}
              onOpenWorldBibleModal={() => setIsWorldBibleModalOpen(true)}
              selectedEpisode={selectedEpisode}
            />
          </div>

          {/* Right Column: Character Studio (DNA, Appearances, Variants...) */}
          <div className="flex-1 min-h-0 h-full overflow-hidden">
            <CharacterProfileStudio 
              selectedProjectId={selectedProjectId}
              characterName={selectedCharacterName}
              bible={bible}
              dbAssetsList={dbAssetsList}
              setDbAssetsList={handleSetDbAssetsList}
              loadData={loadData}
              onLightboxOpen={(url) => setLightboxUrl(url)}
              episodes={episodes}
              onOpenScriptModal={(ep) => setScriptModalEpisode(ep)}
            />
          </div>
        </div>
      </div>

      {/* Storyboard Filmstrip Timeline 100% width at bottom */}
      <div className="h-[295px] shrink-0 mt-4 bg-[#09090e]/80 border border-white/5 p-4 rounded-3xl backdrop-blur-md shadow-2xl overflow-hidden flex flex-col justify-between">
        <StoryboardTimeline 
          selectedProjectId={selectedProjectId}
          selectedEpisode={selectedEpisode}
          storyboardAssets={storyboardAssets}
          isLoadingStoryboard={isLoadingStoryboard}
          getStoryboardFlowUrl={() => {
            if (process.env.NEXT_PUBLIC_FLOW_ARCHITECT_URL) {
              return process.env.NEXT_PUBLIC_FLOW_ARCHITECT_URL;
            }
            if (typeof window !== "undefined") {
              const { hostname } = window.location;
              if (hostname === "localhost" || hostname === "127.0.0.1") {
                return "http://localhost:5173";
              }
              return "https://storyboard-workflow.vercel.app";
            }
            return "http://localhost:5173";
          }}
        />
      </div>

      {/* MODAL 1: XEM & BIÊN TẬP KỊCH BẢN (SCRIPT MODAL) */}
      {scriptModalEpisode && (
        <div 
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-[9999] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setScriptModalEpisode(null)}
        >
          <div 
            className="bg-[#0b0b10] border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
              <div>
                <h4 className="text-xs font-black uppercase text-purple-400 tracking-wider">Xem & Biên Tập Kịch Bản</h4>
                <p className="text-[10px] text-neutral-300 font-bold uppercase mt-0.5 font-mono">🎬 Tập: {scriptModalEpisode.title}</p>
              </div>
              <button 
                onClick={() => setScriptModalEpisode(null)}
                className="p-1 rounded-lg hover:bg-white/5 text-neutral-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <textarea
              value={epScript}
              onChange={(e) => setEpScript(e.target.value)}
              placeholder="Dán hoặc soạn kịch bản tập phim tại đây..."
              className="w-full bg-black/60 border border-white/5 rounded-xl p-4 text-xs text-neutral-350 font-mono h-[350px] outline-none focus:border-purple-500/30 transition custom-scrollbar font-medium leading-relaxed"
            />
            
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(epScript);
                  alert("Đã copy kịch bản!");
                }}
                className="px-4 py-2 border border-white/10 hover:bg-white/5 text-neutral-400 hover:text-white rounded-xl text-[10px] font-black uppercase transition cursor-pointer"
              >
                Copy kịch bản
              </button>
              <button
                onClick={() => {
                  updateEpisode({ id: scriptModalEpisode.id, script: epScript }).then(() => {
                    loadEpisodes(selectedProjectId);
                    alert("Đã lưu kịch bản thành công!");
                    setScriptModalEpisode(null);
                  });
                }}
                className="px-4 py-2 bg-purple-650 hover:bg-purple-500 text-white rounded-xl text-[10px] font-black uppercase transition cursor-pointer"
              >
                Lưu kịch bản
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: WORLD BIBLE MATRIX FULL SCREEN MODAL */}
      {isWorldBibleModalOpen && selectedProjectId && (
        <div className="fixed inset-0 bg-[#07070a] z-[9998] overflow-y-auto animate-in fade-in duration-200 flex flex-col">
          <div className="h-14 border-b border-white/5 px-6 flex items-center justify-between shrink-0 bg-[#07070a]/95 backdrop-blur-md sticky top-0 z-50">
            <div className="flex items-center gap-2">
              <span className="text-[9px] bg-purple-500/10 border border-purple-500/20 text-purple-400 font-mono px-2 py-0.5 rounded uppercase tracking-wider">
                World Studio Mode
              </span>
              <h2 className="text-sm font-black text-white uppercase tracking-wide">
                World Bible Matrix: {activeProject?.name}
              </h2>
            </div>
            <button 
              onClick={() => {
                setIsWorldBibleModalOpen(false);
                loadProjects();
              }} 
              className="px-4 py-1.5 bg-neutral-900 border border-white/10 hover:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-wider text-neutral-450 hover:text-white transition cursor-pointer"
            >
              Đóng & Quay lại Dashboard
            </button>
          </div>
          <div className="flex-1 p-6 overflow-y-auto">
            <WorldBibleMatrix projectId={selectedProjectId} hideHeader={true} />
          </div>
        </div>
      )}

      {/* MODAL 3: LIGHTBOX MODAL */}
      {lightboxUrl && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxUrl(null)}
        >
          <button 
            className="absolute top-6 right-6 p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition cursor-pointer"
            onClick={() => setLightboxUrl(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl border border-white/10 shadow-2xl relative">
            <img src={lightboxUrl} className="w-full h-full object-contain" alt="Phóng to" />
          </div>
        </div>
      )}
    </div>
  );
}
