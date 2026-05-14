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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return

    try {
      await onInvite({ email, role }).unwrap()
      toast.success(`Invitation sent to ${email}`)
      setEmail('')
      setRole('member')
    } catch (err) {
      const code = err?.data?.code || err?.data?.data?.code
      const status = err?.status

      if (status === 403 && code === 'plan_limit_reached') {
        onPlanLimit?.()
      } else if (status === 400) {
        // Validation errors — show the first field error
        const detail = err?.data?.detail || err?.data?.message || err?.data?.data?.email?.[0]
        toast.error(detail || 'Invalid invitation request')
      } else if (status === 403) {
        toast.error("You don't have permission to invite members")
      } else if (status === 404) {
        toast.error('Not found')
      } else if (status === 429) {
        // RateLimitToast handles this globally
      } else {
        toast.error(err?.data?.message || 'Failed to send invitation')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto bg-brand-surface border border-brand-border p-2 rounded-2xl">
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
        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold tracking-widest transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2 uppercase"
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
        {isLoading ? 'Inviting...' : 'Invite'}
      </button>
    </form>
  )
}

export default InviteForm
