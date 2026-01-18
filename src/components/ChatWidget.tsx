
import React, { useState, useRef, Suspense } from 'react';
import { aiService } from '../services/aiService';
import { IconFeather } from './Icons';

// 动态引入视图层，减少首屏体积
const ChatPanel = React.lazy(() => import('./ChatPanel'));

interface Message {
  role: 'user' | 'ai';
  text: string;
}

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  // 数据状态提升到父组件，确保 UI 卸载后数据不丢失
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: '你好，我是灵犀。在这里，你可以放下疲惫，与我聊聊。' }
  ]);
  const [loading, setLoading] = useState(false);

  // Dragging State
  const [position, setPosition] = useState({ right: 24, bottom: 24 });
  const [isDraggingState, setIsDraggingState] = useState(false);
  const dragRef = useRef({ 
    startX: 0, startY: 0, startRight: 0, startBottom: 0, hasMoved: false 
  });

  const handleSend = async (userMsg: string) => {
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    const reply = await aiService.sendMessage(userMsg);
    
    setMessages(prev => [...prev, { role: 'ai', text: reply }]);
    setLoading(false);
  };

  // --- Drag Handling ---
  const handleDragStart = (clientX: number, clientY: number) => {
    dragRef.current = {
      startX: clientX, startY: clientY,
      startRight: position.right, startBottom: position.bottom,
      hasMoved: false
    };
    setIsDraggingState(true);
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    const deltaX = dragRef.current.startX - clientX;
    const deltaY = dragRef.current.startY - clientY;
    
    if (!dragRef.current.hasMoved && (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3)) {
      dragRef.current.hasMoved = true;
    }

    if (dragRef.current.hasMoved) {
      const maxRight = window.innerWidth - 56 - 10;
      const maxBottom = window.innerHeight - 56 - 10;
      setPosition({
        right: Math.max(10, Math.min(dragRef.current.startRight + deltaX, maxRight)),
        bottom: Math.max(10, Math.min(dragRef.current.startBottom + deltaY, maxBottom))
      });
    }
  };

  const handleDragEnd = () => setIsDraggingState(false);
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    handleDragStart(e.clientX, e.clientY);
    const onMove = (evt: MouseEvent) => handleDragMove(evt.clientX, evt.clientY);
    const onUp = () => {
      handleDragEnd();
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const handleIconClick = () => {
    if (!dragRef.current.hasMoved) setIsOpen(!isOpen);
  };

  return (
    <div 
        className="fixed z-[100] font-sans pointer-events-none transition-none"
        style={{ right: `${position.right}px`, bottom: `${position.bottom}px` }}
    >
      {/* 
         Window Container 
         核心修复：通过 pointer-events-auto/none 严格控制点击穿透。
         只有 isOpen 为 true 时，才允许点击；否则完全透明且不可点击。
      */}
      <div 
        className={`absolute bottom-full right-0 w-[85vw] max-w-[360px] h-[550px] mb-4 origin-bottom-right transition-all duration-300 ${
          isOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-90 translate-y-4 pointer-events-none'
        }`}
      >
        {isOpen && (
            <Suspense fallback={
                <div className="w-full h-full bg-white/90 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/60 shadow-glass">
                    <div className="flex flex-col items-center text-zen-primary">
                        <span className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin mb-2"></span>
                        <span className="text-xs font-medium">Loading AI...</span>
                    </div>
                </div>
            }>
                <ChatPanel 
                    messages={messages} 
                    loading={loading}
                    onSend={handleSend}
                    onClose={() => setIsOpen(false)}
                />
            </Suspense>
        )}
      </div>

      {/* Floating Button (Always Interactive) */}
      <div
         onMouseDown={handleMouseDown}
         onTouchStart={(e) => handleDragStart(e.touches[0].clientX, e.touches[0].clientY)}
         onTouchMove={(e) => { if(isDraggingState) handleDragMove(e.touches[0].clientX, e.touches[0].clientY); }}
         onTouchEnd={handleDragEnd}
         onClick={handleIconClick}
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
