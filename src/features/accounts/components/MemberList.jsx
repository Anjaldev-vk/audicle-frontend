import React from 'react';
import { Shield, User, Trash2 } from 'lucide-react';

const MemberList = ({ members, currentUser, isAdmin, onRemove }) => {
  return (
    <div className="bg-brand-surface border border-brand-border rounded-3xl overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-brand-border bg-white/[0.02]">
              <th className="px-8 py-5 text-[0.65rem] font-bold text-gray-500 uppercase tracking-widest">Member</th>
              <th className="px-8 py-5 text-[0.65rem] font-bold text-gray-500 uppercase tracking-widest">Role</th>
              <th className="px-8 py-5 text-[0.65rem] font-bold text-gray-500 uppercase tracking-widest">Status</th>
              <th className="px-8 py-5 text-right text-[0.65rem] font-bold text-gray-500 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-white/[0.01] transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/20 flex items-center justify-center text-sm font-bold text-blue-400">
                      {member.first_name?.[0]}{member.last_name?.[0]}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{member.first_name} {member.last_name}</p>
                      <p className="text-gray-500 text-xs">{member.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1 rounded-full text-[0.6rem] font-bold tracking-widest uppercase border flex items-center gap-1.5 w-fit ${member.org_role === 'owner' ? 'border-amber-500/20 text-amber-500 bg-amber-500/5' : member.org_role === 'admin' ? 'border-purple-500/20 text-purple-400 bg-purple-500/5' : 'border-gray-800 text-gray-500'}`}>
                    {member.org_role === 'owner' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                    {member.org_role}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${member.is_verified ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]'}`} />
                    <span className="text-xs text-gray-500 font-medium">{member.is_verified ? 'Active' : 'Pending'}</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  {isAdmin && member.id !== currentUser?.id && member.org_role !== 'owner' ? (
                    <button 
                      onClick={() => onRemove(member.id, `${member.first_name} ${member.last_name}`)}
                      className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                      title="Remove Member"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  ) : (
                    <span className="text-[0.6rem] text-gray-700 font-bold uppercase tracking-widest">Protected</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MemberList;
