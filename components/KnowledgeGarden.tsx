
import React from 'react';
import { MoreVertical, FileText, Calendar, Folder, ChevronDown, ChevronLeft } from 'lucide-react';

export const KnowledgeGarden: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-white animate-fade-in">
       {/* Header */}
       <div className="px-8 py-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-1 text-gray-400 text-xs mb-3 cursor-pointer hover:text-gray-600 w-fit">
             <ChevronLeft size={14} />
             <span>返回</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800">知识花园</h1>
          <p className="text-xs text-gray-500 mt-2">管理您的专属知识库，为问答提供更精准的答案</p>
       </div>

       {/* Toolbar */}
       <div className="px-8 py-6 flex justify-between items-center flex-shrink-0">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs text-gray-600 hover:border-gray-300 transition-colors">
             按创建时间排序
             <ChevronDown size={14} className="text-gray-400" />
          </button>
          <button className="px-4 py-2 bg-[#00B8D4] text-white rounded-md text-xs font-bold hover:bg-[#00A0B8] transition-colors shadow-sm">
             新建知识库
          </button>
       </div>

       {/* Grid Content */}
       <div className="flex-1 overflow-y-auto px-8 pb-8 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
             {/* Knowledge Base Card */}
             <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer group relative flex flex-col h-48">
                <div className="flex justify-between items-start mb-3">
                   <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white shadow-blue-200 shadow-md">
                      <Folder size={20} fill="currentColor" className="text-white"/>
                   </div>
                   <button className="p-1.5 text-gray-300 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
                      <MoreVertical size={16} />
                   </button>
                </div>
                
                <h3 className="text-sm font-bold text-gray-800 mb-auto mt-1">AI</h3>
                
                <div className="space-y-2.5 mt-4 pt-4 border-t border-gray-50">
                   <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
                      <FileText size={12} className="text-gray-400" />
                      <span>文件总数 14</span>
                   </div>
                   <div className="flex items-center gap-2 text-[10px] text-gray-400">
                      <Calendar size={12} className="text-gray-300" />
                      <span>创建时间 2025-12-29 12:03:36</span>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};
