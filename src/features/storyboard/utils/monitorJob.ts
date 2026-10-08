import { API_BASE_URL, getHubApiKey, getHubWsUrl, getApiBaseUrl } from "@/lib/api";

const cleanUrlSlashes = (url: string): string => {
  if (!url || typeof url !== 'string') return url;
  if (url.startsWith("https:/") && !url.startsWith("https://")) {
    return url.replace("https:/", "https://");
  }
  if (url.startsWith("http:/") && !url.startsWith("http://")) {
    return url.replace("http:/", "http://");
  }
  return url;
};

const extractUrlsFromObject = (obj: any): string[] | null => {
  if (!obj) return null;

  if (typeof obj === 'string') {
    return extractUrlsFromString(obj) || (obj.startsWith('http') ? [cleanUrlSlashes(obj)] : null);
  }

  if (typeof obj !== 'object') return null;

  if (Array.isArray(obj)) {
    const list: string[] = [];
    for (const item of obj) {
      const ext = extractUrlsFromObject(item);
      if (ext) list.push(...ext);
    }
    return list.length > 0 ? list : null;
  }

  // Check direct URL fields
  if (obj.url && typeof obj.url === 'string') {
    return [cleanUrlSlashes(obj.url)];
  }
  if (obj.image_url && typeof obj.image_url === 'string') {
    return [cleanUrlSlashes(obj.image_url)];
  }
  if (obj.output_url && typeof obj.output_url === 'string') {
    return [cleanUrlSlashes(obj.output_url)];
  }
  if (obj.output && Array.isArray(obj.output)) {
    return obj.output.map((u: any) => cleanUrlSlashes(String(u)));
  }
  if (obj.output && typeof obj.output === 'string') {
    return [cleanUrlSlashes(obj.output)];
  }
  if (obj.urls && Array.isArray(obj.urls)) {
    return obj.urls.map((u: any) => cleanUrlSlashes(String(u)));
  }

  // Recursively check common nested properties
  const keysToCheck = ['result', 'response', 'images', 'outputUrls', 'output_url', 'output', 'data'];
  for (const key of keysToCheck) {
    if (obj[key] !== undefined && obj[key] !== null) {
      const val = obj[key];
      const ext = extractUrlsFromObject(val);
      if (ext && ext.length > 0) return ext;
    }
  }

  return null;
};

const extractUrlsFromString = (str: string): string[] | null => {
  if (!str || typeof str !== 'string') return null;
  const trimmed = str.trim();
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('http:/') || trimmed.startsWith('https:/')) {
      return [cleanUrlSlashes(trimmed)];
    }
    return null;
  }
  try {
    const parsed = JSON.parse(trimmed);
    const urls = extractUrlsFromObject(parsed);
    if (urls && urls.length > 0) return urls;
  } catch (e) {}
  return null;
};

let isWsOffline = false; // Module-level flag to cache WebSocket failure and avoid redundant timeouts

