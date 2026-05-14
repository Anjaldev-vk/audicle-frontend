import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectUser } from '../../auth/slices/authSlice'
import { selectActiveWorkspace } from '../../workspace/slices/workspaceSlice'
import { 
  useGetOrganisationQuery, 
  useUpdateOrganisationMutation, 
  useGetMembersQuery, 
  useInviteMemberMutation, 
  useRemoveMemberMutation,
  useDisableMfaMutation,
  useGetSessionsQuery,
  useRevokeSessionMutation,
  useGetCalendarStatusQuery
} from '../api/accountsApi'
import { useConnectCalendarMutation, useDisconnectCalendarMutation } from '../../meetings/api/calendarApi'
import { toast } from 'react-hot-toast'
import AppLayout from '../../../components/layout/AppLayout'
import { 
  Building, 
  Loader2, 
  Users, 
  User as UserIcon, 
  Lock, 
  Shield, 
  Smartphone,
  ChevronRight,
  CreditCard,
  Link as LinkIcon,
  Activity,
  LogOut
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import MemberList from '../components/MemberList'
import InviteForm from '../components/InviteForm'
import ConfirmModal from '../../../components/shared/ConfirmModal'
import UpgradeModal from '../../../components/shared/UpgradeModal'
import ChangePasswordModal from '../../auth/components/ChangePasswordModal'
import MfaSetupModal from '../components/MfaSetupModal'

export default function SettingsPage() {
  const user = useSelector(selectUser)
  const activeWorkspace = useSelector(selectActiveWorkspace)
  const [activeTab, setActiveTab] = useState('profile')

  const { data: org } = useGetOrganisationQuery()
  const { data: membersResponse } = useGetMembersQuery()
  const [updateOrganisation, { isLoading: isUpdatingOrg }] = useUpdateOrganisationMutation()
  const [inviteMember, { isLoading: isInviting }] = useInviteMemberMutation()
  const [removeMember] = useRemoveMemberMutation()
  const [disableMfa] = useDisableMfaMutation()
  
  const { data: sessions } = useGetSessionsQuery()
  const { data: calendarStatus } = useGetCalendarStatusQuery()
  const [revokeSession] = useRevokeSessionMutation()
  const [connectCalendar] = useConnectCalendarMutation()
  const [disconnectCalendar] = useDisconnectCalendarMutation()

  const [orgForm, setOrgForm] = useState({ name: '', slug: '', logo_url: '' })
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, memberId: null, memberName: '' })
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [isMfaSetupOpen, setIsMfaSetupOpen] = useState(false)
  const [isMfaDisableOpen, setIsMfaDisableOpen] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)

  useEffect(() => {
    if (org && !orgForm.name && !orgForm.slug) {
      setOrgForm(prev => ({
        ...prev,
        name: org.name || org.data?.name || '',
        slug: org.slug || org.data?.slug || '',
        logo_url: org.logo_url || org.data?.logo_url || ''
      }))
    }
  }, [org, orgForm.name, orgForm.slug])

  // ── RBAC from workspace slice ──────────────────
  const workspaceRole = activeWorkspace?.role || user?.org_role || 'member'
  const isOwnerOrAdmin = workspaceRole === 'owner' || workspaceRole === 'admin'
  const members = membersResponse?.data?.results || membersResponse?.results || []
  const currentPlan = activeWorkspace?.plan || 'free'

  // ── Handlers ───────────────────────────────────
  const handleOrgSubmit = async (e) => {
    e.preventDefault()
    try {
      await updateOrganisation(orgForm).unwrap()
      toast.success('Workspace updated')
    } catch (err) {
      if (err?.status === 403) {
        toast.error("You don't have permission")
      } else {
        toast.error('Update failed')
      }
    }
  }

  const handleRemoveMember = async () => {
    try {
      await removeMember(confirmDelete.memberId).unwrap()
      toast.success('Member removed')
      setConfirmDelete({ isOpen: false, memberId: null, memberName: '' })
    } catch (err) {
      if (err?.status === 403) {
        toast.error("You don't have permission to remove this member")
      } else if (err?.status === 404) {
        toast.error('Member not found')
      } else {
        toast.error(err?.data?.message || 'Removal failed')
      }
    }
  }

  const handleDisableMfa = async () => {
    try {
      await disableMfa().unwrap()
      toast.success('MFA disabled')
      setIsMfaDisableOpen(false)
    } catch {
      toast.error('Failed to disable MFA')
    }
  }

  const handleRevokeSession = async (sessionId) => {
    try {
      await revokeSession(sessionId).unwrap()
      toast.success('Session revoked')
    } catch {
      toast.error('Failed to revoke session')
    }
  }

  const handleConnectCalendar = async () => {
    try {
      const result = await connectCalendar().unwrap()
      if (result.data?.auth_url) {
        window.location.href = result.data.auth_url
      }
    } catch {
      toast.error('Connection failed')
    }
  }

  const handleDisconnectCalendar = async () => {
    try {
      await disconnectCalendar().unwrap()
      toast.success('Calendar disconnected')
    } catch {
      toast.error('Disconnection failed')
    }
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'organisation', name: 'Workspace', icon: Building },
    { id: 'members', name: 'Team', icon: Users },
    { id: 'security', name: 'Security', icon: Lock },
    { id: 'billing', name: 'Billing', icon: CreditCard },
    { id: 'integrations', name: 'Integrations', icon: LinkIcon },
  ]

  return (
    <AppLayout>
      <div className="flex flex-col lg:flex-row gap-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-72 shrink-0">
          <div className="bg-brand-surface border border-brand-border rounded-[2.5rem] p-4 shadow-xl sticky top-8">
            <div className="p-6 mb-2">
               <h2 className="text-sm font-black text-text-main uppercase tracking-[0.2em]">Control Center</h2>
               <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">Platform Management</p>
            </div>
            <div className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all group
                    ${activeTab === tab.id 
                      ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' 
                      : 'hover:bg-brand-highlight text-text-muted hover:text-text-main'}
                  `}
                >
                  <div className="flex items-center gap-4">
                    <tab.icon size={18} className={activeTab === tab.id ? 'text-white' : 'text-text-muted group-hover:text-blue-500 transition-colors'} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{tab.name}</span>
                  </div>
                  <ChevronRight size={14} className={activeTab === tab.id ? 'opacity-50' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all'} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <div className="bg-brand-surface border border-brand-border rounded-[2.5rem] p-8 md:p-12 shadow-2xl min-h-[600px]">
            
            {/* ── Profile Tab ─────────────────────── */}
            {activeTab === 'profile' && (
              <div className="max-w-2xl animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-6 mb-12">
                   <div className="w-20 h-20 rounded-3xl bg-blue-600 flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-blue-600/20">
                      {user?.first_name?.substring(0, 1) || 'U'}
                   </div>
                   <div>
                      <h3 className="text-2xl font-black text-text-main tracking-tight">{user?.first_name} {user?.last_name}</h3>
                      <p className="text-text-muted font-bold text-sm tracking-tight">{user?.email}</p>
                      <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest">
                         Verified Account
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Account Role</label>
                      <div className="w-full px-5 py-4 bg-brand-highlight border border-brand-border rounded-2xl text-text-main font-bold capitalize">{workspaceRole}</div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Current Plan</label>
                      <div className="w-full px-5 py-4 bg-brand-highlight border border-brand-border rounded-2xl text-text-main font-bold capitalize">{currentPlan}</div>
                   </div>
                </div>

                <div className="mt-12 pt-12 border-t border-brand-border">
                   <h4 className="text-sm font-black text-text-main uppercase tracking-widest mb-6">Security Actions</h4>
                   <button 
                     onClick={() => setIsChangePasswordOpen(true)}
                     className="px-8 py-3 bg-brand-highlight hover:bg-brand-bg text-text-main border border-brand-border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                   >
                     Update Password
                   </button>
                </div>
              </div>
            )}

            {/* ── Organisation Tab ────────────────── */}
            {activeTab === 'organisation' && (
              <div className="max-w-2xl animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-4 mb-10">
                   <Building className="text-blue-500" size={24} />
                   <h3 className="text-2xl font-black text-text-main tracking-tight">Workspace Identity</h3>
                </div>

                <form onSubmit={handleOrgSubmit} className="space-y-8">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Workspace Name</label>
                      <input
                        type="text"
                        value={orgForm.name}
                        onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                        disabled={!isOwnerOrAdmin}
                        className="w-full px-6 py-4 bg-brand-highlight border border-brand-border focus:border-blue-500/50 rounded-2xl text-text-main font-bold outline-none transition-all disabled:opacity-50"
                        placeholder="Organisation Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Workspace Slug</label>
                      <input
                        type="text"
                        value={orgForm.slug}
                        onChange={(e) => setOrgForm({ ...orgForm, slug: e.target.value })}
                        disabled={!isOwnerOrAdmin}
                        className="w-full px-6 py-4 bg-brand-highlight border border-brand-border focus:border-blue-500/50 rounded-2xl text-text-main font-bold outline-none transition-all disabled:opacity-50"
                        placeholder="organisation-slug"
                      />
                    </div>
                  </div>

                  {isOwnerOrAdmin && (
                    <button
                      type="submit"
                      disabled={isUpdatingOrg}
                      className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 transition-all disabled:opacity-50"
                    >
                      {isUpdatingOrg ? <Loader2 size={16} className="animate-spin" /> : 'Save Changes'}
                    </button>
                  )}
                </form>
              </div>
            )}

            {/* ── Members Tab ─────────────────────── */}
            {activeTab === 'members' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                   <div className="flex items-center gap-4">
                      <Users className="text-blue-500" size={24} />
                      <div>
                        <h3 className="text-2xl font-black text-text-main tracking-tight">Team Members</h3>
                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">
                          {members.length} member{members.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                   </div>
                   {isOwnerOrAdmin && (
                     <InviteForm 
                       onInvite={inviteMember} 
                       isLoading={isInviting}
                       onPlanLimit={() => setShowUpgrade(true)}
                     />
                   )}
                </div>

                <MemberList 
                  members={members} 
                  currentUserId={user?.id}
                  currentUserRole={workspaceRole}
                  onRemove={(member) => {
                    const userData = member.user || member
                    setConfirmDelete({ 
                      isOpen: true, 
                      memberId: member.id || userData.id, 
                      memberName: `${userData.first_name} ${userData.last_name}` 
                    })
                  }}
                />
              </div>
            )}

            {/* ── Security Tab ────────────────────── */}
            {activeTab === 'security' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-12">
                <div>
                   <div className="flex items-center gap-4 mb-10">
                      <Lock className="text-blue-500" size={24} />
                      <h3 className="text-2xl font-black text-text-main tracking-tight">Access Control</h3>
                   </div>

                   <div className="bg-brand-highlight border border-brand-border rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-10 group">
                      <div className="flex items-center gap-8">
                         <div className={`w-16 h-16 rounded-3xl flex items-center justify-center border transition-all ${user?.mfa_enabled ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                            <Shield size={32} className={user?.mfa_enabled ? 'text-emerald-500' : 'text-red-500'} />
                         </div>
                         <div>
                            <h4 className="text-lg font-black text-text-main tracking-tight">Multi-Factor Authentication</h4>
                            <p className="text-sm text-text-muted font-bold tracking-tight mt-1">Fortify your account with TOTP tokens.</p>
                         </div>
                      </div>
                      <button 
                        onClick={() => user?.mfa_enabled ? setIsMfaDisableOpen(true) : setIsMfaSetupOpen(true)}
                        className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl ${user?.mfa_enabled ? 'bg-brand-surface border border-brand-border text-red-500 hover:bg-red-500/10' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/20'}`}
                      >
                        {user?.mfa_enabled ? 'Disable MFA' : 'Enable MFA'}
                      </button>
                   </div>
                </div>

                <div>
                   <div className="flex items-center gap-4 mb-8">
                      <Smartphone className="text-blue-500" size={20} />
                      <h4 className="text-sm font-black text-text-main uppercase tracking-widest">Active Sessions</h4>
                   </div>
                   <div className="space-y-4">
                      {(sessions?.data || sessions?.results || []).map((s) => (
                        <div key={s.id} className="flex items-center justify-between p-6 bg-brand-surface border border-brand-border rounded-2xl hover:border-blue-500/30 transition-all group">
                           <div className="flex items-center gap-6">
                              <div className="w-10 h-10 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-center">
                                 <Activity size={16} className={s.is_current ? 'text-emerald-500' : 'text-text-muted'} />
                              </div>
                              <div>
                                 <div className="flex items-center gap-3">
                                    <span className="text-sm font-black text-text-main">{s.device_name || 'Unknown Device'}</span>
                                    {s.is_current && <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-md text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">Current</span>}
                                 </div>
                                 <p className="text-[10px] text-text-muted font-bold mt-1 uppercase tracking-widest">
                                   {s.browser} • Last active {s.last_activity ? formatDistanceToNow(new Date(s.last_activity)) + ' ago' : 'recently'}
                                 </p>
                              </div>
                           </div>
                           {!s.is_current && (
                             <button 
                               onClick={() => handleRevokeSession(s.id)}
                               className="p-3 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                             >
                               <LogOut size={16} />
                             </button>
                           )}
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            )}

            {/* ── Billing Tab ─────────────────────── */}
            {activeTab === 'billing' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                 <div className="flex items-center gap-4 mb-10">
                    <CreditCard className="text-blue-500" size={24} />
                    <h3 className="text-2xl font-black text-text-main tracking-tight">Billing & Plans</h3>
                 </div>

                 <div className="bg-brand-highlight border border-brand-border rounded-[2.5rem] p-10 mb-10 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-32 bg-blue-500/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                       <div>
                          <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2">Current Plan</p>
                          <h4 className="text-4xl font-black text-text-main tracking-tighter uppercase">{currentPlan}</h4>
                          <p className="text-sm text-text-muted font-bold mt-4 tracking-tight">
                            {currentPlan === 'enterprise' ? 'Unlimited capacity.' : currentPlan === 'pro' ? 'Enhanced intelligence processing.' : 'Basic plan. Upgrade to remove limits.'}
                          </p>
                       </div>
                       <Link to="/dashboard/billing" className="px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 transition-all text-center">
                          Manage Plan
                       </Link>
                    </div>
                 </div>
              </div>
            )}

            {/* ── Integrations Tab ────────────────── */}
            {activeTab === 'integrations' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                 <div className="flex items-center gap-4 mb-10">
                    <LinkIcon className="text-blue-500" size={24} />
                    <h3 className="text-2xl font-black text-text-main tracking-tight">Integrations</h3>
                 </div>

                 <div className="space-y-6">
                    <div className="bg-brand-highlight border border-brand-border rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-10 group">
                       <div className="flex items-center gap-8">
                          <div className="w-16 h-16 rounded-3xl bg-white border border-brand-border flex items-center justify-center p-3 shadow-xl">
                             <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" alt="Google Calendar" className="w-full h-full" />
                          </div>
                          <div>
                             <h4 className="text-lg font-black text-text-main tracking-tight">Google Calendar</h4>
                             <p className="text-sm text-text-muted font-bold tracking-tight mt-1">Automatic sync for scheduled meetings.</p>
                             <div className="mt-3 flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${calendarStatus?.data?.connected ? 'bg-emerald-500' : 'bg-gray-700'}`} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">{calendarStatus?.data?.connected ? 'Connected' : 'Disconnected'}</span>
                             </div>
                          </div>
                       </div>
                       <button 
                         onClick={calendarStatus?.data?.connected ? handleDisconnectCalendar : handleConnectCalendar}
                         className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl ${calendarStatus?.data?.connected ? 'bg-brand-surface border border-brand-border text-red-500 hover:bg-red-500/10' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/20'}`}
                       >
                         {calendarStatus?.data?.connected ? 'Disconnect' : 'Connect'}
                       </button>
                    </div>
                 </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ── Modals ──────────────────────────────── */}
      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, memberId: null, memberName: '' })}
        onConfirm={handleRemoveMember}
        title="Remove Member"
        message={`Are you sure you want to remove ${confirmDelete.memberName} from this workspace? They will lose access immediately.`}
      />

      <ChangePasswordModal 
        isOpen={isChangePasswordOpen} 
        onClose={() => setIsChangePasswordOpen(false)} 
      />

      <MfaSetupModal 
        isOpen={isMfaSetupOpen} 
        onClose={() => setIsMfaSetupOpen(false)} 
      />

      <ConfirmModal
        isOpen={isMfaDisableOpen}
        onClose={() => setIsMfaDisableOpen(false)}
        onConfirm={handleDisableMfa}
        title="Disable MFA"
        message="Are you sure you want to disable Multi-Factor Authentication? Your account will be less secure."
      />

      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        currentPlan={currentPlan}
        limitType="members"
      />
    </AppLayout>
  )
}
