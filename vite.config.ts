
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // 获取配置的目标地址，提供默认值防止报错
  // VITE_API_TARGET: 真实后端地址 (例如: http://192.168.1.5:8080)
  const realApiTarget = env.VITE_API_TARGET || 'http://127.0.0.1:8080';
  
  // VITE_MOCK_TARGET: 本地 json-server 地址 (默认 3001)
  const mockApiTarget = env.VITE_API_TARGET_MOCK || 'http://127.0.0.1:3001';

  return {
    plugins: [react()],
    base: './', 
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 1880,
      strictPort: true,
      cors: true,
      proxy: {
        // --- 真实接口通道 ---
        // 前端请求 /api/user -> 代理到 realApiTarget/user
        '/api': {
          target: realApiTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('Proxy Error (Real API):', err);
            });
          }
        },
        
        // --- Mock 数据通道 ---
        // 前端请求 /mock-api/user -> 代理到 mockApiTarget/user
        '/mock-api': {
          target: mockApiTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/mock-api/, ''),
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('Proxy Error (Mock API):', err);
            });
          }
        }
      }
    },
    define: {
      'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || env.API_KEY),
      'process.env.NODE_ENV': JSON.stringify(mode)
    }
  }
})