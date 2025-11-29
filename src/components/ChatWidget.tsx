import React, { useState, useRef, useEffect } from 'react';
import { aiService } from '../services/aiService';
import { IconFeather, IconArrowRight } from './Icons';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: '你好，我是灵犀。在这里，你可以放下疲惫，与我聊聊。' }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    // 调用 AI 服务
    const reply = await aiService.sendMessage(userMsg);
    
    setMessages(prev => [...prev, { role: 'ai', text: reply }]);
    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* 聊天窗口 */}
      <div 
        className={`bg-white/90 backdrop-blur-xl border border-white/60 shadow-glass rounded-2xl w-[85vw] max-w-[360px] h-[500px] flex flex-col mb-4 overflow-hidden transition-all duration-300 origin-bottom-right ${
          isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-4 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-zen-primary to-zen-secondary p-4 text-white flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-1.5 rounded-full">
              <IconFeather className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm tracking-wide">灵犀智能</h3>
              <p className="text-[10px] opacity-80">心灵栖息处的守护者</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            className="text-white/70 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10"
          >
            ×
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/50">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
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

        {/* Input Area */}
        <div className="p-3 bg-white border-t border-stone-100 flex items-center gap-2">
          <input 
            ref={inputRef}
            className="flex-1 bg-stone-100 text-zen-brown rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-zen-primary/20 transition-all placeholder:text-gray-400"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
            placeholder="告诉灵犀你的想法..."
          />
          <button 
            onClick={handleSend} 
            disabled={!input.trim() || loading}
            className={`w-9 h-9 flex items-center justify-center rounded-full text-white shadow-md transition-all ${
              !input.trim() || loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-zen-primary hover:bg-zen-primary/90 hover:scale-105'
            }`}
          >
            <IconArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 悬浮按钮 */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-500 hover:scale-110 ${
            isOpen ? 'bg-stone-200 text-stone-500 rotate-90' : 'bg-gradient-to-br from-zen-primary to-zen-secondary text-white'
        }`}
      >
        {isOpen ? (
            <span className="text-2xl leading-none mb-1">×</span>
        ) : (
            <>
                <IconFeather className="w-7 h-7 animate-float" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full border-2 border-white animate-pulse"></span>
            </>
        )}
      </button>
    </div>
  );
};

export default ChatWidget;