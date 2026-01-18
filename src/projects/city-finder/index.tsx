
import React, { useState } from 'react';
import { IconArrowRight, IconMapPin, IconCheck, IconCar, IconHome, IconSearch, IconZap, IconUser } from '../../components/Icons';
import { apiService } from '../../services/mockApi';
import { RentalPreferences, RecommendedZone } from '../../types';
import { authService } from '../../services/authService';

const CityFinder: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [step, setStep] = useState<'input' | 'analyzing' | 'result'>('input');
  const [prefs, setPrefs] = useState<RentalPreferences>({
    targetLocation: '',
    budgetMax: 5000,
    commuteTimeMax: 45,
    transportType: 'subway',
    needs: {
      parking: false,
      school: false,
      gym: false,
      petFriendly: false,
      balcony: false
    },
    referralCode: ''
  });
  
  const [results, setResults] = useState<RecommendedZone[]>([]);
  const [referralStatus, setReferralStatus] = useState<{valid: boolean, msg: string} | null>(null);
  const currentUser = authService.getCurrentUser();

  const handleToggleNeed = (key: keyof typeof prefs.needs) => {
    setPrefs(p => ({
      ...p,
      needs: { ...p.needs, [key]: !p.needs[key] }
    }));
  };

  const handleVerifyReferral = async () => {
      if (!prefs.referralCode) return;
      const res = await apiService.verifyReferralCode(prefs.referralCode);
      if (res.success) {
          setReferralStatus({ valid: true, msg: `已关联推荐人：${res.data.referrer}，${res.data.bonus}` });
      } else {
          setReferralStatus({ valid: false, msg: '内推码无效' });
      }
  };

  const handleSubmit = async () => {
    if (!prefs.targetLocation) return alert('请输入目标位置');
    setStep('analyzing');
    
    try {
        const res = await apiService.submitLocationAnalysis(prefs);
        if (res.success) {
            setResults(res.data);
            setTimeout(() => setStep('result'), 1000); // 稍微展示下分析动画
        } else {
            alert('分析失败，请重试');
            setStep('input');
        }
    } catch (e) {
        setStep('input');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#f3f2ed] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="h-16 bg-white/80 backdrop-blur-md border-b border-stone-200 flex items-center px-6 justify-between z-20">
        <div className="flex items-center">
            <button onClick={onBack} className="mr-4 p-2 hover:bg-stone-100 rounded-full transition-colors text-gray-600">
                <IconArrowRight className="w-5 h-5 transform rotate-180" />
            </button>
            <h1 className="text-xl font-serif font-bold text-zen-brown flex items-center gap-2">
                <IconMapPin className="w-5 h-5 text-zen-primary" />
                <span>智居·城市罗盘</span>
            </h1>
        </div>
        <div className="flex items-center gap-3">
             <span className="text-xs text-gray-500 hidden sm:block">多源数据决策辅助系统</span>
             {currentUser && (
                 <div className="px-3 py-1 bg-zen-primary/10 text-zen-primary rounded-full text-xs font-bold">
                     {currentUser.nickname}
                 </div>
             )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center">
        
        {/* Step 1: Input Form */}
        {step === 'input' && (
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-stone-100 p-6 md:p-10 animate-fade-in-up">
                <div className="mb-8 text-center">
                    <h2 className="text-2xl font-serif font-bold text-gray-800 mb-2">定制您的居住方案</h2>
                    <p className="text-sm text-gray-500">结合通勤、预算与生活偏好，为您锁定最佳区域</p>
                </div>

                <div className="space-y-8">
                    {/* Location */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">目标位置 (工作/学校)</label>
                        <div className="relative">
                            <IconSearch className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input 
                                type="text" 
                                value={prefs.targetLocation}
                                onChange={e => setPrefs({...prefs, targetLocation: e.target.value})}
                                placeholder="输入地址或公司名称..."
                                className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-zen-primary/20 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Sliders */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                             <label className="block text-sm font-bold text-gray-700 mb-2 flex justify-between">
                                 <span>预算上限 (月租)</span>
                                 <span className="text-zen-primary">¥{prefs.budgetMax}</span>
                             </label>
                             <input 
                                type="range" min="1000" max="20000" step="100"
                                value={prefs.budgetMax}
                                onChange={e => setPrefs({...prefs, budgetMax: Number(e.target.value)})}
                                className="w-full accent-zen-primary h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer"
                             />
                        </div>
                        <div>
                             <label className="block text-sm font-bold text-gray-700 mb-2 flex justify-between">
                                 <span>最大通勤时长</span>
                                 <span className="text-zen-primary">{prefs.commuteTimeMax} 分钟</span>
                             </label>
                             <input 
                                type="range" min="10" max="120" step="5"
                                value={prefs.commuteTimeMax}
                                onChange={e => setPrefs({...prefs, commuteTimeMax: Number(e.target.value)})}
                                className="w-full accent-zen-primary h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer"
                             />
                        </div>
                    </div>

                    {/* Preferences */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">生活偏好 (多选)</label>
                        <div className="flex flex-wrap gap-3">
                            {[
                                { k: 'parking', l: '停车方便', i: IconCar },
                                { k: 'petFriendly', l: '宠物友好', i: IconHome }, // Icon placeholder
                                { k: 'gym', l: '靠近健身房', i: IconZap },
                                { k: 'school', l: '优质学区', i: IconCheck },
                                { k: 'balcony', l: '独立阳台', i: IconHome }
                            ].map((item) => (
                                <button
                                    key={item.k}
                                    onClick={() => handleToggleNeed(item.k as any)}
                                    className={`px-4 py-2 rounded-lg border text-sm flex items-center gap-2 transition-all ${
                                        prefs.needs[item.k as keyof typeof prefs.needs]
                                        ? 'bg-zen-primary/10 border-zen-primary text-zen-primary font-bold'
                                        : 'bg-white border-stone-200 text-gray-500 hover:border-zen-primary/30'
                                    }`}
                                >
                                    <item.i className="w-4 h-4" />
                                    {item.l}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Referral */}
                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                        <label className="block text-sm font-bold text-orange-800 mb-2 flex items-center gap-2">
                            <IconUser className="w-4 h-4" /> 
                            内部员工推荐通道
                        </label>
                        <div className="flex gap-2">
                            <input 
                                type="text"
                                value={prefs.referralCode}
                                onChange={e => setPrefs({...prefs, referralCode: e.target.value})}
                                placeholder="请输入内推码 (例如: LINGXI2024)"
                                className="flex-1 px-3 py-2 bg-white border border-orange-200 rounded-lg text-sm outline-none focus:border-orange-400"
                            />
                            <button 
                                onClick={handleVerifyReferral}
                                className="px-4 py-2 bg-orange-200 text-orange-800 text-sm font-bold rounded-lg hover:bg-orange-300"
                            >
                                验证
                            </button>
                        </div>
                        {referralStatus && (
                            <p className={`text-xs mt-2 ${referralStatus.valid ? 'text-green-600 font-bold' : 'text-red-500'}`}>
                                {referralStatus.msg}
                            </p>
                        )}
                    </div>

                    <button 
                        onClick={handleSubmit}
                        className="w-full py-4 bg-zen-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-zen-primary/30 hover:bg-zen-primary/90 hover:-translate-y-0.5 transition-all active:scale-95"
                    >
                        开始智能分析
                    </button>
                </div>
            </div>
        )}

        {/* Step 2: Analyzing */}
        {step === 'analyzing' && (
            <div className="flex flex-col items-center justify-center h-full">
                <div className="w-24 h-24 relative mb-6">
                    <div className="absolute inset-0 border-4 border-stone-200 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-zen-primary rounded-full border-t-transparent animate-spin"></div>
                    <IconMapPin className="absolute inset-0 m-auto w-8 h-8 text-zen-primary animate-bounce" />
                </div>
                <h3 className="text-xl font-serif font-bold text-gray-800 mb-2">正在拟合城市数据...</h3>
                <div className="text-sm text-gray-500 space-y-1 text-center">
                    <p>正在计算高峰期路况...</p>
                    <p>正在检索众包社区评价...</p>
                    <p>正在匹配房源价格...</p>
                </div>
            </div>
        )}

        {/* Step 3: Results */}
        {step === 'result' && (
            <div className="w-full max-w-4xl space-y-6 animate-fade-in-up">
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-serif font-bold text-zen-brown">分析报告</h2>
                        <p className="text-sm text-gray-500">基于您的偏好为您推荐了 {results.length} 个区域</p>
                    </div>
                    <button onClick={() => setStep('input')} className="text-sm text-zen-primary font-bold hover:underline">
                        修改条件
                    </button>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.map((zone, idx) => (
                        <div key={zone.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-stone-100 group relative">
                            {idx === 0 && (
                                <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg z-10">
                                    最佳推荐
                                </div>
                            )}
                            <div className="h-32 bg-stone-200 relative overflow-hidden">
                                <img src={`https://picsum.photos/400/200?random=${idx}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="zone" />
                                <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-zen-primary">
                                    匹配度 {zone.matchScore}%
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="text-lg font-bold text-gray-800 mb-1">{zone.name}</h3>
                                <div className="flex gap-4 text-sm text-gray-600 mb-3">
                                    <span className="flex items-center gap-1"><span className="text-xs text-gray-400">均租</span> ¥{zone.avgRent}</span>
                                    <span className="flex items-center gap-1"><span className="text-xs text-gray-400">通勤</span> {zone.commuteTime}min</span>
                                </div>
                                <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">
                                    {zone.description}
                                </p>
                                
                                <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 mb-4">
                                    <div className="text-[10px] text-amber-600 font-bold mb-1 flex items-center gap-1">
                                        <IconZap className="w-3 h-3" /> 众包数据
                                    </div>
                                    <p className="text-xs text-amber-800/80 italic">"{zone.crowdsourceData}"</p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {zone.tags.map(t => (
                                        <span key={t} className="px-2 py-1 bg-stone-100 text-gray-500 text-[10px] rounded">#{t}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                 </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default CityFinder;
