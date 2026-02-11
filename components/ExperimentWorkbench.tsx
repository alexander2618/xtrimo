
import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronLeft, Plus, Download, 
  FlaskConical, MessageSquare, X, ChevronRight,
  ListTree, Wrench, Info, AlertCircle, Send, Sparkles
} from 'lucide-react';
import { PTCTemplate, ExperimentBlock, Message } from '../types';

interface ExperimentWorkbenchProps {
  initialTemplate: PTCTemplate | null;
  onClose: () => void;
}

const PLASMID_MOCK: PTCTemplate = {
  id: 'sop-plasmid-v1',
  title: '质粒抽提 SOP V1.0',
  description: '本方案适用于碱裂解法从大肠杆菌中抽提质粒。通过自动重编号系统，以下步骤编号已根据大纲顺序动态调整。',
  tags: ['分子克隆', '质粒抽提', 'SOP'],
  date: '2024/02/20',
  equipment: [
    { name: '微量离心机', model: '-', supplier: '-' },
    { name: '移液器', spec: '10ul, 200ul, 1000ul', supplier: 'Eppendorf' }
  ],
  reagents: [
    { name: 'AxyPrep 质粒 DNA 小量提取试剂', catNum: 'AP-MN-P-250', supplier: '康宁杰瑞' },
    { name: '无水乙醇', supplier: '通用' }
  ],
  blocks: [
    { id: 'h1', type: 'heading', content: '3. 菌体生长状态判断' },
    { id: 'b1', type: 'text', content: '从恒温震荡摇床取 4ml LB 单管，生长良好的菌体应呈浑浊状态。' },
    { id: 'h2', type: 'heading', content: '4. 试剂配制及准备' },
    { id: 'b2', type: 'checklist', content: 'RNase A 加入全部 Buffer S1，混匀，4℃保存。' },
    { id: 'b3', type: 'checklist', content: '第一次使用 Buffer W2 concentrate，按照标签加入无水乙醇。' },
    { id: 'h3', type: 'heading', content: '5.1 质粒抽提 (离心法)' },
    { id: 'b5', type: 'instruction', content: '吸取 2ml 菌体至 EP 管，12000rpm 离心 1min。', params: { 'Speed': '12000rpm', 'Time': '1min' } },
    { id: 'b6', type: 'instruction', content: '加 250ul 的 Buffer S1 悬浮细菌沉淀。', params: { 'Vol': '250ul' } },
    { id: 'h4', type: 'heading', content: '7. 质粒检测' },
    { id: 'b14', type: 'instruction', content: '记录浓度，OD260/280 , OD260/230。' }
  ]
};

