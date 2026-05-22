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
  const isOrganisationWorkspace = activeWorkspace?.type === 'organisation'

  const { data: org } = useGetOrganisationQuery(undefined, { skip: !isOrganisationWorkspace })
  const { data: membersResponse } = useGetMembersQuery(undefined, { skip: !isOrganisationWorkspace })
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
    const organisation = org?.data || org
    if (organisation && !orgForm.name && !orgForm.slug) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOrgForm(prev => ({
        ...prev,
        name: organisation.name || '',
        slug: organisation.slug || '',
        logo_url: organisation.logo_url || ''
      }))
    }
  }, [org, orgForm.name, orgForm.slug])

  useEffect(() => {
    if (!isOrganisationWorkspace && ['organisation', 'members'].includes(activeTab)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTab('profile')
    }
  }, [activeTab, isOrganisationWorkspace])

  // ── RBAC from workspace slice ──────────────────
  const workspaceRole = isOrganisationWorkspace ? (activeWorkspace?.role || user?.org_role || 'member') : 'owner'
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

  const personalTabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'security', name: 'Security', icon: Lock },
    { id: 'integrations', name: 'Integrations', icon: LinkIcon },
  ]

  const orgTabs = isOrganisationWorkspace ? [
    { id: 'organisation', name: 'Workspace', icon: Building },
    { id: 'members', name: 'Team', icon: Users },
    { id: 'billing', name: 'Billing', icon: CreditCard },
  ] : [
    { id: 'billing', name: 'Billing', icon: CreditCard },
  ]

  const allTabs = [
    ...personalTabs,
    ...orgTabs
  ];

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8 animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-2xl md:text-3xl font-bold text-text-main tracking-tight">Settings</h1>
          <p className="text-sm text-text-muted mt-1">
            Manage your {isOrganisationWorkspace ? 'organisation workspace' : 'personal account'} preferences.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          
          {/* Navigation Sidebar */}
          <div className="w-full lg:w-56 shrink-0">
            <div className="sticky top-8">
              {/* Mobile: Horizontal scrollable underline tabs */}
              <div className="flex lg:hidden overflow-x-auto custom-scrollbar border-b border-brand-border gap-6 pb-px">
                {allTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 pb-3 border-b-2 text-sm font-medium transition-colors shrink-0 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-500'
                        : 'border-transparent text-text-muted hover:text-text-main'
                    }`}
                  >
                    <tab.icon size={16} />
                    {tab.name}
                  </button>
                ))}
              </div>

              {/* Desktop: Vertical sections */}
              <div className="hidden lg:flex flex-col gap-8">
                <div>
                  <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-3">
                    Personal
                  </h3>
                  <div className="space-y-1">
                    {personalTabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          activeTab === tab.id
                            ? 'bg-blue-50/50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            : 'text-text-muted hover:bg-brand-surface hover:text-text-main'
                        }`}
                      >
                        <tab.icon size={16} />
                        {tab.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-3">
                    {isOrganisationWorkspace ? 'Workspace' : 'Plan'}
                  </h3>
                  <div className="space-y-1">
                    {orgTabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          activeTab === tab.id
                            ? 'bg-blue-50/50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            : 'text-text-muted hover:bg-brand-surface hover:text-text-main'
                        }`}
                      >
                        <tab.icon size={16} />
                        {tab.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0 pb-20">
            
            {/* ── Profile Tab ─────────────────────── */}
            {activeTab === 'profile' && (
              <div className="max-w-2xl animate-in fade-in duration-300">
                <div className="mb-8 pb-8 border-b border-brand-border">
                  <h2 className="text-xl font-bold text-text-main mb-6">Profile</h2>
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-3xl font-bold border border-blue-200 dark:border-blue-800/50 shrink-0">
                      {user?.first_name?.substring(0, 1) || 'U'}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-text-main">{user?.first_name} {user?.last_name}</h3>
                      <p className="text-text-muted text-sm">{user?.email}</p>
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-md border border-emerald-200 dark:border-emerald-500/20 text-xs font-medium">
                        <Shield size={12} />
                        Verified Account
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-text-main">Account Role</label>
                      <div className="w-full px-4 py-2.5 bg-brand-surface border border-brand-border rounded-lg text-text-main capitalize">
                        {workspaceRole}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-text-main">Current Plan</label>
                      <div className="w-full px-4 py-2.5 bg-brand-surface border border-brand-border rounded-lg text-text-main capitalize">
                        {currentPlan}
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-brand-border">
                    <h3 className="text-sm font-medium text-text-main mb-4">Security Actions</h3>
                    <button 
                      onClick={() => setIsChangePasswordOpen(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                    >
                      Update Password
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Organisation Tab ────────────────── */}
            {activeTab === 'organisation' && (
              <div className="max-w-2xl animate-in fade-in duration-300">
                <div className="mb-8 pb-8 border-b border-brand-border">
                  <h2 className="text-xl font-bold text-text-main">Workspace Settings</h2>
                  <p className="text-sm text-text-muted mt-1">Manage your organisation details and preferences.</p>
                </div>

                <form onSubmit={handleOrgSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-main">Workspace Name</label>
                    <input
                      type="text"
                      value={orgForm.name}
                      onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                      disabled={!isOwnerOrAdmin}
                      className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg text-text-main outline-none transition-all disabled:opacity-50 disabled:bg-brand-surface"
                      placeholder="Organisation Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-main">Workspace Slug</label>
                    <div className="flex items-center">
                      <span className="px-4 py-2.5 bg-brand-surface border border-brand-border border-r-0 rounded-l-lg text-text-muted text-sm">
                        audicle.ai/
                      </span>
                      <input
                        type="text"
                        value={orgForm.slug}
                        onChange={(e) => setOrgForm({ ...orgForm, slug: e.target.value })}
                        disabled={!isOwnerOrAdmin}
                        className="flex-1 px-4 py-2.5 bg-brand-bg border border-brand-border focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-r-lg text-text-main outline-none transition-all disabled:opacity-50 disabled:bg-brand-surface"
                        placeholder="organisation-slug"
                      />
                    </div>
                  </div>

                  {isOwnerOrAdmin && (
                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={isUpdatingOrg}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                      >
                        {isUpdatingOrg ? <Loader2 size={16} className="animate-spin" /> : null}
                        Save Changes
                      </button>
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* ── Members Tab ─────────────────────── */}
            {activeTab === 'members' && (
              <div className="animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-8 border-b border-brand-border">
                  <div>
                    <h2 className="text-xl font-bold text-text-main">Team Members</h2>
                    <p className="text-sm text-text-muted mt-1">
                      Manage who has access to this workspace.
                    </p>
                  </div>
                  {isOwnerOrAdmin && (
                    <div className="w-full sm:w-auto">
                      <InviteForm 
                        onInvite={inviteMember} 
                        isLoading={isInviting}
                        onPlanLimit={() => setShowUpgrade(true)}
                      />
                    </div>
                  )}
                </div>

                <div className="bg-brand-surface border border-brand-border rounded-xl overflow-hidden shadow-sm">
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
              </div>
            )}

            {/* ── Security Tab ────────────────────── */}
            {activeTab === 'security' && (
              <div className="max-w-3xl animate-in fade-in duration-300 space-y-10">
                
                {/* MFA Section */}
                <section>
                  <div className="mb-4">
                    <h2 className="text-xl font-bold text-text-main">Access Control</h2>
                    <p className="text-sm text-text-muted mt-1">Manage your account's security methods.</p>
                  </div>

                  <div className="bg-brand-surface border border-brand-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-2.5 rounded-lg shrink-0 ${user?.mfa_enabled ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-brand-bg text-text-muted border border-brand-border'}`}>
                        <Shield size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-text-main">Multi-Factor Authentication</h4>
                        <p className="text-sm text-text-muted mt-1">Require an extra security code when logging in.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => user?.mfa_enabled ? setIsMfaDisableOpen(true) : setIsMfaSetupOpen(true)}
                      className={`w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0 ${
                        user?.mfa_enabled 
                          ? 'bg-brand-surface border border-brand-border text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                      }`}
                    >
                      {user?.mfa_enabled ? 'Disable MFA' : 'Enable MFA'}
                    </button>
                  </div>
                </section>

                {/* Sessions Section */}
                <section>
                  <div className="mb-4 border-t border-brand-border pt-10">
                    <h2 className="text-xl font-bold text-text-main">Active Sessions</h2>
                    <p className="text-sm text-text-muted mt-1">Manage devices currently logged into your account.</p>
                  </div>

                  <div className="border border-brand-border rounded-xl divide-y divide-brand-border bg-brand-surface overflow-hidden">
                    {(sessions?.data || sessions?.results || []).map((s) => (
                      <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4">
                        <div className="flex items-start gap-4">
                          <div className="p-2.5 rounded-lg bg-brand-bg border border-brand-border shrink-0">
                            <Activity size={18} className={s.is_current ? 'text-emerald-500' : 'text-text-muted'} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-text-main">{s.device_name || 'Unknown Device'}</span>
                              {s.is_current && (
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-full text-[10px] font-medium border border-emerald-200 dark:border-emerald-500/20">
                                  Current
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-text-muted mt-1">
                              {s.browser} • Last active {s.last_activity ? formatDistanceToNow(new Date(s.last_activity)) + ' ago' : 'recently'}
                            </p>
                          </div>
                        </div>
                        {!s.is_current && (
                          <button 
                            onClick={() => handleRevokeSession(s.id)}
                            className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

              </div>
            )}

            {/* ── Billing Tab ─────────────────────── */}
            {activeTab === 'billing' && (
              <div className="max-w-2xl animate-in fade-in duration-300">
                <div className="mb-8 pb-8 border-b border-brand-border">
                  <h2 className="text-xl font-bold text-text-main">Billing & Plans</h2>
                  <p className="text-sm text-text-muted mt-1">Manage your subscription and billing details.</p>
                </div>

                <div className="bg-brand-surface border border-brand-border rounded-xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
                  <div>
                    <div className="text-sm font-medium text-text-muted mb-1">Current Plan</div>
                    <h3 className="text-2xl font-bold text-text-main capitalize mb-2">{currentPlan}</h3>
                    <p className="text-sm text-text-muted">
                      {currentPlan === 'enterprise' 
                        ? 'Unlimited capacity for your whole organisation.' 
                        : currentPlan === 'pro' 
                        ? 'Enhanced intelligence processing and premium features.' 
                        : 'Basic features. Upgrade to remove limits and unlock premium capabilities.'}
                    </p>
                  </div>
                  <Link 
                    to="/dashboard/billing" 
                    className="w-full md:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all text-center shadow-sm shrink-0"
                  >
                    Manage Plan
                  </Link>
                </div>
              </div>
            )}

            {/* ── Integrations Tab ────────────────── */}
            {activeTab === 'integrations' && (
              <div className="max-w-2xl animate-in fade-in duration-300">
                <div className="mb-8 pb-8 border-b border-brand-border">
                  <h2 className="text-xl font-bold text-text-main">Integrations</h2>
                  <p className="text-sm text-text-muted mt-1">Connect Audicle with your favorite tools.</p>
                </div>

                <div className="bg-brand-surface border border-brand-border rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 flex items-center justify-center p-2.5 shrink-0 shadow-sm">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" alt="Google Calendar" className="w-full h-full" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-text-main">Google Calendar</h4>
                      <p className="text-sm text-text-muted mt-1">Automatically sync your scheduled meetings for transcription.</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${calendarStatus?.data?.connected ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                        <span className="text-xs font-medium text-text-muted">
                          {calendarStatus?.data?.connected ? 'Connected' : 'Not connected'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={calendarStatus?.data?.connected ? handleDisconnectCalendar : handleConnectCalendar}
                    className={`w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0 ${
                      calendarStatus?.data?.connected 
                        ? 'bg-brand-surface border border-brand-border text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                    }`}
                  >
                    {calendarStatus?.data?.connected ? 'Disconnect' : 'Connect'}
                  </button>
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
