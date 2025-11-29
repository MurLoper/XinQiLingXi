import React, { useState, useEffect } from 'react';
import { Project, ApiResponse, ProjectCategory } from './types';
import { apiService } from './services/mockApi';
import { authService } from './services/authService';
import ProjectCard from './components/ProjectCard';
import LoginModal from './components/LoginModal';
import { SITE_CONFIG } from './constants';
import { IconFeather, IconHeart, IconCpu, IconSun } from './components/Icons';

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'app' | 'tool'>('all');
  
  // Admin State
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    // 1. Check existing session
    const hasSession = authService.checkSession();
    setIsAdmin(hasSession);

    // 2. Check URL parameters for admin entry (e.g. ?admin=true or ?mode=admin)
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
    // Remove the query param from URL without refreshing to keep it clean
    const url = new URL(window.location.href);
    url.searchParams.delete('admin');
    url.searchParams.delete('mode');
    window.history.replaceState({}, '', url);
  };

  const handleLogout = () => {
    authService.logout();
    setIsAdmin(false);
    setActiveTab('all'); // Reset tab incase they were on a hidden one
  };

  // Filter Logic
  const filteredProjects = projects.filter(p => {
    // Security Rule: If not admin, hide Backend/Admin projects completely
    if (!isAdmin && p.category === ProjectCategory.Backend) return false;

    // Tab Filters
    if (activeTab === 'all') return true;
    if (activeTab === 'app') return p.category === ProjectCategory.App || p.category === ProjectCategory.Web;
    // 'tool' tab includes Tools, AI, and Backend (if admin)
    if (activeTab === 'tool') return p.category === ProjectCategory.Tool || p.category === ProjectCategory.AI || p.category === ProjectCategory.Backend;
    return true;
  });

  return (
    <div className="min-h-screen text-gray-800 relative selection:bg-zen-accent selection:text-white">
      
      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Background Ambience - Fixed */}
      <div className="fixed inset-0 z-0">
         {/* Base warm background */}
         <div className="absolute inset-0 bg-[#f3f2ed]"></div>
         {/* Nature Overlay Image (Stream/Forest vibe) */}
         <img 
            src="https://picsum.photos/1920/1080?blur=4" 
            className="w-full h-full object-cover opacity-10 mix-blend-multiply" 
            alt="Background Texture"
         />
         {/* Glass Overlay for content readability */}
         <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-[#f3f2ed]/80 to-[#e6e5e0]/90"></div>
      </div>

      {/* Main Content Container - Relative z-10 */}
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
            
            {/* Filter Tabs */}
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
                <ProjectCard key={project.id} project={project} />
              ))}
              {/* Fallback if admin hides everything or filtering leaves nothing */}
              {filteredProjects.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-400 italic">
                  暂无相关项目展示
                </div>
              )}
            </div>
          )}
        </section>

        {/* Admin/Technical Footer Section - Only show simplified version to public, full to admin */}
        <section className="bg-zen-brown text-stone-100 rounded-3xl p-8 md:p-12 mb-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-zen-accent/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-zen-green/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
            <div className="mb-8 md:mb-0 md:pr-10">
              <h2 className="text-2xl font-serif font-bold mb-4">技术架构与部署</h2>
              <p className="text-stone-300 leading-relaxed mb-6">
                本站采用 React + TypeScript 构建，注重高扩展性与模块化设计。
                未来将通过 1panel 面板与 OpenResty 进行容器化部署，确保服务的稳定性与安全性。
                {isAdmin && <span className="text-zen-accent block mt-2 font-bold">[管理员状态: Mock API 数据层已连接，后台服务监控中]</span>}
              </p>
              <div className="flex flex-wrap gap-3">
                {['React 18', 'TypeScript', 'Tailwind', 'OpenResty', 'Docker'].map((tech) => (
                  <span key={tech} className="px-3 py-1 bg-white/10 rounded-lg text-xs font-mono border border-white/10">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Server Status Widget - Only interactive for admin */}
            <div className="shrink-0 w-full md:w-auto">
               <div className={`bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/10 max-w-sm ${isAdmin ? 'border-zen-green/50 shadow-lg shadow-zen-green/20' : ''}`}>
                 <div className="flex items-center mb-4 border-b border-white/10 pb-4">
                   <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
                   <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
                   <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                 </div>
                 <div className="space-y-2 font-mono text-xs text-green-300">
                   <p><span className="text-purple-300">const</span> <span className="text-blue-300">system</span> = <span className="text-yellow-300">"Online"</span>;</p>
                   {isAdmin ? (
                     <>
                        <p className="text-zen-accent">> Admin Access Granted</p>
                        <p className="text-stone-300">> Monitoring logs...</p>
                     </>
                   ) : (
                     <p><span className="text-purple-300">await</span> deploy(<span className="text-yellow-300">"1panel"</span>);</p>
                   )}
                 </div>
               </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-auto py-8 border-t border-gray-200/50 text-center md:text-left flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <div className="mb-4 md:mb-0">
            <p className="font-serif text-gray-700 font-medium mb-1">{SITE_CONFIG.title}</p>
            <p>{SITE_CONFIG.footerText}</p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-zen-green transition-colors">GitHub</a>
            {/* Hidden admin trigger for testing: Triple click footer copyright area could go here, but using URL param as requested */}
            {isAdmin && <span className="text-zen-accent cursor-default">Admin Mode</span>}
          </div>
        </footer>
        
      </div>
    </div>
  );
}

export default App;