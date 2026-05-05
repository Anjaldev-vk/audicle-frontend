import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Video,
  Clock,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay,
  parseISO
} from 'date-fns';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import API from '../../../services/axiosInstance';

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
    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${styles[status] || styles.failed}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await API.get('meetings/');
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

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = "MMMM yyyy";
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Calendar</h1>
          <p className="text-sm text-gray-500">View your meeting schedule and AI-processed recordings.</p>
        </div>
      </div>

      <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden shadow-xl shadow-black/20">
        {/* Calendar Header */}
        <div className="p-6 border-b border-brand-border flex items-center justify-between bg-white/[0.02]">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <CalendarIcon className="w-6 h-6 text-blue-500" />
            {format(currentDate, dateFormat)}
          </h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={prevMonth}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors border border-brand-border text-gray-400 hover:text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 hover:bg-white/10 rounded-xl transition-colors border border-brand-border text-sm font-semibold text-gray-300 hover:text-white"
            >
              Today
            </button>
            <button 
              onClick={nextMonth}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors border border-brand-border text-gray-400 hover:text-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-500 animate-pulse">Loading schedule...</p>
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex items-center gap-4 text-red-400">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <p>{error}</p>
            </div>
          </div>
        ) : (
          <div className="p-6">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-4">
              {weekDays.map(day => (
                <div key={day} className="text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-px bg-brand-border rounded-xl overflow-hidden border border-brand-border">
              {days.map((day, idx) => {
                // Find meetings for this day
                const dayMeetings = meetings.filter(meeting => {
                  const meetingDate = new Date(meeting.scheduled_time || meeting.created_at);
                  return isSameDay(meetingDate, day);
                });

                const isCurrentMonth = isSameMonth(day, monthStart);
                const isToday = isSameDay(day, new Date());

                return (
                  <div 
                    key={day.toString()} 
                    className={`min-h-[120px] p-2 bg-brand-surface transition-colors ${!isCurrentMonth ? 'opacity-40 bg-white/[0.01]' : 'hover:bg-white/[0.02]'} ${isToday ? 'bg-blue-900/10' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-gray-400'}`}>
                        {format(day, 'd')}
                      </span>
                    </div>
                    
                    <div className="space-y-1.5 overflow-y-auto max-h-[80px] custom-scrollbar pr-1">
                      {dayMeetings.map(meeting => (
                        <Link 
                          key={meeting.id}
                          to={`/dashboard/meetings/${meeting.id}`}
                          className="block p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-colors group cursor-pointer"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1 text-[10px] text-gray-400">
                              <Clock className="w-3 h-3" />
                              {format(new Date(meeting.scheduled_time || meeting.created_at), 'HH:mm')}
                            </div>
                            <StatusBadge status={meeting.status} />
                          </div>
                          <div className="text-xs font-medium text-white truncate group-hover:text-blue-400 transition-colors">
                            {meeting.title}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CalendarPage;


