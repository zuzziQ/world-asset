import { create } from "zustand";
import { fetchProjects, fetchEpisodes, fetchCharacters, fetchAssets } from "./api";

export const SHOWCASE_PROJECT_IDS = [
  "33333333-3333-3333-3333-333333333333", // Thám tử Kilo
  "22222222-2222-2222-2222-222222222222", // Paco The parrot
  "11111111-1111-1111-1111-111111111111"  // Mèo Mía
];

interface ProjectStore {
  projectsList: any[];
  selectedProjectId: string;
  dbAssetsList: any[];
  assetsList: any[];
  episodes: any[];
  selectedEpisodeId: string;
  loading: boolean;
  
  setProjectsList: (projs: any[]) => void;
  setSelectedProjectId: (id: string) => void;
  setDbAssetsList: (assets: any[]) => void;
  setAssetsList: (assets: any[]) => void;
  setEpisodes: (eps: any[]) => void;
  setSelectedEpisodeId: (id: string) => void;
  setLoading: (loading: boolean) => void;

  // Actions
  loadProjects: () => Promise<void>;
  selectProject: (projectId: string) => Promise<void>;
  loadEpisodes: (projectId: string) => Promise<void>;
  loadCharacters: (projectId: string) => Promise<void>;
  loadAssets: (projectId: string) => Promise<void>;
  fillDemoData: (targetProjectId?: string) => Promise<void>;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projectsList: [],
  selectedProjectId: "",
  dbAssetsList: [],
  assetsList: [],
  episodes: [],
  selectedEpisodeId: "",
  loading: false,

  setProjectsList: (projectsList) => set({ projectsList }),
  setSelectedProjectId: (selectedProjectId) => set({ selectedProjectId }),
  setDbAssetsList: (dbAssetsList) => set({ dbAssetsList }),
  setAssetsList: (assetsList) => set({ assetsList }),
  setEpisodes: (episodes) => set({ episodes }),
  setSelectedEpisodeId: (selectedEpisodeId) => set({ selectedEpisodeId }),
  setLoading: (loading) => set({ loading }),

  loadProjects: async () => {
    set({ loading: true });
    try {
      const rawProjs = await fetchProjects();
      const list = Array.isArray(rawProjs) ? rawProjs : [];
      
      const showcaseProjects: any[] = [];
      const userProjects: any[] = [];
      let defaultWorkspaceAdded = false;

      for (const p of list) {
        const isShowcase = SHOWCASE_PROJECT_IDS.includes(p.id) ||
          p.name === "Thám tử Kilo" ||
          p.name === "Paco The parrot" ||
          p.name === "Mèo Mía";

        if (isShowcase) {
          showcaseProjects.push({
            ...p,
            name: p.name.startsWith("⭐") ? p.name : `⭐ ${p.name}`
          });
        } else if (p.name?.toLowerCase().includes("khong gian cua toi") || p.name?.toLowerCase().includes("không gian của tôi")) {
          if (!defaultWorkspaceAdded) {
            userProjects.push({
              ...p,
              name: "📁 Không gian của tôi (Workspace Cá Nhân)"
            });
            defaultWorkspaceAdded = true;
          }
        } else {
          userProjects.push(p);
        }
      }

      // Sort showcase projects so Thám tử Kilo is first, then Paco, then Mèo Mía
      showcaseProjects.sort((a, b) => {
        const order = [
          "33333333-3333-3333-3333-333333333333",
          "22222222-2222-2222-2222-222222222222",
          "11111111-1111-1111-1111-111111111111"
        ];
        const idxA = order.indexOf(a.id);
        const idxB = order.indexOf(b.id);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.name.localeCompare(b.name);
      });

      const processedProjects = [...showcaseProjects, ...userProjects];
      set({ projectsList: processedProjects });

      // Default to Thám tử Kilo or first showcase project if not yet selected or currently empty
      const currentSelected = get().selectedProjectId;
      const isCurrentShowcase = showcaseProjects.some(sp => sp.id === currentSelected);

      if (!currentSelected || !isCurrentShowcase) {
        const defaultId = showcaseProjects[0]?.id || processedProjects[0]?.id;
        if (defaultId) {
          await get().selectProject(defaultId);
        }
      }
    } catch (e) {
      console.error("[ProjectStore] Failed to load projects:", e);
    } finally {
      set({ loading: false });
    }
  },

  selectProject: async (projectId: string) => {
    set({ selectedProjectId: projectId });
    // Load episodes, characters, and assets concurrently
    try {
      await Promise.all([
        get().loadEpisodes(projectId),
        get().loadCharacters(projectId),
        get().loadAssets(projectId)
      ]);
    } catch (e) {
      console.error("[ProjectStore] Failed to load project assets:", e);
    }
  },

  fillDemoData: async (targetProjectId?: string) => {
    const targetId = targetProjectId || "33333333-3333-3333-3333-333333333333";
    await get().selectProject(targetId);
  },

  loadEpisodes: async (projectId: string) => {
    try {
      const eps = await fetchEpisodes(projectId);
      set({ episodes: eps || [] });
      if (eps && eps.length > 0) {
        set({ selectedEpisodeId: eps[0].id });
      } else {
        set({ selectedEpisodeId: "" });
      }
    } catch (e) {
      console.error("[ProjectStore] Failed to load episodes:", e);
    }
  },

  loadCharacters: async (projectId: string) => {
    try {
      const assets = await fetchCharacters(projectId);
      set({ dbAssetsList: assets || [] });
    } catch (e) {
      console.error("[ProjectStore] Failed to load characters:", e);
    }
  },

  loadAssets: async (projectId: string) => {
    try {
      const assets = await fetchAssets({ projectId });
      set({ assetsList: Array.isArray(assets) ? assets : (assets?.data || []) });
    } catch (e) {
      console.error("[ProjectStore] Failed to load assets:", e);
    }
  }
}));
