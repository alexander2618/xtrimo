
import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronLeft, Plus, Download, 
  FlaskConical, MessageSquare, X, ChevronRight,
  ListTree, Wrench, Info, AlertCircle
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
    <div className="flex flex-col h-full bg-white animate-fade-in">
      {/* Header */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shadow-sm z-20">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <FlaskConical size={18} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-800">{templateToUse.title}</h1>
              <span className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded border border-green-100 font-medium">
                {templateToUse.version || 'V1.0'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-sm transition-all active:scale-95">
              <Download size={14} /> 确认并导出PDF
           </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Outline */}
        <aside className="w-64 bg-gray-50/50 border-r border-gray-200 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-white">
            <ListTree size={16} className="text-indigo-600" />
            <span className="text-xs font-bold text-gray-700">步骤大纲</span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
             {headings.map((b, i) => (
                <button 
                  key={b.id} 
                  onClick={() => scrollToBlock(b.id)} 
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-all flex items-center gap-2 border border-transparent hover:border-indigo-100 group ${
                    highlightedBlock === b.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-white hover:text-indigo-600 hover:shadow-sm'
                  }`}
                >
                  <div className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold flex-shrink-0 transition-colors ${
                    highlightedBlock === b.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-indigo-600 group-hover:text-white'
                  }`}>
                    {i + 1}
                  </div>
                  <span className="truncate">{cleanContent(b.content)}</span>
                </button>
              ))}
          </div>
        </aside>

        {/* Main Canvas */}
        <main className="flex-1 bg-gray-50 overflow-y-auto p-8 flex justify-center custom-scrollbar">
          <div className="w-full max-w-4xl space-y-6 pb-24">
            {/* Template Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
               <h1 className="text-2xl font-bold text-gray-900 mb-2">{templateToUse.title}</h1>
               <p className="text-sm text-gray-500 leading-relaxed">{templateToUse.description}</p>
            </div>

            {/* Resources Grid */}
            <div className="grid grid-cols-2 gap-6">
               <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                   <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                     <Wrench size={16} className="text-indigo-500" /> 设备仪器
                   </h3>
                   <div className="space-y-2">
                       {templateToUse.equipment?.map((eq, i) => (
                           <div key={i} className="p-3 bg-gray-50 rounded-lg text-xs font-medium text-gray-700">
                             {eq.name} 
                             <span className="text-[10px] text-gray-400 block font-normal">{eq.spec || eq.model}</span>
                           </div>
                       ))}
                       {templateToUse.equipment?.length === 0 && <p className="text-[10px] text-gray-400">暂无设备信息</p>}
                   </div>
               </div>
               <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                   <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                     <FlaskConical size={16} className="text-blue-500" /> 试剂耗材
                   </h3>
                   <div className="space-y-2">
                       {templateToUse.reagents?.map((re, i) => (
                           <div key={i} className="p-3 bg-gray-50 rounded-lg text-xs font-medium text-gray-700">
                             {re.name} 
                             <span className="text-[10px] text-blue-400 block font-mono">{re.catNum}</span>
                           </div>
                       ))}
                       {templateToUse.reagents?.length === 0 && <p className="text-[10px] text-gray-400">暂无试剂信息</p>}
                   </div>
               </div>
            </div>

            {/* Steps Content Area */}
            <div className="space-y-4">
              {blocks.map((block) => {
                const headingIndex = headings.findIndex(h => h.id === block.id);
                
                return (
                  <div 
                    key={block.id} 
                    ref={el => { if (el) blockRefs.current[block.id] = el; }}
                    className={`relative transition-all duration-700 border rounded-xl p-4 shadow-sm ${
                      highlightedBlock === block.id 
                      ? 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50 shadow-md scale-[1.005]' 
                      : block.type === 'heading' ? 'mt-8 border-transparent bg-transparent shadow-none' : 'bg-white border-gray-100 hover:border-indigo-200'
                    }`}
                  >
                    {block.type === 'heading' ? (
                      <div className="flex items-center gap-3">
                        <div className="h-6 w-1 bg-indigo-600 rounded-full"></div>
                        <h2 className="text-lg font-bold text-gray-800">
                          {headingIndex !== -1 ? `${headingIndex + 1}. ` : ''}
                          {cleanContent(block.content)}
                        </h2>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <div className="w-5 h-5 rounded-full border-2 border-gray-200 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-800 font-medium leading-relaxed">{block.content}</p>
                          {block.params && (
                             <div className="flex gap-2 mt-2">
                               {Object.entries(block.params).map(([k,v]) => (
                                 <span key={k} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded uppercase tracking-wider">
                                   {k}: {v}
                                 </span>
                               ))}
                             </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        {/* Copilot Sidebar */}
        <aside className="w-80 bg-white border-l border-gray-200 flex flex-col flex-shrink-0">
          <div className="p-3 border-b border-gray-100 font-bold text-xs flex items-center gap-2">
            <MessageSquare size={14} className="text-indigo-600"/> Copilot 助手
          </div>
          <div className="flex-1 p-4 bg-gray-50/50 space-y-4 overflow-y-auto custom-scrollbar">
             {chatMessages.map(m => (
               <div key={m.id} className="p-3 bg-white rounded-xl border border-gray-200 text-xs text-gray-700 shadow-sm leading-relaxed animate-fade-in">
                 {m.content}
               </div>
             ))}
          </div>
          <div className="p-3 border-t border-gray-100">
            <input 
              type="text" 
              placeholder="咨询助手..." 
              className="w-full px-3 py-2 text-xs bg-gray-100 rounded-lg outline-none focus:bg-white focus:border-indigo-300 border border-transparent transition-all" 
            />
          </div>
        </aside>
      </div>
    </div>
  );
};
