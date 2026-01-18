
import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { authService } from './services/authService';
import LoginModal from './components/LoginModal';
import SeasonSwitcher, { Season } from './components/SeasonSwitcher';
import ChatWidget from './components/ChatWidget';
import Home from './pages/Home'; 
import { User } from './types';

// Lazy Load Tools & Projects
const WatermarkTool = React.lazy(() => import('./components/tools/WatermarkTool'));
const MoodDiary = React.lazy(() => import('./projects/mood-diary'));
const CityFinder = React.lazy(() => import('./projects/city-finder'));

// 🌍 背景图片配置：地域特色极致版
// 注意：图片放置在 public/assets/imgs/ 目录下
const SEASON_CONFIG: Record<Season, string> = {
  // 春（云南）：大理洱海，远山如黛，水面平静，樱花点缀
  spring: "/assets/imgs/spring.jpg", 
  
  // 夏（海南）：三亚海棠湾，透亮的蓝天，碧绿的椰林，强烈的阳光
  // (建议也下载到本地: public/assets/imgs/summer.jpg)
  summer: "/assets/imgs/summer.jpg", 
  
  // 秋（婺源）：篁岭晒秋，古徽州建筑，屋顶的红辣椒与皇菊，暖色调
  autumn: "/assets/imgs/autumn.jpg", 
  
  // 冬（哈尔滨）：索菲亚大教堂或冰雪大世界，冷冽的冰蓝，梦幻的灯光
  // (建议也下载到本地: public/assets/imgs/winter.jpg)
  winter: "/assets/imgs/winter.jpg", 
  
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

type ViewState = 'home' | 'tool-watermark' | 'project-mood-diary' | 'project-city-finder';

function App() {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [user, setUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [currentSeason, setCurrentSeason] = useState<Season>('spring');

  useEffect(() => {
    // Check session
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

    const month = new Date().getMonth() + 1; 
    if (month >= 3 && month <= 5) setCurrentSeason('spring');
    else if (month >= 6 && month <= 8) setCurrentSeason('summer');
    else if (month >= 9 && month <= 11) setCurrentSeason('autumn');
    else setCurrentSeason('winter');
  }, []);

  const handleLoginSuccess = (u: User) => {
    setUser(u);
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setCurrentView('home'); // Reset view on logout
  };

  const handleNavigate = (route: string) => {
    // 简单的路由映射
    if (route === 'tool-watermark') setCurrentView('tool-watermark');
    else if (route === 'project-mood-diary') setCurrentView('project-mood-diary');
    else if (route === 'project-city-finder') setCurrentView('project-city-finder');
    else setCurrentView('home');
    
    window.scrollTo(0, 0);
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
      
      <SeasonSwitcher 
        currentSeason={currentSeason} 
        onChange={setCurrentSeason} 
        variant={currentView === 'home' ? 'floating' : 'docked'}
      />

      <ChatWidget />

      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-zen-base transition-colors duration-1000">
         <div className="absolute inset-0 w-full h-full">
             <img 
               key={currentSeason}
               src={SEASON_CONFIG[currentSeason]} 
               className="w-full h-full object-cover opacity-[0.25] mix-blend-multiply scale-105 animate-fade-in transition-all duration-1000" 
               alt={`Background - ${currentSeason}`}
               onError={(e) => { e.currentTarget.style.display = 'none'; }}
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
        {currentView !== 'home' ? (
           <Suspense fallback={
              <div className="flex items-center justify-center min-h-screen relative z-10">
                  <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zen-primary mb-4"></div>
                      <p className="text-zen-brown font-serif">正在加载模块...</p>
                  </div>
              </div>
           }>
              {currentView === 'tool-watermark' && <WatermarkTool onBack={() => setCurrentView('home')} />}
              {currentView === 'project-mood-diary' && <MoodDiary onBack={() => setCurrentView('home')} />}
              {currentView === 'project-city-finder' && <CityFinder onBack={() => setCurrentView('home')} />}
           </Suspense>
        ) : (
           <Home 
              user={user}
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
