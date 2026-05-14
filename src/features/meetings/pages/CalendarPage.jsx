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
  AlertCircle
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

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
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
              min-h-[140px] p-4 border border-brand-border transition-all relative group
              ${!isSameMonth(day, monthStart) ? 'bg-brand-bg opacity-30' : 'bg-brand-surface'}
              ${isSameDay(day, selectedDate) ? 'ring-2 ring-blue-500 ring-inset z-10' : ''}
              ${isSameDay(day, new Date()) ? 'after:absolute after:top-4 after:right-4 after:w-1.5 after:h-1.5 after:bg-blue-500 after:rounded-full after:shadow-[0_0_8px_rgba(59,130,246,0.8)]' : ''}
            `}
            onClick={() => setSelectedDate(cloneDay)}
          >
            <div className="flex justify-between items-start">
              <span className={`text-sm font-black tracking-tighter ${isSameDay(day, selectedDate) ? 'text-blue-500' : 'text-text-main'}`}>{formattedDate}</span>
              {dayMeetings.length > 0 && (
                <span className="text-[9px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-full shadow-lg shadow-blue-600/20">
                  {dayMeetings.length}
                </span>
              )}
            </div>
            <div className="mt-3 space-y-1.5">
              {dayMeetings.slice(0, 3).map((m, idx) => (
                <div 
                  key={idx} 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    const mid = m.id || m.meeting_id;
                    if (mid) navigate(`/dashboard/meetings/${mid}`); 
                  }}
                  className="px-2.5 py-1.5 bg-blue-600/10 border border-blue-500/20 rounded-lg text-[9px] font-bold text-blue-400 truncate cursor-pointer hover:bg-blue-600/20 transition-all flex items-center gap-1.5"
                >
                  <div className="w-1 h-1 rounded-full bg-blue-500" />
                  {m.title}
                </div>
              ))}
              {dayMeetings.length > 3 && (
                <div className="text-[8px] font-black text-text-muted uppercase tracking-widest pl-2">
                  + {dayMeetings.length - 3} More Sessions
                </div>
              )}
            </div>
            
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
             <div className="flex flex-col items-center justify-center py-40 bg-brand-surface border border-brand-border rounded-[2.5rem]">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-6" />
                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] animate-pulse">Scanning timeline indices...</p>
             </div>
           ) : (
             <>
               {renderDays()}
               {renderCells()}
             </>
           )}
        </div>

        <div className="xl:col-span-1 space-y-8">
           <div className="bg-brand-surface border border-brand-border rounded-[2.5rem] p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black text-text-main uppercase tracking-widest">Day Intelligence</h3>
                {(() => {
                  const selectedDayMeetings = meetings.filter(m => {
                    const d = new Date(m.start_time || m.created_at);
                    return !isNaN(d.getTime()) && isSameDay(d, selectedDate);
                  });
                  return (
                    <>
                      {selectedDayMeetings.length > 0 && (
                        <span className="px-2 py-1 bg-blue-600 text-white text-[9px] font-black rounded-lg shadow-lg shadow-blue-600/20">
                           {selectedDayMeetings.length} Sessions
                        </span>
                      )}
                    </>
                  );
                })()}
              </div>
              <div className="space-y-6">
                 {(() => {
                   const selectedDayMeetings = meetings.filter(m => {
                     const d = new Date(m.start_time || m.created_at);
                     return !isNaN(d.getTime()) && isSameDay(d, selectedDate);
                   });
                   
                   return selectedDayMeetings.length > 0 ? (
                     selectedDayMeetings.map((m, idx) => (
                       <div key={idx} className="p-5 bg-brand-highlight border border-brand-border rounded-2xl hover:border-blue-500/30 transition-all group">
                          <div className="flex items-center justify-between mb-3">
                             <span className="px-2 py-0.5 bg-blue-600/10 text-blue-500 rounded text-[8px] font-black uppercase tracking-widest border border-blue-500/20">
                                {m.status || 'Completed'}
                             </span>
                             <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-1">
                                <Clock size={10} /> 
                                {m.start_time ? format(new Date(m.start_time), 'h:mm a') : format(new Date(m.created_at), 'h:mm a')}
                             </span>
                          </div>
                          <h4 className="text-sm font-black text-text-main group-hover:text-blue-500 transition-colors mb-4">{m.title}</h4>
                          <Link to={`/dashboard/meetings/${m.id || m.meeting_id}`} className="text-[9px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                             View Analysis <ChevronRight size={10} />
                          </Link>
                       </div>
                     ))
                   ) : (
                     <div className="text-center py-12 px-6">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mx-auto mb-4 opacity-20">
                           <Video size={20} />
                        </div>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest leading-loose">No active sessions scheduled for this node.</p>
                     </div>
                   );
                 })()}
              </div>
           </div>

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
    </AppLayout>
  );
};

export default CalendarPage;
