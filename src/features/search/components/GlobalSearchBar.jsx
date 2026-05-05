import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

const GlobalSearchBar = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative group w-full max-w-2xl mx-auto">
      <div className="absolute inset-0 bg-blue-600/20 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
      <div className="relative flex items-center bg-brand-surface border border-brand-border rounded-2xl px-6 py-4 transition-all group-focus-within:border-blue-500/50 group-focus-within:shadow-2xl group-focus-within:shadow-blue-600/10">
        {isLoading ? <Loader2 className="w-5 h-5 text-blue-500 animate-spin mr-4" /> : <Search className="w-5 h-5 text-gray-500 mr-4 group-focus-within:text-blue-400 transition-colors" />}
        <input
          type="text"
          placeholder="Search through all your meeting intelligence..."
          className="bg-transparent border-none focus:ring-0 text-white placeholder:text-gray-600 w-full outline-none text-base"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded-lg">
          <span className="text-[10px] font-bold text-gray-500">CMD</span>
          <span className="text-[10px] font-bold text-gray-500">K</span>
        </div>
      </div>
    </form>
  );
};

export default GlobalSearchBar;
