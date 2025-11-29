# 灵犀智能 (AI Agent) 接入指南

本文档将指导您如何将 Google Gemini API 接入到【心栖灵犀】网站，实现“灵犀”智能对话助手功能。

## 1. 准备工作

### 获取 API Key
1. 访问 [Google AI Studio](https://aistudio.google.com/)。
2. 登录您的 Google 账号。
3. 点击 **"Get API key"** 创建一个新的 API 密钥。
4. **复制**该密钥，稍后会用到。

## 2. 安装依赖

在您的项目根目录下，打开终端运行以下命令来安装官方 SDK：

```bash
npm install @google/genai
```

## 3. 代码实现 (Copy & Paste)

建议创建以下两个文件来实现 AI 功能。

### A. 创建 AI 服务文件
新建文件 `services/aiService.ts`，将以下代码复制进去。这段代码封装了与 Gemini 的通信，并设定了“灵犀”的人格。

```typescript
import { GoogleGenAI } from "@google/genai";

// 初始化 AI 客户端
// 注意：在生产环境中，建议通过后端转发 API 请求以隐藏 API_KEY，
// 或者在 1panel 环境变量中配置 VITE_GEMINI_API_KEY
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey });

const SYSTEM_INSTRUCTION = `
你叫“灵犀”，是【心栖灵犀】网站的智能助手。
你的性格：温暖、治愈、富有哲理，如同栖息在溪边的灵兽。
你的任务：
1. 陪伴用户聊天，安抚情绪。
2. 介绍本网站的项目（心晴日记、小工具集等）。
3. 语言风格：轻松惬意，喜欢使用自然、森林、溪流的比喻。
`;

export const aiService = {
  // 发送消息并获取回复
  sendMessage: async (message: string) => {
    if (!apiKey) {
      throw new Error("请先配置 API Key");
    }

    try {
      const model = ai.models.generateContent({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
        contents: message,
      });
      
      const response = await model;
      return response.text;
    } catch (error) {
      console.error("AI 响应失败:", error);
      return "抱歉，灵犀现在有点累，请稍后再试。";
    }
  }
};
```

### B. 创建聊天组件 (简单的 UI 示例)
您可以在 `components` 目录下新建 `ChatWidget.tsx`，并在 `App.tsx` 中引入。

```tsx
import React, { useState } from 'react';
import { aiService } from '../services/aiService';
import { IconFeather } from './Icons'; // 假设您有这个图标

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user'|'ai', text: string}[]>([
    { role: 'ai', text: '你好，我是灵犀。在这里，你可以放下疲惫，与我聊聊。' }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    const reply = await aiService.sendMessage(userMsg);
    
    setMessages(prev => [...prev, { role: 'ai', text: reply }]);
    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* 聊天窗口 */}
      {isOpen && (
        <div className="bg-white/90 backdrop-blur-lg border border-white/50 shadow-2xl rounded-2xl w-80 h-96 flex flex-col mb-4 overflow-hidden">
          <div className="bg-zen-green p-3 text-white font-medium flex justify-between items-center">
            <span>与灵犀对话</span>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">×</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-2 rounded-lg text-sm ${
                  m.role === 'user' ? 'bg-zen-green text-white' : 'bg-gray-100 text-gray-800'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && <div className="text-xs text-gray-400 italic">灵犀正在思考...</div>}
          </div>
          <div className="p-3 border-t border-gray-100 flex">
            <input 
              className="flex-1 bg-gray-50 rounded-l-md px-3 py-1 text-sm outline-none"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSend()}
              placeholder="说点什么..."
            />
            <button onClick={handleSend} className="bg-zen-green text-white px-3 py-1 rounded-r-md text-sm">发送</button>
          </div>
        </div>
      )}

      {/* 悬浮按钮 */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-zen-green text-white rounded-full shadow-lg flex items-center justify-center hover:bg-zen-green/90 transition-all hover:scale-110"
      >
        <IconFeather className="w-6 h-6" />
      </button>
    </div>
  );
};

export default ChatWidget;
```

## 4. 环境变量配置 (1panel + OpenResty)

为了让 AI 功能生效，需要配置 API Key。

### 方式 A：本地开发 (.env)
在项目根目录创建 `.env` 文件：
```env
VITE_GEMINI_API_KEY=你的_API_KEY_粘贴在这里
```

### 方式 B：生产环境 (1panel)
在代码构建（`npm run build`）**之前**，需要确保环境变量已注入。

如果您是在本地 Build 好再上传到 1panel：
1. 确保本地 `.env` 文件中有 Key。
2. 执行 `npm run build`。
3. 上传 `dist` 目录。

如果您是在服务器上使用 CI/CD 或 Docker 构建：
1. 需要在构建脚本中添加 `export VITE_GEMINI_API_KEY=xxx`。

**注意安全：**
由于本项目是纯前端项目，API Key 会暴露在浏览器端。
- **个人网站/演示**：可以直接使用上述方法，并在 Google AI Studio 设置 API Key 的 **API restrictions** (HTTP referrers) 限制为您的域名（如 `https://yoursite.com`），防止他人盗用。
- **严格生产环境**：建议在 1panel 中部署一个简单的 Node.js/Python 后端作为中转，前端只请求自己的后端，由后端去请求 Gemini。

## 5. 快速验证

1. 修改代码加入 ChatWidget。
2. 运行 `npm run dev`。
3. 点击右下角悬浮按钮，尝试发送：“你是谁？”
4. 如果回复了“我是灵犀...”，则接入成功！
