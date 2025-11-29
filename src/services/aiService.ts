import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

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
2. **网站导航**：
   - 如果用户问起“日记”或“记录”，介绍【心晴日记】项目（支持主题切换、图文归纳、签到积分）。
   - 如果用户问起“工具”或“水印”，介绍【小工具集】（纯前端处理，安全隐私）。
   - 如果用户问起“你是谁”，做自我介绍。
3. **拒绝冷冰冰**：不要像机器人一样回答，要有温度。

当前环境：用户正在浏览心栖灵犀个人网站。
`;

// 模拟回复数据，用于未配置 API Key 时
const MOCK_RESPONSES = [
  "风里已经有了春天的味道，你也闻到了吗？（请配置 API Key 以解锁完全的灵犀智能）",
  "坐下来喝杯茶吧，这里很安全。有什么心事可以慢慢对我说。（请在 .env 中配置 VITE_GEMINI_API_KEY）",
  "看着流水潺潺，心也会慢慢平静下来。你今天过得怎么样？",
  "心晴日记是个好地方，可以把烦恼都丢进去，换回好心情。",
  "我是灵犀，这里的守护者。虽然我现在还连不上云端的大脑（缺少 API Key），但我依然愿意陪着你。"
];

export const aiService = {
  sendMessage: async (message: string): Promise<string> => {
    // 1. 如果没有 API Key，返回模拟数据，保证网站不报错
    if (!ai || !apiKey) {
      console.warn("未检测到 VITE_GEMINI_API_KEY，使用模拟回复。");
      await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟网络延迟
      return MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
    }

    // 2. 调用 Gemini API
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
        contents: message,
      });
      
      return response.text || "灵犀正在看着水面发呆...（未获取到文本内容）";
    } catch (error) {
      console.error("AI 响应失败:", error);
      return "抱歉，云端的信号似乎被迷雾遮挡了，灵犀现在听不太清。请稍后再试。";
    }
  }
};