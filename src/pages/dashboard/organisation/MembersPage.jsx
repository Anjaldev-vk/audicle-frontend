import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectUser } from '../../../redux/slices/authSlice'
import axiosInstance from '../../../api/axiosInstance'
import { toast } from 'react-hot-toast'
import SplashScreen from '../../../components/SplashScreen'

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
      setMembers(response.data)
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
      // Refresh list is not enough since it only shows active members, 
      // but invitations are separate. For simplicity, we just notify.
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

  if (isLoading) return <SplashScreen />

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 animate-in fade-in duration-700">
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Team Members</h1>
          <p className="text-gray-500">Manage who has access to your organisation's workspace.</p>
        </div>
        
        {isAdmin && (
          <form onSubmit={handleInvite} className="flex gap-3 w-full md:w-auto">
            <input
              type="email"
              placeholder="colleague@company.com"
              className="px-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl text-white text-sm focus:border-blue-500/50 outline-none transition-all flex-grow md:w-64"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
            />
            <select 
              className="px-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl text-white text-sm focus:border-blue-500/50 outline-none transition-all appearance-none"
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <button
              type="submit"
              disabled={isInviting}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold tracking-widest transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50"
            >
              {isInviting ? 'INVITING...' : 'INVITE'}
            </button>
          </form>
        )}
      </div>

      <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-8 py-5 text-[0.65rem] font-bold text-gray-500 uppercase tracking-widest">Member</th>
              <th className="px-8 py-5 text-[0.65rem] font-bold text-gray-500 uppercase tracking-widest">Role</th>
              <th className="px-8 py-5 text-[0.65rem] font-bold text-gray-500 uppercase tracking-widest">Status</th>
              <th className="px-8 py-5 text-right text-[0.65rem] font-bold text-gray-500 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-white/[0.01] transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-sm font-bold text-gray-400">
                      {member.first_name?.[0]}{member.last_name?.[0]}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{member.full_name}</p>
                      <p className="text-gray-500 text-xs">{member.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1 rounded-full text-[0.6rem] font-bold tracking-widest uppercase border ${member.org_role === 'owner' ? 'border-amber-500/20 text-amber-500 bg-amber-500/5' : member.org_role === 'admin' ? 'border-purple-500/20 text-purple-400 bg-purple-500/5' : 'border-gray-800 text-gray-500'}`}>
                    {member.org_role}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${member.is_verified ? 'bg-green-500' : 'bg-amber-500'}`} />
                    <span className="text-xs text-gray-500">{member.is_verified ? 'Active' : 'Pending'}</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  {isAdmin && member.id !== user.id && member.org_role !== 'owner' ? (
                    <button 
                      onClick={() => handleRemove(member.id, member.full_name)}
                      className="p-2 text-gray-600 hover:text-red-500 transition-colors"
                      title="Remove Member"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  ) : (
                    <span className="text-[0.6rem] text-gray-700 font-bold uppercase tracking-widest">No Actions</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {members.length === 0 && (
          <div className="p-20 text-center">
            <p className="text-gray-600 italic">No members found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
