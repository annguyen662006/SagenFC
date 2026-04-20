/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useAppStore } from './store';
import { Leaderboard } from './components/Leaderboard';
import { DataEntry } from './components/DataEntry';
import { Players } from './components/Players';
import { Matches } from './components/Matches';
import { AdminPanel } from './components/AdminPanel';
import { Login } from './components/Login';
import { Menu, Moon, Sun, Monitor, LogOut } from 'lucide-react';
import { useTheme } from './components/ThemeProvider';
import { motion, AnimatePresence } from 'motion/react';

type Tab = 'leaderboard' | 'matches' | 'entry' | 'players' | 'admin';

const IconLeaderboard = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 20V10"/>
    <path d="M12 20V4"/>
    <path d="M6 20v-4"/>
  </svg>
);

const IconMatch = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
    <line x1="16" x2="16" y1="2" y2="6"/>
    <line x1="8" x2="8" y1="2" y2="6"/>
    <line x1="3" x2="21" y1="10" y2="10"/>
    <path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/>
    <path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/>
  </svg>
);

const IconPlayers = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const IconAdmin = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="m9 12 2 2 4-4"/>
  </svg>
);

export default function App() {
  const { 
    players, matches, loading, currentUser, logout, login,
    addPlayer, updatePlayer, deletePlayer, 
    addMatch, updateMatch, deleteMatch
  } = useAppStore();
  
  const [activeTab, setActiveTab] = useState<Tab>('leaderboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const getThemeIcon = () => {
    if (theme === 'light') return <Sun size={18} />;
    if (theme === 'dark') return <Moon size={18} />;
    return <Monitor size={18} />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-game-950">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex items-center justify-center w-20 h-20 mb-2">
            <img 
              src="https://raw.githubusercontent.com/annguyen662006/Storage/refs/heads/main/sagenfc/pictures/logo-sagenfc.png" 
              alt="SAGEN FC Logo" 
              className="w-full h-full object-contain animate-pulse"
              referrerPolicy="no-referrer"
            />
          </div>
          <p className="text-sm font-display font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest animate-pulse">
            Đang tải dữ liệu...
          </p>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'leaderboard', icon: IconLeaderboard, label: 'Bảng Xếp Hạng' },
    { id: 'matches', icon: IconMatch, label: 'Trận Đấu' },
    { id: 'entry', icon: IconMatch, label: 'Nhập Liệu', secure: true },
    { id: 'players', icon: IconPlayers, label: 'Tuyển Thủ', secure: true },
  ];
  
  if (currentUser?.role === 'admin') {
    navItems.push({ id: 'admin', icon: IconAdmin, label: 'Admin', secure: true });
  }

  const renderContent = () => {
    // If trying to access admin without being admin, fallback to leaderboard
    if (activeTab === 'admin' && currentUser?.role !== 'admin') {
      return <Login onLogin={login} />;
    }

    const currentTabItem = navItems.find(i => i.id === activeTab) || { secure: activeTab === 'admin' || activeTab === 'entry' || activeTab === 'players' };
    
    if (currentTabItem.secure && !currentUser) {
      return <Login onLogin={login} />;
    }
    
    switch (activeTab) {
      case 'leaderboard': return <Leaderboard players={players} matches={matches} />;
      case 'matches': return <Matches matches={matches} />;
      case 'entry': return <DataEntry players={players} matches={matches} onSave={addMatch} onUpdate={updateMatch} onDelete={deleteMatch} />;
      case 'players': return <Players players={players} onAddPlayer={addPlayer} onUpdatePlayer={updatePlayer} onDeletePlayer={deletePlayer} />;
      case 'admin': return <AdminPanel />;
      default: return <Leaderboard players={players} matches={matches} />;
    }
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white/80 dark:bg-game-900/80 backdrop-blur-md border-b border-slate-200 dark:border-game-800 sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="hidden md:flex p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-game-800 rounded-lg transition-colors"
                title="Thu gọn menu"
              >
                <Menu size={24} />
              </button>
              <div className="flex items-center gap-2">
                <div className="relative flex items-center justify-center w-10 h-10 md:w-12 md:h-12">
                  <img 
                    src="https://raw.githubusercontent.com/annguyen662006/Storage/refs/heads/main/sagenfc/pictures/logo-sagenfc.png" 
                    alt="SAGEN FC Logo" 
                    className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] dark:drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h1 className="text-2xl md:text-3xl font-display font-black tracking-wider uppercase bg-gradient-to-br from-slate-800 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                  SAGEN <span className="text-pitch-500 dark:text-neon-cyan">FC</span>
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {currentUser && (
                <div className="flex items-center gap-3 mr-2 border-r border-slate-200 dark:border-game-700 pr-4">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase hidden sm:block">Xin chào, {currentUser.username}</span>
                  <button 
                    onClick={() => {
                      logout();
                      setActiveTab('leaderboard');
                    }}
                    className="p-2 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                    title="Đăng xuất"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              )}
              <button 
                onClick={cycleTheme}
                className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-neon-cyan hover:bg-slate-100 dark:hover:bg-game-800 rounded-xl transition-all duration-300 border border-transparent dark:hover:border-neon-cyan/30 dark:hover:box-glow-cyan"
                title={`Giao diện: ${theme === 'light' ? 'Sáng' : theme === 'dark' ? 'Tối' : 'Hệ thống'}`}
              >
                {getThemeIcon()}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          
          {/* Desktop Sidebar Navigation */}
          <div className={`hidden md:flex flex-col shrink-0 transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'} sticky top-28 h-[calc(100vh-8rem)]`}>
            <nav className="flex flex-col gap-3">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;
                return (
                  <button 
                    key={item.id}
                    onClick={() => setActiveTab(item.id as Tab)}
                    className={`relative flex items-center gap-4 px-4 py-3.5 rounded-xl font-display font-bold tracking-wide uppercase transition-all duration-300 group ${
                      isActive 
                        ? 'text-white bg-gradient-to-r from-slate-800 to-slate-900 dark:from-game-800 dark:to-game-900 translate-y-[2px] shadow-[inset_0_3px_6px_rgba(0,0,0,0.4)] border border-slate-700 dark:border-game-700' 
                        : 'text-slate-500 dark:text-slate-400 bg-white dark:bg-game-900 border-b-4 border-slate-200 dark:border-game-800 hover:border-pitch-400 dark:hover:border-neon-cyan hover:-translate-y-1 hover:shadow-lg hover:text-pitch-600 dark:hover:text-neon-cyan'
                    }`}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="activeTabDesktop"
                        className="absolute inset-0 bg-gradient-to-r from-pitch-500/10 to-transparent dark:from-neon-cyan/10 dark:to-transparent rounded-xl pointer-events-none"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <div className="relative">
                      <Icon size={22} className={`shrink-0 relative z-10 transition-all duration-300 ${isActive ? 'text-pitch-400 dark:text-neon-cyan drop-shadow-[0_0_8px_rgba(16,185,129,0.8)] dark:drop-shadow-[0_0_8px_rgba(0,240,255,0.8)] scale-110' : 'group-hover:scale-110 group-hover:-rotate-12'}`} />
                    </div>
                    {!isSidebarCollapsed && <span className="relative z-10">{item.label}</span>}
                  </button>
                );
              })}
            </nav>
            
            <div className="mt-auto pb-4 overflow-hidden whitespace-nowrap">
              {!isSidebarCollapsed ? (
                <div className="px-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phát triển bởi</p>
                  <p className="text-sm font-display font-bold text-slate-600 dark:text-slate-300">Thành Vinh</p>
                </div>
              ) : (
                <div className="px-4 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest" title="Phát triển bởi Thành Vinh">TV</p>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Bottom Navigation */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-game-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-game-800 flex justify-around p-2 z-50 pb-[env(safe-area-inset-bottom)]">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button 
                  key={item.id}
                  onClick={() => setActiveTab(item.id as Tab)}
                  className={`relative flex flex-col items-center justify-center gap-1.5 p-2 flex-1 rounded-2xl transition-all duration-300 ${
                    isActive 
                      ? 'text-white bg-slate-900 dark:bg-game-800 translate-y-[2px] shadow-[inset_0_3px_6px_rgba(0,0,0,0.4)] border border-slate-700 dark:border-game-700' 
                      : 'text-slate-500 dark:text-slate-400 bg-transparent hover:bg-slate-100 dark:hover:bg-game-800'
                  }`}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="activeTabMobile"
                      className="absolute inset-0 bg-pitch-500/10 dark:bg-neon-cyan/10 rounded-2xl pointer-events-none"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon size={22} className={`relative z-10 transition-all duration-300 ${isActive ? 'text-pitch-400 dark:text-neon-cyan drop-shadow-[0_0_8px_rgba(16,185,129,0.8)] dark:drop-shadow-[0_0_8px_rgba(0,240,255,0.8)] scale-110' : 'group-hover:scale-110 group-hover:-rotate-12'}`} />
                  <span className={`text-[10px] sm:text-xs font-display font-bold tracking-wider uppercase relative z-10 transition-colors ${isActive ? 'text-pitch-400 dark:text-neon-cyan' : ''}`}>{item.id === 'leaderboard' ? 'Xếp Hạng' : item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
            
            {/* Mobile Footer */}
            <div className="md:hidden mt-12 pb-6 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phát triển bởi</p>
              <p className="text-sm font-display font-bold text-slate-600 dark:text-slate-300">Thành Vinh</p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

