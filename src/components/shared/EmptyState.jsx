import React from 'react';

const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-brand-surface border border-brand-border flex items-center justify-center mb-6 shadow-xl shadow-black/20">
        <Icon size={32} className="text-gray-600" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-500 text-sm max-w-xs mb-8">{description}</p>
      {action}
    </div>
  );
};

export default EmptyState;
