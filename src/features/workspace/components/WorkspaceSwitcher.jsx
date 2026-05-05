import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Building2, User, ChevronDown } from 'lucide-react';
import { setActiveWorkspaceId } from '../slices/workspaceSlice';

const WorkspaceSwitcher = () => {
  const { workspaces, activeWorkspaceId } = useSelector((state) => state.workspace);
  const activeWorkspace = workspaces.find(ws => ws.id === activeWorkspaceId);
  const dispatch = useDispatch();

  return (
    <div className="relative group">
      <button className="flex items-center gap-3 px-4 py-2 bg-brand-surface border border-brand-border rounded-xl hover:border-blue-500/50 transition-all">
        <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-400">
          {activeWorkspace?.organisation ? <Building2 size={18} /> : <User size={18} />}
        </div>
        <div className="text-left hidden sm:block">
          <div className="text-[10px] font-bold text-white uppercase tracking-widest truncate w-24">
            {activeWorkspace?.name || 'Personal'}
          </div>
          <div className="text-[8px] text-gray-500 font-bold uppercase tracking-tighter">
            {activeWorkspace?.organisation ? 'Organisation' : 'Personal'}
          </div>
        </div>
        <ChevronDown size={14} className="text-gray-600" />
      </button>

      {/* Simple dropdown placeholder */}
      <div className="absolute top-full left-0 mt-2 w-64 bg-brand-surface border border-brand-border rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] p-2">
        {workspaces.map(ws => (
          <button
            key={ws.id}
            onClick={() => dispatch(setActiveWorkspaceId(ws.id))}
            className={`w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all ${ws.id === activeWorkspaceId ? 'bg-blue-600/10 border border-blue-600/20' : ''}`}
          >
            <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400">
              {ws.organisation ? <Building2 size={16} /> : <User size={16} />}
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-white truncate">{ws.name}</div>
              <div className="text-[10px] text-gray-500 font-medium uppercase">{ws.organisation ? 'Org' : 'Personal'}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default WorkspaceSwitcher;
