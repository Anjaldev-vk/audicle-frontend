import { useState } from 'react'
import { useDispatch } from 'react-redux'
import axiosInstance from '../../../services/axiosInstance'
import { logout } from '../slices/authSlice'
import { toast } from 'react-hot-toast'

export default function ChangePasswordModal({ isOpen, onClose }) {
  const [form, setForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const dispatch = useDispatch()

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.new_password !== form.confirm_password) {
      return toast.error('Passwords do not match')
    }

    setIsLoading(true)
    try {
      await axiosInstance.post('accounts/change-password/', form)
      toast.success('Password changed successfully. Please log in again.')
      dispatch(logout())
      onClose()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 md:p-10 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white">Change Password</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[0.68rem] font-bold tracking-[0.12em] uppercase text-gray-500 mb-2 ml-1">Current Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 bg-[#111] border border-white/5 rounded-xl text-white placeholder-gray-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all text-sm"
              value={form.old_password}
              onChange={(e) => setForm({ ...form, old_password: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-[0.68rem] font-bold tracking-[0.12em] uppercase text-gray-500 mb-2 ml-1">New Password</label>
            <input
              type="password"
              required
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
              className="w-full px-4 py-3 bg-[#111] border border-white/5 rounded-xl text-white placeholder-gray-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all text-sm"
              value={form.confirm_password}
              onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-5 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold tracking-widest transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50"
            >
              {isLoading ? 'CHANGING...' : 'UPDATE PASSWORD'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
