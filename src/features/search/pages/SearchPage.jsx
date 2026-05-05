import React, { useState } from 'react';
import AppLayout from '../../../components/layout/AppLayout';
import { Search, Activity, Video, FileText, ChevronRight, Loader2 } from 'lucide-react';
import GlobalSearchBar from '../components/GlobalSearchBar';
import { useSearchQuery } from '../api/searchApi';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const { data: results, isFetching } = useSearchQuery({ q: query }, { skip: !query });

  const searchData = results?.data || { meetings: [], transcripts: [], summaries: [] };
  const hasResults = searchData.meetings.length > 0 || searchData.transcripts.length > 0 || searchData.summaries.length > 0;

  return (
    <AppLayout>
      <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Universal Search</h1>
        <p className="text-gray-500 text-lg font-medium">Search through every meeting, transcript, and AI summary across your workspace.</p>
      </div>

      <div className="mb-16">
        <GlobalSearchBar onSearch={setQuery} isLoading={isFetching} />
      </div>

      {!query ? (
        <div className="mt-20 text-center animate-in fade-in zoom-in duration-1000">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/5 border border-white/10 mb-8">
            <Search className="w-10 h-10 text-gray-700" />
          </div>
          <p className="text-gray-600 text-sm font-bold uppercase tracking-[0.3em]">Enter a query to start searching</p>
        </div>
      ) : isFetching && !results ? (
        <div className="flex flex-col items-center justify-center py-20 gap-6">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          <p className="text-gray-500 font-medium animate-pulse">Scanning your workspace...</p>
        </div>
      ) : hasResults ? (
        <div className="space-y-16 animate-in fade-in duration-500">
          {/* Meetings Section */}
          {searchData.meetings.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-4">
                <Video className="w-5 h-5 text-blue-500" />
                <h2 className="text-xl font-bold text-white uppercase tracking-wider text-xs">Meetings ({searchData.meetings.length})</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {searchData.meetings.map(meeting => (
                  <Link
                    key={meeting.id}
                    to={`/dashboard/meetings/${meeting.id}`}
                    className="group bg-brand-surface border border-brand-border p-6 rounded-3xl hover:border-blue-500/50 transition-all hover:shadow-2xl hover:shadow-blue-600/5"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{meeting.title}</div>
                      <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-white transition-all" />
                    </div>
                    <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                      {format(new Date(meeting.created_at), 'MMM d, yyyy')}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Transcripts Section */}
          {searchData.transcripts.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-4">
                <FileText className="w-5 h-5 text-indigo-500" />
                <h2 className="text-xl font-bold text-white uppercase tracking-wider text-xs">Transcripts ({searchData.transcripts.length})</h2>
              </div>
              <div className="space-y-4">
                {searchData.transcripts.map(item => (
                  <Link
                    key={item.id}
                    to={`/dashboard/meetings/${item.meeting_id}`}
                    className="block bg-brand-surface border border-brand-border p-8 rounded-3xl hover:border-indigo-500/50 transition-all group"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{item.meeting_title}</div>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 group-hover:text-gray-200 transition-colors italic">
                      "...{item.text}..."
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Summaries Section */}
          {searchData.summaries.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-4">
                <Activity className="w-5 h-5 text-emerald-500" />
                <h2 className="text-xl font-bold text-white uppercase tracking-wider text-xs">AI Summaries ({searchData.summaries.length})</h2>
              </div>
              <div className="space-y-4">
                {searchData.summaries.map(item => (
                  <Link
                    key={item.id}
                    to={`/dashboard/meetings/${item.meeting_id}`}
                    className="block bg-brand-surface border border-brand-border p-8 rounded-3xl hover:border-emerald-500/50 transition-all group"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest">{item.meeting_title}</div>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 group-hover:text-gray-200 transition-colors">
                      {item.summary}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        <div className="mt-20 text-center animate-in fade-in duration-500">
          <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">No results found for "{query}"</p>
        </div>
      )}
    </AppLayout>
  );
};

export default SearchPage;
