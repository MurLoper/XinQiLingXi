
import React, { useEffect } from 'react';

/**
 * DevTailwindLoader
 * 
 * 这是一个仅在开发/预览环境中使用的组件。
 * 它的作用是异步注入 Tailwind Play CDN 脚本，以便在没有构建步骤的环境中渲染样式。
 * 它解决了直接在 index.html 中引用 CDN 导致的页面阻塞/白屏问题。
 * 
 * 在生产环境中，应该通过构建工具 (Vite/Webpack + PostCSS) 处理 CSS，而不是使用此组件。
 */
const DevTailwindLoader: React.FC = () => {
  useEffect(() => {
    // 防止重复注入
    if (document.getElementById('tailwind-jit-script')) return;

    // 配置 Tailwind 主题
    // @ts-ignore
    window.tailwind = {
        config: {
            theme: {
                extend: {
                colors: {
                    'zen-stone': '#e6e5e0',
                    'zen-brown': '#5c554b',
                    'zen-green': '#4a5d4e',
                    'zen-accent': '#d4a373',
                    'zen-bg': '#f3f2ed',
                },
                fontFamily: {
                    sans: ['"Noto Sans SC"', 'sans-serif'],
                    serif: ['"Noto Serif SC"', 'serif'],
                },
                animation: {
                    'fade-in': 'fadeIn 0.5s ease-out',
                    'fade-in-up': 'fadeInUp 0.6s ease-out',
                    'fade-in-down': 'fadeInDown 0.6s ease-out',
                },
                keyframes: {
                    fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                    },
                    fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                    },
                    fadeInDown: {
                    '0%': { opacity: '0', transform: 'translateY(-20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                    }
                }
                }
            }
        }
    };

    // 动态创建脚本标签
    const script = document.createElement('script');
    script.id = 'tailwind-jit-script';
    script.src = 'https://cdn.tailwindcss.com';
    script.async = true; // 关键：异步加载，不阻塞页面显示
    
    script.onerror = () => {
        console.error('Tailwind CDN 加载失败。页面将显示为无样式状态。请检查网络连接。');
        // 可以选择在这里注入一个简单的备用 CSS
    };

    document.head.appendChild(script);

    return () => {
        // 通常不需要清理，因为样式是全局的
    };
  }, []);

  return null; // 此组件不渲染任何可见 UI
};

export default DevTailwindLoader;
