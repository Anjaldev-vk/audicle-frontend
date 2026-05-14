import React from 'react';
import { Link } from 'react-router-dom';
import { Video, Clock, Calendar, Users, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import BotStatusBadge from './BotStatusBadge';

const MeetingCard = ({ meeting }) => {
  return (
    <Link 
      to={`/dashboard/meetings/${meeting.id}`}
      className="group relative bg-brand-surface border border-brand-border rounded-3xl p-6 transition-all duration-300 hover:border-blue-500/30 hover:bg-white/[0.02] hover:shadow-2xl hover:shadow-blue-600/5 block"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="w-12 h-12 rounded-2xl bg-brand-bg/5 flex items-center justify-center group-hover:bg-blue-600/10 transition-all border border-transparent group-hover:border-blue-500/20">
          <Video className="w-6 h-6 text-text-muted group-hover:text-blue-400 transition-colors" />
        </div>
        <BotStatusBadge status={meeting.status} />
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-bold text-text-main mb-2 group-hover:text-blue-400 transition-colors truncate">
          {meeting.title}
        </h3>
        <div className="flex flex-wrap gap-4 text-xs text-text-muted font-medium">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {meeting.created_at && !isNaN(new Date(meeting.created_at).getTime()) 
              ? format(new Date(meeting.created_at), 'MMM d, yyyy') 
              : 'N/A'}
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {Math.floor((meeting.duration_seconds || 0) / 60)} min
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            {meeting.participants_count || 0}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-brand-border">
        <div className="flex -space-x-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-6 h-6 rounded-full border-2 border-brand-surface bg-brand-bg" />
          ))}
          <div className="w-6 h-6 rounded-full border-2 border-brand-surface bg-blue-600/20 flex items-center justify-center text-[8px] font-bold text-blue-400">
            +{meeting.participants_count > 3 ? meeting.participants_count - 3 : 0}
          </div>
        </div>
        <div className="text-[10px] font-bold text-text-muted group-hover:text-text-main uppercase tracking-widest flex items-center gap-1 transition-all">
          View Detail <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
};

export default MeetingCard;
