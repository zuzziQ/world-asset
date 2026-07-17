import { getHubWsUrl } from './api';

type JobCallback = (result: any) => void;

class GlobalJobSubscriber {
  private ws: WebSocket | null = null;
  private listeners: Map<string, JobCallback[]> = new Map();
  private isConnecting = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 50;
  private reconnectInterval = 3000;
  private pingInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  public subscribe(jobId: string, callback: JobCallback) {
    if (!jobId) return;
    
    if (!this.listeners.has(jobId)) {
      this.listeners.set(jobId, []);
    }
    this.listeners.get(jobId)!.push(callback);

    this.connect();
  }

  public unsubscribe(jobId: string, callback: JobCallback) {
    if (!jobId) return;

    const list = this.listeners.get(jobId);
    if (list) {
      const idx = list.indexOf(callback);
      if (idx !== -1) {
        list.splice(idx, 1);
      }
      if (list.length === 0) {
        this.listeners.delete(jobId);
      }
    }

    if (this.listeners.size === 0) {
      this.disconnect();
    }
  }

  private connect() {
    if (this.ws || this.isConnecting || typeof window === 'undefined') return;

    this.isConnecting = true;
    const url = getHubWsUrl('/v1/media/ws'); // Connecting globally without job_id
    console.log(`[GlobalJobSubscriber] Connecting to WS: ${url}`);

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('[GlobalJobSubscriber] WebSocket connected successfully');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.startPing();
      };

      this.ws.onmessage = (event) => {
        try {
          if (event.data === 'pong') return;
          const result = JSON.parse(event.data);
          const jobId = result.job_id;
          if (jobId) {
            const list = this.listeners.get(jobId);
            if (list) {
              list.forEach(cb => cb(result));
            }
          }
        } catch (e) {
          // Ignore parse errors if the message is not JSON
        }
      };

      this.ws.onerror = (err) => {
        console.warn('[GlobalJobSubscriber] WebSocket error:', err);
      };

      this.ws.onclose = () => {
        console.log('[GlobalJobSubscriber] WebSocket connection closed');
        this.cleanup();
        this.scheduleReconnect();
      };
    } catch (err) {
      console.error('[GlobalJobSubscriber] Failed to initialize WebSocket:', err);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  private disconnect() {
    console.log('[GlobalJobSubscriber] Disconnecting (no more active subscribers)');
    this.cleanup();
    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {}
      this.ws = null;
    }
  }

  private cleanup() {
    this.isConnecting = false;
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  private startPing() {
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        try {
          this.ws.send('ping');
        } catch (e) {}
      }
    }, 25000);
  }

  private scheduleReconnect() {
    if (this.listeners.size === 0 || this.reconnectAttempts >= this.maxReconnectAttempts) return;

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectInterval * Math.pow(1.5, this.reconnectAttempts), 30000);
    console.log(`[GlobalJobSubscriber] Scheduling reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }
}

export const globalJobSubscriber = new GlobalJobSubscriber();
export type { JobCallback };
