import React from 'react';
import { Bot, Loader2, Radio, CheckCircle, AlertCircle, Zap, Clock } from 'lucide-react';

const BotStatusBadge = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
      case 'scheduled':
        return { 
          icon: <Clock className="w-3 h-3" />, 
          text: 'Upcoming', 
          color: 'text-text-muted', 
          bg: 'bg-brand-bg/50',
          border: 'border-brand-border'
        };
      case 'bot_joining':
        return { 
          icon: <Loader2 className="w-3 h-3 animate-spin" />, 
          text: 'Joining Call', 
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
      case 'transcribing':
        return { 
          icon: <Loader2 className="w-3 h-3 animate-spin" />, 
          text: 'AI Processing', 
          color: 'text-indigo-400', 
          bg: 'bg-indigo-500/10',
          border: 'border-indigo-500/20'
        };
      case 'summarizing':
        return { 
          icon: <Zap className="w-3 h-3 animate-pulse" />, 
          text: 'Summarizing', 
          color: 'text-blue-400', 
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/20'
        };
      case 'completed':
        return { 
          icon: <CheckCircle className="w-3 h-3" />, 
          text: 'Analysis Ready', 
          color: 'text-emerald-400', 
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/20'
        };
      case 'failed':
        return { 
          icon: <AlertCircle className="w-3 h-3" />, 
          text: 'Bot Failed', 
          color: 'text-red-500', 
          bg: 'bg-red-500/10',
          border: 'border-red-500/20'
        };
      default:
        return { 
          icon: <Bot className="w-3 h-3" />, 
          text: status?.replace('_', ' ') || 'Idle', 
          color: 'text-text-muted', 
          bg: 'bg-brand-bg/50',
          border: 'border-brand-border'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.bg} ${config.border} ${config.color} shadow-sm backdrop-blur-md`}>
      {config.icon}
      <span className="text-[9px] font-black uppercase tracking-[0.15em]">{config.text}</span>
    </div>
  );
};

export default BotStatusBadge;
