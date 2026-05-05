import React from 'react';
import { Bot, Loader2, Radio } from 'lucide-react';

const BotStatusBadge = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'bot_joining':
        return { 
          icon: <Loader2 className="w-3 h-3 animate-spin" />, 
          text: 'Bot Joining', 
          color: 'text-amber-400', 
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/20'
        };
      case 'recording':
        return { 
          icon: <Radio className="w-3 h-3 animate-pulse" />, 
          text: 'Live Recording', 
          color: 'text-red-400', 
          bg: 'bg-red-500/10',
          border: 'border-red-500/20'
        };
      case 'processing':
        return { 
          icon: <Loader2 className="w-3 h-3 animate-spin" />, 
          text: 'AI Processing', 
          color: 'text-indigo-400', 
          bg: 'bg-indigo-500/10',
          border: 'border-indigo-500/20'
        };
      case 'completed':
        return { 
          icon: <Bot className="w-3 h-3" />, 
          text: 'Analysis Ready', 
          color: 'text-green-400', 
          bg: 'bg-green-500/10',
          border: 'border-green-500/20'
        };
      default:
        return { 
          icon: <Bot className="w-3 h-3" />, 
          text: status || 'Idle', 
          color: 'text-gray-400', 
          bg: 'bg-white/5',
          border: 'border-white/10'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${config.bg} ${config.border} ${config.color}`}>
      {config.icon}
      <span className="text-[10px] font-bold uppercase tracking-widest">{config.text}</span>
    </div>
  );
};

export default BotStatusBadge;
