"use client";

import React, { Suspense } from "react";
import StoryboardWorkspace from "@/features/storyboard";

export default function DramaStudioPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-screen items-center justify-center bg-[#0d0e12] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          <p className="text-sm text-gray-400">Loading Storyboard Workspace...</p>
        </div>
      </div>
    }>
      <StoryboardWorkspace />
    </Suspense>
  );
}