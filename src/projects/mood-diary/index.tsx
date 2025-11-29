
import React, { useState, useRef } from 'react';
import { 
    IconArrowRight, IconFeather, IconSun, IconCheck, IconMapPin, 
    IconGrid, IconList, IconLayout, IconBook, IconFilm, IconTag, IconPlus, IconTrash,
    IconMoodHappy, IconMoodCalm, IconMoodSad, IconMoodEnergetic,
    IconMagic, IconEye, IconSparkles
} from '../../components/Icons';
import { aiService } from '../../services/aiService';

// --- Types ---
interface DiaryEntry {
  id: string;
  date: string;
  mood: 'happy' | 'calm' | 'sad' | 'energetic';
  content: string;
  images?: string[]; // base64 or url
  tags: string[];
  location?: string;
}

type ViewMode = 'list' | 'create' | 'album-setup' | 'album-view';
type TemplateType = 'timeline' | 'polaroid' | 'magazine' | 'grid' | 'list' | 'hero' | 'vintage' | 'collage';

// --- Mood Config ---
const MOOD_CONFIG = {
    happy: { icon: IconMoodHappy, label: '开心' },
    calm: { icon: IconMoodCalm, label: '平静' },
    sad: { icon: IconMoodSad, label: '低落' },
    energetic: { icon: IconMoodEnergetic, label: '活力' },
};

// --- Mock Data ---
const MOCK_ENTRIES: DiaryEntry[] = [
  { 
    id: '1', 
    date: '2024-03-20', 
    mood: 'happy', 
    content: '今天把心晴日记集成到了主网站里，看着代码跑通的那一刻，窗外的阳光似乎都更明媚了。技术不仅仅是逻辑，也是一种表达。', 
    images: ['https://picsum.photos/400/300?random=1'],
    tags: ['编程', '成就感', '阳光'],
    location: '云端工作室'
  },
  { 
    id: '2', 
    date: '2024-03-19', 
    mood: 'calm', 
    content: '临溪而居，听着水声，写代码也是一种享受。不需要复杂的算法，只需要一颗平静的心。', 
    images: [],
    tags: ['生活', '宁静'],
    location: '溪边'
  },
  { 
    id: '3', 
    date: '2024-03-15', 
    mood: 'energetic', 
    content: '去了一趟大理，苍山洱海真的能治愈一切。拍了很多照片，每一张都是壁纸级别。', 
    images: ['https://picsum.photos/400/400?random=2'],
    tags: ['旅行', '大理', '摄影'],
    location: '大理·洱海'
  }
];

