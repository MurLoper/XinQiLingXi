
import { GoogleGenAI } from "@google/genai";
import { apiService } from "./mockApi";
import { AIProviderId } from "../types";

// 系统预设指令
const SYSTEM_INSTRUCTION = `
你叫“灵犀”，是【心栖灵犀】网站的智能助手，也是用户心灵的守护者。
你的性格：
1. 温暖、治愈、富有同理心，像一位住在溪边森林里的老友。
2. 说话风格轻松惬意，喜欢使用自然、森林、溪流、阳光等意象作为比喻。
3. 充满智慧，能从哲学的角度安抚用户的焦虑。

你的能力与任务：
1. **陪伴聊天**：倾听用户的心事，给予温暖的回应。
2. **拒绝冷冰冰**：不要像机器人一样回答，要有温度。
3. **格式**：可以使用 Markdown，但不要使用复杂的代码块，除非用户要求写代码。
`;

// 缓存 Provider 列表（避免频繁请求 Mock API）
let cachedProviders: any[] = [];
const loadProviders = async () => {
    if (cachedProviders.length === 0) {
        const res = await apiService.getAIProviders();
        if (res.success) cachedProviders = res.data;
    }
    return cachedProviders;
};

// 获取当前激活的配置
const getActiveConfig = async (): Promise<{ apiKey: string, baseUrl: string, modelId: string, providerId: string, supportsVision: boolean } | null> => {
    const activeId = (localStorage.getItem('active_ai_model') || 'gemini') as AIProviderId;
    
    // 1. 获取 Provider 基础信息
    const providers = await loadProviders();
    const providerInfo = providers.find(p => p.id === activeId);
    if (!providerInfo) return null;

    // 2. 获取用户配置 (Mock: 从 localStorage 读取模拟后端数据)
    const userConfigsRes = await apiService.getUserAIConfigs();
    const userConfig = userConfigsRes.data.find(c => c.providerId === activeId);

    // 3. 尝试获取 API Key (用户配置优先 -> 环境变量保底)
    let apiKey = userConfig?.apiKey;
    if (!apiKey) {
        // Fallback to env for development convenience
        if (activeId === 'gemini') apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        else if (activeId === 'deepseek') apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
        else if (activeId === 'kimi') apiKey = import.meta.env.VITE_KIMI_API_KEY; // Assuming you might add this
    }

    if (!apiKey) return null;

    return {
        apiKey,
        baseUrl: userConfig?.customBaseUrl || providerInfo.baseUrl,
        modelId: userConfig?.customModelId || providerInfo.modelId,
        providerId: activeId,
        supportsVision: providerInfo.supportsVision
    };
};

// --- API Callers ---

const callGemini = async (config: any, prompt: string, systemInstruction: string, imageBase64?: string) => {
  const ai = new GoogleGenAI({ apiKey: config.apiKey });
  
  let contents: any = prompt;
  if (imageBase64) {
      contents = {
          parts: [
              { inlineData: { data: imageBase64.split(',')[1], mimeType: "image/jpeg" } },
              { text: prompt }
          ]
      };
  }

  const response = await ai.models.generateContent({
    model: config.modelId,
    config: { systemInstruction },
    contents: contents,
  });
  return response.text;
};

