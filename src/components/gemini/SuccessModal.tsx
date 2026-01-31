
import React from 'react';
import { CheckCircle, Hash, Tag, AlertTriangle, Calendar, FileText } from 'lucide-react';
import type { ReportFormData } from '../../types';

interface SuccessModalProps {
  data: ReportFormData;
  onReset: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({ data, onReset }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="bg-primary p-6 text-center text-white">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4">
            <CheckCircle size={48} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold">Report Submitted!</h2>
          <p className="opacity-90">Thank you for helping keep our workplace safe.</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
              <Hash size={18} className="text-secondary opacity-50" />
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400">ID</p>
                <p className="text-sm font-semibold text-secondary truncate">{data.reportId}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
              <Calendar size={18} className="text-secondary opacity-50" />
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400">Date</p>
                <p className="text-sm font-semibold text-secondary">
                  {new Date(data.timestamp).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
              <div className="flex items-center space-x-3">
                <Tag size={18} className="text-primary" />
                <span className="font-semibold text-gray-700">Type</span>
              </div>
              <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                {data.concernType}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
              <div className="flex items-center space-x-3">
                <AlertTriangle size={18} className="text-alert" />
                <span className="font-semibold text-gray-700">Severity</span>
              </div>
              <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                data.severity === 'Fatal' ? 'bg-alert text-white' : 'bg-orange-100 text-orange-600'
              }`}>
                {data.severity}
              </span>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl">
             <div className="flex items-center space-x-2 mb-2">
                <FileText size={16} className="text-secondary opacity-50" />
                <p className="text-xs font-bold text-gray-400 uppercase">Description</p>
             </div>
             <p className="text-sm text-gray-600 italic line-clamp-3">"{data.description}"</p>
          </div>

          <button
            onClick={onReset}
            className="w-full py-4 bg-secondary text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 hover:bg-secondary/90"
          >
            Start Another Report
          </button>
        </div>
      </div>
    </div>
  );
};
