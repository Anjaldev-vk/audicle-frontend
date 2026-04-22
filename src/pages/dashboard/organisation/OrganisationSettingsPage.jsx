import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectUser } from '../../../redux/slices/authSlice'
import axiosInstance from '../../../api/axiosInstance'
import { toast } from 'react-hot-toast'
import SplashScreen from '../../../components/SplashScreen'

export default function OrganisationSettingsPage() {
  const user = useSelector(selectUser)
  const [org, setOrg] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  
  const [form, setForm] = useState({
    name: '',
    slug: '',
    logo_url: ''
  })

  const isAdmin = user?.org_role === 'owner' || user?.org_role === 'admin'

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const response = await axiosInstance.get('accounts/organisation/')
        setOrg(response.data)
        setForm({
          name: response.data.name,
          slug: response.data.slug,
          logo_url: response.data.logo_url || ''
        })
      } catch (error) {
        console.error('Failed to fetch org', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchOrg()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isAdmin) return
    
    setIsUpdating(true)
    try {
      const response = await axiosInstance.patch('accounts/organisation/', form)
      setOrg(response.data)
      toast.success('Organisation settings updated')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed')
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) return <SplashScreen />

  if (!org) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-10">
        <h2 className="text-2xl font-bold text-white mb-2">No Organisation</h2>
        <p className="text-gray-500 mb-6 font-medium">You are currently using an individual account.</p>
        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold tracking-widest transition-all">
          CREATE ORGANISATION
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 animate-in fade-in duration-700">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Organisation Settings</h1>
          <p className="text-gray-500">Manage your organization's identity and workspace.</p>
        </div>
        <div className="hidden md:block">
          <span className={`px-4 py-2 rounded-full text-[0.65rem] font-bold tracking-widest uppercase border ${org.plan === 'free' ? 'border-gray-800 text-gray-500' : 'border-blue-500/20 text-blue-400 bg-blue-500/5'}`}>
            {org.plan} Plan
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 md:p-10 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[0.68rem] font-bold tracking-[0.12em] uppercase text-gray-500 mb-2 ml-1">Organisation Name</label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  className={`w-full px-4 py-3 bg-[#111] border border-white/5 rounded-xl text-white placeholder-gray-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all text-sm ${!isAdmin && 'cursor-not-allowed opacity-50'}`}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[0.68rem] font-bold tracking-[0.12em] uppercase text-gray-500 mb-2 ml-1">Workspace URL (Slug)</label>
                <div className="relative">
                  <input
                    type="text"
                    disabled={!isAdmin}
                    className={`w-full px-4 py-3 bg-[#111] border border-white/5 rounded-xl text-white placeholder-gray-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all text-sm ${!isAdmin && 'cursor-not-allowed opacity-50'}`}
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[0.65rem] font-bold text-gray-600 uppercase tracking-widest">
                    .audicle.ai
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[0.68rem] font-bold tracking-[0.12em] uppercase text-gray-500 mb-2 ml-1">Organisation Logo URL</label>
              <input
                type="url"
                disabled={!isAdmin}
                placeholder="https://example.com/logo.png"
                className={`w-full px-4 py-3 bg-[#111] border border-white/5 rounded-xl text-white placeholder-gray-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all text-sm ${!isAdmin && 'cursor-not-allowed opacity-50'}`}
                value={form.logo_url}
                onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
              />
            </div>
          </div>

          <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 md:p-10">
            <h4 className="text-white font-bold text-sm mb-6 uppercase tracking-widest">Usage & Limits</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                <p className="text-[0.65rem] font-bold text-gray-500 uppercase tracking-widest mb-2">Meetings This Month</p>
                <p className="text-2xl font-bold text-white mb-2">{org.meetings_this_month || 0}</p>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '10%' }} />
                </div>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-6 opacity-50">
                <p className="text-[0.65rem] font-bold text-gray-500 uppercase tracking-widest mb-2">Storage Used</p>
                <p className="text-2xl font-bold text-white mb-2">0 GB</p>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gray-700 h-full rounded-full" style={{ width: '0%' }} />
                </div>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-6 opacity-50">
                <p className="text-[0.65rem] font-bold text-gray-500 uppercase tracking-widest mb-2">AI Minutes</p>
                <p className="text-2xl font-bold text-white mb-2">0 / 120</p>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gray-700 h-full rounded-full" style={{ width: '0%' }} />
                </div>
              </div>
            </div>
          </div>

          {isAdmin && (
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isUpdating}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold tracking-widest transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50"
              >
                {isUpdating ? 'SAVING...' : 'UPDATE SETTINGS'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
