
import { ApiResponse, User, UserRole } from '../types';

// 模拟存储验证码 (生产环境应在后端 Redis)
const verificationCodes = new Map<string, string>();

// 模拟用户数据库
const MOCK_USERS: Record<string, User> = {
  '13800138000': {
    id: 'u_admin',
    phone: '13800138000',
    nickname: '超级管理员',
    role: 'admin',
    points: 9999,
    badges: ['创世者']
  },
  '13900000001': {
    id: 'u_emp_01',
    phone: '13900000001',
    nickname: '灵犀员工A',
    role: 'employee',
    points: 500,
    badges: ['内部认证']
  }
};

export const authService = {
  // 1. 发送验证码
  sendVerifyCode: async (phone: string): Promise<ApiResponse<null>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 简单的手机号校验
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return { success: false, data: null, message: '请输入有效的11位手机号' };
    }

    // 模拟生成验证码 (固定为 8888 用于测试，或者随机)
    const code = '8888'; 
    verificationCodes.set(phone, code);
    
    console.log(`[Mock SMS] To ${phone}: 您的验证码是 ${code}`);

    return {
      success: true,
      data: null,
      message: '验证码已发送 (测试环境请查看控制台或输 8888)'
    };
  },

  // 2. 验证码登录
  loginWithCode: async (phone: string, code: string): Promise<ApiResponse<User>> => {
    await new Promise(resolve => setTimeout(resolve, 600));

    const savedCode = verificationCodes.get(phone);
    
    // 验证码校验
    if (code !== savedCode && code !== '8888') { // 保留万能码方便测试
      return { success: false, data: {} as User, message: '验证码错误' };
    }

    // 清除验证码
    verificationCodes.delete(phone);

    // 查找或注册用户
    let user = MOCK_USERS[phone];
    if (!user) {
      // 默认注册为普通用户
      user = {
        id: `u_${Date.now()}`,
        phone,
        nickname: `用户${phone.slice(-4)}`,
        role: 'user',
        points: 0,
        badges: []
      };
      // 在实际应用中这里会写入数据库
    }

    // 持久化 Session
    sessionStorage.setItem('auth_token', 'mock-token-' + user.id);
    sessionStorage.setItem('user_info', JSON.stringify(user));

    return {
      success: true,
      data: user,
      message: '登录成功'
    };
  },

  // 3. 获取当前用户信息
  getCurrentUser: (): User | null => {
    const userStr = sessionStorage.getItem('user_info');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  logout: () => {
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('user_info');
  },

  // 权限检查辅助函数
  hasPermission: (user: User | null, minRole?: UserRole): boolean => {
    if (!minRole) return true; // 无要求
    if (!user) return false; // 需要权限但未登录

    const levels: Record<UserRole, number> = {
      'guest': 0,
      'user': 1,
      'employee': 2,
      'admin': 3
    };

    return levels[user.role] >= levels[minRole];
  }
};
