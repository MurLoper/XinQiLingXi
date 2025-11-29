
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { WatermarkConfig } from '../../types';
import { IconArrowRight, IconFeather, IconCheck } from '../Icons';

const DEFAULT_CONFIG: WatermarkConfig = {
  type: 'text',
  text: '心栖灵犀 @XinQiLingXi',
  textColor: '#ffffff',
  textSize: 24,
  opacity: 0.5,
  rotate: -30,
  gap: 150,
  xOffset: 0,
  yOffset: 0,
  imageScale: 0.5,
};

declare global {
  interface Window {
    GIF: any;
  }
}

interface ExtendedConfig extends WatermarkConfig {
    mode: 'tiled' | 'single';
}

const WatermarkTool: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [config, setConfig] = useState<ExtendedConfig>({ ...DEFAULT_CONFIG, mode: 'tiled' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [watermarkImage, setWatermarkImage] = useState<HTMLImageElement | null>(null);
  const [libLoaded, setLibLoaded] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.GIF) {
      setLibLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.js';
    script.onload = () => setLibLoaded(true);
    document.body.appendChild(script);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
    }
  };

  const handleWatermarkImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setWatermarkImage(img);
          setConfig(prev => ({ ...prev, type: 'image', imageSrc: event.target?.result as string }));
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const drawWatermark = useCallback(() => {
    if (!canvasRef.current || !previewUrl) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const mainImg = new Image();
    mainImg.crossOrigin = "anonymous";
    mainImg.src = previewUrl;

    mainImg.onload = () => {
      canvas.width = mainImg.width;
      canvas.height = mainImg.height;

      ctx.drawImage(mainImg, 0, 0);

      const markCanvas = document.createElement('canvas');
      const markCtx = markCanvas.getContext('2d');
      if (!markCtx) return;

      const { textSize, text, textColor, opacity, rotate, gap, type, imageScale, mode } = config;
      
      let markWidth, markHeight;
      const radians = (rotate * Math.PI) / 180;

      if (type === 'text') {
        markCtx.font = `bold ${textSize}px "Noto Sans SC"`;
        const metrics = markCtx.measureText(text);
        const textW = Math.ceil(metrics.width);
        const textH = Math.ceil(textSize * 1.2);

        const sin = Math.abs(Math.sin(radians));
        const cos = Math.abs(Math.cos(radians));
        markWidth = textW * cos + textH * sin;
        markHeight = textW * sin + textH * cos;

        const tileSize = Math.max(markWidth, markHeight) + (mode === 'tiled' ? gap : 0);
        
        markCanvas.width = tileSize;
        markCanvas.height = tileSize;

        markCtx.translate(markCanvas.width / 2, markCanvas.height / 2);
        markCtx.rotate(radians);
        markCtx.font = `bold ${textSize}px "Noto Sans SC"`;
        markCtx.fillStyle = textColor;
        markCtx.globalAlpha = opacity;
        markCtx.textAlign = 'center';
        markCtx.textBaseline = 'middle';
        markCtx.fillText(text, 0, 0);
      } else if (type === 'image' && watermarkImage) {
        const rawW = watermarkImage.width * imageScale;
        const rawH = watermarkImage.height * imageScale;
        
        const sin = Math.abs(Math.sin(radians));
        const cos = Math.abs(Math.cos(radians));
        markWidth = rawW * cos + rawH * sin;
        markHeight = rawW * sin + rawH * cos;
        
        const tileSize = Math.max(markWidth, markHeight) + (mode === 'tiled' ? gap : 0);
        
        markCanvas.width = tileSize;
        markCanvas.height = tileSize;

        markCtx.translate(markCanvas.width / 2, markCanvas.height / 2);
        markCtx.rotate(radians);
        markCtx.globalAlpha = opacity;
        markCtx.drawImage(watermarkImage, -rawW/2, -rawH/2, rawW, rawH);
      } else {
          return;
      }

      if (mode === 'tiled') {
         const pattern = ctx.createPattern(markCanvas, 'repeat');
         if (pattern) {
            ctx.fillStyle = pattern;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
         }
      } else {
         const centerX = canvas.width / 2;
         const centerY = canvas.height / 2;
         ctx.drawImage(markCanvas, centerX - markCanvas.width/2, centerY - markCanvas.height/2);
      }
    };
  }, [previewUrl, config, watermarkImage]);

  useEffect(() => {
    const timer = setTimeout(() => {
        drawWatermark();
    }, 50);
    return () => clearTimeout(timer);
  }, [drawWatermark]);

  const handleDownload = async () => {
    if (!canvasRef.current || !file) return;
    setIsProcessing(true);

    try {
        if (file.type === 'image/gif' && window.GIF) {
            const workerScriptUrl = 'https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js';
            const response = await fetch(workerScriptUrl);
            const workerCode = await response.text();
            
            const blob = new Blob([workerCode], { type: 'application/javascript' });
            const workerBlobUrl = URL.createObjectURL(blob);

            const gif = new window.GIF({
                workers: 2,
                quality: 10,
                workerScript: workerBlobUrl 
            });

            gif.addFrame(canvasRef.current, {copy: true});
            
            gif.on('finished', (blob: Blob) => {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `watermarked_${file.name}`;
                link.click();
                setIsProcessing(false);
                URL.revokeObjectURL(workerBlobUrl); 
            });

            gif.render();
        } else {
            const dataUrl = canvasRef.current.toDataURL(file.type, 0.9);
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `watermarked_${file.name}`;
            link.click();
            setIsProcessing(false);
        }
    } catch (e) {
        console.error("Export failed:", e);
        alert("导出失败，请检查网络或图片格式");
        setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-[#f3f2ed] animate-fade-in fixed inset-0 z-50">
      <div className="h-14 md:h-16 bg-white/80 backdrop-blur-md border-b border-stone-200 flex items-center px-4 md:px-6 justify-between flex-shrink-0 z-20">
        <div className="flex items-center">
            <button onClick={onBack} className="mr-2 md:mr-4 p-2 md:hover:bg-stone-100 active:bg-stone-200 rounded-full transition-colors text-gray-600">
                <IconArrowRight className="w-5 h-5 transform rotate-180" />
            </button>
            <h1 className="text-lg md:text-xl font-serif font-bold text-zen-brown flex items-center gap-2">
                <IconFeather className="w-5 h-5 text-zen-green" />
                <span className="hidden xs:inline">灵犀水印工具</span>
                <span className="xs:hidden">水印</span>
            </h1>
        </div>
        <div className="flex gap-2 md:gap-3">
             <label className="cursor-pointer px-3 py-1.5 md:px-4 md:py-2 bg-stone-100 text-stone-600 rounded-lg md:hover:bg-stone-200 active:bg-stone-300 transition-colors text-xs md:text-sm font-medium flex items-center">
                <span className="hidden sm:inline">上传图片/GIF</span>
                <span className="sm:hidden">上传</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
             </label>
             <button 
                onClick={handleDownload}
                disabled={!file || isProcessing || (!libLoaded && file?.type === 'image/gif')}
                className={`px-4 py-1.5 md:px-6 md:py-2 bg-zen-green text-white rounded-lg shadow-lg md:hover:bg-zen-green/90 active:bg-zen-green/80 transition-all text-xs md:text-sm font-medium ${(!file || isProcessing) ? 'opacity-50 cursor-not-allowed' : ''}`}
             >
                {isProcessing ? '处理中...' : (
                    <>
                        <span className="hidden sm:inline">导出保存</span>
                        <span className="sm:hidden">保存</span>
                    </>
                )}
             </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden relative">
        <div className="w-full md:w-80 bg-white border-t md:border-t-0 md:border-r border-stone-200 p-4 md:p-6 overflow-y-auto flex-shrink-0 z-10 shadow-sm order-2 md:order-1 h-[45vh] md:h-auto">
            <div className="bg-stone-100 p-1 rounded-lg flex mb-6">
                <button 
                    onClick={() => setConfig(c => ({...c, mode: 'tiled'}))}
                    className={`flex-1 py-1.5 text-sm rounded-md transition-all active:scale-[0.98] ${config.mode === 'tiled' ? 'bg-white shadow-sm text-zen-green font-medium' : 'text-gray-500'}`}
                >
                    全图平铺
                </button>
                <button 
                    onClick={() => setConfig(c => ({...c, mode: 'single'}))}
                    className={`flex-1 py-1.5 text-sm rounded-md transition-all active:scale-[0.98] ${config.mode === 'single' ? 'bg-white shadow-sm text-zen-green font-medium' : 'text-gray-500'}`}
                >
                    居中单个
                </button>
            </div>

            <div className="flex gap-4 mb-6 text-sm font-medium text-gray-600 border-b border-stone-100 pb-2">
                <button 
                    onClick={() => setConfig(c => ({...c, type: 'text'}))}
                    className={`pb-2 px-1 active:opacity-70 ${config.type === 'text' ? 'text-zen-brown border-b-2 border-zen-green' : 'text-gray-400'}`}
                >
                    文字模式
                </button>
                <button 
                    onClick={() => setConfig(c => ({...c, type: 'image'}))}
                    className={`pb-2 px-1 active:opacity-70 ${config.type === 'image' ? 'text-zen-brown border-b-2 border-zen-green' : 'text-gray-400'}`}
                >
                    图片模式
                </button>
            </div>

            <div className="space-y-6 pb-6">
                {config.type === 'text' ? (
                    <>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">文字内容</label>
                            <input 
                                type="text" 
                                value={config.text}
                                onChange={(e) => setConfig(c => ({...c, text: e.target.value}))}
                                className="w-full px-3 py-2 border border-stone-200 rounded-md focus:outline-none focus:border-zen-green bg-stone-50"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">样式设置</label>
                            <div className="flex gap-2">
                                <div className="flex-1 flex gap-2 items-center bg-stone-50 border border-stone-200 rounded px-2">
                                    <input 
                                        type="color" 
                                        value={config.textColor}
                                        onChange={(e) => setConfig(c => ({...c, textColor: e.target.value}))}
                                        className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                                    />
                                    <span className="text-xs text-gray-500">{config.textColor}</span>
                                </div>
                                <div className="flex-1 bg-stone-50 border border-stone-200 rounded px-2 py-1.5 text-center">
                                     <span className="text-xs text-gray-500">{config.textSize}px</span>
                                </div>
                            </div>
                            <input 
                                type="range" min="12" max="200" 
                                value={config.textSize}
                                onChange={(e) => setConfig(c => ({...c, textSize: Number(e.target.value)}))}
                                className="w-full mt-2 accent-zen-green h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </>
                ) : (
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">上传水印素材</label>
                        <div className="border-2 border-dashed border-stone-300 rounded-lg p-4 text-center md:hover:bg-stone-50 active:bg-stone-50 transition-colors cursor-pointer relative group">
                             <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" accept="image/*" onChange={handleWatermarkImageUpload} />
                             {watermarkImage ? (
                                <img src={watermarkImage.src} alt="Watermark" className="h-20 mx-auto object-contain" />
                             ) : (
                                <span className="text-xs text-gray-400 group-hover:text-zen-green transition-colors">点击上传透明 PNG</span>
                             )}
                        </div>
                        <div className="mt-4">
                             <label className="block text-xs font-bold text-gray-500 mb-2 uppercase flex justify-between">
                                素材大小 <span>{Math.round(config.imageScale * 100)}%</span>
                            </label>
                            <input 
                                type="range" min="0.1" max="3" step="0.1"
                                value={config.imageScale}
                                onChange={(e) => setConfig(c => ({...c, imageScale: Number(e.target.value)}))}
                                className="w-full accent-zen-green h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>
                )}

                <div className="h-px bg-stone-200 my-4"></div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase flex justify-between">
                            透明度 <span>{Math.round(config.opacity * 100)}%</span>
                        </label>
                        <input 
                            type="range" min="0" max="1" step="0.05"
                            value={config.opacity}
                            onChange={(e) => setConfig(c => ({...c, opacity: Number(e.target.value)}))}
                            className="w-full accent-zen-green h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase flex justify-between">
                            旋转角度 <span>{config.rotate}°</span>
                        </label>
                        <input 
                            type="range" min="-180" max="180" step="5"
                            value={config.rotate}
                            onChange={(e) => setConfig(c => ({...c, rotate: Number(e.target.value)}))}
                            className="w-full accent-zen-green h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    {config.mode === 'tiled' && (
                        <div className="col-span-2 animate-fade-in">
                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase flex justify-between">
                                间距密度 <span>{config.gap}px</span>
                            </label>
                            <input 
                                type="range" min="0" max="500" step="10"
                                value={config.gap}
                                onChange={(e) => setConfig(c => ({...c, gap: Number(e.target.value)}))}
                                className="w-full accent-zen-green h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="flex-1 bg-stone-100 overflow-auto flex items-center justify-center p-4 md:p-8 relative order-1 md:order-2" ref={containerRef}>
            {!file ? (
                <div className="text-center text-gray-400">
                    <div className="w-20 h-20 md:w-24 md:h-24 border-2 border-dashed border-gray-300 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-stone-50">
                        <IconCheck className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-sm md:text-base">拖拽或点击上传图片</p>
                    <p className="text-xs mt-2 text-gray-400">支持 JPG, PNG, GIF</p>
                </div>
            ) : (
                <div className="shadow-2xl border-4 border-white bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] relative">
                    <canvas 
                        ref={canvasRef} 
                        className="max-w-full max-h-[40vh] md:max-h-[80vh] object-contain block"
                        style={{ maxWidth: '100%', height: 'auto' }}
                    />
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default WatermarkTool;
