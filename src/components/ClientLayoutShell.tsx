"use client";

import React, { useEffect } from "react";
import { useProjectStore } from "@/lib/projectStore";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import FloatingCopilotChat from "@/features/world-bible/components/FloatingCopilotChat";

export default function ClientLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  // Load global projects list when layout mounts
  useEffect(() => {
    useProjectStore.getState().loadProjects();
  }, []);

  return (
    <div className="flex min-h-screen w-full bg-black text-white font-sans overflow-hidden relative">
      {/* Left Column: Sidebar (260px width, sticky h-screen) */}
      <Sidebar />

      {/* Right Column: Topbar + Main scrollable container */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <Topbar />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#060608]">
          {children}
        </main>
      </div>

      {/* Global Floating Chat Widget */}
      <FloatingCopilotChat />
    </div>
  );
}
