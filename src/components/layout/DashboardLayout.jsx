import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  LayoutDashboard, 
  Video, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Search,
  Plus
} from 'lucide-react';
import { logout } from '../../redux/slices/authSlice';
import { setInMemoryToken } from '../../api/axiosInstance';
import API from '../../api/axiosInstance';

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
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
    { name: 'Organisation', icon: Users, path: '/dashboard/organisation' },
    { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-brand-bg text-gray-400 font-inter flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-brand-surface border-r border-brand-border z-50 transition-transform duration-300 lg:translate-x-0 lg:static lg:block
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Video className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Audicle</span>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                  ${isActive(item.path) 
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20 shadow-sm shadow-blue-600/5' 
                    : 'hover:bg-white/5 hover:text-white border border-transparent'}
                `}
                onClick={() => setIsSidebarOpen(false)}
              >
                <item.icon className={`w-5 h-5 transition-colors ${isActive(item.path) ? 'text-blue-400' : 'text-gray-500 group-hover:text-white'}`} />
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            ))}
          </nav>

          <div className="pt-6 border-t border-brand-border">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all duration-200 hover:bg-red-500/10 hover:text-red-400 text-gray-500 group"
            >
              <LogOut className="w-5 h-5 group-hover:text-red-400" />
              <span className="font-medium text-sm">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-brand-border bg-brand-bg/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 -ml-2 hover:bg-white/5 rounded-lg transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden md:flex items-center bg-brand-surface border border-brand-border rounded-xl px-3 py-1.5 w-64 lg:w-96 focus-within:border-blue-500/50 transition-all">
              <Search className="w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search meetings..." 
                className="bg-transparent border-none focus:ring-0 text-sm w-full px-2 text-white placeholder:text-gray-600"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-white/5 rounded-xl transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-brand-bg"></span>
            </button>
            
            <Link to="/dashboard/settings" className="flex items-center gap-3 pl-4 border-l border-brand-border group">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-widest">{user?.first_name} {user?.last_name}</div>
                <div className="text-[10px] text-gray-500 font-medium">{user?.job_title || 'Member'}</div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
                {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
