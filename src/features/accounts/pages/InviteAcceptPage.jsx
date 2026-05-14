import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useVerifyInviteQuery, useAcceptInviteMutation } from '../../accounts/api/accountsApi'
import { useSelector } from 'react-redux'
import { selectIsLoggedIn } from '../../auth/slices/authSlice'
import { toast } from 'react-hot-toast'
import { Building2, Loader2, CheckCircle, XCircle, UserPlus } from 'lucide-react'

export default function InviteAcceptPage() {
  const { code } = useParams()
  const navigate = useNavigate()
  const isLoggedIn = useSelector(selectIsLoggedIn)

  const { data: verifyData, isLoading: isVerifying, error: verifyError } = useVerifyInviteQuery(code, {
    skip: !code,
  })
  const [acceptInvite, { isLoading: isAccepting }] = useAcceptInviteMutation()

  const invite = verifyData?.data || verifyData || null

  const handleAccept = async () => {
    if (!isLoggedIn) {
      // Redirect to register with invite context
      navigate(`/register?type=join_org&code=${code}&email=${invite?.email || ''}`)
      return
    }

    try {
      await acceptInvite(code).unwrap()
      toast.success('Invitation accepted! Redirecting to workspaces…')
      setTimeout(() => navigate('/workspaces'), 1500)
    } catch (err) {
      if (err?.status === 403) {
        toast.error("You don't have permission to accept this invitation")
      } else if (err?.status === 404) {
        toast.error('Invitation not found or expired')
      } else {
        toast.error(err?.data?.message || 'Failed to accept invitation')
      }
    }
  }

  // Loading state
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-text-muted text-sm font-bold uppercase tracking-widest">Verifying invitation…</p>
        </div>
      </div>
    )
  }

  // Error state
  if (verifyError) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-brand-surface border border-brand-border rounded-3xl p-10 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            <XCircle size={32} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-text-main mb-3">Invalid Invitation</h2>
          <p className="text-text-muted text-sm font-bold mb-8">
            {verifyError?.data?.message || verifyError?.data?.detail || 'This invitation link is invalid, expired, or has already been used.'}
          </p>
          <button
            onClick={() => navigate(isLoggedIn ? '/workspaces' : '/login')}
            className="px-8 py-3 bg-brand-highlight border border-brand-border rounded-xl text-text-main text-xs font-black uppercase tracking-widest hover:bg-brand-bg transition-all"
          >
            {isLoggedIn ? 'Go to Workspaces' : 'Go to Login'}
          </button>
        </div>
      </div>
    )
  }

  // Success state — show invitation details
  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-md w-full bg-brand-surface border border-brand-border rounded-3xl p-10 shadow-2xl animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-6">
            <Building2 size={36} className="text-indigo-500" />
          </div>
          <h2 className="text-2xl font-black text-text-main mb-2">You're Invited</h2>
          <p className="text-text-muted text-sm font-bold">
            You've been invited to join an organisation on Audicle.
          </p>
        </div>

        <div className="bg-brand-bg border border-brand-border rounded-2xl p-6 mb-8 space-y-4">
          {invite?.organisation_name && (
            <div>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Organisation</p>
              <p className="text-lg font-black text-text-main">{invite.organisation_name}</p>
            </div>
          )}
          {invite?.invited_by && (
            <div>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Invited By</p>
              <p className="text-sm font-bold text-text-main">{invite.invited_by}</p>
            </div>
          )}
          {invite?.role && (
            <div>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Role</p>
              <p className="text-sm font-bold text-text-main capitalize">{invite.role}</p>
            </div>
          )}
          {invite?.email && (
            <div>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Email</p>
              <p className="text-sm font-bold text-text-main">{invite.email}</p>
            </div>
          )}
        </div>

        <button
          onClick={handleAccept}
          disabled={isAccepting}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isAccepting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Accepting…
            </>
          ) : (
            <>
              <UserPlus size={16} />
              {isLoggedIn ? 'Accept Invitation' : 'Create Account & Join'}
            </>
          )}
        </button>

        {!isLoggedIn && (
          <p className="text-center text-text-muted text-xs font-bold mt-4">
            Already have an account?{' '}
            <button onClick={() => navigate('/login')} className="text-indigo-500 hover:underline">
              Login first
            </button>
          </p>
        )}
      </div>
    </div>
  )
}
