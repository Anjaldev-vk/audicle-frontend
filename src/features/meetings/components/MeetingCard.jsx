import React from 'react';
import { Link } from 'react-router-dom';
import { Video, Clock, Calendar, Users, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import BotStatusBadge from './BotStatusBadge';

const MeetingCard = ({ meeting }) => {
  return (
    <Link 
      to={`/dashboard/meetings/${meeting.id}`}
      className="group flex flex-col bg-brand-surface border border-brand-border rounded-xl p-5 transition-all duration-200 hover:border-brand-border-hover hover:bg-brand-highlight/30"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 rounded-lg bg-brand-bg flex items-center justify-center border border-brand-border group-hover:border-blue-500/30 group-hover:text-blue-500 transition-colors">
          <Video className="w-5 h-5 text-text-muted group-hover:text-blue-500 transition-colors" />
        </div>
        <BotStatusBadge status={meeting.status} />
      </div>

      <div className="mb-6 flex-1">
        <h3 className="text-base font-semibold text-text-main mb-2 group-hover:text-blue-500 transition-colors line-clamp-2">
          {meeting.title}
        </h3>
        <div className="flex flex-wrap gap-y-2 gap-x-4 text-xs text-text-muted">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 opacity-70" />
            {meeting.created_at && !isNaN(new Date(meeting.created_at).getTime()) 
              ? format(new Date(meeting.created_at), 'MMM d, yyyy') 
              : 'N/A'}
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 opacity-70" />
            {Math.floor((meeting.duration_seconds || 0) / 60)} min
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 opacity-70" />
            {meeting.participants_count || 0}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-brand-border mt-auto">
        <div className="flex -space-x-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-6 h-6 rounded-full border-2 border-brand-surface bg-brand-bg" />
          ))}
          {meeting.participants_count > 3 && (
            <div className="w-6 h-6 rounded-full border-2 border-brand-surface bg-brand-highlight flex items-center justify-center text-[9px] font-medium text-text-muted">
              +{meeting.participants_count - 3}
            </div>
          )}
        </div>
        <div className="text-xs font-medium text-text-muted group-hover:text-text-main flex items-center gap-1 transition-colors">
          View Detail <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  );
};

export default MeetingCard;
