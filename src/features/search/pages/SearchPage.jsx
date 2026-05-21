import React, { useState, useMemo } from 'react';
import AppLayout from '../../../components/layout/AppLayout';
import { Search, Activity, Video, FileText, ChevronRight, Loader2 } from 'lucide-react';
import GlobalSearchBar from '../components/GlobalSearchBar';
import { useSearchQuery } from '../api/searchApi';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import Skeleton from '../../../components/shared/Skeleton';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, meetings, transcripts, summaries
  const { data: results, isFetching } = useSearchQuery({ q: query, type: filter }, { skip: !query });

  const rawResults = useMemo(() => results?.data?.results || [], [results]);

  const hasResults = rawResults.length > 0;

  const renderResult = (item) => {
    switch(item.type) {
      case 'meeting':
        return (
          <Link
            key={`meeting-${item.id}`}
            to={`/dashboard/meetings/${item.id}`}
            className="group bg-brand-surface border border-brand-border p-6 rounded-3xl hover:border-blue-500/50 transition-all hover:shadow-2xl hover:shadow-blue-600/5 flex items-start gap-4"
          >
            <div className="p-3 rounded-2xl bg-blue-600/10 border border-blue-600/20">
              <Video className="w-5 h-5 text-blue-500" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <div className="text-lg font-bold text-text-main group-hover:text-blue-400 transition-colors">{item.title}</div>
                <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-text-main transition-all" />
              </div>
              <div className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
                {item.created_at && !isNaN(new Date(item.created_at).getTime()) 
                  ? format(new Date(item.created_at), 'MMM d, yyyy') 
                  : 'N/A'} • Meeting
              </div>
            </div>
          </Link>
        );
      case 'transcript':
        return (
          <Link
            key={`transcript-${item.id}`}
            to={`/dashboard/meetings/${item.meeting_id}`}
            className="block bg-brand-surface border border-brand-border p-8 rounded-3xl hover:border-indigo-500/50 transition-all group"
          >
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-4 h-4 text-indigo-500" />
              <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{item.meeting_title}</div>
              <span className="w-1 h-1 rounded-full bg-brand-border"></span>
              <div className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
                 {item.created_at && !isNaN(new Date(item.created_at).getTime()) 
                   ? format(new Date(item.created_at), 'MMM d, yyyy') 
                   : 'N/A'} • Transcript
              </div>
            </div>
            <p className="text-text-muted text-sm leading-relaxed line-clamp-3 group-hover:text-text-main transition-colors italic">
              "...{item.text || 'Match found in transcript'}..."
            </p>
          </Link>
        );
      case 'summary':
        return (
          <Link
            key={`summary-${item.id}`}
            to={`/dashboard/meetings/${item.meeting_id}`}
            className="block bg-brand-surface border border-brand-border p-8 rounded-3xl hover:border-emerald-500/50 transition-all group"
          >
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-4 h-4 text-emerald-500" />
              <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{item.meeting_title}</div>
              <span className="w-1 h-1 rounded-full bg-brand-border"></span>
              <div className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
                 {item.created_at && !isNaN(new Date(item.created_at).getTime()) 
                   ? format(new Date(item.created_at), 'MMM d, yyyy') 
                   : 'N/A'} • Summary
              </div>
            </div>
            <p className="text-text-muted text-sm leading-relaxed line-clamp-3 group-hover:text-text-main transition-colors">
              {item.summary || 'Match found in AI summary'}
            </p>
          </Link>
        );
      default:
        return null;
    }
  };

  return (
    <AppLayout>
      <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-4xl font-bold text-text-main mb-3 tracking-tight">Universal Search</h1>
        <p className="text-text-muted text-lg font-medium">Search through every meeting, transcript, and AI summary across your workspace.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-16">
        <div className="flex-1">
          <GlobalSearchBar onSearch={setQuery} isLoading={isFetching} />
        </div>
        
        {query && (
          <div className="flex items-center gap-2 bg-brand-surface p-1.5 rounded-2xl border border-brand-border self-center">
            {[
              { id: 'all', label: 'All', icon: Search },
              { id: 'meetings', label: 'Meetings', icon: Video },
              { id: 'transcripts', label: 'Transcripts', icon: FileText },
              { id: 'summaries', label: 'Summaries', icon: Activity }
            ].map((t) => (
              <button 
                key={t.id}
                onClick={() => setFilter(t.id)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${filter === t.id ? 'bg-blue-600 text-white shadow-xl' : 'text-text-muted hover:text-text-main'}`}
              >
                <t.icon className="w-3 h-3" />
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {!query ? (
        <div className="mt-20 text-center animate-in fade-in zoom-in duration-1000">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-[32px] bg-brand-bg/50 border border-brand-border mb-8">
            <Search className="w-12 h-12 text-text-muted" />
          </div>
          <p className="text-text-muted text-sm font-bold uppercase tracking-[0.3em]">Enter a query to start searching</p>
        </div>
      ) : isFetching && !results ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-brand-border pb-6">
            <Skeleton className="w-64 h-4 rounded-lg" />
          </div>
          <div className="grid grid-cols-1 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-brand-surface border border-brand-border p-8 rounded-3xl space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-6 h-6 rounded-lg" />
                  <Skeleton className="w-32 h-4 rounded-lg" />
                  <span className="w-1 h-1 rounded-full bg-brand-border"></span>
                  <Skeleton className="w-24 h-4 rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="w-full h-4 rounded-lg" />
                  <Skeleton className="w-5/6 h-4 rounded-lg" />
                  <Skeleton className="w-4/5 h-4 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : hasResults ? (
        <div className="space-y-12 animate-in fade-in duration-500">
           <div className="flex items-center justify-between border-b border-brand-border pb-6">
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                Showing {rawResults.length} results sorted by relevance
              </div>
           </div>
           
           <div className="grid grid-cols-1 gap-6">
             {rawResults.map(result => renderResult(result))}
           </div>
        </div>
      ) : results ? (
        <div className="mt-20 text-center animate-in fade-in duration-500">
          <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">No results found for "{query}"</p>
        </div>
      ) : null}
    </AppLayout>
  );
};

export default SearchPage;
