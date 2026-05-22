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
  Building2,
  User
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { useGetMeetingsQuery } from '../features/meetings/api/meetingsApi';
import { useGetOrganisationQuery } from '../features/accounts/api/accountsApi';
import { selectActiveWorkspace } from '../features/workspace/slices/workspaceSlice';
import { format } from 'date-fns';
import Skeleton from '../components/shared/Skeleton';

import BotStatusBadge from '../features/meetings/components/BotStatusBadge';

const DashboardSkeleton = () => {
  return (
    <AppLayout>
      {/* Header Skeleton */}
      <div className="mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-2">
          <Skeleton className="w-64 h-9" />
          <Skeleton className="w-28 h-6 rounded-full" />
        </div>
        <Skeleton className="w-80 h-4 mt-2" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-brand-surface border border-brand-border rounded-2xl md:rounded-[2rem] p-5 md:p-8 flex items-center gap-4 md:gap-6 shadow-sm shadow-black/5">
            <Skeleton className="w-12 h-12 md:w-16 md:h-16 rounded-[1rem] md:rounded-2xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="w-24 h-3" />
              <Skeleton className="w-12 h-8" />
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Recent Intelligence List Skeleton */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <Skeleton className="w-48 h-7" />
            <Skeleton className="w-24 h-4" />
          </div>

          <div className="bg-brand-surface border border-brand-border rounded-2xl md:rounded-[2rem] overflow-hidden shadow-sm divide-y divide-brand-border">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 md:gap-6 p-4 md:p-6">
                <Skeleton className="w-10 h-10 md:w-12 md:h-12 rounded-[0.85rem] md:rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="w-1/3 h-4 md:h-5" />
                  <Skeleton className="w-1/4 h-2 md:h-3" />
                </div>
                <Skeleton className="w-8 h-8 md:w-10 md:h-10 rounded-full shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Skeleton */}
        <div className="space-y-8">
          <Skeleton className="w-36 h-7" />
          <div className="space-y-4">
            {/* Create Meeting Button Skeleton */}
            <div className="bg-brand-surface border border-brand-border p-5 md:p-7 rounded-2xl md:rounded-[2rem] flex items-center gap-4 md:gap-5 shadow-sm relative overflow-hidden">
              <Skeleton className="w-12 h-12 md:w-14 md:h-14 rounded-[1rem] md:rounded-2xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="w-28 h-5" />
                <Skeleton className="w-40 h-3" />
              </div>
            </div>

            {/* Current Plan Skeleton */}
            <div className="bg-brand-surface border border-brand-border rounded-2xl md:rounded-[2rem] p-5 md:p-8 shadow-sm">
              <Skeleton className="w-20 h-3 mb-4 md:mb-6" />
              <div className="flex justify-between items-center bg-brand-bg border border-brand-border p-3 md:p-4 rounded-xl md:rounded-2xl">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-[0.6rem] shrink-0" />
                  <Skeleton className="w-16 h-4" />
                </div>
                <Skeleton className="w-12 h-3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);
  const activeWorkspace = useSelector(selectActiveWorkspace);
  const isOrganisationWorkspace = activeWorkspace?.type === 'organisation';
  const { data: meetingsRes, isLoading: meetingsLoading } = useGetMeetingsQuery(undefined, {
    pollingInterval: 15000 // Poll every 15s to catch AI status changes
  });
  const { data: orgRes, isLoading: orgLoading } = useGetOrganisationQuery(undefined, {
    skip: !isOrganisationWorkspace
  });

  const meetings = meetingsRes?.data?.results || [];
  const recentMeetings = meetings.slice(0, 5);
  const totalMeetings = meetingsRes?.data?.pagination?.total || meetings.length;
  const totalMinutes = meetings.reduce((acc, m) => acc + (parseFloat(m.duration_seconds) || 0), 0) / 60;
  const organisation = orgRes?.data || orgRes;
  const teamMembers = isOrganisationWorkspace ? (organisation?.members_count || 1) : 1;
  const workspacePlan = activeWorkspace?.plan || organisation?.plan || user?.plan || 'Free';

  const loading = meetingsLoading || (isOrganisationWorkspace && orgLoading);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <AppLayout>
      <div className="mb-10 animate-in fade-in duration-700">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-2">
          <h1 className="text-3xl font-bold text-text-main tracking-tight">Welcome back, {user?.first_name}</h1>
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${
            isOrganisationWorkspace
              ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          }`}>
            {isOrganisationWorkspace ? <Building2 size={12} /> : <User size={12} />}
            {activeWorkspace?.name || 'Personal'}
          </div>
        </div>
        <p className="text-text-muted font-medium">Here's what's happening with your meetings today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12 animate-in slide-in-from-bottom-4 duration-700">
        {[
          { label: 'Total Meetings', value: totalMeetings, icon: Video, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Intelligence Minutes', value: Math.round(totalMinutes), icon: Mic, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
          { label: 'Team Members', value: teamMembers, icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-brand-surface border border-brand-border rounded-2xl md:rounded-[2rem] p-5 md:p-8 flex items-center gap-4 md:gap-6 shadow-sm shadow-black/5 hover:border-brand-border-hover transition-colors">
            <div className={`w-12 h-12 md:w-16 md:h-16 rounded-[1rem] md:rounded-2xl ${stat.bg} flex items-center justify-center border border-white/5 shrink-0`}>
              <stat.icon className={`w-6 h-6 md:w-8 md:h-8 ${stat.color}`} />
            </div>
            <div>
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">{stat.label}</div>
              <div className="text-2xl md:text-3xl font-bold text-text-main leading-none">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 animate-in slide-in-from-bottom-8 duration-700">
        {/* Recent Meetings */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-text-main flex items-center gap-3">
              <Activity className="w-5 h-5 text-blue-500" />
              Recent Intelligence
            </h2>
            <Link to="/dashboard/meetings" className="text-[10px] font-bold text-brand-primary hover:opacity-80 uppercase tracking-widest border-b border-brand-primary/20 pb-0.5 transition-all">
              View All History
            </Link>
          </div>

          <div className="bg-brand-surface border border-brand-border rounded-2xl md:rounded-[2rem] overflow-hidden shadow-sm">
            {recentMeetings.length > 0 ? (
              <div className="divide-y divide-brand-border">
                {recentMeetings.map((meeting) => (
                  <Link 
                    key={meeting.id}
                    to={`/dashboard/meetings/${meeting.id}`}
                    className="flex items-center gap-4 md:gap-6 p-4 md:p-6 hover:bg-white/[0.02] transition-colors group"
                  >
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-[0.85rem] md:rounded-xl bg-brand-highlight flex items-center justify-center group-hover:bg-brand-primary/10 transition-colors border border-transparent group-hover:border-brand-primary/20 shrink-0">
                      <Video className="w-5 h-5 md:w-6 md:h-6 text-text-muted group-hover:text-brand-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm md:text-base font-bold text-text-main truncate mb-0.5 group-hover:text-blue-400 transition-colors">{meeting.title}</div>
                      <div className="text-[10px] text-text-muted font-bold uppercase tracking-widest flex items-center gap-2">
                        {meeting.created_at ? format(new Date(meeting.created_at), 'MMM d') : 'N/A'} 
                        <span className="w-1 h-1 rounded-full bg-brand-border"></span>
                        <BotStatusBadge status={meeting.status} />
                      </div>
                    </div>
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-brand-border flex items-center justify-center text-text-muted group-hover:text-text-main group-hover:border-brand-primary/20 transition-all shrink-0">
                      <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-12 md:py-20 text-center">
                <p className="text-gray-500 text-[10px] md:text-sm font-black uppercase tracking-widest">No recent meetings.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-8">
          <h2 className="text-xl font-bold text-text-main flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            Quick Actions
          </h2>
          <div className="space-y-4">
            <Link 
              to="/dashboard/meetings/upload"
              className="flex items-center gap-4 md:gap-5 p-5 md:p-7 bg-blue-600 hover:bg-blue-500 rounded-2xl md:rounded-[2rem] transition-colors shadow-sm group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 bg-white/10 rounded-full -mr-8 -mt-8 blur-3xl group-hover:bg-white/20 transition-all"></div>
              <div className="w-12 h-12 md:w-14 h-14 rounded-[1rem] bg-white/20 flex items-center justify-center relative z-10 shrink-0">
                <Plus className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
              <div className="text-white relative z-10 min-w-0">
                <div className="text-base md:text-lg font-bold truncate">Create Meeting</div>
                <div className="text-[10px] text-blue-100 uppercase tracking-widest font-bold opacity-80 truncate">Upload audio or invite bot</div>
              </div>
            </Link>
            
            <div className="bg-brand-surface border border-brand-border rounded-2xl md:rounded-[2rem] p-5 md:p-8 shadow-sm">
              <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-4 md:mb-6 ml-1">Current Plan</h3>
              <div className="flex justify-between items-center bg-brand-bg border border-brand-border p-3 md:p-4 rounded-xl md:rounded-2xl">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-[0.6rem] bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                    <TrendingUp size={16} />
                  </div>
                  <span className="text-xs md:text-sm font-bold text-text-main uppercase tracking-widest truncate">{workspacePlan}</span>
                </div>
                <Link to="/dashboard/billing" className="text-[10px] font-bold text-text-muted hover:text-text-main transition-colors underline uppercase tracking-tighter shrink-0 ml-2">Manage</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
