import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Menu
} from 'lucide-react';
import ThemeToggle from '../shared/ThemeToggle';
import NotificationCenter from '../../features/notifications/components/NotificationCenter';
import GlobalSearch from '../../features/search/components/GlobalSearch';

const Topbar = ({ onOpenSidebar }) => {
  const { user } = useSelector((state) => state.auth);

  return (
    <header className="h-20 border-b border-brand-border bg-brand-bg/50 backdrop-blur-xl flex items-center justify-between px-8 shrink-0 z-30">
      <div className="flex items-center gap-6">
        <button 
          className="lg:hidden p-3 -ml-2 bg-brand-surface border border-brand-border rounded-xl hover:text-text-main transition-all text-text-muted"
          onClick={onOpenSidebar}
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="hidden md:block">
          <GlobalSearch />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <ThemeToggle />
        <NotificationCenter />
        
        <Link to="/dashboard/settings" className="flex items-center gap-4 pl-6 border-l border-brand-border group">
          <div className="text-right hidden sm:block">
            <div className="text-[11px] font-black text-text-main group-hover:text-brand-primary transition-colors uppercase tracking-widest">{user?.first_name} {user?.last_name}</div>
            <div className="text-[10px] text-text-muted font-bold uppercase tracking-tighter mt-0.5 opacity-60">{user?.job_title || 'Member'}</div>
          </div>
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-xs shadow-xl shadow-blue-600/20 group-hover:scale-105 transition-transform ring-2 ring-brand-border">
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
