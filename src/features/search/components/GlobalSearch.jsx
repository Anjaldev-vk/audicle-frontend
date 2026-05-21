import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Video, FileText, CheckCircle, Loader2, X, Command, ChevronRight } from 'lucide-react';
import { useSearchQuery } from '../api/searchApi';
import { useGetMeetingsQuery } from '../../meetings/api/meetingsApi';
import useDebounce from '../../../hooks/useDebounce';

const GlobalSearch = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 500);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  const { data: resultsRes, isFetching: isSearchFetching } = useSearchQuery(
    { q: debouncedQuery },
    { skip: !debouncedQuery || debouncedQuery.length < 2 }
  );

  const { data: meetingsRes } = useGetMeetingsQuery(undefined, {
    skip: !debouncedQuery || debouncedQuery.length < 2
  });

  const apiResults = resultsRes?.data?.results || [];
  const meetingList = meetingsRes?.data?.results || [];
  
  // Local fallback: search meeting titles if backend Neural Search didn't catch them
  const localMeetingResults = meetingList
    .filter(m => m?.title?.toLowerCase().includes(debouncedQuery.toLowerCase()))
    .map(m => ({
      id: m.id,
      title: m.title,
      type: 'meeting',
      description: 'Meeting from workspace'
    }))
    .filter(m => !apiResults.some(api => api.id === m.id)); // Prevent duplicates

  const results = [...apiResults, ...localMeetingResults];
  const isFetching = isSearchFetching;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (result) => {
    setIsOpen(false);
    setQuery('');
    if (result.type === 'meeting') navigate(`/dashboard/meetings/${result.id}`);
    if (result.type === 'segment') navigate(`/dashboard/meetings/${result.meeting_id}?t=${result.start_time}`);
    if (result.type === 'action_item') navigate(`/dashboard/action-items`);
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className={`
        flex items-center bg-brand-surface border rounded-2xl px-4 py-2 w-72 lg:w-[450px] transition-all shadow-inner
        ${isOpen ? 'border-blue-500/50 ring-4 ring-blue-600/5' : 'border-brand-border'}
      `}>
        <Search className={`w-4 h-4 transition-colors ${query ? 'text-blue-500' : 'text-text-muted'}`} />
        <input 
          type="text" 
          placeholder="Search meeting intelligence..." 
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="bg-transparent border-none focus:ring-0 text-sm w-full px-3 text-text-main placeholder:text-text-muted/50 outline-none"
        />
        {isFetching ? (
          <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
        ) : query ? (
          <button onClick={() => setQuery('')} className="text-text-muted hover:text-text-main">
            <X size={14} />
          </button>
        ) : (
          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-brand-bg/5 border border-brand-border rounded-md">
            <Command className="w-2.5 h-2.5 text-text-muted" />
            <span className="text-[9px] font-bold text-text-muted">K</span>
          </div>
        )}
      </div>

      {isOpen && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-brand-surface border border-brand-border rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 bg-brand-highlight/30 border-b border-brand-border flex items-center justify-between">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Search Results</span>
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{results.length} found</span>
          </div>

          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {results.length > 0 ? (
              <div className="p-2 space-y-1">
                {results.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => handleResultClick(r)}
                    className="w-full flex items-start gap-4 p-4 hover:bg-brand-bg rounded-2xl transition-all group text-left"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      r.type === 'meeting' ? 'bg-blue-600/10 border-blue-500/20 text-blue-500' :
                      r.type === 'segment' ? 'bg-indigo-600/10 border-indigo-500/20 text-indigo-500' :
                      'bg-emerald-600/10 border-emerald-500/20 text-emerald-500'
                    }`}>
                      {r.type === 'meeting' ? <Video size={18} /> : 
                       r.type === 'segment' ? <FileText size={18} /> : 
                       <CheckCircle size={18} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-sm font-bold text-text-main truncate group-hover:text-blue-500 transition-colors">{r.title}</span>
                        <span className="text-[9px] font-black text-text-muted uppercase bg-brand-bg px-2 py-0.5 rounded-full border border-brand-border">{r.type}</span>
                      </div>
                      <p className="text-xs text-text-muted line-clamp-1 opacity-70">{r.description || r.snippet || 'Intelligence extracted'}</p>
                    </div>
                    <ChevronRight size={14} className="mt-1 text-text-muted opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
            ) : !isFetching ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-brand-bg/50 border border-brand-border flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-text-muted opacity-20" />
                </div>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">No matching intelligence found</p>
              </div>
            ) : null}
          </div>

          <div className="p-4 bg-brand-bg/50 border-t border-brand-border text-center">
             <button 
               onClick={() => {
                 navigate(`/dashboard/search?q=${encodeURIComponent(query)}`);
                 setIsOpen(false);
               }}
               className="text-[10px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-widest transition-all"
             >
               View advanced search index
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
