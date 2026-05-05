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
  CreditCard
} from 'lucide-react';
import { logout } from '../../features/auth/slices/authSlice';
import { setInMemoryToken } from '../../services/axiosInstance';
import API from '../../services/axiosInstance';
import { useNavigate } from 'react-router-dom';

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
      navigate('/login');
    }
  };

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Meetings', icon: Video, path: '/dashboard/meetings' },
    { name: 'Universal Search', icon: Search, path: '/dashboard/search' },
    { name: 'AI Intelligence', icon: Sparkles, path: '/dashboard/chat' },
    { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className={`
      fixed inset-y-0 left-0 w-72 bg-brand-surface border-r border-brand-border z-50 transition-transform duration-300 lg:translate-x-0 lg:static lg:block
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="h-full flex flex-col p-8">
        <div className="flex items-center gap-4 mb-12 px-2">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-600/30 ring-1 ring-white/20">
            <Video className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-white font-black text-2xl tracking-tighter block leading-none">Audicle</span>
            <span className="text-[10px] text-blue-500 font-bold uppercase tracking-[0.2em] mt-1 block">Intelligence</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`
                flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group relative
                ${isActive(item.path) 
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20 shadow-sm' 
                  : 'hover:bg-white/5 hover:text-white border border-transparent'}
              `}
              onClick={onClose}
            >
              <item.icon className={`w-5 h-5 transition-transform duration-300 ${isActive(item.path) ? 'text-blue-400 scale-110' : 'text-gray-500 group-hover:text-white group-hover:scale-110'}`} />
              <span className="font-bold text-sm tracking-tight">{item.name}</span>
              {isActive(item.path) && (
                <div className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full"></div>
              )}
            </Link>
          ))}
        </nav>

        <div className="pt-8 mt-8 border-t border-brand-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 px-5 py-4 w-full rounded-2xl transition-all duration-300 hover:bg-red-500/10 hover:text-red-400 text-gray-500 group"
          >
            <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            <span className="font-bold text-sm tracking-tight">Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
