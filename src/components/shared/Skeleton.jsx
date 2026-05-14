import React from 'react';

const Skeleton = ({ className, circle = false }) => {
  return (
    <div 
      className={`bg-brand-surface border border-brand-border animate-pulse ${circle ? 'rounded-full' : 'rounded-2xl'} ${className}`}
      style={{
        background: 'linear-gradient(90deg, var(--brand-surface) 25%, var(--brand-highlight) 50%, var(--brand-surface) 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-loading 2s infinite linear'
      }}
    />
  );
};

export const CardSkeleton = () => (
  <div className="bg-brand-surface border border-brand-border rounded-[2.5rem] p-8 space-y-6">
    <div className="flex items-center justify-between">
      <Skeleton className="w-12 h-12 rounded-2xl" />
      <Skeleton className="w-20 h-6 rounded-full" />
    </div>
    <div className="space-y-3">
      <Skeleton className="w-3/4 h-8" />
      <Skeleton className="w-1/2 h-4" />
    </div>
    <div className="pt-6 border-t border-brand-border flex gap-4">
      <Skeleton className="flex-1 h-10" />
      <Skeleton className="flex-1 h-10" />
    </div>
  </div>
);

export const ListSkeleton = ({ count = 3 }) => (
  <div className="space-y-6">
    {Array(count).fill(0).map((_, i) => (
      <div key={i} className="flex items-center gap-6 p-6 bg-brand-surface border border-brand-border rounded-3xl">
        <Skeleton className="w-14 h-14 rounded-2xl shrink-0" />
        <div className="flex-1 space-y-3">
          <Skeleton className="w-1/3 h-5" />
          <Skeleton className="w-2/3 h-4" />
        </div>
        <Skeleton className="w-24 h-8 rounded-xl shrink-0" />
      </div>
    ))}
  </div>
);

export default Skeleton;
