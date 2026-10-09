"use client";

import { useCallback } from "react";

export function useGFlowExtension() {
  const getGFlowToken = useCallback(async (): Promise<string | null> => {
    if (typeof window === "undefined") return null;

    try {
      const extId =
        document.documentElement.getAttribute("data-storymee-extension-id") ||
        (typeof localStorage !== "undefined" ? localStorage.getItem("STORYMEE_EXT_ID") : null);
      const win = window as any;
      if (extId && win.chrome && win.chrome.runtime) {
        return new Promise<string | null>((resolve) => {
          try {
            win.chrome.runtime.sendMessage(
              extId,
              { action: "GET_GOOGLE_LABS_TOKEN" },
              (response: any) => {
                if (response && response.token) {
                  resolve(response.token);
                } else {
                  resolve(null);
                }
              }
            );
          } catch (e) {
            resolve(null);
          }
        });
      }
    } catch (err) {
      console.warn("Failed to get GFlow token from extension", err);
    }
    return null;
  }, []);

  return { getGFlowToken };
}
