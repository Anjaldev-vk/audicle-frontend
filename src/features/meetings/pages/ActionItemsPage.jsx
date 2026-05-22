import React, { useState } from 'react';
import AppLayout from '../../../components/layout/AppLayout';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  MoreVertical, 
  Calendar,
  Filter,
  AlertCircle,
  Search,
  Plus,
  Edit2,
  Trash2
} from 'lucide-react';
import { 
  useGetActionItemsQuery, 
  useUpdateActionItemMutation,
  useCreateActionItemMutation,
  useDeleteActionItemMutation
} from '../api/actionItemsApi';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import Skeleton from '../../../components/shared/Skeleton';
import ActionItemModal from '../components/ActionItemModal';
import ConfirmModal from '../../../components/shared/ConfirmModal';

const safeFormatDate = (dateStr) => {
  if (!dateStr) return 'No date';
  try {
    // Parse YYYY-MM-DD strings locally to prevent timezone shifting (e.g., showing the previous day)
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // 0-indexed month
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) {
        return format(d, 'MMM d');
      }
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'No date';
    return format(d, 'MMM d');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'No date';
  }
};

const ActionItemCard = ({ item, onToggle, activeMenuId, onMenuToggle, onEdit, onDelete }) => {
  const isCompleted = item.status === 'completed';
  const hasAssignee = item.assignee_name && item.assignee_name.trim().length > 0;

  return (
    <div className={`bg-brand-surface border ${isCompleted ? 'border-emerald-500/20' : 'border-brand-border'} p-6 rounded-3xl transition-all hover:border-brand-border-hover group relative`}>
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
              {safeFormatDate(item.due_date)}
            </div>
          </div>
          
          <h3 className={`text-base font-medium mb-3 leading-relaxed ${isCompleted ? 'text-text-muted line-through' : 'text-text-main'}`}>
            {item.content || item.text || 'No description'}
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {hasAssignee && (
                <div className="flex items-center gap-2 px-2 py-1 bg-brand-highlight rounded-lg border border-brand-border">
                  <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-[8px] font-bold text-white">
                    {item.assignee_name.trim()[0]}
                  </div>
                  <span className="text-[10px] font-bold text-text-muted">{item.assignee_name}</span>
                </div>
              )}
            </div>
            
            <div className="relative">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onMenuToggle(activeMenuId === item.id ? null : item.id);
                }}
                className="text-text-muted hover:text-text-main transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100 p-1.5 rounded-xl hover:bg-brand-highlight"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              
              {activeMenuId === item.id && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onMenuToggle(null);
                    }} 
                  />
                  <div className="absolute right-0 mt-2 w-32 bg-brand-surface border border-brand-border rounded-2xl shadow-2xl z-20 py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onMenuToggle(null);
                        onEdit(item);
                      }}
                      className="w-full text-left px-4 py-2.5 text-[10px] font-black text-text-main hover:bg-brand-highlight flex items-center gap-2 uppercase tracking-widest transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      Edit
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onMenuToggle(null);
                        onDelete(item);
                      }}
                      className="w-full text-left px-4 py-2.5 text-[10px] font-black text-red-500 hover:bg-red-500/10 flex items-center gap-2 uppercase tracking-widest border-t border-brand-border transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActionItemsPage = () => {
  const [filter, setFilter] = useState('all'); // all, pending, completed
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);

  const { data: items, isLoading, error } = useGetActionItemsQuery(
    filter !== 'all' ? { status: filter } : {}
  );
  
  const [updateActionItem] = useUpdateActionItemMutation();
  const [createActionItem] = useCreateActionItemMutation();
  const [deleteActionItem] = useDeleteActionItemMutation();

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

  const handleCreateOrUpdate = async (data) => {
    try {
      if (activeItem) {
        // Edit flow
        await updateActionItem({ id: activeItem.id, ...data }).unwrap();
        toast.success('Task updated successfully');
      } else {
        // Create flow
        await createActionItem(data).unwrap();
        toast.success('Task created successfully');
      }
      setIsModalOpen(false);
      setActiveItem(null);
    } catch (err) {
      console.error('API Error:', err);
      const errorMessage = err?.data?.message || err?.data?.detail || (err?.data && typeof err.data === 'object' ? JSON.stringify(err.data) : null) || (activeItem ? 'Failed to update task' : 'Failed to create task');
      toast.error(errorMessage);
    }
  };

  const handleDelete = async () => {
    if (!activeItem) return;
    try {
      await deleteActionItem(activeItem.id).unwrap();
      toast.success('Task deleted successfully');
      setIsDeleteOpen(false);
      setActiveItem(null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete task');
    }
  };

  const actionItems = items?.data?.results || items?.data || [];

  // Filter tasks locally by search query
  const filteredActionItems = actionItems.filter(item => {
    const text = (item.content || item.text || '').toLowerCase();
    const assignee = (item.assignee_name || '').toLowerCase();
    const meeting = (item.meeting_title || 'general').toLowerCase();
    const query = searchQuery.toLowerCase();
    return text.includes(query) || assignee.includes(query) || meeting.includes(query);
  });

  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-bold text-text-main mb-3 tracking-tight">Action Items</h1>
          <p className="text-text-muted text-lg font-medium">Track and manage tasks assigned across all your meetings.</p>
        </div>
        
        <button
          onClick={() => {
            setActiveItem(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Add Action Item
        </button>
      </div>

      {/* Controls: Search and Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-brand-surface p-4 rounded-3xl border border-brand-border">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search tasks, assignees, or meetings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-brand-highlight border border-brand-border focus:border-blue-500/50 rounded-2xl text-xs font-bold text-text-main placeholder-text-muted/60 outline-none transition-all"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-brand-highlight rounded-2xl border border-brand-border self-start md:self-auto">
          <button 
            onClick={() => setFilter('all')}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-blue-600 text-white shadow-lg' : 'text-text-muted hover:text-text-main'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('pending')}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'pending' ? 'bg-blue-600 text-white shadow-lg' : 'text-text-muted hover:text-text-main'}`}
          >
            Pending
          </button>
          <button 
            onClick={() => setFilter('completed')}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'completed' ? 'bg-blue-600 text-white shadow-lg' : 'text-text-muted hover:text-text-main'}`}
          >
            Completed
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-brand-surface border border-brand-border p-6 rounded-3xl space-y-4 animate-pulse">
              <div className="flex items-start gap-4">
                <Skeleton className="w-6 h-6 rounded-full shrink-0 mt-1" />
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between items-center">
                    <Skeleton className="w-24 h-3" />
                    <Skeleton className="w-16 h-3" />
                  </div>
                  <Skeleton className="w-full h-5" />
                  <Skeleton className="w-3/4 h-5" />
                  <div className="flex justify-between items-center pt-2">
                    <Skeleton className="w-20 h-5 rounded-lg" />
                    <Skeleton className="w-4 h-4 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          ))}
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
      ) : filteredActionItems.length === 0 ? (
        <div className="bg-brand-surface border border-brand-border rounded-[40px] p-20 text-center border-dashed">
          <div className="w-20 h-20 bg-brand-highlight rounded-3xl flex items-center justify-center mx-auto mb-8 border border-brand-border">
            <Search className="w-10 h-10 text-text-muted" />
          </div>
          <h2 className="text-2xl font-bold text-text-main mb-4">No Results Found</h2>
          <p className="text-text-muted max-w-sm mx-auto mb-10 leading-relaxed">
            We couldn't find any action items matching "{searchQuery}". Try adjusting your search query.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {filteredActionItems.map(item => (
            <ActionItemCard 
              key={item.id} 
              item={item} 
              onToggle={handleToggle}
              activeMenuId={activeMenuId}
              onMenuToggle={setActiveMenuId}
              onEdit={(itm) => {
                setActiveItem(itm);
                setIsModalOpen(true);
              }}
              onDelete={(itm) => {
                setActiveItem(itm);
                setIsDeleteOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Manual Creation / Editing Modal */}
      <ActionItemModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setActiveItem(null);
        }}
        onSubmit={handleCreateOrUpdate}
        item={activeItem}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setActiveItem(null);
        }}
        onConfirm={handleDelete}
        title="Delete Action Item"
        message="Are you sure you want to delete this action item? This action cannot be undone."
        confirmText="Delete"
        type="danger"
      />
    </AppLayout>
  );
};

export default ActionItemsPage;

