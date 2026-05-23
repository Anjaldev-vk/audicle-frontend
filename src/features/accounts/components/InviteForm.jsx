import React, { useState } from 'react'
import { UserPlus, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

/**
 * Email + role invite form.
 *
 * Props:
 *  - onInvite: async (data) => void  — RTK mutation trigger
 *  - isLoading: boolean
 *  - onPlanLimit: () => void — called when backend returns 403/plan_limit_reached
 */
const InviteForm = ({ onInvite, isLoading, onPlanLimit }) => {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('member')
  const [inviteLink, setInviteLink] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return
    setInviteLink('') // reset previous

    try {
      const res = await onInvite({ email, role }).unwrap()
      const code = res?.data?.code || res?.code
      if (code) {
        const link = `${window.location.origin}/invites/${code}/accept`
        setInviteLink(link)
      }
      
      toast.success(`Invitation generated for ${email}`)
      setEmail('')
      setRole('member')
    } catch (err) {
      const code = err?.data?.code || err?.data?.data?.code
      const status = err?.status

      if (status === 403 && code === 'plan_limit_reached') {
        onPlanLimit?.()
      } else if (status === 400) {
        // DRF validation errors can come in many shapes, especially with custom exception handlers
        const d = err?.data || err
        let detail = null
        
        if (typeof d === 'string') {
          detail = d
        } else if (Array.isArray(d)) {
          detail = d[0]
        } else if (typeof d === 'object') {
          const errors = d.errors || d
          detail = errors?.non_field_errors?.[0] || errors?.email?.[0] || errors?.detail || Object.values(errors)[0]?.[0] || d.message || 'Invalid invitation request'
        }
        
        toast.error(typeof detail === 'string' ? detail : `Error: ${JSON.stringify(d)}`)
      } else if (status === 403) {
        toast.error("You don't have permission to invite members")
      } else if (status === 404) {
        toast.error('Not found')
      } else if (status === 429) {
        // Handled globally
      } else {
        toast.error(err?.data?.message || 'Failed to send invitation')
      }
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink)
    toast.success('Invite link copied to clipboard!')
  }

  return (
    <div className="w-full lg:w-auto">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full bg-brand-surface border border-brand-border p-2 rounded-2xl">
        <input
          type="email"
          placeholder="colleague@company.com"
          className="px-4 py-2.5 bg-brand-bg border border-brand-border rounded-xl text-text-main text-sm focus:border-blue-500/50 outline-none transition-all flex-grow lg:w-64"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <select 
          className="px-4 py-2.5 bg-brand-bg border border-brand-border rounded-xl text-text-main text-sm focus:border-blue-500/50 outline-none transition-all appearance-none min-w-[120px]"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold tracking-widest transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2 uppercase shrink-0"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
          {isLoading ? 'Inviting...' : 'Generate Link'}
        </button>
      </form>

      {inviteLink && (
        <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl animate-in fade-in slide-in-from-top-2">
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-2 uppercase tracking-widest">
            Send this link to the user:
          </p>
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              readOnly 
              value={inviteLink} 
              className="flex-grow px-3 py-2 bg-white dark:bg-brand-bg border border-emerald-200 dark:border-emerald-500/30 rounded-lg text-xs text-text-main outline-none font-mono"
            />
            <button 
              onClick={copyToClipboard}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-colors shrink-0"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default InviteForm
