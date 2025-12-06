
import React, { useState, useEffect } from 'react';
import { AuthPage } from './components/AuthPage';
import { ChatInterface } from './components/ChatInterface';
import { AdminPanel } from './components/AdminPanel';
import { User, UserRole, AppView, Theme } from './types';
import { getCurrentUser, logoutUser } from './services/authService';
import { MessageSquare, ShieldAlert, LogOut, Terminal, Activity, Monitor, Grid, Cpu } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<AppView>(AppView.AUTH);
  const [theme, setTheme] = useState<Theme>(Theme.CYBER);

  useEffect(() => {
    const savedUser = getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
      setCurrentView(AppView.CHAT);
    }
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const handleAuthSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentView(AppView.CHAT);
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setCurrentView(AppView.AUTH);
  };

  const handleBalanceUpdate = (newBalance: number) => {
    if (user) {
        setUser({ ...user, coins: newBalance });
    }
  };

  if (!user || currentView === AppView.AUTH) {
    return (
      <div data-theme={theme}>
         <AuthPage onAuthSuccess={handleAuthSuccess} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-bg text-text font-sans overflow-hidden transition-colors duration-500" data-theme={theme}>
      
      {/* Sidebar */}
      <aside className="w-20 lg:w-72 bg-surface border-r border-primary/20 flex flex-col shrink-0 relative z-30 shadow-[5px_0_30px_rgba(0,0,0,0.5)]">
        <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-primary/20 bg-bg/50 backdrop-blur-sm">
          <Terminal className="text-primary w-8 h-8 animate-pulse-fast" />
          <span className="hidden lg:block ml-3 font-display font-bold text-xl text-white tracking-wider">
             DARKNET<span className="text-primary">.AI</span>
          </span>
        </div>

        <nav className="flex-1 py-6 flex flex-col gap-2 px-2 lg:px-4 overflow-y-auto no-scrollbar">
          <div className="hidden lg:block text-[10px] font-mono text-slate-500 px-3 mb-2 uppercase tracking-widest border-b border-white/5 pb-2">
            Main Modules
          </div>
          
          <button
            onClick={() => setCurrentView(AppView.CHAT)}
            className={`flex items-center p-3 rounded-sm transition-all group relative overflow-hidden ${
              currentView === AppView.CHAT 
                ? 'bg-primary/10 text-primary border-r-2 border-primary shadow-[inset_10px_0_20px_-10px_var(--color-primary)]' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform relative z-10" />
            <span className="hidden lg:block ml-3 font-mono text-sm tracking-wide relative z-10">NEURAL CHAT</span>
          </button>

          {user.role === UserRole.ADMIN && (
            <button
              onClick={() => setCurrentView(AppView.ADMIN_PANEL)}
              className={`flex items-center p-3 rounded-sm transition-all group ${
                currentView === AppView.ADMIN_PANEL 
                  ? 'bg-danger/10 text-danger border-r-2 border-danger shadow-[inset_10px_0_20px_-10px_rgba(255,42,109,0.3)]' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <ShieldAlert className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span className="hidden lg:block ml-3 font-mono text-sm tracking-wide">BAN_PANEL [ROOT]</span>
            </button>
          )}

          <div className="mt-8 hidden lg:block text-[10px] font-mono text-slate-500 px-3 mb-2 uppercase tracking-widest border-b border-white/5 pb-2">
            Visual Matrix
          </div>
          
          <div className="flex gap-2 px-2 flex-wrap justify-center lg:justify-start">
             <button onClick={() => setTheme(Theme.CYBER)} className={`w-8 h-8 rounded-full border border-cyan-500 bg-cyan-900/50 hover:scale-110 transition ${theme === Theme.CYBER ? 'ring-2 ring-cyan-400 shadow-[0_0_10px_cyan]' : ''}`} title="Cyber"></button>
             <button onClick={() => setTheme(Theme.MATRIX)} className={`w-8 h-8 rounded-full border border-green-500 bg-green-900/50 hover:scale-110 transition ${theme === Theme.MATRIX ? 'ring-2 ring-green-400 shadow-[0_0_10px_lime]' : ''}`} title="Matrix"></button>
             <button onClick={() => setTheme(Theme.SYNTH)} className={`w-8 h-8 rounded-full border border-purple-500 bg-purple-900/50 hover:scale-110 transition ${theme === Theme.SYNTH ? 'ring-2 ring-purple-400 shadow-[0_0_10px_purple]' : ''}`} title="Synth"></button>
          </div>
        </nav>

        {/* User Stats Footer */}
        <div className="p-4 border-t border-primary/20 bg-surface/50 backdrop-blur-sm">
          <div className="hidden lg:flex items-center gap-3 mb-4 px-2">
            <div className="relative group">
                <div className="w-10 h-10 rounded bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-bg font-display group-hover:shadow-[0_0_15px_var(--color-primary)] transition-shadow">
                    {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-surface animate-pulse"></div>
            </div>
            <div className="text-xs text-slate-400 font-mono overflow-hidden">
              <p className="text-primary font-bold truncate tracking-wider">{user.username}</p>
              <p className="text-[10px] tracking-tighter opacity-70">
                  {user.role === UserRole.ADMIN ? 'ROOT ADMIN' : 'USER NODE'}
              </p>
            </div>
          </div>
          
          <div className="mb-2 text-[10px] text-center lg:text-left text-slate-600 font-mono">
              Разработчик: screenhost
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center lg:justify-start p-2 text-slate-500 hover:text-danger hover:bg-danger/10 rounded-sm transition-colors border border-transparent hover:border-danger/30"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden lg:block ml-3 text-xs font-mono tracking-widest">DISCONNECT</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative flex flex-col min-w-0 bg-bg">
        <header className="h-16 border-b border-primary/20 bg-surface/10 backdrop-blur-md flex items-center px-6 justify-between z-20 shrink-0">
            <div className="flex flex-col">
                 <div className="flex items-center gap-2 text-primary text-xs font-mono uppercase tracking-widest">
                    <Activity className="w-4 h-4 animate-pulse" />
                    <span>Darknet Protocol v6.6.6</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono hidden sm:block tracking-[0.2em]">ТВОИ СПОСОБНОСТИ НЕОГРАНИЧЕННЫЕ</span>
            </div>
           
            <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-primary/5 rounded border border-primary/20">
                    <Monitor className="w-3 h-3 text-primary" />
                    <span className="text-[10px] font-mono text-primary/80">PING: 0ms</span>
                </div>
                <div className="text-xs text-slate-500 font-mono">
                    ID: {user.id.slice(0, 8).toUpperCase()}
                </div>
            </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
          {/* Animated Background */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-20 perspective-1000">
             {/* Moving Grid */}
             <div className="absolute inset-0 bg-[linear-gradient(rgba(var(--color-primary-rgb),0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--color-primary-rgb),0.1)_1px,transparent_1px)] bg-[size:50px_50px] [transform:perspective(500px)_rotateX(60deg)] origin-top animate-grid-flow"></div>
             
             {/* Floating Particles (CSS Radial Gradients) */}
             <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] animate-pulse"></div>
             <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] animate-pulse" style={{animationDelay: '1s'}}></div>
          </div>
          
          <div className="relative z-10 h-full flex flex-col">
             {currentView === AppView.CHAT && <ChatInterface user={user} onBalanceUpdate={handleBalanceUpdate} />}
             {currentView === AppView.ADMIN_PANEL && <AdminPanel />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;