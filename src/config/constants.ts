
import { Project, ProjectCategory, ProjectStatus } from '../types';

// Mock Data representing the database
export const MOCK_PROJECTS: Project[] = [
  {
    id: 'mood-diary',
    title: '心晴日记',
    subtitle: '记录生活的点滴感动',
    description: '一款带有主题切换，记录日记，归纳图文集，标签，签到领积分等功能的全平台日记应用。在这里，你可以放下防备，真实地面对自己的内心。',
    category: ProjectCategory.App,
    status: ProjectStatus.Development,
    tags: ['React Native', 'Node.js', '跨平台', '情感计算'],
    coverImage: 'https://picsum.photos/800/600?grayscale', 
    links: [
      { label: '查看详情', url: '#', type: 'demo' },
      { label: 'H5预览', url: '#', type: 'demo' }
    ],
    features: [
      { name: '主题切换', description: '随心而动，不仅仅是颜色，更是心情的映射' },
      { name: '图文归纳', description: '智能整理你的记忆碎片，生成时光相册' },
      { name: '签到积分', description: '坚持记录，获取心灵积分，兑换专属徽章' },
      { name: '多端同步', description: 'Web、小程序、App数据无缝流转' }
    ]
  },
  {
    id: 'frontend-tools',
    title: '小工具集',
    subtitle: '便捷高效的纯前端工具箱',
    description: '集成多种纯前端处理的小工具，注重隐私保护，数据不上传服务器。包括图片加水印、格式转换、JSON格式化等实用功能。',
    category: ProjectCategory.Tool,
    status: ProjectStatus.Live,
    tags: ['React', 'Canvas', 'Privacy First'],
    coverImage: 'https://picsum.photos/800/601?blur=2',
    links: [
      { label: '立即使用', url: '#', type: 'internal', internalRoute: 'tool-watermark' }
    ],
    features: [
      { name: '图片水印', description: '本地处理，保护您的创作版权' },
      { name: 'GIF支持', description: '支持动图水印合成' }
    ]
  },
  {
    id: 'ai-agent',
    title: '灵犀 Agent',
    subtitle: '懂你的智能助手',
    description: '基于大模型的个人智能代理，能够访问项目数据，辅助管理后台，甚至陪你聊天解闷。它是"心栖灵犀"的灵魂所在。',
    category: ProjectCategory.AI,
    status: ProjectStatus.Planning,
    tags: ['LLM', 'LangChain', 'Automation'],
    coverImage: 'https://picsum.photos/800/602?blur=2',
    links: [],
    features: [
      { name: '智能访问', description: '自然语言查询项目状态' },
      { name: '自动运维', description: '辅助服务器管理与监控' }
    ]
  },
  {
    id: 'backend-admin',
    title: '管理中台',
    subtitle: '系统控制中心',
    description: '统一的后台服务器管理处，监控1panel + OpenResty 部署状态，管理API接口与数据权限。',
    category: ProjectCategory.Backend,
    status: ProjectStatus.Maintenance,
    tags: ['NestJS', 'Docker', '1panel'],
    coverImage: 'https://picsum.photos/800/603?blur=2',
    links: [],
  }
];

export const SITE_CONFIG = {
  title: '心栖灵犀',
  author: 'Developer',
  tagline: '临溪而居，安全温暖，轻松惬意',
  footerText: '© 2024 心栖灵犀 | Powered by React & AI'
};
