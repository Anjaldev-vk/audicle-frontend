import React from 'react';

const EmptyState = (props) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-brand-surface border border-brand-border flex items-center justify-center mb-6 shadow-xl shadow-brand-border/20">
        <props.icon size={32} className="text-text-muted" />
      </div>
      <h3 className="text-xl font-bold text-text-main mb-2">{props.title}</h3>
      <p className="text-text-muted text-sm max-w-xs mb-8">{props.description}</p>
      {props.action}
    </div>
  );
};

export default EmptyState;
