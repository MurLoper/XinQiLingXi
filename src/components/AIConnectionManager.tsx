
import React, { useState, useEffect } from 'react';
import { AIProviderInfo, UserAIConfig } from '../types';
import { apiService } from '../services/mockApi';
import { aiService } from '../services/aiService';
import APIKeyGuide from './APIKeyGuide';
import { IconCheck, IconCpu, IconArrowRight } from './Icons';

interface AIConnectionManagerProps {
    onClose: () => void;
}

const AIConnectionManager: React.FC<AIConnectionManagerProps> = ({ onClose }) => {
    const [providers, setProviders] = useState<AIProviderInfo[]>([]);
    const [userConfigs, setUserConfigs] = useState<UserAIConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProvider, setSelectedProvider] = useState<AIProviderInfo | null>(null);
    const [inputKey, setInputKey] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);

    // 加载提供商列表和用户配置
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const [providersRes, configsRes] = await Promise.all([
                apiService.getAIProviders(),
                apiService.getUserAIConfigs()
            ]);

            if (providersRes.success) setProviders(providersRes.data);
            if (configsRes.success) setUserConfigs(configsRes.data);
            
            setLoading(false);
        };
        loadData();
    }, []);

    const handleConnect = async () => {
        if (!selectedProvider || !inputKey.trim()) return;
        setIsConnecting(true);
        
        // 模拟连接延迟
        await new Promise(resolve => setTimeout(resolve, 800));

        const newConfig: UserAIConfig = {
            providerId: selectedProvider.id,
            apiKey: inputKey.trim(),
            isEnabled: true
        };

        const res = await apiService.saveUserAIConfig(newConfig);
        if (res.success) {
            // 更新本地状态
            const updatedConfigs = [...userConfigs.filter(c => c.providerId !== selectedProvider.id), newConfig];
            setUserConfigs(updatedConfigs);
            
            // 自动设为活跃模型
            aiService.setActiveProvider(selectedProvider.id);
            
            setSelectedProvider(null);
            setInputKey('');
        }
        setIsConnecting(false);
    };

    const handleSelectProvider = (provider: AIProviderInfo) => {
        const existing = userConfigs.find(c => c.providerId === provider.id);
        setSelectedProvider(provider);
        setInputKey(existing?.apiKey || '');
    };

    const handleSwitchActive = (providerId: string) => {
        aiService.setActiveProvider(providerId);
        // 强制刷新 UI (实际项目应使用 Context 或 State 管理)
        window.location.reload(); 
    };

    const activeProviderId = localStorage.getItem('active_ai_model') || 'gemini';

    const getProviderStyle = (id: string) => {
        switch(id) {
            case 'gemini': return 'bg-blue-100 text-blue-600';
            case 'kimi': return 'bg-purple-100 text-purple-600';
            case 'zhipu': return 'bg-orange-100 text-orange-600';
            case 'deepseek': return 'bg-blue-50 text-blue-800';
            case 'github': return 'bg-gray-800 text-white';
            case 'siliconflow': return 'bg-violet-100 text-violet-600';
            case 'qwen': return 'bg-orange-50 text-orange-700'; // 阿里橙
            case 'hunyuan': return 'bg-sky-100 text-sky-600'; // 腾讯蓝
            case 'spark': return 'bg-indigo-100 text-indigo-600'; // 讯飞蓝
            case 'cerebras': return 'bg-rose-100 text-rose-600';
            case 'huggingface': return 'bg-yellow-100 text-yellow-700';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    if (selectedProvider) {
        // --- 详情/连接界面 ---
        return (
            <div className="h-full flex flex-col bg-stone-50/50 animate-fade-in">
                <div className="flex items-center mb-4">
                    <button onClick={() => setSelectedProvider(null)} className="mr-2 p-1 hover:bg-stone-200 rounded-full">
                        <IconArrowRight className="w-4 h-4 rotate-180 text-gray-500" />
                    </button>
                    <h3 className="font-bold text-zen-brown flex items-center gap-2">
                        连接 {selectedProvider.name}
                    </h3>
                </div>

                <div className="flex-1 overflow-y-auto pr-1">
                    <p className="text-xs text-gray-500 mb-4">{selectedProvider.description}</p>
                    
                    <APIKeyGuide provider={selectedProvider} />

                    <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
                        <label className="block text-xs font-bold text-gray-600 mb-2">API Key / Access Token</label>
                        <input 
                            type="password"
                            value={inputKey}
                            onChange={(e) => setInputKey(e.target.value)}
                            placeholder={`sk-...`}
                            className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-zen-primary transition-colors mb-4 font-mono"
                        />
                        
                        <button 
                            onClick={handleConnect}
                            disabled={!inputKey.trim() || isConnecting}
                            className={`w-full py-2.5 rounded-lg text-white font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 ${
                                !inputKey.trim() || isConnecting 
                                ? 'bg-gray-300 cursor-not-allowed' 
                                : 'bg-zen-primary hover:bg-zen-primary/90'
                            }`}
                        >
                            {isConnecting ? (
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            ) : (
                                <IconCheck className="w-4 h-4" />
                            )}
                            {isConnecting ? '验证并连接...' : '确认连接'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- 列表界面 ---
    return (
        <div className="h-full flex flex-col bg-stone-50/50">
            <h4 className="font-bold text-zen-brown mb-4 text-sm flex items-center">
                <IconCpu className="w-4 h-4 mr-2" />
                AI 服务集成中心
            </h4>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {loading ? (
                    <div className="text-center py-8 text-gray-400 text-xs">加载中...</div>
                ) : providers.map(provider => {
                    const config = userConfigs.find(c => c.providerId === provider.id);
                    const isConnected = !!config?.apiKey;
                    const isActive = activeProviderId === provider.id;

                    return (
                        <div key={provider.id} className={`bg-white p-3 rounded-xl border transition-all relative overflow-hidden group ${isActive ? 'border-zen-primary ring-1 ring-zen-primary/20' : 'border-stone-200 hover:border-zen-primary/50'}`}>
                            {isActive && (
                                <div className="absolute top-0 right-0 bg-zen-primary text-white text-[9px] px-2 py-0.5 rounded-bl-lg">当前使用</div>
                            )}
                            
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${getProviderStyle(provider.id)}`}>
                                        {provider.icon}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-gray-800">{provider.name}</div>
                                        <div className="text-[10px] text-gray-400">{provider.supportsVision ? '支持视觉' : '仅文本'}</div>
                                    </div>
                                </div>
                                {isConnected ? (
                                    <button 
                                        onClick={() => handleSwitchActive(provider.id)}
                                        className={`text-xs px-3 py-1.5 rounded-full transition-colors border ${
                                            isActive 
                                                ? 'bg-zen-primary text-white border-transparent' 
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-zen-primary'
                                        }`}
                                    >
                                        {isActive ? '已启用' : '启用'}
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => handleSelectProvider(provider)}
                                        className="text-xs bg-black text-white px-3 py-1.5 rounded-full hover:bg-gray-800 transition-colors shadow-sm"
                                    >
                                        连接
                                    </button>
                                )}
                            </div>
                            
                            {isConnected && (
                                <div className="mt-2 flex justify-between items-center border-t border-stone-50 pt-2">
                                    <span className="text-[10px] text-green-600 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                        已配置
                                    </span>
                                    <button 
                                        onClick={() => handleSelectProvider(provider)}
                                        className="text-[10px] text-gray-400 hover:text-zen-primary"
                                    >
                                        重新配置
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
                <button 
                    onClick={onClose}
                    className="w-full bg-stone-100 hover:bg-stone-200 text-gray-600 py-2 rounded-lg text-sm font-bold transition-colors"
                >
                    完成
                </button>
            </div>
        </div>
    );
};

export default AIConnectionManager;
