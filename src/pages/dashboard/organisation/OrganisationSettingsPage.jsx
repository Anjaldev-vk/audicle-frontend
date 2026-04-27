import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectUser } from '../../../redux/slices/authSlice'
import axiosInstance from '../../../api/axiosInstance'
import { toast } from 'react-hot-toast'
import DashboardLayout from '../../../components/layout/DashboardLayout'
import { Building, Globe, CreditCard, PieChart, ShieldCheck, Loader2 } from 'lucide-react'

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
        const data = response.data.data || response.data
        setOrg(data)
        setForm({
          name: data.name,
          slug: data.slug,
          logo_url: data.logo_url || ''
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
      setOrg(response.data.data || response.data)
      toast.success('Organisation settings updated')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed')
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-40">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  if (!org) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-brand-surface border border-brand-border rounded-3xl flex items-center justify-center mb-6">
            <Building className="w-10 h-10 text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Individual Account</h2>
          <p className="text-gray-500 mb-8">You are not part of an organisation. Organisation features like team collaboration and shared billing are disabled.</p>
          <button className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-600/20">
            Create Organisation
          </button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="animate-in fade-in duration-700">
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Organisation Settings</h1>
            <p className="text-gray-500">Manage your organization's identity and workspace.</p>
          </div>
          <div className="hidden md:block">
            <span className={`px-4 py-2 rounded-xl text-[0.65rem] font-bold tracking-widest uppercase border flex items-center gap-2 ${org.plan === 'free' ? 'border-brand-border text-gray-500 bg-brand-surface' : 'border-blue-500/20 text-blue-400 bg-blue-500/5'}`}>
              {org.plan === 'pro' ? <ShieldCheck className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
              {org.plan} Plan
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-brand-surface border border-brand-border rounded-3xl p-8 md:p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[0.68rem] font-bold tracking-[0.12em] uppercase text-gray-500 mb-2 ml-1">Organisation Name</label>
                  <div className="relative">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <input
                      type="text"
                      disabled={!isAdmin}
                      className={`w-full pl-12 pr-4 py-3 bg-brand-bg border border-brand-border rounded-xl text-white placeholder-gray-600 focus:border-blue-500/50 outline-none transition-all text-sm ${!isAdmin && 'cursor-not-allowed opacity-50'}`}
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[0.68rem] font-bold tracking-[0.12em] uppercase text-gray-500 mb-2 ml-1">Workspace URL (Slug)</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <input
                      type="text"
                      disabled={!isAdmin}
                      className={`w-full pl-12 pr-28 py-3 bg-brand-bg border border-brand-border rounded-xl text-white placeholder-gray-600 focus:border-blue-500/50 outline-none transition-all text-sm ${!isAdmin && 'cursor-not-allowed opacity-50'}`}
                      value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[0.65rem] font-bold text-gray-600 uppercase tracking-widest pointer-events-none">
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
                  className={`w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl text-white placeholder-gray-600 focus:border-blue-500/50 outline-none transition-all text-sm ${!isAdmin && 'cursor-not-allowed opacity-50'}`}
                  value={form.logo_url}
                  onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                />
              </div>
            </div>

            <div className="bg-brand-surface border border-brand-border rounded-3xl p-8 md:p-10">
              <div className="flex items-center gap-3 mb-8">
                <PieChart className="w-5 h-5 text-indigo-500" />
                <h4 className="text-white font-bold text-sm uppercase tracking-widest">Usage & Resource Limits</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-brand-bg border border-brand-border rounded-2xl p-6">
                  <p className="text-[0.65rem] font-bold text-gray-500 uppercase tracking-widest mb-2">Meetings Month</p>
                  <p className="text-2xl font-bold text-white mb-2">{org.meetings_this_month || 0}</p>
                  <div className="w-full bg-brand-surface h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full shadow-[0_0_8px_rgba(37,99,235,0.6)]" style={{ width: '15%' }} />
                  </div>
                </div>
                <div className="bg-brand-bg border border-brand-border rounded-2xl p-6 opacity-60 group hover:opacity-100 transition-opacity">
                  <p className="text-[0.65rem] font-bold text-gray-500 uppercase tracking-widest mb-2">Storage Used</p>
                  <p className="text-2xl font-bold text-white mb-2">2.4 / 10 GB</p>
                  <div className="w-full bg-brand-surface h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full shadow-[0_0_8px_rgba(79,70,229,0.6)]" style={{ width: '24%' }} />
                  </div>
                </div>
                <div className="bg-brand-bg border border-brand-border rounded-2xl p-6 opacity-60 group hover:opacity-100 transition-opacity">
                  <p className="text-[0.65rem] font-bold text-gray-500 uppercase tracking-widest mb-2">AI Processing</p>
                  <p className="text-2xl font-bold text-white mb-2">45 / 300 min</p>
                  <div className="w-full bg-brand-surface h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)]" style={{ width: '15%' }} />
                  </div>
                </div>
              </div>
            </div>

            {isAdmin && (
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold tracking-widest transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {isUpdating ? 'SAVING...' : 'UPDATE SETTINGS'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}
