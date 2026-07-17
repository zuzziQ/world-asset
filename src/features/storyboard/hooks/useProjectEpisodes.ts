"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  fetchProjects, 
  fetchEpisodes, 
  createEpisode, 
  updateEpisode, 
  deleteEpisode, 
  fetchScenes 
} from "@/lib/api";
import { useProjectStore } from "@/lib/projectStore";

export function useProjectEpisodes() {
  const {
    projectsList,
    selectedProjectId,
    selectProject,
    setProjectsList: storeSetProjectsList,
  } = useProjectStore();

  const setSelectedProjectId = (id: string) => {
    selectProject(id);
  };

  const setProjectsList = (val: any) => {
    if (typeof val === "function") {
      const next = val(useProjectStore.getState().projectsList);
      storeSetProjectsList(next);
    } else {
      storeSetProjectsList(val);
    }
  };

  const [episodesList, setEpisodesList] = useState<any[]>([]);
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string>("");
  const [scriptText, setScriptText] = useState("");
  const [scenesList, setScenesList] = useState<any[]>([]);

  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);
  const [isSavingScript, setIsSavingScript] = useState(false);
  const [isLoadingScenes, setIsLoadingScenes] = useState(false);

  const selectedEpisode = useMemo(() => {
    return episodesList.find(e => e.id === selectedEpisodeId) || null;
  }, [episodesList, selectedEpisodeId]);

  const activeProject = useMemo(() => {
    return projectsList.find(p => p.id === selectedProjectId) || null;
  }, [projectsList, selectedProjectId]);

  const loadScenesList = async (epId: string) => {
    setIsLoadingScenes(true);
    try {
      const data = await fetchScenes(epId);
      setScenesList(data || []);
    } catch (e) {
      console.error("Error loading scenes:", e);
    } finally {
      setIsLoadingScenes(false);
    }
  };

  const handleSelectEpisode = async (epId: string, customList?: any[]) => {
    setSelectedEpisodeId(epId);
    const list = customList || episodesList;
    const ep = list.find((e: any) => e.id === epId);
    if (ep) {
      setScriptText(ep.script || "");
      loadScenesList(epId);
    }
  };

  const loadEpisodesList = async (projId: string, targetEpId?: string) => {
    setIsLoadingEpisodes(true);
    try {
      const data = await fetchEpisodes(projId);
      setEpisodesList(data || []);
      if (data && data.length > 0) {
        const epToSelect = targetEpId || data[0].id;
        await handleSelectEpisode(epToSelect, data);
      } else {
        setSelectedEpisodeId("");
        setScriptText("");
        setScenesList([]);
      }
    } catch (e) {
      console.error("Error loading episodes:", e);
    } finally {
      setIsLoadingEpisodes(false);
    }
  };

  const handleSaveScript = async () => {
    if (!selectedEpisodeId) return;
    setIsSavingScript(true);
    try {
      const updated = await updateEpisode({ id: selectedEpisodeId, script: scriptText });
      setEpisodesList(prev => prev.map(ep => ep.id === selectedEpisodeId ? updated : ep));
      return true;
    } catch (e) {
      console.error("Error saving script:", e);
      throw e;
    } finally {
      setIsSavingScript(false);
    }
  };

  const handleCreateEpisodeQuick = async (title: string, type: string) => {
    if (!selectedProjectId) return;
    try {
      const newEp = await createEpisode({
        projectId: selectedProjectId,
        universeId: selectedProjectId,
        title,
        episodeType: type,
        script: ""
      });
      setEpisodesList(prev => [...prev, newEp]);
      await handleSelectEpisode(newEp.id, [...episodesList, newEp]);
      return newEp;
    } catch (e) {
      console.error("Error creating episode:", e);
      throw e;
    }
  };

  const handleDeleteEpisode = async (id: string) => {
    try {
      await deleteEpisode(id);
      const remaining = episodesList.filter(ep => ep.id !== id);
      setEpisodesList(remaining);
      if (selectedEpisodeId === id) {
        if (remaining.length > 0) {
          await handleSelectEpisode(remaining[0].id, remaining);
        } else {
          setSelectedEpisodeId("");
          setScenesList([]);
        }
      }
    } catch (e) {
      console.error("Error deleting episode:", e);
      throw e;
    }
  };

  const loadProjectsList = async () => {
    setIsLoadingProjects(true);
    try {
      await useProjectStore.getState().loadProjects();
      const state = useProjectStore.getState();
      const data = state.projectsList;
      if (data && data.length > 0) {
        const query = new URLSearchParams(window.location.search);
        const qProjId = query.get("projectId");
        const nextId = qProjId || state.selectedProjectId || data[0].id;
        await selectProject(nextId);
        return { projects: data, activeId: nextId };
      }
      return { projects: [], activeId: "" };
    } catch (e) {
      console.error("Error loading projects:", e);
      return { projects: [], activeId: "" };
    } finally {
      setIsLoadingProjects(false);
    }
  };

  return {
    projectsList,
    setProjectsList,
    selectedProjectId,
    setSelectedProjectId,
    episodesList,
    setEpisodesList,
    selectedEpisodeId,
    setSelectedEpisodeId,
    scriptText,
    setScriptText,
    scenesList,
    setScenesList,
    isLoadingProjects,
    isLoadingEpisodes,
    isSavingScript,
    isLoadingScenes,
    selectedEpisode,
    activeProject,
    loadScenesList,
    handleSelectEpisode,
    loadEpisodesList,
    handleSaveScript,
    handleCreateEpisodeQuick,
    handleDeleteEpisode,
    loadProjectsList
  };
}
