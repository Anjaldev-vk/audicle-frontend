import React from 'react';

const StatusBadge = ({ status }) => {
  const getStyles = () => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'active':
      case 'success':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'processing':
      case 'pending':
      case 'warning':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'failed':
      case 'error':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStyles()}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
