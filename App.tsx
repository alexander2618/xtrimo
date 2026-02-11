
import React, { useState, useRef, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TabType, Message, ResearchStep, BioAnalysisResult, KnowledgeMode, PTCTemplate } from './types';
import { 
  Sparkles, Zap, Brain, BookOpen, Paperclip, Send, 
  ChevronDown, Settings, Microscope, Search, ExternalLink,
  TestTube, Target, Upload, File, X, CheckCircle2, ChevronRight, Loader2, Activity,
  Check, Layers, FlaskConical, Play, Info
} from 'lucide-react';
import { generateAIResponse } from './services/geminiService';
import { KnowledgeSelector } from './components/KnowledgeSelector';
import { ExperimentWorkbench } from './components/ExperimentWorkbench';
import { ProtocolManager } from './components/ProtocolManager';
import { KnowledgeGarden } from './components/KnowledgeGarden';
import { MOCK_ELISA_TEMPLATE } from './constants';

// Mock Knowledge Bases for reference in App
const MOCK_DB_REF: Record<string, string> = {
  'db-1': 'AI 核心研究文献库',
  'db-2': '生物医学文献',
  'db-3': '临床试验数据',
  'f-1': 'Martinkus et al_2023.pdf',
  'f-2': 'DeepLearning_Review.pdf',
  'f-3': 'Protein_Structure.docx'
};

type ViewMode = 'chat' | 'protocol_manager' | 'workbench' | 'knowledge_garden';