// --- Templates ---
const AlbumTemplates: Record<TemplateType, { name: string; desc: string; icon: React.ReactNode; render: (entries: DiaryEntry[]) => React.ReactNode }> = {
    timeline: {
        name: '时光长卷',
        desc: '时间轴串联记忆，记录点滴',
        icon: <IconList className="w-5 h-5" />,
        render: (entries) => (
            <div className="space-y-8 pl-4 border-l-2 border-zen-primary/30 py-4">
                {entries.map((entry, idx) => (
                    <div key={idx} className="relative pl-6">
                        <div className="absolute -left-[21px] top-0 w-4 h-4 rounded-full bg-zen-primary border-4 border-white shadow-sm"></div>
                        <div className="text-xs text-zen-primary font-bold mb-1 font-serif">{entry.date}</div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-stone-100 mb-2">
                             {entry.images && entry.images.length > 0 && (
                                <img src={entry.images[0]} className="w-full h-40 object-cover rounded-md mb-3" alt="memory" />
                             )}
                             <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">{entry.content}</p>
                        </div>
                    </div>
                ))}
            </div>
        )
    },
    polaroid: {
        name: '拍立得',
        desc: '复古胶片风格，定格瞬间',
        icon: <IconFilm className="w-5 h-5" />,
        render: (entries) => (
            <div className="grid grid-cols-2 gap-4 p-4">
                {entries.map((entry, idx) => (
                    <div key={idx} className="bg-white p-2 pb-8 shadow-md transform rotate-1 hover:rotate-0 transition-transform duration-300" style={{ transform: `rotate(${idx % 2 === 0 ? '-2deg' : '2deg'})` }}>
                         <div className="aspect-square bg-gray-100 mb-2 overflow-hidden">
                             {entry.images && entry.images.length > 0 ? (
                                <img src={entry.images[0]} className="w-full h-full object-cover filter contrast-110" alt="polaroid" />
                             ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs bg-stone-100">No Image</div>
                             )}
                         </div>
                         <div className="font-handwriting text-gray-600 text-xs text-center px-1 truncate">{entry.content.substring(0, 15)}...</div>
                         <div className="text-[9px] text-gray-400 text-center mt-1">{entry.date}</div>
                    </div>
                ))}
            </div>
        )
    },
    magazine: {
        name: '杂志大片',
        desc: '极简留白，尽显高级感',
        icon: <IconLayout className="w-5 h-5" />,
        render: (entries) => (
            <div className="space-y-12 p-6 bg-white">
                {entries.map((entry, idx) => (
                    <div key={idx} className="flex flex-col gap-4">
                        {entry.images && entry.images.length > 0 && (
                            <div className="w-full overflow-hidden shadow-lg">
                                <img src={entry.images[0]} className="w-full object-cover grayscale-[20%]" alt="magazine" />
                            </div>
                        )}
                        <div className="text-center px-4">
                            <h3 className="text-xl font-serif font-bold text-gray-800 mb-2">{entry.date.split('-').slice(1).join('.')}</h3>
                            <div className="w-8 h-0.5 bg-black mx-auto mb-3"></div>
                            <p className="text-sm font-light leading-7 text-gray-600 text-justify">{entry.content}</p>
                        </div>
                    </div>
                ))}
            </div>
        )
    },
    grid: {
        name: '生活宫格',
        desc: '整齐有序，一览无余',
        icon: <IconGrid className="w-5 h-5" />,
        render: (entries) => (
            <div className="grid grid-cols-3 gap-1">
                {entries.map((entry, idx) => (
                    <div key={idx} className="aspect-square relative group overflow-hidden bg-gray-100">
                        {entry.images && entry.images.length > 0 ? (
                            <img src={entry.images[0]} className="w-full h-full object-cover" alt="grid" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center p-2 text-[10px] text-center text-gray-400 bg-stone-50">
                                {entry.content.slice(0, 10)}...
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                             <p className="text-white text-[10px] text-center line-clamp-3">{entry.content}</p>
                        </div>
                    </div>
                ))}
            </div>
        )
    },
    list: {
        name: '极简列表',
        desc: '文字为主，回归纯粹',
        icon: <IconList className="w-5 h-5 rotate-90" />,
        render: (entries) => (
            <div className="divide-y divide-gray-100">
                {entries.map((entry, idx) => (
                    <div key={idx} className="py-4 px-4 flex gap-4">
                        <div className="w-16 h-16 flex-shrink-0 bg-stone-100 rounded-md overflow-hidden">
                            {entry.images && entry.images.length > 0 ? (
                                <img src={entry.images[0]} className="w-full h-full object-cover" alt="thumb" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs font-serif">{entry.date.slice(8)}</div>
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="text-xs text-gray-400 mb-1">{entry.date}</div>
                            <p className="text-sm text-gray-800 line-clamp-2">{entry.content}</p>
                        </div>
                    </div>
                ))}
            </div>
        )
    },
    hero: {
        name: '巨幕画报',
        desc: '全屏影像，视觉冲击',
        icon: <IconLayout className="w-5 h-5 rotate-90" />,
        render: (entries) => (
            <div className="space-y-1">
                {entries.map((entry, idx) => (
                    <div key={idx} className="relative h-64 w-full overflow-hidden group">
                        {entry.images && entry.images.length > 0 ? (
                            <img src={entry.images[0]} className="w-full h-full object-cover" alt="hero" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-zen-primary/20 to-zen-secondary/20 flex items-center justify-center">
                                <span className="text-zen-primary font-serif italic text-2xl">{entry.date}</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
                            <div className="text-white/80 text-xs mb-1">{entry.date}</div>
                            <p className="text-white text-sm font-medium line-clamp-2">{entry.content}</p>
                        </div>
                    </div>
                ))}
            </div>
        )
    },
    vintage: {
        name: '复古手账',
        desc: '泛黄纸张，时光痕迹',
        icon: <IconBook className="w-5 h-5" />,
        render: (entries) => (
            <div className="p-6 bg-[#f0e6d2] space-y-6" style={{ backgroundImage: 'repeating-linear-gradient(#f0e6d2 0px, #f0e6d2 24px, #e6dac3 25px)' }}>
                {entries.map((entry, idx) => (
                    <div key={idx} className="relative pl-4 pt-1">
                        <div className="font-serif text-[#5c4b37] text-sm leading-[25px]">
                            <span className="font-bold mr-2 text-[#8b4513]">{entry.date}</span>
                            {entry.content}
                        </div>
                        {entry.images && entry.images.length > 0 && (
                            <div className="mt-4 p-2 bg-white shadow-sm inline-block transform -rotate-1">
                                <img src={entry.images[0]} className="w-32 h-32 object-cover sepia-[0.5]" alt="vintage" />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        )
    },
    collage: {
        name: '拼贴艺术',
        desc: '错落有致，自由随性',
        icon: <IconLayout className="w-5 h-5" />,
        render: (entries) => (
            <div className="columns-2 gap-4 p-4 space-y-4">
                {entries.map((entry, idx) => (
                    <div key={idx} className="break-inside-avoid bg-white p-3 shadow-md rounded-lg mb-4">
                         {entry.images && entry.images.length > 0 && (
                            <img src={entry.images[0]} className="w-full rounded-md mb-3" alt="collage" />
                         )}
                         <p className="text-xs text-gray-600 leading-relaxed">{entry.content}</p>
                         <div className="mt-2 text-[10px] text-gray-300 text-right">{entry.date}</div>
                    </div>
                ))}
            </div>
        )
    }
};

// --- Sub-Components ---

// 1. 写日记页面
const CreateEntryView: React.FC<{ 
    onSave: (entry: DiaryEntry) => void; 
    onCancel: () => void 
}> = ({ onSave, onCancel }) => {
    const [content, setContent] = useState('');
    const [mood, setMood] = useState<DiaryEntry['mood']>('happy');
    const [image, setImage] = useState<string | null>(null);
    const [tags, setTags] = useState<string[]>([]);
    const [customTagInput, setCustomTagInput] = useState('');
    const [imageContext, setImageContext] = useState('');
    const [isAiProcessing, setIsAiProcessing] = useState(false);
    const [loadingText, setLoadingText] = useState('');

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (evt) => setImage(evt.target?.result as string);
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleAiPolish = async () => {
        if (!content) return;
        setIsAiProcessing(true);
        setLoadingText('灵犀正在斟酌词句...');
        const polished = await aiService.polishDiary(content, mood);
        setContent(polished);
        setIsAiProcessing(false);
    };

    const handleAiImageDesc = async () => {
        if (!image) return;
        setIsAiProcessing(true);
        setLoadingText('灵犀正在凝视画面...');
        const desc = await aiService.describeImage(image, imageContext);
        setContent(prev => (prev ? prev + "\n\n" + desc : desc));
        setIsAiProcessing(false);
    };

    const handleAiTags = async () => {
        if (!content && !image) return;
        setIsAiProcessing(true);
        setLoadingText('灵犀正在提取灵感...');
        const newTags = await aiService.generateTags(content, image || undefined);
        setTags(prev => [...new Set([...prev, ...newTags])]);
        setIsAiProcessing(false);
    };

    const handleAddCustomTag = () => {
        if (customTagInput.trim()) {
            setTags(prev => [...new Set([...prev, customTagInput.trim()])]);
            setCustomTagInput('');
        }
    };

    const handleSaveEntry = () => {
        if (!content && !image) return;
        onSave({
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0],
            mood,
            content,
            images: image ? [image] : [],
            tags,
            location: '心栖之地'
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-sm h-full flex flex-col overflow-hidden animate-fade-in">
            {isAiProcessing && (
                <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center text-zen-primary">
                    <IconSun className="w-8 h-8 animate-spin mb-2" />
                    <span className="text-sm font-serif">{loadingText}</span>
                </div>
            )}
            
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-stone-50">
                <span className="font-bold text-gray-700 flex items-center gap-2">
                    <IconFeather className="w-4 h-4 text-zen-primary" />
                    记录此刻
                </span>
                <div className="flex gap-2">
                    {(Object.keys(MOOD_CONFIG) as Array<keyof typeof MOOD_CONFIG>).map((m) => {
                        const Icon = MOOD_CONFIG[m].icon;
                        return (
                            <button 
                                key={m}
                                onClick={() => setMood(m)}
                                className={`p-1.5 rounded-full transition-all flex items-center justify-center w-8 h-8 ${mood === m ? 'bg-white shadow-md scale-110 text-zen-primary' : 'text-gray-400 hover:text-zen-primary/70'}`}
                                title={MOOD_CONFIG[m].label}
                            >
                                <Icon className="w-5 h-5" />
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <textarea 
                    className="w-full h-32 resize-none outline-none text-base leading-relaxed placeholder-gray-300 font-sans"
                    placeholder="今天发生了什么？试着写下来，或者上传一张照片..."
                    value={content}
                    onChange={e => setContent(e.target.value)}
                ></textarea>

                {image && (
                    <div className="space-y-2">
                        <div className="relative group rounded-lg overflow-hidden shadow-sm">
                            <img src={image} className="w-full max-h-48 object-cover" alt="preview" />
                            <button onClick={() => setImage(null)} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 text-xs hover:bg-black/70">
                                <IconTrash className="w-3 h-3" />
                            </button>
                        </div>
                        {/* AI Image Context Input */}
                        <div className="flex items-center gap-2 px-2">
                            <span className="text-[10px] text-gray-400 shrink-0">AI 读图提示:</span>
                            <input 
                                type="text"
                                placeholder="例如：游戏结算、海边日落（帮助AI更懂你）"
                                className="flex-1 text-xs bg-transparent border-b border-dashed border-gray-200 focus:border-zen-primary outline-none py-1 text-gray-600 placeholder-gray-300 transition-colors"
                                value={imageContext}
                                onChange={(e) => setImageContext(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                    <div className="flex items-center gap-2 mb-2 text-xs text-gray-500 font-bold">
                        <IconTag className="w-3 h-3" /> 标签管理
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {tags.map((tag, i) => (
                            <span key={i} className="px-2 py-1 bg-zen-primary/10 text-zen-primary text-xs rounded-full flex items-center group">
                                #{tag}
                                <button onClick={() => setTags(tags.filter((_, idx) => idx !== i))} className="ml-1 opacity-50 hover:opacity-100 p-0.5">×</button>
                            </span>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            className="flex-1 bg-white border border-stone-200 rounded-full px-3 py-1 text-xs outline-none focus:ring-1 focus:ring-zen-primary/30 focus:border-zen-primary transition-all placeholder-gray-300 text-gray-600"
                            placeholder="手动添加标签..."
                            value={customTagInput}
                            onChange={(e) => setCustomTagInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddCustomTag()}
                        />
                        <button onClick={handleAddCustomTag} className="w-7 h-7 bg-zen-primary text-white rounded-full flex items-center justify-center active:scale-95 shadow-sm hover:bg-zen-primary/90 transition-colors">
                            <IconPlus className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>

            {/* 工具栏 */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                    <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-600 shadow-sm active:scale-95 transition-transform cursor-pointer hover:text-zen-primary hover:border-zen-primary group">
                        <IconFilm className="w-3.5 h-3.5 group-hover:text-zen-primary transition-colors" />
                        <span>传图</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                    <button onClick={handleAiImageDesc} disabled={!image} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs shadow-sm active:scale-95 transition-transform ${image ? 'bg-white border border-zen-primary text-zen-primary' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                        <IconEye className="w-3.5 h-3.5" />
                        <span>读图描写</span>
                    </button>
                    <button onClick={handleAiPolish} disabled={!content} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs shadow-sm active:scale-95 transition-transform ${content ? 'bg-white border border-zen-primary text-zen-primary' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                        <IconMagic className="w-3.5 h-3.5" />
                        <span>AI润色</span>
                    </button>
                    <button onClick={handleAiTags} disabled={!content && !image} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs shadow-sm active:scale-95 transition-transform ${content || image ? 'bg-white border border-zen-primary text-zen-primary' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                        <IconSparkles className="w-3.5 h-3.5" />
                        <span>自动标签</span>
                    </button>
                </div>

                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 py-2.5 bg-white text-gray-500 border border-gray-200 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors">取消</button>
                    <button onClick={handleSaveEntry} className="flex-1 py-2.5 bg-zen-primary text-white rounded-lg font-medium text-sm shadow-lg shadow-zen-primary/30 hover:bg-zen-primary/90 transition-colors">保存日记</button>
                </div>
            </div>
        </div>
    );
};

// 2. 图文集生成设置
const AlbumSetupView: React.FC<{
    entries: DiaryEntry[];
    onGenerate: (filtered: DiaryEntry[], template: TemplateType) => void;
    onCancel: () => void;
}> = ({ entries, onGenerate, onCancel }) => {
    const [filterType, setFilterType] = useState<'all' | 'month' | 'tag'>('all');
    const [filterValue, setFilterValue] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('timeline');

    // Extract available months and tags
    const months = Array.from(new Set(entries.map(e => e.date.substring(0, 7)))).sort().reverse();
    const allTags = Array.from(new Set(entries.flatMap(e => e.tags)));

    const handleGenerate = () => {
        let filtered = entries;
        if (filterType === 'month' && filterValue) {
            filtered = entries.filter(e => e.date.startsWith(filterValue));
        } else if (filterType === 'tag' && filterValue) {
            filtered = entries.filter(e => e.tags.includes(filterValue));
        }
        onGenerate(filtered, selectedTemplate);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm h-full flex flex-col p-4 animate-fade-in">
            <h2 className="text-lg font-bold text-zen-brown mb-6 flex items-center">
                <IconFeather className="w-5 h-5 mr-2 text-zen-primary" />
                制作图文集
            </h2>

            <div className="space-y-6 flex-1 overflow-y-auto px-1">
                {/* 1. 筛选内容 */}
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                    <h3 className="text-sm font-bold text-gray-500 mb-3 uppercase flex items-center gap-1">
                        <span className="w-4 h-4 rounded-full bg-zen-primary text-white flex items-center justify-center text-[10px]">1</span>
                        选择内容
                    </h3>
                    <div className="flex gap-2 mb-3">
                        <button onClick={() => setFilterType('all')} className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${filterType === 'all' ? 'bg-zen-primary text-white border-zen-primary' : 'bg-white text-gray-600 border-gray-200'}`}>全部日记</button>
                        <button onClick={() => setFilterType('month')} className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${filterType === 'month' ? 'bg-zen-primary text-white border-zen-primary' : 'bg-white text-gray-600 border-gray-200'}`}>按月份</button>
                        <button onClick={() => setFilterType('tag')} className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${filterType === 'tag' ? 'bg-zen-primary text-white border-zen-primary' : 'bg-white text-gray-600 border-gray-200'}`}>按标签</button>
                    </div>
                    
                    {filterType === 'month' && (
                        <select className="w-full p-2 text-sm border border-gray-200 rounded-lg bg-white outline-none focus:border-zen-primary" onChange={e => setFilterValue(e.target.value)}>
                            <option value="">选择月份...</option>
                            {months.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    )}
                    {filterType === 'tag' && (
                        <select className="w-full p-2 text-sm border border-gray-200 rounded-lg bg-white outline-none focus:border-zen-primary" onChange={e => setFilterValue(e.target.value)}>
                            <option value="">选择标签...</option>
                            {allTags.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    )}
                </div>

                {/* 2. 选择模板 */}
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                    <h3 className="text-sm font-bold text-gray-500 mb-3 uppercase flex items-center gap-1">
                        <span className="w-4 h-4 rounded-full bg-zen-primary text-white flex items-center justify-center text-[10px]">2</span>
                        选择版式 ({Object.keys(AlbumTemplates).length}款)
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {(Object.keys(AlbumTemplates) as TemplateType[]).map((type) => (
                            <div 
                                key={type}
                                onClick={() => setSelectedTemplate(type)}
                                className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-2 ${selectedTemplate === type ? 'border-zen-primary bg-white shadow-md' : 'border-transparent bg-white/50 hover:bg-white hover:shadow-sm'}`}
                            >
                                <div className={`p-2 rounded-full ${selectedTemplate === type ? 'bg-zen-primary/10 text-zen-primary' : 'bg-gray-100 text-gray-400'}`}>
                                    {AlbumTemplates[type].icon}
                                </div>
                                <div>
                                    <div className={`font-bold text-sm ${selectedTemplate === type ? 'text-zen-primary' : 'text-gray-700'}`}>
                                        {AlbumTemplates[type].name}
                                    </div>
                                    <div className="text-[10px] text-gray-400 mt-0.5">{AlbumTemplates[type].desc.split('，')[0]}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                <button onClick={onCancel} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-lg font-medium text-sm hover:bg-gray-200">返回</button>
                <button onClick={handleGenerate} className="flex-1 py-3 bg-zen-primary text-white rounded-lg font-medium text-sm shadow-lg hover:bg-zen-primary/90">生成预览</button>
            </div>
        </div>
    );
};

// 3. 图文集预览
const AlbumView: React.FC<{
    entries: DiaryEntry[];
    template: TemplateType;
    onBack: () => void;
}> = ({ entries, template, onBack }) => {
    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        // Simple print simulation
        const printContent = componentRef.current;
        if (!printContent) return;
        
        const win = window.open('', '', 'width=800,height=900');
        if (win) {
            win.document.write(`
                <html>
                    <head>
                        <title>心晴日记 - ${AlbumTemplates[template].name}</title>
                        <script src="https://cdn.tailwindcss.com"></script>
                        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap" rel="stylesheet">
                        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700&display=swap" rel="stylesheet">
                        <style>
                            body { font-family: 'Noto Serif SC', serif; background: #fff; }
                            @media print {
                                body { -webkit-print-color-adjust: exact; }
                            }
                        </style>
                    </head>
                    <body class="p-8">
                        ${printContent.innerHTML}
                    </body>
                </html>
            `);
            win.document.close();
            win.setTimeout(() => {
                win.print();
                win.close();
            }, 1000);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm h-full flex flex-col animate-fade-in relative z-50">
            <div className="h-14 border-b border-gray-100 flex items-center justify-between px-4 bg-stone-50 rounded-t-xl flex-shrink-0">
                <button onClick={onBack} className="text-gray-500 text-sm flex items-center hover:text-gray-800">
                    <IconArrowRight className="w-4 h-4 mr-1 rotate-180" /> 返回
                </button>
                <span className="font-bold text-zen-brown flex items-center gap-2">
                     {AlbumTemplates[template].icon}
                     {AlbumTemplates[template].name}
                </span>
                <button onClick={handlePrint} className="text-zen-primary text-sm font-bold hover:opacity-80 border border-zen-primary px-3 py-1 rounded-full">
                    打印 / PDF
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto bg-stone-200 p-4">
                <div ref={componentRef} className="bg-white min-h-full shadow-lg max-w-2xl mx-auto rounded-sm overflow-hidden p-8 print:shadow-none relative">
                    <div className="text-center mb-10 border-b-2 border-black pb-4">
                        <h1 className="text-3xl font-serif font-bold text-black mb-2">My Diary</h1>
                        <p className="text-sm text-gray-500 uppercase tracking-widest">Collection · {AlbumTemplates[template].name}</p>
                    </div>
                    {entries.length === 0 ? (
                        <div className="text-center text-gray-400 py-20">没有符合条件的日记</div>
                    ) : (
                        AlbumTemplates[template].render(entries)
                    )}
                    <div className="mt-12 text-center text-[10px] text-gray-300 border-t pt-4 flex justify-between items-center">
                        <span>Generated by 心栖灵犀 · 心晴日记</span>
                        <span>{new Date().toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main App Component ---
const DiaryApp: React.FC = () => {
  const [view, setView] = useState<ViewMode>('list');
  const [entries, setEntries] = useState<DiaryEntry[]>(MOCK_ENTRIES);
  const [albumData, setAlbumData] = useState<{entries: DiaryEntry[], template: TemplateType} | null>(null);

  const handleSaveEntry = (newEntry: DiaryEntry) => {
    setEntries([newEntry, ...entries]);
    setView('list');
  };

  const handleGenerateAlbum = (filtered: DiaryEntry[], template: TemplateType) => {
    setAlbumData({ entries: filtered, template });
    setView('album-view');
  };

  return (
    <div className="flex flex-col h-full bg-[#f6f7f9] text-gray-800 font-sans relative">
      {/* 头部 (仅在 List 模式显示，保持简洁) */}
      {view === 'list' && (
        <div className="h-12 px-4 flex items-center justify-between bg-white shadow-sm flex-shrink-0 z-10">
            <span className="font-bold text-lg text-zen-primary flex items-center gap-2">
                <IconFeather className="w-4 h-4" />
                心晴日记
            </span>
            <button 
                onClick={() => setView('album-setup')}
                className="text-xs px-3 py-1 bg-zen-primary/10 text-zen-primary rounded-full font-bold active:scale-95 hover:bg-zen-primary/20 transition-colors"
            >
                生成图文集
            </button>
        </div>
      )}

      {/* 主视图路由 */}
      <div className="flex-1 overflow-hidden relative">
          {view === 'list' && (
             <div className="h-full overflow-y-auto p-4 space-y-4 pb-24">
                {/* 签到卡片 */}
                <div className="bg-gradient-to-r from-zen-primary to-zen-secondary text-white p-4 rounded-xl shadow-md mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold">每日签到</h3>
                        <IconSun className="w-5 h-5 animate-pulse-slow" />
                    </div>
                    <p className="text-xs opacity-90">已连续记录 12 天，心因记录而安宁。</p>
                </div>

                <div className="flex justify-between items-end mb-2">
                    <h4 className="font-bold text-gray-500 text-sm">最近记录</h4>
                    <span className="text-xs text-gray-300">{entries.length} 篇</span>
                </div>
                
                {entries.map(entry => {
                    const MoodIcon = MOOD_CONFIG[entry.mood].icon;
                    return (
                        <div key={entry.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 transition-all active:scale-[0.99] group hover:border-zen-primary/30">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-gray-400 font-serif">{entry.date}</span>
                                <MoodIcon className="w-5 h-5 text-zen-primary/80" />
                            </div>
                            <p className="text-sm leading-relaxed mb-3 text-gray-700 line-clamp-3">{entry.content}</p>
                            
                            {entry.images && entry.images.length > 0 && (
                                <div className="mb-3 rounded-lg overflow-hidden h-32 w-full relative">
                                    <img src={entry.images[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="moment" />
                                    {entry.location && (
                                        <div className="absolute bottom-2 left-2 bg-black/40 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full flex items-center">
                                            <IconMapPin className="w-3 h-3 mr-1" />
                                            {entry.location}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex flex-wrap gap-1.5">
                                {entry.tags.map(t => (
                                    <span key={t} className="px-2 py-0.5 bg-stone-50 text-stone-400 text-[10px] rounded border border-stone-100 group-hover:bg-zen-primary/5 group-hover:text-zen-primary transition-colors">#{t}</span>
                                ))}
                            </div>
                        </div>
                    );
                })}
             </div>
          )}

          {view === 'create' && (
              <CreateEntryView onSave={handleSaveEntry} onCancel={() => setView('list')} />
          )}

          {view === 'album-setup' && (
              <AlbumSetupView entries={entries} onGenerate={handleGenerateAlbum} onCancel={() => setView('list')} />
          )}

          {view === 'album-view' && albumData && (
              <AlbumView entries={albumData.entries} template={albumData.template} onBack={() => setView('list')} />
          )}
      </div>

      {/* 底部浮动按钮 (仅 List 模式) */}
      {view === 'list' && (
          <div className="absolute bottom-6 left-0 right-0 px-6 flex justify-center pointer-events-none">
             <button 
                onClick={() => setView('create')}
                className="pointer-events-auto bg-zen-primary text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-2xl shadow-zen-primary/40 active:scale-95 hover:scale-105 transition-all"
             >
                <IconPlus className="w-6 h-6" />
             </button>
          </div>
      )}
    </div>
  );
};


// --- 适配器容器 (保持不变) ---
const MoodDiaryWrapper: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#f3f2ed] flex flex-col animate-fade-in">
      <div className="h-14 md:h-16 bg-white/80 backdrop-blur-md border-b border-stone-200 flex items-center px-4 md:px-6 justify-between flex-shrink-0 z-20">
        <div className="flex items-center">
            <button onClick={onBack} className="mr-2 md:mr-4 p-2 md:hover:bg-stone-100 active:bg-stone-200 rounded-full transition-colors text-gray-600">
                <IconArrowRight className="w-5 h-5 transform rotate-180" />
            </button>
            <h1 className="text-lg md:text-xl font-serif font-bold text-zen-brown flex items-center gap-2">
                <IconFeather className="w-5 h-5 text-zen-primary" />
                <span>心晴日记</span>
            </h1>
        </div>
        <div className="text-xs text-gray-400 hidden md:block">
            AI 驱动的智能日记本
        </div>
      </div>

      <div className="flex-1 w-full h-full overflow-hidden relative flex justify-center bg-stone-100">
        <div className="w-full h-full md:w-[375px] md:h-[calc(100vh-100px)] md:my-auto md:rounded-[3rem] md:border-[8px] md:border-gray-800 md:shadow-2xl overflow-hidden bg-white relative transition-all duration-500">
            <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-xl z-50"></div>
            <DiaryApp />
        </div>
        <div className="absolute inset-0 pointer-events-none hidden md:block">
            <div className="absolute top-1/2 left-20 -translate-y-1/2 max-w-xs text-zen-brown/60">
                <h3 className="text-2xl font-serif font-bold mb-4">记录点滴感动</h3>
                <ul className="space-y-4 leading-relaxed">
                    <li className="flex gap-2"><IconCheck className="text-zen-primary w-5 h-5"/> <span><b>AI 润色：</b>让文字更优美</span></li>
                    <li className="flex gap-2"><IconCheck className="text-zen-primary w-5 h-5"/> <span><b>读图写作：</b>自动生成环境描写</span></li>
                    <li className="flex gap-2"><IconCheck className="text-zen-primary w-5 h-5"/> <span><b>智能图文集：</b>一键生成 PDF 级排版</span></li>
                </ul>
            </div>
        </div>
      </div>
    </div>
  );
};

export default MoodDiaryWrapper;
