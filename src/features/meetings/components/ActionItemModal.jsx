import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, User, Search, Check, Video, Loader2 } from 'lucide-react';
import { useGetMeetingsQuery } from '../api/meetingsApi';

const ActionItemModal = ({ isOpen, onClose, onSubmit, item = null }) => {
  const isEdit = !!item;
  const { data: response, isLoading: meetingsLoading } = useGetMeetingsQuery(undefined, {
    skip: isEdit, // No need to fetch meetings if we're just editing
  });
  const meetings = response?.data?.results || [];

  const [content, setContent] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assigneeName, setAssigneeName] = useState('');
  const [meetingId, setMeetingId] = useState('');
  const [selectedMeetingTitle, setSelectedMeetingTitle] = useState('');
  const [isMeetingDropdownOpen, setIsMeetingDropdownOpen] = useState(false);
  const [meetingSearchQuery, setMeetingSearchQuery] = useState('');
  
  const dropdownRef = useRef(null);

  // Sync state with item when editing
  useEffect(() => {
    if (item) {
      setContent(item.content || item.text || '');
      setDueDate(item.due_date || '');
      setAssigneeName(item.assignee_name || '');
      setMeetingId(item.meeting_id || '');
    } else {
      setContent('');
      setDueDate('');
      setAssigneeName('');
      setMeetingId('');
      setSelectedMeetingTitle('');
      setMeetingSearchQuery('');
    }
  }, [item, isOpen]);

  // Click outside to close meeting dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMeetingDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const filteredMeetings = meetings.filter(m => 
    (m.title || 'Untitled Meeting').toLowerCase().includes(meetingSearchQuery.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    if (!isEdit && !meetingId) return;

    const data = {
      content: content.trim(),
      text: content.trim(),
      due_date: dueDate || null,
      assignee_name: assigneeName.trim() || null,
      assignee: assigneeName.trim() || null,
    };

    if (!isEdit) {
      data.meetingId = meetingId;
    }

    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center md:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 hidden md:block" 
        onClick={onClose} 
      />

      {/* Modal Card */}
      <div className="relative bg-brand-surface md:border border-brand-border rounded-none md:rounded-[2.5rem] p-6 md:p-10 max-w-lg w-full h-full md:h-auto overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-full md:slide-in-from-bottom-0 md:zoom-in duration-300 z-10 flex flex-col">
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 text-text-muted hover:text-text-main transition-colors p-2 hover:bg-brand-highlight rounded-xl"
        >
          <X size={18} />
        </button>

        <div className="mb-8">
          <h2 className="text-2xl font-black text-text-main tracking-tight">
            {isEdit ? 'Edit Action Item' : 'Create Action Item'}
          </h2>
          <p className="text-text-muted text-xs font-bold uppercase tracking-widest mt-1">
            {isEdit ? 'Update details of this task' : 'Add a new manual task to a meeting'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Meeting Selection (Only for Create) */}
          {!isEdit && (
            <div className="space-y-2 relative" ref={dropdownRef}>
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">
                Associated Meeting *
              </label>
              
              <div 
                onClick={() => !meetingsLoading && setIsMeetingDropdownOpen(!isMeetingDropdownOpen)}
                className={`w-full px-5 py-4 bg-brand-highlight border border-brand-border hover:border-brand-border-hover rounded-2xl text-text-main font-bold outline-none transition-all flex items-center justify-between cursor-pointer ${meetingsLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Video size={16} className="text-blue-500 shrink-0" />
                  <span className={selectedMeetingTitle ? 'text-text-main' : 'text-text-muted'}>
                    {meetingsLoading 
                      ? 'Loading meetings...' 
                      : selectedMeetingTitle || 'Select a meeting...'}
                  </span>
                </div>
              </div>

              {isMeetingDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-brand-surface border border-brand-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Search Bar */}
                  <div className="p-3 border-b border-brand-border bg-brand-highlight/50 flex items-center gap-2">
                    <Search size={14} className="text-text-muted shrink-0" />
                    <input
                      type="text"
                      placeholder="Search meetings..."
                      value={meetingSearchQuery}
                      onChange={(e) => setMeetingSearchQuery(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full bg-transparent text-xs font-bold text-text-main placeholder-text-muted outline-none"
                    />
                    {meetingSearchQuery && (
                      <button 
                        type="button" 
                        onClick={(e) => { e.stopPropagation(); setMeetingSearchQuery(''); }}
                        className="text-text-muted hover:text-text-main"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  {/* Meetings List */}
                  <div className="max-h-48 overflow-y-auto custom-scrollbar py-1">
                    {filteredMeetings.length === 0 ? (
                      <div className="p-4 text-center text-xs font-bold text-text-muted">
                        No meetings found
                      </div>
                    ) : (
                      filteredMeetings.map((meeting) => {
                        const isSelected = meetingId === meeting.id;
                        return (
                          <div
                            key={meeting.id}
                            onClick={() => {
                              setMeetingId(meeting.id);
                              setSelectedMeetingTitle(meeting.title || 'Untitled Meeting');
                              setIsMeetingDropdownOpen(false);
                            }}
                            className={`px-4 py-3 text-xs font-bold text-text-main hover:bg-brand-highlight flex items-center justify-between cursor-pointer transition-colors ${isSelected ? 'bg-brand-highlight' : ''}`}
                          >
                            <span className="truncate pr-4">{meeting.title || 'Untitled Meeting'}</span>
                            {isSelected && <Check size={14} className="text-blue-500 shrink-0" />}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Task Description */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">
              Task Description *
            </label>
            <textarea
              required
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-5 py-4 bg-brand-highlight border border-brand-border focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 rounded-2xl text-text-main font-bold outline-none transition-all placeholder-text-muted/60 resize-none text-sm leading-relaxed"
              placeholder="What needs to be done?"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Due Date */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">
                Due Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full pl-12 pr-5 py-4 bg-brand-highlight border border-brand-border focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 rounded-2xl text-text-main font-bold outline-none transition-all"
                />
                <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              </div>
            </div>

            {/* Assignee */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">
                Assignee
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={assigneeName}
                  onChange={(e) => setAssigneeName(e.target.value)}
                  placeholder="Assign to..."
                  className="w-full pl-12 pr-5 py-4 bg-brand-highlight border border-brand-border focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 rounded-2xl text-text-main font-bold outline-none transition-all placeholder-text-muted/60"
                />
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-4 border-t border-brand-border mt-8">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-brand-bg border border-brand-border hover:bg-brand-highlight text-text-muted hover:text-text-main rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!content.trim() || (!isEdit && !meetingId)}
              className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all"
            >
              {isEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActionItemModal;
