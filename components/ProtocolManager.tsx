
import React, { useState } from 'react';
import { 
  X, Upload, Settings, Search, Plus, Trash2, 
  FlaskConical, ArrowLeft, FileText, Tag, ChevronDown, ChevronRight,
  Dna, Microscope, Activity, Droplets, Info, PlusCircle, Save,
  Wrench, Beaker, ShieldAlert, ListChecks, Settings2, Sliders,
  MoreHorizontal, Calendar, Clock
} from 'lucide-react';
import { PTCTemplate } from '../types';
import { ProtocolImport } from './ProtocolImport';
import { ProtocolCreator } from './ProtocolCreator';

interface ProtocolManagerProps {
  onClose: () => void;
  onOpenWorkbench: (template: PTCTemplate) => void;
}

// --- Data Structures for Sidebar Tree ---
interface CategoryNode {
  id: string;
  label: string;
  children?: CategoryNode[];
  icon?: React.ElementType;
}

const CATEGORY_TREE: CategoryNode[] = [
  {
    id: 'molecular',
    label: '分子克隆',
    children: [
      { id: 'gel', label: '凝胶回收' },
      { id: 'pcr', label: 'PCR' },
      { id: 'plasmid', label: '酶切/线性化载体' },
      { id: 'ligation', label: '连接转化' },
      { id: 'screening', label: '菌落筛选' },
      { id: 'extraction', label: '质粒抽提' },
    ]
  },
  { 
    id: 'cell', 
    label: '细胞培养', 
    children: [
        { id: 'passage', label: '细胞复苏与传代' },
        { id: 'transfection', label: '细胞转染' }
    ] 
  },
  { id: 'protein_exp', label: '蛋白表达', children: [] },
  { id: 'purification', label: '蛋白纯化', children: [] },
  { id: 'qc', label: '蛋白QC', children: [] },
  { id: 'purity', label: '纯度检测', children: [] },
  { id: 'hydro', label: '疏水', children: [] },
  { id: 'affinity', label: '亲和力', children: [] },
  { id: 'phychem', label: '理化检测', children: [] },
];

// --- Mock Data Matching Screenshot ---
const SCREENSHOT_TEMPLATES: PTCTemplate[] = [
  {
    id: 'elisa',
    title: 'ELISA 标准操作流程',
    description: '用于检测样品中特定蛋白质浓度的酶联免疫吸附测定标准流程，包含包被、封闭、加样、显色等完整步骤。',
    tags: ['ELISA', '蛋白质检测', '免疫学'],
    category: '免疫检测',
    date: '2024/1/15',
    version: 'V1.0',
    blocks: []
  },
  {
    id: 'wb',
    title: 'Western Blot 蛋白质印迹',
    description: '用于检测特定蛋白质的表达水平，包含蛋白提取、电泳、转膜、免疫检测等步骤。',
    tags: ['Western Blot', '蛋白质', '免疫印迹'],
    category: '蛋白质分析',
    date: '2024/1/18',
    version: 'V1.2',
    blocks: []
  },
  {
    id: 'facs',
    title: '流式细胞术细胞表面标记检测',
    description: '用于检测细胞表面标志物的表达，适用于免疫细胞分型、细胞周期分析等。',
    tags: ['流式细胞术', 'FACS', '细胞表面标记'],
    category: '细胞分析',
    date: '2024/1/22',
    version: 'V2.0',
    blocks: []
  },
  {
    id: 'qpcr',
    title: 'qRT-PCR 实时定量PCR',
    description: '用于检测基因表达水平的实时定量PCR方法，包含RNA提取、反转录、qPCR扩增等步骤。',
    tags: ['qPCR', 'RT-PCR', '基因表达'],
    category: '分子生物学',
    date: '2024/2/5',
    version: 'V1.0',
    blocks: []
  }
];

