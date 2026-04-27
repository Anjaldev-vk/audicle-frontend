import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectUser } from '../../../redux/slices/authSlice'
import axiosInstance from '../../../api/axiosInstance'
import { toast } from 'react-hot-toast'
import DashboardLayout from '../../../components/layout/DashboardLayout'
import { Loader2, UserPlus, Trash2, Shield, User } from 'lucide-react'

export default function MembersPage() {
  const user = useSelector(selectUser)
  const [members, setMembers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isInviting, setIsInviting] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('member')

  const isAdmin = user?.org_role === 'owner' || user?.org_role === 'admin'

  const fetchMembers = async () => {
    try {
      const response = await axiosInstance.get('accounts/organisation/members/')
      setMembers(response.data.data || response.data)
    } catch (error) {
      console.error('Failed to fetch members', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  const handleInvite = async (e) => {
    e.preventDefault()
    if (!inviteEmail) return
    
    setIsInviting(true)
    try {
      const response = await axiosInstance.post('accounts/organisation/invite/', {
        email: inviteEmail,
        role: inviteRole
      })
      toast.success(response.data.message)
      setInviteEmail('')
    } catch (error) {
      toast.error(error.response?.data?.email?.[0] || 'Invitation failed')
    } finally {
      setIsInviting(false)
    }
  }

  const handleRemove = async (memberId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from the organisation?`)) return

    try {
      await axiosInstance.delete(`accounts/organisation/members/${memberId}/remove/`)
      toast.success(`${memberName} removed`)
      setMembers(members.filter(m => m.id !== memberId))
    } catch (error) {
      toast.error(error.response?.data?.message || 'Removal failed')
    }
  }

  return (
    <DashboardLayout>
      <div className="animate-in fade-in duration-700">
        <div className="mb-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Team Members</h1>
            <p className="text-gray-500">Manage who has access to your organisation's workspace.</p>
          </div>
          
          {isAdmin && (
            <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto bg-brand-surface border border-brand-border p-2 rounded-2xl">
              <input
                type="email"
                placeholder="colleague@company.com"
                className="px-4 py-2.5 bg-brand-bg border border-brand-border rounded-xl text-white text-sm focus:border-blue-500/50 outline-none transition-all flex-grow lg:w-64"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />
              <select 
                className="px-4 py-2.5 bg-brand-bg border border-brand-border rounded-xl text-white text-sm focus:border-blue-500/50 outline-none transition-all appearance-none min-w-[120px]"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
              <button
                type="submit"
                disabled={isInviting}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold tracking-widest transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isInviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                {isInviting ? 'INVITING...' : 'INVITE'}
              </button>
            </form>
          )}
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-500">Loading team members...</p>
          </div>
        ) : (
          <div className="bg-brand-surface border border-brand-border rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-brand-border bg-white/[0.02]">
                    <th className="px-8 py-5 text-[0.65rem] font-bold text-gray-500 uppercase tracking-widest">Member</th>
                    <th className="px-8 py-5 text-[0.65rem] font-bold text-gray-500 uppercase tracking-widest">Role</th>
                    <th className="px-8 py-5 text-[0.65rem] font-bold text-gray-500 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-right text-[0.65rem] font-bold text-gray-500 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/20 flex items-center justify-center text-sm font-bold text-blue-400">
                            {member.first_name?.[0]}{member.last_name?.[0]}
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">{member.first_name} {member.last_name}</p>
                            <p className="text-gray-500 text-xs">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[0.6rem] font-bold tracking-widest uppercase border flex items-center gap-1.5 w-fit ${member.org_role === 'owner' ? 'border-amber-500/20 text-amber-500 bg-amber-500/5' : member.org_role === 'admin' ? 'border-purple-500/20 text-purple-400 bg-purple-500/5' : 'border-gray-800 text-gray-500'}`}>
                          {member.org_role === 'owner' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                          {member.org_role}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${member.is_verified ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]'}`} />
                          <span className="text-xs text-gray-500 font-medium">{member.is_verified ? 'Active' : 'Pending'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        {isAdmin && member.id !== user.id && member.org_role !== 'owner' ? (
                          <button 
                            onClick={() => handleRemove(member.id, `${member.first_name} ${member.last_name}`)}
                            className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                            title="Remove Member"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        ) : (
                          <span className="text-[0.6rem] text-gray-700 font-bold uppercase tracking-widest">Protected</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {members.length === 0 && (
              <div className="p-20 text-center">
                <p className="text-gray-600 italic">No members found in this organisation.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