export const monitorJob = (jobId: string, options?: { forceHttp?: boolean, signal?: AbortSignal, timeoutMs?: number }): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error("window is undefined"));
      return;
    }

    // Validate UUID format before attempting connections
    const uuidRegex = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;
    if (!jobId || !uuidRegex.test(jobId)) {
        reject(new Error(`Invalid job ID format: ${jobId}`));
        return;
    }

    const wsUrls: string[] = [];
    const hubWsBase = getHubWsUrl(); // Dynamically resolves to ws://localhost:5100 or wss://dev-hub.storymee.com
    wsUrls.push(`${hubWsBase}/v1/media/ws?job_id=${jobId}`);
    wsUrls.push(`${hubWsBase}/media/ws?job_id=${jobId}`); // Fallback for older versions

    let wsUrlIndex = 0;
    let ws: WebSocket | null = null;
    let isPolling = false;
    let pollInterval: any = null;

    if (options?.signal?.aborted) {
      reject(new Error('Job monitor aborted by user'));
      return;
    }

    let globalTimeout: any = null;
    const timeoutMs = options?.timeoutMs || 300000; // 5 minutes default timeout

    globalTimeout = setTimeout(() => {
      cleanupAndReject(`Job monitor timed out after ${timeoutMs}ms. Provider might be offline or hanging.`);
    }, timeoutMs);

    // Fallback parallel HTTP polling if WebSocket fails to connect or load within 500ms
    const fallbackTimer = setTimeout(() => {
      if (!isPolling && !options?.signal?.aborted) {
        console.log(`[monitorJob] WebSocket did not connect within 500ms. Starting parallel HTTP polling for job: ${jobId}`);
        startHttpPolling();
      }
    }, 500);

    const cleanupAndResolve = (result: any) => {
      if (globalTimeout) clearTimeout(globalTimeout);
      if (pollInterval) clearTimeout(pollInterval);
      if (fallbackTimer) clearTimeout(fallbackTimer);
      if (ws) {
        ws.onclose = null;
        ws.close();
      }
      resolve(result);
    };

    const cleanupAndReject = (reason: string) => {
      if (globalTimeout) clearTimeout(globalTimeout);
      if (pollInterval) clearTimeout(pollInterval);
      if (fallbackTimer) clearTimeout(fallbackTimer);
      if (ws) {
        ws.onclose = null; // Prevent reconnection logic
        ws.close();
      }
      reject(new Error(reason));
    };

    if (options?.signal) {
      options.signal.addEventListener('abort', () => {
        cleanupAndReject('Job monitor aborted by user');
      });
    }

    const startHttpPolling = () => {
      if (isPolling) return;
      isPolling = true;
      console.log(`[monitorJob] Starting HTTP polling for job: ${jobId}`);

      let pollCount = 0;

      const poll = async () => {
        if (options?.signal?.aborted) return;

        try {
          const res = await fetch(`${getApiBaseUrl()}/media/status/${jobId}`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${getHubApiKey()}`
            },
            signal: options?.signal // Abort the fetch request if cancelled
          });
          if (!res.ok) throw new Error(`HTTP status ${res.status}`);
          
          const data = await res.json();
          const job = data.data;

          if (job) {
            const status = job.status;
            let outputUrls: string[] = [];
            const extracted = extractUrlsFromObject(job);
            if (extracted) {
              outputUrls = extracted;
            } else {
              let parsedOutputUrls: string[] = [];
              if (Array.isArray(job.outputUrls)) {
                parsedOutputUrls = job.outputUrls;
              } else if (typeof job.outputUrls === 'string') {
                const ext = extractUrlsFromString(job.outputUrls);
                parsedOutputUrls = ext ? ext : [job.outputUrls];
              }
              
              outputUrls = parsedOutputUrls.length > 0 ? parsedOutputUrls.map(cleanUrlSlashes) : [];
              
              if (outputUrls.length === 0 && job.output_url) {
                const ext = extractUrlsFromString(job.output_url);
                outputUrls = ext ? ext : [cleanUrlSlashes(job.output_url)];
              }
            }

            if (status === 'completed' || status === 'done' || status === 'success') {
              cleanupAndResolve({ ...job, outputUrls });
              return;
            } else if (status === 'failed') {
              cleanupAndReject(job.errorMessage || job.error || 'Job failed');
              return;
            }
          }
        } catch (e: any) {
          if (e.name === 'AbortError') return;
          console.error('[monitorJob] Polling error:', e);
        }

        // Progressive polling: initial fast polls, backing off to standard interval
        pollCount++;
        const nextDelay = pollCount <= 3 ? 1000 : pollCount <= 8 ? 2000 : 3000;

        if (isPolling && !options?.signal?.aborted) {
          pollInterval = setTimeout(poll, nextDelay);
        }
      };

      poll();
    };

    const tryConnectWS = () => {
      if (options?.signal?.aborted) return;
      
      if (options?.forceHttp || isWsOffline) {
        console.log(`[monitorJob] WS connection skipped (forceHttp=${options?.forceHttp}, isWsOffline=${isWsOffline}) for job: ${jobId}`);
        startHttpPolling();
        return;
      }

      if (wsUrlIndex >= wsUrls.length) {
        startHttpPolling();
        return;
      }

      const url = wsUrls[wsUrlIndex];
      console.log(`[monitorJob] Attempting WebSocket connection to: ${url}`);

      try {
        ws = new WebSocket(url);

        const connectionTimeout = setTimeout(() => {
          if (ws && ws.readyState !== WebSocket.OPEN) {
            console.warn(`[monitorJob] WebSocket connection timeout for: ${url}`);
            isWsOffline = true; // Mark WebSocket server as offline/unresponsive
            ws.close();
          }
        }, 500); // Reduced timeout to 500ms for fast fallback

        ws.onopen = () => {
          clearTimeout(connectionTimeout);
          console.log(`[monitorJob] WebSocket connected successfully to: ${url}`);
        };

        ws.onmessage = (event) => {
          try {
            const result = JSON.parse(event.data);
            const state = result.state || result.status;

            if (state === 'SUCCEEDED' || state === 'completed' || state === 'done' || state === 'success') {
              let outputUrls = extractUrlsFromObject(result) || [];
              
              if (outputUrls.length === 0 && result.response) {
                const response = result.response;
                if (typeof response === 'string') {
                  const extracted = extractUrlsFromString(response);
                  outputUrls = extracted ? extracted : [cleanUrlSlashes(response)];
                } else if (typeof response === 'object') {
                  const extracted = extractUrlsFromObject(response);
                  outputUrls = extracted ? extracted : [];
                }
              }

              if (ws) ws.close();
              cleanupAndResolve({ ...result, outputUrls });
            } else if (state === 'FAILED' || state === 'failed' || state === 'error') {
              cleanupAndReject(result.errorMessage || result.error || 'Job failed via WebSocket');
            }
          } catch (e) {
            console.error('[monitorJob] WS message parse error:', e);
          }
        };

        ws.onerror = (err) => {
          clearTimeout(connectionTimeout);
          console.warn(`[monitorJob] WebSocket error for: ${url}`, err);
          isWsOffline = true; // Mark WebSocket server as offline/unresponsive
        };

        ws.onclose = () => {
          clearTimeout(connectionTimeout);
          console.log(`[monitorJob] WebSocket closed for: ${url}`);
          if (!isPolling) {
            wsUrlIndex++;
            tryConnectWS();
          }
        };
      } catch (err) {
        console.warn(`[monitorJob] Failed to create WebSocket for: ${url}`, err);
        isWsOffline = true;
        wsUrlIndex++;
        tryConnectWS();
      }
    };

    tryConnectWS();
  });
};
