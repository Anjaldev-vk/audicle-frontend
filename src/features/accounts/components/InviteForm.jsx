import React, { useState } from 'react';
import { UserPlus, Loader2 } from 'lucide-react';

const InviteForm = ({ onInvite, isLoading }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    onInvite({ email, role });
    setEmail('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto bg-brand-surface border border-brand-border p-2 rounded-2xl">
      <input
        type="email"
        placeholder="colleague@company.com"
        className="px-4 py-2.5 bg-brand-bg border border-brand-border rounded-xl text-white text-sm focus:border-blue-500/50 outline-none transition-all flex-grow lg:w-64"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <select 
        className="px-4 py-2.5 bg-brand-bg border border-brand-border rounded-xl text-white text-sm focus:border-blue-500/50 outline-none transition-all appearance-none min-w-[120px]"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="member">Member</option>
        <option value="admin">Admin</option>
      </select>
      <button
        type="submit"
        disabled={isLoading}
        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold tracking-widest transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
        {isLoading ? 'INVITING...' : 'INVITE'}
      </button>
    </form>
  );
};

export default InviteForm;
