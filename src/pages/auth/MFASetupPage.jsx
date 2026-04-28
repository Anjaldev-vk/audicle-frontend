import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import axiosInstance from '../../api/axiosInstance'
import { selectUser, checkSession } from '../../redux/slices/authSlice'
import { toast } from 'react-hot-toast'

export default function MFASetupPage() {
  const user = useSelector(selectUser)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [step, setStep] = useState(user?.mfa_enabled ? 'manage' : 1) // 1: Info, 2: Scan, 3: Verify, 'manage': Disable flow
  const [totpUri, setTotpUri] = useState('')
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const initiateSetup = async () => {
    setIsLoading(true)
    try {
      const response = await axiosInstance.post('accounts/mfa/enable/')
      setTotpUri(response.data.data.totp_uri)
      setStep(2)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to initiate MFA setup')
    } finally {
      setIsLoading(false)
    }
  }

  const verifySetup = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await axiosInstance.post('accounts/mfa/verify-setup/', { totp_code: code })
      toast.success('MFA enabled successfully!')
      dispatch(checkSession())
      navigate('/dashboard/settings')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid code')
    } finally {
      setIsLoading(false)
    }
  }

  const disableMFA = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await axiosInstance.post('accounts/mfa/disable/', { totp_code: code })
      toast.success('MFA disabled successfully!')
      dispatch(checkSession())
      navigate('/dashboard/settings')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid code')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="font-[Inter,sans-serif] min-h-screen text-gray-400 flex flex-col items-center justify-center p-6" style={{ background: '#050505' }}>
      <div 
        className="w-full max-w-lg p-10 md:p-12 rounded-3xl border border-white/5 shadow-2xl transition-all"
        style={{ background: '#0a0a0a' }}
      >
        {step === 'manage' && (
          <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/20">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Manage MFA</h2>
            <p className="text-gray-500 text-sm mb-10 leading-relaxed">
              Two-factor authentication is currently enabled on your account. To disable it, please enter the code from your authenticator app.
            </p>
            
            <form onSubmit={disableMFA} className="space-y-6">
              <input
                type="text"
                maxLength="6"
                placeholder="000 000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center text-3xl tracking-[0.5em] font-mono px-4 py-4 bg-[#111] border border-white/5 rounded-2xl text-white placeholder-gray-800 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 outline-none transition-all"
                autoFocus
                required
              />

              <button
                type="submit"
                disabled={isLoading || code.length !== 6}
                className="w-full px-5 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-xs font-bold tracking-widest transition-all shadow-xl shadow-red-600/20 disabled:opacity-50"
              >
                {isLoading ? 'DISABLING...' : 'DISABLE MFA'}
              </button>

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full text-gray-600 text-xs font-bold tracking-widest hover:text-white transition-colors"
              >
                GO BACK
              </button>
            </form>
          </div>
        )}

        {step === 1 && (
          <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Secure your account</h2>
            <p className="text-gray-500 text-sm mb-10 leading-relaxed">
              Two-factor authentication adds an extra layer of security to your account by requiring more than just a password to log in.
            </p>
            <button
              onClick={initiateSetup}
              disabled={isLoading}
              className="w-full px-5 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold tracking-widest transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50"
            >
              {isLoading ? 'STARTING...' : 'ENABLE MFA'}
            </button>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 text-gray-600 text-xs font-bold tracking-widest hover:text-white transition-colors"
            >
              LATER
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="text-center animate-in fade-in zoom-in-95 duration-500">
            <h2 className="text-2xl font-bold text-white mb-2">Scan QR Code</h2>
            <p className="text-gray-500 text-sm mb-8">Scan this code with your authenticator app (e.g., Google Authenticator, Authy).</p>
            
            <div className="bg-white p-4 rounded-2xl inline-block mb-8 border-8 border-white/5">
              <QRCodeSVG value={totpUri} size={200} level="H" />
            </div>

            <div className="text-left bg-white/5 border border-white/5 rounded-2xl p-4 mb-8">
              <p className="text-[0.65rem] font-bold text-gray-500 uppercase tracking-widest mb-1">Secret Key (Manual Entry)</p>
              <code className="text-xs text-blue-400 break-all">{totpUri.split('secret=')[1]?.split('&')[0] || '---'}</code>
            </div>

            <button
              onClick={() => setStep(3)}
              className="w-full px-5 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold tracking-widest transition-all shadow-xl shadow-blue-600/20"
            >
              I'VE SCANNED IT
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="text-center animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-2xl font-bold text-white mb-2">Verify Setup</h2>
            <p className="text-gray-500 text-sm mb-8">Enter the 6-digit code currently shown in your app.</p>
            
            <form onSubmit={verifySetup} className="space-y-6">
              <input
                type="text"
                maxLength="6"
                placeholder="000 000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center text-3xl tracking-[0.5em] font-mono px-4 py-4 bg-[#111] border border-white/5 rounded-2xl text-white placeholder-gray-800 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all"
                autoFocus
                required
              />

              <button
                type="submit"
                disabled={isLoading || code.length !== 6}
                className="w-full px-5 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold tracking-widest transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50"
              >
                {isLoading ? 'VERIFYING...' : 'COMPLETE SETUP'}
              </button>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full text-gray-600 text-xs font-bold tracking-widest hover:text-white transition-colors"
              >
                BACK TO QR CODE
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
