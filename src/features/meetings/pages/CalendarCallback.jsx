import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCalendarCallbackMutation } from '../api/calendarApi';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CalendarCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [callback, { isLoading, isSuccess, isError, error }] = useCalendarCallbackMutation();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      toast.error('Calendar connection failed');
      navigate('/dashboard/calendar');
      return;
    }

    if (code) {
      callback({ code, state }).unwrap()
        .then(() => {
          toast.success('Calendar connected successfully!');
          setTimeout(() => navigate('/dashboard/calendar'), 2000);
        })
        .catch((err) => {
          toast.error(err?.data?.message || 'Failed to complete connection');
        });
    }
  }, [searchParams, callback, navigate]);

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-brand-surface border border-brand-border rounded-[40px] p-12 text-center shadow-2xl">
        {isLoading ? (
          <>
            <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-blue-600/20">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Completing Connection</h2>
            <p className="text-gray-500">We're finalizing your Google Calendar sync. This will only take a moment...</p>
          </>
        ) : isSuccess ? (
          <>
            <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-emerald-500/20">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Success!</h2>
            <p className="text-gray-500 mb-8">Your calendar is now connected. Redirecting you back to your dashboard...</p>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
               <div className="h-full bg-emerald-500 animate-[progress_2s_ease-in-out]" style={{ width: '100%' }} />
            </div>
          </>
        ) : isError ? (
          <>
            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-red-500/20">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Connection Failed</h2>
            <p className="text-gray-500 mb-8">{error?.data?.message || 'Something went wrong during the OAuth handshake.'}</p>
            <button 
              onClick={() => navigate('/dashboard/calendar')}
              className="w-full py-4 bg-brand-surface border border-brand-border hover:border-white/20 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all"
            >
              Back to Calendar
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default CalendarCallback;
