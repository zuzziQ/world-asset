"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Trash2, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Loader2, 
  Search, 
  Sparkles,
  Filter,
  Copy,
  Check,
  Cpu,
  Layers,
  Database
} from "lucide-react";
import Link from "next/link";
import { fetchJobs, deleteJob, clearAllJobs } from "@/lib/api";

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [providerFilter, setProviderFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchJobs(150);
      setJobs(data);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Không thể tải danh sách Jobs. Hãy chắc chắn Core API đang hoạt động.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
    const interval = setInterval(loadJobs, 10000); // Tự động làm mới mỗi 10 giây
    return () => clearInterval(interval);
  }, []);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteJob = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bản ghi Job này?")) return;
    setActionLoading(id);
    try {
      await deleteJob(id);
      setJobs(prev => prev.filter(j => j.id !== id));
    } catch (e: any) {
      alert("Lỗi khi xóa job: " + e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleClearAll = async () => {
    if (!confirm("CẢNH BÁO: Hành động này sẽ xóa TOÀN BỘ lịch sử Job trong database. Bạn vẫn muốn tiếp tục?")) return;
    setLoading(true);
    try {
      await clearAllJobs();
      setJobs([]);
    } catch (e: any) {
      alert("Lỗi khi dọn dẹp lịch sử: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  // Lọc danh sách job
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.ipId && job.ipId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (job.errorMessage && job.errorMessage.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (job.inputParams && JSON.stringify(job.inputParams).toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    const matchesType = typeFilter === "all" || job.jobType === typeFilter;
    
    // Resolve provider from inputParams
    const jobProvider = job.inputParams?.provider || (job.inputParams?.model_id ? 'hub' : undefined);
    const matchesProvider = providerFilter === "all" || String(jobProvider).toLowerCase() === providerFilter.toLowerCase();

    // Resolve category from inputParams
    const jobCategory = job.inputParams?.category || job.jobType;
    const matchesCategory = categoryFilter === "all" || String(jobCategory).toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesType && matchesProvider && matchesCategory;
  });

  // Tính toán metrics
  const totalCount = jobs.length;
  const doneCount = jobs.filter(j => j.status === "done").length;
  const failedCount = jobs.filter(j => j.status === "failed").length;
  const queuedCount = jobs.filter(j => j.status === "queued" || j.status === "processing").length;

  return (
    <div className="min-h-screen bg-black text-slate-100 p-6 md:p-10 selection:bg-purple-500/30">
      {/* Background Neon Glow Effect */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
          <div className="space-y-2">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Quay về Studio
            </Link>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
              Unified Job & Task Center
            </h1>
            <p className="text-sm text-neutral-400">
              Quản trị, tìm kiếm lỗi và theo dõi chi tiết trạng thái, nhà cung cấp (provider) và dòng máy (model) của các Jobs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={loadJobs}
              disabled={loading}
              className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl transition text-sm font-semibold disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-purple-400" : ""}`} />
              Làm mới
            </button>
            <button 
              onClick={handleClearAll}
              disabled={loading || jobs.length === 0}
              className="flex items-center gap-2 bg-red-950/40 border border-red-900/50 hover:bg-red-900/30 text-red-300 px-4 py-2.5 rounded-xl transition text-sm font-bold disabled:opacity-30 disabled:pointer-events-none"
            >
              <Trash2 className="w-4 h-4" />
              Xóa lịch sử
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-neutral-900/40 backdrop-blur-md border border-neutral-800/80 p-5 rounded-2xl flex flex-col justify-between shadow-lg">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Tổng số Jobs</span>
            <span className="text-3xl font-black text-white mt-2">{totalCount}</span>
          </div>
          
          <div className="bg-neutral-900/40 backdrop-blur-md border border-neutral-800/80 p-5 rounded-2xl flex flex-col justify-between shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-2 h-full bg-blue-500/40 group-hover:bg-blue-500 transition-colors" />
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-400 animate-spin-slow" />
              Đang chờ / Đang chạy
            </span>
            <span className="text-3xl font-black text-blue-400 mt-2">{queuedCount}</span>
          </div>

          <div className="bg-neutral-900/40 backdrop-blur-md border border-neutral-800/80 p-5 rounded-2xl flex flex-col justify-between shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-2 h-full bg-green-500/40 group-hover:bg-green-500 transition-colors" />
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-green-400" />
              Thành công
            </span>
            <span className="text-3xl font-black text-green-400 mt-2">{doneCount}</span>
          </div>

          <div className="bg-neutral-900/40 backdrop-blur-md border border-neutral-800/80 p-5 rounded-2xl flex flex-col justify-between shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-2 h-full bg-red-500/40 group-hover:bg-red-500 transition-colors" />
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
              Lỗi / Thất bại
            </span>
            <span className="text-3xl font-black text-red-400 mt-2">{failedCount}</span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-neutral-900/25 border border-neutral-800/60 p-4 rounded-2xl flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative w-full lg:max-w-xs">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm ID, IP ID, lỗi..."
              className="w-full bg-black/60 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:border-purple-500 focus:outline-none transition"
            />
          </div>

          <div className="grid grid-cols-2 md:flex md:flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-black/60 border border-neutral-800 text-sm text-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-purple-500 transition w-full md:w-auto"
            >
              <option value="all">Tất cả Trạng thái</option>
              <option value="queued">Queued (Chờ)</option>
              <option value="processing">Processing (Đang chạy)</option>
              <option value="done">Done (Thành công)</option>
              <option value="failed">Failed (Thất bại)</option>
            </select>

            {/* Original JobType Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-black/60 border border-neutral-800 text-sm text-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-purple-500 transition w-full md:w-auto"
            >
              <option value="all">Tất cả Loại Job</option>
              <option value="image">Image (Ảnh)</option>
              <option value="video">Video</option>
              <option value="audio">Audio</option>
              <option value="style_analysis">Style Analysis</option>
              <option value="xray_feedback">X-Ray Feedback</option>
              <option value="xray_generate_prompt">X-Ray Generate Prompt</option>
              <option value="script_analyze">Script Analyze</option>
              <option value="script_evaluate">Script Evaluate</option>
            </select>

            {/* Provider Filter */}
            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              className="bg-black/60 border border-neutral-800 text-sm text-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-purple-500 transition w-full md:w-auto font-semibold text-purple-400"
            >
              <option value="all">Tất cả Providers</option>
              <option value="gemini-native">Gemini Native</option>
              <option value="vidtory-sdk">Vidtory SDK</option>
              <option value="hub">StoryMee Hub</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-black/60 border border-neutral-800 text-sm text-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-purple-500 transition w-full md:w-auto font-semibold text-blue-400"
            >
              <option value="all">Tất cả Categories</option>
              <option value="script_evaluation">Script Evaluation</option>
              <option value="script_analysis">Script Analysis</option>
              <option value="xray_character">X-Ray Character</option>
              <option value="xray_location">X-Ray Location</option>
              <option value="xray_prop">X-Ray Prop</option>
              <option value="xray_style">X-Ray Style</option>
              <option value="xray_prompt">X-Ray Prompt</option>
              <option value="image_generation">Image Gen</option>
              <option value="video_generation">Video Gen</option>
            </select>
          </div>
        </div>

        {/* error message block if any */}
        {error && (
          <div className="bg-red-950/20 border border-red-900/50 p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-sm text-red-300">{error}</div>
          </div>
        )}

        {/* Jobs List / Table */}
        <div className="bg-neutral-900/20 border border-neutral-800/80 rounded-2xl overflow-hidden shadow-2xl">
          {loading && jobs.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
              <span className="text-sm text-neutral-500">Đang truy vấn lịch sử jobs...</span>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="py-20 text-center text-neutral-500 flex flex-col items-center justify-center gap-2">
              <AlertCircle className="w-8 h-8 text-neutral-600" />
              <span className="text-sm font-semibold">Không tìm thấy bản ghi Job nào</span>
              <span className="text-xs text-neutral-600">Thử thay đổi bộ lọc hoặc gõ từ khóa tìm kiếm khác.</span>
            </div>
          ) : (
            <div className="divide-y divide-neutral-900">
              {filteredJobs.map((job) => {
                const isFailed = job.status === "failed";
                const isDone = job.status === "done";
                const isProcessing = job.status === "processing";
                const isQueued = job.status === "queued";

                // Format created date
                const createdDate = new Date(job.createdAt).toLocaleString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  day: "2-digit",
                  month: "2-digit",
                });

                // Resolve provider & model from inputParams
                const providerName = job.inputParams?.provider || (job.inputParams?.model_id ? 'hub' : 'hub');
                const modelUsedName = job.inputParams?.model || job.inputParams?.model_id || 'N/A';
                const jobCategory = job.inputParams?.category || job.jobType;

                return (
                  <div 
                    key={job.id} 
                    className="p-5 hover:bg-neutral-900/40 transition-colors flex flex-col gap-4"
                  >
                    {/* Top Row: Meta info & status badge */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2.5">
                        {/* JobType Badge */}
                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md tracking-wider ${
                          job.jobType === 'video' 
                            ? 'bg-blue-950 text-blue-300 border border-blue-900/50'
                            : job.jobType === 'style_analysis'
                            ? 'bg-purple-950 text-purple-300 border border-purple-900/50'
                            : job.jobType === 'script_analyze'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-900/50'
                            : job.jobType === 'script_evaluate'
                            ? 'bg-violet-950 text-violet-300 border border-violet-900/50'
                            : 'bg-indigo-950 text-indigo-300 border border-indigo-900/50'
                        }`}>
                          {job.jobType === 'script_analyze' ? 'script analyze' : job.jobType === 'script_evaluate' ? 'script evaluate' : job.jobType}
                        </span>

                        {/* Provider Badge */}
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-purple-900/30 text-purple-300 border border-purple-800/40 flex items-center gap-1">
                          <Database className="w-2.5 h-2.5" />
                          {providerName}
                        </span>

                        {/* Model Badge */}
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-900/40 flex items-center gap-1">
                          <Cpu className="w-2.5 h-2.5" />
                          {modelUsedName}
                        </span>

                        {/* Category Badge */}
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 flex items-center gap-1">
                          <Layers className="w-2.5 h-2.5" />
                          {jobCategory}
                        </span>

                        <span className="text-xs text-neutral-500">{createdDate}</span>
                      </div>

                      {/* Status Glow Badge */}
                      <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto border-t border-neutral-900 pt-2.5 md:border-t-0 md:pt-0">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          isDone 
                            ? 'bg-green-950/60 text-green-400 border border-green-900/40' 
                            : isFailed 
                            ? 'bg-red-950/60 text-red-400 border border-red-900/40'
                            : 'bg-yellow-950/60 text-yellow-400 border border-yellow-900/40'
                        }`}>
                          {(isProcessing || isQueued) && <Loader2 className="w-3 h-3 animate-spin" />}
                          {job.status}
                        </span>

                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          disabled={actionLoading === job.id}
                          className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                          title="Xóa log job này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* ID Row: Full ID display with Copy button */}
                    <div className="flex items-center gap-2 bg-neutral-950 px-3.5 py-2.5 rounded-xl border border-neutral-905 w-full">
                      <span className="text-xs text-neutral-400 shrink-0 font-bold">FULL JOB ID:</span>
                      <span className="font-mono text-xs text-neutral-100 select-all overflow-x-auto whitespace-nowrap scrollbar-thin">
                        {job.id}
                      </span>
                      <button 
                        onClick={() => handleCopyId(job.id)}
                        className="text-neutral-400 hover:text-white hover:bg-neutral-800 transition p-1.5 rounded-lg shrink-0 ml-auto border border-neutral-800"
                        title="Sao chép ID đầy đủ"
                      >
                        {copiedId === job.id ? (
                          <span className="flex items-center gap-1 text-[10px] text-green-400 font-extrabold px-1">
                            <Check className="w-3 h-3" /> Đã copy
                          </span>
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Middle Section: Prompt details / input parameters */}
                    <div className="bg-black/40 border border-neutral-900 rounded-xl p-4 space-y-2">
                      <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Tham số đầu vào:</div>
                      
                      {job.inputParams && (
                        <div className="text-sm text-neutral-300 font-medium space-y-1.5">
                          {job.inputParams.prompt && (
                            <p className="line-clamp-2" title={job.inputParams.prompt}>
                              <span className="text-neutral-500 font-bold">Prompt:</span> {job.inputParams.prompt}
                            </p>
                          )}

                          {job.inputParams.brief && (
                            <p className="line-clamp-2" title={job.inputParams.brief}>
                              <span className="text-neutral-500 font-bold">Brief:</span> {job.inputParams.brief}
                            </p>
                          )}
                          
                          <div className="flex flex-wrap gap-x-6 gap-y-1.5 mt-2 text-xs text-neutral-400 font-mono">
                            {job.inputParams.aspect_ratio && (
                              <div><span className="text-neutral-600 font-bold">Ratio:</span> {job.inputParams.aspect_ratio}</div>
                            )}
                            {job.ipId && job.ipId !== "00000000-0000-0000-0000-000000000000" && (
                              <div><span className="text-neutral-600 font-bold">IP ID:</span> {job.ipId}</div>
                            )}
                            {job.inputParams.project_id && (
                              <div><span className="text-neutral-600 font-bold">Project ID:</span> {job.inputParams.project_id}</div>
                            )}
                            {job.inputParams.project_link && (
                              <div>
                                <span className="text-neutral-600 font-bold">Project Link:</span>{" "}
                                <a
                                  href={job.inputParams.project_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-purple-400 hover:underline"
                                >
                                  Mở Storyboard
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Output & Error Section */}
                    {isFailed && job.errorMessage && (
                      <div className="bg-red-950/20 border border-red-900/30 text-red-300 p-4 rounded-xl flex gap-2.5 items-start">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <div className="text-xs space-y-1">
                          <span className="font-bold uppercase tracking-wider text-red-400 block">THÔNG ĐIỆP LỖI CỦA WORKER:</span>
                          <span className="font-medium">{job.errorMessage}</span>
                        </div>
                      </div>
                    )}

                    {isDone && job.outputUrls && Array.isArray(job.outputUrls) && job.outputUrls.length > 0 && (
                      <div className="bg-green-950/10 border border-green-950/40 p-4 rounded-xl space-y-2.5">
                        <span className="text-xs font-bold text-green-400 uppercase tracking-wider block">
                          {['style_analysis', 'xray_feedback', 'xray_generate_prompt', 'script_analyze', 'script_evaluate'].includes(job.jobType) ? "KẾT QUẢ VĂN BẢN (GENERATED TEXT/JSON/PROMPT):" : "KẾT QUẢ ĐẦU RA (VARIANT ASSET):"}
                        </span>
                        
                        {['style_analysis', 'xray_feedback', 'xray_generate_prompt', 'script_analyze', 'script_evaluate'].includes(job.jobType) ? (
                          <div className="space-y-2">
                            {job.outputUrls.map((content: string, idx: number) => (
                              <div key={idx} className="space-y-2">
                                <div className="bg-black/60 rounded-xl border border-neutral-800 p-3.5 font-mono text-xs text-neutral-300 overflow-y-auto max-h-[300px] whitespace-pre-wrap leading-relaxed shadow-inner">
                                  {content}
                                </div>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(content);
                                    alert("Đã sao chép nội dung kết quả!");
                                  }}
                                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 rounded-xl border border-purple-500/25 px-3 py-2 transition-all"
                                >
                                  Sao chép nội dung
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-3">
                            {job.outputUrls.map((url: string, index: number) => (
                              <a 
                                key={index}
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:underline hover:text-blue-300 font-semibold"
                              >
                                Xem Media #{index + 1}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
