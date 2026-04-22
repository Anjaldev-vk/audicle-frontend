import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectUser, checkSession } from '../../../redux/slices/authSlice'
import axiosInstance from '../../../api/axiosInstance'
import { toast } from 'react-hot-toast'

export default function ProfileSettingsPage() {
  const user = useSelector(selectUser)
  const dispatch = useDispatch()
  
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    job_title: '',
    timezone: 'UTC',
    email_notifications: true,
    meeting_reminders: true
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone_number: user.phone_number || '',
        job_title: user.job_title || '',
        timezone: user.timezone || 'UTC',
        email_notifications: user.email_notifications ?? true,
        meeting_reminders: user.meeting_reminders ?? true
      })
    }
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await axiosInstance.patch('accounts/me/', form)
      toast.success('Profile updated successfully')
      dispatch(checkSession()) // Refresh user info in Redux
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 animate-in fade-in duration-700">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
        <p className="text-gray-500">Manage your personal information and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: Avatar / Quick Info */}
        <div className="lg:col-span-1">
          <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 text-center sticky top-10">
            <div className="relative inline-block mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-3xl font-bold text-white uppercase shadow-2xl">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#111] border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
              </button>
            </div>
            <h3 className="text-white font-bold text-lg mb-1">{user?.full_name}</h3>
            <p className="text-gray-500 text-sm mb-6">{user?.email}</p>
            
            <div className="flex flex-col gap-2">
              <div className="px-4 py-2 bg-white/5 rounded-xl text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest border border-white/5">
                {user?.account_type || 'Individual'}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 md:p-10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[0.68rem] font-bold tracking-[0.12em] uppercase text-gray-500 mb-2 ml-1">First Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-[#111] border border-white/5 rounded-xl text-white placeholder-gray-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all text-sm"
                    value={form.first_name}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[0.68rem] font-bold tracking-[0.12em] uppercase text-gray-500 mb-2 ml-1">Last Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-[#111] border border-white/5 rounded-xl text-white placeholder-gray-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all text-sm"
                    value={form.last_name}
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[0.68rem] font-bold tracking-[0.12em] uppercase text-gray-500 mb-2 ml-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  className="w-full px-4 py-3 bg-[#111] border border-white/5 rounded-xl text-gray-600 cursor-not-allowed text-sm"
                  value={user?.email || ''}
                />
                <p className="text-[0.65rem] text-gray-600 mt-2 ml-1">Email cannot be changed after registration.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[0.68rem] font-bold tracking-[0.12em] uppercase text-gray-500 mb-2 ml-1">Phone Number</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 bg-[#111] border border-white/5 rounded-xl text-white placeholder-gray-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all text-sm"
                    value={form.phone_number}
                    placeholder="+1 234 567 890"
                    onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[0.68rem] font-bold tracking-[0.12em] uppercase text-gray-500 mb-2 ml-1">Job Title</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-[#111] border border-white/5 rounded-xl text-white placeholder-gray-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all text-sm"
                    value={form.job_title}
                    placeholder="Engineering Manager"
                    onChange={(e) => setForm({ ...form, job_title: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[0.68rem] font-bold tracking-[0.12em] uppercase text-gray-500 mb-2 ml-1">Timezone</label>
                <select
                  className="w-full px-4 py-3 bg-[#111] border border-white/5 rounded-xl text-white focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all text-sm appearance-none"
                  value={form.timezone}
                  onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                >
                  <option value="UTC">UTC (Universal Time)</option>
                  <option value="PST">PST (Pacific Standard Time)</option>
                  <option value="EST">EST (Eastern Standard Time)</option>
                  <option value="IST">IST (India Standard Time)</option>
                </select>
              </div>
            </div>

            <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 md:p-10">
              <h4 className="text-white font-bold text-sm mb-6 uppercase tracking-widest">Notification Preferences</h4>
              <div className="space-y-6">
                <label className="flex items-center justify-between cursor-pointer group">
                  <div>
                    <p className="text-white text-sm font-medium">Email Notifications</p>
                    <p className="text-gray-500 text-xs">Receive updates about your account and meetings.</p>
                  </div>
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={form.email_notifications}
                      onChange={(e) => setForm({ ...form, email_notifications: e.target.checked })}
                    />
                    <div className={`w-10 h-5 rounded-full transition-colors ${form.email_notifications ? 'bg-blue-600' : 'bg-gray-800'}`}>
                      <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${form.email_notifications ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                  </div>
                </label>

                <label className="flex items-center justify-between cursor-pointer group">
                  <div>
                    <p className="text-white text-sm font-medium">Meeting Reminders</p>
                    <p className="text-gray-500 text-xs">Get notified before your scheduled meetings start.</p>
                  </div>
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={form.meeting_reminders}
                      onChange={(e) => setForm({ ...form, meeting_reminders: e.target.checked })}
                    />
                    <div className={`w-10 h-5 rounded-full transition-colors ${form.meeting_reminders ? 'bg-blue-600' : 'bg-gray-800'}`}>
                      <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${form.meeting_reminders ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold tracking-widest transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50"
              >
                {isLoading ? 'SAVING...' : 'SAVE CHANGES'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
