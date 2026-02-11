
import React, { useState, useMemo } from 'react';
import { 
  Database, FileText, Search, X, Check, Settings2, ShieldCheck, 
  Filter, Calendar, FileType, FolderOpen, ChevronRight, ChevronDown,
  UploadCloud, Clock
} from 'lucide-react';
import { KnowledgeMode, KnowledgeItem } from '../types';

interface KnowledgeSelectorProps {
  onClose: () => void;
  onSelect: (mode: KnowledgeMode, ids: string[]) => void;
  activeMode: KnowledgeMode;
  selectedIds: string[];
  useKnowledgePlus: boolean;
  onToggleKnowledgePlus: (value: boolean) => void;
}

const MOCK_DATABASES: KnowledgeItem[] = [
  { id: 'db-1', name: 'AI 核心研究文献库', count: 14000, category: 'Artificial Intelligence', type: 'db', date: '2023-12-01' },
  { id: 'db-2', name: '生物医学文献 (PubMed Top)', count: 52000, category: 'Biomedicine', type: 'db', date: '2024-01-15' },
  { id: 'db-3', name: '临床试验数据 (Phase I-III)', count: 8500, category: 'Clinical', type: 'db', date: '2023-11-20' },
  { id: 'db-4', name: '内部研发报告库', count: 120, category: 'Internal', type: 'db', date: '2024-02-10' },
];

const MOCK_FILES: KnowledgeItem[] = [
  { id: 'f-1', name: 'Martinkus et al_2023_Nature.pdf', category: 'Papers', type: 'pdf', size: '2.4 MB', date: '2024-01-05' },
  { id: 'f-2', name: 'DeepLearning_Review_v2.pdf', category: 'Papers', type: 'pdf', size: '5.1 MB', date: '2023-12-28' },
  { id: 'f-3', name: 'Protein_Structure_Analysis.docx', category: 'Reports', type: 'docx', size: '1.2 MB', date: '2024-02-01' },
  { id: 'f-4', name: 'Q1_Experiment_Raw_Data.csv', category: 'Data', type: 'csv', size: '15.4 MB', date: '2024-02-14' },
  { id: 'f-5', name: 'Lab_Meeting_Notes_Feb.docx', category: 'Reports', type: 'docx', size: '0.5 MB', date: '2024-02-15' },
  { id: 'f-6', name: 'AlphaFold3_Supplementary.pdf', category: 'Papers', type: 'pdf', size: '8.9 MB', date: '2024-01-10' },
];

