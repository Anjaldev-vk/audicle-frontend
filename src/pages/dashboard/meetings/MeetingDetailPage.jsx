import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Clock, 
  Download, 
  Share2, 
  MoreVertical,
  CheckCircle2,
  FileText,
  MessageSquare,
  ListFilter,
  Globe,
  RefreshCw,
  Loader2,
  AlertCircle,
  Volume2,
  Calendar
} from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import API from '../../../api/axiosInstance';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const MeetingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' or 'transcript'
  const [meeting, setMeeting] = useState(null);
  const [transcript, setTranscript] = useState(null);
  const [segments, setSegments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [audioUrl, setAudioUrl] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meetingRes, transcriptRes, segmentsRes, summaryRes] = await Promise.all([
          API.get(`meetings/${id}/`),
          API.get(`meetings/${id}/transcript/`).catch(() => ({ data: { data: null } })),
          API.get(`meetings/${id}/transcript/segments/`).catch(() => ({ data: { data: [] } })),
          API.get(`meetings/${id}/summary/`).catch(() => ({ data: { data: null } })),
        ]);

        setMeeting(meetingRes.data.data);
        setTranscript(transcriptRes.data.data);
        setSegments(segmentsRes.data.data);
        setSummary(summaryRes.data.data);

        // If meeting has audio, get download URL
        if (meetingRes.data.data.audio_s3_key) {
          const audioRes = await API.get(`meetings/${id}/upload/download-url/`);
          setAudioUrl(audioRes.data.data.url);
        }
      } catch (_err) {
        console.error(_err);
        toast.error('Failed to load meeting details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleTranslate = async (lang) => {
    setTranslating(true);
    try {
      const res = await API.post(`meetings/${id}/summary/translate/`, { target_language: lang });
      // Backend returns the translated content directly or updates the summary
      // Assuming it returns translated summary object
      setSummary(res.data.data);
      toast.success(`Translated to ${lang}`);
    } catch (_err) {
      toast.error('Translation failed');
    } finally {
      setTranslating(false);
    }
  };

  const handleRetryTranscript = async () => {
    try {
      await API.post(`meetings/${id}/transcript/retry/`);
      toast.success('Transcription restarted');
      window.location.reload();
    } catch (_err) {
      toast.error('Failed to retry');
    }
  };

  const toggleAudio = () => {
    if (audioPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setAudioPlaying(!audioPlaying);
  };

  const formatSeconds = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-40">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
          <p className="text-gray-500 animate-pulse font-medium">Loading intelligence...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!meeting) return null;

  return (
    <DashboardLayout>
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard/meetings')}
            className="p-2.5 bg-brand-surface border border-brand-border rounded-xl hover:text-white transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">{meeting.title}</h1>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {format(new Date(meeting.created_at), 'MMM d, yyyy')}</span>
              <span className="w-1 h-1 rounded-full bg-gray-700"></span>
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {meeting.duration_seconds ? formatSeconds(meeting.duration_seconds) : 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-brand-surface border border-brand-border rounded-xl text-xs font-bold text-gray-400 hover:text-white transition-all">
            <Share2 className="w-4 h-4" /> Share
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/20">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Audio Player Bar */}
      {audioUrl && (
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-4 mb-8 flex items-center gap-6 shadow-2xl">
          <button 
            onClick={toggleAudio}
            className="w-12 h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center justify-center transition-all shadow-lg shadow-blue-600/20"
          >
            {audioPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current" />}
          </button>
          <div className="flex-1">
            <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-widest">
              <span>Audicle Audio Trace</span>
              <span className="flex items-center gap-1"><Volume2 className="w-3 h-3" /> Stereo • 44.1kHz</span>
            </div>
            <div className="h-2 bg-brand-bg rounded-full overflow-hidden relative">
              <div className="absolute top-0 left-0 h-full bg-blue-600 w-1/3 shadow-[0_0_10px_rgba(37,99,235,0.5)]"></div>
            </div>
          </div>
          <audio ref={audioRef} src={audioUrl} onEnded={() => setAudioPlaying(false)} className="hidden" />
        </div>
      )}

      {/* Content Tabs */}
      <div className="flex gap-8 border-b border-brand-border mb-8">
        <button 
          onClick={() => setActiveTab('summary')}
          className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === 'summary' ? 'text-blue-500' : 'text-gray-500 hover:text-white'}`}
        >
          Intelligence Summary
          {activeTab === 'summary' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 shadow-[0_-2px_8px_rgba(59,130,246,0.5)]"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('transcript')}
          className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === 'transcript' ? 'text-blue-500' : 'text-gray-500 hover:text-white'}`}
        >
          Full Transcript
          {activeTab === 'transcript' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 shadow-[0_-2px_8px_rgba(59,130,246,0.5)]"></div>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Summary or Transcript */}
        <div className="lg:col-span-2 space-y-8">
          {activeTab === 'summary' ? (
            <>
              {summary ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Summary Text */}
                  <div className="bg-brand-surface border border-brand-border rounded-3xl p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-white flex items-center gap-3">
                        <FileText className="w-6 h-6 text-blue-500" />
                        Executive Summary
                      </h2>
                      <div className="flex gap-2">
                        {['Spanish', 'French', 'German'].map(lang => (
                          <button 
                            key={lang}
                            onClick={() => handleTranslate(lang)}
                            disabled={translating}
                            className="text-[10px] font-bold text-gray-500 hover:text-white px-2 py-1 bg-white/5 rounded border border-brand-border transition-all uppercase tracking-tighter disabled:opacity-50"
                          >
                            {lang}
                          </button>
                        ))}
                        <Globe className="w-4 h-4 text-gray-600 self-center ml-2" />
                      </div>
                    </div>
                    <p className="text-gray-400 leading-relaxed text-lg">
                      {summary.summary}
                    </p>
                  </div>

                  {/* Grid for Points and Action Items */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-brand-surface border border-brand-border rounded-3xl p-8">
                      <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2 text-indigo-400">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
                        Key Points
                      </h3>
                      <ul className="space-y-4">
                        {summary.key_points?.map((point, idx) => (
                          <li key={idx} className="flex gap-4 text-sm text-gray-400 leading-snug">
                            <span className="text-blue-500 font-bold">•</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-brand-surface border border-brand-border rounded-3xl p-8">
                      <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2 text-emerald-400">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                        Action Items
                      </h3>
                      <ul className="space-y-4">
                        {summary.action_items?.map((item, idx) => (
                          <li key={idx} className="flex gap-4 items-start text-sm text-gray-400 leading-snug group cursor-pointer">
                            <div className="w-5 h-5 rounded border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-500/10 transition-colors">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-brand-surface border border-brand-border rounded-3xl p-12 text-center">
                  {meeting.status === 'processing' ? (
                    <>
                      <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-6" />
                      <h3 className="text-xl font-bold text-white mb-2">Generating Intelligence...</h3>
                      <p className="text-gray-500 max-w-sm mx-auto">
                        Our AI is currently transcribing and summarising your meeting. This usually takes 1-2 minutes.
                      </p>
                    </>
                  ) : meeting.status === 'failed' ? (
                    <>
                      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-6" />
                      <h3 className="text-xl font-bold text-white mb-2">Processing Failed</h3>
                      <p className="text-gray-500 max-w-sm mx-auto mb-8">
                        Something went wrong during the AI processing phase.
                      </p>
                      <button 
                        onClick={handleRetryTranscript}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-semibold text-sm transition-all border border-brand-border"
                      >
                        <RefreshCw className="w-4 h-4" /> Retry AI Pipeline
                      </button>
                    </>
                  ) : (
                    <p className="text-gray-500">Summary not available yet.</p>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="bg-brand-surface border border-brand-border rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-6 border-b border-brand-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-blue-500" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest">Transcript</h3>
                </div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded border border-brand-border">
                  {transcript?.language || 'EN'} • {transcript?.word_count || 0} Words
                </div>
              </div>
              <div className="p-8 space-y-10 max-h-[600px] overflow-y-auto custom-scrollbar">
                {segments.length > 0 ? (
                  segments.map((seg, idx) => (
                    <div key={idx} className="flex gap-6 group">
                      <div className="w-16 shrink-0 text-right">
                        <div className="text-[10px] font-bold text-blue-500/60 uppercase tracking-tighter">
                          {formatSeconds(seg.start_seconds)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-700"></span>
                          {seg.speaker_label || 'Speaker'}
                        </div>
                        <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                          {seg.text}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-600 py-10">No transcript segments available.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Metadata & Details */}
        <div className="space-y-8">
          {/* Status Card */}
          <div className="bg-brand-surface border border-brand-border rounded-3xl p-6">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6">Status Details</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">AI Processing</span>
                <span className={`text-xs font-bold uppercase tracking-widest ${meeting.status === 'completed' ? 'text-green-500' : 'text-blue-500'}`}>
                  {meeting.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Platform</span>
                <span className="text-xs font-bold text-white uppercase tracking-widest">{meeting.platform}</span>
              </div>
              {meeting.meeting_url && (
                <div className="pt-4 mt-4 border-t border-brand-border">
                  <a 
                    href={meeting.meeting_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[10px] font-bold text-blue-500 hover:text-blue-400 uppercase tracking-widest flex items-center gap-2"
                  >
                    Original Meeting Link <Share2 className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Participants */}
          <div className="bg-brand-surface border border-brand-border rounded-3xl p-6">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6">Participants</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white">
                  YO
                </div>
                <div>
                  <div className="text-xs font-bold text-white">You (Owner)</div>
                  <div className="text-[10px] text-gray-500">Host</div>
                </div>
              </div>
              <div className="flex items-center gap-3 opacity-50">
                <div className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-400">
                  AI
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-400">Audicle Assistant</div>
                  <div className="text-[10px] text-gray-600">Bot</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MeetingDetailPage;
