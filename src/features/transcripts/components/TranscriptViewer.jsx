import React from 'react';
import { format } from 'date-fns';
import { PencilLine } from 'lucide-react';

const TranscriptViewer = ({ segments, onEditSegment, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-10">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-6 animate-pulse">
            <div className="w-16 h-4 bg-white/5 rounded shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="w-24 h-3 bg-white/5 rounded" />
              <div className="w-full h-4 bg-white/5 rounded" />
              <div className="w-3/4 h-4 bg-white/5 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!segments || segments.length === 0) {
    return (
      <div className="py-20 text-center text-gray-600 italic text-sm font-bold uppercase tracking-[0.2em]">
        No transcript data available
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {segments.map((segment) => (
        <div key={segment.id} className="flex gap-6 group">
          <div className="w-16 shrink-0 text-[10px] font-bold text-gray-600 uppercase tracking-tighter pt-1.5">
            {format(new Date(0, 0, 0, 0, 0, segment.start_seconds || segment.start_time || 0), 'mm:ss')}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                {segment.speaker_name || `Speaker ${segment.speaker_id || 'Unknown'}`}
              </span>
              {segment.is_edited && (
                <span className="flex items-center gap-1 text-[9px] font-bold text-gray-600 uppercase tracking-widest">
                  <PencilLine size={10} /> Edited
                </span>
              )}
              <div className="h-px flex-1 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <button 
                onClick={() => onEditSegment && onEditSegment(segment)}
                className="text-[10px] font-bold text-gray-600 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all uppercase tracking-widest"
              >
                Edit
              </button>
            </div>
            <p 
              className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-200 transition-colors cursor-pointer"
              onClick={() => onEditSegment && onEditSegment(segment)}
            >
              {segment.text || segment.content}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TranscriptViewer;
