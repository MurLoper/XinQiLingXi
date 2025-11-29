
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

  // Dragging State
  // Default position: Bottom-Right
  const [position, setPosition] = useState({ right: 24, bottom: 24 });
  const [isDraggingState, setIsDraggingState] = useState(false);
  const dragRef = useRef({ 
    startX: 0, 
    startY: 0, 
    startRight: 0, 
    startBottom: 0, 
    hasMoved: false 
  });

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

    const reply = await aiService.sendMessage(userMsg);
    
    setMessages(prev => [...prev, { role: 'ai', text: reply }]);
    setLoading(false);
  };

  // --- Drag Handling with Boundary Collision ---
  const handleDragStart = (clientX: number, clientY: number) => {
    dragRef.current = {
      startX: clientX,
      startY: clientY,
      startRight: position.right,
      startBottom: position.bottom,
      hasMoved: false
    };
    setIsDraggingState(true);
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    const deltaX = dragRef.current.startX - clientX; // Drag left (smaller X) -> Increase Right
    const deltaY = dragRef.current.startY - clientY; // Drag up (smaller Y) -> Increase Bottom
    
    // Threshold to consider it a move (prevent accidental micro-drags on click)
    if (!dragRef.current.hasMoved && (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3)) {
      dragRef.current.hasMoved = true;
    }

    if (dragRef.current.hasMoved) {
      let newRight = dragRef.current.startRight + deltaX;
      let newBottom = dragRef.current.startBottom + deltaY;

      // --- Boundary Collision Detection ---
      const BUTTON_SIZE = 56; // w-14 = 3.5rem = 56px
      const MARGIN = 10; // Minimum distance from edge
      
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      // Clamp Right: 
      // Minimum right is MARGIN (touching right edge)
      // Maximum right is windowWidth - BUTTON_SIZE - MARGIN (touching left edge)
      const maxRight = windowWidth - BUTTON_SIZE - MARGIN;
      newRight = Math.max(MARGIN, Math.min(newRight, maxRight));

      // Clamp Bottom:
      // Minimum bottom is MARGIN
      // Maximum bottom is windowHeight - BUTTON_SIZE - MARGIN
      const maxBottom = windowHeight - BUTTON_SIZE - MARGIN;
      newBottom = Math.max(MARGIN, Math.min(newBottom, maxBottom));

      setPosition({
        right: newRight,
        bottom: newBottom
      });
    }
  };

  const handleDragEnd = () => {
    setIsDraggingState(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    // e.stopPropagation(); 
    handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDraggingState) {
        // Prevent default to avoid scrolling while dragging the icon
        // e.preventDefault(); 
        handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchEnd = () => handleDragEnd();

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only left click
    if (e.button !== 0) return;
    handleDragStart(e.clientX, e.clientY);

    const onMove = (moveEvent: MouseEvent) => {
      handleDragMove(moveEvent.clientX, moveEvent.clientY);
    };

    const onUp = () => {
      handleDragEnd();
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const handleIconClick = () => {
    if (!dragRef.current.hasMoved) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div 
        className="fixed z-50 font-sans pointer-events-none transition-none"
        style={{ right: `${position.right}px`, bottom: `${position.bottom}px` }}
    >
      {/* 聊天窗口 (Window) */}
      <div 
        className={`absolute bottom-full right-0 bg-white/90 backdrop-blur-xl border border-white/60 shadow-glass rounded-2xl w-[85vw] max-w-[360px] h-[500px] flex flex-col mb-4 overflow-hidden transition-all duration-300 origin-bottom-right ${
          isOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-90 translate-y-4 pointer-events-none'
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
            className="text-white/70 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full active:bg-white/10"
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
              !input.trim() || loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-zen-primary md:hover:bg-zen-primary/90 md:hover:scale-105 active:scale-95'
            }`}
          >
            <IconArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 悬浮按钮 (可拖拽 Button) */}
      <div
         onMouseDown={handleMouseDown}
         onTouchStart={handleTouchStart}
         onTouchMove={handleTouchMove}
         onTouchEnd={handleTouchEnd}
         onClick={handleIconClick}
         // touch-none prevents browser scrolling when dragging on mobile
         className={`group relative w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform duration-200 pointer-events-auto cursor-move select-none touch-none ${
             isOpen ? 'bg-stone-200 text-stone-500' : 'bg-gradient-to-br from-zen-primary to-zen-secondary text-white'
         } ${isDraggingState ? 'scale-95 opacity-80 shadow-2xl' : 'md:hover:scale-110 active:scale-95'}`}
      >
        {isOpen ? (
            <span className="text-2xl leading-none mb-1 rotate-90 inline-block transition-transform duration-300">×</span>
        ) : (
            <>
                <IconFeather className="w-7 h-7 animate-float" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full border-2 border-white animate-pulse"></span>
            </>
        )}
      </div>
    </div>
  );
};

export default ChatWidget;
