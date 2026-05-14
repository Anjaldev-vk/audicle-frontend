import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Send,
  X,
  Bot, 
  User, 
  Loader2, 
  Sparkles,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { useGetChatSessionsQuery, useGetChatSessionQuery, useCreateChatSessionMutation, useSendMessageMutation } from '../api/ragApi';
import toast from 'react-hot-toast';

const ChatSidebar = ({ isOpen, onClose, meetingId, meetingTitle }) => {
  const isCreating = useRef(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  // RTK Query
  const { data: sessionsRes, isLoading: sessionsLoading, refetch: refetchSessions } = useGetChatSessionsQuery(undefined, { skip: !isOpen });
  const { data: sessionDetailRes, isFetching: sessionFetching } = useGetChatSessionQuery(sessionId, { skip: !sessionId });
  const [createSession] = useCreateChatSessionMutation();
  const [sendMessage, { isLoading: sending }] = useSendMessageMutation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCreateSession = useCallback(async () => {
    if (isCreating.current) return;
    isCreating.current = true;
    try {
      if (refetchSessions) await refetchSessions();
      const res = await createSession({ 
        title: `Chat: ${meetingTitle}`.substring(0, 50) 
      }).unwrap();
      if (res?.data?.id) {
        setSessionId(res.data.id);
      } else if (res?.id) {
        setSessionId(res.id);
      }
    } catch (err) {
      console.error('Failed to create chat session', err);
    } finally {
      isCreating.current = false;
    }
  }, [createSession, meetingTitle, refetchSessions]);

  useEffect(() => {
    if (isOpen && sessionsRes?.data && !sessionId && !isCreating.current) {
      const sessions = sessionsRes.data.results || (Array.isArray(sessionsRes.data) ? sessionsRes.data : []);
      const existingSession = sessions.find(s => s.title?.includes(meetingTitle));
      if (existingSession) {
        setSessionId(existingSession.id);
      } else {
        handleCreateSession();
      }
    }
  }, [isOpen, sessionsRes, meetingTitle, sessionId, handleCreateSession]);

  useEffect(() => {
    if (sessionDetailRes?.data?.messages) {
      setMessages(sessionDetailRes.data.messages);
    }
  }, [sessionDetailRes]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e, manualContent = null) => {
    if (e) e.preventDefault();
    const messageContent = manualContent || input;
    if (!messageContent.trim() || sending || !sessionId) return;

    const currentInput = input;
    if (!manualContent) setInput('');

    try {
      await sendMessage({ 
        sessionId, 
        content: messageContent,
        meetingId 
      }).unwrap();
    } catch (err) {
      console.error(err);
      toast.error('AI is currently unavailable');
      if (!manualContent) setInput(currentInput);
    }
  };

  const loading = sessionsLoading || (sessionId && sessionFetching && messages.length === 0);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <div className={`
        fixed top-0 right-0 h-full w-full sm:w-[450px] bg-brand-surface border-l border-brand-border z-[70] shadow-2xl transition-transform duration-500 ease-out flex flex-col
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Header */}
        <div className="p-6 border-b border-brand-border flex items-center justify-between bg-brand-highlight">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 flex items-center justify-center border border-indigo-500/20">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text-main uppercase tracking-widest">Meeting Intelligence</h2>
              <p className="text-[10px] text-text-muted font-medium truncate w-48">Context: {meetingTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-brand-bg rounded-lg text-text-muted hover:text-text-main transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              <p className="text-xs text-text-muted animate-pulse font-medium">Initializing AI Context...</p>
            </div>
          ) : (!sessionId && !isCreating.current) ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
              <h3 className="text-sm font-bold text-text-main mb-2">Connection Issue</h3>
              <p className="text-[10px] text-text-muted mb-6">We couldn't establish a secure AI session. Please try refreshing or re-logging.</p>
              <button 
                onClick={() => handleCreateSession()}
                className="px-6 py-2 bg-brand-highlight hover:opacity-80 border border-brand-border rounded-xl text-[10px] font-bold text-text-main uppercase tracking-widest transition-all"
              >
                Retry Connection
              </button>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 bg-indigo-600/10 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/20">
                <Sparkles className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold text-text-main mb-2">Ask about this meeting</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Ask me to summarize specific parts, find action items, or explain complex discussions.
              </p>
              <div className="mt-8 grid grid-cols-1 gap-3 w-full">
                {[
                  "Summarize the main decisions.",
                  "What were the next steps?",
                  "Did anyone mention the deadline?",
                  "Who was assigned to the UI task?"
                ].map((s, i) => (
                  <button 
                    key={i}
                    onClick={() => handleSendMessage(null, s)}
                    className="p-3 bg-brand-highlight hover:opacity-80 border border-brand-border rounded-xl text-left text-xs text-text-muted transition-all active:scale-[0.98]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 ${m.role === 'assistant' ? '' : 'flex-row-reverse'}`}
              >
                <div className={`
                  w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border
                  ${m.role === 'assistant' ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-blue-600 border-blue-500'}
                `}>
                  {m.role === 'assistant' ? <Bot className="w-4 h-4 text-indigo-400" /> : <User className="w-4 h-4 text-white" />}
                </div>
                <div className={`flex-1 space-y-2 ${m.role === 'assistant' ? '' : 'text-right'}`}>
                  <div className={`
                    inline-block p-4 rounded-2xl text-xs leading-relaxed
                    ${m.role === 'assistant' ? 'bg-brand-highlight text-text-main border border-brand-border' : 'bg-blue-600 text-white rounded-tr-none'}
                  `}>
                    {m.content}
                  </div>
                </div>
              </div>
            ))
          )}
          {sending && (
            <div className="flex gap-4 animate-in fade-in duration-300">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
              </div>
              <div className="flex-1">
                <div className="inline-block p-4 rounded-2xl bg-brand-highlight border border-brand-border">
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-text-muted rounded-full animate-bounce"></div>
                    <div className="w-1 h-1 bg-text-muted rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1 h-1 bg-text-muted rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="p-6 border-t border-brand-border bg-white/[0.01]">
          <form onSubmit={handleSendMessage} className="relative">
            <input
              type="text"
              placeholder="Message Audicle..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={sending || !sessionId}
              className="w-full bg-brand-bg border border-brand-border focus:border-blue-500/50 rounded-xl pl-4 pr-12 py-4 text-xs text-text-main transition-all outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || sending || !sessionId}
              className={`
                absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-all
                ${!input.trim() || sending ? 'text-text-muted bg-brand-highlight' : 'text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20'}
              `}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="mt-3 text-[9px] font-bold text-text-muted text-center uppercase tracking-widest flex items-center justify-center gap-1.5">
            <Sparkles className="w-2.5 h-2.5 text-indigo-500" /> AI-Powered Analysis
          </p>
        </div>
      </div>
    </>
  );
};

export default ChatSidebar;