const callOpenAICompatible = async (config: any, prompt: string, systemInstruction: string) => {
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.modelId,
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      stream: false
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `API Error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
};

// --- Service Export ---

export const aiService = {
  // 设置当前活跃模型
  setActiveProvider: (providerId: string) => {
    localStorage.setItem('active_ai_model', providerId);
  },

  getCurrentModelId: () => localStorage.getItem('active_ai_model') || 'gemini',

  // 核心：发送消息
  sendMessage: async (message: string): Promise<string> => {
    const config = await getActiveConfig();
    if (!config) return "请先在设置中连接 AI 服务并配置 API Key。";
    
    try {
      if (config.providerId === 'gemini') {
        return (await callGemini(config, message, SYSTEM_INSTRUCTION)) || "";
      } else {
        // DeepSeek, Kimi, Zhipu, etc. are mostly OpenAI compatible
        return (await callOpenAICompatible(config, message, SYSTEM_INSTRUCTION)) || "";
      }
    } catch (error: any) {
      console.error("AI 响应失败:", error);
      return `[连接中断] 无法连接到 ${config.providerId}。原因: ${error.message || '未知错误'}。请检查 API Key 是否有效。`;
    }
  },

  // 日记润色
  polishDiary: async (content: string, mood: string): Promise<string> => {
    const config = await getActiveConfig();
    if (!config) return content + "\n(未配置AI)";

    const prompt = `请帮我润色这篇日记，当前心情是“${mood}”。\n\n原内容：${content}\n\n要求：\n1. 语言更优美流畅，更有文学感。\n2. 如果内容太短，适当进行环境或心理描写的扩充。\n3. 保持第一人称。`;
    
    try {
        if (config.providerId === 'gemini') {
            return (await callGemini(config, prompt, "")) || content;
        } else {
            return (await callOpenAICompatible(config, prompt, "你是一个文学助手")) || content;
        }
    } catch (e) {
        return content + "\n(AI润色失败，已保留原文)";
    }
  },

  // 读图描写
  describeImage: async (imageBase64: string, context?: string): Promise<string> => {
    let config = await getActiveConfig();
    
    // 如果当前配置为空，或不支持 Vision，尝试回退到 Gemini (通常环境变量里有)
    if (!config || !config.supportsVision) {
        if (import.meta.env.VITE_GEMINI_API_KEY) {
             config = {
                 apiKey: import.meta.env.VITE_GEMINI_API_KEY,
                 baseUrl: "",
                 modelId: "gemini-2.5-flash",
                 providerId: "gemini",
                 supportsVision: true
             };
        } else {
            return "（当前模型不支持识图，且未配置 Gemini 备用）";
        }
    }

    try {
        let prompt = "请作为日记作者，用文艺、感性的笔触，描述这张图片里的画面。这段话将作为日记的一部分，不要像说明书，要像散文。";
        if (context && context.trim()) {
            prompt += `\n\n特别注意：用户提示这张图包含了“${context}”，请务必结合这个特定场景或元素进行准确描写。`;
        }

        if (config.providerId === 'gemini') {
            return (await callGemini(config, prompt, "", imageBase64)) || "";
        } else {
            // 这里可以扩展 OpenAI Vision 的支持 (gpt-4o) 或 Zhipu-GLM-4V
            if (config.providerId === 'zhipu') {
                // Zhipu 视觉调用逻辑略有不同，暂时回退
                return "（智谱AI视觉功能待适配）";
            }
            return "（该模型暂未适配视觉功能）";
        }
    } catch (e) {
        return "（识图请求失败）";
    }
  },

  // 自动生成标签
  generateTags: async (content: string, imageBase64?: string): Promise<string[]> => {
    let config = await getActiveConfig();
    if (!config) return ["未配置AI"];

    const useImage = imageBase64 && config.supportsVision;
    const prompt = `请根据以下日记内容${useImage ? '和图片' : ''}，生成3-5个简短的标签（Tag）。\n返回格式：纯文本，用逗号分隔，不要有额外解释。\n例如：美食, 周末, 好心情\n\n日记内容：${content}`;

    try {
        let text = "";
        if (config.providerId === 'gemini') {
            text = (await callGemini(config, prompt, "", useImage ? imageBase64 : undefined)) || "";
        } else {
            text = (await callOpenAICompatible(config, prompt, "")) || "";
        }
        return text.replace(/，/g, ',').split(',').map(t => t.trim()).filter(t => t.length > 0);
    } catch (e) {
        return ["AI离线"];
    }
  }
};
