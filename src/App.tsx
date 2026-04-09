/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useAppStore } from './store';
import { Leaderboard } from './components/Leaderboard';
import { DataEntry } from './components/DataEntry';
import { Players } from './components/Players';
import { Trophy, PenLine, Users, Menu, Moon, Sun, Monitor, Hexagon } from 'lucide-react';
import { useTheme } from './components/ThemeProvider';
import { motion, AnimatePresence } from 'motion/react';

type Tab = 'leaderboard' | 'entry' | 'players';

export default function App() {
  const { 
    players, matches, loading,
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
              {[
                { id: 'leaderboard', icon: Trophy, label: 'Bảng Xếp Hạng' },
                { id: 'entry', icon: PenLine, label: 'Nhập Dữ Liệu' },
                { id: 'players', icon: Users, label: 'Tuyển Thủ' }
              ].map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;
                return (
                  <button 
                    key={item.id}
                    onClick={() => setActiveTab(item.id as Tab)}
                    className={`relative flex items-center gap-4 px-4 py-3.5 rounded-xl font-display font-bold tracking-wide uppercase transition-all duration-300 overflow-hidden group ${
                      isActive 
                        ? 'text-white bg-slate-900 dark:bg-game-800 border border-slate-800 dark:border-neon-cyan/50 dark:box-glow-cyan' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-game-800 border border-transparent'
                    }`}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="activeTabDesktop"
                        className="absolute inset-0 bg-gradient-to-r from-pitch-500/20 to-transparent dark:from-neon-cyan/20 dark:to-transparent"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <Icon size={22} className={`shrink-0 relative z-10 ${isActive ? 'text-pitch-400 dark:text-neon-cyan' : 'group-hover:scale-110 transition-transform'}`} />
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
            {[
              { id: 'leaderboard', icon: Trophy, label: 'Xếp Hạng' },
              { id: 'entry', icon: PenLine, label: 'Nhập Liệu' },
              { id: 'players', icon: Users, label: 'Tuyển Thủ' }
            ].map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button 
                  key={item.id}
                  onClick={() => setActiveTab(item.id as Tab)}
                  className={`relative flex flex-col items-center gap-1 p-2 flex-1 rounded-xl transition-colors ${
                    isActive 
                      ? 'text-pitch-600 dark:text-neon-cyan' 
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-game-800'
                  }`}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="activeTabMobile"
                      className="absolute inset-0 bg-pitch-50 dark:bg-neon-cyan/10 rounded-xl"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon size={20} className="relative z-10" />
                  <span className="text-[10px] font-display font-bold tracking-wider uppercase relative z-10">{item.label}</span>
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
                {activeTab === 'leaderboard' && <Leaderboard players={players} matches={matches} />}
                {activeTab === 'entry' && <DataEntry players={players} matches={matches} onSave={addMatch} onUpdate={updateMatch} onDelete={deleteMatch} />}
                {activeTab === 'players' && <Players players={players} onAddPlayer={addPlayer} onUpdatePlayer={updatePlayer} onDeletePlayer={deletePlayer} />}
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

