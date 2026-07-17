"use client";

import { Suspense } from "react";
import WorldBibleMatrix from "@/features/world-bible";

export default function WorldBiblePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#07070a] text-neutral-50 flex items-center justify-center font-sans text-xs italic text-neutral-500">
        Đang tải cấu trúc thế giới...
      </div>
    }>
      <WorldBibleMatrix />
    </Suspense>
  );
}
