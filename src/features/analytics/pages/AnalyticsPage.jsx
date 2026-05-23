import React, { useState } from 'react';
import AppLayout from '../../../components/layout/AppLayout';
import {
  Users,
  Video,
  Clock,
  CheckCircle,
  MessageSquare,
  LayoutDashboard,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles
} from 'lucide-react';
import {
  useGetAnalyticsOverviewQuery,
  useGetMeetingsChartQuery,
  useGetActivityChartQuery,
  useGetTeamOverviewQuery,
  useGetTeamMembersQuery
} from '../api/analyticsApi';
import { useSelector } from 'react-redux';
import { selectUser } from '../../auth/slices/authSlice';
import Skeleton from '../../../components/shared/Skeleton';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line
} from 'recharts';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

const StatCard = (props) => {
  const { title, value, color, trend, icon: LucideIcon } = props;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-brand-surface border border-brand-border p-8 rounded-[2.5rem] hover:border-white/10 transition-all shadow-xl relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-12 bg-white/5 rounded-full -mr-12 -mt-12 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className={`p-4 rounded-2xl bg-brand-bg border border-brand-border shadow-inner`}>
          <LucideIcon className={`w-6 h-6 ${color}`} />
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${trend >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
          {trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {Math.abs(trend)}%
        </div>
      </div>
      <div className="relative z-10">
        <div className="text-4xl font-black text-text-main mb-1 tracking-tighter">{value}</div>
        <div className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">{title}</div>
      </div>
    </motion.div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-brand-surface border border-brand-border p-4 rounded-2xl shadow-2xl backdrop-blur-xl">
        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-sm font-bold text-text-main">{entry.value} {entry.name}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const AnalyticsSkeleton = () => {
  return (
    <AppLayout>
      {/* Header Skeleton */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-12">
        <div className="space-y-3">
          <Skeleton className="w-64 h-10" />
          <Skeleton className="w-80 h-4" />
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <Skeleton className="w-64 h-12 rounded-2xl" />
          <Skeleton className="w-40 h-12 rounded-2xl" />
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-10">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-brand-surface border border-brand-border p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden space-y-8">
            <div className="flex justify-between items-center">
              <Skeleton className="w-14 h-14 rounded-2xl" />
              <Skeleton className="w-16 h-6 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="w-24 h-10" />
              <Skeleton className="w-36 h-3" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Main Chart Skeleton */}
        <div className="xl:col-span-2 bg-brand-surface border border-brand-border rounded-[2.5rem] p-10 shadow-2xl space-y-8">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="w-40 h-6" />
              <Skeleton className="w-48 h-3" />
            </div>
            <Skeleton className="w-20 h-6 rounded-full" />
          </div>
          <div className="h-[400px] w-full flex items-end gap-2 pt-10">
            {[...Array(12)].map((_, i) => (
              <Skeleton 
                key={i} 
                className="flex-1 rounded-t-lg" 
                style={{ height: `${((i * 17) % 60) + 20}%` }} 
              />
            ))}
          </div>
        </div>

        {/* Quota Distribution Skeleton */}
        <div className="xl:col-span-1 bg-brand-surface border border-brand-border rounded-[2.5rem] p-10 shadow-2xl flex flex-col justify-between">
          <div>
            <Skeleton className="w-40 h-6 mb-2" />
            <Skeleton className="w-48 h-3 mb-10" />
          </div>
          <div className="space-y-8 flex-1 flex flex-col justify-center">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <div className="flex justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-xl" />
                    <Skeleton className="w-20 h-3" />
                  </div>
                  <Skeleton className="w-16 h-4" />
                </div>
                <Skeleton className="w-full h-2 rounded-full" />
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Skeleton className="w-full h-20 rounded-[2rem]" />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

const AnalyticsPage = () => {
  const [period, setPeriod] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');
  const user = useSelector(selectUser);
  const isAdmin = user?.org_role === 'owner' || user?.org_role === 'admin';

  const { data: overviewRes, isLoading: overviewLoading } = useGetAnalyticsOverviewQuery({ period });
  const { data: meetingsRes, isLoading: meetingsLoading } = useGetMeetingsChartQuery({ period });
  const { data: activityRes } = useGetActivityChartQuery({ period });
  const { data: teamRes } = useGetTeamOverviewQuery({ period }, { skip: !isAdmin });
  const { data: teamMembersRes } = useGetTeamMembersQuery({ period }, { skip: !isAdmin });

  const stats = overviewRes?.data || {};
  
  // Robust data extraction with fallbacks for different backend versions
  const rawMeetings = Array.isArray(meetingsRes?.data) 
    ? meetingsRes.data 
    : (meetingsRes?.data?.chart || meetingsRes?.data?.results || []);
    
  const meetingsData = rawMeetings.map(item => ({
    ...item,
    date: item.date || item.day || item.timestamp,
    count: item.count ?? item.sessions ?? item.total ?? 0
  }));

  // Parse and aggregate event types to get a daily activity score
  const activityMap = activityRes?.data?.activity || {};
  const datesSet = new Set();
  Object.values(activityMap).forEach(dayCounts => {
    if (dayCounts && typeof dayCounts === 'object') {
      Object.keys(dayCounts).forEach(d => datesSet.add(d));
    }
  });

  let activityDates = Array.from(datesSet).sort();
  if (activityDates.length === 0) {
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (days - i - 1));
      const dateStr = d.toISOString().split('T')[0];
      activityDates.push(dateStr);
    }
  }

  const activityData = activityDates.map(dateStr => {
    let score = 0;
    Object.keys(activityMap).forEach(eventType => {
      score += activityMap[eventType]?.[dateStr] || 0;
    });
    return {
      date: dateStr,
      activity_score: score
    };
  });
    
  const teamStats = teamRes?.data || {};

  // Map member statistics for the engagement chart
  const memberActivity = (teamMembersRes?.data?.members || []).map(m => ({
    ...m,
    meetings: m.meetings_completed ?? m.meetings ?? 0
  }));


  // Map backend keys to frontend expectations
  const metrics = {
    meetings: stats.meetings_completed ?? stats.total_intelligence_sessions ?? 0,
    completion: stats.action_completion_rate ?? stats.action_item_completion ?? 0,
    duration: stats.avg_duration_minutes ?? stats.average_engagement_depth ?? 0,
    queries: stats.rag_queries ?? stats.ai_neural_queries ?? 0,
    storage: stats.storage_used_gb ?? stats.usage?.storage_used ?? 0
  };


  const tabs = [
    { id: 'overview', name: 'OVERVIEW', icon: LayoutDashboard },
    { id: 'team', name: 'TEAM INTELLIGENCE', icon: Users, adminOnly: true },
  ];

  const chartTheme = {
    grid: "var(--brand-border)",
    text: "var(--text-muted)",
    blue: "#2563eb",
    indigo: "#6366f1",
    emerald: "#10b981",
  };

  if (overviewLoading || meetingsLoading) {
    return <AnalyticsSkeleton />;
  }

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-12 animate-in fade-in slide-in-from-top-4 duration-700"
      >
        <div>
          <h1 className="text-4xl font-black text-text-main mb-3 tracking-tighter">Strategic Analytics</h1>
          <p className="text-text-muted font-bold uppercase tracking-[0.2em] text-[10px]">Real-time performance metrics for your workspace</p>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-1.5 p-1.5 bg-brand-surface border border-brand-border rounded-2xl shadow-inner">
            {tabs.map((tab) => (
              (!tab.adminOnly || isAdmin) && (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-text-muted hover:text-text-main'}`}
                >
                  {tab.name}
                </button>
              )
            ))}
          </div>

          <div className="flex items-center gap-1.5 p-1.5 bg-brand-surface border border-brand-border rounded-2xl shadow-inner">
            {['7d', '30d', '90d'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${period === p ? 'bg-brand-highlight text-text-main border border-brand-border shadow-sm' : 'text-text-muted hover:text-text-main'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' ? (
          <motion.div
            key="overview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-10"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
              <StatCard
                title="Intelligence Sessions"
                value={metrics.meetings}
                trend={12}
                icon={Video}
                color="text-blue-500"
              />
              <StatCard
                title="Action Completion"
                value={`${Math.round(metrics.completion)}%`}
                trend={5.4}
                icon={CheckCircle}
                color="text-emerald-500"
              />
              <StatCard
                title="Engagement Depth"
                value={`${metrics.duration}m`}
                trend={-2.1}
                icon={Clock}
                color="text-indigo-500"
              />
              <StatCard
                title="AI Queries"
                value={metrics.queries}
                trend={24}
                icon={MessageSquare}
                color="text-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
              {/* Meeting Volume Chart */}
              <div className="xl:col-span-2 bg-brand-surface border border-brand-border rounded-[2.5rem] p-10 shadow-2xl">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h3 className="text-xl font-black text-text-main tracking-tight">Meeting Velocity</h3>
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Volume distribution over period</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/10 rounded-full">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Sessions</span>
                    </div>
                  </div>
                </div>

                <div className="h-[400px] w-full min-h-[400px] relative">
                  {meetingsData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={meetingsData}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={chartTheme.blue} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={chartTheme.blue} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                        <XAxis
                          dataKey="date"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: chartTheme.text, fontSize: 10, fontWeight: 700 }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: chartTheme.text, fontSize: 10, fontWeight: 700 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="count"
                          name="Meetings"
                          stroke={chartTheme.blue}
                          strokeWidth={4}
                          fillOpacity={1}
                          fill="url(#colorValue)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-brand-bg/20 rounded-3xl border border-dashed border-brand-border">
                      <Video className="w-10 h-10 text-text-muted/20 mb-4" />
                      <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">No session data for this period</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Resource Distribution */}
              <div className="xl:col-span-1 bg-brand-surface border border-brand-border rounded-[2.5rem] p-10 shadow-2xl flex flex-col">
                <h3 className="text-xl font-black text-text-main tracking-tight mb-2">Usage Allocation</h3>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-10">Monthly quota utilization</p>

                <div className="flex-1 flex flex-col justify-center gap-12">
                  {[
                    { label: 'Meetings', current: metrics.meetings, max: user?.plan === 'pro' ? 100 : 10, icon: Video, color: 'bg-blue-600' },

                    { label: 'Cloud Storage', current: metrics.storage, max: user?.plan === 'pro' ? 50 : 5, icon: Layers, color: 'bg-emerald-500', unit: 'GB' },
                    { label: 'AI Tokens', current: metrics.queries, max: 1000, icon: Sparkles, color: 'bg-indigo-500' }
                  ].map((item, i) => (
                    <div key={i} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-brand-bg border border-brand-border">
                            <item.icon size={14} className="text-text-muted" />
                          </div>
                          <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{item.label}</span>
                        </div>
                        <span className="text-xs font-black text-text-main">{item.current}{item.unit || ''} <span className="opacity-30">/ {item.max}{item.unit || ''}</span></span>
                      </div>
                      <div className="h-2 bg-brand-bg rounded-full overflow-hidden border border-brand-border p-0.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((item.current / item.max) * 100, 100)}%` }}
                          transition={{ duration: 1.5, ease: "circOut" }}
                          className={`h-full rounded-full ${item.color} shadow-lg shadow-${item.color.split('-')[1]}-600/20`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-12 p-8 bg-brand-highlight border border-brand-border rounded-[2rem]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Status</p>
                      <p className="text-lg font-black text-text-main uppercase tracking-tight">{user?.plan || 'Free'} Edition</p>
                    </div>
                    <div className="px-4 py-2 bg-emerald-500 text-white rounded-full text-[9px] font-black tracking-widest uppercase">Operational</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="team"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-10"
          >
            {/* Team Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StatCard
                title="Active Collaborators"
                value={Object.keys(teamStats.members_activity || {}).length || teamStats.total_members || 0}
                trend={2.4}
                icon={Users}
                color="text-indigo-500"
              />
              <StatCard
                title="Team Velocity"
                value={teamStats.meetings_completed || 0}
                trend={15.8}
                icon={Video}
                color="text-blue-500"
              />
              <StatCard
                title="Action Efficiency"
                value={`${teamStats.action_completion_rate || 0}%`}
                trend={8.1}
                icon={CheckCircle}
                color="text-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
              {/* Member Performance */}
              <div className="bg-brand-surface border border-brand-border rounded-[2.5rem] p-10 shadow-2xl">
                <h3 className="text-xl font-black text-text-main tracking-tight mb-10">Individual Engagement</h3>
                <div className="h-[400px] w-full min-h-[400px] relative">
                  {(memberActivity && memberActivity.length > 0) ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={memberActivity} layout="vertical" margin={{ left: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} horizontal={true} vertical={false} />
                        <XAxis type="number" hide />
                        <YAxis
                          dataKey="name"
                          type="category"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: chartTheme.text, fontSize: 10, fontWeight: 700 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                          dataKey="meetings"
                          name="Meetings"
                          fill={chartTheme.indigo}
                          radius={[0, 8, 8, 0]}
                          barSize={24}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-brand-bg/20 rounded-3xl border border-dashed border-brand-border">
                      <Users className="w-10 h-10 text-text-muted/20 mb-4" />
                      <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">No member activity detected</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Collaboration Activity */}
              <div className="bg-brand-surface border border-brand-border rounded-[2.5rem] p-10 shadow-2xl">
                <h3 className="text-xl font-black text-text-main tracking-tight mb-10">Collective Intelligence Pulse</h3>
                <div className="h-[400px] w-full min-h-[400px] relative">
                  {activityData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={activityData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                        <XAxis
                          dataKey="date"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: chartTheme.text, fontSize: 10, fontWeight: 700 }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: chartTheme.text, fontSize: 10, fontWeight: 700 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                          type="monotone"
                          dataKey="activity_score"
                          name="Activity Score"
                          stroke={chartTheme.emerald}
                          strokeWidth={4}
                          dot={{ fill: chartTheme.emerald, strokeWidth: 2, r: 4, stroke: '#000' }}
                          activeDot={{ r: 8, strokeWidth: 0 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-brand-bg/20 rounded-3xl border border-dashed border-brand-border">
                      <Sparkles className="w-10 h-10 text-text-muted/20 mb-4" />
                      <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Collective intelligence pulse offline</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
};

export default AnalyticsPage;
