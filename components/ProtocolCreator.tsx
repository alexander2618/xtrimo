
import React, { useState } from 'react';
import { 
  X, Info, Settings2, Beaker, Plus, Save, 
  Trash2, Sliders, ListChecks, Wrench, FilePlus2
} from 'lucide-react';
import { PTCTemplate } from '../types';

interface ProtocolCreatorProps {
  onClose: () => void;
  onSave: (template: PTCTemplate) => void;
}

export const ProtocolCreator: React.FC<ProtocolCreatorProps> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<PTCTemplate>>({
    title: '',
    version: 'V1.0',
    category: '分子克隆',
    description: '',
    slots_definition: [],
    resources: { hardware: [], consumables: [] },
    experimental_execution: { 
      preparation: [], 
      core_process: [], 
      technical_parameters: [], 
      control_safety: [] 
    }
  });

  const handleSave = () => {
    const newP: PTCTemplate = {
      id: `ptc-${Date.now()}`,
      title: formData.title || '未命名 Protocol',
      description: formData.description || '',
      tags: [formData.category || 'General'],
      blocks: [],
      date: new Date().toLocaleDateString(),
      ...formData
    } as PTCTemplate;
    onSave(newP);
  };

  const addItem = (path: string[], newItem: any) => {
    setFormData(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      let current = next;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      const lastKey = path[path.length - 1];
      current[lastKey] = [...(current[lastKey] || []), newItem];
      return next;
    });
  };

  const removeItem = (path: string[], index: number) => {
    setFormData(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      let current = next;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      const lastKey = path[path.length - 1];
      current[lastKey] = current[lastKey].filter((_: any, i: number) => i !== index);
      return next;
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-5xl h-[90vh] rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-gray-100">
        
        {/* Header */}
        <header className="px-10 py-6 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <FilePlus2 size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 tracking-tight">新建实验模板 (PTC)</h2>
              <p className="text-sm text-gray-400 mt-0.5 font-medium flex items-center gap-1.5">
                基于标准 Schema 定义结构化实验流程
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-gray-100 rounded-full text-gray-400 transition-all active:scale-90">
            <X size={24} />
          </button>
        </header>

        {/* Form Body */}
        <div className="flex-1 overflow-hidden flex bg-gray-50/30">
          {/* Navigation Sidebar */}
          <aside className="w-56 border-r border-gray-100 p-6 flex flex-col gap-1 shrink-0">
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 ml-2">编辑章节</p>
             {['基础属性', '插槽定义', '实验资源', '执行逻辑'].map((label, idx) => (
                <button key={idx} className={`w-full text-left px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${idx === 0 ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-white hover:text-gray-700'}`}>
                   {label}
                </button>
             ))}
          </aside>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
            <div className="max-w-3xl mx-auto space-y-8 pb-10">
              
              {/* Metadata Section */}
              <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Info size={16} className="text-blue-500" /> 基础元数据
                </h4>
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">SOP 标题</label>
                    <input 
                      className="w-full px-5 py-3 text-sm bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-300 rounded-2xl outline-none transition-all font-bold text-gray-800 shadow-inner" 
                      placeholder="例如: 质粒抽提标准操作流程"
                      value={formData.title} 
                      onChange={e => setFormData({...formData, title: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">实验分类</label>
                    <input 
                      className="w-full px-5 py-3 text-sm bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-300 rounded-2xl outline-none transition-all" 
                      value={formData.category} 
                      onChange={e => setFormData({...formData, category: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">版本号</label>
                    <input 
                      className="w-full px-5 py-3 text-sm bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-300 rounded-2xl outline-none transition-all" 
                      value={formData.version} 
                      onChange={e => setFormData({...formData, version: e.target.value})} 
                    />
                  </div>
                </div>
              </section>

              {/* Slots Definition */}
              <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                   <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Settings2 size={16} className="text-amber-500" /> 自定义插槽 (Slots)
                   </h4>
                   <button onClick={() => addItem(['slots_definition'], { slot_id: '', label: '', data_type: 'String', default_value: '', required: true })} className="text-[10px] font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg flex items-center gap-1">
                      <Plus size={14} /> 添加插槽
                   </button>
                </div>
                <div className="space-y-3">
                  {formData.slots_definition?.length === 0 && (
                    <div className="py-8 text-center border-2 border-dashed border-gray-50 rounded-2xl">
                       <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">暂无插槽定义</p>
                    </div>
                  )}
                  {formData.slots_definition?.map((slot, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 group">
                      <input placeholder="Slot ID" className="w-32 px-4 py-2 text-xs bg-white border border-gray-100 rounded-xl outline-none" value={slot.slot_id} onChange={e => {const next = [...(formData.slots_definition || [])]; next[i].slot_id = e.target.value; setFormData({...formData, slots_definition: next});}} />
                      <input placeholder="显示名称" className="flex-1 px-4 py-2 text-xs bg-white border border-gray-100 rounded-xl outline-none" value={slot.label} onChange={e => {const next = [...(formData.slots_definition || [])]; next[i].label = e.target.value; setFormData({...formData, slots_definition: next});}} />
                      <button onClick={() => removeItem(['slots_definition'], i)} className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={14}/></button>
                    </div>
                  ))}
                </div>
              </section>

              {/* Resources */}
              <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                   <Beaker size={16} className="text-indigo-500" /> 实验资源库
                </h4>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-[10px] font-bold text-gray-500 flex items-center gap-1"><Wrench size={12}/> 仪器设备</p>
                      <button onClick={() => addItem(['resources', 'hardware'], { name: '', vendor: '' })} className="text-[10px] font-bold text-indigo-600">+ 新增</button>
                    </div>
                    <div className="space-y-2">
                       {formData.resources?.hardware.map((h, i) => (
                         <div key={i} className="flex gap-2">
                            <input className="flex-1 px-4 py-2 text-xs bg-gray-50 rounded-xl border-none outline-none focus:bg-white" placeholder="设备名称" value={h.name} onChange={e => {const next = {...formData.resources} as any; next.hardware[i].name = e.target.value; setFormData({...formData, resources: next});}} />
                            <input className="w-32 px-4 py-2 text-xs bg-gray-50 rounded-xl border-none outline-none text-gray-400" placeholder="品牌/供应商" value={h.vendor} onChange={e => {const next = {...formData.resources} as any; next.hardware[i].vendor = e.target.value; setFormData({...formData, resources: next});}} />
                            <button onClick={() => removeItem(['resources', 'hardware'], i)} className="p-2 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                         </div>
                       ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Footer Actions (Bottom Right Alignment) */}
        <footer className="p-8 border-t border-gray-100 bg-white flex items-center justify-end shrink-0 gap-3">
          <button 
            onClick={onClose}
            className="px-8 py-3.5 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-2xl transition-all"
          >
            取消
          </button>
          <button 
            onClick={handleSave}
            className="px-10 py-3.5 bg-indigo-600 text-white font-bold text-sm rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2 active:scale-95"
          >
            <Save size={18} /> 保存模板
          </button>
        </footer>
      </div>
    </div>
  );
};
