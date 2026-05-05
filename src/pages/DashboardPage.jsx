import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  Video, 
  Users, 
  TrendingUp,
  Plus,
  ChevronRight,
  Activity,
  Mic,
  Loader2
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { useGetMeetingsQuery } from '../features/meetings/api/meetingsApi';
import { useGetOrganisationQuery } from '../features/accounts/api/accountsApi';
import { format } from 'date-fns';

import BotStatusBadge from '../features/meetings/components/BotStatusBadge';

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);
  const { data: meetingsRes, isLoading: meetingsLoading } = useGetMeetingsQuery(undefined, {
    pollingInterval: 15000 // Poll every 15s to catch AI status changes
  });
  const { data: orgRes, isLoading: orgLoading } = useGetOrganisationQuery(undefined, {
    skip: !user?.organisation
  });

  const meetings = meetingsRes?.data?.results || [];
  const recentMeetings = meetings.slice(0, 5);
  const totalMeetings = meetingsRes?.data?.pagination?.total || meetings.length;
  const totalMinutes = meetings.reduce((acc, m) => acc + (parseFloat(m.duration_seconds) || 0), 0) / 60;
  const teamMembers = orgRes?.members_count || 1;

  const loading = meetingsLoading || (user?.organisation && orgLoading);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-40">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-10 animate-in fade-in duration-700">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome back, {user?.first_name}</h1>
        <p className="text-gray-500 font-medium">Here's what's happening with your meeting intelligence today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-in slide-in-from-bottom-4 duration-700">
        {[
          { label: 'Total Meetings', value: totalMeetings, icon: Video, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Intelligence Minutes', value: Math.round(totalMinutes), icon: Mic, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
          { label: 'Team Members', value: teamMembers, icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-brand-surface border border-brand-border rounded-3xl p-8 flex items-center gap-6 shadow-xl shadow-black/10 transition-transform hover:-translate-y-1">
            <div className={`w-16 h-16 rounded-2xl ${stat.bg} flex items-center justify-center border border-white/5`}>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
            <div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">{stat.label}</div>
              <div className="text-3xl font-bold text-white">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-in slide-in-from-bottom-8 duration-700">
        {/* Recent Meetings */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <Activity className="w-5 h-5 text-blue-500" />
              Recent Intelligence
            </h2>
            <Link to="/dashboard/meetings" className="text-[10px] font-bold text-blue-500 hover:text-blue-400 uppercase tracking-widest border-b border-blue-500/20 pb-0.5 transition-all">
              View All History
            </Link>
          </div>

          <div className="bg-brand-surface border border-brand-border rounded-3xl overflow-hidden shadow-2xl">
            {recentMeetings.length > 0 ? (
              <div className="divide-y divide-brand-border">
                {recentMeetings.map((meeting) => (
                  <Link 
                    key={meeting.id}
                    to={`/dashboard/meetings/${meeting.id}`}
                    className="flex items-center gap-6 p-6 hover:bg-white/[0.02] transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-blue-600/10 transition-colors border border-transparent group-hover:border-blue-500/20">
                      <Video className="w-6 h-6 text-gray-500 group-hover:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-bold text-white truncate mb-1 group-hover:text-blue-400 transition-colors">{meeting.title}</div>
                      <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-2">
                        {meeting.created_at ? format(new Date(meeting.created_at), 'MMM d, yyyy') : 'N/A'} 
                        <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                        <BotStatusBadge status={meeting.status} />
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full border border-brand-border flex items-center justify-center text-gray-700 group-hover:text-white group-hover:border-white/20 transition-all">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">No recent meetings. Start by uploading one!</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-8">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            Quick Actions
          </h2>
          <div className="space-y-4">
            <Link 
              to="/dashboard/meetings/upload"
              className="flex items-center gap-5 p-6 bg-blue-600 hover:bg-blue-500 rounded-3xl transition-all shadow-2xl shadow-blue-600/20 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 bg-white/10 rounded-full -mr-8 -mt-8 blur-3xl group-hover:bg-white/20 transition-all"></div>
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center relative z-10">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div className="text-white relative z-10">
                <div className="text-base font-bold">New Meeting</div>
                <div className="text-[10px] text-blue-100 uppercase tracking-widest font-bold opacity-80">Upload or Invite</div>
              </div>
            </Link>
            
            <div className="bg-brand-surface border border-brand-border rounded-3xl p-8 shadow-xl">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6 ml-1">Current Plan</h3>
              <div className="flex justify-between items-center bg-brand-bg border border-brand-border p-4 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                    <TrendingUp size={16} />
                  </div>
                  <span className="text-sm font-bold text-white uppercase tracking-widest">{orgRes?.plan || 'Free'}</span>
                </div>
                <Link to="/dashboard/settings" className="text-[10px] font-bold text-gray-500 hover:text-white transition-colors underline uppercase tracking-tighter">Manage</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
