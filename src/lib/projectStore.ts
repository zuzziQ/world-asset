import { create } from "zustand";
import { fetchProjects, fetchEpisodes, fetchCharacters, fetchAssets } from "./api";

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
      const projs = await fetchProjects();
      set({ projectsList: projs || [] });
      if (projs && projs.length > 0 && !get().selectedProjectId) {
        await get().selectProject(projs[0].id);
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
