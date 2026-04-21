import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { logout } from '../../redux/slices/authSlice';
import { setInMemoryToken } from '../../api/axiosInstance';
import API from '../../api/axiosInstance';

const DashboardPage = () => {
    const { user } = useSelector((state) => state.auth);
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

    return (
        <div className="min-h-screen bg-brand-bg text-gray-400 font-inter">
            {/* Header / Nav */}
            <nav className="border-b border-white/5 bg-brand-bg/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-white font-bold text-lg no-underline">
                        <span className="w-2 h-2 rounded-full bg-blue-400" />
                        Audicle
                    </Link>
                    <div className="flex items-center gap-6">
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-[0.65rem] font-bold tracking-widest text-gray-400 uppercase">System Online</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="text-[0.65rem] font-bold tracking-widest text-gray-500 hover:text-white transition-colors uppercase"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </nav>
            {/* Main Content */}
            <h1 class="text-3xl font-bold text-gray-800">
                 This is dashboard
            </h1>

            
        </div>
    );
};

const ActivityItem = ({ time, title, desc }) => (
    <div className="flex gap-4">
        <div className="shrink-0 w-1 h-1 rounded-full bg-blue-500 mt-2"></div>
        <div>
            <div className="text-[0.6rem] font-bold text-gray-600 uppercase tracking-tighter">{time}</div>
            <div className="text-xs font-bold text-white mt-1">{title}</div>
            <div className="text-[0.7rem] text-gray-500 mt-1">{desc}</div>
        </div>
    </div>
);


export default DashboardPage;
