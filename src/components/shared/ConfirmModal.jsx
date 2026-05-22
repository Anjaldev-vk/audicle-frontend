import React from 'react';
import { X, AlertCircle } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', type = 'danger' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center md:p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 hidden md:block" onClick={onClose} />
      <div className="relative bg-brand-surface md:border border-brand-border rounded-none md:rounded-3xl p-6 md:p-8 max-w-md w-full h-full md:h-auto overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-full md:slide-in-from-bottom-0 md:zoom-in duration-300 flex flex-col justify-center">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${type === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
              <AlertCircle size={20} />
            </div>
            <h2 className="text-xl font-bold text-text-main">{title}</h2>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-main transition-colors">
            <X size={20} />
          </button>
        </div>
        <p className="text-text-muted text-sm mb-8 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-brand-highlight hover:opacity-80 text-text-main border border-brand-border rounded-xl text-xs font-bold tracking-widest transition-all"
          >
            CANCEL
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 py-3 ${type === 'danger' ? 'bg-red-600 hover:bg-red-500' : 'bg-blue-600 hover:bg-blue-500'} text-white rounded-xl text-xs font-bold tracking-widest transition-all shadow-xl ${type === 'danger' ? 'shadow-red-600/20' : 'shadow-blue-600/20'}`}
          >
            {confirmText.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
