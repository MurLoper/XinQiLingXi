
import { realAxios, mockAxios } from './axiosInstance';
import { Project, ApiResponse, RecommendedZone, RentalPreferences, ProjectStatus, ProjectCategory, AIProviderInfo, UserAIConfig } from '../types';

const MODULE_CONFIG: Record<string, 'real' | 'mock'> = {
  PROJECTS: 'real',      
  DIARY: 'real',         
  AUTH: 'real',
  CITY_ANALYSIS: 'real',
  AI_CONFIG: 'real' // 新增 AI 配置模块
};

const getClient = (moduleKey: string) => {
  const source = MODULE_CONFIG[moduleKey];
  return source === 'mock' ? mockAxios : realAxios;
};

// 模拟数据库中添加新项目 (实际应在 db.json)
const DYNAMIC_PROJECTS: Project[] = [
    {
      id: "city-finder",
      title: "智居·城市罗盘",
      subtitle: "多因子租房决策辅助系统",
      description: "不再盲目找房。结合您的预算、通勤需求、生活偏好（停车/宠物/学区），利用多源数据交叉分析，为您推荐性价比最高的居住区域。支持内部员工内推通道。",
      category: ProjectCategory.Analysis,
      status: ProjectStatus.Live,
      tags: ["大数据", "地理信息", "决策算法"],
      coverImage: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=1000&auto=format&fit=crop",
      links: [
        { label: "开始分析", url: "#", type: "internal", internalRoute: "project-city-finder" }
      ],
      features: [
          { name: "通勤计算", description: "高峰期路况拟合" },
          { name: "众包数据", description: "真实居住体验反馈" },
          { name: "内推福利", description: "员工认证享积分" }
      ],
      minRole: 'user', // 需要登录
      requiresLogin: true
    }
];

export const apiService = {
  // --- 项目模块 ---
  getProjects: async (): Promise<ApiResponse<Project[]>> => {
    const client = getClient('PROJECTS');
    try {
      const response = await client.get<Project[]>('/projects');
      const allProjects = [...DYNAMIC_PROJECTS, ...response.data.filter(p => p.id !== 'city-finder')];
      
      return {
        success: true,
        data: allProjects,
        message: 'Projects fetched successfully'
      };
    } catch (error) {
      return { success: true, data: DYNAMIC_PROJECTS, message: 'Fallback projects' };
    }
  },

  getProjectById: async (id: string): Promise<ApiResponse<Project | null>> => {
    const all = await apiService.getProjects();
    const found = all.data.find(p => p.id === id) || null;
    return { success: !!found, data: found };
  },

  // --- 日记模块 ---
  getDiaryEntries: async (): Promise<ApiResponse<any[]>> => {
    const client = getClient('DIARY');
    const isMock = MODULE_CONFIG['DIARY'] === 'mock';
    try {
      const query = isMock ? '?_sort=date&_order=desc' : '?sort=date,desc';
      const response = await client.get<any[]>(`/diary_entries${query}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, data: [], message: 'Failed to fetch entries' };
    }
  },

  saveDiaryEntry: async (entry: any): Promise<ApiResponse<any>> => {
    const client = getClient('DIARY');
    try {
      const response = await client.post('/diary_entries', entry);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, data: null };
    }
  },

  // --- AI 配置模块 ---
  getAIProviders: async (): Promise<ApiResponse<AIProviderInfo[]>> => {
      const client = getClient('AI_CONFIG');
      try {
          const response = await client.get<AIProviderInfo[]>('/ai_providers');
          return { success: true, data: response.data };
      } catch (e) {
          return { success: false, data: [], message: '无法获取AI提供商列表' };
      }
  },

  // 获取用户已保存的配置 (实际应由后端返回解密后的部分信息或掩码)
  // Mock模式下直接利用 localStorage 模拟 "云端同步"
  getUserAIConfigs: async (): Promise<ApiResponse<UserAIConfig[]>> => {
      const localData = localStorage.getItem('mock_user_ai_configs');
      const data = localData ? JSON.parse(localData) : [];
      return { success: true, data };
  },

  saveUserAIConfig: async (config: UserAIConfig): Promise<ApiResponse<boolean>> => {
      // 模拟保存到 "后端"
      const localData = localStorage.getItem('mock_user_ai_configs');
      let configs: UserAIConfig[] = localData ? JSON.parse(localData) : [];
      
      // 更新或添加
      const idx = configs.findIndex(c => c.providerId === config.providerId);
      if (idx >= 0) {
          configs[idx] = config;
      } else {
          configs.push(config);
      }
      
      localStorage.setItem('mock_user_ai_configs', JSON.stringify(configs));
      return { success: true, data: true, message: '配置已保存' };
  },

  // --- 城市分析模块 (Mock Logic) ---
  submitLocationAnalysis: async (prefs: RentalPreferences): Promise<ApiResponse<RecommendedZone[]>> => {
    await new Promise(resolve => setTimeout(resolve, 1500));

    const mockZones: RecommendedZone[] = [
        {
            id: 'z1',
            name: '云溪·科技园周边',
            matchScore: 96,
            avgRent: Math.floor(prefs.budgetMax * 0.8),
            commuteTime: Math.floor(prefs.commuteTimeMax * 0.5),
            tags: ['近地铁', '程序员多', '外卖丰富'],
            description: '位于科技园核心辐射区，虽然早晚高峰略拥堵，但骑行可达。周边有大型商超，生活极其便利。',
            crowdsourceData: '共有 128 位用户标记此处“停车方便”'
        },
        {
            id: 'z2',
            name: '清波·老城区改造区',
            matchScore: 88,
            avgRent: Math.floor(prefs.budgetMax * 0.6),
            commuteTime: Math.floor(prefs.commuteTimeMax * 0.9),
            tags: ['生活气息', '租金低', '有菜场'],
            description: '性价比之选。虽然房龄较老，但经过近期改造，环境宜人。适合喜欢安静生活且预算有限的朋友。',
            crowdsourceData: '社区氛围好，但晚间车位紧张'
        },
        {
            id: 'z3',
            name: '未来城·新区',
            matchScore: 75,
            avgRent: Math.floor(prefs.budgetMax * 0.95),
            commuteTime: Math.floor(prefs.commuteTimeMax * 0.7),
            tags: ['环境好', '电梯房', '宠物友好'],
            description: '全新开发的居住区，绿化率极高，非常适合养宠人士。但目前商业配套尚在完善中。',
            crowdsourceData: '非常适合遛狗，物业管理严格'
        }
    ];

    let results = mockZones;
    if (prefs.needs.parking) {
        results[0].matchScore += 2;
        results[1].matchScore -= 10;
    }

    return {
        success: true,
        data: results.sort((a, b) => b.matchScore - a.matchScore),
        message: '分析完成'
    };
  },
  
  verifyReferralCode: async (code: string): Promise<ApiResponse<{ referrer: string, bonus: string }>> => {
      await new Promise(resolve => setTimeout(resolve, 800));
      if (code === 'LINGXI2024') {
          return { success: true, data: { referrer: '灵犀员工A', bonus: '获得“城市探索者”徽章 + 100积分' } };
      }
      return { success: false, data: { referrer: '', bonus: '' }, message: '无效的内推码' };
  }
};
