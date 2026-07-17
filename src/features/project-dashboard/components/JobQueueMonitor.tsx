"use client";

import React, { useState, useEffect } from "react";
import { Activity, Loader2, RefreshCw, Trash2, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { fetchJobs, clearAllJobs } from "@/lib/api";

export default function JobQueueMonitor() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadJobs = async () => {
    setLoading(true);
    try {
      console.log("[JobQueueMonitor] Calling fetchJobs(10) with 30s timeout...");
      const data = await fetchJobs(10);
      setJobs(data);
    } catch (e) {
      console.error("Failed to load jobs in monitor:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
    const timer = setInterval(loadJobs, 12000);
    return () => clearInterval(timer);
  }, []);

  const totalCount = jobs.length;
  const doneCount = jobs.filter(j => j.status === "done").length;
  const failedCount = jobs.filter(j => j.status === "failed").length;
  const runningCount = jobs.filter(j => j.status === "queued" || j.status === "processing").length;

  return (
    <div className="border border-white/5 rounded-3xl p-5 bg-white/[0.01] backdrop-blur-md space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <h2 className="text-xs font-black flex items-center gap-2 text-neutral-300 uppercase tracking-widest">
          <Activity className="w-4 h-4 text-purple-400 animate-pulse" /> Giám sát Jobs (BullMQ)
        </h2>
        <button 
          onClick={loadJobs}
          disabled={loading}
          className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-black/40 border border-white/5 p-2 rounded-xl">
          <div className="text-[9px] text-neutral-500 font-bold uppercase">Tổng</div>
          <div className="text-sm font-black text-white">{totalCount}</div>
        </div>
        <div className="bg-black/40 border border-white/5 p-2 rounded-xl">
          <div className="text-[9px] text-blue-400 font-bold uppercase flex items-center justify-center gap-0.5"><Clock className="w-2.5 h-2.5" /> Chạy</div>
          <div className="text-sm font-black text-blue-400">{runningCount}</div>
        </div>
        <div className="bg-black/40 border border-white/5 p-2 rounded-xl">
          <div className="text-[9px] text-green-400 font-bold uppercase flex items-center justify-center gap-0.5"><CheckCircle className="w-2.5 h-2.5" /> Xong</div>
          <div className="text-sm font-black text-green-400">{doneCount}</div>
        </div>
        <div className="bg-black/40 border border-white/5 p-2 rounded-xl">
          <div className="text-[9px] text-red-400 font-bold uppercase flex items-center justify-center gap-0.5"><AlertCircle className="w-2.5 h-2.5" /> Lỗi</div>
          <div className="text-sm font-black text-red-400">{failedCount}</div>
        </div>
      </div>

      {jobs.length > 0 ? (
        <div className="space-y-1.5 max-h-[120px] overflow-y-auto custom-scrollbar">
          {jobs.slice(0, 5).map((job) => (
            <div key={job.id} className="flex items-center justify-between text-[10px] p-2 bg-black/20 border border-white/5 rounded-lg">
              <span className="font-mono text-neutral-400 truncate max-w-[120px]" title={job.id}>ID: {job.id.substring(0, 8)}</span>
              <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                job.status === "done" ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                job.status === "failed" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                "bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse"
              }`}>
                {job.status}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-[10px] text-neutral-600 italic">
          Không có jobs nào gần đây.
        </div>
      )}
    </div>
  );
}
