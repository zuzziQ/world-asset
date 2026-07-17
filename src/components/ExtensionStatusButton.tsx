"use client";

import React, { useState, useEffect, useCallback } from "react";
import { getHubUrl, HUB_API_KEY } from "@/lib/api";
import { Cloud, Monitor, AlertCircle, RefreshCw } from "lucide-react";

export default function ExtensionStatusButton() {
  const [extensionMode, setExtensionMode] = useState<'cloud' | 'local' | 'offline'>('offline');
  const [isChecking, setIsChecking] = useState(false);

  const getActiveExtensionId = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const domId = document.documentElement.getAttribute("data-storymee-extension-id");
    if (domId) {
      localStorage.setItem('STORYMEE_EXT_ID', domId);
      return domId;
    }
    return localStorage.getItem('STORYMEE_EXT_ID');
  }, []);

  const checkExt = useCallback(async (isExplicitClick = false) => {
    if (isExplicitClick) {
      setIsChecking(true);
    }
    
    const extId = getActiveExtensionId();
    const hasChrome = typeof window !== 'undefined' && !!(window as any).chrome;
    const hasRuntime = typeof window !== 'undefined' && !!(window as any).chrome?.runtime;
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    const domId = typeof window !== 'undefined' ? document.documentElement.getAttribute("data-storymee-extension-id") : null;
    const storedId = typeof window !== 'undefined' ? localStorage.getItem('STORYMEE_EXT_ID') : null;

    if (isExplicitClick) {
      console.group("🔍 STORYMEE EXTENSION DIAGNOSTIC (HEADER)");
      console.log(`- Current URL: ${currentUrl}`);
      console.log(`- window.chrome detected: ${hasChrome}`);
      console.log(`- window.chrome.runtime detected: ${hasRuntime}`);
      console.log(`- DOM Attribute (data-storymee-extension-id): ${domId}`);
      console.log(`- localStorage(STORYMEE_EXT_ID): ${storedId}`);
      console.log(`- Final resolved extId: ${extId}`);
      console.groupEnd();
    }

    // 1. ƯU TIÊN 1: Ping Hub Gateway API xem có Cloud Extension worker nào đang online không
    try {
      const hubUrl = getHubUrl();
      const res = await fetch(`${hubUrl}/v1/health/microservices`, {
        headers: {
          'Authorization': `Bearer ${HUB_API_KEY}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        const gflowSvc = data.services?.find((s: any) => s.name === "GFlow Tunnel Worker");
        if (gflowSvc && gflowSvc.status === "online") {
          setExtensionMode('cloud');
          localStorage.setItem('STORYMEE_EXTENSION_MODE', 'cloud');
          if (isExplicitClick) {
            setTimeout(() => setIsChecking(false), 600);
          }
          return;
        }
      }
    } catch (e) {
      if (isExplicitClick) {
        console.warn("⚠️ [Hub Ping] Failed to check Cloud Extension status via Hub Gateway:", e);
      }
    }

    // 2. ƯU TIÊN 2: Chạy cùng trình duyệt: check chrome.runtime trực tiếp (Local Fallback)
    if (extId && extId !== 'sk-extension-default' && hasRuntime) {
      setExtensionMode('local');
      localStorage.setItem('STORYMEE_EXTENSION_MODE', 'local');
      
      // Auto-sync Local/Prod API Base URL to Extension for WebSocket Tunneling
      try {
        const syncUrl = getHubUrl();
        (window as any).chrome.runtime.sendMessage(extId, {
          action: "CONNECT_WS",
          payload: { gflowUrl: syncUrl }
        }, (res: any) => {
          if ((window as any).chrome.runtime.lastError) {
            console.warn("[GFlow] Connect WS message failed:", (window as any).chrome.runtime.lastError);
          }
        });
      } catch (syncErr) {
        console.warn("[GFlow] Failed to dispatch auto-connect-ws to extension:", syncErr);
      }
      if (isExplicitClick) {
        setTimeout(() => setIsChecking(false), 600);
      }
      return;
    }

    setExtensionMode('offline');
    localStorage.setItem('STORYMEE_EXTENSION_MODE', 'offline');
    if (isExplicitClick) {
      setTimeout(() => setIsChecking(false), 600);
    }
  }, [getActiveExtensionId]);

  useEffect(() => {
    const handleSync = () => {
      checkExt(false);
    };
    handleSync();
    
    window.addEventListener('STORYMEE_EXTENSION_CONNECTED', handleSync);
    window.addEventListener('storage', handleSync);
    
    // Polling health check status every 8 seconds for remote cloud extensions
    const timer = setTimeout(handleSync, 1000);
    const interval = setInterval(handleSync, 8000);
    
    return () => {
      window.removeEventListener('STORYMEE_EXTENSION_CONNECTED', handleSync);
      window.removeEventListener('storage', handleSync);
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [checkExt]);

  return (
    <button
      onClick={() => checkExt(true)}
      disabled={isChecking}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold backdrop-blur-sm transition-all duration-300 ${
        extensionMode === 'cloud'
          ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/20'
          : extensionMode === 'local'
          ? 'bg-cyan-950/40 border-cyan-500/30 text-cyan-400 hover:bg-cyan-900/20'
          : 'bg-rose-950/40 border-rose-500/30 text-rose-400 hover:bg-rose-900/20 hover:border-rose-500/50'
      }`}
      title={
        extensionMode === 'cloud'
          ? "Cloud Media Extension Worker is Active. Ready to render jobs from any user."
          : extensionMode === 'local'
          ? "Connected directly to your local browser extension (For local testing only)."
          : "Extension is Offline. Media generation jobs will queue in DB but won't render. Please enable GFlow Extension."
      }
    >
      {isChecking ? (
        <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-300" />
      ) : extensionMode === 'cloud' ? (
        <Cloud className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
      ) : extensionMode === 'local' ? (
        <Monitor className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
      ) : (
        <AlertCircle className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
      )}
      
      <span className="hidden sm:inline">
        {extensionMode === 'cloud'
          ? 'Ext: Connected (Cloud)'
          : extensionMode === 'local'
          ? 'Ext: Connected (Local)'
          : 'Ext: Offline (Retry)'}
      </span>
    </button>
  );
}
