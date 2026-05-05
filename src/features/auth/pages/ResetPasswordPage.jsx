import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import axiosInstance from '../../../services/axiosInstance'
import { toast } from 'react-hot-toast'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const [form, setForm] = useState({
    email: searchParams.get('email') || '',
    otp: '',
    new_password: '',
    confirm_password: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (form.new_password !== form.confirm_password) {
      return toast.error('Passwords do not match')
    }

    setIsLoading(true)
    try {
      await axiosInstance.post('accounts/password-reset/confirm/', {
        email: form.email,
        otp: form.otp,
        new_password: form.new_password
      })
      toast.success('Password reset successful! Please login.')
      navigate('/login')
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.otp?.[0] || 'Reset failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="font-[Inter,sans-serif] min-h-screen text-gray-400 flex flex-col items-center justify-center p-6" style={{ background: '#050505' }}>
      <div 
        className="w-full max-w-md p-10 md:p-12 rounded-3xl border border-white/5 shadow-2xl transition-all"
        style={{ background: '#0a0a0a' }}
      >
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white tracking-tight mb-3">Set new password</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Enter the OTP sent to your email and your new password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
           <div>
            <label className="block text-[0.68rem] font-bold tracking-[0.12em] uppercase text-gray-500 mb-2 ml-1">Email Address</label>
            <input
              type="email"
              required
              readOnly={!!searchParams.get('email')}
              className="w-full px-4 py-3 bg-[#111] border border-white/5 rounded-xl text-white placeholder-gray-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all text-sm"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-[0.68rem] font-bold tracking-[0.12em] uppercase text-gray-500 mb-2 ml-1">OTP (6-digits)</label>
            <input
              type="text"
              maxLength="6"
              required
              placeholder="123456"
              className="w-full px-4 py-3 bg-[#111] border border-white/5 rounded-xl text-white placeholder-gray-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all text-sm font-mono tracking-widest"
              value={form.otp}
              onChange={(e) => setForm({ ...form, otp: e.target.value.replace(/\D/g, '') })}
            />
          </div>

          <div>
            <label className="block text-[0.68rem] font-bold tracking-[0.12em] uppercase text-gray-500 mb-2 ml-1">New Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-[#111] border border-white/5 rounded-xl text-white placeholder-gray-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all text-sm"
              value={form.new_password}
              onChange={(e) => setForm({ ...form, new_password: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-[0.68rem] font-bold tracking-[0.12em] uppercase text-gray-500 mb-2 ml-1">Confirm New Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-[#111] border border-white/5 rounded-xl text-white placeholder-gray-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all text-sm"
              value={form.confirm_password}
              onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-5 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold tracking-widest transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50 mt-4"
          >
            {isLoading ? 'RESETTING...' : 'RESET PASSWORD'}
          </button>

          <div className="text-center mt-6">
            <Link to="/login" className="text-xs text-gray-500 hover:text-white transition-colors font-bold tracking-widest no-underline">
              BACK TO LOGIN
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}


