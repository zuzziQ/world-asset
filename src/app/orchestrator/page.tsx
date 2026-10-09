'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, ShieldAlert, CheckCircle, Activity, Box, Database, Zap, ArrowRight, X, Network } from 'lucide-react';
import Link from 'next/link';
import FallbackFlowGraph from './FallbackFlowGraph';
import { getApiBaseUrl, getHubApiKey } from '@/lib/api';

export default function OrchestratorDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [traces, setTraces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const baseUrl = getApiBaseUrl();
        const headers: Record<string, string> = {};
        const apiKey = getHubApiKey();
        if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

        const [metricsRes, tracesRes] = await Promise.all([
          fetch(`${baseUrl}/internal/v1/asset/world/orchestrator/metrics`, { headers }).catch(() => null),
          fetch(`${baseUrl}/internal/v1/asset/world/orchestrator/traces`, { headers }).catch(() => null)
        ]);
        const metricsData = metricsRes && metricsRes.ok ? await metricsRes.json().catch(() => null) : null;
        const tracesData = tracesRes && tracesRes.ok ? await tracesRes.json().catch(() => []) : [];
        
        setMetrics(metricsData && typeof metricsData === 'object' && !metricsData.error ? metricsData : { total: 0, duplicates: 0, pending: 0, approved: 0, duplicationRate: "0.00%" });
        setTraces(Array.isArray(tracesData) ? tracesData : (Array.isArray(tracesData?.data) ? tracesData.data : []));
      } catch (error) {
        console.error('Failed to load orchestrator data', error);
        setMetrics({ total: 0, duplicates: 0, pending: 0, approved: 0, duplicationRate: "0.00%" });
        setTraces([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const getTierColor = (tier: number) => {
    switch (tier) {
      case 1: return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 2: return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 3: return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 4: return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const getTierLabel = (tier: number) => {
    switch (tier) {
      case 1: return 'Tier 1: Exact Match';
      case 2: return 'Tier 2: Parent Fallback';
      case 3: return 'Tier 3: Semantic Hub';
      case 4: return 'Tier 4: Root Image Trigger';
      default: return 'Tier 0: Absolute Miss';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-slate-200 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              Orchestrator Control Center
            </h1>
            <p className="text-slate-400 mt-2">World Asset Variant Management &amp; Anti-Chaos Metrics</p>
          </div>
          <Link href="/orchestrator/semantics" className="flex items-center gap-2 bg-teal-600/20 text-teal-400 hover:bg-teal-600/40 px-4 py-2 rounded-lg transition border border-teal-600/30">
            <Network className="w-5 h-5" /> Semantic Hub
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-sm font-medium text-slate-400 mb-2">Total Variants</h3>
            <div className="text-3xl font-bold text-white">{metrics?.total || 0}</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-sm font-medium text-emerald-400 flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4" /> Auto-Approved
            </h3>
            <div className="text-3xl font-bold text-white">{metrics?.approved || 0}</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-sm font-medium text-blue-400 flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4" /> Recent Queries
            </h3>
            <div className="text-3xl font-bold text-white">{traces.length}</div>
          </div>

          <div className="bg-slate-900 border border-rose-900/50 rounded-xl p-6">
            <h3 className="text-sm font-medium text-rose-400 flex items-center gap-2 mb-2">
              <ShieldAlert className="w-4 h-4" /> Duplication Rate
            </h3>
            <div className="text-3xl font-bold text-rose-500">{metrics?.duplicationRate || '0%'}</div>
            <p className="text-xs text-slate-500 mt-1">{metrics?.duplicates || 0} duplicates flagged by pHash</p>
          </div>
        </div>

        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold text-white flex items-center gap-2">Fallback Routing Graph</h3>
            <p className="text-slate-400 text-sm">Visualizing the resolution path of incoming queries</p>
          </div>
          <div className="mb-8"><FallbackFlowGraph traces={traces} /></div>

          <div className="flex items-center justify-between mb-6 mt-12">
            <h3 className="text-2xl font-semibold text-white flex items-center gap-2">
              Fallback Trace Log
              <span className="bg-blue-500/10 text-blue-400 text-sm py-1 px-3 rounded-full font-medium ml-2">Live Audit</span>
            </h3>
            <p className="text-slate-400 text-sm">Real-time tracking of asset waterfall resolutions</p>
          </div>

          {traces.length === 0 ? (
            <div className="bg-slate-900/50 rounded-xl p-12 border border-slate-800 border-dashed text-center">
              <Database className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-white mb-2">No queries logged yet</h4>
              <p className="text-slate-400">Waiting for Studio or GFlow to request assets.</p>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="divide-y divide-slate-800/50">
                {traces.map((trace) => (
                  <div key={trace.id} className="p-4 hover:bg-slate-800/50 transition-colors flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded border ${getTierColor(trace.resolutionTier)} font-medium`}>
                          {getTierLabel(trace.resolutionTier)}
                        </span>
                        <span className="text-slate-500 text-xs">{new Date(trace.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="bg-slate-800 px-3 py-1.5 rounded-md border border-slate-700 flex items-center gap-2">
                          <Box className="w-3 h-3 text-slate-400" />
                          <span className="font-mono text-sm text-slate-300">{trace.originalTagId}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-600" />
                        {trace.resolvedTagId ? (
                          <div className={`px-3 py-1.5 rounded-md border flex items-center gap-2 ${trace.resolutionTier === 1 ? 'bg-emerald-900/20 border-emerald-800' : 'bg-blue-900/20 border-blue-800'}`}>
                            <CheckCircle className={`w-3 h-3 ${trace.resolutionTier === 1 ? 'text-emerald-500' : 'text-blue-500'}`} />
                            <span className="font-mono text-sm text-white">{trace.resolvedTagId}</span>
                          </div>
                        ) : (
                          <div className="px-3 py-1.5 rounded-md border border-rose-900/50 bg-rose-900/20 flex items-center gap-2">
                            <X className="w-3 h-3 text-rose-500" />
                            <span className="text-sm text-rose-400 font-medium">Miss</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {trace.isGenTriggered && (
                      <div className="flex items-center gap-2 bg-purple-900/20 border border-purple-800/50 text-purple-400 px-4 py-2 rounded-lg">
                        <Zap className="w-4 h-4" />
                        <span className="text-sm font-medium">Auto-Gen Triggered</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
