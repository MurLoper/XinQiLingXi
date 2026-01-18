
/// <reference types="vite/client" />

interface ImportMetaEnv {
  // --- AI 服务密钥 (Fallback) ---
  // 仅在 src/services/aiService.ts 中作为兜底使用
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_DEEPSEEK_API_KEY: string;
  readonly VITE_KIMI_API_KEY: string;

  // --- 构建与网络配置 ---
  // 用于 vite.config.ts 中的代理配置
  readonly VITE_API_TARGET: string;
  readonly VITE_API_TARGET_MOCK: string;

  // --- 注入变量 ---
  // 由 vite.config.ts define 注入
  readonly API_KEY: string;

  [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
