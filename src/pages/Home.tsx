
import React, { useState, useEffect } from 'react';
import { Project, ApiResponse, ProjectCategory } from '../types';
import { apiService } from '../services/mockApi';
import ProjectCard from '../components/ProjectCard';
import { SITE_CONFIG } from '../config/constants';
import { IconFeather, IconHeart, IconCpu, IconSun, IconMapPin } from '../components/Icons';
import { Season } from '../components/SeasonSwitcher';

interface HomePageProps {
  isAdmin: boolean;
  currentSeason?: Season; 
  onNavigate: (route: string) => void;
  onLoginClick: () => void;
  onLogoutClick: () => void;
}

const Home: React.FC<HomePageProps> = ({ isAdmin, currentSeason = 'spring', onNavigate, onLoginClick, onLogoutClick }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'app' | 'tool'>('all');

  const seasonInfo = {
    spring: { loc: '彩云之南', vibe: '和煦温柔', desc: '如风过耳海，如花开四季' },
    summer: { loc: '海南椰岛', vibe: '缤纷热烈', desc: '拥抱蔚蓝，向阳而生' },
    autumn: { loc: '婺源徽州', vibe: '人间烟火', desc: '晒秋暖阳，岁月静好' },
    winter: { loc: '北国冰城', vibe: '梦幻晶莹', desc: '冰雪奇缘，纯净之心' },
  };

  const currentInfo = seasonInfo[currentSeason];

  useEffect(() => {
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

  const filteredProjects = projects.filter(p => {
    if (!isAdmin && p.category === ProjectCategory.Backend) return false;
    if (activeTab === 'all') return true;
    if (activeTab === 'app') return p.category === ProjectCategory.App || p.category === ProjectCategory.Web;
    if (activeTab === 'tool') return p.category === ProjectCategory.Tool || p.category === ProjectCategory.AI || p.category === ProjectCategory.Backend;
    return true;
  });

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 flex flex-col min-h-screen font-sans text-zen-brown">
      <header className="py-6 md:py-10 flex justify-between items-center animate-fade-in-down sticky top-0 z-30 transition-all duration-300">
        <div className="absolute inset-x-0 top-0 h-full -z-10 mask-gradient-to-b border-b border-white/20 transition-colors duration-1000"
             style={{ backgroundColor: 'var(--zen-bg)', backdropFilter: 'blur(8px)' }}></div>
        
        <div className="flex items-center gap-3 group cursor-default">
           <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-zen-primary to-zen-secondary rounded-2xl flex items-center justify-center text-white shadow-soft group-hover:scale-105 transition-transform duration-500 group-hover:shadow-zen-primary/30">
             <IconFeather className="w-5 h-5 md:w-6 md:h-6" />
           </div>
           <div className="flex flex-col">
             <h1 className="text-xl md:text-2xl font-serif font-bold tracking-wide text-zen-brown flex items-center gap-2">
               {SITE_CONFIG.title}
               {isAdmin && <span className="text-[10px] px-2 py-0.5 bg-zen-accent text-white rounded-full font-sans tracking-normal uppercase">Admin</span>}
             </h1>
             <p className="text-[10px] md:text-xs text-zen-primary/90 uppercase tracking-[0.2em] font-medium">Heart Dwelling</p>
           </div>
        </div>
        <nav className="hidden md:flex items-center space-x-10 text-sm font-medium text-zen-brown">
          <a href="#projects" className="hover:text-zen-primary transition-colors relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-zen-primary after:left-0 after:-bottom-1 after:transition-all hover:after:w-full">项目展示</a>
          <a href="#about" className="hover:text-zen-primary transition-colors relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-zen-primary after:left-0 after:-bottom-1 after:transition-all hover:after:w-full">关于灵犀</a>
          {isAdmin ? (
             <button onClick={onLogoutClick} className="text-red-400 hover:text-red-600 transition-colors">退出</button>
          ) : (
             <button onClick={onLoginClick} className="hover:text-zen-primary transition-colors">登录</button>
          )}
        </nav>
      </header>

      <section className="py-20 md:py-32 flex flex-col items-center text-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-zen-primary/10 rounded-full blur-[100px] -z-10 pointer-events-none mix-blend-multiply transition-colors duration-1000"></div>

        <div className="mb-8 flex items-center gap-2 animate-fade-in-up">
            <div 
                className="inline-flex items-center px-4 py-1.5 rounded-full border border-white/60 backdrop-blur-md shadow-sm transition-colors group cursor-default"
                style={{ backgroundColor: 'var(--zen-bg)' }}
            >
                <IconSun className="w-4 h-4 text-zen-accent mr-2 animate-pulse-slow" />
                <span className="text-sm text-zen-brown font-medium tracking-wide">寻找心灵栖息之处</span>
            </div>
            <div className="hidden sm:inline-flex items-center px-4 py-1.5 rounded-full bg-zen-primary/10 border border-zen-primary/20 backdrop-blur-md text-zen-primary text-sm font-medium">
                <IconMapPin className="w-3 h-3 mr-1.5" />
                {currentInfo.loc} · {currentInfo.vibe}
            </div>
        </div>
        
        <h2 className="text-5xl md:text-7xl font-serif font-bold text-zen-brown mb-8 leading-tight animate-fade-in-up delay-100 drop-shadow-sm">
          <span className="block mb-2">临溪而居</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-zen-primary to-zen-secondary filter drop-shadow-sm pb-2">AI 如灵犀</span>
        </h2>
        
        <p className="max-w-2xl text-lg md:text-xl text-zen-brown/80 leading-relaxed mb-12 font-normal animate-fade-in-up delay-200">
          这里是我的数字花园，<span className="text-zen-accent font-medium">{currentInfo.desc}</span>。<br className="hidden md:block"/>
          用代码构建工具，用智慧连接灵犀，<br className="hidden md:block"/>
          只为在纷扰的世界中，服务自己，也温暖偶然路过的你。
        </p>

        <div className="flex flex-col sm:flex-row gap-5 animate-fade-in-up delay-300">
          <a 
            href="#projects" 
            className="px-10 py-4 bg-zen-primary text-white rounded-full font-bold tracking-wide shadow-lg hover:bg-zen-primary/90 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center"
            style={{ boxShadow: '0 10px 25px -5px rgba(var(--zen-shadow-rgb), 0.4)' }}
          >
            探索项目
          </a>
          <button 
             className="px-10 py-4 text-zen-brown border border-zen-stone backdrop-blur-sm rounded-full font-medium shadow-sm hover:border-zen-primary/30 transition-all duration-300"
             style={{ backgroundColor: 'var(--zen-bg)' }}
          >
            了解灵犀
          </button>
        </div>
      </section>

      <section id="about" className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32 px-2">
        {[
          { icon: IconHeart, title: '心晴日记', desc: '情感计算，温暖陪伴', delay: '0' },
          { icon: IconCpu, title: 'AI Agent', desc: '智能灵犀，懂你所想', delay: '100' },
          { icon: IconFeather, title: '纯粹工具', desc: '简而不减，隐私安全', delay: '200' }
        ].map((item, idx) => (
          <div 
            key={idx} 
            className="group relative backdrop-blur-md p-8 rounded-[2rem] border border-white/50 text-center hover:border-zen-primary/30 transition-all duration-500 hover:shadow-glass hover:-translate-y-2 animate-fade-in-up"
            style={{ animationDelay: `${item.delay}ms`, backgroundColor: 'var(--zen-bg)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            
            <div className="w-16 h-16 mx-auto bg-white/60 rounded-2xl flex items-center justify-center mb-6 text-zen-primary group-hover:scale-110 group-hover:bg-zen-primary group-hover:text-white transition-all duration-500 shadow-sm ring-1 ring-white/50">
                <item.icon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-serif font-bold text-zen-brown mb-3 group-hover:text-zen-primary transition-colors">{item.title}</h3>
            <p className="text-sm text-zen-brown/70 leading-relaxed group-hover:text-zen-brown/90">{item.desc}</p>
          </div>
        ))}
      </section>

      <section id="projects" className="mb-32 scroll-mt-24">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-zen-brown/10 pb-6">
          <div className="mb-6 md:mb-0">
            <h2 className="text-3xl font-serif font-bold text-zen-brown mb-3 flex items-center gap-3">
              <span className="w-1.5 h-8 bg-zen-accent rounded-full block shadow-sm"></span>
              精选项目
            </h2>
            <p className="text-zen-brown/60 pl-5">
              {isAdmin ? '全域数字生态管理' : '探索我构建的数字生态，感受技术的温度'}
            </p>
          </div>
          
          <div className="p-1.5 rounded-xl backdrop-blur-sm shadow-inner inline-flex" style={{ backgroundColor: 'var(--zen-bg)' }}>
            {(['all', 'app', 'tool'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeTab === tab 
                    ? 'bg-white text-zen-primary shadow-soft ring-1 ring-black/5' 
                    : 'text-zen-brown/50 hover:text-zen-brown/80 hover:bg-white/40'
                }`}
              >
                {tab === 'all' ? '全部' : tab === 'app' ? '应用' : '工具'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zen-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
            {filteredProjects.map((project) => (
              <ProjectCard 
                  key={project.id} 
                  project={project} 
                  onNavigate={onNavigate}
              />
            ))}
            {filteredProjects.length === 0 && (
              <div className="col-span-full py-20 text-center text-zen-brown/40 italic font-serif rounded-3xl border border-dashed border-zen-brown/10" style={{ backgroundColor: 'var(--zen-bg)' }}>
                暂无相关项目展示
              </div>
            )}
          </div>
        )}
      </section>

      <footer className="mt-auto py-12 border-t border-zen-brown/5 flex flex-col items-center text-center bg-zen-base/30">
        <div className="mb-6">
          <IconFeather className="w-8 h-8 text-zen-primary/40 mx-auto mb-4" />
          <p className="font-serif text-zen-brown/90 font-bold text-lg mb-2">{SITE_CONFIG.title}</p>
          <p className="text-zen-brown/60 text-sm max-w-md mx-auto">{SITE_CONFIG.tagline}</p>
        </div>
        <div className="text-xs text-zen-brown/50 space-y-2">
           <p>{SITE_CONFIG.footerText}</p>
           <div className="flex justify-center gap-4 mt-4">
             <a href="#" className="hover:text-zen-primary transition-colors">GitHub</a>
             <a href="#" className="hover:text-zen-primary transition-colors">Blog</a>
             {!isAdmin && (
                <button 
                  onClick={onLoginClick} 
                  className="hover:text-zen-primary transition-colors"
                >
                  Manage
                </button>
             )}
           </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
