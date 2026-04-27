import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  Video, 
  Users, 
  Clock, 
  TrendingUp,
  Plus,
  ChevronRight,
  Activity,
  Mic
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import API from '../../api/axiosInstance';
import { format } from 'date-fns';

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalMeetings: 0,
    totalMinutes: 0,
    teamMembers: 0
  });
  const [recentMeetings, setRecentMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [meetingsRes, orgRes] = await Promise.all([
          API.get('meetings/'),
          user?.organisation ? API.get('accounts/organisation/') : Promise.resolve({ data: { data: null } })
        ]);

        const meetings = meetingsRes.data.data;
        setRecentMeetings(meetings.slice(0, 5));
        
        setStats({
          totalMeetings: meetings.length,
          totalMinutes: meetings.reduce((acc, m) => acc + (m.duration_seconds || 0), 0) / 60,
          teamMembers: orgRes.data.data?.members_count || 1
        });
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-40">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.first_name}</h1>
        <p className="text-gray-500">Here's what's happening with your meeting intelligence today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { label: 'Total Meetings', value: stats.totalMeetings, icon: Video, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Intelligence Minutes', value: Math.round(stats.totalMinutes), icon: Mic, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
          { label: 'Team Members', value: stats.teamMembers, icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-brand-surface border border-brand-border rounded-3xl p-6 flex items-center gap-6">
            <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center`}>
              <stat.icon className={`w-7 h-7 ${stat.color}`} />
            </div>
            <div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{stat.label}</div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Recent Meetings */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              Recent Intelligence
            </h2>
            <Link to="/dashboard/meetings" className="text-xs font-bold text-blue-500 hover:text-blue-400 uppercase tracking-widest">
              View All
            </Link>
          </div>

          <div className="bg-brand-surface border border-brand-border rounded-3xl overflow-hidden">
            {recentMeetings.length > 0 ? (
              <div className="divide-y divide-brand-border">
                {recentMeetings.map((meeting) => (
                  <Link 
                    key={meeting.id}
                    to={`/dashboard/meetings/${meeting.id}`}
                    className="flex items-center gap-4 p-5 hover:bg-white/[0.02] transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-blue-600/10 transition-colors">
                      <Video className="w-5 h-5 text-gray-500 group-hover:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-white truncate">{meeting.title}</div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-tighter">{format(new Date(meeting.created_at), 'MMM d, yyyy')} • {meeting.status}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-white transition-colors" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center">
                <p className="text-gray-500 text-sm">No recent meetings. Start by uploading one!</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            Quick Actions
          </h2>
          <div className="space-y-4">
            <Link 
              to="/dashboard/meetings/create"
              className="flex items-center gap-4 p-5 bg-blue-600 hover:bg-blue-500 rounded-3xl transition-all shadow-lg shadow-blue-600/20 group"
            >
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <div className="text-white">
                <div className="text-sm font-bold">New Meeting</div>
                <div className="text-[10px] text-blue-100 uppercase tracking-widest font-medium">Upload or Invite</div>
              </div>
            </Link>
            
            <div className="bg-brand-surface border border-brand-border rounded-3xl p-6">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Storage Usage</h3>
              <div className="h-2 bg-brand-bg rounded-full overflow-hidden mb-3">
                <div className="h-full bg-indigo-500 w-1/4"></div>
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                <span className="text-indigo-400">2.4 GB Used</span>
                <span className="text-gray-600">10 GB Limit</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;

