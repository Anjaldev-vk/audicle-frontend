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
      toast.error('Failed to start MFA setup');
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      await verifyMfa({ code }).unwrap();
      toast.success('MFA enabled successfully');
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Verification failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-brand-surface border border-brand-border rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
        <button onClick={onClose} className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors">
          <X size={20} />
        </button>

        {step === 1 && (
          <div className="text-center space-y-8 py-4">
            <div className="w-20 h-20 rounded-3xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mx-auto shadow-xl shadow-blue-600/5">
              <Shield className="w-10 h-10 text-blue-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white mb-3">Secure Your Account</h2>
              <p className="text-gray-500 text-sm leading-relaxed px-4">
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
              <h2 className="text-xl font-bold text-white mb-2">Scan QR Code</h2>
              <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Step 1: Use your authenticator app</p>
            </div>

            <div className="bg-white p-4 rounded-3xl mx-auto w-fit shadow-2xl">
              <img src={qrData?.qr_code_url} alt="MFA QR Code" className="w-48 h-48" />
            </div>

            <div className="text-center">
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-4">Or enter secret key manually</p>
              <code className="px-4 py-2 bg-white/5 rounded-xl text-blue-400 font-mono text-sm border border-white/5">
                {qrData?.secret}
              </code>
            </div>

            <button 
              onClick={() => setStep(3)}
              className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all"
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
                <h2 className="text-xl font-bold text-white">Verify Code</h2>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Enter the 6-digit code from your app</p>
              </div>
            </div>

            <div className="flex justify-center">
              <input
                type="text"
                maxLength="6"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="w-40 text-center text-3xl font-black tracking-[0.3em] bg-transparent border-b-2 border-white/10 focus:border-blue-500 outline-none text-white transition-all pb-2"
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
