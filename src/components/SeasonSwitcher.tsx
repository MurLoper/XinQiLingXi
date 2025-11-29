
import React, { useState, useEffect, useRef } from 'react';
import { IconSun } from './Icons';

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

interface SeasonSwitcherProps {
  currentSeason: Season;
  onChange: (season: Season) => void;
  variant?: 'floating' | 'docked';
}

const SeasonSwitcher: React.FC<SeasonSwitcherProps> = ({ currentSeason, onChange, variant = 'floating' }) => {
  const [isExpanded, setIsExpanded] = useState(variant === 'floating');
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Drag logic for docked mode
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const [dragOffset, setDragOffset] = useState(0);

  useEffect(() => {
    setIsExpanded(variant === 'floating');
    setDragOffset(0);
  }, [variant]);

  const seasons: { id: Season; label: string; location: string; colorClass: string; textColor: string }[] = [
    { id: 'spring', label: '春生', location: '云南·和煦', colorClass: 'bg-teal-400', textColor: 'text-teal-600' },
    { id: 'summer', label: '夏长', location: '海南·缤纷', colorClass: 'bg-sky-500', textColor: 'text-sky-600' },
    { id: 'autumn', label: '秋收', location: '婺源·烟火', colorClass: 'bg-orange-600', textColor: 'text-orange-700' },
    { id: 'winter', label: '冬藏', location: '冰城·梦幻', colorClass: 'bg-indigo-400', textColor: 'text-indigo-600' },
  ];

  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
      if (variant !== 'docked') return;
      setIsDragging(true);
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      dragStartX.current = clientX;
      setDragOffset(0);
  };

  const handleDragMove = (e: React.TouchEvent | React.MouseEvent) => {
      if (!isDragging || variant !== 'docked') return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const delta = clientX - dragStartX.current;
      
      // Limit drag range
      // If expanded: can drag left (delta < 0)
      // If collapsed: can drag right (delta > 0)
      if (isExpanded) {
          if (delta < 0) setDragOffset(delta);
      } else {
          if (delta > 0) setDragOffset(delta);
      }
  };

  const handleDragEnd = (e: React.TouchEvent | React.MouseEvent) => {
      if (!isDragging || variant !== 'docked') return;
      setIsDragging(false);
      
      const threshold = 50; 
      
      if (isExpanded) {
          // If dragging left significantly, collapse
          if (dragOffset < -threshold) setIsExpanded(false);
      } else {
          // If dragging right significantly, expand
          if (dragOffset > threshold) setIsExpanded(true);
      }
      setDragOffset(0);
  };

  const handleToggle = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (variant === 'docked' && Math.abs(dragOffset) < 5) {
          setIsExpanded(!isExpanded);
      }
  };

  // Calculate transform style
  const getTransformStyle = () => {
      if (variant !== 'docked') return {};
      
      if (isDragging) {
          return { transform: isExpanded 
                ? `translateX(${dragOffset}px)` 
                : `translateX(calc(-100% + 2.8rem + ${dragOffset}px))` 
             };
      }
      return {}; 
  };

  return (
    <div 
        ref={containerRef}
        className={`fixed z-[60] flex items-center touch-none select-none
            ${variant === 'floating' 
                ? 'bottom-6 left-6 transition-all duration-500 ease-out' 
                : 'top-1/4 left-0' 
            }
            ${variant === 'docked' && !isDragging
                ? isExpanded ? 'transition-transform duration-500 ease-out translate-x-0' : 'transition-transform duration-500 ease-out -translate-x-[calc(100%-2.8rem)]' 
                : ''
            }
        `}
        style={getTransformStyle()}
        // Bind drag events to the whole container
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
    >
        <div className={`
            bg-white/95 backdrop-blur-md shadow-lg border border-white/50
            flex items-center overflow-hidden
            transition-all duration-500 ease-in-out
            ${variant === 'floating' 
                ? 'rounded-full p-2 px-3 animate-fade-in-up' 
                : 'rounded-r-2xl border-l-0 py-2 pr-1 shadow-2xl min-w-[200px] justify-between'
            }
        `}>
            {/* 1. Left Section: Season Buttons */}
            <div className={`flex gap-1.5 items-center transition-opacity duration-300 px-2
                ${variant === 'docked' && !isExpanded && !isDragging ? 'opacity-0 pointer-events-none' : 'opacity-100'}
            `}>
                
                {variant === 'floating' && (
                     <div className="flex items-center gap-2 px-2 mr-2 border-r border-gray-200/50 hidden md:flex">
                        <IconSun className="w-4 h-4 text-zen-accent" />
                        <span className="text-xs font-bold text-zen-brown whitespace-nowrap">时节切换</span>
                    </div>
                )}
                
                {seasons.map((s) => {
                    const isActive = currentSeason === s.id;
                    return (
                        <button
                            key={s.id}
                            onClick={(e) => { e.stopPropagation(); onChange(s.id); }}
                            className={`
                                relative group flex items-center justify-center
                                transition-all duration-300 flex-shrink-0
                                ${variant === 'floating' 
                                    ? 'h-8 px-3 rounded-full' 
                                    : 'w-8 h-8 rounded-full flex-col'
                                }
                                ${isActive 
                                    ? `${s.colorClass} text-white shadow-md scale-105 font-bold` 
                                    : 'hover:bg-stone-100 text-gray-500'
                                }
                            `}
                        >
                            <span className="text-xs font-serif z-10">{s.label}</span>
                            
                            {/* Full text for PC Floating mode */}
                            {variant === 'floating' && (
                                <span className={`hidden md:inline-block ml-1.5 text-[10px] ${isActive ? 'text-white/90' : 'text-gray-400'}`}>
                                    {s.location}
                                </span>
                            )}

                            {/* Tooltip for Docked */}
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                {s.location}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* 2. Right Section: Handle (Only for Docked mode) */}
            {variant === 'docked' && (
                <div 
                    onClick={handleToggle}
                    className="w-10 h-10 flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform bg-stone-50 rounded-r-xl border-l border-stone-100 relative z-10"
                    title="点击展开/收起，或左右拖拽"
                >
                    <IconSun className={`w-5 h-5 text-zen-accent transition-transform duration-500 ${isExpanded ? 'rotate-180' : 'animate-pulse-slow'}`} />
                    <span className="text-[9px] font-bold text-zen-brown/60 mt-0.5 scale-90">时节</span>
                </div>
            )}
        </div>
    </div>
  );
};

export default SeasonSwitcher;
