
import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { IconFeather } from './Icons';
import { User } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setPhone('');
      setCode('');
      setStep('phone');
      setError('');
    }
  }, [isOpen]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  if (!isOpen) return null;

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      setError('请输入手机号');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await authService.sendVerifyCode(phone);
      if (res.success) {
        setStep('code');
        setCountdown(60);
      } else {
        setError(res.message || '发送失败');
      }
    } catch (err) {
      setError('网络异常');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) {
      setError('请输入验证码');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await authService.loginWithCode(phone, code);
      if (res.success) {
        onLoginSuccess(res.data);
        onClose();
      } else {
        setError(res.message || '验证失败');
      }
    } catch (err) {
      setError('登录异常');
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
            <h2 className="text-2xl font-serif font-bold text-zen-brown">欢迎回到灵犀</h2>
            <p className="text-sm text-gray-500 mt-1">
              {step === 'phone' ? '使用手机号登录/注册' : '请输入短信验证码'}
            </p>
          </div>

          {step === 'phone' ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1 uppercase tracking-wider">手机号码</label>
                <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400 font-sans">+86</span>
                    <input 
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, ''))}
                    className="w-full pl-12 pr-4 py-2.5 bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zen-green/20 focus:border-zen-green transition-all font-sans tracking-wide"
                    placeholder="138 0000 0000"
                    maxLength={11}
                    autoFocus
                    />
                </div>
              </div>

              {error && <div className="text-red-500 text-xs text-center">{error}</div>}

              <button 
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg text-white font-medium shadow-lg transition-all active:scale-95 ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-zen-green hover:bg-zen-green/90'
                }`}
              >
                {loading ? '发送中...' : '获取验证码'}
              </button>
            </form>
          ) : (
             <form onSubmit={handleLogin} className="space-y-4">
               <div>
                <label className="block text-xs font-medium text-gray-600 mb-1 uppercase tracking-wider flex justify-between">
                    <span>验证码</span>
                    <span className="text-gray-400">已发送至 {phone}</span>
                </label>
                <div className="flex gap-2">
                    <input 
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/[^\d]/g, ''))}
                        className="flex-1 px-4 py-2.5 bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zen-green/20 focus:border-zen-green transition-all text-center tracking-[0.5em] font-bold text-lg"
                        placeholder="----"
                        maxLength={6}
                        autoFocus
                    />
                    <button 
                        type="button"
                        disabled={countdown > 0}
                        onClick={handleSendCode}
                        className={`px-4 py-2 text-xs rounded-lg border transition-colors ${
                            countdown > 0 
                                ? 'bg-gray-100 text-gray-400 border-transparent cursor-not-allowed' 
                                : 'bg-white text-zen-primary border-zen-primary hover:bg-zen-primary/5'
                        }`}
                    >
                        {countdown > 0 ? `${countdown}s` : '重发'}
                    </button>
                </div>
              </div>

              {error && <div className="text-red-500 text-xs text-center">{error}</div>}

              <button 
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg text-white font-medium shadow-lg transition-all active:scale-95 ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-zen-green hover:bg-zen-green/90'
                }`}
              >
                {loading ? '验证中...' : '立即登录'}
              </button>
              
              <button 
                type="button" 
                onClick={() => setStep('phone')}
                className="w-full text-xs text-gray-400 hover:text-zen-primary mt-2"
              >
                返回修改手机号
              </button>
             </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
