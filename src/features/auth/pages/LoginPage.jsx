
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import { login, googleLogin, clearError, selectIsLoading, selectError } from '../slices/authSlice'

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const isLoading = useSelector(selectIsLoading)
  const error = useSelector(selectError)

  // clear errors on mount
  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  const [form, setForm] = useState({ email: '', password: '' })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (error) dispatch(clearError())
  }

  // normal email + password login
  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await dispatch(login(form))
    if (login.fulfilled.match(result)) {
      if (result.payload.mfaRequired) {
        navigate('/mfa/verify')
      } else {
        navigate('/workspaces')
      }
    }
  }

  // google oauth login
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const result = await dispatch(googleLogin(tokenResponse.access_token))
      if (googleLogin.fulfilled.match(result)) {
        if (result.payload.mfaRequired) {
          navigate('/mfa/verify')
        } else {
          navigate('/workspaces')
        }
      }
    },
    onError: () => {
      console.error('Google login failed')
    },
  })

  // extract field errors from backend response
  const getFieldError = (field) => {
    if (!error) return null
    if (typeof error === 'string') return null

    const fieldError = error[field]
    if (Array.isArray(fieldError)) return fieldError[0]
    if (typeof fieldError === 'string') return fieldError
    return null
  }

  const rawError = getFieldError('email') ||
    getFieldError('non_field_errors') ||
    getFieldError('detail') ||
    getFieldError('message') ||
    (typeof error === 'string' ? error : (error?.message || error?.detail || null))

  const generalError = rawError === "A validation error occurred." ? "Invalid email or password." : rawError

  return (
    <div className="font-[Inter,sans-serif] min-h-screen text-text-muted flex flex-col items-center justify-center p-6 md:p-10 bg-brand-bg transition-colors duration-300">
      <div
        className="w-full max-w-4xl p-10 md:p-12 rounded-3xl border border-brand-border shadow-2xl transition-all flex flex-col my-auto bg-brand-surface"
      >
        <div className="flex flex-col md:flex-row gap-12 md:gap-16 items-center md:items-stretch min-h-[400px]">

          {/* Left Column (Brand & Info) */}
          <div className="w-full md:w-5/12 flex flex-col justify-between h-full py-2">
            <div>
              <Link to="/" className="inline-flex items-center gap-3 text-text-main font-bold text-2xl no-underline mb-6">
                <span className="w-3 h-3 rounded-full bg-blue-400" />
                Audicle
              </Link>
              <h2 className="text-3xl md:text-4xl font-bold text-text-main tracking-tight leading-tight mb-4">
                Welcome back
              </h2>
              <p className="text-text-muted text-sm mb-8 leading-relaxed">
                Sign in to continue to your workspace.
              </p>
            </div>

            <div className="mt-8 md:mt-auto">
              <div className="text-[0.65rem] font-bold tracking-widest text-text-muted uppercase mb-4">
                Sign in with Google
              </div>
              <button
                type="button"
                onClick={() => handleGoogleLogin()}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-brand-highlight hover:opacity-80 text-text-main border border-brand-border rounded-xl text-xs font-bold tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                CONTINUE
              </button>
              <p className="text-text-muted text-sm mt-6">
                Don't have an account?{' '}
                <Link to='/register' className="text-blue-500 font-medium hover:text-blue-400 no-underline transition-colors">
                  Sign up
                </Link>
              </p>
            </div>
          </div>

          {/* Right Column (Form) */}
          <div className="w-full md:w-7/12 md:pl-2 flex flex-col justify-center">

            {generalError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 mb-6 text-sm">
                {generalError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 w-full">
              <div>
                <label className="block text-[0.68rem] font-bold tracking-[0.12em] uppercase text-text-muted mb-2 ml-1">
                  Email Address
                </label>
                <input
                  type='email'
                  name='email'
                  value={form.email}
                  onChange={handleChange}
                  placeholder='you@example.com'
                  required
                  className={`w-full px-4 py-3 bg-brand-highlight border ${getFieldError('email') ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50' : 'border-brand-border focus:border-blue-500/50 focus:ring-blue-500/50'} rounded-xl text-text-main placeholder-text-muted/50 focus:ring-1 outline-none transition-all text-sm`}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2 ml-1">
                  <label className="block text-[0.68rem] font-bold tracking-[0.12em] uppercase text-text-muted">
                    Password
                  </label>
                  <Link to="/forgot-password" size="xs" className="text-[0.65rem] font-bold text-blue-500 hover:text-blue-400 uppercase tracking-widest no-underline transition-colors">
                    Forgot?
                  </Link>
                </div>
                <input
                  type='password'
                  name='password'
                  value={form.password}
                  onChange={handleChange}
                  placeholder='••••••••'
                  required
                  className="w-full px-4 py-3 bg-brand-highlight border border-brand-border rounded-xl text-text-main placeholder-text-muted/50 focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all text-sm"
                />
              </div>

              <div className="pt-2">
                <button
                  type='submit'
                  disabled={isLoading}
                  className="w-full px-5 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold tracking-widest transition-colors shadow-xl shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  )
}

