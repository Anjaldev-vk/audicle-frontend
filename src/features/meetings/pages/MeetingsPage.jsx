import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Video, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import AppLayout from '../../../components/layout/AppLayout';
import { useGetMeetingsQuery } from '../api/meetingsApi';
import MeetingCard from '../components/MeetingCard';
import EmptyState from '../../../components/shared/EmptyState';
import { ListSkeleton } from '../../../components/shared/Skeleton';

const MeetingsPage = () => {
  const { data: response, isLoading, error } = useGetMeetingsQuery(undefined, {
    pollingInterval: 15000
  });
  const meetings = response?.data?.results || [];

  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-text-main tracking-tight mb-1">Meetings</h1>
          <p className="text-sm text-text-muted">Review your AI-powered meeting intelligence and transcripts.</p>
        </div>
        <Link 
          to="/dashboard/meetings/upload" 
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm w-full md:w-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          New Meeting
        </Link>
      </div>

      {isLoading ? (
        <ListSkeleton count={6} />
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-8 flex items-center gap-4 text-red-400 max-w-2xl mx-auto">
          <AlertCircle className="w-6 h-6 shrink-0" />
          <div>
            <h4 className="font-bold mb-1">Sync Error</h4>
            <p className="text-sm opacity-80">{error?.data?.message || 'Failed to connect to meeting service'}</p>
          </div>
        </div>
      ) : meetings.length === 0 ? (
        <EmptyState 
          icon={Video}
          title="No Meetings Found"
          description="You haven't recorded or uploaded any meetings yet. Connect your calendar or upload a file to get started."
          action={
            <Link 
              to="/dashboard/meetings/upload" 
              className="px-8 py-3 bg-brand-surface hover:bg-brand-bg text-text-main rounded-xl font-bold text-xs uppercase tracking-widest transition-all border border-brand-border"
            >
              CREATE YOUR FIRST MEETING
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {meetings.map((meeting) => (
            <MeetingCard key={meeting.id} meeting={meeting} />
          ))}
        </div>
      )}
    </AppLayout>
  );
};

export default MeetingsPage;
