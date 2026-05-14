import React, { useState } from 'react';
import { Sparkles, CheckCircle2, AlertCircle, Languages, Loader2, ArrowRight, ListChecks, Download as DownloadIcon } from 'lucide-react';
import { useTranslateSummaryMutation } from '../api/transcriptApi';
import { toast } from 'react-hot-toast';

const SummaryPanel = ({ summary, isLoading, meetingId }) => {
  const [translateSummary, { isLoading: isTranslating }] = useTranslateSummaryMutation();
  const [selectedLang, setSelectedLang] = useState('en');

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ml', name: 'Malayalam' },
    { code: 'zh', name: 'Chinese' },
  ];

  const handleTranslate = async (lang) => {
    try {
      setSelectedLang(lang);
      const languageName = languages.find(l => l.code === lang).name;
      await translateSummary({ meetingId, language: languageName }).unwrap();
      toast.success(`Summary translated to ${languageName}`);
    } catch (err) {
      console.error(err);
      toast.error('Translation failed');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-10 animate-pulse">
        <div className="space-y-4">
          <div className="h-4 bg-brand-highlight rounded w-1/4"></div>
          <div className="h-20 bg-brand-highlight rounded-2xl w-full"></div>
        </div>
        <div className="space-y-4">
          <div className="h-4 bg-brand-highlight rounded w-1/3"></div>
          <div className="h-32 bg-brand-highlight rounded-2xl w-full"></div>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  // Use translated content if available
  const displayData = (selectedLang !== 'en' && summary.translations?.[languages.find(l => l.code === selectedLang)?.name]) 
    ? summary.translations[languages.find(l => l.code === selectedLang).name]
    : {
        summary: summary.summary || summary.brief,
        key_points: summary.key_points,
        decisions: summary.decisions || summary.key_decisions,
        action_items: summary.action_items,
        next_steps: summary.next_steps
      };

  return (
    <div className="space-y-8 relative">
      {/* Translation Toolbar - Floating Sleek Design */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-lg shadow-blue-500/5">
            <Sparkles className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-black text-text-main uppercase tracking-[0.2em]">Audicle Intelligence</h3>
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-0.5">AI-Powered Meeting Insights</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 bg-brand-highlight border border-brand-border rounded-2xl px-4 py-2 hover:opacity-80 transition-all">
            <Languages size={14} className="text-blue-400" />
            <select
              value={selectedLang}
              onChange={(e) => handleTranslate(e.target.value)}
              disabled={isTranslating}
              className="bg-transparent border-none focus:ring-0 text-[11px] font-black text-text-main uppercase tracking-widest outline-none cursor-pointer disabled:opacity-50"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code} className="bg-brand-surface text-text-main font-sans">{lang.name}</option>
              ))}
            </select>
            {isTranslating && <Loader2 size={12} className="text-blue-500 animate-spin" />}
          </div>
          
          <button 
            onClick={async () => {
              const { exportToPDF } = await import('../../services/exportService');
              toast.promise(exportToPDF('summary-content', `Audicle-Summary-${meetingId}`), {
                loading: 'Generating Intelligence PDF...',
                success: 'PDF Exported Successfully',
                error: 'Export failed'
              });
            }}
            className="p-3 bg-brand-highlight border border-brand-border rounded-2xl text-text-muted hover:text-text-main hover:border-blue-500/30 transition-all shadow-sm"
            title="Export as PDF"
          >
            <DownloadIcon size={16} />
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div id="summary-content" className="space-y-8 relative p-4">
        
        {/* Executive Summary - Full Width Hero */}
        <div className="md:col-span-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="group relative bg-brand-highlight border border-brand-border rounded-[2.5rem] p-10 overflow-hidden hover:border-blue-500/30 transition-all duration-500">
            <div className="absolute top-0 right-0 p-24 bg-blue-500/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-blue-500/20">Executive Brief</span>
              </div>
              <p className="text-text-main text-xl leading-relaxed font-medium">
                {displayData.summary || 'No executive brief available.'}
              </p>
            </div>
          </div>
        </div>

        {/* Core Decisions & Key Points - 2 Column Split */}
        <div className="md:col-span-3 space-y-6">
          {displayData.decisions?.length > 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
              <div className="bg-brand-highlight border border-brand-border rounded-[2rem] p-8 hover:opacity-80 transition-all group">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-all">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h3 className="text-[11px] font-black text-text-main uppercase tracking-[0.2em]">Core Decisions</h3>
                </div>
                <div className="space-y-4">
                  {displayData.decisions.map((decision, i) => (
                    <div key={i} className="flex gap-4 items-start text-sm text-text-muted font-medium leading-relaxed hover:text-text-main transition-colors">
                      <span className="text-emerald-500 font-black mt-0.5">•</span>
                      {decision}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {displayData.key_points?.length > 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
              <div className="bg-brand-highlight border border-brand-border rounded-[2rem] p-8 hover:opacity-80 transition-all group">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-all">
                    <ListChecks className="w-4 h-4 text-indigo-400" />
                  </div>
                  <h3 className="text-[11px] font-black text-text-main uppercase tracking-[0.2em]">Discussion Points</h3>
                </div>
                <div className="space-y-4">
                  {displayData.key_points.map((point, i) => (
                    <div key={i} className="flex gap-4 items-start text-sm text-text-muted font-medium leading-relaxed hover:text-text-main transition-colors">
                      <span className="text-indigo-500 font-black mt-0.5">/</span>
                      {point}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Items & Next Steps - 2 Column Split */}
        <div className="md:col-span-3 space-y-6">
          {displayData.action_items?.length > 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
              <div className="bg-brand-highlight border border-brand-border rounded-[2rem] p-8 hover:opacity-80 transition-all group">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group-hover:bg-amber-500/20 transition-all">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                  </div>
                  <h3 className="text-[11px] font-black text-text-main uppercase tracking-[0.2em]">Task List</h3>
                </div>
                <div className="space-y-3">
                  {displayData.action_items.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-brand-highlight border border-brand-border rounded-xl group/item hover:border-amber-500/30 transition-all">
                      <div className="w-5 h-5 rounded-md border-2 border-brand-border flex-shrink-0 group-hover/item:border-amber-500/50 transition-colors" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-text-main font-semibold truncate">{item.task || item}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {displayData.next_steps?.length > 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-400">
              <div className="bg-brand-highlight border border-brand-border rounded-[2rem] p-8 hover:opacity-80 transition-all group">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20 group-hover:bg-purple-500/20 transition-all">
                    <ArrowRight className="w-4 h-4 text-purple-400" />
                  </div>
                  <h3 className="text-[11px] font-black text-text-main uppercase tracking-[0.2em]">Future Outlook</h3>
                </div>
                <div className="space-y-4">
                  {displayData.next_steps.map((step, i) => (
                    <div key={i} className="flex gap-4 items-start text-sm text-text-muted font-medium leading-relaxed hover:text-text-main transition-colors">
                      <span className="text-purple-500 font-black mt-0.5">→</span>
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default SummaryPanel;
