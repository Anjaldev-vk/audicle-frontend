import React, { useState } from 'react';
import AppLayout from '../../../components/layout/AppLayout';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Loader2, 
  Settings,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  X,
  BarChart3
} from 'lucide-react';
import { 
  useGetCalendarStatusQuery, 
  useSyncCalendarMutation 
} from '../api/calendarApi';
import { useGetMeetingsQuery } from '../api/meetingsApi';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays
} from 'date-fns';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import Skeleton from '../../../components/shared/Skeleton';

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMeetings, setModalMeetings] = useState([]);
  const [modalDate, setModalDate] = useState(null);
  const navigate = useNavigate();

  const { data: statusRes } = useGetCalendarStatusQuery();
  const { data: meetingsRes, isLoading: meetingsLoading } = useGetMeetingsQuery({
    start_date: format(startOfMonth(currentDate), 'yyyy-MM-dd'),
    end_date: format(endOfMonth(currentDate), 'yyyy-MM-dd')
  });

  const [syncCalendar, { isLoading: isSyncing }] = useSyncCalendarMutation();

  const isConnected = statusRes?.data?.connected;
  const meetings = meetingsRes?.data?.results || [];

  const handleSync = async () => {
    try {
      await syncCalendar().unwrap();
      toast.success('Calendar synchronized');
    } catch (err) {
      console.error(err);
      toast.error('Sync failed');
    }
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const renderHeader = () => (
    <div className="flex items-center justify-between mb-10">
      <div className="flex items-center gap-6">
        <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center border border-blue-500/20 shadow-lg shadow-blue-600/5">
          <CalendarIcon className="w-6 h-6 text-blue-500" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-text-main tracking-tighter leading-tight">{format(currentDate, 'MMMM yyyy')}</h2>
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mt-1">Strategic Timeline Management</p>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1.5 p-1.5 bg-brand-surface border border-brand-border rounded-2xl shadow-inner">
          <button onClick={prevMonth} className="p-2.5 hover:bg-brand-highlight text-text-muted hover:text-text-main rounded-xl transition-all">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-text-main">Today</button>
          <button onClick={nextMonth} className="p-2.5 hover:bg-brand-highlight text-text-muted hover:text-text-main rounded-xl transition-all">
            <ChevronRight size={18} />
          </button>
        </div>

        {isConnected ? (
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-3 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 transition-all disabled:opacity-50"
          >
            {isSyncing ? <Loader2 size={14} className="animate-spin" /> : <LinkIcon size={14} />}
            Sync Intel
          </button>
        ) : (
          <Link to="/dashboard/settings" className="flex items-center gap-3 px-6 py-3 bg-brand-highlight border border-brand-border text-text-main rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all">
            <Settings size={14} /> Link Calendar
          </Link>
        )}
      </div>
    </div>
  );

  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="grid grid-cols-7 mb-4">
        {days.map((day, i) => (
          <div key={i} className="text-center text-[10px] font-black text-text-muted uppercase tracking-[0.3em] py-4">{day}</div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, 'd');
        const cloneDay = day;
        const dayMeetings = meetings.filter(m => {
          const meetingDate = new Date(m.start_time || m.created_at);
          return !isNaN(meetingDate.getTime()) && isSameDay(meetingDate, cloneDay);
        });
        
        days.push(
          <div
            key={day.toString()}
            className={`
              min-h-[110px] p-4 border border-brand-border transition-all relative group cursor-pointer
              ${!isSameMonth(day, monthStart) ? 'bg-brand-bg opacity-30' : 'bg-brand-surface hover:bg-brand-highlight/40'}
              ${isSameDay(day, selectedDate) ? 'ring-2 ring-blue-500 ring-inset z-10' : ''}
              ${isSameDay(day, new Date()) ? 'after:absolute after:top-4 after:right-4 after:w-1.5 after:h-1.5 after:bg-blue-500 after:rounded-full after:shadow-[0_0_8px_rgba(59,130,246,0.8)]' : ''}
            `}
            onClick={() => {
              setSelectedDate(cloneDay);
              if (dayMeetings.length > 0) {
                setModalMeetings(dayMeetings);
                setModalDate(cloneDay);
                setIsModalOpen(true);
              }
            }}
          >
            <div className="flex justify-between items-start">
              <span className={`text-sm font-black tracking-tighter ${isSameDay(day, selectedDate) ? 'text-blue-500' : 'text-text-main'}`}>{formattedDate}</span>
            </div>
            
            {/* Dot Indicators */}
            {dayMeetings.length > 0 && (
              <div className="absolute bottom-3 left-4 flex gap-1 items-center">
                {dayMeetings.slice(0, 3).map((_, dotIdx) => (
                  <div 
                    key={dotIdx} 
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                      dayMeetings.length > 3 && dotIdx === 2 
                        ? 'bg-blue-500/40' 
                        : 'bg-blue-500'
                    }`} 
                  />
                ))}
              </div>
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="rounded-[2.5rem] overflow-hidden border border-brand-border shadow-2xl">{rows}</div>;
  };

  return (
    <AppLayout>
      {renderHeader()}
      
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
        <div className="xl:col-span-3">
           {meetingsLoading ? (
             <div className="space-y-4 animate-pulse">
               {/* Calendar Days Header Skeleton */}
               <div className="grid grid-cols-7 mb-4">
                 {[...Array(7)].map((_, i) => (
                   <div key={i} className="flex justify-center py-4">
                     <Skeleton className="w-10 h-3" />
                   </div>
                 ))}
               </div>
               {/* Calendar Cells Skeleton */}
               <div className="rounded-[2.5rem] overflow-hidden border border-brand-border shadow-2xl">
                 <div className="grid grid-cols-7">
                   {[...Array(35)].map((_, i) => (
                     <div key={i} className="min-h-[110px] p-4 border border-brand-border bg-brand-surface relative">
                       <Skeleton className="w-6 h-5" />
                       {i % 4 === 0 && (
                         <div className="absolute bottom-3 left-4 flex gap-1">
                           <Skeleton className="w-1.5 h-1.5 rounded-full" />
                           <Skeleton className="w-1.5 h-1.5 rounded-full" />
                         </div>
                       )}
                     </div>
                   ))}
                 </div>
               </div>
             </div>
           ) : (
             <>
               {renderDays()}
               {renderCells()}
             </>
           )}
        </div>

        <div className="xl:col-span-1 space-y-8">
           <TimelineInsights meetings={meetings} navigate={navigate} />

           <div className="bg-brand-highlight border border-brand-border rounded-[2.5rem] p-8">
              <h3 className="text-sm font-black text-text-main uppercase tracking-widest mb-4">Sync Status</h3>
              {isConnected ? (
                <div className="flex items-center gap-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                   <CheckCircle2 className="text-emerald-500" size={18} />
                   <div>
                      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active Link</p>
                      <p className="text-[9px] font-bold text-emerald-500/60 uppercase mt-0.5">Google Calendar connected</p>
                   </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                   <AlertCircle className="text-amber-500" size={18} />
                   <div>
                      <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">No Link</p>
                      <p className="text-[9px] font-bold text-amber-500/60 uppercase mt-0.5">Integration required</p>
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>

      <MeetingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        date={modalDate}
        meetings={modalMeetings}
        navigate={navigate}
      />
    </AppLayout>
  );
};

// Reusable beautiful glassmorphic modal for showing meetings of a selected day
const MeetingsModal = ({ isOpen, onClose, date, meetings, navigate }) => {
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !date) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" 
        onClick={onClose} 
      />
      {/* Modal Container */}
      <div className="relative bg-brand-surface/90 border border-brand-border rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl backdrop-blur-md animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center border border-blue-500/20">
              <CalendarIcon className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-text-main tracking-tighter">
                {format(date, 'MMMM d, yyyy')}
              </h2>
              <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mt-0.5">
                Scheduled Node Sessions
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-brand-highlight text-text-muted hover:text-text-main rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Meeting List */}
        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
          {meetings.map((m, idx) => {
            const meetingTime = m.start_time 
              ? format(new Date(m.start_time), 'h:mm a') 
              : format(new Date(m.created_at), 'h:mm a');
            return (
              <div 
                key={idx} 
                className="p-5 bg-brand-highlight/50 border border-brand-border hover:border-blue-500/30 rounded-2xl transition-all group flex items-start justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-600/10 text-blue-500 rounded text-[8px] font-black uppercase tracking-widest border border-blue-500/20">
                      {m.status || 'Completed'}
                    </span>
                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-1">
                      <Clock size={10} /> 
                      {meetingTime}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-text-main group-hover:text-blue-500 transition-colors">
                    {m.title}
                  </h4>
                </div>
                
                <button
                  onClick={() => {
                    const mid = m.id || m.meeting_id;
                    if (mid) {
                      onClose();
                      navigate(`/dashboard/meetings/${mid}`);
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/10 hover:shadow-blue-600/20 transition-all flex items-center gap-1.5 shrink-0 self-center"
                >
                  View Intel
                  <ChevronRight size={10} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Reusable beautiful sidebar widget for monthly timeline insights and analytics
const TimelineInsights = ({ meetings, navigate }) => {
  const total = meetings.length;
  const completed = meetings.filter(m => !m.status || m.status.toLowerCase() === 'completed').length;
  const pending = total - completed;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Circular progress stroke variables
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionRate / 100) * circumference;

  return (
    <div className="bg-brand-surface border border-brand-border rounded-[2.5rem] p-8 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-black text-text-main uppercase tracking-widest">Timeline Insights</h3>
        <span className="px-2 py-0.5 bg-blue-600/10 text-blue-500 rounded text-[8px] font-black uppercase tracking-widest border border-blue-500/20">
          Monthly
        </span>
      </div>

      <div className="flex items-center gap-6 mb-6 p-4 bg-brand-highlight/40 border border-brand-border/60 rounded-2xl">
        {/* Circular Progress Gauge */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg className="w-16 h-16 transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="32"
              cy="32"
              r={radius}
              className="stroke-brand-border"
              strokeWidth="5"
              fill="transparent"
            />
            {/* Foreground circle */}
            <circle
              cx="32"
              cy="32"
              r={radius}
              className="stroke-blue-500 transition-all duration-1000 ease-out"
              strokeWidth="5"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute text-xs font-black text-text-main">
            {completionRate}%
          </span>
        </div>

        <div>
          <h4 className="text-[10px] font-black text-text-main uppercase tracking-wider">Node Health</h4>
          <p className="text-[9px] text-text-muted mt-1 leading-normal">
            {completed} of {total} sessions successfully processed.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-brand-highlight/30 border border-brand-border/40 rounded-2xl text-center">
          <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider mb-1">Total</p>
          <p className="text-2xl font-black text-text-main">{total}</p>
        </div>
        <div className="p-4 bg-brand-highlight/30 border border-brand-border/40 rounded-2xl text-center">
          <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider mb-1">Pending</p>
          <p className="text-2xl font-black text-amber-500">{pending}</p>
        </div>
      </div>

      <button
        onClick={() => navigate('/dashboard/analytics')}
        className="w-full py-3 bg-brand-highlight hover:bg-brand-highlight/85 text-text-main border border-brand-border rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
      >
        <BarChart3 size={12} className="text-blue-500" />
        Analyze Analytics
      </button>
    </div>
  );
};

export default CalendarPage;
