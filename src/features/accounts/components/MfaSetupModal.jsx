import React, { useState } from 'react';
import { Shield, Smartphone, ArrowRight, Check, Loader2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useEnableMfaMutation, useVerifyMfaSetupMutation } from '../api/accountsApi';

const MfaSetupModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [qrData, setQrData] = useState(null);
  const [code, setCode] = useState('');
  
  const [enableMfa, { isLoading: isEnabling }] = useEnableMfaMutation();
  const [verifyMfa, { isLoading: isVerifying }] = useVerifyMfaSetupMutation();

  if (!isOpen) return null;

  const handleStart = async () => {
    try {
      const res = await enableMfa().unwrap();
      setQrData(res.data);
      setStep(2);
    } catch (err) {
      console.error(err);
      toast.error('Failed to start MFA setup');
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      // Send code as token and totp_code to match DRF expectation
      await verifyMfa({ code, token: code, totp_code: code }).unwrap();
      toast.success('MFA enabled successfully');
      onClose();
    } catch (err) {
      console.error(err);
      const errMsg = err?.data?.message || err?.data?.token?.[0] || err?.data?.totp_code?.[0] || err?.data?.detail || 'Verification failed';
      toast.error(errMsg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center md:p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 hidden md:block" onClick={onClose} />
      <div className="relative bg-brand-surface md:border border-brand-border rounded-none md:rounded-3xl p-6 md:p-10 max-w-lg w-full h-full md:h-auto overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-full md:slide-in-from-bottom-0 md:zoom-in duration-300 flex flex-col justify-center">
        <button onClick={onClose} className="absolute top-8 right-8 text-text-muted hover:text-text-main transition-colors">
          <X size={20} />
        </button>

        {step === 1 && (
          <div className="text-center space-y-8 py-4">
            <div className="w-20 h-20 rounded-3xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mx-auto shadow-xl shadow-blue-600/5">
              <Shield className="w-10 h-10 text-blue-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-text-main mb-3">Secure Your Account</h2>
              <p className="text-text-muted text-sm leading-relaxed px-4">
                Add an extra layer of security with Two-Factor Authentication. Protect your intelligence from unauthorized access.
              </p>
            </div>
            <button 
              onClick={handleStart}
              disabled={isEnabling}
              className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50"
            >
              {isEnabling ? <Loader2 size={16} className="animate-spin" /> : 'Begin Configuration'}
              {!isEnabling && <ArrowRight size={16} />}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-xl font-bold text-text-main mb-2">Scan QR Code</h2>
              <p className="text-xs text-text-muted uppercase tracking-widest font-bold">Step 1: Use your authenticator app</p>
            </div>

            <div className="bg-white p-4 rounded-3xl mx-auto w-fit shadow-2xl">
              <img src={qrData?.qr_code_url} alt="MFA QR Code" className="w-48 h-48" />
            </div>

            <div className="text-center">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4">Or enter secret key manually</p>
              <code className="px-4 py-2 bg-brand-bg rounded-xl text-blue-400 font-mono text-sm border border-brand-border">
                {qrData?.secret}
              </code>
            </div>

            <button 
              onClick={() => setStep(3)}
              className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-brand-highlight border border-brand-border hover:bg-brand-bg text-text-main rounded-2xl font-bold text-xs uppercase tracking-widest transition-all"
            >
              I've scanned the code
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleVerify} className="space-y-8 py-4">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mx-auto">
                <Smartphone className="w-8 h-8 text-blue-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-text-main">Verify Code</h2>
                <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-1">Enter the 6-digit code from your app</p>
              </div>
            </div>

            <div className="flex justify-center">
              <input
                type="text"
                maxLength="6"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="w-40 text-center text-3xl font-black tracking-[0.3em] bg-transparent border-b-2 border-brand-border focus:border-blue-500 outline-none text-text-main transition-all pb-2"
                autoFocus
              />
            </div>

            <button 
              type="submit"
              disabled={code.length !== 6 || isVerifying}
              className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-xl shadow-emerald-600/20 disabled:opacity-50"
            >
              {isVerifying ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              {isVerifying ? 'Verifying...' : 'Complete Setup'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default MfaSetupModal;
