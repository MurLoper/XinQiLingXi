import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { authService } from './services/authService';
import LoginModal from './components/LoginModal';
import SeasonSwitcher, { Season } from './components/SeasonSwitcher';
import ChatWidget from './components/ChatWidget';
import Home from './pages/Home'; 

// Lazy Load Tools
const WatermarkTool = React.lazy(() => import('./components/tools/WatermarkTool'));

// 🌍 背景图片配置：地域特色极致版
const SEASON_CONFIG: Record<Season, string> = {
  // 春（云南）：大理洱海，远山如黛，水面平静，樱花点缀
  spring: "https://images.unsplash.com/photo-1512608121467-7293169d3f19?q=80&w=2560&auto=format&fit=crop", 
  
  // 夏（海南）：三亚海棠湾，透亮的蓝天，碧绿的椰林，强烈的阳光
  summer: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2560&auto=format&fit=crop", 
  
  // 秋（婺源）：篁岭晒秋，古徽州建筑，屋顶的红辣椒与皇菊，暖色调
  autumn: "https://images.unsplash.com/photo-1604509747970-17918a245593?q=80&w=2560&auto=format&fit=crop", 
  
  // 冬（哈尔滨）：索菲亚大教堂或冰雪大世界，冷冽的冰蓝，梦幻的灯光
  winter: "https://images.unsplash.com/photo-1548266652-99cf27701ced?q=80&w=2560&auto=format&fit=crop", 
  
};

// 🎨 四季配色主题配置
const THEME_PALETTES: Record<Season, React.CSSProperties> = {
  spring: {
    '--zen-base': '#f0f5f3',       
    '--zen-bg': 'rgba(255, 255, 255, 0.75)', 
    '--zen-text': '#465c56',       
    '--zen-primary': '#569d84',    
    '--zen-secondary': '#a8d8c8',  
    '--zen-accent': '#e89da8',     
    '--zen-shadow-rgb': '86, 157, 132' 
  } as React.CSSProperties,
  summer: {
    '--zen-base': '#eef9ff',       
    '--zen-bg': 'rgba(240, 250, 255, 0.8)', 
    '--zen-text': '#0f4c75',       
    '--zen-primary': '#00a8cc',    
    '--zen-secondary': '#89ccf0',  
    '--zen-accent': '#ffaa4c',     
    '--zen-shadow-rgb': '0, 168, 204'
  } as React.CSSProperties,
  autumn: {
    '--zen-base': '#fff8f0',       
    '--zen-bg': 'rgba(255, 252, 245, 0.85)', 
    '--zen-text': '#5d4037',       
    '--zen-primary': '#d86c27',    
    '--zen-secondary': '#f2c078',  
    '--zen-accent': '#c62828',     
    '--zen-shadow-rgb': '216, 108, 39'
  } as React.CSSProperties,
  winter: {
    '--zen-base': '#f3f6fa',       
    '--zen-bg': 'rgba(255, 255, 255, 0.85)', 
    '--zen-text': '#2c3e50',       
    '--zen-primary': '#5d7599',    
    '--zen-secondary': '#a3c4dc',  
    '--zen-accent': '#8e44ad',     
    '--zen-shadow-rgb': '93, 117, 153'
  } as React.CSSProperties,
};

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'tool-watermark'>('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [currentSeason, setCurrentSeason] = useState<Season>('spring');

  useEffect(() => {
    const hasSession = authService.checkSession();
    setIsAdmin(hasSession);

    const params = new URLSearchParams(window.location.search);
    if (!hasSession && (params.get('admin') === 'true' || params.get('mode') === 'admin')) {
      setShowLoginModal(true);
    }

    const month = new Date().getMonth() + 1; 
    if (month >= 3 && month <= 5) setCurrentSeason('spring');
    else if (month >= 6 && month <= 8) setCurrentSeason('summer');
    else if (month >= 9 && month <= 11) setCurrentSeason('autumn');
    else setCurrentSeason('winter');
  }, []);

  const handleLoginSuccess = () => {
    setIsAdmin(true);
    const url = new URL(window.location.href);
    url.searchParams.delete('admin');
    url.searchParams.delete('mode');
    window.history.replaceState({}, '', url);
  };

  const handleLogout = () => {
    authService.logout();
    setIsAdmin(false);
  };

  const handleNavigate = (route: string) => {
    if (route === 'tool-watermark') {
        setCurrentView('tool-watermark');
        window.scrollTo(0, 0);
    } else {
        setCurrentView('home');
    }
  };

  const currentThemeStyles = useMemo(() => {
    return THEME_PALETTES[currentSeason];
  }, [currentSeason]);

  return (
    <div 
        className="min-h-screen text-zen-brown relative selection:bg-zen-primary selection:text-white font-sans transition-all duration-1000"
        style={currentThemeStyles}
    >
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        onLoginSuccess={handleLoginSuccess}
      />
      
      <SeasonSwitcher currentSeason={currentSeason} onChange={setCurrentSeason} />

      {/* 灵犀智能助手 */}
      <ChatWidget />

      {/* 沉浸式动态背景系统 */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-zen-base transition-colors duration-1000">
         <div className="absolute inset-0 w-full h-full">
             <img 
               key={currentSeason}
               src={SEASON_CONFIG[currentSeason]} 
               className="w-full h-full object-cover opacity-[0.25] mix-blend-multiply scale-105 animate-fade-in transition-all duration-1000" 
               alt={`Background - ${currentSeason}`}
             />
         </div>
         
         <div className={`absolute inset-0 bg-gradient-to-br mix-blend-soft-light transition-all duration-1000 ${
            currentSeason === 'winter' 
                ? 'from-blue-200/40 via-white/40 to-purple-200/30' 
                : currentSeason === 'summer'
                ? 'from-cyan-200/50 via-white/30 to-orange-200/30' 
                : currentSeason === 'autumn'
                ? 'from-orange-100/60 via-white/50 to-yellow-100/40' 
                : 'from-emerald-100/50 via-white/50 to-pink-100/30'   
         }`}></div>
         
         <div className="absolute inset-0 bg-gradient-to-t from-zen-base via-zen-base/80 to-transparent transition-colors duration-1000"></div>

         <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      </div>

      <div className="relative z-10 transition-opacity duration-500 ease-in-out">
        {currentView === 'tool-watermark' ? (
           <Suspense fallback={
              <div className="flex items-center justify-center min-h-screen relative z-10">
                  <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zen-green mb-4"></div>
                      <p className="text-zen-brown font-serif">正在准备工具...</p>
                  </div>
              </div>
           }>
              <WatermarkTool onBack={() => setCurrentView('home')} />
           </Suspense>
        ) : (
           <Home 
              isAdmin={isAdmin}
              currentSeason={currentSeason} 
              onNavigate={handleNavigate}
              onLoginClick={() => setShowLoginModal(true)}
              onLogoutClick={handleLogout}
           />
        )}
      </div>
    </div>
  );
}

export default App;