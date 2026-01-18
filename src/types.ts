
export enum ProjectStatus {
  Live = '已上线',
  Development = '开发中',
  Planning = '筹备中',
  Maintenance = '维护中'
}

export enum ProjectCategory {
  Web = 'Web应用',
  App = '移动端',
  Tool = '工具类',
  AI = 'AI智能',
  Backend = '后台服务',
  Analysis = '数据决策'
}

// 权限角色定义
export type UserRole = 'guest' | 'user' | 'employee' | 'admin';

export interface User {
  id: string;
  phone: string;
  nickname: string;
  role: UserRole;
  points: number;
  badges: string[];
  avatar?: string;
  referrerId?: string;
}

export interface ProjectLink {
  label: string;
  url: string;
  type: 'demo' | 'github' | 'docs' | 'internal'; 
  internalRoute?: string; 
}

export interface Feature {
  name: string;
  description: string;
  icon?: string;
}

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: ProjectCategory;
  status: ProjectStatus;
  tags: string[];
  coverImage: string;
  links: ProjectLink[];
  features?: Feature[];
  minRole?: UserRole;
  requiresLogin?: boolean;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Watermark Specific Types
export interface WatermarkConfig {
  type: 'text' | 'image';
  text: string;
  textColor: string;
  textSize: number;
  opacity: number;
  rotate: number;
  gap: number; 
  xOffset: number;
  yOffset: number;
  imageSrc?: string; 
  imageScale: number;
}

// --- City Finder Types ---
export interface RentalPreferences {
  targetLocation: string;
  budgetMax: number;
  commuteTimeMax: number;
  transportType: 'subway' | 'driving' | 'mix';
  needs: {
    parking: boolean;
    school: boolean;
    gym: boolean;
    petFriendly: boolean;
    balcony: boolean;
  };
  referralCode?: string;
}

export interface RecommendedZone {
  id: string;
  name: string;
  matchScore: number;
  avgRent: number;
  commuteTime: number;
  tags: string[];
  description: string;
  crowdsourceData: string;
}

// --- AI Model Types ---
export type AIProviderId = 
  | 'gemini' 
  | 'deepseek' 
  | 'kimi' 
  | 'zhipu' 
  | 'spark' 
  | 'doubao' 
  | 'openai'
  | 'github'
  | 'cerebras'
  | 'huggingface'
  | 'siliconflow'
  | 'qwen'
  | 'hunyuan'
  | 'azure'
  | 'anthropic';

export interface AIProviderInfo {
  id: AIProviderId;
  name: string;
  icon: string; // 简单的图标标识，如 'G', 'K', 'Z'
  description: string;
  baseUrl?: string; // 默认 BaseURL
  modelId: string; // 默认 Model ID
  website: string; // 官网链接
  guide: {
    steps: string[];
    freeInfo: string;
  };
  supportsVision: boolean;
}

export interface UserAIConfig {
  providerId: AIProviderId;
  apiKey: string; // 实际场景中后端应加密存储，前端仅在保存时发送
  isEnabled: boolean;
  customBaseUrl?: string;
  customModelId?: string;
}
