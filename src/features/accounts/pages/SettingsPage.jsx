import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectUser } from '../../auth/slices/authSlice'
import { 
  useGetOrganisationQuery, 
  useUpdateOrganisationMutation, 
  useGetMembersQuery, 
  useInviteMemberMutation, 
  useRemoveMemberMutation,
  useDisableMfaMutation
} from '../api/accountsApi'
import { toast } from 'react-hot-toast'
import AppLayout from '../../../components/layout/AppLayout'
import { 
  Building, 
  ShieldCheck, 
  Loader2, 
  Users, 
  User as UserIcon, 
  Lock, 
  Shield, 
  Smartphone,
  ChevronRight,
  ShieldAlert
} from 'lucide-react'
import MemberList from '../components/MemberList'
import InviteForm from '../components/InviteForm'
import ConfirmModal from '../../../components/shared/ConfirmModal'
import ChangePasswordModal from '../../auth/components/ChangePasswordModal'
import MfaSetupModal from '../components/MfaSetupModal'

export default function SettingsPage() {
  const user = useSelector(selectUser)
  const [activeTab, setActiveTab] = useState('profile')
  const { data: org, isLoading: isOrgLoading } = useGetOrganisationQuery()
  const { data: membersResponse, isLoading: isMembersLoading } = useGetMembersQuery()
  const [updateOrganisation, { isLoading: isUpdatingOrg }] = useUpdateOrganisationMutation()
  const [inviteMember, { isLoading: isInviting }] = useInviteMemberMutation()
  const [removeMember] = useRemoveMemberMutation()
  const [disableMfa] = useDisableMfaMutation()

  const [orgForm, setOrgForm] = useState({ name: '', slug: '', logo_url: '' })
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, memberId: null, memberName: '' })
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isMfaModalOpen, setIsMfaModalOpen] = useState(false)
  const [isMfaDisableOpen, setIsMfaDisableOpen] = useState(false)

  useEffect(() => {
    if (org) {
      setOrgForm({
        name: org.name || '',
        slug: org.slug || '',
        logo_url: org.logo_url || ''
      })
    }
  }, [org])

  const isAdmin = user?.org_role === 'owner' || user?.org_role === 'admin'
  const members = membersResponse?.data?.results || []

  const handleOrgSubmit = async (e) => {
    e.preventDefault()
    try {
      await updateOrganisation(orgForm).unwrap()
      toast.success('Organisation updated')
    } catch (err) {
      toast.error(err?.data?.message || 'Update failed')
    }
  }

  const handleInvite = async (data) => {
    try {
      await inviteMember(data).unwrap()
      toast.success('Invitation sent')
    } catch (err) {
      toast.error(err?.data?.message || 'Invite failed')
    }
  }

  const handleRemoveMember = async () => {
    try {
      await removeMember(confirmDelete.memberId).unwrap()
      toast.success('Member removed')
      setConfirmDelete({ isOpen: false, memberId: null, memberName: '' })
    } catch (err) {
      toast.error(err?.data?.message || 'Removal failed')
    }
  }

  const handleDisableMfa = async () => {
    try {
      await disableMfa().unwrap()
      toast.success('MFA disabled')
      setIsMfaDisableOpen(false)
    } catch (err) {
      toast.error('Failed to disable MFA')
    }
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'organisation', name: 'Workspace', icon: Building },
    { id: 'members', name: 'Team', icon: Users },
    { id: 'security', name: 'Security', icon: Lock },
  ]

  return (
    <AppLayout>
      <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-4xl font-black text-white mb-3 tracking-tighter">Command Center</h1>
        <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px]">Configure your intelligence environment</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-72 shrink-0 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                w-full flex items-center justify-between px-6 py-4 rounded-2xl text-sm font-bold tracking-tight transition-all group relative
                ${activeTab === tab.id 
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20 shadow-sm shadow-blue-600/5' 
                  : 'text-gray-500 hover:text-white hover:bg-white/5 border border-transparent'}
              `}
            >
              <div className="flex items-center gap-4">
                <tab.icon size={18} className={`transition-transform group-hover:scale-110 ${activeTab === tab.id ? 'text-blue-400' : 'text-gray-600'}`} />
                {tab.name}
              </div>
              <ChevronRight size={14} className={`transition-opacity ${activeTab === tab.id ? 'opacity-100' : 'opacity-0'}`} />
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-w-0 animate-in fade-in slide-in-from-right-4 duration-700">
          {activeTab === 'profile' && (
            <div className="space-y-8">
              <div className="bg-brand-surface border border-brand-border rounded-[2.5rem] p-10 md:p-12 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-20 bg-blue-600/5 rounded-full -mr-20 -mt-20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                
                <div className="flex flex-col md:flex-row md:items-center gap-8 mb-12 relative z-10">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-3xl shadow-2xl shadow-blue-600/30 ring-4 ring-white/5">
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-white mb-2 tracking-tight">{user?.first_name} {user?.last_name}</h3>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-gray-500 uppercase tracking-widest">{user?.email}</span>
                      <span className="px-3 py-1 bg-blue-600/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-400 uppercase tracking-widest">Active Member</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest ml-1">Identity: First Name</label>
                    <input type="text" readOnly value={user?.first_name} className="w-full px-6 py-4 bg-brand-bg border border-brand-border rounded-2xl text-white opacity-40 font-bold outline-none cursor-not-allowed" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest ml-1">Identity: Last Name</label>
                    <input type="text" readOnly value={user?.last_name} className="w-full px-6 py-4 bg-brand-bg border border-brand-border rounded-2xl text-white opacity-40 font-bold outline-none cursor-not-allowed" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'organisation' && (
            <div className="space-y-8">
              {isOrgLoading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-4">
                  <Loader2 className="animate-spin text-blue-500 w-10 h-10" />
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Fetching workspace metadata...</p>
                </div>
              ) : !org ? (
                <div className="bg-brand-surface border border-brand-border rounded-[2.5rem] p-16 text-center shadow-2xl">
                  <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-8">
                    <Building size={40} className="text-gray-700" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-3">Disconnected Workspace</h3>
                  <p className="text-gray-500 mb-10 text-sm max-w-sm mx-auto font-medium">This identity is not currently associated with a professional workspace.</p>
                  <button className="px-12 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/30 transition-all">Establish Organisation</button>
                </div>
              ) : (
                <form onSubmit={handleOrgSubmit} className="space-y-8">
                  <div className="bg-brand-surface border border-brand-border rounded-[2.5rem] p-10 md:p-12 space-y-12 relative overflow-hidden group shadow-2xl">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <Building size={20} className="text-blue-500" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-white tracking-tight">Workspace Identity</h3>
                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-0.5">Primary Organization Details</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest ml-1">Legal Entity Name</label>
                        <input 
                          type="text" 
                          value={orgForm.name} 
                          onChange={(e) => setOrgForm({...orgForm, name: e.target.value})} 
                          className="w-full px-6 py-4 bg-brand-bg border border-brand-border rounded-2xl text-white focus:border-blue-500/50 outline-none transition-all font-bold" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest ml-1">Workspace Resource Slug</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            value={orgForm.slug} 
                            onChange={(e) => setOrgForm({...orgForm, slug: e.target.value})} 
                            className="w-full px-6 py-4 bg-brand-bg border border-brand-border rounded-2xl text-white focus:border-blue-500/50 outline-none transition-all font-bold pl-32" 
                          />
                          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-600 uppercase tracking-widest pointer-events-none">audicle.io/</div>
                        </div>
                      </div>
                    </div>
                    <button 
                      type="submit" 
                      disabled={isUpdatingOrg} 
                      className="px-12 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/30 transition-all disabled:opacity-50"
                    >
                      {isUpdatingOrg ? 'COMMITTING CHANGES...' : 'SYNCHRONIZE WORKSPACE'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-white/5 pb-10">
                <div>
                  <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Access Control</h3>
                  <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Authorized Workspace Personnel</p>
                </div>
                {isAdmin && <InviteForm onInvite={handleInvite} isLoading={isInviting} />}
              </div>
              
              {isMembersLoading ? (
                <div className="flex justify-center py-40"><Loader2 className="animate-spin text-blue-500 w-10 h-10" /></div>
              ) : (
                <div className="bg-brand-surface border border-brand-border rounded-[2.5rem] overflow-hidden shadow-2xl">
                  <MemberList 
                    members={members} 
                    currentUser={user} 
                    isAdmin={isAdmin} 
                    onRemove={(id, name) => setConfirmDelete({ isOpen: true, memberId: id, memberName: name })} 
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="bg-brand-surface border border-brand-border rounded-[2.5rem] p-10 md:p-12 shadow-2xl relative overflow-hidden group">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Shield size={20} className="text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight">Security & Encryption</h3>
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-0.5">Advanced Account Protection</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {/* MFA */}
                  <div className="p-8 bg-brand-bg/50 border border-brand-border rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-blue-500/30 transition-all">
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${user?.mfa_enabled ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/5 border-white/5'}`}>
                        {user?.mfa_enabled ? <ShieldCheck className="text-emerald-500" /> : <Smartphone className="text-gray-500" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <p className="text-white font-bold text-lg tracking-tight">Two-Factor Authentication</p>
                          {user?.mfa_enabled && <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase rounded-full border border-emerald-500/20">Active</span>}
                        </div>
                        <p className="text-xs text-gray-600 font-medium mt-1">Multi-step verification via biometric or TOTP app.</p>
                      </div>
                    </div>
                    {user?.mfa_enabled ? (
                      <button 
                        onClick={() => setIsMfaDisableOpen(true)}
                        className="px-6 py-3 bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/20 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button 
                        onClick={() => setIsMfaModalOpen(true)}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-all"
                      >
                        Establish MFA
                      </button>
                    )}
                  </div>

                  {/* Password */}
                  <div className="p-8 bg-brand-bg/50 border border-brand-border rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-blue-500/30 transition-all">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center">
                        <Lock size={20} className="text-gray-500" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-lg tracking-tight">Master Password</p>
                        <p className="text-xs text-gray-600 font-medium mt-1">Ensure your primary access credential is strong and rotated.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsPasswordModalOpen(true)}
                      className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Rotate Credential
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal 
        isOpen={confirmDelete.isOpen} 
        onClose={() => setConfirmDelete({ ...confirmDelete, isOpen: false })} 
        onConfirm={handleRemoveMember} 
        title="Revoke Workspace Access" 
        message={`Are you certain you wish to remove ${confirmDelete.memberName} from the organization? This action is irreversible and all permissions will be purged immediately.`} 
      />

      <ConfirmModal 
        isOpen={isMfaDisableOpen} 
        onClose={() => setIsMfaDisableOpen(false)} 
        onConfirm={handleDisableMfa} 
        title="Deactivate Security Gate" 
        message="Disabling Two-Factor Authentication significantly reduces account security. Are you absolutely certain you wish to proceed?"
        variant="danger"
      />

      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />

      <MfaSetupModal 
        isOpen={isMfaModalOpen} 
        onClose={() => setIsMfaModalOpen(false)} 
      />
    </AppLayout>
  )
}
