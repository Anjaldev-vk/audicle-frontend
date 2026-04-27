import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Video, 
  Clock, 
  Calendar,
  ChevronRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import API from '../../../api/axiosInstance';
import { format } from 'date-fns';

const StatusBadge = ({ status }) => {
  const styles = {
    scheduled: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    bot_joining: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    recording: 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse',
    processing: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    completed: 'bg-green-500/10 text-green-400 border-green-500/20',
    failed: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[status] || styles.failed}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

const MeetingsPage = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await API.get('meetings/');
        // Backend returns standard response format: { success: true, data: [], message: "" }
        setMeetings(response.data.data);
      } catch (err) {
        setError('Failed to load meetings');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Meetings</h1>
          <p className="text-sm text-gray-500">Manage and review your AI-powered meeting intelligence.</p>
        </div>
        <Link 
          to="/dashboard/meetings/create" 
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" />
          New Meeting
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
          <p className="text-gray-500 animate-pulse">Fetching your meetings...</p>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex items-center gap-4 text-red-400">
          <AlertCircle className="w-6 h-6 shrink-0" />
          <p>{error}</p>
        </div>
      ) : meetings.length === 0 ? (
        <div className="bg-brand-surface border border-brand-border rounded-3xl p-12 text-center">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Video className="w-8 h-8 text-gray-600" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No meetings found</h2>
          <p className="text-gray-500 max-w-sm mx-auto mb-8">
            Start by creating a new meeting or uploading a recording to get AI-powered transcripts and summaries.
          </p>
          <Link 
            to="/dashboard/meetings/create" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-semibold text-sm transition-all border border-brand-border"
          >
            <Plus className="w-4 h-4" />
            Create your first meeting
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {meetings.map((meeting) => (
            <Link 
              key={meeting.id}
              to={`/dashboard/meetings/${meeting.id}`}
              className="group bg-brand-surface border border-brand-border hover:border-blue-500/30 rounded-2xl p-5 flex items-center gap-6 transition-all hover:bg-white/[0.02]"
            >
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-blue-600/10 transition-colors">
                <Video className="w-6 h-6 text-gray-400 group-hover:text-blue-400 transition-colors" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-base font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                    {meeting.title}
                  </h3>
                  <StatusBadge status={meeting.status} />
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {format(new Date(meeting.created_at), 'MMM d, yyyy')}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {meeting.duration_seconds ? `${Math.floor(meeting.duration_seconds / 60)}m` : '--:--'}
                  </div>
                  <div className="hidden sm:block px-2 py-0.5 bg-white/5 rounded border border-brand-border uppercase tracking-tighter font-bold text-[10px]">
                    {meeting.platform}
                  </div>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-2 px-4">
                {/* Participant Avatars placeholder */}
                <div className="flex -space-x-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="w-7 h-7 rounded-full bg-brand-card border-2 border-brand-surface flex items-center justify-center text-[10px] font-bold text-gray-500">
                      U{i}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-white transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default MeetingsPage;
