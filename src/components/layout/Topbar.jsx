import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Menu, 
  Search
} from 'lucide-react';
import NotificationCenter from '../../features/notifications/components/NotificationCenter';

const Topbar = ({ onOpenSidebar }) => {
  const { user } = useSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/dashboard/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="h-20 border-b border-brand-border bg-brand-bg/50 backdrop-blur-xl flex items-center justify-between px-8 shrink-0 z-30">
      <div className="flex items-center gap-6">
        <button 
          className="lg:hidden p-3 -ml-2 bg-brand-surface border border-brand-border rounded-xl hover:text-white transition-all text-gray-500"
          onClick={onOpenSidebar}
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="hidden md:flex items-center bg-brand-surface border border-brand-border rounded-2xl px-4 py-2 w-72 lg:w-[400px] focus-within:border-blue-500/50 transition-all shadow-inner">
          <Search className="w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search meeting intelligence..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            className="bg-transparent border-none focus:ring-0 text-sm w-full px-3 text-white placeholder:text-gray-600 outline-none"
          />
          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-white/5 border border-white/10 rounded-md">
            <span className="text-[9px] font-bold text-gray-600">⌘</span>
            <span className="text-[9px] font-bold text-gray-600">K</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <NotificationCenter />
        
        <Link to="/dashboard/settings" className="flex items-center gap-4 pl-6 border-l border-brand-border group">
          <div className="text-right hidden sm:block">
            <div className="text-[11px] font-black text-white group-hover:text-blue-400 transition-colors uppercase tracking-widest">{user?.first_name} {user?.last_name}</div>
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter mt-0.5 opacity-60">{user?.job_title || 'Member'}</div>
          </div>
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-xs shadow-xl shadow-blue-600/20 group-hover:scale-105 transition-transform ring-2 ring-white/5">
              {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-brand-bg"></div>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Topbar;
