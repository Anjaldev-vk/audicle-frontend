import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  LayoutDashboard,
  Video,
  Settings,
  LogOut,
  Sparkles,
  Search,
  BarChart3,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { logout } from '../../features/auth/slices/authSlice';
import { clearWorkspace } from '../../features/workspace/slices/workspaceSlice';
import { setInMemoryToken } from '../../services/axiosInstance';
import API from '../../services/axiosInstance';
import { useNavigate } from 'react-router-dom';
import WorkspaceSwitcher from './WorkspaceSwitcher';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await API.post('accounts/logout/');
    } finally {
      setInMemoryToken(null);
      dispatch(logout());
      dispatch(clearWorkspace());
      navigate('/login');
    }
  };

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Meetings', icon: Video, path: '/dashboard/meetings' },
    { name: 'Calendar', icon: Calendar, path: '/dashboard/calendar' },
    { name: 'Action Items', icon: CheckCircle2, path: '/dashboard/action-items' },
    { name: 'Universal Search', icon: Search, path: '/dashboard/search' },
    { name: 'AI Intelligence', icon: Sparkles, path: '/dashboard/chat' },
    { name: 'Analytics', icon: BarChart3, path: '/dashboard/analytics' },
    { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className={`
      fixed inset-y-0 left-0 w-60 bg-brand-surface border-r border-brand-border z-50 transition-transform duration-300 lg:translate-x-0 lg:relative lg:h-screen lg:block shrink-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="h-full flex flex-col p-5 pb-12 overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-3 mb-6 px-1 shrink-0">
          <div className="w-9 h-9 rounded-2xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-600/30 ring-1 ring-white/20">
            <Video className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-text-main font-black text-xl tracking-tighter block leading-none">Audicle</span>
            <span className="text-[9px] text-blue-500 font-bold uppercase tracking-[0.2em] mt-1 block">Intelligence</span>
          </div>
        </div>

        {/* Workspace Switcher */}
        <div className="mb-6 shrink-0">
          <WorkspaceSwitcher />
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group relative transform-gpu
                ${isActive(item.path)
                  ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20 shadow-sm'
                  : 'hover:bg-brand-highlight hover:text-text-main border border-transparent'}
              `}
              onClick={onClose}
            >
              <item.icon className={`w-5 h-5 shrink-0 transition-transform duration-300 ${isActive(item.path) ? 'text-brand-primary scale-110' : 'text-text-muted group-hover:text-text-main group-hover:scale-110'}`} />
              <span className="font-bold text-xs tracking-tight">{item.name}</span>
              {isActive(item.path) && (
                <div className="absolute left-0 w-1 h-6 bg-brand-primary rounded-r-full"></div>
              )}
            </Link>
          ))}
        </nav>

        <div className="pt-5 mt-5 border-t border-brand-border shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-2xl transition-all duration-300 hover:bg-red-500/10 hover:text-red-400 text-text-muted group transform-gpu"
          >
            <LogOut className="w-5 h-5 shrink-0 transition-transform group-hover:-translate-x-1" />
            <span className="font-bold text-xs tracking-tight">Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