export const ProtocolManager: React.FC<ProtocolManagerProps> = ({ onClose, onOpenWorkbench }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [templates, setTemplates] = useState<PTCTemplate[]>(SCREENSHOT_TEMPLATES);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Navigation State
  const [activeCategory, setActiveCategory] = useState<string>('gel');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['molecular']);

  const toggleCategoryExpand = (id: string) => {
    setExpandedCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleCategoryClick = (id: string, hasChildren: boolean) => {
    if (hasChildren) {
      toggleCategoryExpand(id);
    } else {
      setActiveCategory(id);
    }
  };

  const handleSaveNewTemplate = (newTemplate: PTCTemplate) => {
    setTemplates(prev => [newTemplate, ...prev]);
    setIsCreating(false);
  };

  const handleImportedTemplate = (template: PTCTemplate) => {
    setTemplates(prev => [template, ...prev]);
    setIsImporting(false);
  };

  return (
    <div className="flex flex-col h-full bg-white animate-fade-in text-gray-800">
      
      {/* Modals Overlay */}
      {isImporting && (
        <ProtocolImport 
          onClose={() => setIsImporting(false)} 
          onImportComplete={handleImportedTemplate} 
        />
      )}

      {isCreating && (
        <ProtocolCreator
          onClose={() => setIsCreating(false)}
          onSave={handleSaveNewTemplate}
        />
      )}

      {/* Top Header */}
      <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0 bg-white">
        <div className="flex items-center gap-4">
           <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors"><ArrowLeft size={20} /></button>
           <div>
             <h1 className="text-base font-bold text-gray-800">实验设计</h1>
             <p className="text-[10px] text-gray-400 font-medium">Design of Experiments (DoE)</p>
           </div>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
             <button className="px-3 py-1.5 text-xs font-medium text-gray-500 rounded-md hover:bg-white hover:shadow-sm transition-all">设计助手</button>
             <button className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-white shadow-sm rounded-md">PTC库</button>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-6 overflow-hidden bg-gray-50/30">
        
        {/* Title Area */}
        <div className="mb-6">
            <h2 className="text-sm font-bold text-gray-800">PTC 实验模板库</h2>
            <p className="text-xs text-gray-400 mt-1">Protocol Template Component Library</p>
        </div>

        {/* Action Bar */}
        <div className="flex gap-3 mb-6">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                    type="text" 
                    placeholder="搜索实验模板..." 
                    className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 focus:border-blue-500 rounded-lg shadow-sm transition-all outline-none hover:border-blue-300" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                />
            </div>
            <button 
              onClick={() => setIsImporting(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
                <Upload size={14} /> 导入
            </button>
            <button onClick={() => setIsCreating(true)} className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                <Plus size={14} /> 新建
            </button>
        </div>

        {/* Main Split Content */}
        <div className="flex-1 flex gap-6 overflow-hidden">
            
            {/* Left Sidebar Tree */}
            <aside className="w-56 flex-shrink-0 overflow-y-auto custom-scrollbar pr-2">
                <div className="space-y-1">
                    {CATEGORY_TREE.map(node => {
                        const isExpanded = expandedCategories.includes(node.id);
                        return (
                            <div key={node.id}>
                                <button 
                                    onClick={() => handleCategoryClick(node.id, !!node.children?.length)}
                                    className="w-full flex items-center gap-2 px-2 py-2 text-xs font-bold text-gray-600 hover:text-blue-600 transition-colors rounded-lg group"
                                >
                                    <ChevronRight size={14} className={`text-gray-300 group-hover:text-blue-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                                    {node.icon && <node.icon size={14} />}
                                    <span>{node.label}</span>
                                </button>
                                
                                {isExpanded && node.children && (
                                    <div className="ml-4 pl-2 border-l border-gray-100 space-y-1 my-1">
                                        {node.children.map(child => {
                                            const isActive = activeCategory === child.id;
                                            return (
                                                <button
                                                    key={child.id}
                                                    onClick={() => setActiveCategory(child.id)}
                                                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg transition-all text-left ${
                                                        isActive 
                                                            ? 'bg-blue-50 text-blue-600 font-bold' 
                                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <div className={`w-1 h-1 rounded-full ${isActive ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                                                    {child.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </aside>

            {/* Right Card Grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 pb-10">
                    {templates.map(template => (
                        <div 
                            key={template.id} 
                            onClick={() => onOpenWorkbench(template)}
                            className="bg-white border border-gray-200 rounded-xl p-5 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all group flex flex-col h-full"
                        >
                            <div className="flex items-start gap-4 mb-3">
                                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <FileText size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-bold text-gray-800 mb-1 truncate group-hover:text-blue-600 transition-colors">
                                        {template.title}
                                    </h3>
                                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                                        {template.description}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-6 mt-auto">
                                {template.tags.map(tag => (
                                    <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-md font-medium border border-gray-100">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-50 text-[10px] text-gray-400">
                                <div className="flex items-center gap-1.5">
                                    <Tag size={12} />
                                    <span>{template.category || '通用'}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Calendar size={12} />
                                    <span>{template.date}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};
