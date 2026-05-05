import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../../services/axiosInstance';
import { toast } from 'react-hot-toast';
import { Mail, ShieldCheck, Lock } from 'lucide-react';

const ForgotPasswordPage = () => {
    // 'request' = asking for OTP, 'confirm' = entering OTP and new password
    const [view, setView] = useState('request'); 
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const navigate = useNavigate();

    // STEP 1: Request the OTP
    const handleRequestOTP = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await API.post('accounts/password-reset/request/', { email });
            toast.success("If an account exists, an OTP has been sent!");
            setView('confirm');
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // STEP 2: Verify OTP and Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await API.post('accounts/password-reset/confirm/', {
                email,
                otp,
                new_password: newPassword
            });
            toast.success("Password reset successful! Please login.");
            navigate('/login');
        } catch (err) {
            const errorMsg = err.response?.data?.error || "Invalid or expired OTP.";
            toast.error(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-6">
            <div className="max-w-md w-full bg-brand-surface p-8 rounded-xl border border-brand-border shadow-2xl">
                
                <div className="text-center mb-10">
                    <Link to="/" className="flex items-center justify-center gap-2 text-white font-bold text-lg no-underline mb-6">
                        <span className="w-2 h-2 rounded-full bg-blue-400" />
                        Audicle
                    </Link>
                </div>

                {view === 'request' ? (
                    <form onSubmit={handleRequestOTP} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center">
                            <h2 className="text-3xl font-semibold text-white tracking-tight">Forgot Password?</h2>
                            <p className="text-gray-500 mt-2 text-sm">Enter your email and we'll send you a 6-digit code.</p>
                        </div>

                        <div className="relative">
                            <label className="block text-[0.68rem] font-bold tracking-[0.12em] uppercase text-gray-500 mb-2 ml-1">Email address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                                <input
                                    type="email"
                                    placeholder="name@company.com"
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-[#111] border border-white/5 rounded-lg text-white placeholder-gray-600 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold tracking-widest transition-all shadow-lg shadow-blue-600/10 disabled:opacity-50"
                        >
                            {isSubmitting ? "SENDING..." : "SEND RESET CODE"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="text-center">
                            <h2 className="text-2xl font-semibold text-white tracking-tight">Verify OTP</h2>
                            <p className="text-gray-500 mt-2 text-sm">Sent to <span className="text-blue-400 font-medium">{email}</span></p>
                        </div>

                        <div className="space-y-4">
                            <div className="relative">
                                <label className="block text-[0.68rem] font-bold tracking-[0.12em] uppercase text-gray-500 mb-2 ml-1">6-Digit Code</label>
                                <div className="relative">
                                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                                    <input
                                        type="text"
                                        placeholder="000000"
                                        required
                                        className="w-full pl-12 pr-4 py-3 bg-[#111] border border-white/5 rounded-lg text-white placeholder-gray-600 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="relative">
                                <label className="block text-[0.68rem] font-bold tracking-[0.12em] uppercase text-gray-500 mb-2 ml-1">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        required
                                        className="w-full pl-12 pr-4 py-3 bg-[#111] border border-white/5 rounded-lg text-white placeholder-gray-600 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold tracking-widest transition-all shadow-lg shadow-blue-600/10 disabled:opacity-50"
                        >
                            {isSubmitting ? "RESETTING..." : "RESET PASSWORD"}
                        </button>
                        
                        <button 
                            type="button" 
                            onClick={() => setView('request')}
                            className="w-full text-xs font-bold tracking-widest text-gray-600 hover:text-blue-500 transition-colors uppercase"
                        >
                            Didn't get a code? Try again.
                        </button>
                    </form>
                )}

                <div className="mt-10 text-center">
                    <Link to="/login" className="text-xs font-bold tracking-widest text-blue-500 hover:text-blue-400 no-underline uppercase">
                        Back to Login
                    </Link>
                </div>
            </div>

            <div className="mt-8 text-[0.65rem] text-gray-600 tracking-widest uppercase flex gap-4">
                <span>© 2024 Audicle Inc.</span>
                <a href="#" className="hover:text-gray-400 transition-colors">Privacy</a>
                <a href="#" className="hover:text-gray-400 transition-colors">Terms</a>
            </div>
        </div>
    );
};


export default ForgotPasswordPage;  

