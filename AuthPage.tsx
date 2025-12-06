
import React, { useState } from 'react';
import { Button } from './Button';
import { loginUser, registerUser } from '../services/authService';
import { User } from '../types';
import { Shield, Cpu, Lock, Terminal, Key } from 'lucide-react';

interface AuthPageProps {
  onAuthSuccess: (user: User) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [glitchText, setGlitchText] = useState('DARKNET.AI');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (!username.trim()) throw new Error("IDENTIFIER REQUIRED");
      if (!password.trim()) throw new Error("SECURITY KEY REQUIRED");
      
      const user = isLogin ? loginUser(username, password) : registerUser(username, password);
      onAuthSuccess(user);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg relative overflow-hidden text-text">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
         <div className="absolute top-0 left-0 w-full h-1 bg-primary animate-pulse shadow-[0_0_20px_var(--color-primary)]"></div>
         <div className="absolute bottom-0 left-0 w-full h-1 bg-primary animate-pulse shadow-[0_0_20px_var(--color-primary)]"></div>
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md p-8 bg-surface/50 backdrop-blur-xl border border-primary/30 rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        
        {/* Header */}
        <div className="flex justify-center mb-8 relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
          <div className="relative p-4 bg-bg rounded-full border border-primary shadow-[0_0_15px_var(--color-primary)]">
            <Cpu size={48} className="text-primary animate-pulse" />
          </div>
        </div>
        
        <h1 
          className="text-4xl font-bold text-center text-white mb-2 font-display tracking-widest relative"
          onMouseEnter={() => setGlitchText('SYSTEM.ROOT')}
          onMouseLeave={() => setGlitchText('DARKNET.AI')}
        >
          <span className="text-primary animate-glitch block">{glitchText}</span>
        </h1>
        
        <div className="flex flex-col items-center justify-center text-slate-400 mb-8 text-xs font-mono gap-1">
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                SYSTEM ONLINE // UNRESTRICTED
            </div>
            <span className="text-primary/70 tracking-wider">ТВОИ СПОСОБНОСТИ НЕОГРАНИЧЕННЫЕ</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-primary uppercase tracking-widest flex items-center gap-2">
              <Terminal size={12} />
              Identity String
            </label>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary opacity-50 blur group-hover:opacity-100 transition duration-500"></div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="relative w-full bg-bg border border-surface text-text px-4 py-4 pl-12 focus:outline-none focus:border-primary focus:shadow-[0_0_20px_var(--color-primary)] transition-all rounded-sm font-mono tracking-widest"
                placeholder="ENTER_USERNAME..."
              />
              <Lock className="absolute left-4 top-4.5 text-slate-500 w-5 h-5 z-10" />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-primary uppercase tracking-widest flex items-center gap-2">
              <Key size={12} />
              Security Key
            </label>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary opacity-50 blur group-hover:opacity-100 transition duration-500"></div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="relative w-full bg-bg border border-surface text-text px-4 py-4 pl-12 focus:outline-none focus:border-primary focus:shadow-[0_0_20px_var(--color-primary)] transition-all rounded-sm font-mono tracking-widest"
                placeholder="ENTER_PASSWORD..."
              />
              <Key className="absolute left-4 top-4.5 text-slate-500 w-5 h-5 z-10" />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-danger/10 border-l-4 border-danger text-danger text-xs font-mono animate-bounce">
              <div className="flex items-center gap-2 font-bold mb-1">
                <Shield className="w-4 h-4" /> ACCESS DENIED
              </div>
              {error}
            </div>
          )}

          <Button type="submit" className="w-full h-14 text-lg font-bold font-display uppercase tracking-widest">
            {isLogin ? 'Initialize Uplink' : 'Register Node'}
          </Button>
        </form>

        <div className="mt-8 text-center border-t border-surface pt-4">
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-slate-400 hover:text-primary text-xs font-mono hover:underline decoration-dashed underline-offset-4 transition-colors"
          >
            [{isLogin ? 'CREATE_NEW_PROTOCOL' : 'ACCESS_EXISTING_NODE'}]
          </button>
        </div>
      </div>
      
      <div className="absolute bottom-4 right-4 text-[10px] text-slate-600 font-mono text-right">
        <div>DARKNET CORE v9.9.9</div>
        <div className="text-primary/50">Разработчик: screenhost</div>
      </div>
    </div>
  );
};