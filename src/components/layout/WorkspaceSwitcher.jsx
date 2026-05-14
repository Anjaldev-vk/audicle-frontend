import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  selectActiveWorkspace,
  selectWorkspaces,
  switchWorkspace,
} from '../../features/workspace/slices/workspaceSlice'
import { useGetWorkspacesQuery } from '../../features/workspace/api/workspaceApi'
import { baseApi } from '../../services/baseApi'
import { Building2, User, ChevronDown, Check, Plus } from 'lucide-react'

export default function WorkspaceSwitcher() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const activeWorkspace = useSelector(selectActiveWorkspace)
  const storedWorkspaces = useSelector(selectWorkspaces)

  // Keep workspace list fresh
  const { data: response } = useGetWorkspacesQuery()
  const workspaces = response?.data?.results || storedWorkspaces || []

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSwitch = (ws) => {
    const payload = {
      id: ws.id ?? null,
      name: ws.name,
      type: ws.type,
      role: ws.role ?? null,
      plan: ws.plan ?? 'free',
    }
    // Reset all cached API data so queries refetch for new workspace
    dispatch(baseApi.util.resetApiState())
    dispatch(switchWorkspace(payload))
    setIsOpen(false)
    navigate('/dashboard')
  }

  const displayName = activeWorkspace?.name || 'Personal'
  const displayType = activeWorkspace?.type || 'personal'

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2.5 bg-brand-highlight border border-brand-border rounded-xl hover:border-brand-primary/30 transition-all group w-full"
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          displayType === 'organisation'
            ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'
            : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
        }`}>
          {displayType === 'organisation' ? <Building2 size={14} /> : <User size={14} />}
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-[11px] font-black text-text-main truncate uppercase tracking-widest leading-none">
            {displayName}
          </p>
          <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mt-0.5">
            {activeWorkspace?.role || 'owner'} • {activeWorkspace?.plan || 'free'}
          </p>
        </div>
        <ChevronDown
          size={14}
          className={`text-text-muted transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-brand-surface border border-brand-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 max-h-[280px] overflow-y-auto custom-scrollbar">
            {workspaces.map((ws) => {
              const isActive =
                (ws.id === activeWorkspace?.id) ||
                (ws.type === 'personal' && activeWorkspace?.type === 'personal')
              return (
                <button
                  key={ws.id || 'personal'}
                  onClick={() => handleSwitch(ws)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left group/item ${
                    isActive
                      ? 'bg-brand-primary/10 border border-brand-primary/20'
                      : 'hover:bg-brand-highlight border border-transparent'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    ws.type === 'organisation'
                      ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'
                      : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                  }`}>
                    {ws.type === 'organisation' ? <Building2 size={14} /> : <User size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-text-main truncate uppercase tracking-widest">
                      {ws.name}
                    </p>
                    <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest mt-0.5">
                      {ws.type === 'organisation' ? `${ws.role} • Organisation` : 'Personal'}
                    </p>
                  </div>
                  {isActive && <Check size={14} className="text-brand-primary shrink-0" />}
                </button>
              )
            })}
          </div>

          {/* Create new */}
          <div className="border-t border-brand-border p-2">
            <button
              onClick={() => { setIsOpen(false); navigate('/workspaces') }}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-text-muted hover:text-brand-primary hover:bg-brand-highlight transition-all"
            >
              <Plus size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Manage Workspaces
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
