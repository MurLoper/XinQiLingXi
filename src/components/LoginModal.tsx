
import React, { useState } from 'react';
import { authService } from '../services/authService';
import { IconFeather } from './Icons';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authService.login(username, password);
      if (result.success) {
        sessionStorage.setItem('admin_token', result.data.token);
        onLoginSuccess();
        onClose();
      } else {
        setError(result.message || '认证失败');
      }
    } catch (err) {
      setError('系统繁忙，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-md bg-[#f3f2ed] rounded-2xl shadow-2xl overflow-hidden border border-white/50 animate-fade-in-up">
        <div className="absolute top-0 left-0 w-full h-1 bg-zen-green"></div>
        
        <div className="p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 bg-zen-green/10 text-zen-green rounded-full flex items-center justify-center mb-4">
              <IconFeather className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-zen-brown">灵犀·管理</h2>
            <p className="text-sm text-gray-500 mt-1">请输入密钥进入管理中台</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1 uppercase tracking-wider">账号</label>
              <input 
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zen-green/20 focus:border-zen-green transition-all"
                placeholder="Admin ID"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1 uppercase tracking-wider">密钥</label>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zen-green/20 focus:border-zen-green transition-all"
                placeholder="Password"
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 py-1 rounded">
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg text-white font-medium shadow-lg transition-all ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-zen-green hover:bg-zen-green/90 hover:scale-[1.02]'
              }`}
            >
              {loading ? '验证中...' : '进入空间'}
            </button>
          </form>
        </div>
        
        <div className="bg-stone-100 p-4 text-center">
          <button onClick={onClose} className="text-xs text-gray-500 hover:text-zen-brown">
            返回访客模式
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
