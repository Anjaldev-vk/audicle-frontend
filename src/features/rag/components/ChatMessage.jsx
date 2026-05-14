import React from 'react';
import { Sparkles, User } from 'lucide-react';

const ChatMessage = ({ message }) => {
  const isAi = message.role === 'assistant' || message.is_ai;

  return (
    <div className={`flex gap-4 mb-8 ${isAi ? 'flex-row' : 'flex-row-reverse'}`}>
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${isAi ? 'bg-indigo-600/10 border-indigo-500/20 text-indigo-400' : 'bg-brand-highlight border-brand-border text-text-muted'}`}>
        {isAi ? <Sparkles size={18} /> : <User size={18} />}
      </div>
      <div className={`flex flex-col gap-2 max-w-[85%] ${isAi ? 'items-start' : 'items-end'}`}>
        <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed ${isAi ? 'bg-brand-surface border border-brand-border text-text-main' : 'bg-blue-600 text-white shadow-xl shadow-blue-600/20'}`}>
          {message.content}
        </div>
        <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
          {isAi ? 'Audicle AI' : 'You'} • Just now
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
