import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  MessageSquare, Send, Plus, Trash2, Bot, User, Loader2, 
  Link as LinkIcon, MessageCircle, History, Sparkles,
  PanelLeftClose, PanelLeftOpen, PanelRightClose,
  Copy, Check, Database, Globe, FileText, ExternalLink, ChevronDown,
  Search, X
} from 'lucide-react';
import AppLayout from '../../../components/layout/AppLayout';
import { 
  useGetChatSessionsQuery, useGetChatSessionQuery, 
  useCreateChatSessionMutation, useSendMessageMutation, ragApi
} from '../api/ragApi';
import { useGetMeetingsQuery } from '../../meetings/api/meetingsApi';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { Link, useSearchParams } from 'react-router-dom';

const formatInlineBold = (text) => {
  if (!text) return '';
  const parts = text.split('**');
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return (
        <strong key={i} className="font-extrabold text-text-main dark:text-white bg-blue-500/10 dark:bg-blue-500/20 px-1.5 py-0.5 rounded">
          {part}
        </strong>
      );
    }
    return part;
  });
};

const parseCodeBlocks = (text) => {
  if (!text) return [];
  const parts = text.split('```');
  return parts.map((part, idx) => {
    if (idx % 2 === 1) {
      const lines = part.split('\n');
      const firstLine = lines[0].trim();
      const isLang = /^[a-zA-Z0-9_-]+$/.test(firstLine);
      const language = isLang ? firstLine : '';
      const code = isLang ? lines.slice(1).join('\n') : part;
      return { type: 'code', language, content: code.trim() };
    }
    return { type: 'text', content: part };
  });
};

const formatMessageContent = (text) => {
  if (!text) return '';
  const blocks = parseCodeBlocks(text);
  return blocks.map((block, bIdx) => {
    if (block.type === 'code') {
      return (
        <div key={bIdx} className="my-4 rounded-2xl overflow-hidden border border-brand-border bg-black/10 dark:bg-black/40 shadow-inner font-mono text-xs">
          <div className="flex items-center justify-between px-4 py-2.5 bg-black/5 dark:bg-black/25 border-b border-brand-border/60 text-text-muted text-[10px] uppercase tracking-widest font-bold">
            <span>{block.language || 'code'}</span>
            <button 
              onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(block.content); toast.success('Code copied'); }}
              className="flex items-center gap-1 hover:text-text-main transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" /> Copy
            </button>
          </div>
          <pre className="p-4 overflow-x-auto text-text-main dark:text-slate-300 custom-scrollbar whitespace-pre">
            <code>{block.content}</code>
          </pre>
        </div>
      );
    }
    const lines = block.content.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return <li key={`${bIdx}-${idx}`} className="ml-5 list-disc mb-2 pl-1 text-text-main leading-relaxed font-medium">{formatInlineBold(trimmed.substring(2))}</li>;
      }
      const numberedMatch = trimmed.match(/^(\d+)\.\s(.*)/);
      if (numberedMatch) {
        return <li key={`${bIdx}-${idx}`} className="ml-5 list-decimal mb-2 pl-1 text-text-main leading-relaxed font-medium">{formatInlineBold(numberedMatch[2])}</li>;
      }
      if (trimmed.startsWith('### ')) {
        return <h4 key={`${bIdx}-${idx}`} className="text-xs font-black text-text-main mt-5 mb-2 uppercase tracking-widest flex items-center gap-2"><span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>{trimmed.substring(4)}</h4>;
      }
      if (trimmed.startsWith('## ')) {
        return <h3 key={`${bIdx}-${idx}`} className="text-sm font-black text-text-main mt-6 mb-3 uppercase tracking-wider flex items-center gap-2"><span className="w-2.5 h-1 bg-blue-500 rounded-full"></span>{trimmed.substring(3)}</h3>;
      }
      if (trimmed.startsWith('# ')) {
        return <h2 key={`${bIdx}-${idx}`} className="text-base font-black text-text-main mt-8 mb-4 tracking-tight border-b border-brand-border pb-2">{trimmed.substring(2)}</h2>;
      }
      if (!trimmed) return <div key={`${bIdx}-${idx}`} className="h-3" />;
      return <p key={`${bIdx}-${idx}`} className="mb-2.5 leading-relaxed text-text-main font-medium">{formatInlineBold(line)}</p>;
    });
  });
};