const BioTabs: React.FC<{ result: BioAnalysisResult }> = ({ result }) => {
  const [tab, setTab] = useState<'summary' | 'code'>('summary');

  return (
    <div className="mt-4 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="flex border-b border-gray-100">
        <button 
          onClick={() => setTab('summary')}
          className={`flex-1 py-2 text-xs font-bold transition-colors ${tab === 'summary' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          分析结论
        </button>
        <button 
          onClick={() => setTab('code')}
          className={`flex-1 py-2 text-xs font-bold transition-colors ${tab === 'code' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          Code & Thinking
        </button>
      </div>
      <div className="p-4">
        {tab === 'summary' && (
          <div className="text-sm text-gray-700 leading-relaxed animate-fade-in">
            {result.summary}
            {result.charts && result.charts.length > 0 && (
               <div className="mt-3 p-4 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400">
                 [Charts Visualization Placeholder]
               </div>
            )}
          </div>
        )}
        {tab === 'code' && (
          <div className="space-y-3 animate-fade-in">
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
               <h5 className="text-[10px] font-bold text-amber-600 uppercase mb-1">Thinking Process</h5>
               <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">{result.thinking}</p>
            </div>
            <div className="relative group">
              <div className="absolute right-2 top-2 px-2 py-1 bg-white/10 rounded text-[10px] text-white/50">Python</div>
              <pre className="p-3 bg-slate-800 text-slate-200 rounded-lg text-[10px] font-mono overflow-x-auto">
                <code>{result.code}</code>
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [viewMode, setViewMode] = useState<ViewMode>('chat');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Knowledge Enhancement State
  const [showKnowledgeSelector, setShowKnowledgeSelector] = useState(false);
  const [knowledgeMode, setKnowledgeMode] = useState<KnowledgeMode>('base');
  const [selectedKnowledgeIds, setSelectedKnowledgeIds] = useState<string[]>([]);
  const [useKnowledgePlus, setUseKnowledgePlus] = useState(false);
  
  // Research & Target Shared State
  const [researchSteps, setResearchSteps] = useState<ResearchStep[]>([]);
  const [isResearchPanelOpen, setIsResearchPanelOpen] = useState(false);
  const [researchProgress, setResearchProgress] = useState(0);
  const [panelTitle, setPanelTitle] = useState('研究任务流');

  // Bio State
  const [uploadedFiles, setUploadedFiles] = useState<{name: string, size: string}[]>([]);

  // Experiment State
  const [selectedTemplate, setSelectedTemplate] = useState<PTCTemplate | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, researchSteps]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    if (activeTab === 'research') {
      setPanelTitle('深度研究任务流');
      setIsResearchPanelOpen(true);
      await performResearchFlow(currentInput);
    } else if (activeTab === 'target') {
      setPanelTitle('靶点调研任务流');
      setIsResearchPanelOpen(true);
      await performTargetFlow(currentInput);
    } else if (activeTab === 'bio') {
      await performBioFlow(currentInput);
    } else if (activeTab === 'experiment') {
      await performExperimentFlow(currentInput);
    } else {
      await performStandardFlow(currentInput);
    }
    
    setIsLoading(false);
  };

  const performStandardFlow = async (query: string) => {
    const isSearchMode = activeTab === 'basic'; 
    let retrievalLogic = "";
    
    const hasKnowledge = selectedKnowledgeIds.length > 0 || useKnowledgePlus;

    if (hasKnowledge) {
      const selectedNames = selectedKnowledgeIds.map(id => MOCK_DB_REF[id] || id).join(', ');
      retrievalLogic = `正在调用知识增强模块...\n1. 增强模式：${knowledgeMode === 'base' ? '知识库' : '文件检索'}\n2. 选中源：${selectedNames || '无'}\n3. Knowledge+：${useKnowledgePlus ? '启用 (High Precision)' : '禁用'}\n4. 检索策略：正在对选中范围进行多路召回，并结合 Knowledge+ 专有模型进行事实核验。`;
    }

    const sysPrompt = `You are xTrimo Discovery Assistant. Knowledge Enhancement: ${hasKnowledge ? `ON (Mode: ${knowledgeMode}, IDs: ${selectedKnowledgeIds.join(',')}, Plus: ${useKnowledgePlus})` : 'OFF'}.`;
    const { text, sources } = await generateAIResponse(query, sysPrompt, isSearchMode);
    
    setMessages(prev => [...prev, { 
      id: Date.now().toString(), 
      role: 'assistant', 
      content: text, 
      timestamp: Date.now(), 
      sources,
      retrievalLogic: hasKnowledge ? retrievalLogic : undefined
    }]);
  };

  const performResearchFlow = async (query: string) => {
    setResearchProgress(15);
    setResearchSteps([
      { label: '需求分析与意图识别', status: 'loading' },
      { label: '多源信息检索 (PubMed, Arxiv, Web)', status: 'pending' },
      { label: '信息抽取与关联分析', status: 'pending' },
      { label: '深度总结与报告生成', status: 'pending' }
    ]);
    
    await new Promise(r => setTimeout(r, 1500));
    setResearchSteps(prev => prev.map((s, i) => i === 0 ? {...s, status: 'completed'} : i === 1 ? {...s, status: 'loading'} : s));
    setResearchProgress(40);

    setMessages(prev => [...prev, { 
      id: Date.now().toString(), 
      role: 'assistant', 
      content: `已为您启动“深度研究”任务。正在为您调研：${query.substring(0, 20)}...\n点击下方卡片查看实时进展。`, 
      timestamp: Date.now(),
      isClarification: true
    }]);
  };

  const performTargetFlow = async (query: string) => {
    setResearchProgress(20);
    setResearchSteps([
      { label: '靶点基本信息检索 (UniProt/PDB)', status: 'loading' },
      { label: '信号通路与 PPI 网络分析', status: 'pending' },
      { label: '关联疾病与临床进展扫描', status: 'pending' },
      { label: '药物开发景观分析', status: 'pending' }
    ]);
    
    await new Promise(r => setTimeout(r, 1800));
    setResearchSteps(prev => prev.map((s, i) => i === 0 ? {...s, status: 'completed'} : i === 1 ? {...s, status: 'loading'} : s));
    setResearchProgress(45);

    setMessages(prev => [...prev, { 
      id: Date.now().toString(), 
      role: 'assistant', 
      content: `靶点调研任务已开启。正在检索 ${query} 的多维生物学数据...\n您可以点击任务详情查看具体的检索项和思考逻辑。`, 
      timestamp: Date.now(),
      isClarification: true
    }]);
  };

  const performBioFlow = async (query: string) => {
    setMessages(prev => [...prev, { 
      id: Date.now().toString(), 
      role: 'assistant', 
      content: "分析任务已启动。正在处理上传的数据文件并生成执行脚本...", 
      timestamp: Date.now() 
    }]);
    
    await new Promise(r => setTimeout(r, 3000));
    
    const bioResult: BioAnalysisResult = {
      summary: "本次分析基于设定的阈值（padj < 0.05 且 |Log2FC| > 1.0），共鉴定出 142 个显著上调基因和 89 个显著下调基因。PCA 结果显示，处理组与对照组在 PC1 轴上具有显著的分群特征。",
      thinking: "1. 读取 CSV 表达矩阵\n2. 进行 Log2 转化与归一化\n3. 使用 Scipy 进行差异分析\n4. 生成火山图与 PCA 散点图",
      code: "import pandas as pd\nimport numpy as np\nfrom scipy import stats\n\n# Loading data...\ndata = pd.read_csv('expression_data.csv')\n# Differential Analysis Logic\n# ..."
    };

    setMessages(prev => [...prev, { 
      id: Date.now().toString(), 
      role: 'assistant', 
      content: "分析已完成。以下是详细结果报告：", 
      timestamp: Date.now(),
      bioResult
    }]);
  };

  // Logic for Experiment Design Flow
  const performExperimentFlow = async (query: string) => {
    if (!query.toLowerCase().includes('elisa') && !query.toLowerCase().includes('design') && !query.toLowerCase().includes('protocol') && !query.toLowerCase().includes('实验')) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "在“实验设计”模式下，请专注于咨询具体的实验方案设计或 Protocol 生成。例如：“设计一个 Sandwich ELISA 实验”。",
        timestamp: Date.now()
      }]);
      return;
    }

    if (query.length < 10) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "收到。为了为您匹配最合适的 PTC (Protocol Template Component)，请确认您的实验目的：\n\n1. 是用于大规模**初筛** (Screening)？\n2. 还是用于精准**定量** (Quantification)？",
        timestamp: Date.now()
      }]);
      return;
    }

    await new Promise(r => setTimeout(r, 1000));
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'assistant',
      content: "已检索到 3 个相关 PTC 模板。推荐使用 **ELISA 标准操作流程 (Sandwich Method)**。",
      timestamp: Date.now(),
      ptcSuggestions: [MOCK_ELISA_TEMPLATE]
    }]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).map((f: File) => ({ 
        name: f.name, 
        size: (f.size / 1024 / 1024).toFixed(2) + 'MB' 
      }));
      setUploadedFiles(prev => [...prev, ...files]);
    }
  };

  const getKnowledgeLabel = () => {
    const count = selectedKnowledgeIds.length;
    if (count === 0 && !useKnowledgePlus) return '知识增强';
    const parts = [];
    if (useKnowledgePlus) parts.push('K+');
    if (count > 0) parts.push(`${count}源`);
    return parts.join(' | ');
  };

  const isKnowledgeActive = selectedKnowledgeIds.length > 0 || useKnowledgePlus;

  const openWorkbench = (template: PTCTemplate) => {
    setSelectedTemplate(template);
    setViewMode('workbench');
  };

  const handleSidebarNavigate = (key: string) => {
    if (key === 'protocol') {
      setViewMode('protocol_manager');
    } else if (key === 'garden') {
      setViewMode('knowledge_garden');
    } else {
        setViewMode('chat');
    }
  };

  // Determine active key for Sidebar
  const getActiveSidebarKey = () => {
    if (viewMode === 'knowledge_garden') return 'garden';
    if (viewMode === 'protocol_manager' || viewMode === 'workbench') return 'protocol';
    return 'chat';
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      <Sidebar onNavigate={handleSidebarNavigate} activeKey={getActiveSidebarKey()} />
      
      <main className="flex-1 flex overflow-hidden relative">
        
        {viewMode === 'protocol_manager' ? (
             <div className="w-full h-full flex flex-col">
                <ProtocolManager 
                    onClose={() => setViewMode('chat')}
                    onOpenWorkbench={openWorkbench}
                />
             </div>
        ) : viewMode === 'workbench' ? (
             <div className="w-full h-full flex flex-col">
                <ExperimentWorkbench 
                    initialTemplate={selectedTemplate} 
                    onClose={() => setViewMode('protocol_manager')} 
                />
             </div>
        ) : viewMode === 'knowledge_garden' ? (
             <div className="w-full h-full flex flex-col">
                <KnowledgeGarden />
             </div>
        ) : (
            <>
                <div className={`flex-1 flex flex-col transition-all duration-300 ${isResearchPanelOpen ? 'mr-80' : ''}`}>
                <div className="flex-1 overflow-y-auto px-6 pb-64 pt-12 max-w-4xl mx-auto w-full no-scrollbar" ref={scrollRef}>
                    {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
                        <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-blue-200">
                        <Sparkles className="text-white" size={40} />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-800 mb-4 tracking-tight">xTrimo 发现助手</h1>
                        <p className="text-gray-400 max-w-md mx-auto mb-12">专业的生命科学 AI 专家。我可以协助您进行深度科研调研、自动化生信分析及实验方案设计。</p>
                        <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
                        {['深度探讨阿尔茨海默病的分子机制', '分析 HER2 靶点在乳腺癌中的耐药性', 'RNA-Seq 数据的标准化与差异表达分析', '设计一个 Sandwich ELISA 实验方案'].map((q, i) => (
                            <button key={i} onClick={() => {setInput(q); setActiveTab(i === 1 ? 'target' : i === 2 ? 'bio' : i === 3 ? 'experiment' : 'research')}} className="p-4 bg-white border border-gray-100 rounded-2xl text-left text-sm text-gray-600 hover:border-blue-400 hover:shadow-md transition-all">
                            {q}
                            </button>
                        ))}
                        </div>
                    </div>
                    ) : (
                    <div className="space-y-8">
                        {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[90%] p-5 rounded-3xl shadow-sm border ${
                            msg.role === 'user' ? 'bg-blue-600 text-white border-blue-500' : 'bg-white text-gray-800 border-gray-100'
                            }`}>
                            {msg.role === 'assistant' && msg.retrievalLogic && (
                                <div className="mb-4 p-4 bg-gray-50 border border-gray-100 rounded-2xl animate-fade-in">
                                <div className="flex items-center gap-2 mb-2 text-gray-400">
                                    <Layers size={12} className="text-gray-400" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">知识调用链路</span>
                                </div>
                                <p className="text-[11px] text-gray-500 font-medium leading-relaxed whitespace-pre-wrap">
                                    {msg.retrievalLogic}
                                </p>
                                </div>
                            )}

                            <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{msg.content}</p>
                            
                            {msg.isClarification && (
                                <div onClick={() => setIsResearchPanelOpen(true)} className="mt-4 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl cursor-pointer hover:bg-blue-50 transition-all flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
                                    {activeTab === 'target' ? <Target className="text-white" size={20} /> : <Zap className="text-white" size={20} />}
                                    </div>
                                    <div className="flex flex-col">
                                    <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">{activeTab === 'target' ? '靶点调研任务中' : '深度研究任务中'}</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-600" style={{ width: `${researchProgress}%` }} />
                                        </div>
                                        <span className="text-[10px] text-blue-600 font-bold">{researchProgress}%</span>
                                    </div>
                                    </div>
                                </div>
                                <ChevronRight className="text-blue-400 group-hover:translate-x-1 transition-transform" size={18} />
                                </div>
                            )}

                            {msg.ptcSuggestions && msg.ptcSuggestions.map(ptc => (
                                <div key={ptc.id} className="mt-4 border border-indigo-100 bg-indigo-50/30 rounded-2xl p-4 transition-all hover:bg-indigo-50 group">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg"><FlaskConical size={16}/></div>
                                    <h4 className="text-sm font-bold text-gray-800">{ptc.title}</h4>
                                    </div>
                                    <span className="text-[10px] bg-white border border-gray-200 text-gray-500 px-2 py-0.5 rounded-full">PTC Template</span>
                                </div>
                                <p className="text-xs text-gray-600 mb-3 leading-relaxed">{ptc.description}</p>
                                <div className="flex gap-2 mb-4">
                                    {ptc.tags.map(tag => <span key={tag} className="text-[10px] bg-white text-gray-500 px-2 py-1 rounded border border-gray-100">{tag}</span>)}
                                </div>
                                <button 
                                    onClick={() => openWorkbench(ptc)}
                                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm shadow-indigo-100"
                                >
                                    <Play size={12} /> 使用此模板创建工作台
                                </button>
                                </div>
                            ))}

                            {msg.bioResult && <BioTabs result={msg.bioResult} />}
                            {msg.sources && msg.sources.length > 0 && (
                                <div className="mt-5 pt-4 border-t border-gray-50 flex flex-wrap gap-2">
                                {msg.sources.map((s, i) => (
                                    <a key={i} href={s.uri} target="_blank" className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors flex items-center gap-1">
                                    <ExternalLink size={10} /> {s.title}
                                    </a>
                                ))}
                                </div>
                            )}
                            </div>
                        </div>
                        ))}
                    </div>
                    )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none">
                    <div className="max-w-4xl mx-auto w-full pointer-events-auto bg-white rounded-3xl shadow-2xl border border-gray-100 p-2 relative flex flex-col gap-2">
                    
                    <div className="flex justify-center -mt-14 mb-2">
                        <div className="inline-flex p-1 bg-white border border-gray-100 rounded-full shadow-lg">
                        {[
                            { id: 'basic', label: '基础问答', icon: Sparkles },
                            { id: 'bio', label: '生信分析', icon: Brain },
                            { id: 'research', label: '深度研究', icon: Zap },
                            { id: 'experiment', label: '实验设计', icon: TestTube },
                            { id: 'target', label: '靶点调研', icon: Target },
                        ].map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id as TabType)} className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
                            <tab.icon size={14} /> {tab.label}
                            </button>
                        ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 px-3 relative">
                        {showKnowledgeSelector && (
                        <KnowledgeSelector 
                            onClose={() => setShowKnowledgeSelector(false)}
                            onSelect={(mode, ids) => {
                            setKnowledgeMode(mode);
                            setSelectedKnowledgeIds(ids);
                            }}
                            activeMode={knowledgeMode}
                            selectedIds={selectedKnowledgeIds}
                            useKnowledgePlus={useKnowledgePlus}
                            onToggleKnowledgePlus={setUseKnowledgePlus}
                        />
                        )}

                        <div className="flex items-center gap-3 py-2 border-b border-gray-50 overflow-x-auto no-scrollbar">
                        {activeTab === 'basic' && (
                            <div className="flex items-center gap-4">
                            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl text-[11px] font-bold transition-colors">
                                <Settings size={14} /> 工具
                            </button>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl text-[11px] font-bold transition-colors">
                                <Zap size={14} /> 推理
                            </button>
                            
                            <div className="h-4 w-px bg-gray-200 mx-1" />

                            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl text-[11px] font-bold transition-colors">
                                <Search size={14} /> 联网搜索
                            </button>

                            <button 
                                onClick={() => setShowKnowledgeSelector(!showKnowledgeSelector)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
                                isKnowledgeActive || showKnowledgeSelector
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                                    : 'bg-gray-50 text-gray-600 border-transparent hover:bg-gray-100'
                                }`}
                            >
                                <BookOpen size={14} />
                                <span>{getKnowledgeLabel()}</span>
                                {isKnowledgeActive && <div className="w-1.5 h-1.5 bg-white rounded-full ml-1" />}
                                <ChevronDown size={12} className={`transition-transform duration-200 ${showKnowledgeSelector ? 'rotate-180' : ''}`} />
                            </button>
                            </div>
                        )}

                        {(activeTab === 'research' || activeTab === 'target') && (
                            <div className="flex items-center gap-4">
                            <span className="text-[11px] font-bold text-blue-600 flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-xl"><Activity size={14} /> {activeTab === 'target' ? '靶点多维扫描已开启' : '深度思考已开启'}</span>
                            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl"><Search size={14} /> 联网搜索已开启</span>
                            </div>
                        )}

                        {activeTab === 'experiment' && (
                            <div className="flex items-center gap-4">
                                <span className="text-[11px] font-bold text-indigo-600 flex items-center gap-1.5 bg-indigo-50 px-3 py-1.5 rounded-xl"><FlaskConical size={14} /> DoE 实验设计助手已就绪</span>
                                <span className="text-[11px] font-bold text-gray-500 flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl"><Check size={14} /> 自动检索 PTC 库</span>
                            </div>
                        )}

                        {activeTab === 'bio' && (
                            <div className="flex items-center gap-2">
                            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-[11px] font-bold cursor-pointer transition-colors">
                                <Upload size={14} /> 上传数据
                                <input type="file" multiple className="hidden" onChange={handleFileUpload} />
                            </label>
                            <div className="flex gap-1 overflow-x-auto max-w-sm no-scrollbar">
                                {uploadedFiles.map((f, i) => (
                                <div key={i} className="flex-shrink-0 flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md text-[9px] text-gray-600"><File size={10} /> {f.name} <X size={10} className="cursor-pointer hover:text-red-500" onClick={() => setUploadedFiles(prev => prev.filter((_, idx) => idx !== i))} /></div>
                                ))}
                            </div>
                            </div>
                        )}
                        </div>

                        <div className="flex items-center gap-3 px-1 pb-1">
                        <input 
                            type="text" 
                            placeholder={
                            activeTab === 'research' ? "请输入您的研究课题或核心问题..." :
                            activeTab === 'target' ? "输入靶点名称、蛋白ID或相关疾病..." :
                            activeTab === 'bio' ? "描述您的生信分析需求 (如：差异表达分析)..." :
                            activeTab === 'experiment' ? "描述实验目标，如：设计一个 Sandwich ELISA 方案..." :
                            "在此输入您的问题..."
                            }
                            className="flex-1 py-3 bg-transparent outline-none text-sm text-gray-700 font-medium px-3"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        
                        <div className="flex items-center gap-1">
                            {activeTab !== 'target' && (
                            <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><Paperclip size={20} /></button>
                            )}
                            <button onClick={handleSend} disabled={isLoading || !input.trim()} className={`p-3 rounded-2xl transition-all ${input.trim() ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 active:scale-95' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}>
                            <Send size={20} />
                            </button>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
            </>
        )}

        {isResearchPanelOpen && viewMode === 'chat' && (
          <div className="w-80 border-l border-gray-100 bg-white flex flex-col animate-slide-in shadow-2xl z-40 overflow-hidden">
            <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0">
              <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                {activeTab === 'target' ? <Target size={16} className="text-blue-600" /> : <Microscope size={16} className="text-blue-600" />}
                {panelTitle}
              </h4>
              <button onClick={() => setIsResearchPanelOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider"><span>总任务进度</span><span>{researchProgress}%</span></div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${researchProgress}%` }} /></div>
              </div>
              <div className="space-y-4">
                {researchSteps.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 space-y-2"><Loader2 size={24} className="animate-spin text-blue-200" /><p className="text-xs font-medium">任务编排中...</p></div>
                ) : (
                  researchSteps.map((step, i) => (
                    <div key={i} className="flex gap-3 group">
                      <div className="flex flex-col items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${step.status === 'completed' ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' : step.status === 'loading' ? 'bg-white border-blue-600 text-blue-600 animate-pulse' : 'bg-white border-gray-200 text-gray-300'}`}>
                          {step.status === 'completed' ? <CheckCircle2 size={12} /> : step.status === 'loading' ? <Activity size={12} /> : <ChevronRight size={12} />}
                        </div>
                        {i < researchSteps.length - 1 && <div className="w-0.5 h-full bg-gray-100 my-1" />}
                      </div>
                      <div className="flex-1 pt-0.5 pb-4">
                        <p className={`text-xs font-bold transition-colors ${step.status === 'loading' ? 'text-blue-600' : step.status === 'completed' ? 'text-gray-800' : 'text-gray-400'}`}>{step.label}</p>
                        {step.status === 'loading' && (
                          <div className="mt-2 p-2 bg-blue-50/50 rounded-lg border border-blue-50 flex items-start gap-2 animate-fade-in"><Info size={10} className="text-blue-400 mt-0.5" /><p className="text-[10px] text-blue-500 leading-relaxed font-medium">{activeTab === 'target' ? '正在检索高通量筛选数据并构建蛋白质相互作用关系网...' : 'Agent 正在阅读相关领域的 Top 10 文献并提取关键论据...'}</p></div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="p-4 border-t border-gray-50 bg-gray-50/50"><button className="w-full py-2.5 bg-white border border-red-100 text-red-500 text-[11px] font-bold rounded-xl hover:bg-red-50 transition-colors shadow-sm">取消当前{activeTab === 'target' ? '调研' : '研究'}</button></div>
          </div>
        )}
      </main>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        @keyframes slide-in { from { opacity: 0; transform: translateX(100%); } to { opacity: 1; transform: translateX(0); } }
        .animate-slide-in { animation: slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};
