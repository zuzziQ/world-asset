import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export interface CoreApiClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
  servicePrefix?: string;
  apiVersion?: string;
  enforceApiPrefix?: boolean;
}

export class CoreApiClient {
  client: AxiosInstance;

  constructor(config: CoreApiClientConfig) {
    let baseURL = config.baseURL.replace(/\/+$/, '');
    if (config.servicePrefix || config.apiVersion) {
      const prefix = config.servicePrefix || 'internal';
      const version = config.apiVersion || 'v1';
      baseURL = `${baseURL}/${prefix}/${version}`;
    } else if (config.enforceApiPrefix !== false && !baseURL.endsWith('/api')) {
      baseURL = `${baseURL}/api`;
    }

    this.client = axios.create({
      baseURL,
      timeout: config.timeout || 15000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      }
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        const formattedError = {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          code: error.code
        };
        return Promise.reject(formattedError);
      }
    );
  }

  cleanUrl(url: string) {
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    let basePath = '';
    try {
      if (this.client.defaults.baseURL) {
        const urlObj = new URL(this.client.defaults.baseURL);
        basePath = urlObj.pathname.replace(/\/+$/, '');
      }
    } catch (e) {}
    let clean = url;
    if (basePath && basePath.length > 0 && clean.startsWith(basePath)) {
      clean = clean.substring(basePath.length);
    }
    return clean.startsWith('/') ? clean.substring(1) : clean;
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get(this.cleanUrl(url), config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post(this.cleanUrl(url), data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put(this.cleanUrl(url), data, config);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch(this.cleanUrl(url), data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete(this.cleanUrl(url), config);
    return response.data;
  }
}
