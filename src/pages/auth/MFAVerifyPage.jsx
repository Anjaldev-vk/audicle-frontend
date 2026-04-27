import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Navigate } from 'react-router-dom'
import { verifyMFA, selectIsLoading, selectError, selectMfaRequired, selectMfaToken, resetMFA } from '../../redux/slices/authSlice'

export default function MFAVerifyPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  const isLoading    = useSelector(selectIsLoading)
  const error        = useSelector(selectError)
  const mfaRequired  = useSelector(selectMfaRequired)
  const mfaToken     = useSelector(selectMfaToken)

  const [code, setCode] = useState('')

  // if user refreshes or accesses this page directly without mfaRequired
  if (!mfaRequired || !mfaToken) {
    return <Navigate to="/login" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (code.length !== 6) return

    const result = await dispatch(verifyMFA({ mfaToken, totpCode: code }))
    if (verifyMFA.fulfilled.match(result)) {
      navigate('/dashboard')
    }
  }

  return (
    <div className="font-[Inter,sans-serif] min-h-screen text-gray-400 flex flex-col items-center justify-center p-6 md:p-10" style={{ background: '#050505' }}>
      <div 
        className="w-full max-w-md p-10 md:p-12 rounded-3xl border border-white/5 shadow-2xl transition-all flex flex-col"
        style={{ background: '#0a0a0a' }}
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-3">Two-Step Verification</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Enter the 6-digit code from your authenticator app to secure your account.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 mb-6 text-sm text-center">
            {typeof error === 'string' ? error : (error.message || error.detail || error.totp_code || error.mfa_token || 'Verification failed')}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="flex justify-center gap-2">
                <input
                  type="text"
                  maxLength="6"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center text-3xl tracking-[0.5em] font-mono px-4 py-4 bg-[#111] border border-white/5 rounded-2xl text-white placeholder-gray-800 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all"
                  autoFocus
                />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || code.length !== 6}
            className="w-full px-5 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold tracking-widest transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'VERIFYING...' : 'VERIFY & CONTINUE'}
          </button>

          <button
            type="button"
            onClick={() => {
              dispatch(resetMFA())
              navigate('/login')
            }}
            className="w-full text-gray-500 text-xs font-bold tracking-widest hover:text-white transition-colors"
          >
            BACK TO LOGIN
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-white/5 text-center px-4">
          <p className="text-xs text-gray-600 leading-relaxed">
            Lost access to your device? <button className="text-blue-500 hover:underline">Use a recovery code</button>
          </p>
        </div>
      </div>
    </div>
  )
}
