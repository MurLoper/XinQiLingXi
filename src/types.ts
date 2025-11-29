
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
  Backend = '后台服务'
}

export interface ProjectLink {
  label: string;
  url: string;
  type: 'demo' | 'github' | 'docs' | 'internal'; // Added internal for client-side routing
  internalRoute?: string; // Route ID
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
  gap: number; // Density/Spacing
  xOffset: number;
  yOffset: number;
  imageSrc?: string; // For image watermark
  imageScale: number;
}
