import React, { useState } from 'react';
import AppLayout from '../../../components/layout/AppLayout';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  MoreVertical, 
  Calendar,
  Filter,
  Loader2,
  AlertCircle,
  Search
} from 'lucide-react';
import { useGetActionItemsQuery, useUpdateActionItemMutation } from '../api/actionItemsApi';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

const ActionItemCard = ({ item, onToggle }) => {
  const isCompleted = item.status === 'completed';

  return (
    <div className={`bg-brand-surface border ${isCompleted ? 'border-emerald-500/20' : 'border-brand-border'} p-6 rounded-3xl transition-all hover:border-brand-border-hover group`}>
      <div className="flex items-start gap-4">
        <button 
          onClick={() => onToggle(item)}
          className={`mt-1 shrink-0 transition-colors ${isCompleted ? 'text-emerald-500' : 'text-text-muted hover:text-text-main'}`}
        >
          {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest truncate max-w-[200px]">
              {item.meeting_title || 'General'}
            </span>
            <div className="flex items-center gap-1 text-[10px] text-text-muted font-bold uppercase tracking-widest">
              <Calendar className="w-3 h-3" />
              {item.due_date ? format(new Date(item.due_date), 'MMM d') : 'No date'}
            </div>
          </div>
          
          <h3 className={`text-base font-medium mb-3 leading-relaxed ${isCompleted ? 'text-text-muted line-through' : 'text-text-main'}`}>
            {item.content}
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {item.assignee_name && (
                <div className="flex items-center gap-2 px-2 py-1 bg-brand-highlight rounded-lg border border-brand-border">
                  <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-[8px] font-bold text-white">
                    {item.assignee_name[0]}
                  </div>
                  <span className="text-[10px] font-bold text-text-muted">{item.assignee_name}</span>
                </div>
              )}
            </div>
            
            <button className="text-text-muted hover:text-text-main transition-colors opacity-0 group-hover:opacity-100">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActionItemsPage = () => {
  const [filter, setFilter] = useState('all'); // all, pending, completed
  const { data: items, isLoading, error } = useGetActionItemsQuery(
    filter !== 'all' ? { status: filter } : {}
  );
  const [updateActionItem] = useUpdateActionItemMutation();

  const handleToggle = async (item) => {
    const newStatus = item.status === 'completed' ? 'pending' : 'completed';
    try {
      await updateActionItem({ id: item.id, status: newStatus }).unwrap();
      toast.success(`Marked as ${newStatus}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  };

  const actionItems = items?.data?.results || items?.data || [];

  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-text-main mb-3 tracking-tight">Action Items</h1>
          <p className="text-text-muted text-lg font-medium">Track and manage tasks assigned across all your meetings.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-brand-surface p-1.5 rounded-2xl border border-brand-border">
          <button 
            onClick={() => setFilter('all')}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-blue-600 text-white shadow-xl' : 'text-text-muted hover:text-text-main'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('pending')}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${filter === 'pending' ? 'bg-blue-600 text-white shadow-xl' : 'text-text-muted hover:text-text-main'}`}
          >
            Pending
          </button>
          <button 
            onClick={() => setFilter('completed')}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${filter === 'completed' ? 'bg-blue-600 text-white shadow-xl' : 'text-text-muted hover:text-text-main'}`}
          >
            Completed
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-6" />
          <p className="text-text-muted font-bold uppercase tracking-widest text-xs animate-pulse">Fetching action items...</p>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-12 text-center max-w-2xl mx-auto">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-text-main mb-2">Sync Error</h3>
          <p className="text-text-muted mb-8">{error?.data?.message || 'Failed to load action items from workspace'}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-red-500 hover:bg-red-400 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
          >
            Retry Connection
          </button>
        </div>
      ) : actionItems.length === 0 ? (
        <div className="bg-brand-surface border border-brand-border rounded-[40px] p-20 text-center border-dashed">
          <div className="w-20 h-20 bg-brand-highlight rounded-3xl flex items-center justify-center mx-auto mb-8 border border-brand-border">
            <CheckCircle2 className="w-10 h-10 text-text-muted" />
          </div>
          <h2 className="text-2xl font-bold text-text-main mb-4">Inbox Zero!</h2>
          <p className="text-text-muted max-w-sm mx-auto mb-10 leading-relaxed">
            No action items found for this filter. Try changing the filter or record a new meeting to generate tasks.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {actionItems.map(item => (
            <ActionItemCard 
              key={item.id} 
              item={item} 
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}
    </AppLayout>
  );
};

export default ActionItemsPage;
