import { useState, useEffect, useRef } from 'react';
import { getApiBaseUrl, getHubApiKey } from '@/lib/api';
import { globalJobSubscriber } from '@/lib/globalJobSubscriber';

export interface JobStatusState {
  status: 'idle' | 'queued' | 'processing' | 'completed' | 'failed';
  outputUrls: string[];
  errorMessage: string | null;
  progressMessage: string | null;
}

export function useJobStatus(jobId: string | null, onCompleted?: (outputUrls: string[]) => void, onError?: (err: string) => void) {
  const [jobState, setJobState] = useState<JobStatusState>({
    status: jobId ? 'queued' : 'idle',
    outputUrls: [],
    errorMessage: null,
    progressMessage: null,
  });

  const onCompletedRef = useRef(onCompleted);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onCompletedRef.current = onCompleted;
    onErrorRef.current = onError;
  }, [onCompleted, onError]);

  useEffect(() => {
    if (!jobId) {
      setJobState({
        status: 'idle',
        outputUrls: [],
        errorMessage: null,
        progressMessage: null,
      });
      return;
    }

    setJobState({
      status: 'queued',
      outputUrls: [],
      errorMessage: null,
      progressMessage: null,
    });

    const uuidRegex = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;
    if (!uuidRegex.test(jobId)) {
      setJobState(prev => ({
        ...prev,
        status: 'failed',
        errorMessage: `Invalid job ID format: ${jobId}`
      }));
      onErrorRef.current?.(`Invalid job ID format: ${jobId}`);
      return;
    }

    let isPolling = false;
    let pollInterval: NodeJS.Timeout | null = null;
    let wsTimeout: NodeJS.Timeout | null = null;

    // Check if we are in browser environment
    if (typeof window === 'undefined') return;

    const startHttpPolling = () => {
      if (isPolling) return;
      isPolling = true;
      console.log(`[useJobStatus] Falling back to HTTP polling for job: ${jobId}`);
      
      const poll = async () => {
        try {
          const res = await fetch(`${getApiBaseUrl()}/media/status/${jobId}`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${getHubApiKey()}`
            }
          });
          if (!res.ok) return;
          const data = await res.json();
          const job = data.data;

          if (job) {
            const status = job.status;
            const outputUrls = Array.isArray(job.outputUrls) 
              ? job.outputUrls 
              : Array.isArray(job.output)
                ? job.output
                : job.output_url 
                  ? [job.output_url] 
                  : typeof job.output === 'string'
                    ? [job.output]
                    : [];

            if (status === 'completed' || status === 'done' || status === 'success') {
              setJobState({
                status: 'completed',
                outputUrls,
                errorMessage: null,
                progressMessage: null,
              });
              if (pollInterval) clearInterval(pollInterval);
              onCompletedRef.current?.(outputUrls);
            } else if (status === 'failed') {
              const errMsg = job.errorMessage || job.error || 'Job failed';
              setJobState({
                status: 'failed',
                outputUrls: [],
                errorMessage: errMsg,
                progressMessage: null,
              });
              if (pollInterval) clearInterval(pollInterval);
              onErrorRef.current?.(errMsg);
            } else if (status === 'processing') {
              setJobState(prev => ({
                ...prev,
                status: 'processing',
                progressMessage: job.errorMessage || 'Xử lý dữ liệu...'
              }));
            }
          }
        } catch (e: any) {
          console.error('[useJobStatus] Polling error:', e);
        }
      };

      poll();
      pollInterval = setInterval(poll, 3000);
    };

    const handleJobUpdate = (result: any) => {
      // Clear WS fallback timeout because we received a message!
      if (wsTimeout) {
        clearTimeout(wsTimeout);
        wsTimeout = null;
      }

      const state = result.state || result.status;
      
      if (state === 'SUCCEEDED' || state === 'completed' || state === 'done' || state === 'success') {
        const response = result.response;
        let outputUrls: string[] = [];
        if (response) {
          if (typeof response === 'string') {
            outputUrls = [response];
          } else if (response.outputUrls) {
            outputUrls = response.outputUrls;
          } else if (response.output) {
            outputUrls = Array.isArray(response.output) ? response.output : [response.output];
          } else if (response.output_url) {
            outputUrls = [response.output_url];
          } else {
            outputUrls = [JSON.stringify(response)];
          }
        }
        
        setJobState({
          status: 'completed',
          outputUrls,
          errorMessage: null,
          progressMessage: null,
        });
        
        if (pollInterval) clearInterval(pollInterval);
        onCompletedRef.current?.(outputUrls);
      } else if (state === 'FAILED' || state === 'failed') {
        const errMsg = result.error || result.errorMessage || 'Job failed';
        setJobState({
          status: 'failed',
          outputUrls: [],
          errorMessage: errMsg,
          progressMessage: null,
        });
        
        if (pollInterval) clearInterval(pollInterval);
        onErrorRef.current?.(errMsg);
      } else if (state === 'PROCESSING' || state === 'processing') {
        setJobState(prev => ({
          ...prev,
          status: 'processing',
          progressMessage: result.message || 'Xử lý dữ liệu...'
        }));
      }
    };

    // Subscribe to global job updates
    globalJobSubscriber.subscribe(jobId, handleJobUpdate);

    // Set a safety timeout: if we don't get any WS update in 5 seconds, fallback to HTTP polling.
    wsTimeout = setTimeout(() => {
      startHttpPolling();
    }, 5000);

    return () => {
      globalJobSubscriber.unsubscribe(jobId, handleJobUpdate);
      if (pollInterval) {
        clearInterval(pollInterval);
      }
      if (wsTimeout) {
        clearTimeout(wsTimeout);
      }
    };
  }, [jobId]);

  return jobState;
}
