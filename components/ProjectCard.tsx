
import React from 'react';
import { Project, ProjectStatus } from '../types';
import { IconArrowRight, IconCheck } from './Icons';

interface ProjectCardProps {
  project: Project;
  onNavigate?: (route: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onNavigate }) => {
  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.Live: return 'bg-green-100 text-green-800 border-green-200';
      case ProjectStatus.Development: return 'bg-blue-100 text-blue-800 border-blue-200';
      case ProjectStatus.Planning: return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleLinkClick = (e: React.MouseEvent, link: any) => {
    if (link.type === 'internal' && link.internalRoute && onNavigate) {
        e.preventDefault();
        onNavigate(link.internalRoute);
    }
  };

  return (
    <div className="group relative bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Cover Image Area */}
      <div className="h-48 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity" />
        <img 
          src={project.coverImage} 
          alt={project.title} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute top-4 right-4 z-20">
          <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 z-20 text-white">
          <h3 className="text-2xl font-serif font-bold tracking-wide">{project.title}</h3>
          <p className="text-sm text-gray-200 opacity-90">{project.subtitle}</p>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6">
        <p className="text-gray-600 mb-6 leading-relaxed text-sm h-16 line-clamp-3">
          {project.description}
        </p>

        {/* Features List (if available) */}
        {project.features && project.features.length > 0 && (
          <div className="mb-6 bg-zen-bg/50 rounded-xl p-4">
            <h4 className="text-xs font-bold text-zen-brown mb-2 uppercase tracking-wider">核心功能</h4>
            <div className="grid grid-cols-1 gap-2">
              {project.features.slice(0, 3).map((feature, idx) => (
                <div key={idx} className="flex items-center text-xs text-gray-600">
                  <IconCheck className="w-3 h-3 mr-2 text-zen-green" />
                  <span>{feature.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {project.tags.map((tag, idx) => (
            <span key={idx} className="px-2 py-1 bg-stone-100 text-stone-600 text-xs rounded-md">
              #{tag}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-stone-100">
          <div className="flex space-x-4">
             {project.links.map((link, idx) => (
               <a 
                 key={idx} 
                 href={link.url}
                 onClick={(e) => handleLinkClick(e, link)}
                 className="text-sm font-medium text-zen-green hover:text-zen-accent transition-colors flex items-center cursor-pointer"
               >
                 {link.label}
                 <IconArrowRight className="w-4 h-4 ml-1" />
               </a>
             ))}
             {project.links.length === 0 && (
               <span className="text-sm text-gray-400 italic">暂无公开链接</span>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
