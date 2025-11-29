import { ApiResponse } from '../types';

// 模拟管理员凭证 (实际项目中应在后端验证)
const MOCK_ADMIN_USER = 'admin';
const MOCK_ADMIN_PASS = 'lingxi2024'; 

export const authService = {
  login: async (username: string, password: string): Promise<ApiResponse<{ token: string }>> => {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 600));

    if (username === MOCK_ADMIN_USER && password === MOCK_ADMIN_PASS) {
      return {
        success: true,
        data: { token: 'mock-admin-token-' + Date.now() },
        message: '登录成功，欢迎回到灵犀空间'
      };
    }

    return {
      success: false,
      data: { token: '' },
      message: '账号或密码错误，请确认您是灵犀的主人'
    };
  },

  checkSession: (): boolean => {
    return !!sessionStorage.getItem('admin_token');
  },

  logout: () => {
    sessionStorage.removeItem('admin_token');
  }
};