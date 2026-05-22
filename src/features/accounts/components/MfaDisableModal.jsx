import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { checkSession } from '../../auth/slices/authSlice';
import { ShieldAlert, X, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useDisableMfaMutation } from '../api/accountsApi';

const MfaDisableModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [code, setCode] = useState('');
  const [disableMfa, { isLoading }] = useDisableMfaMutation();

  if (!isOpen) return null;

  const handleDisable = async (e) => {
    e.preventDefault();
    if (code.length !== 6) return;

    try {
      await disableMfa({ totp_code: code }).unwrap();
      toast.success('MFA disabled successfully');
      await dispatch(checkSession());
      setCode('');
      onClose();
    } catch (err) {
      console.error('Disable MFA Error:', err);
      let errMsg = 'Failed to disable MFA';
      if (err?.data) {
        if (typeof err.data === 'string') {
          errMsg = err.data;
        } else if (err.data.errors?.totp_code) {
          errMsg = `Code: ${err.data.errors.totp_code[0]}`;
        } else if (err.data.totp_code) {
          errMsg = `Code: ${err.data.totp_code[0]}`;
        } else if (err.data.message) {
          errMsg = err.data.message;
        } else {
          errMsg = JSON.stringify(err.data);
        }
      }
      toast.error(errMsg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center md:p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 hidden md:block" onClick={onClose} />
      <div className="relative bg-brand-surface md:border border-brand-border rounded-none md:rounded-3xl p-6 md:p-10 max-w-md w-full h-full md:h-auto overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-full md:slide-in-from-bottom-0 md:zoom-in duration-300 flex flex-col justify-center">
        <button onClick={onClose} className="absolute top-8 right-8 text-text-muted hover:text-text-main transition-colors">
          <X size={20} />
        </button>

        <form onSubmit={handleDisable} className="space-y-8 py-4">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-red-600/10 border border-red-500/20 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-main">Disable MFA</h2>
              <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-1">Enter your 6-digit authenticator code</p>
            </div>
          </div>

          <div className="flex justify-center">
            <input
              type="text"
              maxLength="6"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="w-40 text-center text-3xl font-black tracking-[0.3em] bg-transparent border-b-2 border-brand-border focus:border-red-500 outline-none text-text-main transition-all pb-2"
              autoFocus
            />
          </div>

          <p className="text-sm text-text-muted text-center">
            Are you sure you want to disable Multi-Factor Authentication? Your account will be less secure.
          </p>

          <button 
            type="submit"
            disabled={code.length !== 6 || isLoading}
            className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-xl shadow-red-600/20 disabled:opacity-50"
          >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            {isLoading ? 'Disabling...' : 'Confirm Disable'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MfaDisableModal;
