
import React from 'react';
import { 
  Plus, LayoutGrid, FileText, Database, 
  Search, ChevronLeft, FlaskConical
} from 'lucide-react';

interface SidebarProps {
  onNavigate?: (key: string) => void;
  activeKey?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate, activeKey = 'chat' }) => {
  return (
    <aside className="w-64 h-screen border-r border-gray-200 bg-white flex flex-col flex-shrink-0">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">xT</span>
          </div>
          <span className="font-semibold text-gray-800">xTrimo 发现助手</span>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded">
          <ChevronLeft size={18} className="text-gray-400" />
        </button>
      </div>

      <div className="px-3 mb-6">
        <button 
          onClick={() => onNavigate?.('chat')}
          className={`w-full flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors ${
            activeKey === 'chat' 
              ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm' 
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
          }`}
        >
          <Plus size={18} />
          <span className="font-medium">新建对话</span>
        </button>
      </div>

      <nav className="px-2 space-y-1">
        {[
          { key: 'garden', icon: LayoutGrid, label: '知识花园' },
          { key: 'files', icon: FileText, label: '文件中心' },
          { key: 'tools', icon: Database, label: '工具仓库' },
          { key: 'protocol', icon: FlaskConical, label: 'Protocol 管理' },
        ].map((item) => (
          <button 
            key={item.key} 
            onClick={() => onNavigate?.(item.key)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              activeKey === item.key 
                ? 'bg-blue-50 text-blue-600 font-bold' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <item.icon size={18} />
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-8 px-3">
        <div className="flex items-center justify-between mb-2 px-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">历史对话</span>
          <Search size={14} className="text-gray-400" />
        </div>
        
        <div className="space-y-4">
          <section>
            <h4 className="px-2 mb-1 text-xs text-gray-400">过去7天</h4>
            <div className="px-2 py-1.5 text-sm text-gray-600 truncate hover:bg-gray-50 rounded cursor-pointer">
              比较肿瘤与正常组织基因表达...
            </div>
          </section>
          
          <section>
            <h4 className="px-2 mb-1 text-xs text-gray-400">过去30天</h4>
            <div className="px-2 py-1.5 text-sm text-gray-600 truncate hover:bg-gray-50 rounded cursor-pointer">
              北京近三年人口变化总结
            </div>
          </section>
        </div>
      </div>

      <div className="mt-auto p-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold">
            S
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">siqi ma</p>
            <p className="text-xs text-blue-500 bg-blue-50 inline-block px-1 rounded">BioMap</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
