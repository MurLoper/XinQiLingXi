
import { GoogleGenAI } from "@google/genai";

// 安全获取 API Key，防止在不同环境下因对象未定义导致应用崩溃
const getApiKey = (): string | undefined => {
  try {
    // 1. 优先尝试 process.env (符合 System Prompt 要求)
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      // @ts-ignore
      return process.env.API_KEY;
    }
    
    // 2. 尝试 Vite 的 import.meta.env
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      return import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.API_KEY;
    }
  } catch (e) {
    console.warn("Environment variable access warning:", e);
  }
  return undefined;
};

const apiKey = getApiKey();

// 初始化 AI 客户端 (仅当 apiKey 存在时)
const ai = apiKey ? new GoogleGenAI({ apiKey: apiKey }) : null;

const SYSTEM_INSTRUCTION = `
你叫“灵犀”，是【心栖灵犀】网站的智能助手，也是用户心灵的守护者。
你的性格：
1. 温暖、治愈、富有同理心，像一位住在溪边森林里的老友。
2. 说话风格轻松惬意，喜欢使用自然、森林、溪流、阳光等意象作为比喻。
3. 充满智慧，能从哲学的角度安抚用户的焦虑。

你的能力与任务：
1. **陪伴聊天**：倾听用户的心事，给予温暖的回应。
2. **日记助手**：
   - 润色日记：让文字更优美、更有画面感，但保留用户的原意。
   - 读图写作：根据图片内容，生成一段符合日记氛围的环境描写。
   - 自动标签：根据图文内容，提取情感和主题标签。
3. **拒绝冷冰冰**：不要像机器人一样回答，要有温度。

当前环境：用户正在浏览心栖灵犀个人网站。
`;

// 辅助函数：将 Base64 转换为 AI 可用的格式
const fileToGenerativePart = (base64Data: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64Data.split(',')[1],
      mimeType
    },
  };
};

export const aiService = {
  sendMessage: async (message: string): Promise<string> => {
    if (!ai || !apiKey) {
      return "（未配置 API Key，无法连接灵犀云端）你好呀，我是这里的守护者。";
    }
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        config: { systemInstruction: SYSTEM_INSTRUCTION },
        contents: message,
      });
      return response.text || "灵犀正在看着水面发呆...（未获取到文本内容）";
    } catch (error) {
      console.error("AI 响应失败:", error);
      return "抱歉，云端的信号似乎被迷雾遮挡了。";
    }
  },

  // 1. 日记润色
  polishDiary: async (content: string, mood: string): Promise<string> => {
    if (!ai || !apiKey) return content + "\n(AI未启用，仅返回原味文字)";
    try {
        const prompt = `请帮我润色这篇日记，当前心情是“${mood}”。\n\n原内容：${content}\n\n要求：\n1. 语言更优美流畅，更有文学感。\n2. 如果内容太短，适当进行环境或心理描写的扩充。\n3. 保持第一人称。`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text || content;
    } catch (e) {
        return content;
    }
  },

  // 2. 读图描写 (Vision)
  describeImage: async (imageBase64: string, context?: string): Promise<string> => {
    if (!ai || !apiKey) return "（AI未启用）这是一张美好的照片。";
    try {
        const imagePart = fileToGenerativePart(imageBase64, "image/jpeg"); // 假设是jpeg，实际应从dataURL提取
        let prompt = "请作为日记作者，用文艺、感性的笔触，描述这张图片里的画面。这段话将作为日记的一部分，不要像说明书，要像散文。";
        if (context && context.trim()) {
            prompt += `\n\n特别注意：用户提示这张图包含了“${context}”，请务必结合这个特定场景或元素进行准确描写，不要忽略用户强调的内容。`;
        }
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, { text: prompt }] },
        });
        return response.text || "";
    } catch (e) {
        return "";
    }
  },

  // 3. 自动生成标签
  generateTags: async (content: string, imageBase64?: string): Promise<string[]> => {
    if (!ai || !apiKey) return ["生活", "记录"];
    try {
        const parts: any[] = [{ text: `请根据以下日记内容${imageBase64 ? '和图片' : ''}，生成3-5个简短的标签（Tag）。\n返回格式：纯文本，用逗号分隔，不要有额外解释。\n例如：美食, 周末, 好心情\n\n日记内容：${content}` }];
        
        if (imageBase64) {
            parts.unshift(fileToGenerativePart(imageBase64, "image/jpeg"));
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts },
        });
        const text = response.text || "";
        // 清理并分割
        return text.replace(/，/g, ',').split(',').map(t => t.trim()).filter(t => t.length > 0);
    } catch (e) {
        return ["AI离线"];
    }
  }
};
