import React from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, X } from 'lucide-react'

const PLAN_LIMITS = {
  free:       { workspaces: 2, members: 3 },
  pro:        { workspaces: 4, members: 20 },
  enterprise: { workspaces: Infinity, members: Infinity },
}

/**
 * Reusable upgrade modal. Shows current plan limits and upgrade options.
 *
 * Props:
 *  - isOpen: boolean
 *  - onClose: () => void
 *  - currentPlan: 'free' | 'pro' | 'enterprise'
 *  - limitType: 'workspaces' | 'members' — what the user tried to exceed
 */
export default function UpgradeModal({ isOpen, onClose, currentPlan = 'free', limitType = 'members' }) {
  const navigate = useNavigate()
  if (!isOpen) return null

  const limit = PLAN_LIMITS[currentPlan] || PLAN_LIMITS.free
  const limitValue = limitType === 'workspaces' ? limit.workspaces : limit.members

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center md:p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 hidden md:block" onClick={onClose} />
      <div className="relative bg-brand-surface md:border border-brand-border rounded-none md:rounded-3xl p-6 md:p-10 max-w-lg w-full h-full md:h-auto overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-full md:slide-in-from-bottom-0 md:zoom-in duration-300 text-center flex flex-col justify-center">
        <button onClick={onClose} className="absolute top-6 right-6 text-text-muted hover:text-text-main transition-colors">
          <X size={18} />
        </button>

        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={32} className="text-amber-500" />
        </div>
        <h2 className="text-2xl font-black text-text-main mb-3">Plan Limit Reached</h2>
        <p className="text-text-muted font-bold text-sm mb-2">
          Your <span className="text-amber-500 uppercase">{currentPlan}</span> plan allows a maximum of{' '}
          <span className="text-text-main">{limitValue === Infinity ? 'unlimited' : limitValue}</span> {limitType}.
        </p>
        <p className="text-text-muted text-xs mb-8">Upgrade your plan to unlock more capacity.</p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-brand-bg border border-brand-border rounded-2xl p-6 text-left">
            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Pro</p>
            <p className="text-2xl font-black text-text-main">{limitType === 'workspaces' ? '4' : '20'}</p>
            <p className="text-[10px] text-text-muted font-bold capitalize">{limitType}</p>
          </div>
          <div className="bg-brand-bg border border-indigo-500/20 rounded-2xl p-6 text-left">
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2">Enterprise</p>
            <p className="text-2xl font-black text-text-main">∞</p>
            <p className="text-[10px] text-text-muted font-bold capitalize">{limitType}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-brand-bg border border-brand-border rounded-xl text-text-muted font-black text-xs uppercase tracking-widest hover:bg-brand-highlight transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => { onClose(); navigate('/dashboard/billing') }}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all"
          >
            Upgrade Plan
          </button>
        </div>
      </div>
    </div>
  )
}