export const KnowledgeSelector: React.FC<KnowledgeSelectorProps> = ({ 
  onClose, 
  onSelect, 
  activeMode, 
  selectedIds,
  useKnowledgePlus,
  onToggleKnowledgePlus
}) => {
  const [mode, setMode] = useState<KnowledgeMode>(activeMode);
  const [search, setSearch] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['All']);
  
  // Filters
  const [filterType, setFilterType] = useState<string>('all'); // all, pdf, docx, csv
  const [filterDate, setFilterDate] = useState<string>('any'); // any, 7d, 30d

  // Process Items
  const rawItems = mode === 'base' ? MOCK_DATABASES : MOCK_FILES;
  
  const filteredItems = useMemo(() => {
    return rawItems.filter(item => {
      // Search
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
      // Type Filter
      const matchesType = filterType === 'all' || item.type === filterType;
      // Date Filter (Simple Mock)
      let matchesDate = true;
      if (filterDate === '7d') {
        // Mock check: assume items with 'Feb' or '2024-02' are recent
        matchesDate = (item.date || '').includes('2024-02');
      }
      return matchesSearch && matchesType && matchesDate;
    });
  }, [rawItems, search, filterType, filterDate]);

  // Grouping
  const groupedItems = useMemo(() => {
    const groups: Record<string, KnowledgeItem[]> = {};
    filteredItems.forEach(item => {
      const cat = item.category || 'Uncategorized';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [filteredItems]);

  const toggleSelection = (id: string) => {
    const newSelection = selectedIds.includes(id) 
      ? selectedIds.filter(i => i !== id)
      : [...selectedIds, id];
    onSelect(mode, newSelection);
  };

  const toggleGroupSelection = (category: string) => {
    // DO: Cast to KnowledgeItem[] to fix TS issues
    const itemsInGroup = (groupedItems[category] || []) as KnowledgeItem[];
    const allSelected = itemsInGroup.every(i => selectedIds.includes(i.id));
    
    let newSelection = [...selectedIds];
    if (allSelected) {
      // Deselect all in group
      newSelection = newSelection.filter(id => !itemsInGroup.find(i => i.id === id));
    } else {
      // Select all in group
      const toAdd = itemsInGroup.map(i => i.id).filter(id => !selectedIds.includes(id));
      newSelection = [...newSelection, ...toAdd];
    }
    onSelect(mode, newSelection);
  };

  const toggleGroupExpand = (cat: string) => {
    setExpandedGroups(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  return (
    <div className="absolute bottom-full mb-3 right-0 w-[480px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-fade-in flex flex-col pointer-events-auto">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
        <div>
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            知识库增强配置
            <span className="text-[10px] font-normal text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
              {mode === 'base' ? 'Database Mode' : 'File Mode'}
            </span>
          </h3>
        </div>
        <div className="flex items-center gap-2">
           <button className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-blue-600 transition-colors">
             <UploadCloud size={16} />
           </button>
           <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 transition-colors">
             <X size={16} />
           </button>
        </div>
      </div>

      <div className="flex h-[400px]">
        {/* Sidebar Tabs */}
        <div className="w-32 bg-gray-50 border-r border-gray-100 flex flex-col p-2 gap-1">
          <button 
            onClick={() => setMode('base')}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
              mode === 'base' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-100' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <Database size={14} /> 知识库
          </button>
          <button 
            onClick={() => setMode('file')}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
              mode === 'file' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-100' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <FolderOpen size={14} /> 文件集
          </button>
          
          <div className="mt-auto mb-2 px-2">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
               <div className="flex items-center gap-2 mb-1">
                 <ShieldCheck size={14} className="text-amber-600" />
                 <span className="text-[10px] font-bold text-amber-800">Knowledge+</span>
               </div>
               <p className="text-[10px] text-amber-600/80 leading-tight mb-2">启用高精度专有知识校验模型</p>
               <div 
                onClick={() => onToggleKnowledgePlus(!useKnowledgePlus)}
                className={`w-8 h-4 rounded-full relative transition-colors cursor-pointer ${useKnowledgePlus ? 'bg-amber-500' : 'bg-gray-300'}`}
               >
                  <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${useKnowledgePlus ? 'translate-x-4' : 'translate-x-0'}`}></div>
               </div>
            </div>
          </div>
        </div>

        {/* Main List Area */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Search & Filter Bar */}
          <div className="p-3 border-b border-gray-50 space-y-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input 
                type="text" 
                placeholder={mode === 'base' ? "搜索数据库名称..." : "搜索文件名称或内容..."}
                className="w-full pl-8 pr-3 py-2 text-xs bg-gray-50 border-transparent focus:bg-white focus:border-blue-300 rounded-lg outline-none transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
               <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg border border-gray-100">
                 <Filter size={10} className="text-gray-400" />
                 <select 
                   value={filterType} 
                   onChange={(e) => setFilterType(e.target.value)}
                   className="bg-transparent text-[10px] font-bold text-gray-600 outline-none border-none cursor-pointer"
                 >
                   <option value="all">全部类型</option>
                   {mode === 'file' && (
                     <>
                       <option value="pdf">PDF 文档</option>
                       <option value="docx">Word 文档</option>
                       <option value="csv">CSV 数据</option>
                     </>
                   )}
                   {mode === 'base' && <option value="db">数据库</option>}
                 </select>
               </div>

               <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg border border-gray-100">
                 <Calendar size={10} className="text-gray-400" />
                 <select 
                   value={filterDate} 
                   onChange={(e) => setFilterDate(e.target.value)}
                   className="bg-transparent text-[10px] font-bold text-gray-600 outline-none border-none cursor-pointer"
                 >
                   <option value="any">任何时间</option>
                   <option value="7d">最近 7 天</option>
                   <option value="30d">最近 30 天</option>
                 </select>
               </div>
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            {/* DO: Explicitly cast entries to fix 'unknown' type errors for 'items' */}
            {(Object.entries(groupedItems) as [string, KnowledgeItem[]][]).map(([category, items]) => {
              const isExpanded = expandedGroups.includes(category);
              const itemsInGroupSelected = items.filter(i => selectedIds.includes(i.id)).length;
              const allSelected = items.length > 0 && itemsInGroupSelected === items.length;
              
              return (
                <div key={category} className="mb-2">
                  <div className="flex items-center justify-between px-2 py-1.5 hover:bg-gray-50 rounded-lg group select-none">
                     <div className="flex items-center gap-2 cursor-pointer" onClick={() => toggleGroupExpand(category)}>
                       <ChevronRight size={12} className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                       <span className="text-xs font-bold text-gray-600">{category}</span>
                       <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 rounded-full">{items.length}</span>
                     </div>
                     <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                       <button 
                        onClick={() => toggleGroupSelection(category)}
                        className="text-[10px] text-blue-600 font-bold hover:underline"
                       >
                         {allSelected ? '取消全选' : '全选'}
                       </button>
                     </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="ml-2 pl-2 border-l border-gray-100 mt-1 space-y-1">
                      {items.map(item => (
                        <div 
                          key={item.id}
                          onClick={() => toggleSelection(item.id)}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all border ${
                            selectedIds.includes(item.id) 
                              ? 'bg-blue-50 border-blue-100 shadow-sm' 
                              : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-100'
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors flex-shrink-0 ${
                              selectedIds.includes(item.id) ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'
                            }`}>
                              {selectedIds.includes(item.id) && <Check size={10} className="text-white" />}
                            </div>
                            
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="p-1.5 bg-gray-100 rounded text-gray-500">
                                {item.type === 'pdf' ? <FileText size={12}/> : 
                                 item.type === 'db' ? <Database size={12}/> :
                                 item.type === 'csv' ? <Settings2 size={12}/> : <FileText size={12}/>}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className={`text-xs truncate font-medium ${selectedIds.includes(item.id) ? 'text-blue-700' : 'text-gray-700'}`}>{item.name}</span>
                                <div className="flex items-center gap-2">
                                  {item.size && <span className="text-[9px] text-gray-400">{item.size}</span>}
                                  {item.date && <span className="text-[9px] text-gray-400 flex items-center gap-0.5"><Clock size={8}/> {item.date}</span>}
                                  {item.count && <span className="text-[9px] bg-gray-100 text-gray-500 px-1 rounded">{item.count} items</span>}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            
            {filteredItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <Search size={24} className="mb-2 opacity-50" />
                <p className="text-xs">未找到匹配项</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              已选 <span className="font-bold text-gray-800">{selectedIds.length}</span> 项
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => onSelect(mode, [])}
                className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 font-bold hover:bg-gray-100 rounded-lg transition-colors"
              >
                清空
              </button>
              <button 
                onClick={onClose}
                className="px-4 py-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 font-bold rounded-lg transition-colors shadow-sm"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
