import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Video,
  MessageSquare,
  ChevronLeft,
  FileText,
  Activity,
  Download,
  Share2,
  Trash2,
  Loader2,
  AlertCircle,
  Play,
  Pause,
  Bot,
  Pencil
} from 'lucide-react';
import {
  useGetMeetingQuery,
  useGetMeetingTranscriptQuery,
  useGetMeetingSummaryQuery,
  useDeleteMeetingMutation,
  useDispatchBotMutation,
  useUpdateTranscriptSegmentMutation
} from '../api/meetingsApi';
import AppLayout from '../../../components/layout/AppLayout';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import ChatSidebar from '../../rag/components/ChatSidebar';
import StatusBadge from '../../../components/shared/StatusBadge';
import Skeleton from '../../../components/shared/Skeleton';

const MeetingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState(() => searchParams.get('t') ? 'transcript' : 'summary');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRef = useRef(null);

  const { data: meetingRes, isLoading: meetingLoading, error: meetingError } = useGetMeetingQuery(id, {
    pollingInterval: 5000
  });

  const { data: segmentsRes, isLoading: segmentsLoading } = useGetMeetingTranscriptQuery(id, {
    skip: activeTab !== 'transcript',
    pollingInterval: 5000
  });

  const { data: summaryRes, isLoading: summaryLoading } = useGetMeetingSummaryQuery(id, {
    skip: activeTab !== 'summary',
    pollingInterval: 5000
  });

  const [deleteMeeting, { isLoading: isDeleting }] = useDeleteMeetingMutation();
  const [dispatchBot, { isLoading: isDispatching }] = useDispatchBotMutation();
  const [updateSegment] = useUpdateTranscriptSegmentMutation();

  const [editingSpeakerId, setEditingSpeakerId] = useState(null);
  const [newSpeakerName, setNewSpeakerName] = useState('');

  const meeting = meetingRes?.data || meetingRes;
  const segments = segmentsRes?.data?.results || segmentsRes?.data?.segments || (Array.isArray(segmentsRes?.data) ? segmentsRes.data : (Array.isArray(segmentsRes) ? segmentsRes : []));
  const summary = summaryRes?.data || summaryRes;

  // Sync tab if search params change after mount
  useEffect(() => {
    const t = searchParams.get('t');
    if (t && activeTab !== 'transcript') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTab('transcript');
    }
  }, [searchParams, activeTab]);

  const parseToSeconds = (val) => {
    if (typeof val === 'string' && val.includes(':')) {
      const parts = val.split(':').map(Number);
      if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
      if (parts.length === 2) return parts[0] * 60 + parts[1];
    }
    return parseFloat(val);
  };

  const formatSeconds = (sec) => {
    const sNum = parseToSeconds(sec);
    if (isNaN(sNum)) return '0:00';
    const m = Math.floor(sNum / 60);
    const s = Math.floor(sNum % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleTimeJump = (startTime) => {
    if (audioRef.current) {
      audioRef.current.currentTime = parseToSeconds(startTime);
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this intelligence record?')) return;
    try {
      await deleteMeeting(id).unwrap();
      toast.success('Record deleted');
      navigate('/dashboard/meetings');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete meeting');
    }
  };

  const handleDispatchBot = async () => {
    try {
      await dispatchBot(id).unwrap();
      toast.success('Bot assistant dispatched');
    } catch (err) {
      console.error(err);
      toast.error('Failed to dispatch bot');
    }
  };

  const handleRenameSpeaker = async (segmentId) => {
    if (!newSpeakerName.trim()) return;
    try {
      await updateSegment({
        meetingId: id,
        segmentId,
        data: { speaker_name: newSpeakerName }
      }).unwrap();
      setEditingSpeakerId(null);
      toast.success('Speaker updated');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update speaker');
    }
  };

  if (meetingLoading) {
    return (
      <AppLayout>
        {/* Header Skeleton */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 mb-12">
          <div className="space-y-6 flex-grow">
            <div className="flex items-center gap-3">
              <Skeleton className="w-4 h-4 rounded" />
              <Skeleton className="w-32 h-4 rounded-lg" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="w-72 h-10 rounded-2xl" />
                <Skeleton className="w-24 h-6 rounded-full" />
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Skeleton className="w-36 h-6 rounded-full" />
                <Skeleton className="w-28 h-6 rounded-full" />
                <Skeleton className="w-40 h-6 rounded-full" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <Skeleton className="w-36 h-12 rounded-xl" />
            <Skeleton className="w-12 h-12 rounded-xl" />
            <Skeleton className="w-12 h-12 rounded-xl" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          <div className="xl:col-span-2 space-y-10">
            {/* Audio Bar Skeleton */}
            <div className="bg-brand-surface border border-brand-border rounded-[2.5rem] p-8 shadow-2xl">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <Skeleton className="w-16 h-16 rounded-2xl shrink-0" />
                <div className="flex-1 space-y-4 w-full">
                  <div className="flex justify-between">
                    <Skeleton className="w-20 h-4 rounded-lg" />
                    <Skeleton className="w-24 h-4 rounded-lg" />
                  </div>
                  <Skeleton className="w-full h-2 rounded-full" />
                </div>
                <Skeleton className="w-36 h-12 rounded-xl shrink-0" />
              </div>
            </div>

            {/* Tab System & Tab Content Skeleton */}
            <div className="space-y-8">
              <div className="flex gap-3 p-1.5 bg-brand-surface border border-brand-border rounded-2xl w-fit">
                <Skeleton className="w-36 h-10 rounded-xl" />
                <Skeleton className="w-36 h-10 rounded-xl" />
              </div>
              <div className="bg-brand-surface border border-brand-border rounded-[2.5rem] p-10 shadow-2xl min-h-[500px] space-y-8">
                <Skeleton className="w-48 h-6 rounded-lg" />
                <Skeleton className="w-full h-24 rounded-2xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-6">
                  <div className="space-y-4">
                    <Skeleton className="w-32 h-6 rounded-lg" />
                    <Skeleton className="w-full h-4 rounded-lg" />
                    <Skeleton className="w-5/6 h-4 rounded-lg" />
                    <Skeleton className="w-4/5 h-4 rounded-lg" />
                  </div>
                  <div className="space-y-4">
                    <Skeleton className="w-32 h-6 rounded-lg" />
                    <Skeleton className="w-full h-4 rounded-lg" />
                    <Skeleton className="w-5/6 h-4 rounded-lg" />
                    <Skeleton className="w-4/5 h-4 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="xl:col-span-1 space-y-8">
            <div className="bg-brand-surface border border-brand-border rounded-[2.5rem] p-8 shadow-2xl space-y-6">
              <Skeleton className="w-48 h-6 rounded-lg" />
              <Skeleton className="w-36 h-4 rounded-lg" />
              <div className="p-6 bg-brand-highlight border border-brand-border rounded-[2rem] space-y-6">
                <Skeleton className="w-16 h-16 rounded-2xl mx-auto" />
                <Skeleton className="w-3/4 h-4 rounded-lg mx-auto" />
                <Skeleton className="w-full h-12 rounded-2xl" />
              </div>
            </div>

            <div className="bg-brand-surface border border-brand-border rounded-[2.5rem] p-8 shadow-xl space-y-6">
              <Skeleton className="w-36 h-6 rounded-lg" />
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-brand-highlight border border-brand-border rounded-2xl">
                    <Skeleton className="w-24 h-4 rounded-lg" />
                    <Skeleton className="w-12 h-4 rounded-lg" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (meetingError || !meeting || id === 'undefined') {
    return (
      <AppLayout>
        <div className="text-center py-20 px-8 bg-brand-surface border border-brand-border rounded-[2.5rem]">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-text-main mb-3">Node Connection Failed</h2>
          <p className="text-text-muted mb-8 uppercase tracking-widest text-[10px] font-bold">This intelligence record could not be retrieved from the registry (Invalid ID).</p>
          <button onClick={() => navigate('/dashboard/meetings')} className="px-8 py-3 bg-brand-highlight hover:opacity-80 border border-brand-border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
            Back to Terminal
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="space-y-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-3 text-text-muted hover:text-text-main transition-colors group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Return to Meetings</span>
          </button>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-black text-text-main tracking-tighter leading-none">{meeting.title}</h1>
              <StatusBadge status={meeting.status} />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-brand-highlight rounded-full border border-brand-border">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                {meeting.date && !isNaN(new Date(meeting.date).getTime())
                  ? format(new Date(meeting.date), 'PPP')
                  : (meeting.created_at && !isNaN(new Date(meeting.created_at).getTime())
                    ? format(new Date(meeting.created_at), 'PPP')
                    : 'No date set')}
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-brand-highlight rounded-full border border-brand-border">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                {meeting.duration ? `${Math.floor(meeting.duration / 60)}m ${meeting.duration % 60}s` : 'Unknown duration'}
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-brand-highlight rounded-full border border-brand-border">
                <Video className="w-3.5 h-3.5 text-blue-500" />
                {meeting.platform || 'Recorded Upload'}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {meeting.status === 'scheduled' && (
            <button
              onClick={handleDispatchBot}
              disabled={isDispatching}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 transition-all flex items-center gap-3"
            >
              {isDispatching ? <Loader2 size={14} className="animate-spin" /> : <Bot size={14} />}
              Dispatch Bot
            </button>
          )}
          <button className="p-3.5 bg-brand-surface border border-brand-border rounded-xl text-text-muted hover:text-text-main transition-all hover:border-white/10 shadow-lg">
            <Share2 size={18} />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-3.5 bg-brand-surface border border-brand-border rounded-xl text-text-muted hover:text-red-500 transition-all hover:border-red-500/30 shadow-lg"
          >
            {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">

        <div className="xl:col-span-2 space-y-10">
          {/* Audio Analysis Bar */}
          {meeting.audio_url && (
            <div className="bg-brand-surface border border-brand-border rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <button
                  onClick={() => {
                    if (isPlaying) audioRef.current.pause();
                    else audioRef.current.play();
                    setIsPlaying(!isPlaying);
                  }}
                  className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-600/30 hover:bg-blue-500 transition-all hover:scale-105"
                >
                  {isPlaying ? <Pause size={28} fill="white" /> : <Play size={28} fill="white" className="ml-1" />}
                </button>

                <div className="flex-1 space-y-4 w-full">
                  <div className="flex justify-between text-[10px] font-black text-text-muted uppercase tracking-widest">
                    <span>Analysis Pulse</span>
                    <span>{formatSeconds(playbackTime)} / {formatSeconds(meeting.duration || 0)}</span>
                  </div>
                  <div className="h-2 bg-brand-bg rounded-full overflow-hidden border border-brand-border p-0.5">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all"
                      style={{ width: `${(playbackTime / (meeting.duration || 1)) * 100}%` }}
                    />
                  </div>
                </div>

                <audio
                  ref={audioRef}
                  src={meeting.audio_url}
                  onTimeUpdate={(e) => setPlaybackTime(e.target.currentTime)}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />

                <button className="px-6 py-3 bg-brand-highlight border border-brand-border rounded-xl text-[10px] font-black uppercase tracking-widest text-text-main flex items-center gap-3 transition-all hover:bg-brand-bg">
                  <Download size={14} /> Download Audio
                </button>
              </div>
            </div>
          )}

          {/* Tab System */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 p-1.5 bg-brand-surface border border-brand-border rounded-2xl w-fit shadow-inner">
              {[
                { id: 'summary', name: 'STRATEGIC SUMMARY', icon: FileText },
                { id: 'transcript', name: 'TRANSCRIPT', icon: MessageSquare }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                        flex items-center gap-3 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all
                        ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-text-muted hover:text-text-main'}
                      `}
                >
                  <tab.icon size={14} />
                  {tab.name}
                </button>
              ))}
            </div>

            <div className="bg-brand-surface border border-brand-border rounded-[2.5rem] p-10 shadow-2xl min-h-[500px]">
              {activeTab === 'summary' && (
                <div className="animate-in fade-in duration-500 space-y-12">
                  {summaryLoading ? (
                    <div className="space-y-12">
                      <section className="space-y-4">
                        <Skeleton className="w-48 h-6 rounded-lg" />
                        <Skeleton className="w-full h-4 rounded-lg" />
                        <Skeleton className="w-11/12 h-4 rounded-lg" />
                        <Skeleton className="w-10/12 h-4 rounded-lg" />
                      </section>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <section className="space-y-4">
                          <Skeleton className="w-36 h-6 rounded-lg" />
                          {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex gap-4">
                              <Skeleton className="w-2 h-2 rounded-full mt-2 shrink-0" />
                              <Skeleton className="w-full h-4 rounded-lg" />
                            </div>
                          ))}
                        </section>
                        <section className="space-y-4">
                          <Skeleton className="w-36 h-6 rounded-lg" />
                          {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex gap-4">
                              <Skeleton className="w-2 h-2 rounded-full mt-2 shrink-0" />
                              <Skeleton className="w-full h-4 rounded-lg" />
                            </div>
                          ))}
                        </section>
                      </div>
                    </div>
                  ) : (summary?.executive_summary || (summary?.key_points && summary.key_points.length > 0)) ? (
                    <>
                      <section>
                        <h3 className="text-xs font-black text-blue-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                          <div className="w-8 h-1 bg-blue-500 rounded-full"></div> Executive Narrative
                        </h3>
                        <p className="text-lg font-bold text-text-main leading-relaxed tracking-tight">{summary.executive_summary}</p>
                      </section>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <section>
                          <h3 className="text-xs font-black text-emerald-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                            <div className="w-8 h-1 bg-emerald-500 rounded-full"></div> Key Objectives
                          </h3>
                          <ul className="space-y-4">
                            {summary.key_points?.map((point, i) => (
                              <li key={i} className="flex gap-4 group">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 group-hover:scale-150 transition-transform"></div>
                                <span className="text-sm font-medium text-text-muted leading-relaxed group-hover:text-text-main transition-colors">{point}</span>
                              </li>
                            ))}
                          </ul>
                        </section>

                        <section>
                          <h3 className="text-xs font-black text-amber-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                            <div className="w-8 h-1 bg-amber-500 rounded-full"></div> Strategic Next Steps
                          </h3>
                          <ul className="space-y-4">
                            {summary.next_steps?.map((step, i) => (
                              <li key={i} className="flex gap-4 group">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 group-hover:scale-150 transition-transform"></div>
                                <span className="text-sm font-medium text-text-muted leading-relaxed group-hover:text-text-main transition-colors">{step}</span>
                              </li>
                            ))}
                          </ul>
                        </section>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                      <div className="w-16 h-16 rounded-3xl bg-blue-500/5 flex items-center justify-center mb-6 border border-blue-500/10">
                        <FileText className="w-8 h-8 text-blue-500/40" />
                      </div>
                      <h4 className="text-sm font-black text-text-main uppercase tracking-widest mb-2">Analysis Pending</h4>
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] max-w-xs leading-relaxed">
                        Our AI engine is currently processing this meeting. The summary will appear here shortly.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'transcript' && (
                <div className="animate-in fade-in duration-500 space-y-6">
                  {segmentsLoading ? (
                    <div className="space-y-6">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="py-6 flex gap-8 -mx-4 px-4">
                          <Skeleton className="w-20 h-6 rounded-lg shrink-0" />
                          <div className="flex-1 space-y-3">
                            <Skeleton className="w-24 h-4 rounded-lg" />
                            <Skeleton className="w-full h-4 rounded-lg" />
                            <Skeleton className="w-5/6 h-4 rounded-lg" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (segments && segments.length > 0) ? (
                    <div className="divide-y divide-brand-border/50">
                      {segments.map((segment, i) => (
                        <div
                          key={i}
                          onClick={() => handleTimeJump(segment.start_seconds || segment.start_time)}
                          className="py-6 flex gap-8 group cursor-pointer hover:bg-white/[0.01] transition-all -mx-4 px-4 rounded-xl"
                        >
                          <div className="w-20 pt-1 shrink-0">
                            <span className="text-[10px] font-black text-text-muted bg-brand-highlight px-2.5 py-1 rounded-lg border border-brand-border group-hover:text-blue-500 group-hover:border-blue-500/30 transition-all">
                              {formatSeconds(segment.start_seconds || segment.start_time)}
                            </span>
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {editingSpeakerId === segment.id ? (
                                  <div className="flex items-center gap-2">
                                    <input
                                      autoFocus
                                      className="bg-brand-highlight border border-blue-500/50 rounded px-2 py-0.5 text-[10px] font-black text-text-main outline-none"
                                      value={newSpeakerName}
                                      onChange={(e) => setNewSpeakerName(e.target.value)}
                                      onClick={(e) => e.stopPropagation()}
                                      onKeyDown={(e) => {
                                        e.stopPropagation();
                                        if (e.key === 'Enter') handleRenameSpeaker(segment.id, segment.speaker_label);
                                        if (e.key === 'Escape') setEditingSpeakerId(null);
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
                                    {segment.speaker_name || segment.speaker_label || 'NODE-ALPHA'}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingSpeakerId(segment.id);
                                        setNewSpeakerName(segment.speaker_name || segment.speaker_label || '');
                                      }}
                                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-blue-500/10 rounded transition-all"
                                    >
                                      <Pencil size={10} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <p className="text-sm font-medium text-text-muted leading-relaxed group-hover:text-text-main transition-colors">
                              {segment.text || segment.content || 'Segment content unavailable'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                      <div className="w-16 h-16 rounded-3xl bg-indigo-500/5 flex items-center justify-center mb-6 border border-indigo-500/10">
                        <MessageSquare className="w-8 h-8 text-indigo-500/40" />
                      </div>
                      <h4 className="text-sm font-black text-text-main uppercase tracking-widest mb-2">Transcript Indexing</h4>
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] max-w-xs leading-relaxed">
                        Vocal fingerprints are being mapped. The full transcript will be available shortly.
                      </p>
                    </div>
                  )}
                </div>
              )}


            </div>
          </div>
        </div>

        {/* Sidebar: AI Actions */}
        <div className="xl:col-span-1 space-y-8">
          <div className="bg-brand-surface border border-brand-border rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-24 bg-blue-600/5 rounded-full -mr-24 -mt-24 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="relative z-10">
              <h3 className="text-sm font-black text-text-main uppercase tracking-widest mb-2">Cognitive Assistant</h3>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-8 opacity-60">Real-time meeting interrogation</p>

              <div className="p-6 bg-brand-highlight border border-brand-border rounded-[2rem] text-center space-y-6">
                <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mx-auto border border-blue-500/20 shadow-xl shadow-blue-600/5">
                  <MessageSquare className="w-8 h-8 text-blue-500" />
                </div>
                <p className="text-xs font-bold text-text-muted leading-relaxed uppercase tracking-widest px-4">
                  Interrogate your meeting data with our specialized RAG engine.
                </p>
                <button
                  onClick={() => setIsChatOpen(true)}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-600/20 active:scale-95"
                >
                  Initiate Intelligence Chat
                </button>
              </div>
            </div>
          </div>

          <div className="bg-brand-surface border border-brand-border rounded-[2.5rem] p-8 shadow-xl">
            <h3 className="text-sm font-black text-text-main uppercase tracking-widest mb-6">Strategic Insights</h3>
            <div className="space-y-4">
              {[
                { label: 'Decision Velocity', value: 'High', color: 'text-emerald-500' },
                { label: 'Audio Quality', value: '84%', color: 'text-blue-500' },
                { label: 'Conflict Index', value: 'Minimal', color: 'text-amber-500' }
              ].map((stat, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-brand-highlight border border-brand-border rounded-2xl">
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{stat.label}</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${stat.color}`}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      <ChatSidebar
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        meetingId={id}
        meetingTitle={meeting?.title || ''}
      />
    </AppLayout>
  );
};

export default MeetingDetailPage;
