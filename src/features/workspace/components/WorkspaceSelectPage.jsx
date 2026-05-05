import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useGetWorkspacesQuery, useCreateWorkspaceMutation } from '../api/workspaceApi'
import { setActiveWorkspaceId, setWorkspaces } from '../slices/workspaceSlice'
import { LayoutGrid, Plus, LogOut, Building2, User, Loader2, X } from 'lucide-react'
import { logoutUser } from '../../auth/slices/authSlice'
import { baseApi } from '../../../services/baseApi'
import { toast } from 'react-hot-toast'

export default function WorkspaceSelectPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { data: response, isLoading } = useGetWorkspacesQuery()
  const [createWorkspace, { isLoading: isCreating }] = useCreateWorkspaceMutation()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newOrg, setNewOrg] = useState({ name: '', slug: '' })

  useEffect(() => {
    if (response?.data?.results) {
      dispatch(setWorkspaces(response.data.results))
    }
  }, [response, dispatch])

  const handleSelect = (id, type) => {
    // Fallback for null ID in personal workspace (handles cache transition)
    const finalId = (id === null && type === 'personal') ? 'personal' : id
    
    dispatch(baseApi.util.resetApiState())
    dispatch(setActiveWorkspaceId(finalId))
    navigate('/dashboard')
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await createWorkspace(newOrg).unwrap()
      toast.success('Workspace created!')
      setIsModalOpen(false)
      setNewOrg({ name: '', slug: '' })
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create workspace')
    }
  }

  const handleLogout = () => {
    dispatch(logoutUser())
    navigate('/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
      </div>
    )
  }

  const workspaces = response?.data?.results || []

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Welcome back
        </h1>
        <p className="text-gray-400 text-lg font-medium">
          Select a workspace to continue to your dashboard
        </p>
      </div>

      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-6">
        {workspaces.map((ws) => (
          <button
            key={ws.id}
            onClick={() => handleSelect(ws.id, ws.type)}
            className="group relative bg-[#111] border border-white/5 p-8 rounded-3xl text-left transition-all duration-500 hover:border-indigo-500/50 hover:bg-white/[0.02] hover:shadow-[0_20px_50px_rgba(79,70,229,0.1)]"
          >
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform border border-indigo-500/20">
                {ws.organisation ? <Building2 size={28} /> : <User size={28} />}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                  {ws.name}
                </h3>
                <p className="text-xs font-bold text-gray-500 group-hover:text-gray-400 uppercase tracking-widest mt-1">
                  {ws.organisation ? `${ws.role} • Organisation` : 'Personal Account'}
                </p>
              </div>
            </div>
          </button>
        ))}

        <button
          className="bg-transparent border-2 border-dashed border-white/5 p-8 rounded-3xl text-left transition-all duration-300 hover:border-indigo-500/50 hover:bg-indigo-500/5 flex items-center justify-center space-x-3 text-gray-500 hover:text-indigo-400"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={28} />
          <span className="text-lg font-bold">Create new workspace</span>
        </button>
      </div>

      <div className="mt-12 flex items-center space-x-6">
        <button 
          onClick={handleLogout}
          className="flex items-center space-x-2 text-gray-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-[#111] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Create Workspace</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Workspace Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Acme Corp"
                  className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-white focus:border-indigo-500/50 outline-none transition-all"
                  value={newOrg.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
                    setNewOrg({ name, slug });
                  }}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Workspace URL</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    required
                    placeholder="acme-corp"
                    className="flex-1 bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-white focus:border-indigo-500/50 outline-none transition-all"
                    value={newOrg.slug}
                    onChange={(e) => setNewOrg({ ...newOrg, slug: e.target.value })}
                  />
                  <span className="text-gray-500 font-bold text-sm">.audicle.ai</span>
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isCreating}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
              >
                {isCreating ? 'CREATING...' : 'CREATE WORKSPACE'}
              </button>
            </form>
          </div>
        </div>
      )}
      
      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-500/5 rounded-full blur-[120px]"></div>
      </div>
    </div>
  )
}
