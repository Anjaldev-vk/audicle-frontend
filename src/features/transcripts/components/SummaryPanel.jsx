import React, { useState } from 'react';
import { Sparkles, CheckCircle2, AlertCircle, Languages, Loader2 } from 'lucide-react';
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
    { code: 'zh', name: 'Chinese' },
  ];

  const handleTranslate = async (lang) => {
    try {
      setSelectedLang(lang);
      await translateSummary({ meetingId, language: lang }).unwrap();
      toast.success(`Summary translated to ${languages.find(l => l.code === lang).name}`);
    } catch (err) {
      toast.error('Translation failed');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-10 animate-pulse">
        <div className="space-y-4">
          <div className="h-4 bg-white/5 rounded w-1/4"></div>
          <div className="h-20 bg-white/5 rounded-2xl w-full"></div>
        </div>
        <div className="space-y-4">
          <div className="h-4 bg-white/5 rounded w-1/3"></div>
          <div className="h-32 bg-white/5 rounded-2xl w-full"></div>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="space-y-12 relative">
      {/* Translation Toolbar */}
      <div className="absolute top-0 right-0 flex items-center gap-3">
        <div className="flex items-center gap-2 bg-brand-bg border border-brand-border rounded-xl px-3 py-1.5 shadow-xl shadow-black/20">
          <Languages size={14} className="text-blue-400" />
          <select
            value={selectedLang}
            onChange={(e) => handleTranslate(e.target.value)}
            disabled={isTranslating}
            className="bg-transparent border-none focus:ring-0 text-[10px] font-bold text-gray-400 uppercase tracking-widest outline-none cursor-pointer disabled:opacity-50"
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code} className="bg-brand-surface text-white">{lang.name}</option>
            ))}
          </select>
          {isTranslating && <Loader2 size={12} className="text-blue-500 animate-spin" />}
        </div>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-lg shadow-blue-500/5">
            <Sparkles className="w-4 h-4 text-blue-400" />
          </div>
          <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Executive Intelligence</h3>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
          <p className="text-gray-300 text-base leading-relaxed relative z-10 font-medium">
            {summary.summary || summary.brief || 'No executive brief available.'}
          </p>
        </div>
      </div>

      {summary.key_decisions?.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Core Decisions</h3>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {summary.key_decisions.map((decision, i) => (
              <div key={i} className="flex gap-4 p-5 bg-brand-bg/50 border border-brand-border rounded-2xl group hover:border-emerald-500/30 transition-all">
                <div className="text-emerald-500 font-black pt-0.5">•</div>
                <div className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors font-medium leading-relaxed">{decision}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {summary.action_items?.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-10 duration-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-lg shadow-amber-500/5">
              <AlertCircle className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Actionable Items</h3>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {summary.action_items.map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-5 bg-brand-bg/50 border border-brand-border rounded-2xl group hover:border-amber-500/30 transition-all cursor-pointer">
                <div className="w-5 h-5 rounded-md border-2 border-white/10 flex-shrink-0 group-hover:border-amber-500/50 transition-colors" />
                <div className="flex-1">
                  <div className="text-sm text-gray-300 group-hover:text-white transition-colors font-semibold mb-1">{item.task || item}</div>
                  {(item.assigned_to || item.priority) && (
                    <div className="flex gap-3 text-[9px] font-bold uppercase tracking-widest text-gray-600">
                      {item.assigned_to && <span className="px-2 py-0.5 bg-white/5 rounded-md border border-white/5">ASSIGNED TO: {item.assigned_to}</span>}
                      {item.priority && <span className={`px-2 py-0.5 rounded-md border ${item.priority === 'high' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-white/5 border-white/5'}`}>PRIORITY: {item.priority}</span>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryPanel;
