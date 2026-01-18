
import React, { useState, useRef, useEffect } from 'react';
import { apiService } from '../services/mockApi';
import { aiService } from '../services/aiService';
import { IconFeather, IconArrowRight, IconCpu } from './Icons';
import AIConnectionManager from './AIConnectionManager';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

interface ChatPanelProps {
  messages: Message[];
  loading: boolean;
  onSend: (text: string) => void;
  onClose: () => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, loading, onSend, onClose }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [input, setInput] = useState('');
  const [currentModelName, setCurrentModelName] = useState('Loading...');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    // 自动聚焦输入框
    setTimeout(() => inputRef.current?.focus(), 100);
    updateModelInfo();
  }, [messages, showSettings]);

  const updateModelInfo = async () => {
      const providersRes = await apiService.getAIProviders();
      if (providersRes.success) {
          const currentId = aiService.getCurrentModelId();
          const p = providersRes.data.find(p => p.id === currentId);
          setCurrentModelName(p ? p.name : 'Unknown AI');
      }
  };

  const handleSend = () => {
    if (!input.trim() || loading) return;
    onSend(input);
    setInput('');
  };

  return (
      <div className="flex flex-col h-full bg-white/90 backdrop-blur-xl rounded-2xl overflow-hidden shadow-glass border border-white/60 pointer-events-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-zen-primary to-zen-secondary p-4 text-white flex justify-between items-center shadow-sm flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-1.5 rounded-full">
              <IconFeather className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm tracking-wide">灵犀智能</h3>
              <p className="text-[10px] opacity-80 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  {currentModelName}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
                onClick={() => setShowSettings(!showSettings)} 
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${showSettings ? 'bg-white text-zen-primary' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                title="AI 服务连接"
            >
                <IconCpu className="w-4 h-4" />
            </button>
            <button 
                onClick={onClose} 
                className="text-white/70 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full active:bg-white/10"
            >
                ×
            </button>
          </div>
        </div>

        {/* Content Area */}
        {showSettings ? (
            <div className="flex-1 overflow-hidden p-4">
                <AIConnectionManager onClose={() => {
                    setShowSettings(false);
                    updateModelInfo();
                }} />
            </div>
        ) : (
            <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/50">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div 
                        className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                        m.role === 'user' 
                            ? 'bg-zen-primary text-white rounded-br-none' 
                            : 'bg-white text-zen-brown border border-stone-100 rounded-bl-none'
                        }`}
                    >
                        {m.text}
                    </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                    <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none border border-stone-100 shadow-sm flex gap-1 items-center">
                        <span className="w-1.5 h-1.5 bg-zen-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-1.5 h-1.5 bg-zen-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-1.5 h-1.5 bg-zen-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
                </div>

                <div className="p-3 bg-white border-t border-stone-100 flex items-center gap-2 flex-shrink-0">
                <input 
                    ref={inputRef}
                    className="flex-1 bg-stone-100 text-zen-brown rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-zen-primary/20 transition-all placeholder:text-gray-400"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleSend()}
                    placeholder={`发送给 ${currentModelName}...`}
                />
                <button 
                    onClick={handleSend} 
                    disabled={!input.trim() || loading}
                    className={`w-9 h-9 flex items-center justify-center rounded-full text-white shadow-md transition-all ${
                    !input.trim() || loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-zen-primary md:hover:bg-zen-primary/90 md:hover:scale-105 active:scale-95'
                    }`}
                >
                    <IconArrowRight className="w-4 h-4" />
                </button>
                </div>
            </>
        )}
      </div>
  );
};

export default ChatPanel;
