import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// --- 统一配置常量 ---
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'X-Client-Version': '1.0.0'
};

// --- 重复请求控制器 Map ---
// 键: 请求标识 (Method + URL + Params)
// 值: AbortController
const pendingMap = new Map<string, AbortController>();

/**
 * 生成请求的唯一标识 key
 * @param config 
 */
const getRequestKey = (config: InternalAxiosRequestConfig): string => {
  const { method, url, params, data } = config;
  return [
    method,
    url,
    JSON.stringify(params),
    JSON.stringify(data)
  ].join('&');
};

/**
 * 添加请求到 pendingMap
 * 策略：如果发现重复请求，取消上一个（防抖效果），保留最新的
 */
const addPending = (config: InternalAxiosRequestConfig) => {
  // 可以在 config 中添加自定义属性 allowDuplicate: true 来跳过此检查
  // @ts-ignore
  if (config.allowDuplicate) return;

  const key = getRequestKey(config);
  
  if (pendingMap.has(key)) {
    const controller = pendingMap.get(key);
    controller?.abort("Duplicate request cancelled by client");
    pendingMap.delete(key);
  }
  
  const controller = new AbortController();
  config.signal = controller.signal;
  pendingMap.set(key, controller);
};

/**
 * 移除完成的请求
 */
const removePending = (config: InternalAxiosRequestConfig) => {
  // @ts-ignore
  if (config.allowDuplicate) return;
  
  const key = getRequestKey(config);
  if (pendingMap.has(key)) {
    pendingMap.delete(key);
  }
};

// --- 签名逻辑 (保持不变) ---
const generateSignature = (config: InternalAxiosRequestConfig): string => {
    const timestamp = Date.now().toString();
    const nonce = Math.random().toString(36).substring(7);
    config.headers.set('X-Timestamp', timestamp);
    config.headers.set('X-Nonce', nonce);
    return `SIGN_${timestamp}_${config.method?.toUpperCase()}_${config.url}`;
};

// --- 拦截器安装函数 ---
const setupInterceptors = (instance: AxiosInstance, instanceName: string) => {
  // 1. 请求拦截器
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // [Anti-Duplicate] 防抖/取消重复请求
      removePending(config); // 先尝试移除可能的旧 key (防御性)
      addPending(config);

      // [Auth] 自动注入 Token
      const token = sessionStorage.getItem('admin_token');
      if (token) {
        config.headers.set('Authorization', `Bearer ${token}`);
      }

      // [Security] 注入签名
      const signature = generateSignature(config);
      config.headers.set('X-Signature', signature);

      if (import.meta.env.DEV) {
        console.debug(`[${instanceName}] Request:`, config.url);
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // 2. 响应拦截器
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      removePending(response.config);
      return response;
    },
    (error: AxiosError) => {
      if (error.config) {
        removePending(error.config as InternalAxiosRequestConfig);
      }
      
      // 如果是取消请求，不视为错误抛出，或者特定处理
      if (axios.isCancel(error)) {
        console.log(`[${instanceName}] Request cancelled: duplicate`);
        return Promise.reject(new Error('Request cancelled')); 
      }

      let errorMsg = '网络连接异常';
      if (error.response) {
        const status = error.response.status;
        switch (status) {
          case 401:
            errorMsg = '登录已过期';
            sessionStorage.removeItem('admin_token');
            break;
          case 403: errorMsg = '无权访问'; break;
          case 404: errorMsg = '资源未找到'; break;
          case 500: errorMsg = '服务器错误'; break;
          default: errorMsg = `请求失败 (${status})`;
        }
      }
      
      const enhancedError: any = error;
      enhancedError.message = errorMsg;
      return Promise.reject(enhancedError);
    }
  );
};

// --- 实例定义 ---

// 1. 真实接口实例 (默认)
const realAxios = axios.create({
  baseURL: '/api', 
  timeout: 15000,
  headers: DEFAULT_HEADERS,
  withCredentials: true 
});

// 2. Mock 接口实例 (json-server)
const mockAxios = axios.create({
  baseURL: '/mock-api',
  timeout: 5000,
  headers: DEFAULT_HEADERS,
});

setupInterceptors(realAxios, 'RealAPI');
setupInterceptors(mockAxios, 'MockAPI');

export { realAxios, mockAxios };
export default realAxios;