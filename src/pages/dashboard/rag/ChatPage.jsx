import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Plus, 
  Trash2, 
  Search, 
  Bot, 
  User, 
  ChevronRight, 
  Loader2, 
  Link as LinkIcon,
  MessageCircle,
  History,
  Sparkles
} from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import API from '../../../api/axiosInstance';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Link, useLocation } from 'react-router-dom';

const ChatPage = () => {
  const location = useLocation();
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q');
    if (query) {
      handleAutoSearch(query);
    }
  }, [location.search]);

  const handleAutoSearch = async (query) => {
    if (loading) return;
    setInput(query);
    
    // We need to wait a tiny bit for the component to mount and sessions to potentially load
    setTimeout(async () => {
      const userMessage = { role: 'user', content: query };
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      setLoading(true);

      try {
        const sessionRes = await API.post('rag/chat/sessions/', { title: query.substring(0, 30) + '...' });
        const sessionId = sessionRes.data.data.id;
        fetchSessions();
        
        const res = await API.post(`rag/chat/sessions/${sessionId}/messages/`, { content: query });
        setMessages(prev => [...prev, res.data.data]);
        loadSession(sessionId);
      } catch (err) {
        toast.error('Failed to auto-search');
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchSessions = async () => {
    try {
      const res = await API.get('rag/chat/sessions/');
      setSessions(res.data.data);
      if (res.data.data.length > 0 && !currentSession) {
        loadSession(res.data.data[0].id);
      }
    } catch (err) {
      toast.error('Failed to load chat history');
    } finally {
      setSessionsLoading(false);
    }
  };

  const loadSession = async (sessionId) => {
    setLoading(true);
    try {
      const res = await API.get(`rag/chat/sessions/${sessionId}/`);
      setCurrentSession(res.data.data);
      setMessages(res.data.data.messages || []);
    } catch (err) {
      toast.error('Failed to load session');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      let sessionId = currentSession?.id;
      
      // If no session exists, create one first or the backend handles it
      if (!sessionId) {
        const sessionRes = await API.post('rag/chat/sessions/', { title: input.substring(0, 30) + '...' });
        sessionId = sessionRes.data.data.id;
        fetchSessions();
      }

      const res = await API.post(`rag/chat/sessions/${sessionId}/messages/`, { content: userMessage.content });
      setMessages(prev => [...prev, res.data.data]);
      
      // Refresh session title if it was the first message
      if (!currentSession) {
        loadSession(sessionId);
      }
    } catch (err) {
      toast.error('Failed to get AI response');
    } finally {
      setLoading(false);
    }
  };

  const createNewSession = () => {
    setCurrentSession(null);
    setMessages([]);
    setInput('');
  };

  const deleteSession = async (id, e) => {
    e.stopPropagation();
    try {
      await API.delete(`rag/chat/sessions/${id}/`);
      setSessions(prev => prev.filter(s => s.id !== id));
      if (currentSession?.id === id) {
        createNewSession();
      }
      toast.success('Session deleted');
    } catch (err) {
      toast.error('Failed to delete session');
    }
  };

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-180px)] gap-6 animate-in fade-in duration-500">
        
        {/* Sidebar: Chat History */}
        <div className="w-80 bg-brand-surface border border-brand-border rounded-3xl flex flex-col overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-brand-border">
            <button 
              onClick={createNewSession}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
            >
              <Plus className="w-4 h-4" /> New Conversation
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2 mb-4 flex items-center gap-2">
              <History className="w-3 h-3" /> Recent History
            </div>
            {sessionsLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-6 h-6 text-gray-600 animate-spin" />
              </div>
            ) : sessions.length > 0 ? (
              sessions.map((s) => (
                <div 
                  key={s.id}
                  onClick={() => loadSession(s.id)}
                  className={`
                    group flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all
                    ${currentSession?.id === s.id ? 'bg-blue-600/10 border border-blue-500/20' : 'hover:bg-white/5 border border-transparent'}
                  `}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <MessageCircle className={`w-4 h-4 ${currentSession?.id === s.id ? 'text-blue-500' : 'text-gray-600'}`} />
                    <span className={`text-sm truncate font-medium ${currentSession?.id === s.id ? 'text-blue-100' : 'text-gray-400 group-hover:text-gray-200'}`}>
                      {s.title || 'Untitled Chat'}
                    </span>
                  </div>
                  <button 
                    onClick={(e) => deleteSession(s.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded-lg text-gray-600 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-xs text-gray-600">No conversations yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-brand-surface border border-brand-border rounded-3xl overflow-hidden shadow-2xl relative">
          
          {/* Header */}
          <div className="p-6 border-b border-brand-border flex items-center justify-between bg-white/[0.01]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-widest">Audicle Intelligence</h2>
                <p className="text-[10px] text-gray-500 font-medium">Ask anything about your meeting history</p>
              </div>
            </div>
            {currentSession && (
               <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-full border border-brand-border">
                 Context: All Transcripts
               </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center mb-8 border border-blue-500/20 shadow-2xl shadow-blue-600/10">
                  <Bot className="w-10 h-10 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Meeting Intelligence</h3>
                <p className="text-gray-500 max-w-sm leading-relaxed">
                  I can search through your meeting history to find answers, summarize discussions, or track action items across your entire team.
                </p>
                <div className="grid grid-cols-2 gap-4 mt-12 max-w-lg">
                  {[
                    "What were the key takeaways from last week's sync?",
                    "Did we discuss the budget for Phase 9?",
                    "List all action items assigned to John.",
                    "Summarize our discussion on the new UI design."
                  ].map((suggestion, i) => (
                    <button 
                      key={i}
                      onClick={() => setInput(suggestion)}
                      className="p-4 bg-white/5 hover:bg-white/10 border border-brand-border rounded-2xl text-left text-xs text-gray-400 transition-all hover:border-blue-500/30"
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
                  className={`flex gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300 ${m.role === 'assistant' ? '' : 'flex-row-reverse'}`}
                >
                  <div className={`
                    w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border
                    ${m.role === 'assistant' ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-600/20'}
                  `}>
                    {m.role === 'assistant' ? <Bot className="w-5 h-5 text-indigo-400" /> : <User className="w-5 h-5 text-white" />}
                  </div>
                  <div className={`flex-1 space-y-4 max-w-2xl ${m.role === 'assistant' ? '' : 'text-right'}`}>
                    <div className={`
                      inline-block p-5 rounded-3xl text-sm leading-relaxed shadow-sm
                      ${m.role === 'assistant' ? 'bg-white/5 text-gray-300 border border-brand-border' : 'bg-blue-600 text-white rounded-tr-none'}
                    `}>
                      {m.content}
                    </div>
                    
                    {/* Citations / Sources */}
                    {m.role === 'assistant' && m.sources?.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {m.sources.map((source, idx) => (
                          <Link 
                            key={idx}
                            to={`/dashboard/meetings/${source.id}`}
                            className="flex items-center gap-2 px-3 py-1.5 bg-brand-bg hover:bg-brand-border border border-brand-border rounded-lg text-[10px] font-bold text-blue-500 transition-all"
                          >
                            <LinkIcon className="w-3 h-3" />
                            Source: {source.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex gap-6 animate-in fade-in duration-300">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                </div>
                <div className="flex-1">
                  <div className="inline-block p-5 rounded-3xl bg-white/5 border border-brand-border">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-8 bg-white/[0.01] border-t border-brand-border">
            <form onSubmit={handleSendMessage} className="relative group">
              <input 
                type="text"
                placeholder="Ask your meeting intelligence..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                className="w-full bg-brand-bg border border-brand-border focus:border-blue-500/50 rounded-2xl pl-6 pr-16 py-5 text-sm text-white transition-all outline-none shadow-2xl group-hover:border-white/10"
              />
              <button 
                type="submit"
                disabled={!input.trim() || loading}
                className={`
                  absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-xl flex items-center justify-center transition-all
                  ${!input.trim() || loading ? 'text-gray-700 bg-white/5 cursor-not-allowed' : 'text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20'}
                `}
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
            <div className="mt-4 flex items-center justify-center gap-6 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-indigo-500" /> Powered by Gemini 2.0</span>
              <span className="w-1 h-1 rounded-full bg-gray-800"></span>
              <span className="flex items-center gap-1.5"><LinkIcon className="w-3 h-3 text-blue-500" /> Semantic Search Enabled</span>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default ChatPage;
