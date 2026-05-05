import React, { useState } from 'react';
import { Check, X, User } from 'lucide-react';

const SegmentEditor = ({ segment, onSave, onCancel }) => {
  const [text, setText] = useState(segment.content || segment.text || '');
  const [speakerName, setSpeakerName] = useState(segment.speaker_name || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ 
      id: segment.id, 
      text, 
      speaker_name: speakerName 
    });
  };

  return (
    <div className="bg-blue-600/5 border border-blue-500/30 rounded-2xl p-6 mb-8 animate-in zoom-in-95 duration-300">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center border border-blue-500/20">
            <User className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex-1">
            <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1 ml-1">Speaker Identity</label>
            <input
              type="text"
              value={speakerName}
              onChange={(e) => setSpeakerName(e.target.value)}
              placeholder="Enter speaker name..."
              className="bg-transparent border-none focus:ring-0 text-white placeholder:text-gray-600 w-full outline-none text-sm font-bold"
              autoFocus
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Refine Transcript Segment</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl p-4 text-gray-200 text-sm leading-relaxed focus:border-blue-500/50 outline-none min-h-[120px] transition-all"
            placeholder="Edit transcript text..."
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-lg shadow-blue-600/20 text-xs font-bold uppercase tracking-widest"
          >
            <Check className="w-4 h-4" />
            Apply Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default SegmentEditor;
