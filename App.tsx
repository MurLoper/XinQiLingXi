
import React, { useState, useEffect, Suspense } from 'react';
import { Project, ApiResponse, ProjectCategory } from './types';
import { apiService } from './services/mockApi';
import { authService } from './services/authService';
import ProjectCard from './components/ProjectCard';
import LoginModal from './components/LoginModal';
import DevTailwindLoader from './components/DevTailwindLoader'; // Import the loader
import { SITE_CONFIG } from './constants';
import { IconFeather, IconHeart, IconCpu, IconSun } from './components/Icons';

// Lazy Load Tools to improve initial render performance
const WatermarkTool = React.lazy(() => import('./components/tools/WatermarkTool'));

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'app' | 'tool'>('all');
  const [currentView, setCurrentView] = useState<'home' | 'tool-watermark'>('home');
  
  // Admin State
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    // 1. Check existing session
    const hasSession = authService.checkSession();
    setIsAdmin(hasSession);

    // 2. Check URL parameters
    const params = new URLSearchParams(window.location.search);
    if (!hasSession && (params.get('admin') === 'true' || params.get('mode') === 'admin')) {
      setShowLoginModal(true);
    }

    // 3. Fetch data
    const fetchProjects = async () => {
      try {
        const response: ApiResponse<Project[]> = await apiService.getProjects();
        if (response.success) {
          setProjects(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch projects", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
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
    setActiveTab('all');
  };

  // Internal Navigation Handler
  const handleNavigate = (route: string) => {
    if (route === 'tool-watermark') {
        setCurrentView('tool-watermark');
        window.scrollTo(0, 0);
    }
  };

  // Filter Logic
  const filteredProjects = projects.filter(p => {
    if (!isAdmin && p.category === ProjectCategory.Backend) return false;
    if (activeTab === 'all') return true;
    if (activeTab === 'app') return p.category === ProjectCategory.App || p.category === ProjectCategory.Web;
    if (activeTab === 'tool') return p.category === ProjectCategory.Tool || p.category === ProjectCategory.AI || p.category === ProjectCategory.Backend;
    return true;
  });

  // Render Tool View if active
  if (currentView === 'tool-watermark') {
      return (
          <>
            <DevTailwindLoader />
            <Suspense fallback={
                <div className="flex items-center justify-center min-h-screen bg-[#f3f2ed]">
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zen-green mb-4"></div>
                        <p className="text-gray-500 font-serif">正在准备工具...</p>
                    </div>
                </div>
            }>
                <WatermarkTool onBack={() => setCurrentView('home')} />
            </Suspense>
          </>
      );
  }

  // Main Landing Page
  return (
    <div className="min-h-screen text-gray-800 relative selection:bg-zen-accent selection:text-white">
      {/* Inject Style Loader for Dev Environment */}
      <DevTailwindLoader />

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute inset-0 bg-[#f3f2ed]"></div>
         <img 
            src="https://picsum.photos/1920/1080?blur=4" 
            className="w-full h-full object-cover opacity-10 mix-blend-multiply" 
            alt="Background Texture"
         />
         <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-[#f3f2ed]/80 to-[#e6e5e0]/90"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col min-h-screen">
        
        {/* Navigation / Header */}
        <header className="py-8 flex justify-between items-center animate-fade-in-down">
          <div className="flex items-center space-x-2">
             <div className="w-10 h-10 bg-zen-green rounded-full flex items-center justify-center text-white shadow-lg">
               <IconFeather className="w-6 h-6" />
             </div>
             <div>
               <h1 className="text-2xl font-serif font-bold text-zen-brown tracking-wide flex items-center gap-2">
                 {SITE_CONFIG.title}
                 {isAdmin && <span className="text-[10px] px-2 py-0.5 bg-zen-accent text-white rounded-full font-sans tracking-normal">ADMIN</span>}
               </h1>
               <p className="text-xs text-zen-green uppercase tracking-widest">Heart Dwelling</p>
             </div>
          </div>
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-600">
            <a href="#projects" className="hover:text-zen-green transition-colors">项目展示</a>
            <a href="#about" className="hover:text-zen-green transition-colors">关于灵犀</a>
            {isAdmin ? (
               <button onClick={handleLogout} className="text-red-400 hover:text-red-600 transition-colors">退出管理</button>
            ) : (
               <a href="#contact" className="hover:text-zen-green transition-colors">联系我</a>
            )}
          </nav>
        </header>

        {/* Hero Section */}
        <section className="py-20 md:py-32 flex flex-col items-center text-center">
          <div className="mb-6 inline-flex items-center px-4 py-2 rounded-full bg-white/50 border border-white/60 backdrop-blur-sm shadow-sm">
            <IconSun className="w-4 h-4 text-amber-500 mr-2 animate-pulse" />
            <span className="text-sm text-gray-600">寻找心灵栖息之处</span>
          </div>
          
          <h2 className="text-5xl md:text-7xl font-serif font-bold text-zen-brown mb-8 leading-tight">
            临溪而居 <br />
            <span className="text-zen-green/80">运用AI如同灵犀</span>
          </h2>
          
          <p className="max-w-2xl text-lg md:text-xl text-gray-600 leading-relaxed mb-10">
            这里是我的数字花园。在这片安全温暖的角落，我用代码构建工具，用AI连接智慧，
            服务自己，也希望能温暖每一个偶然路过的你。
          </p>

          <div className="flex space-x-4">
            <a href="#projects" className="px-8 py-3 bg-zen-green text-white rounded-full font-medium shadow-lg shadow-zen-green/30 hover:bg-zen-green/90 hover:scale-105 transition-all duration-300">
              探索项目
            </a>
            <button className="px-8 py-3 bg-white text-zen-brown border border-zen-brown/20 rounded-full font-medium shadow-sm hover:bg-stone-50 transition-all duration-300">
              了解更多
            </button>
          </div>
        </section>

        {/* Highlight Stats / Values */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          {[
            { icon: IconHeart, title: '心晴日记', desc: '情感计算，温暖陪伴' },
            { icon: IconCpu, title: 'AI Agent', desc: '智能灵犀，懂你所想' },
            { icon: IconFeather, title: '纯粹工具', desc: '简而不减，隐私安全' }
          ].map((item, idx) => (
            <div key={idx} className="bg-white/40 backdrop-blur-sm p-6 rounded-2xl border border-white/60 text-center hover:bg-white/60 transition-colors">
              <item.icon className="w-8 h-8 mx-auto text-zen-accent mb-3" />
              <h3 className="font-bold text-zen-brown mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </section>

        {/* Projects Section */}
        <section id="projects" className="mb-32">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-serif font-bold text-zen-brown mb-2">精选项目</h2>
              <p className="text-gray-500">
                {isAdmin ? '探索您的全域数字生态 (管理模式)' : '探索我正在构建的数字生态'}
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 bg-stone-200/50 p-1 rounded-lg inline-flex">
              {(['all', 'app', 'tool'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === tab 
                      ? 'bg-white text-zen-green shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'all' ? '全部' : tab === 'app' ? '应用 & 平台' : '工具 & AI'}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zen-green"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project) => (
                <ProjectCard 
                    key={project.id} 
                    project={project} 
                    onNavigate={handleNavigate}
                />
              ))}
              {filteredProjects.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-400 italic">
                  暂无相关项目展示
                </div>
              )}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-auto py-8 border-t border-gray-200/50 text-center md:text-left flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <div className="mb-4 md:mb-0">
            <p className="font-serif text-gray-700 font-medium mb-1">{SITE_CONFIG.title}</p>
            <p>{SITE_CONFIG.footerText}</p>
          </div>
          <div className="flex space-x-6 items-center">
            <a href="#" className="hover:text-zen-green transition-colors">GitHub</a>
            {/* Hidden/Subtle trigger for Admin Modal */}
            {!isAdmin && (
              <button 
                onClick={() => setShowLoginModal(true)} 
                className="text-gray-300 hover:text-gray-400 text-xs transition-colors"
                title="管理员入口"
              >
                Admin
              </button>
            )}
            {isAdmin && <span className="text-zen-accent cursor-default">Admin Mode</span>}
          </div>
        </footer>
        
      </div>
    </div>
  );
}

export default App;
