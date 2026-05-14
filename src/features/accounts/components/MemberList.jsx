import React from 'react'
import { Shield, ShieldCheck, User, Trash2 } from 'lucide-react'

const ROLE_STYLES = {
  owner: {
    badge: 'border-purple-500/20 text-purple-400 bg-purple-500/5',
    icon: ShieldCheck,
  },
  admin: {
    badge: 'border-blue-500/20 text-blue-400 bg-blue-500/5',
    icon: Shield,
  },
  member: {
    badge: 'border-gray-600 text-gray-500 bg-white/[0.02]',
    icon: User,
  },
}

/**
 * Renders the organisation member table.
 *
 * Props:
 *  - members: array of membership objects from the API
 *  - currentUserId: ID of the currently logged-in user
 *  - currentUserRole: 'owner' | 'admin' | 'member'
 *  - onRemove: (member) => void
 */
const MemberList = ({ members, currentUserId, currentUserRole, onRemove }) => {
  const canManage = currentUserRole === 'owner' || currentUserRole === 'admin'

  if (!members?.length) {
    return (
      <div className="text-center py-16 text-text-muted">
        <User size={40} className="mx-auto mb-4 opacity-30" />
        <p className="text-sm font-bold">No members yet</p>
        <p className="text-xs mt-1">Invite your team to get started.</p>
      </div>
    )
  }

  return (
    <div className="bg-brand-surface border border-brand-border rounded-3xl overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-brand-border bg-white/[0.02]">
              <th className="px-8 py-5 text-[0.65rem] font-bold text-gray-500 uppercase tracking-widest">Member</th>
              <th className="px-8 py-5 text-[0.65rem] font-bold text-gray-500 uppercase tracking-widest">Role</th>
              <th className="px-8 py-5 text-[0.65rem] font-bold text-gray-500 uppercase tracking-widest">Status</th>
              {canManage && (
                <th className="px-8 py-5 text-right text-[0.65rem] font-bold text-gray-500 uppercase tracking-widest">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {members.map((member) => {
              // Support both flat (member.email) and nested (member.user.email) shapes
              const userData = member.user || member
              const role = member.org_role || member.role || 'member'
              const roleStyle = ROLE_STYLES[role] || ROLE_STYLES.member
              const RoleIcon = roleStyle.icon
              const memberId = member.id || userData.id
              const isCurrentUser = memberId === currentUserId || userData.id === currentUserId
              const isOwner = role === 'owner'

              // Owners can remove admins & members. Admins can remove members only.
              const canRemoveThis = canManage && !isCurrentUser && !isOwner && (
                currentUserRole === 'owner' || role === 'member'
              )

              return (
                <tr key={memberId} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/20 flex items-center justify-center text-sm font-bold text-blue-400 uppercase">
                        {userData.first_name?.[0]}{userData.last_name?.[0]}
                      </div>
                      <div>
                        <p className="text-text-main font-medium text-sm">
                          {userData.first_name} {userData.last_name}
                          {isCurrentUser && (
                            <span className="ml-2 text-[9px] text-brand-primary font-black uppercase tracking-widest">(You)</span>
                          )}
                        </p>
                        <p className="text-text-muted text-xs">{userData.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.6rem] font-bold tracking-widest uppercase border ${roleStyle.badge}`}>
                      <RoleIcon className="w-3 h-3" />
                      {role}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        userData.is_verified !== false
                          ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]'
                          : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                      }`} />
                      <span className="text-xs text-text-muted font-medium">
                        {userData.is_verified !== false ? 'Active' : 'Pending'}
                      </span>
                    </div>
                  </td>
                  {canManage && (
                    <td className="px-8 py-6 text-right">
                      {canRemoveThis ? (
                        <button 
                          onClick={() => onRemove(member)}
                          className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          title="Remove Member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[0.6rem] text-gray-700 font-bold uppercase tracking-widest">
                          {isCurrentUser ? 'You' : 'Protected'}
                        </span>
                      )}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default MemberList
