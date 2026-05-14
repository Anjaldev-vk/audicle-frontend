import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-4 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-xl bg-brand-surface border border-brand-border text-gray-500 hover:text-white disabled:opacity-50 transition-all"
      >
        <ChevronLeft size={20} />
      </button>
      <span className="text-sm font-bold text-text-main uppercase tracking-widest">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-xl bg-brand-surface border border-brand-border text-gray-500 hover:text-white disabled:opacity-50 transition-all"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default Pagination;
