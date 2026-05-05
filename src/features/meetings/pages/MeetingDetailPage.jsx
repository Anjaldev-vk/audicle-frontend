import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  Download, 
  Share2, 
  FileText, 
  MessageSquare, 
  Loader2, 
  AlertCircle, 
  Calendar,
  Sparkles
} from 'lucide-react';
import AppLayout from '../../../components/layout/AppLayout';
import { useGetMeetingQuery } from '../api/meetingsApi';
import { 
  useGetTranscriptQuery, 
  useGetTranscriptSegmentsQuery, 
  useGetSummaryQuery,
  useEditSegmentMutation
} from '../../transcripts/api/transcriptApi';
import { format } from 'date-fns';
import ChatSidebar from '../../rag/components/ChatSidebar';
import BotStatusBadge from '../components/BotStatusBadge';
import SummaryPanel from '../../transcripts/components/SummaryPanel';
import TranscriptViewer from '../../transcripts/components/TranscriptViewer';
import SegmentEditor from '../../transcripts/components/SegmentEditor';
import { toast } from 'react-hot-toast';

const MeetingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('summary');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [editingSegment, setEditingSegment] = useState(null);

  const { 
    data: meetingRes, 
    isLoading: meetingLoading, 
    error: meetingError 
  } = useGetMeetingQuery(id, {
    pollingInterval: 10000
  });

  const meeting = meetingRes?.data;
  const isCompleted = meeting?.status === 'completed';

  const { data: transcriptRes, isLoading: transcriptLoading } = useGetTranscriptQuery(id, { skip: !isCompleted });
  const { data: segmentsRes, isLoading: segmentsLoading } = useGetTranscriptSegmentsQuery(id, { skip: !isCompleted });
  const { data: summaryRes, isLoading: summaryLoading } = useGetSummaryQuery(id, { skip: !isCompleted });
  
  const [editSegment] = useEditSegmentMutation();

  const segments = segmentsRes?.data?.results || segmentsRes?.data?.segments || (Array.isArray(segmentsRes?.data) ? segmentsRes.data : []);
  const summary = summaryRes?.data;

  const formatSeconds = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSaveSegment = async (data) => {
    try {
      await editSegment({
        meetingId: id,
        segmentId: data.id,
        text: data.text,
        speaker_name: data.speaker_name
      }).unwrap();
      toast.success('Segment updated');
      setEditingSegment(null);
    } catch (err) {
      toast.error('Failed to update segment');
    }
  };

  if (meetingLoading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-40">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
          <p className="text-gray-500 animate-pulse font-bold uppercase tracking-widest text-xs">Loading intelligence...</p>
        </div>
      </AppLayout>
    );
  }

  if (meetingError) {
    return (
      <AppLayout>
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex items-center gap-4 text-red-400">
          <AlertCircle className="w-6 h-6 shrink-0" />
          <p>{meetingError?.data?.message || 'Failed to load meeting details'}</p>
        </div>
      </AppLayout>
    );
  }

  if (!meeting) return null;

  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard/meetings')}
            className="p-2.5 bg-brand-surface border border-brand-border rounded-xl hover:text-white transition-all text-gray-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white mb-1">{meeting.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> 
                {meeting.scheduled_at ? format(new Date(meeting.scheduled_at), 'MMM d, yyyy • h:mm a') : 'N/A'}
              </span>
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {meeting.duration_seconds ? formatSeconds(meeting.duration_seconds) : 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <BotStatusBadge status={meeting.status} />
          <button 
            onClick={() => setIsChatOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600/10 border border-indigo-500/20 rounded-xl text-xs font-bold text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all shadow-lg shadow-indigo-600/20"
          >
            <Sparkles className="w-4 h-4" /> ASK AI
          </button>
          <button className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-brand-surface border border-brand-border rounded-xl text-xs font-bold text-gray-400 hover:text-white transition-all">
            <Share2 className="w-4 h-4" /> SHARE
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-brand-border mb-8">
        <button 
          onClick={() => setActiveTab('summary')}
          className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all relative ${activeTab === 'summary' ? 'text-blue-500' : 'text-gray-500 hover:text-white'}`}
        >
          Intelligence Summary
          {activeTab === 'summary' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 shadow-[0_-2px_8px_rgba(59,130,246,0.5)]"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('transcript')}
          className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all relative ${activeTab === 'transcript' ? 'text-blue-500' : 'text-gray-500 hover:text-white'}`}
        >
          Full Transcript
          {activeTab === 'transcript' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 shadow-[0_-2px_8px_rgba(59,130,246,0.5)]"></div>}
        </button>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        {activeTab === 'summary' ? (
          <div className="bg-brand-surface border border-brand-border rounded-3xl p-8 md:p-10">
            <SummaryPanel summary={summary} isLoading={summaryLoading} meetingId={id} />
          </div>
        ) : (
          <div className="bg-brand-surface border border-brand-border rounded-3xl p-8 md:p-10 max-h-[700px] overflow-y-auto custom-scrollbar">
            {editingSegment && (
              <SegmentEditor 
                segment={editingSegment} 
                onSave={handleSaveSegment} 
                onCancel={() => setEditingSegment(null)} 
              />
            )}
            <TranscriptViewer 
              segments={segments} 
              isLoading={segmentsLoading} 
              onEditSegment={setEditingSegment}
            />
          </div>
        )}
      </div>

      <ChatSidebar 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        meetingId={id} 
        meetingTitle={meeting.title}
      />
    </AppLayout>
  );
};

export default MeetingDetailPage;
