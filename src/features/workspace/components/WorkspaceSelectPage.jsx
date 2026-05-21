import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useGetWorkspacesQuery, useCreateWorkspaceMutation } from '../api/workspaceApi'
import { switchWorkspace, setWorkspaces } from '../slices/workspaceSlice'
import { Building2, User, Loader2, Plus, LogOut, X, Crown, AlertTriangle } from 'lucide-react'
import { logoutUser } from '../../auth/slices/authSlice'
import { clearWorkspace } from '../slices/workspaceSlice'
import { baseApi } from '../../../services/baseApi'
import { toast } from 'react-hot-toast'
import Skeleton from '../../../components/shared/Skeleton'

// ── Plan limits ──────────────────────────────────
const PLAN_LIMITS = {
  free:       { workspaces: 2, members: 3 },
  pro:        { workspaces: 4, members: 20 },
  enterprise: { workspaces: Infinity, members: Infinity },
}

export default function WorkspaceSelectPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { data: response, isLoading } = useGetWorkspacesQuery()
  const [createWorkspace, { isLoading: isCreating }] = useCreateWorkspaceMutation()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [newOrg, setNewOrg] = useState({ name: '', slug: '' })

  const workspaces = useMemo(() => response?.data?.results || [], [response])

  useEffect(() => {
    if (workspaces.length) {
      dispatch(setWorkspaces(workspaces))
    }
  }, [workspaces, dispatch])

  // Derive current plan from any workspace the user owns
  const userPlan = workspaces.find(w => w.role === 'owner')?.plan || 'free'
  const limit = PLAN_LIMITS[userPlan] || PLAN_LIMITS.free
  const canCreate = workspaces.length < limit.workspaces

  const handleSelect = (ws) => {
    const payload = {
      id: ws.id ?? null,
      name: ws.name,
      type: ws.type,
      role: ws.role ?? null,
      plan: ws.plan ?? 'free',
    }
    dispatch(switchWorkspace(payload))
    dispatch(baseApi.util.resetApiState())
    navigate('/dashboard')
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await createWorkspace(newOrg).unwrap()
      toast.success('Organisation created!')
      setIsModalOpen(false)
      setNewOrg({ name: '', slug: '' })
    } catch (err) {
      const code = err?.data?.code || err?.data?.data?.code
      if (err?.status === 403 && code === 'plan_limit_reached') {
        setIsModalOpen(false)
        setShowUpgrade(true)
      } else {
        toast.error(err?.data?.message || err?.data?.detail || 'Failed to create workspace')
      }
    }
  }

  const handleLogout = () => {
    dispatch(logoutUser())
    dispatch(clearWorkspace())
    navigate('/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-bg text-text-main flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background decoration */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-500/5 rounded-full blur-[120px]" />
        </div>

        {/* Header Skeleton */}
        <div className="max-w-4xl w-full text-center mb-12">
          <div className="flex justify-center mb-4">
            <Skeleton className="w-64 h-10 rounded-2xl" />
          </div>
          <div className="flex justify-center">
            <Skeleton className="w-48 h-4 rounded-lg" />
          </div>
        </div>

        {/* Workspace Grid Skeleton */}
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-brand-surface border border-brand-border p-8 rounded-3xl">
              <div className="flex items-center space-x-6">
                <Skeleton className="w-16 h-16 rounded-2xl shrink-0" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="w-3/4 h-6 rounded-lg" />
                  <Skeleton className="w-1/2 h-4 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
          <div className="border-2 border-dashed border-brand-border/40 p-8 rounded-3xl flex items-center justify-center space-x-3">
            <Skeleton className="w-6 h-6 rounded-md" />
            <Skeleton className="w-36 h-6 rounded-lg" />
          </div>
        </div>

        {/* Footer Skeleton */}
        <div className="mt-12">
          <Skeleton className="w-20 h-4 rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-bg text-text-main flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <div className="max-w-4xl w-full text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent tracking-tight">
          Select Workspace
        </h1>
        <p className="text-text-muted text-sm font-bold uppercase tracking-widest">
          Choose a workspace to continue
        </p>
      </div>

      {/* Workspace Grid */}
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
        {workspaces.map((ws) => (
          <button
            key={ws.id || 'personal'}
            onClick={() => handleSelect(ws)}
            className="group relative bg-brand-surface border border-brand-border p-8 rounded-3xl text-left transition-all duration-500 hover:border-indigo-500/50 hover:bg-brand-highlight hover:shadow-[0_20px_50px_rgba(79,70,229,0.1)]"
          >
            <div className="flex items-center space-x-6">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 border ${
                ws.type === 'organisation'
                  ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                  : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
              }`}>
                {ws.type === 'organisation' ? <Building2 size={28} /> : <User size={28} />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-black text-text-main group-hover:text-indigo-500 transition-colors truncate">
                  {ws.name}
                </h3>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">
                  {ws.type === 'organisation'
                    ? `${ws.role} • Organisation`
                    : 'Personal Account'}
                </p>
                {ws.plan && ws.plan !== 'free' && (
                  <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded-md text-[8px] font-black uppercase tracking-widest border border-amber-500/20">
                    <Crown size={10} /> {ws.plan}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}

        {/* Create new workspace */}
        <button
          className="bg-transparent border-2 border-dashed border-brand-border p-8 rounded-3xl text-left transition-all duration-300 hover:border-indigo-500/50 hover:bg-indigo-500/5 flex items-center justify-center space-x-3 text-text-muted hover:text-indigo-500"
          onClick={() => {
            if (!canCreate) {
              setShowUpgrade(true)
            } else {
              setIsModalOpen(true)
            }
          }}
        >
          <Plus size={28} />
          <span className="text-lg font-bold">Create Organisation</span>
        </button>
      </div>

      {/* Footer */}
      <div className="mt-12 flex items-center space-x-6 animate-in fade-in duration-700 delay-200">
        <button 
          onClick={handleLogout}
          className="flex items-center space-x-2 text-text-muted hover:text-text-main transition-colors text-xs font-bold uppercase tracking-widest"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>

      {/* ── Create Organisation Modal ────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-brand-surface border border-brand-border rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-text-main">Create Organisation</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-text-main transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">
                  Organisation Name
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Acme Corp"
                  className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-text-main focus:border-indigo-500/50 outline-none transition-all"
                  value={newOrg.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
                    setNewOrg({ name, slug });
                  }}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">
                  Workspace URL
                </label>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    required
                    placeholder="acme-corp"
                    className="flex-1 bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-text-main focus:border-indigo-500/50 outline-none transition-all"
                    value={newOrg.slug}
                    onChange={(e) => setNewOrg({ ...newOrg, slug: e.target.value })}
                  />
                  <span className="text-text-muted font-bold text-sm">.audicle.ai</span>
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isCreating}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
              >
                {isCreating ? 'CREATING...' : 'CREATE ORGANISATION'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Upgrade Modal ────────────────────────── */}
      {showUpgrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowUpgrade(false)} />
          <div className="relative bg-brand-surface border border-brand-border rounded-3xl p-10 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in duration-300 text-center">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} className="text-amber-500" />
            </div>
            <h2 className="text-2xl font-black text-text-main mb-3">Plan Limit Reached</h2>
            <p className="text-text-muted font-bold text-sm mb-2">
              Your <span className="text-amber-500 uppercase">{userPlan}</span> plan allows a maximum of{' '}
              <span className="text-text-main">{limit.workspaces}</span> workspaces.
            </p>
            <p className="text-text-muted text-xs mb-8">Upgrade your plan to create more workspaces and unlock unlimited members.</p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-brand-bg border border-brand-border rounded-2xl p-6 text-left">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Pro</p>
                <p className="text-2xl font-black text-text-main">4</p>
                <p className="text-[10px] text-text-muted font-bold">Workspaces</p>
                <p className="text-[10px] text-text-muted font-bold mt-1">20 members each</p>
              </div>
              <div className="bg-brand-bg border border-indigo-500/20 rounded-2xl p-6 text-left">
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2">Enterprise</p>
                <p className="text-2xl font-black text-text-main">∞</p>
                <p className="text-[10px] text-text-muted font-bold">Workspaces</p>
                <p className="text-[10px] text-text-muted font-bold mt-1">Unlimited members</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowUpgrade(false)}
                className="flex-1 py-3 bg-brand-bg border border-brand-border rounded-xl text-text-muted font-black text-xs uppercase tracking-widest hover:bg-brand-highlight transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowUpgrade(false); navigate('/dashboard/billing') }}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all"
              >
                Upgrade Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