// ── Minimal empty state ──────────────────────────────────────────────────────
const EmptyState = () => (
  <div className="h-full flex flex-col items-center justify-center text-center p-8 select-none animate-in fade-in zoom-in-95 duration-500">
    <div className="relative mb-6">
      <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full scale-150 animate-pulse"></div>
      <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shadow-lg shadow-blue-500/5">
        <Sparkles className="w-6 h-6 animate-pulse text-blue-500" />
      </div>
    </div>
    <h3 className="text-sm font-black tracking-[0.15em] uppercase text-text-main mb-2">
      Audicle AI Intelligence
    </h3>
    <p className="text-[11px] text-text-muted max-w-[280px] leading-relaxed mb-6 font-medium">
      Ask questions, request summaries, or analyze key take-aways across all meetings or individual sessions.
    </p>
    <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-highlight/40 border border-brand-border/60 rounded-xl text-[9px] font-black uppercase tracking-wider text-text-muted">
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
      Semantic RAG Engine Ready
    </div>
  </div>
);
// ────────────────────────────────────────────────────────────────────────────

const ChatPage = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isContextOpen, setIsContextOpen] = useState(false);
  const [scopeDropdownOpen, setScopeDropdownOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [meetingSearch, setMeetingSearch] = useState('');

  const { data: sessionsRes, isLoading: sessionsLoading } = useGetChatSessionsQuery();
  const { data: sessionRes } = useGetChatSessionQuery(currentSessionId, { skip: !currentSessionId });
  const { data: meetingsRes } = useGetMeetingsQuery();

  const [createSession] = useCreateChatSessionMutation();
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();

  const sessions = sessionsRes?.data?.results || sessionsRes?.results || (Array.isArray(sessionsRes?.data) ? sessionsRes.data : (Array.isArray(sessionsRes) ? sessionsRes : []));
  const session = sessionRes?.data || sessionRes;
  const meetings = useMemo(() => meetingsRes?.data?.results || [], [meetingsRes]);
  const filteredMeetings = useMemo(() => {
    if (!meetingSearch.trim()) return meetings;
    return meetings.filter(m => 
      m.title.toLowerCase().includes(meetingSearch.toLowerCase())
    );
  }, [meetings, meetingSearch]);
  const messages = useMemo(() => session?.messages || [], [session]);

  const resolveSource = useCallback((src) => {
    if (!src) return { id: '', title: 'Unknown Meeting' };
    let id = '', title = '';
    if (typeof src === 'string') { id = src; }
    else if (typeof src === 'object') { id = src.meeting_id || src.id || ''; title = src.title || ''; }
    const foundMeeting = meetings.find(m => m.id === id);
    if (foundMeeting) title = foundMeeting.title;
    if (!title) title = `Meeting (${id.substring(0, 8)})`;
    return { id, title };
  }, [meetings]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) { setIsSidebarOpen(false); setIsContextOpen(false); }
      else { setIsSidebarOpen(true); }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scrollToBottom = useCallback(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, []);
  useEffect(() => { scrollToBottom(); }, [messages, isSending, scrollToBottom]);

  const conversationSources = useMemo(() => {
    const unique = new Map();
    messages.forEach(m => {
      if (m.sources) {
        m.sources.forEach(src => {
          const resolved = resolveSource(src);
          if (resolved.id) unique.set(resolved.id, resolved);
        });
      }
    });
    return Array.from(unique.values());
  }, [messages, resolveSource]);

  const handleAutoSearch = useCallback(async (query) => {
    try {
      const newSession = await createSession({ title: query.substring(0, 30) + '...' }).unwrap();
      const sessionId = newSession?.data?.id || newSession?.id;
      setCurrentSessionId(sessionId);
      await sendMessage({ sessionId, content: query }).unwrap();
    } catch (err) { console.error(err); toast.error('Failed to start search chat'); }
  }, [createSession, sendMessage]);

  useEffect(() => {
    const query = searchParams.get('q');
    if (query && sessions.length === 0 && !sessionsLoading && !currentSessionId) {
      const timer = setTimeout(() => { handleAutoSearch(query); }, 0);
      return () => clearTimeout(timer);
    }
  }, [searchParams, sessions.length, sessionsLoading, currentSessionId, handleAutoSearch]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isSending) return;
    const content = input;
    setInput('');
    try {
      let sessionId = currentSessionId;
      if (!sessionId) {
        const newSession = await createSession({ title: content.substring(0, 30) + '...' }).unwrap();
        sessionId = newSession?.data?.id || newSession?.id;
        setCurrentSessionId(sessionId);
      }
      await sendMessage({ sessionId, content, meetingId: selectedMeeting?.id }).unwrap();
    } catch (err) { console.error(err); toast.error('Failed to get AI response'); }
  };

  const createNewSession = () => { setCurrentSessionId(null); setInput(''); };

  const handleDeleteSession = async (id, e) => {
    e.stopPropagation();
    try {
      await dispatch(ragApi.endpoints.deleteChatSession.initiate(id)).unwrap();
      if (currentSessionId === id) createNewSession();
      toast.success('Conversation deleted');
    } catch (err) { console.error(err); toast.error('Failed to delete session'); }
  };

  const handleCopyMessage = (content, index) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    toast.success('Response copied to clipboard');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <AppLayout>
      <div className="flex h-[calc(100dvh-120px)] lg:h-[calc(100vh-144px)] gap-6 animate-in fade-in duration-500 relative overflow-hidden">

        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none -z-10 hidden lg:block" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500/5 blur-[150px] rounded-full pointer-events-none -z-10 hidden lg:block" />

        {/* Sidebar */}
        <div className={`bg-brand-surface border border-brand-border rounded-2xl lg:rounded-[2rem] flex flex-col overflow-hidden shadow-xl absolute lg:relative z-20 h-full transition-all duration-300 ease-in-out shrink-0 ${isSidebarOpen ? 'w-full sm:w-80 left-0' : 'w-0 -left-full lg:left-0 border-none opacity-0 pointer-events-none'}`}>
          <div className="p-4 lg:p-5 border-b border-brand-border bg-white/[0.01]">
            <div className="flex items-center gap-2">
              <button onClick={() => { createNewSession(); if (window.innerWidth < 1024) setIsSidebarOpen(false); }} className="flex-1 py-3 lg:py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl lg:rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/15 hover:shadow-blue-600/25 active:scale-[0.98] cursor-pointer">
                <Plus className="w-4 h-4" /> New Conversation
              </button>
              <button onClick={() => setIsSidebarOpen(false)} className="p-3 lg:hidden bg-brand-highlight text-text-muted hover:text-text-main rounded-xl transition-all cursor-pointer border border-brand-border/60">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar">
            <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] px-3.5 mb-3.5 flex items-center gap-2.5">
              <History className="w-3.5 h-3.5 text-blue-500" /> Intelligence Log
            </div>
            {sessionsLoading ? (
              <div className="space-y-3 p-2">
                {[1,2,3,4].map(i => <div key={i} className="h-11 bg-brand-highlight/40 border border-brand-border animate-pulse rounded-xl" />)}
              </div>
            ) : sessions.length > 0 ? (
              sessions.map((s) => (
                <div key={s.id} onClick={() => { setCurrentSessionId(s.id); if (window.innerWidth < 1024) setIsSidebarOpen(false); }} className={`group flex items-center justify-between p-3 lg:p-3.5 rounded-xl lg:rounded-2xl cursor-pointer transition-all relative border ${currentSessionId === s.id ? 'bg-blue-500/5 border-blue-500/25 shadow-sm' : 'hover:bg-brand-highlight/60 border-transparent'}`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <MessageCircle className={`w-4 h-4 shrink-0 ${currentSessionId === s.id ? 'text-blue-500' : 'text-text-muted/60 group-hover:text-text-muted'}`} />
                    <span className={`text-xs truncate font-bold tracking-tight ${currentSessionId === s.id ? 'text-blue-500 font-extrabold' : 'text-text-muted group-hover:text-text-main'}`}>{s.title || 'Untitled Session'}</span>
                  </div>
                  <button onClick={(e) => handleDeleteSession(s.id, e)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded-lg text-text-muted transition-all cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {currentSessionId === s.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-500 rounded-r-full"></div>}
                </div>
              ))
            ) : (
              <div className="text-center py-16 px-6">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest leading-loose">No conversation logs</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-brand-surface border border-brand-border rounded-2xl lg:rounded-[2rem] overflow-hidden shadow-md lg:shadow-xl relative min-w-0 w-full">

          {/* Header */}
          <div className="px-4 lg:px-8 py-4 lg:py-5 border-b border-brand-border flex items-center justify-between bg-white/[0.01] shrink-0">
            <div className="flex items-center gap-3 lg:gap-4 min-w-0">
              <button onClick={() => setIsSidebarOpen(prev => !prev)} className="p-2 hover:bg-brand-highlight rounded-lg lg:rounded-xl text-text-muted hover:text-text-main transition-all border border-brand-border/60 cursor-pointer" title={isSidebarOpen ? 'Hide History' : 'Show History'}>
                {isSidebarOpen ? <PanelLeftClose className="w-4 h-4 lg:w-4.5 lg:h-4.5" /> : <PanelLeftOpen className="w-4 h-4 lg:w-4.5 lg:h-4.5" />}
              </button>
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0">
                <Sparkles className="w-4 h-4 lg:w-5 lg:h-5 text-indigo-500" />
              </div>
              <div className="space-y-1 truncate">
                <div className="flex items-center gap-2">
                  <h2 className="text-xs font-black text-text-main uppercase tracking-[0.2em] leading-none">RAG Analysis</h2>
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                    <span className="relative flex h-1 w-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1 w-1 bg-emerald-500"></span>
                    </span>
                    <span className="text-[7px] font-black text-emerald-500 uppercase tracking-widest">Online</span>
                  </div>
                </div>
                <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest leading-none opacity-60 truncate">
                  {selectedMeeting ? `Scoped: ${selectedMeeting.title}` : 'Workspace Knowledge Base'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 lg:gap-3">
              <button onClick={() => setIsContextOpen(prev => !prev)} className={`p-2 rounded-lg lg:rounded-xl border transition-all flex items-center gap-1.5 text-[9px] lg:text-[10px] font-black uppercase tracking-wider cursor-pointer ${isContextOpen ? 'bg-blue-600/10 border-blue-500/30 text-blue-500 hover:bg-blue-600/20' : 'bg-brand-surface border-brand-border/60 text-text-muted hover:text-text-main hover:bg-brand-highlight'}`} title={isContextOpen ? 'Hide Context' : 'Show Context'}>
                <Database className="w-4 h-4" />
                <span className="hidden sm:inline">RAG Context</span>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-4 lg:py-8 space-y-4 lg:space-y-6 custom-scrollbar">
            {messages.length === 0 ? (
              <EmptyState />
            ) : (
              messages.map((m, i) => (
                <div key={i} className={`flex gap-4 animate-in fade-in slide-in-from-bottom-3 duration-500 group/msg ${m.role === 'assistant' ? '' : 'flex-row-reverse'}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border shadow-sm transition-transform hover:scale-105 ${m.role === 'assistant' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500 dark:text-indigo-400' : 'bg-gradient-to-br from-blue-600 to-indigo-600 border-blue-500/20 text-white shadow-blue-500/10'}`}>
                    {m.role === 'assistant' ? <Bot className="w-4.5 h-4.5" /> : <User className="w-4.5 h-4.5" />}
                  </div>
                  <div className={`flex-1 space-y-3.5 max-w-[85%] ${m.role === 'assistant' ? 'relative' : 'flex flex-col items-end'}`}>
                    <div className={`p-5 rounded-[1.8rem] text-xs leading-relaxed shadow-sm relative ${m.role === 'assistant' ? 'bg-brand-surface text-text-main border border-brand-border rounded-tl-none font-medium' : 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-none shadow-md shadow-blue-600/10'}`}>
                      {m.role === 'assistant' ? formatMessageContent(m.content) : m.content}
                      {m.role === 'assistant' && (
                        <button onClick={() => handleCopyMessage(m.content, i)} className="absolute top-3.5 right-3.5 opacity-0 group-hover/msg:opacity-100 p-2 bg-brand-surface border border-brand-border hover:bg-brand-highlight text-text-muted hover:text-text-main rounded-xl transition-all shadow-sm cursor-pointer z-10" title="Copy response">
                          {copiedIndex === i ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                    {m.role === 'assistant' && m.sources && m.sources.length > 0 && (
                      <div className="flex flex-wrap gap-2 pl-1.5">
                        {m.sources.map((source, idx) => {
                          const resolved = resolveSource(source);
                          if (!resolved.id) return null;
                          return (
                            <Link key={idx} to={`/dashboard/meetings/${resolved.id}`} className="flex items-center gap-1.5 px-3 py-1.2 bg-brand-highlight hover:bg-brand-border border border-brand-border/60 rounded-xl text-[9px] font-black text-blue-500 hover:text-blue-600 transition-all uppercase tracking-wider">
                              <LinkIcon className="w-3 h-3" /> Ref: {resolved.title}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {isSending && (
              <div className="flex gap-4 animate-in fade-in duration-300">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-sm shrink-0">
                  <Bot className="w-4.5 h-4.5 text-indigo-500 dark:text-indigo-400" />
                </div>
                <div className="max-w-[85%]">
                  <div className="inline-flex items-center gap-2.5 px-5 py-3.5 rounded-[1.8rem] rounded-tl-none bg-brand-surface border border-brand-border shadow-sm">
                    <div className="relative flex h-3 w-3 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <Loader2 className="relative w-3 h-3 text-indigo-500 animate-spin" />
                    </div>
                    <span className="text-xs font-bold text-text-muted tracking-tight animate-pulse">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 lg:px-8 py-3 lg:py-6 bg-brand-surface lg:bg-white/[0.01] border-t border-brand-border shrink-0">
            <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-center gap-2 lg:gap-3 relative group">
              <div className="absolute inset-0 bg-blue-600/[0.02] blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none hidden lg:block"></div>
              <div className="flex-1 flex items-center gap-1 lg:gap-2 bg-brand-bg border border-brand-border focus-within:border-blue-500/40 focus-within:ring-1 focus-within:ring-blue-500/25 rounded-2xl lg:rounded-3xl pl-2 lg:pl-3.5 pr-1.5 lg:pr-2.5 py-1.5 lg:py-2.5 transition-all relative z-10 shadow-sm">

                {/* Scope dropdown */}
                <div className="relative shrink-0">
                  <button type="button" onClick={() => setScopeDropdownOpen(prev => !prev)} className="flex items-center gap-1.5 px-3 py-2 bg-brand-surface hover:bg-brand-highlight border border-brand-border rounded-xl text-[9px] font-black uppercase tracking-widest text-text-muted hover:text-text-main transition-all h-10 cursor-pointer">
                    <Globe className="w-3.5 h-3.5 text-blue-500" />
                    <span className="max-w-[100px] truncate">{selectedMeeting ? selectedMeeting.title : 'All Meetings'}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${scopeDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {scopeDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => { setScopeDropdownOpen(false); setMeetingSearch(''); }} />
                      <div className="absolute bottom-12 left-0 w-72 max-h-80 flex flex-col bg-brand-surface border border-brand-border rounded-2xl p-2.5 shadow-2xl z-40 animate-in fade-in slide-in-from-bottom-2 duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="text-[8px] font-black text-text-muted uppercase tracking-widest px-2.5 py-1.5 border-b border-brand-border mb-2.5 shrink-0 flex justify-between items-center">
                          <span>Query Scope Selection</span>
                          {selectedMeeting && (
                            <button 
                              type="button" 
                              onClick={() => { setSelectedMeeting(null); setScopeDropdownOpen(false); setMeetingSearch(''); }}
                              className="text-[8px] text-blue-500 hover:text-blue-600 font-extrabold uppercase tracking-widest cursor-pointer"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                        
                        {/* Sticky Search bar */}
                        <div className="relative mb-2 px-1 shrink-0">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted/60" />
                          <input
                            type="text"
                            placeholder="Search meetings..."
                            value={meetingSearch}
                            onChange={(e) => setMeetingSearch(e.target.value)}
                            className="w-full bg-brand-bg text-[11px] text-text-main placeholder:text-text-muted/40 border border-brand-border focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25 rounded-xl pl-8 pr-7 py-1.5 outline-none font-medium transition-all"
                          />
                          {meetingSearch && (
                            <button
                              type="button"
                              onClick={() => setMeetingSearch('')}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted/60 hover:text-text-main transition-colors p-0.5 rounded-md hover:bg-brand-highlight cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        
                        {/* Scrollable list */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-0.5 space-y-0.5 max-h-52">
                          <button type="button" onClick={() => { setSelectedMeeting(null); setScopeDropdownOpen(false); setMeetingSearch(''); }} className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-bold tracking-tight transition-all flex items-center gap-2 mb-1 cursor-pointer ${!selectedMeeting ? 'bg-blue-600/10 text-blue-500 border border-blue-500/15' : 'hover:bg-brand-highlight text-text-muted hover:text-text-main border border-transparent'}`}>
                            <Globe className="w-4 h-4 shrink-0 text-blue-500" />
                            <span className="truncate">All Synced Meetings</span>
                          </button>
                          {filteredMeetings.length > 0 ? (
                            filteredMeetings.map((m) => (
                              <button key={m.id} type="button" onClick={() => { setSelectedMeeting(m); setScopeDropdownOpen(false); setMeetingSearch(''); }} className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all flex items-center gap-2 mb-1 cursor-pointer ${selectedMeeting?.id === m.id ? 'bg-blue-600/10 text-blue-500 border border-blue-500/15' : 'hover:bg-brand-highlight text-text-muted hover:text-text-main border border-transparent'}`}>
                                <FileText className="w-4 h-4 shrink-0 text-indigo-400" />
                                <span className="truncate">{m.title}</span>
                              </button>
                            ))
                          ) : (
                            <div className="text-center py-6 text-[10px] text-text-muted font-medium uppercase tracking-wider">
                              No meetings found
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="Ask about workspace intelligence..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isSending}
                  className="w-full bg-transparent text-xs text-text-main transition-all outline-none font-medium placeholder:text-text-muted/40 px-2 border-none ring-0"
                />

                <button type="submit" disabled={!input.trim() || isSending} className={`w-8 h-8 lg:w-10 lg:h-10 rounded-xl lg:rounded-2xl flex items-center justify-center transition-all shrink-0 cursor-pointer ${!input.trim() || isSending ? 'text-text-muted bg-brand-highlight border border-brand-border cursor-not-allowed' : 'text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/15 hover:scale-105 active:scale-95'}`}>
                  {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </form>
            <div className="mt-4 flex items-center justify-center gap-6 text-[9px] font-black text-text-muted uppercase tracking-[0.2em] opacity-80">
              <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-indigo-400" /> AI Agent Activated</span>
              <span className="w-1 h-1 rounded-full bg-brand-border"></span>
              <span className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5 text-blue-400" /> Semantic RAG Active</span>
            </div>
          </div>
        </div>

        {/* Right Context Panel */}
        <div className={`bg-brand-surface border border-brand-border rounded-2xl lg:rounded-[2rem] flex flex-col overflow-hidden shadow-xl absolute right-0 lg:relative z-20 h-full transition-all duration-300 ease-in-out shrink-0 ${isContextOpen ? 'w-full sm:w-80 right-0' : 'w-0 -right-full lg:right-0 border-none opacity-0 pointer-events-none'}`}>
          <div className="p-5 border-b border-brand-border bg-white/[0.01] shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4.5 h-4.5 text-blue-500" />
                <span className="text-xs font-black uppercase tracking-widest text-text-main">RAG Context</span>
              </div>
              <button onClick={() => setIsContextOpen(false)} className="p-1.5 hover:bg-brand-highlight text-text-muted hover:text-text-main rounded-lg transition-all cursor-pointer">
                <PanelRightClose className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
            <div className="p-4 bg-brand-highlight/30 border border-brand-border/60 rounded-2xl space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-wider text-text-main">Engine Connected</span>
              </div>
              <p className="text-[9px] leading-relaxed text-text-muted">Semantically scanning transcripts, action logs, and files to reference the most relevant blocks.</p>
            </div>
            <div className="space-y-2">
              <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] px-2 block">Current Focus</span>
              <div className="p-3.5 bg-brand-surface border border-brand-border rounded-2xl flex items-start gap-2.5">
                <Globe className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-xs font-extrabold text-text-main tracking-tight leading-none">{selectedMeeting ? 'Single Scope' : 'Workspace Wide'}</span>
                  <p className="text-[9px] text-text-muted truncate max-w-[180px]">{selectedMeeting ? selectedMeeting.title : 'Searching across all meeting logs'}</p>
                </div>
              </div>
            </div>
            {conversationSources.length > 0 && (
              <div className="space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between px-2">
                  <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Citations ({conversationSources.length})</span>
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                </div>
                <div className="space-y-2">
                  {conversationSources.map((source, idx) => (
                    <Link key={idx} to={`/dashboard/meetings/${source.id}`} className="group p-3 bg-brand-surface hover:bg-brand-highlight/40 border border-brand-border hover:border-blue-500/20 rounded-2xl flex items-center justify-between transition-all cursor-pointer">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span className="text-xs font-bold text-text-muted group-hover:text-text-main transition-colors truncate max-w-[160px]">{source.title}</span>
                      </div>
                      <ExternalLink className="w-3 h-3 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-2.5">
              <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] px-2 block">Index Coverage ({meetings.length})</span>
              <div className="space-y-1.5 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                {meetings.length > 0 ? (
                  meetings.map((m) => (
                    <div key={m.id} onClick={() => setSelectedMeeting(selectedMeeting?.id === m.id ? null : m)} className={`p-3 rounded-2xl transition-all cursor-pointer border flex items-center justify-between text-left ${selectedMeeting?.id === m.id ? 'bg-blue-600/5 border-blue-500/20 shadow-sm' : 'bg-brand-surface hover:bg-brand-highlight/50 border-brand-border/60 hover:border-brand-border'}`}>
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className={`w-4 h-4 shrink-0 ${selectedMeeting?.id === m.id ? 'text-blue-500 animate-pulse' : 'text-text-muted/60'}`} />
                        <div className="min-w-0 space-y-0.5">
                          <div className={`text-[11px] font-bold truncate max-w-[170px] ${selectedMeeting?.id === m.id ? 'text-blue-500 font-extrabold' : 'text-text-main'}`}>{m.title}</div>
                          <div className="text-[8px] text-text-muted font-semibold uppercase tracking-wider">Select to scope</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[9px] text-text-muted text-center py-4">No indexed documents</p>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </AppLayout>
  );
};

export default ChatPage;