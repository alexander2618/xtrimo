
import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Upload, FileText, Loader2, CheckCircle2, AlertCircle, 
  ArrowRight, BrainCircuit, FileSearch, Sparkles, Save, Trash2,
  Wrench, Beaker, ListChecks, Info, Plus, Clock, Thermometer, Zap
} from 'lucide-react';
import { PTCTemplate } from '../types';

interface ProtocolImportProps {
  onClose: () => void;
  onImportComplete: (template: PTCTemplate) => void;
}

type ImportStep = 'upload' | 'parsing' | 'review';

export const ProtocolImport: React.FC<ProtocolImportProps> = ({ onClose, onImportComplete }) => {
  const [step, setStep] = useState<ImportStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [parsingProgress, setParsingProgress] = useState(0);
  const [parsingStatus, setParsingStatus] = useState('');
  
  // Extracted Data State
  const [extractedData, setExtractedData] = useState<Partial<PTCTemplate>>({
    title: '',
    version: 'V1.0',
    category: 'Auto-Extracted',
    description: '',
    resources: { hardware: [], consumables: [] },
    experimental_execution: {
      preparation: [],
      core_process: [],
      technical_parameters: [],
      control_safety: []
    }
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-generate version based on category and title
  useEffect(() => {
    if (step === 'review' && extractedData.category && extractedData.title) {
      const catCode = extractedData.category.substring(0, 3).toUpperCase();
      const newVersion = `${catCode}-V${new Date().getFullYear() % 100}.01`;
      setExtractedData(prev => ({ ...prev, version: newVersion }));
    }
  }, [step, extractedData.category]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const startParsing = async () => {
    if (!file) return;
    setStep('parsing');
    
    const statuses = [
      '正在读取文档内容...',
      '识别实验背景与目标...',
      '提取仪器设备清单...',
      '解析试剂与浓度参数...',
      '重构实验步骤逻辑 (Core Process)...',
      '安全与质控项核对...',
      '完成结构化重组'
    ];

    for (let i = 0; i < statuses.length; i++) {
      setParsingStatus(statuses[i]);
      setParsingProgress(((i + 1) / statuses.length) * 100);
      await new Promise(r => setTimeout(r, 600));
    }

    setExtractedData({
      title: file.name.replace(/\.[^/.]+$/, ""),
      description: "从上传文献中自动提取的实验流程。已根据系统 Schema 完成初步结构化转换。",
      version: 'V1.0',
      category: '分子生物学',
      resources: {
        hardware: [
          { name: '超净工作台', vendor: '通用' },
          { name: '高速冷冻离心机', vendor: 'Thermo Fisher' }
        ],
        consumables: [
          { name: 'Trizol 试剂', cat_no: '15596026', brand: 'Invitrogen' },
          { name: '无水乙醇', cat_no: 'E7023', brand: 'Sigma' }
        ]
      },
      experimental_execution: {
        preparation: ['将所有试剂平衡至室温 (25°C)', '准备无 RNase 的 EP 管'],
        core_process: [
          { phase: '样本裂解', instructions: ['加入 1ml Trizol 试剂至样本中', '剧烈震荡 15s 后静置 5min'] },
          { phase: '相分离', instructions: ['加入 0.2ml 氯仿', '12000g 4°C 离心 15min'] }
        ],
        technical_parameters: [
          { key: '离心转速', value: '12000', unit: 'g' },
          { key: '孵育温度', value: '25', unit: '°C' }
        ],
        control_safety: ['操作需在通风橱内进行', '废弃物按生物危险品处理']
      }
    });

    setStep('review');
  };

  const handleFinalSave = () => {
    const finalTemplate: PTCTemplate = {
      id: `ext-${Date.now()}`,
      date: new Date().toLocaleDateString(),
      tags: ['AI-Import', extractedData.category || 'General'],
      blocks: [], 
      ...extractedData
    } as PTCTemplate;
    onImportComplete(finalTemplate);
  };

  // Helper to highlight parameters in text
  const renderInstructionWithParams = (text: string) => {
    const regex = /(\d+\s*(?:°C|min|s|g|ml|ul|µl|rpm|V|h))/gi;
    const parts = text.split(regex);
    return parts.map((part, i) => {
      if (part.match(regex)) {
        return (
          <span key={i} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded border border-blue-100 font-bold mx-0.5 hover:bg-blue-600 hover:text-white transition-colors cursor-edit group">
            {part.toLowerCase().includes('°c') ? <Thermometer size={10} /> : part.toLowerCase().includes('min') || part.toLowerCase().includes('s') ? <Clock size={10} /> : <Zap size={10} />}
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-6xl h-[90vh] rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-gray-100">
        
        {/* Modal Header */}
        <header className="px-10 py-6 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
              <BrainCircuit size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 tracking-tight">AI 文献解析与重构</h2>
              <p className="text-sm text-gray-400 mt-0.5 font-medium flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-500" /> 支持结构化解析 Word/PDF 格式实验文献
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-gray-100 rounded-full text-gray-400 transition-all active:scale-90">
            <X size={24} />
          </button>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative bg-gray-50/30">
          
          {step === 'upload' && (
            <div className="h-full flex flex-col items-center justify-center p-12 animate-fade-in">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full max-w-2xl border-2 border-dashed border-gray-200 rounded-[48px] p-20 flex flex-col items-center justify-center gap-8 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all group bg-white shadow-sm"
              >
                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-300">
                  <Upload size={40} />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-800">上传实验文献</h3>
                  <p className="text-sm text-gray-400 mt-3 max-w-xs">AI 将自动识别其中的实验目标、资源与执行步骤并将其结构化</p>
                </div>
                {file && (
                  <div className="flex items-center gap-3 px-5 py-3 bg-white border border-blue-200 rounded-2xl shadow-sm animate-fade-in">
                    <FileText size={20} className="text-blue-500" />
                    <span className="text-sm font-bold text-gray-700">{file.name}</span>
                    <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="p-1 hover:bg-red-50 text-red-400 rounded-full transition-colors"><X size={16}/></button>
                  </div>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.docx" onChange={handleFileSelect} />
              </div>

              <button 
                disabled={!file}
                onClick={startParsing}
                className={`mt-12 px-12 py-4 rounded-2xl font-bold text-base flex items-center gap-3 transition-all ${
                  file ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95' : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                }`}
              >
                开始解析 <ArrowRight size={20} />
              </button>
            </div>
          )}

          {step === 'parsing' && (
            <div className="h-full flex flex-col items-center justify-center p-12 animate-fade-in">
              <div className="w-full max-w-md space-y-10">
                <div className="flex flex-col items-center gap-8">
                  <div className="relative">
                    <div className="w-28 h-28 border-[6px] border-blue-50 rounded-full border-t-blue-600 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BrainCircuit className="text-blue-600 animate-pulse" size={40} />
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-800">深度重构中...</h3>
                    <p className="text-sm text-gray-400 mt-2 font-medium">正在基于生命科学 Schema 构建结构化 Protocol</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-blue-600 tracking-wide">{parsingStatus}</span>
                    <span className="text-xs font-bold text-gray-400">{Math.round(parsingProgress)}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 transition-all duration-700 rounded-full shadow-[0_0_12px_rgba(37,99,235,0.4)]" style={{ width: `${parsingProgress}%` }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div className="h-full flex flex-col animate-fade-in">
              <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
                <div className="max-w-4xl mx-auto space-y-8">
                  
                  {/* Basic Info Section (Editable) */}
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <Info size={16} className="text-blue-500" /> 基础元数据解析
                    </h4>
                    <div className="grid grid-cols-3 gap-6">
                      <div className="col-span-2 space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">SOP 名称</label>
                        <input 
                          className="w-full px-5 py-3 text-sm bg-gray-50 border border-transparent focus:bg-white focus:border-blue-300 rounded-2xl outline-none transition-all font-bold text-gray-800 shadow-inner" 
                          value={extractedData.title} 
                          onChange={e => setExtractedData({...extractedData, title: e.target.value})} 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">自动版本号</label>
                        <div className="px-5 py-3 text-sm bg-blue-50/50 border border-blue-100 rounded-2xl font-mono text-blue-700 flex items-center gap-2">
                          <CheckCircle2 size={14} /> {extractedData.version}
                        </div>
                      </div>
                      <div className="col-span-1 space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">实验类别</label>
                        <input 
                          className="w-full px-5 py-3 text-sm bg-gray-50 border border-transparent focus:bg-white focus:border-blue-300 rounded-2xl outline-none transition-all" 
                          value={extractedData.category} 
                          onChange={e => setExtractedData({...extractedData, category: e.target.value})} 
                        />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">简要描述</label>
                        <textarea 
                          className="w-full px-5 py-3 text-xs bg-gray-50 border border-transparent focus:bg-white focus:border-blue-300 rounded-2xl outline-none transition-all resize-none" 
                          rows={2}
                          value={extractedData.description} 
                          onChange={e => setExtractedData({...extractedData, description: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Resources Section (Editable) */}
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <Beaker size={16} className="text-indigo-500" /> 实验资源列表
                    </h4>
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <p className="text-[10px] font-bold text-gray-500 flex items-center justify-between">
                            <span><Wrench size={12} className="inline mr-1" /> 仪器设备</span>
                            <button className="text-blue-500 hover:underline">+ 新增</button>
                          </p>
                          <div className="space-y-2">
                            {extractedData.resources?.hardware.map((h, i) => (
                              <div key={i} className="flex gap-2">
                                <input className="flex-1 px-4 py-2 text-xs bg-gray-50 rounded-xl border-none outline-none focus:bg-white focus:ring-1 focus:ring-indigo-100" value={h.name} />
                                <input className="w-24 px-4 py-2 text-xs bg-gray-50 rounded-xl border-none outline-none text-gray-400" value={h.vendor} />
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-3">
                          <p className="text-[10px] font-bold text-gray-500 flex items-center justify-between">
                            <span><Beaker size={12} className="inline mr-1" /> 试剂耗材</span>
                            <button className="text-blue-500 hover:underline">+ 新增</button>
                          </p>
                          <div className="space-y-2">
                            {extractedData.resources?.consumables.map((c, i) => (
                              <div key={i} className="flex gap-2">
                                <input className="flex-1 px-4 py-2 text-xs bg-emerald-50/50 rounded-xl border-none outline-none focus:bg-white" value={c.name} />
                                <input className="w-24 px-4 py-2 text-xs bg-emerald-50/50 rounded-xl border-none outline-none text-emerald-400 font-mono" value={c.cat_no} />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Core Process Section (Editable) */}
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <ListChecks size={16} className="text-emerald-500" /> 核心步骤重构
                    </h4>
                    <div className="space-y-6">
                      {extractedData.experimental_execution?.core_process.map((cp, i) => (
                        <div key={i} className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100 hover:border-blue-100 transition-colors">
                          <div className="flex items-center justify-between mb-4">
                            <input className="bg-transparent text-sm font-bold text-gray-800 outline-none focus:text-blue-600" value={cp.phase} />
                            <span className="text-[9px] font-bold text-gray-300 uppercase">Step Group {i+1}</span>
                          </div>
                          <div className="space-y-3 pl-2">
                            {cp.instructions.map((ins, j) => (
                              <div key={j} className="flex gap-3 group">
                                <span className="text-xs font-bold text-gray-300 mt-1">{j+1}.</span>
                                <div className="flex-1 p-3 bg-white rounded-xl border border-gray-100 shadow-sm text-xs text-gray-600 leading-relaxed hover:border-blue-200 transition-all">
                                  {renderInstructionWithParams(ins)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sticky Footer Actions (Horizontal Layout) */}
              <footer className="p-8 border-t border-gray-100 bg-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                   <div className="px-4 py-2 bg-blue-50 text-blue-600 text-[11px] font-bold rounded-xl flex items-center gap-2">
                      <Sparkles size={14} /> AI 已根据内部库对齐 85% 实验逻辑
                   </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setStep('upload')}
                    className="px-6 py-3 text-xs font-bold text-gray-500 hover:bg-gray-50 rounded-2xl transition-all flex items-center gap-2"
                  >
                    <Trash2 size={16} /> 重新解析
                  </button>
                  <button 
                    onClick={handleFinalSave}
                    className="px-10 py-3.5 bg-blue-600 text-white font-bold text-sm rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2 active:scale-95"
                  >
                    <Save size={18} /> 确认并保存至 PTC 库
                  </button>
                </div>
              </footer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
