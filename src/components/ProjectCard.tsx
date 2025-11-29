
import React, { useState } from 'react';
import { Project, ProjectStatus } from '../types';
import { IconArrowRight, IconCheck } from './Icons';

interface ProjectCardProps {
  project: Project;
  onNavigate?: (route: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onNavigate }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.Live: return 'bg-emerald-100/80 text-emerald-700 border-emerald-200';
      case ProjectStatus.Development: return 'bg-amber-100/80 text-amber-700 border-amber-200';
      case ProjectStatus.Planning: return 'bg-slate-100/80 text-slate-600 border-slate-200';
      default: return 'bg-gray-100/80 text-gray-600 border-gray-200';
    }
  };

  const handleLinkClick = (e: React.MouseEvent, link: any) => {
    if (link.type === 'internal' && link.internalRoute && onNavigate) {
        e.preventDefault();
        onNavigate(link.internalRoute);
    }
  };

  return (
    <div 
      className={`group relative flex flex-col h-full rounded-[1.5rem] overflow-hidden transition-all duration-500 hover:-translate-y-2 border border-white/40 shadow-soft hover:shadow-glass hover:border-zen-primary/30`}
      style={{ backgroundColor: 'var(--zen-bg)', backdropFilter: 'blur(12px)' }}
    >
      <div className="h-52 overflow-hidden relative flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 opacity-70 group-hover:opacity-50 transition-opacity" />
        <img 
          src={project.coverImage} 
          alt={project.title} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out grayscale-[10%] group-hover:grayscale-0"
        />
        <div className="absolute top-4 right-4 z-20">
          <span className={`px-3 py-1 text-[10px] tracking-wider font-bold uppercase rounded-full border backdrop-blur-md shadow-sm ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
        </div>
        <div className="absolute bottom-5 left-6 z-20 text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
          <h3 className="text-xl font-serif font-bold tracking-wide mb-1 text-shadow-sm group-hover:text-zen-secondary transition-colors">{project.title}</h3>
          <p className="text-xs text-white/90 font-light tracking-wide">{project.subtitle}</p>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="mb-4 relative">
            <div 
                className={`text-zen-brown/80 text-sm leading-relaxed overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-96' : 'max-h-[4.5em]'}`}
                style={{ 
                    display: '-webkit-box',
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: isExpanded ? 'unset' : 3 
                }}
            >
                {project.description}
            </div>
            
            <button 
                onClick={(e) => { e.preventDefault(); setIsExpanded(!isExpanded); }}
                className="mt-1 text-xs font-bold text-zen-primary hover:text-zen-accent transition-colors focus:outline-none flex items-center"
            >
                {isExpanded ? '收起介绍' : '展开更多'}
                <IconArrowRight className={`w-3 h-3 ml-1 transform transition-transform duration-300 ${isExpanded ? '-rotate-90' : 'rotate-90'}`} />
            </button>
        </div>

        {project.features && project.features.length > 0 && (
          <div className="mb-6 bg-zen-green/5 rounded-xl p-4 border border-zen-green/10 group-hover:border-zen-primary/20 transition-colors">
            <h4 className="text-[10px] font-bold text-zen-brown/50 mb-3 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-zen-primary rounded-full"></span>
                核心亮点
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {project.features.slice(0, 3).map((feature, idx) => (
                <div key={idx} className="flex items-center text-xs text-zen-brown/80">
                  <IconCheck className="w-3 h-3 mr-2 text-zen-primary flex-shrink-0" />
                  <span className="truncate">{feature.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-6 mt-auto">
          {project.tags.map((tag, idx) => (
            <span key={idx} className="px-2.5 py-1 bg-white/50 border border-zen-stone text-zen-brown/70 text-[10px] rounded-md group-hover:border-zen-primary/30 transition-colors">
              #{tag}
            </span>
          ))}
        </div>

        <div className="pt-5 border-t border-zen-brown/10 flex items-center justify-between">
            <div className="flex space-x-5">
             {project.links.map((link, idx) => (
               <a 
                 key={idx} 
                 href={link.url}
                 onClick={(e) => handleLinkClick(e, link)}
                 className="group/link text-sm font-bold text-zen-primary hover:text-zen-accent transition-colors flex items-center cursor-pointer"
               >
                 <span className="relative">
                    {link.label}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-zen-accent transition-all duration-300 group-hover/link:w-full opacity-50"></span>
                 </span>
                 <IconArrowRight className="w-4 h-4 ml-1 transform group-hover/link:translate-x-1 transition-transform" />
               </a>
             ))}
             {project.links.length === 0 && (
               <span className="text-sm text-zen-brown/40 italic font-serif flex items-center">
                 <span className="w-1.5 h-1.5 bg-zen-stone rounded-full mr-2"></span>
                 Coming Soon
               </span>
             )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
