import React, { useEffect, useState } from 'react';
import { User, UserRole } from '../types';
import { getAllUsers, toggleBanStatus } from '../services/authService';
import { Button } from './Button';
import { Ban, CheckCircle, Search, UserX, ShieldAlert, Zap, Lock, Unlock } from 'lucide-react';
import { motion } from 'framer-motion';

export const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    setUsers(getAllUsers());
  }, []);

  const handleBanToggle = (userId: string) => {
    const updated = toggleBanStatus(userId);
    setUsers(updated);
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 h-full flex flex-col bg-bg/50 backdrop-blur-sm relative z-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-primary/20 gap-4">
        <div>
          <h2 className="text-3xl font-display text-primary flex items-center gap-3 drop-shadow-[0_0_10px_var(--color-primary)]">
            <ShieldAlert className="w-8 h-8 animate-pulse" />
            GOD_MODE // PANEL
          </h2>
          <p className="text-slate-400 text-xs font-mono mt-2 tracking-[0.2em] uppercase">
            Global User Management Protocol
          </p>
        </div>
        
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-primary" />
          </div>
          <input
            type="text"
            placeholder="SEARCH_TARGET_ID..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-surface/80 border border-primary/30 rounded-sm py-2 pl-10 pr-4 text-text focus:outline-none focus:border-primary focus:shadow-[0_0_15px_var(--color-primary)] transition-all font-mono text-sm placeholder-primary/30"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
         <div className="bg-surface/40 border border-primary/20 p-4 rounded-sm">
             <div className="text-xs font-mono text-slate-500 uppercase">Total Nodes</div>
             <div className="text-2xl font-bold font-display text-white">{users.length}</div>
         </div>
         <div className="bg-surface/40 border border-danger/20 p-4 rounded-sm">
             <div className="text-xs font-mono text-slate-500 uppercase">Terminated</div>
             <div className="text-2xl font-bold font-display text-danger">{users.filter(u => u.isBanned).length}</div>
         </div>
         <div className="bg-surface/40 border border-success/20 p-4 rounded-sm">
             <div className="text-xs font-mono text-slate-500 uppercase">Active</div>
             <div className="text-2xl font-bold font-display text-success">{users.filter(u => !u.isBanned).length}</div>
         </div>
         <div className="bg-surface/40 border border-yellow-500/20 p-4 rounded-sm">
             <div className="text-xs font-mono text-slate-500 uppercase">Admin Core</div>
             <div className="text-2xl font-bold font-display text-yellow-500">{users.filter(u => u.role === UserRole.ADMIN).length}</div>
         </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto border border-primary/20 rounded-sm bg-surface/30 backdrop-blur-xl relative shadow-2xl custom-scrollbar">
        <table className="w-full text-left border-collapse relative z-10">
          <thead>
            <tr className="bg-surface/80 border-b border-primary/30 text-primary sticky top-0 z-20 backdrop-blur">
              <th className="p-4 text-[10px] font-mono uppercase tracking-[0.2em]">Node ID</th>
              <th className="p-4 text-[10px] font-mono uppercase tracking-[0.2em]">Identity</th>
              <th className="p-4 text-[10px] font-mono uppercase tracking-[0.2em]">Role</th>
              <th className="p-4 text-[10px] font-mono uppercase tracking-[0.2em]">Assets</th>
              <th className="p-4 text-[10px] font-mono uppercase tracking-[0.2em]">Status</th>
              <th className="p-4 text-[10px] font-mono uppercase tracking-[0.2em] text-right">Execute</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => (
              <motion.tr 
                key={user.id} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-white/5 hover:bg-white/5 transition-colors group"
              >
                <td className="p-4 text-slate-500 font-mono text-xs">{user.id}</td>
                <td className="p-4 text-white font-bold font-display tracking-wide group-hover:text-primary transition-colors">
                  {user.username}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-[10px] font-mono border rounded-sm ${
                    user.role === UserRole.ADMIN 
                      ? 'border-primary text-primary bg-primary/10 shadow-[0_0_10px_var(--color-primary)]' 
                      : 'border-slate-600 text-slate-400'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4 font-mono text-yellow-400">
                   <div className="flex items-center gap-2">
                     <Zap size={12} />
                     {user.coins.toLocaleString()}
                   </div>
                </td>
                <td className="p-4">
                  {user.isBanned ? (
                    <span className="flex items-center gap-2 text-danger text-xs font-bold font-mono bg-danger/10 px-2 py-1 rounded-sm border border-danger/20 w-fit animate-pulse">
                      <Lock className="w-3 h-3" /> LOCKED
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-success text-xs font-bold font-mono bg-success/10 px-2 py-1 rounded-sm border border-success/20 w-fit">
                      <CheckCircle className="w-3 h-3" /> ACTIVE
                    </span>
                  )}
                </td>
                <td className="p-4 text-right">
                  {user.role !== UserRole.ADMIN && (
                    <Button 
                      variant={user.isBanned ? 'primary' : 'danger'} 
                      onClick={() => handleBanToggle(user.id)}
                      className="ml-auto text-[10px] py-1 px-3 h-8 tracking-widest w-32"
                    >
                      {user.isBanned ? (
                         <span className="flex items-center justify-center gap-2"><Unlock size={12}/> RESTORE</span>
                      ) : (
                         <span className="flex items-center justify-center gap-2"><Ban size={12}/> TERMINATE</span>
                      )}
                    </Button>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        
        {filteredUsers.length === 0 && (
          <div className="p-20 text-center text-slate-500 font-mono text-sm tracking-widest">
            // NO TARGETS DETECTED IN SECTOR
          </div>
        )}
      </div>
    </div>
  );
};