export const ExperimentWorkbench: React.FC<ExperimentWorkbenchProps> = ({ initialTemplate, onClose }) => {
  // Use initialTemplate if available, otherwise fallback to Plasmid Mock
  const templateToUse = initialTemplate || PLASMID_MOCK;
  const [blocks, setBlocks] = useState<ExperimentBlock[]>(templateToUse.blocks || []);
  const [highlightedBlock, setHighlightedBlock] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([
    { id: 'welcome', role: 'assistant', content: `工作台已就绪。针对 ${templateToUse.title} 的所有步骤编号已根据大纲顺序自动对齐。您可以点击右上方按钮导出 PDF 文档。`, timestamp: Date.now() }
  ]);

  const blockRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Helper to remove existing leading numbers from content
  const cleanContent = (content: string) => content.replace(/^\d+(\.\d+)*\.?\s*/, '');

  const scrollToBlock = (blockId: string) => {
    const el = blockRefs.current[blockId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedBlock(blockId);
      setTimeout(() => setHighlightedBlock(null), 3000);
    }
  };

  const headings = blocks.filter(b => b.type === 'heading');

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-fade-in">
      {/* Header */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-30 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <ChevronLeft size={22} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <FlaskConical size={18} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-800">{templateToUse.title}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                 <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded border border-indigo-100 font-bold font-mono">
                    {templateToUse.version || 'V1.0'}
                 </span>
                 <span className="text-[10px] text-gray-400">上次更新: {templateToUse.date}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 shadow-lg shadow-gray-200 transition-all active:scale-95">
              <Download size={14} /> 导出 PDF 报告
           </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT: Copilot Assistant (Fixed Width) */}
        <section className="w-[380px] bg-white border-r border-gray-200 flex flex-col flex-shrink-0 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
             <div className="flex items-center gap-2.5 font-bold text-sm text-gray-800">
                <Sparkles size={16} className="text-indigo-500"/>
                Copilot 实验助手
             </div>
             <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></span>
          </div>
          
          <div className="flex-1 p-5 bg-slate-50 space-y-5 overflow-y-auto custom-scrollbar">
             {chatMessages.map(m => (
               <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                 <div className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed shadow-sm transition-all ${
                   m.role === 'user' 
                     ? 'bg-indigo-600 text-white rounded-br-none shadow-indigo-100' 
                     : 'bg-white border border-gray-100 text-gray-700 rounded-bl-none'
                 }`}>
                   {m.content}
                 </div>
               </div>
             ))}
          </div>

          <div className="p-4 border-t border-gray-100 bg-white">
            <div className="relative group">
                <input 
                  type="text" 
                  placeholder="询问关于此实验的步骤或注意事项..." 
                  className="w-full pl-4 pr-10 py-3.5 text-xs bg-gray-50 border border-gray-100 focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50/50 rounded-2xl outline-none transition-all" 
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white text-indigo-600 rounded-xl shadow-sm border border-gray-100 hover:bg-indigo-50 hover:border-indigo-200 transition-colors">
                  <Send size={14} />
                </button>
            </div>
          </div>
        </section>

        {/* RIGHT: Document Area (Outline + Report) */}
        <div className="flex-1 flex overflow-hidden relative bg-slate-100/50">
            
            {/* Outline (Inner Sidebar) */}
            <aside className="w-64 flex-shrink-0 flex flex-col pt-8 pb-6 pl-6 pr-2 overflow-y-auto custom-scrollbar hidden xl:block">
                <div className="px-2 mb-5 flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <ListTree size={14} /> 步骤导航
                </div>
                <div className="space-y-1 relative group">
                    {/* Decorative Timeline Line */}
                    <div className="absolute left-[19px] top-3 bottom-3 w-[2px] bg-gray-200 rounded-full group-hover:bg-gray-300 transition-colors" />
                    
                    {headings.map((b, i) => (
                        <button 
                        key={b.id} 
                        onClick={() => scrollToBlock(b.id)} 
                        className={`relative w-full text-left pl-10 pr-3 py-3 text-xs rounded-xl transition-all flex items-center gap-2 border border-transparent ${
                            highlightedBlock === b.id 
                            ? 'bg-white text-indigo-700 shadow-sm font-bold translate-x-1' 
                            : 'text-gray-500 hover:text-gray-800 hover:bg-white/60'
                        }`}
                        >
                        <div className={`absolute left-[10px] w-5 h-5 rounded-full border-[3px] border-slate-50 z-10 flex items-center justify-center text-[9px] font-bold transition-all ${
                            highlightedBlock === b.id ? 'bg-indigo-600 text-white ring-2 ring-indigo-200 scale-110' : 'bg-gray-300 text-white'
                        }`}>
                            {i + 1}
                        </div>
                        <span className="truncate leading-tight">{cleanContent(b.content)}</span>
                        </button>
                    ))}
                </div>
            </aside>

            {/* Main Content (Centered Report) */}
            <main className="flex-1 overflow-y-auto px-6 py-8 md:px-10 custom-scrollbar">
                <div className="max-w-4xl mx-auto space-y-8 pb-32">
                    {/* Template Header Card */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-200/60 p-10 relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[100px] -mr-8 -mt-8 opacity-50 pointer-events-none" />
                       <h1 className="text-3xl font-bold text-gray-900 mb-4 relative z-10">{templateToUse.title}</h1>
                       <p className="text-sm text-gray-500 leading-relaxed max-w-2xl relative z-10">{templateToUse.description}</p>
                       <div className="flex gap-2 mt-6">
                          {templateToUse.tags.map(tag => (
                              <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 text-[10px] rounded-lg font-bold">#{tag}</span>
                          ))}
                       </div>
                    </div>

                    {/* Resources Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="bg-white rounded-3xl shadow-sm border border-gray-200/60 p-6 hover:shadow-md transition-shadow">
                           <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                             <Wrench size={14} className="text-indigo-500" /> 设备仪器
                           </h3>
                           <div className="space-y-3">
                               {templateToUse.equipment?.map((eq, i) => (
                                   <div key={i} className="p-3.5 bg-gray-50 rounded-2xl text-xs font-bold text-gray-700 flex justify-between items-center group">
                                     <span>{eq.name}</span>
                                     <span className="text-[10px] text-gray-400 font-normal bg-white px-2 py-1 rounded-lg border border-gray-100 group-hover:border-indigo-100 transition-colors">{eq.spec || eq.model}</span>
                                   </div>
                               ))}
                               {templateToUse.equipment?.length === 0 && <p className="text-[10px] text-gray-400">暂无设备信息</p>}
                           </div>
                       </div>
                       <div className="bg-white rounded-3xl shadow-sm border border-gray-200/60 p-6 hover:shadow-md transition-shadow">
                           <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                             <FlaskConical size={14} className="text-blue-500" /> 试剂耗材
                           </h3>
                           <div className="space-y-3">
                               {templateToUse.reagents?.map((re, i) => (
                                   <div key={i} className="p-3.5 bg-blue-50/30 rounded-2xl text-xs font-bold text-gray-700 flex justify-between items-center group">
                                     <span>{re.name}</span>
                                     <span className="text-[10px] text-blue-500 font-mono bg-white px-2 py-1 rounded-lg border border-blue-100 group-hover:border-blue-200 transition-colors">{re.catNum}</span>
                                   </div>
                               ))}
                               {templateToUse.reagents?.length === 0 && <p className="text-[10px] text-gray-400">暂无试剂信息</p>}
                           </div>
                       </div>
                    </div>

                    {/* Steps Content Area */}
                    <div className="space-y-6">
                      {blocks.map((block) => {
                        const headingIndex = headings.findIndex(h => h.id === block.id);
                        
                        return (
                          <div 
                            key={block.id} 
                            ref={el => { if (el) blockRefs.current[block.id] = el; }}
                            className={`relative transition-all duration-500 ${
                              highlightedBlock === block.id 
                              ? 'scale-[1.01] z-10' 
                              : ''
                            } ${block.type === 'heading' ? 'mt-10 mb-4' : ''}`}
                          >
                            {block.type === 'heading' ? (
                              <div className="flex items-center gap-4">
                                <div className="h-8 w-1.5 bg-indigo-600 rounded-full shadow-lg shadow-indigo-200"></div>
                                <h2 className="text-xl font-bold text-gray-800 tracking-tight">
                                  <span className="text-indigo-600 mr-2 opacity-50">0{headingIndex + 1}.</span>
                                  {cleanContent(block.content)}
                                </h2>
                              </div>
                            ) : (
                              <div className={`p-5 rounded-3xl border transition-all ${
                                highlightedBlock === block.id 
                                ? 'bg-white border-indigo-500 shadow-lg ring-4 ring-indigo-50' 
                                : 'bg-white border-gray-100 hover:border-indigo-200 hover:shadow-md'
                              }`}>
                                <div className="flex gap-4">
                                  <div className="w-6 h-6 rounded-full border-2 border-gray-100 flex-shrink-0 mt-0.5 bg-gray-50" />
                                  <div className="flex-1">
                                    <p className="text-sm text-gray-700 font-medium leading-relaxed">{block.content}</p>
                                    {block.params && (
                                       <div className="flex flex-wrap gap-2 mt-3">
                                         {Object.entries(block.params).map(([k,v]) => (
                                           <span key={k} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-lg border border-indigo-100 flex items-center gap-1">
                                             <span className="uppercase text-indigo-400">{k}:</span> {v}
                                           </span>
                                         ))}
                                       </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                </div>
            </main>
        </div>

      </div>
    </div>
  );
};
