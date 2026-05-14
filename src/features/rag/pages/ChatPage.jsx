import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  MessageSquare, 
  Send, 
  Plus, 
  Trash2, 
  Bot, 
  User, 
  ChevronRight, 
  Loader2, 
  Link as LinkIcon,
  MessageCircle,
  History,
  Sparkles
} from 'lucide-react';
import AppLayout from '../../../components/layout/AppLayout';
import { 
  useGetChatSessionsQuery, 
  useGetChatSessionQuery, 
  useCreateChatSessionMutation, 
  useSendMessageMutation,
  ragApi
} from '../api/ragApi';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { Link, useSearchParams } from 'react-router-dom';

const ChatPage = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const { data: sessionsRes, isLoading: sessionsLoading } = useGetChatSessionsQuery();
  const { data: sessionRes } = useGetChatSessionQuery(currentSessionId, { skip: !currentSessionId });
  
  const [createSession] = useCreateChatSessionMutation();
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();

  const sessions = sessionsRes?.data || [];
  const session = sessionRes?.data;
  const messages = useMemo(() => session?.messages || [], [session]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending, scrollToBottom]);

  const handleAutoSearch = useCallback(async (query) => {
    try {
      const newSession = await createSession({ title: query.substring(0, 30) + '...' }).unwrap();
      setCurrentSessionId(newSession.data.id);
      await sendMessage({ sessionId: newSession.data.id, content: query }).unwrap();
    } catch (err) {
      console.error(err);
      toast.error('Failed to start search chat');
    }
  }, [createSession, sendMessage]);

  // Handle auto-search from URL params
  useEffect(() => {
    const query = searchParams.get('q');
    if (query && sessions.length === 0 && !sessionsLoading && !currentSessionId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleAutoSearch(query);
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
        sessionId = newSession.data.id;
        setCurrentSessionId(sessionId);
      }
      await sendMessage({ sessionId, content }).unwrap();
    } catch (err) {
      console.error(err);
      toast.error('Failed to get AI response');
    }
  };

  const createNewSession = () => {
    setCurrentSessionId(null);
    setInput('');
  };

  const handleDeleteSession = async (id, e) => {
    e.stopPropagation();
    try {
      await dispatch(ragApi.endpoints.deleteChatSession.initiate(id)).unwrap();
      if (currentSessionId === id) createNewSession();
      toast.success('Conversation deleted');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete session');
    }
  };

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-140px)] gap-8 animate-in fade-in duration-700">
        
        {/* Sidebar: Chat History */}
        <div className="w-80 bg-brand-surface border border-brand-border rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl relative group/sidebar">
          <div className="p-8 border-b border-brand-border bg-white/[0.01]">
            <button 
              onClick={createNewSession}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
            >
              <Plus className="w-4 h-4" /> New Conversation
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-2 custom-scrollbar">
            <div className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] px-4 mb-6 flex items-center gap-3">
              <History className="w-3.5 h-3.5" /> Intelligence Log
            </div>
            {sessionsLoading ? (
              <div className="space-y-4 p-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-12 bg-white/5 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : sessions.length > 0 ? (
              sessions.map((s) => (
                <div 
                  key={s.id}
                  onClick={() => setCurrentSessionId(s.id)}
                  className={`
                    group flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all relative
                    ${currentSessionId === s.id ? 'bg-blue-600/10 border border-blue-500/20' : 'hover:bg-white/5 border border-transparent'}
                  `}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <MessageCircle className={`w-4 h-4 shrink-0 ${currentSessionId === s.id ? 'text-blue-500' : 'text-gray-600'}`} />
                    <span className={`text-xs truncate font-bold tracking-tight ${currentSessionId === s.id ? 'text-brand-primary' : 'text-text-muted group-hover:text-text-main'}`}>
                      {s.title || 'Untitled Session'}
                    </span>
                  </div>
                  <button 
                    onClick={(e) => handleDeleteSession(s.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded-lg text-gray-700 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {currentSessionId === s.id && <div className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full"></div>}
                </div>
              ))
            ) : (
              <div className="text-center py-20 px-8">
                <p className="text-[10px] font-bold text-gray-700 uppercase tracking-widest leading-loose">No conversation logs detected in this workspace.</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-brand-surface border border-brand-border rounded-[2.5rem] overflow-hidden shadow-2xl relative group/chat">
          
          {/* Header */}
          <div className="px-10 py-8 border-b border-brand-border flex items-center justify-between bg-white/[0.01]">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-lg shadow-indigo-500/5">
                <Sparkles className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-sm font-black text-text-main uppercase tracking-[0.2em] leading-none">RAG Analysis Engine</h2>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2 opacity-60">Synthesizing workspace knowledge</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-10 py-10 space-y-10 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-10">
                <div className="w-24 h-24 bg-blue-600/10 rounded-[2rem] flex items-center justify-center mb-10 border border-blue-500/20 shadow-2xl shadow-blue-600/10 relative group/icon">
                   <div className="absolute inset-0 bg-blue-600/20 blur-3xl rounded-full opacity-50 group-hover/icon:opacity-100 transition-opacity"></div>
                  <Bot className="w-12 h-12 text-blue-500 relative z-10" />
                </div>
                <h3 className="text-3xl font-black text-text-main mb-4 tracking-tighter">Knowledge Discovery</h3>
                <p className="text-text-muted max-w-md leading-relaxed font-medium">
                  Interrogate your entire meeting history. I'll search through transcripts and summaries to find precise answers with citations.
                </p>
                <div className="grid grid-cols-2 gap-4 mt-16 max-w-2xl">
                  {[
                    "What were the key takeaways from last week's sync?",
                    "Did we discuss the budget for Phase 9?",
                    "List all action items assigned to John.",
                    "Summarize our discussion on the new UI design."
                  ].map((suggestion, i) => (
                    <button 
                      key={i}
                      onClick={() => setInput(suggestion)}
                      className="p-5 bg-brand-highlight hover:bg-brand-primary/5 border border-brand-border rounded-2xl text-left text-xs text-text-muted transition-all hover:border-brand-primary/30 font-bold tracking-tight hover:text-text-main"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m, i) => (
                <div 
                  key={i} 
                  className={`flex gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ${m.role === 'assistant' ? '' : 'flex-row-reverse'}`}
                >
                  <div className={`
                    w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-xl
                    ${m.role === 'assistant' ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-blue-600 border-blue-400 shadow-blue-600/30'}
                  `}>
                    {m.role === 'assistant' ? <Bot className="w-6 h-6 text-indigo-400" /> : <User className="w-6 h-6 text-white" />}
                  </div>
                  <div className={`flex-1 space-y-6 max-w-3xl ${m.role === 'assistant' ? '' : 'flex flex-col items-end'}`}>
                    <div className={`
                      inline-block p-8 rounded-[2rem] text-sm leading-relaxed shadow-2xl
                      ${m.role === 'assistant' ? 'bg-brand-highlight text-text-main border border-brand-border' : 'bg-brand-primary text-white rounded-tr-none'}
                    `}>
                      {m.content}
                    </div>
                    
                    {/* Citations / Sources */}
                    {m.role === 'assistant' && m.sources?.length > 0 && (
                      <div className="flex flex-wrap gap-3 pt-2">
                        {m.sources.map((source, idx) => (
                          <Link 
                            key={idx}
                            to={`/dashboard/meetings/${source.id}`}
                            className="flex items-center gap-3 px-4 py-2 bg-brand-bg hover:bg-white/5 border border-white/5 rounded-xl text-[10px] font-black text-blue-400 transition-all uppercase tracking-widest shadow-xl"
                          >
                            <LinkIcon className="w-3.5 h-3.5" />
                            Source: {source.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {isSending && (
              <div className="flex gap-8 animate-in fade-in duration-300">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-lg shadow-indigo-500/5">
                  <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                </div>
                <div className="flex-1">
                  <div className="inline-block p-8 rounded-[2rem] bg-white/[0.03] border border-white/5">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-indigo-500/40 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-indigo-500/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-indigo-500/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="px-10 py-10 bg-white/[0.01] border-t border-brand-border">
            <form onSubmit={handleSendMessage} className="relative group max-w-5xl mx-auto">
              <div className="absolute inset-0 bg-blue-600/5 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
              <input 
                type="text"
                placeholder="Ask your meeting intelligence..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isSending}
                className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary/50 rounded-3xl pl-8 pr-20 py-6 text-sm text-text-main transition-all outline-none shadow-2xl relative z-10 font-medium placeholder:text-text-muted/50"
              />
              <button 
                type="submit"
                disabled={!input.trim() || isSending}
                className={`
                  absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-2xl flex items-center justify-center transition-all z-20
                  ${!input.trim() || isSending ? 'text-gray-700 bg-white/5 cursor-not-allowed' : 'text-white bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-600/30'}
                `}
              >
                <Send className="w-6 h-6" />
              </button>
            </form>
            <div className="mt-6 flex items-center justify-center gap-8 text-[10px] font-black text-gray-700 uppercase tracking-[0.2em]">
              <span className="flex items-center gap-2"><Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Powered by Gemini 2.0</span>
              <span className="w-1 h-1 rounded-full bg-gray-800"></span>
              <span className="flex items-center gap-2"><LinkIcon className="w-3.5 h-3.5 text-blue-500" /> Semantic RAG Layer Active</span>
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
};

export default ChatPage;
