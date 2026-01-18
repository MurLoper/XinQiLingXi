
import React from 'react';
import { AIProviderInfo } from '../types';
import { IconArrowRight } from './Icons';

const APIKeyGuide: React.FC<{ provider: AIProviderInfo }> = ({ provider }) => {
  return (
    <div className="bg-stone-50 rounded-xl p-4 border border-stone-100 text-sm mb-4 animate-fade-in">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-bold text-zen-brown flex items-center">
            <span className="w-5 h-5 rounded-full bg-zen-primary text-white flex items-center justify-center text-xs mr-2">?</span>
            如何获取 {provider.name} API Key？
        </h4>
      </div>
      
      <div className="space-y-2 mb-4">
        {provider.guide.steps.map((step, index) => (
          <div key={index} className="flex gap-2 text-gray-600">
             <span className="text-zen-primary/60 font-mono">{index + 1}.</span>
             <span>{step}</span>
          </div>
        ))}
      </div>
      
      <div className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-stone-200">
        <div className="text-gray-500">
           <strong>Tips：</strong>{provider.guide.freeInfo}
        </div>
        <a 
            href={provider.website} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center text-zen-primary font-bold hover:underline"
        >
            去官网获取 <IconArrowRight className="w-3 h-3 ml-1" />
        </a>
      </div>
    </div>
  );
}

export default APIKeyGuide;
