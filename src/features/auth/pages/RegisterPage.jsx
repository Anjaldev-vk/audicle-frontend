import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { register, clearError, selectIsLoading, selectError } from '../slices/authSlice'
import { toast } from 'react-hot-toast'

export default function RegisterPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const isLoading = useSelector(selectIsLoading)
  const error = useSelector(selectError)

  const [form, setForm] = useState({
    email: searchParams.get('email') || '',
    first_name: '',
    last_name: '',
    password: '',
    confirm_password: '',
    account_type: searchParams.get('type') === 'join_org' ? 'join_org' : 'personal',
    org_name: '',
    org_slug: '',
    invite_code: searchParams.get('code') || '',
  })

  // clear errors on mount
  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // basic validation
    if (form.account_type === 'personal' && (!form.first_name || !form.last_name || !form.email || !form.password || !form.confirm_password)) {
      toast.error('Please fill all required fields.')
      return
    }

    if (form.password !== form.confirm_password) {
      toast.error('Passwords do not match.')
      return
    }

    if (form.account_type === 'create_org' && (!form.org_name || !form.org_slug)) {
      toast.error('Please fill organization details.')
      return
    }

    const payload = {
      ...form,
      account_type: form.account_type === 'personal' ? 'individual' : form.account_type
    }

    const result = await dispatch(register(payload))
    if (register.fulfilled.match(result)) {
      toast.success('Account created! Please login.')
      navigate('/login')
    }
  }

  return (
    <div className="font-[Inter,sans-serif] min-h-screen text-text-muted flex flex-col items-center justify-center p-6 md:p-10 bg-brand-bg transition-colors duration-300">
      <div
        className="w-full max-w-5xl p-6 md:p-8 rounded-3xl border border-brand-border shadow-2xl transition-all flex flex-col my-auto bg-brand-surface"
      >
        <div className="flex flex-col md:flex-row gap-12 md:gap-16 items-center md:items-stretch min-h-[500px]">

          {/* Left Column (Brand & Type Selection) */}
          <div className="w-full md:w-5/12 flex flex-col justify-between h-full py-2">
            <div>
              <Link to="/" className="inline-flex items-center gap-3 text-text-main font-bold text-2xl no-underline mb-6">
                <span className="w-3 h-3 rounded-full bg-blue-400" />
                Audicle
              </Link>
              <h2 className="text-3xl md:text-4xl font-bold text-text-main tracking-tight leading-tight mb-4">
                Create Account
              </h2>
              <p className="text-text-muted text-sm mb-4 leading-relaxed">
                Join Audicle to start transforming your meeting intelligence.
              </p>

              <div className="space-y-4 mt-8">
                <div className="text-[0.65rem] font-bold tracking-widest text-text-muted uppercase">
                  Account Type
                </div>
                <div className="flex p-1 bg-brand-highlight border border-brand-border rounded-xl shadow-inner">
                  {['personal', 'create_org'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, account_type: type }))}
                      disabled={form.account_type === 'join_org'}
                      className={`
                        flex-1 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all
                        ${form.account_type === type ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-text-muted hover:text-text-main'}
                        ${form.account_type === 'join_org' ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      {type === 'personal' ? 'Personal' : 'Organization'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-text-muted text-xs font-medium tracking-wide">
                Already have an account?{' '}
                <Link to='/login' className="text-blue-500 font-bold hover:text-blue-400 no-underline transition-colors uppercase">
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          {/* Right Column (Form) */}
          <div className="w-full md:w-7/12 md:pl-2 flex flex-col justify-center">

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 mb-6 text-sm text-center">
                {typeof error === 'string' ? error : (error.message || error.detail || 'Registration failed')}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 w-full">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[0.68rem] font-bold tracking-[0.12em] uppercase text-text-muted mb-2 ml-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    required
                    value={form.first_name}
                    onChange={handleChange}
                    placeholder="John"
                    className="w-full px-4 py-2 bg-brand-highlight border border-brand-border rounded-xl text-text-main placeholder-text-muted/50 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[0.68rem] font-bold tracking-[0.12em] uppercase text-text-muted mb-2 ml-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    required
                    value={form.last_name}
                    onChange={handleChange}
                    placeholder="Doe"
                    className="w-full px-4 py-2 bg-brand-highlight border border-brand-border rounded-xl text-text-main placeholder-text-muted/50 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[0.68rem] font-bold tracking-[0.12em] uppercase text-text-muted mb-2 ml-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  readOnly={form.account_type === 'join_org'}
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`w-full px-4 py-2 bg-brand-highlight border border-brand-border rounded-xl text-text-main placeholder-text-muted/50 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all text-sm ${form.account_type === 'join_org' ? 'opacity-50' : ''}`}
                />
              </div>

              <div>
                <label className="block text-[0.68rem] font-bold tracking-[0.12em] uppercase text-text-muted mb-2 ml-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-brand-highlight border border-brand-border rounded-xl text-text-main placeholder-text-muted/50 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-[0.68rem] font-bold tracking-[0.12em] uppercase text-text-muted mb-2 ml-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirm_password"
                  required
                  value={form.confirm_password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-brand-highlight border border-brand-border rounded-xl text-text-main placeholder-text-muted/50 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all text-sm"
                />
              </div>

              {form.account_type === 'create_org' && (
                <div className="space-y-3 pt-3 border-t border-brand-border mt-3 animate-in slide-in-from-top-4 duration-500">
                  <div>
                    <label className="block text-[0.68rem] font-bold tracking-[0.12em] uppercase text-text-muted mb-2 ml-1">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      name="org_name"
                      required
                      value={form.org_name}
                      onChange={handleChange}
                      placeholder="Acme Corp"
                      className="w-full px-4 py-2 bg-brand-highlight border border-brand-border rounded-xl text-text-main placeholder-text-muted/50 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[0.68rem] font-bold tracking-[0.12em] uppercase text-text-muted mb-2 ml-1">
                      Organization Slug
                    </label>
                    <input
                      type="text"
                      name="org_slug"
                      required
                      value={form.org_slug}
                      onChange={handleChange}
                      placeholder="acme-corp"
                      className="w-full px-4 py-3 bg-brand-highlight border border-brand-border rounded-xl text-text-main placeholder-text-muted/50 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all text-sm"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-5 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold tracking-widest transition-colors shadow-xl shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed uppercase"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  )
}
