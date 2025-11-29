
import React from 'react';
import { IconSun } from './Icons';

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

interface SeasonSwitcherProps {
  currentSeason: Season;
  onChange: (season: Season) => void;
}

const SeasonSwitcher: React.FC<SeasonSwitcherProps> = ({ currentSeason, onChange }) => {
  const seasons: { id: Season; label: string; location: string; colorClass: string }[] = [
    { id: 'spring', label: '春生', location: '云南·和煦', colorClass: 'bg-teal-400' },
    { id: 'summer', label: '夏长', location: '海南·缤纷', colorClass: 'bg-sky-500' },
    { id: 'autumn', label: '秋收', location: '婺源·烟火', colorClass: 'bg-orange-600' },
    { id: 'winter', label: '冬藏', location: '冰城·梦幻', colorClass: 'bg-indigo-400' },
  ];

  return (
    <div className="fixed bottom-6 left-6 z-40 bg-white/80 backdrop-blur-md border border-white/60 shadow-lg rounded-full p-1.5 flex items-center gap-1 animate-fade-in-up">
      <div className="pl-3 pr-2 flex flex-col justify-center text-xs text-zen-brown/70 font-serif border-r border-gray-200 mr-1 h-8">
        <span className="font-bold flex items-center"><IconSun className="w-3 h-3 mr-1 text-zen-accent" />时节</span>
      </div>
      {seasons.map((s) => (
        <button
          key={s.id}
          onClick={() => onChange(s.id)}
          className={`group relative px-4 py-1.5 rounded-full transition-all duration-500 overflow-hidden flex flex-col items-center justify-center min-w-[70px] ${
            currentSeason === s.id 
              ? 'text-white shadow-md' 
              : 'text-gray-500 hover:bg-stone-100'
          }`}
        >
          {currentSeason === s.id && (
             <div className={`absolute inset-0 ${s.colorClass} opacity-100 -z-10`}></div>
          )}
          
          <span className={`text-xs font-medium leading-none mb-0.5 ${currentSeason === s.id ? 'opacity-100' : 'opacity-80'}`}>
            {s.label}
          </span>
          <span className={`text-[9px] leading-none transform transition-all duration-300 ${currentSeason === s.id ? 'opacity-90 translate-y-0' : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 scale-90'}`}>
            {s.location}
          </span>
        </button>
      ))}
    </div>
  );
};

export default SeasonSwitcher;
