"use client";

import React, { useEffect, use } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UniversalAssetBuilder({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      router.replace(`/tools/xray?id=${id}&type=character`);
    }
  }, [id, router]);

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden">
      {/* Background neon glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="text-center space-y-6 relative z-10 p-8 max-w-md bg-neutral-950/60 border border-white/5 rounded-3xl backdrop-blur-xl shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(239,68,68,0.1)]">
          <Loader2 className="w-7 h-7 animate-spin text-red-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-neutral-200">Universal Studio</h3>
          <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider leading-relaxed">
            Đang chuyển hướng sang Universal Builder X-Ray v3.5...
          </p>
        </div>
        <div className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest bg-black/40 border border-white/5 py-1.5 px-3 rounded-xl inline-block">
          Asset ID: {id}
        </div>
      </div>
    </div>
  );
}
