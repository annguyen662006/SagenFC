import { useMemo, useState } from 'react';
import { Player, MatchRecord } from '../types';
import { Trophy, Medal, Star, Maximize2, X, RotateCw, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LeaderboardProps {
  players: Player[];
  matches: MatchRecord[];
}

export function Leaderboard({ players, matches }: LeaderboardProps) {
  const [isLandscapeView, setIsLandscapeView] = useState(false);

  const stats = useMemo(() => {
    const playerStats: Record<string, {
      goals: number;
      assists: number;
      saves: number;
      attendance: number;
    }> = {};

    players.forEach(p => {
      playerStats[p.id] = { goals: 0, assists: 0, saves: 0, attendance: 0 };
    });

    matches.forEach(match => {
      match.stats.forEach(stat => {
        if (playerStats[stat.playerId]) {
          playerStats[stat.playerId].goals += stat.goals;
          playerStats[stat.playerId].assists += stat.assists;
          playerStats[stat.playerId].saves += stat.saves;
          if (stat.attended) {
            playerStats[stat.playerId].attendance += 1;
          }
        }
      });
    });

    return players.map(p => {
      const s = playerStats[p.id];
      const points = s.goals * 2 + s.assists * 1.5 + s.saves * 1;
      const totalPoints = points + s.attendance * 1;
      return {
        ...p,
        ...s,
        points,
        totalPoints
      };
    }).sort((a, b) => b.totalPoints - a.totalPoints || b.points - a.points || b.goals - a.goals);
  }, [players, matches]);

  const top3 = stats.slice(0, 3);
  const maxNameLength = top3.length > 0 ? Math.max(...top3.map(p => p.name.length)) : 0;
  const rest = stats.slice(3);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-game-900 rounded-2xl shadow-sm border border-slate-200 dark:border-game-800 p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pitch-500/10 dark:bg-neon-cyan/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <h2 className="text-2xl md:text-3xl font-display font-black uppercase tracking-wider text-slate-800 dark:text-white relative z-10">
          Bảng Xếp <span className="text-pitch-500 dark:text-neon-cyan">Hạng</span>
        </h2>
      </div>

      {/* Top 3 Podium */}
      {top3.length > 0 && (
        <div className="flex items-end justify-center gap-2 sm:gap-6 pt-4">
          {top3[1] && <TopPlayerCard player={top3[1]} rank={2} maxNameLength={maxNameLength} className="flex-1 max-w-[33%]" />}
          {top3[0] && <TopPlayerCard player={top3[0]} rank={1} maxNameLength={maxNameLength} className="flex-1 max-w-[33%]" />}
          {top3[2] && <TopPlayerCard player={top3[2]} rank={3} maxNameLength={maxNameLength} className="flex-1 max-w-[33%]" />}
        </div>
      )}

      {/* Rest of the players */}
      {rest.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-end md:hidden">
            <button 
              onClick={() => setIsLandscapeView(true)}
              className="text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-game-800 text-slate-600 dark:text-slate-300 px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-game-700 transition-colors"
            >
              <RotateCw size={14} />
              Xem ngang
            </button>
          </div>
          <div className="bg-white dark:bg-game-900 rounded-2xl shadow-sm border border-slate-200 dark:border-game-800 overflow-hidden">
            <div className="overflow-hidden md:overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-0 md:min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-game-800 text-slate-500 dark:text-slate-400 text-[10px] md:text-xs font-display font-bold uppercase tracking-wider">
                    <th className="p-1.5 md:p-4 border-b border-slate-200 dark:border-game-700 text-center w-10 sm:w-16">#</th>
                    <th className="p-1.5 md:p-4 border-b border-slate-200 dark:border-game-700">Tuyển thủ</th>
                    <th className="p-1.5 md:p-4 border-b border-slate-200 dark:border-game-700 text-center">
                      <span className="md:hidden">Bàn</span>
                      <span className="hidden md:inline">Bàn thắng</span>
                    </th>
                    <th className="p-1.5 md:p-4 border-b border-slate-200 dark:border-game-700 text-center">
                      <span className="md:hidden">Kiến</span>
                      <span className="hidden md:inline">Kiến tạo</span>
                    </th>
                    <th className="p-1.5 md:p-4 border-b border-slate-200 dark:border-game-700 text-center">
                      <span className="md:hidden">Cản</span>
                      <span className="hidden md:inline">Cản phá</span>
                    </th>
                    <th className="p-1.5 md:p-4 border-b border-slate-200 dark:border-game-700 text-center">Điểm</th>
                    <th className="p-1.5 md:p-4 border-b border-slate-200 dark:border-game-700 text-center">Trận</th>
                    <th className="p-1.5 md:p-4 border-b border-slate-200 dark:border-game-700 text-center text-pitch-600 dark:text-neon-cyan">Tổng</th>
                  </tr>
                </thead>
                <tbody className="text-xs md:text-sm divide-y divide-slate-100 dark:divide-game-800/50">
                  {rest.map((row, index) => (
                    <tr key={row.id} className="even:bg-slate-50/50 odd:bg-white dark:even:bg-game-800/30 dark:odd:bg-game-900 hover:bg-slate-100 dark:hover:bg-game-800/80 transition-colors group">
                      <td className="p-1.5 md:p-4 text-center font-display font-bold text-slate-400 dark:text-slate-500">{index + 4}</td>
                      <td className="p-1.5 md:p-4">
                        <div className="font-bold text-slate-800 dark:text-slate-100 truncate max-w-[70px] md:max-w-none">{row.name}</div>
                        <div className="text-[9px] md:text-xs text-slate-500 dark:text-slate-400 mt-0.5">{row.position}</div>
                      </td>
                      <td className="p-1.5 md:p-4 text-center font-mono font-medium dark:text-slate-300">{row.goals}</td>
                      <td className="p-1.5 md:p-4 text-center font-mono font-medium dark:text-slate-300">{row.assists}</td>
                      <td className="p-1.5 md:p-4 text-center font-mono font-medium dark:text-slate-300">{row.saves}</td>
                      <td className="p-1.5 md:p-4 text-center font-mono font-medium text-slate-500 dark:text-slate-400">{row.points.toLocaleString('vi-VN')}</td>
                      <td className="p-1.5 md:p-4 text-center font-mono font-medium dark:text-slate-300">{row.attendance}</td>
                      <td className="p-1.5 md:p-4 text-center font-mono font-bold text-sm md:text-lg text-pitch-600 dark:text-neon-cyan">{row.totalPoints.toLocaleString('vi-VN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {stats.length === 0 && (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400 bg-white dark:bg-game-900 rounded-2xl border border-slate-200 dark:border-game-800">
          Chưa có dữ liệu
        </div>
      )}

      {/* Scoring Rules Note */}
      <div className="mt-8 p-5 bg-slate-50 dark:bg-game-900/50 rounded-2xl border border-slate-200 dark:border-game-800">
        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Ghi chú tính điểm</div>
        <div className="flex flex-wrap gap-3">
          <Badge label="Bàn thắng" value="2đ" color="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-800" />
          <Badge label="Kiến tạo" value="1.5đ" color="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 border-purple-200 dark:border-purple-800" />
          <Badge label="Cản phá" value="1đ" color="bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 border-orange-200 dark:border-orange-800" />
          <Badge label="Chuyên cần" value="1đ/trận" color="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" />
        </div>
      </div>

      {/* Landscape Modal */}
      <AnimatePresence>
        {isLandscapeView && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black overflow-hidden md:hidden"
          >
            <div 
              className="bg-white dark:bg-game-900 flex flex-col overflow-hidden absolute"
              style={{
                width: '100dvh',
                height: '100dvw',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) rotate(90deg)',
              }}
            >
              <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-game-950 border-b border-slate-200 dark:border-game-800 shrink-0">
                <h2 className="text-lg font-display font-black uppercase tracking-wider text-slate-800 dark:text-white">
                  Bảng Xếp Hạng
                </h2>
                <button 
                  onClick={() => setIsLandscapeView(false)}
                  className="p-2 bg-slate-200 dark:bg-game-800 text-slate-500 hover:bg-slate-300 dark:hover:bg-game-700 rounded-full transition-colors"
                >
                  <X size={20} strokeWidth={3} />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-2">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-game-800 text-slate-500 dark:text-slate-400 text-[10px] font-display font-bold uppercase tracking-wider">
                      <th className="p-2 border-b border-slate-200 dark:border-game-700 text-center w-8">#</th>
                      <th className="p-2 border-b border-slate-200 dark:border-game-700">Tuyển thủ</th>
                      <th className="p-2 border-b border-slate-200 dark:border-game-700 text-center">Bàn</th>
                      <th className="p-2 border-b border-slate-200 dark:border-game-700 text-center">Kiến</th>
                      <th className="p-2 border-b border-slate-200 dark:border-game-700 text-center">Cản</th>
                      <th className="p-2 border-b border-slate-200 dark:border-game-700 text-center">Điểm</th>
                      <th className="p-2 border-b border-slate-200 dark:border-game-700 text-center">Trận</th>
                      <th className="p-2 border-b border-slate-200 dark:border-game-700 text-center text-pitch-600 dark:text-neon-cyan">Tổng</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs divide-y divide-slate-100 dark:divide-game-800/50">
                    {stats.map((row, index) => {
                      const rank = index + 1;
                      const isTop1 = rank === 1;
                      const isTop2 = rank === 2;
                      const isTop3 = rank === 3;

                      let rowClass = "transition-colors group ";
                      if (isTop1) rowClass += "bg-gradient-to-r from-yellow-500/20 via-yellow-400/5 to-transparent dark:from-yellow-500/30 dark:via-yellow-400/10";
                      else if (isTop2) rowClass += "bg-gradient-to-r from-slate-400/20 via-slate-300/5 to-transparent dark:from-slate-400/30 dark:via-slate-300/10";
                      else if (isTop3) rowClass += "bg-gradient-to-r from-amber-600/20 via-amber-500/5 to-transparent dark:from-amber-600/30 dark:via-amber-500/10";
                      else rowClass += "even:bg-slate-50/50 odd:bg-white dark:even:bg-game-800/30 dark:odd:bg-game-900 hover:bg-slate-100 dark:hover:bg-game-800/80";

                      return (
                        <tr key={row.id} className={rowClass}>
                          <td className={`p-2 text-center font-display font-bold ${isTop1 ? 'border-l-4 border-yellow-500' : isTop2 ? 'border-l-4 border-slate-400' : isTop3 ? 'border-l-4 border-amber-600' : 'border-l-4 border-transparent'}`}>
                            {isTop1 ? (
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 text-yellow-950 flex items-center justify-center mx-auto shadow-[0_0_10px_rgba(250,204,21,0.5)] relative">
                                1
                                <motion.div animate={{ scale: [0, 1, 0], rotate: [0, 90, 180], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute -top-1 -left-1 w-2 h-2 bg-white" style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }} />
                                <motion.div animate={{ scale: [0, 1, 0], rotate: [0, 90, 180], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 2, delay: 1 }} className="absolute -bottom-1 -right-1 w-2 h-2 bg-yellow-100" style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }} />
                              </div>
                            ) : isTop2 ? (
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800 flex items-center justify-center mx-auto shadow-[0_0_10px_rgba(148,163,184,0.5)]">2</div>
                            ) : isTop3 ? (
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 text-amber-950 flex items-center justify-center mx-auto shadow-[0_0_10px_rgba(217,119,6,0.5)]">3</div>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-500">{rank}</span>
                            )}
                          </td>
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              {row.avatar_url ? (
                                <img src={row.avatar_url} alt={row.name} className={`w-8 h-8 rounded-full object-cover shrink-0 ${isTop1 ? 'border-2 border-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]' : isTop2 ? 'border-2 border-slate-300 shadow-[0_0_8px_rgba(148,163,184,0.6)]' : isTop3 ? 'border-2 border-amber-500 shadow-[0_0_8px_rgba(217,119,6,0.6)]' : 'border border-slate-200 dark:border-game-700'}`} referrerPolicy="no-referrer" />
                              ) : (
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isTop1 ? 'bg-yellow-100 dark:bg-yellow-900/50 border-2 border-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]' : isTop2 ? 'bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 shadow-[0_0_8px_rgba(148,163,184,0.6)]' : isTop3 ? 'bg-amber-100 dark:bg-amber-900/50 border-2 border-amber-500 shadow-[0_0_8px_rgba(217,119,6,0.6)]' : 'bg-slate-200 dark:bg-game-800 border border-slate-300 dark:border-game-700'}`}>
                                  <Users size={14} className={isTop1 ? 'text-yellow-600 dark:text-yellow-400' : isTop2 ? 'text-slate-500 dark:text-slate-400' : isTop3 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'} />
                                </div>
                              )}
                              <div>
                                <div className={`font-bold truncate max-w-[120px] ${isTop1 ? 'text-yellow-700 dark:text-yellow-400' : isTop2 ? 'text-slate-700 dark:text-slate-300' : isTop3 ? 'text-amber-700 dark:text-amber-500' : 'text-slate-800 dark:text-slate-100'}`}>{row.name}</div>
                                <div className={`text-[9px] mt-0.5 ${isTop1 ? 'text-yellow-600/80 dark:text-yellow-400/80' : isTop2 ? 'text-slate-500 dark:text-slate-400' : isTop3 ? 'text-amber-600/80 dark:text-amber-500/80' : 'text-slate-500 dark:text-slate-400'}`}>{row.position}</div>
                              </div>
                            </div>
                          </td>
                          <td className={`p-2 text-center font-mono font-medium ${isTop1 ? 'text-yellow-800 dark:text-yellow-200' : isTop2 ? 'text-slate-800 dark:text-slate-200' : isTop3 ? 'text-amber-900 dark:text-amber-200' : 'dark:text-slate-300'}`}>{row.goals}</td>
                          <td className={`p-2 text-center font-mono font-medium ${isTop1 ? 'text-yellow-800 dark:text-yellow-200' : isTop2 ? 'text-slate-800 dark:text-slate-200' : isTop3 ? 'text-amber-900 dark:text-amber-200' : 'dark:text-slate-300'}`}>{row.assists}</td>
                          <td className={`p-2 text-center font-mono font-medium ${isTop1 ? 'text-yellow-800 dark:text-yellow-200' : isTop2 ? 'text-slate-800 dark:text-slate-200' : isTop3 ? 'text-amber-900 dark:text-amber-200' : 'dark:text-slate-300'}`}>{row.saves}</td>
                          <td className={`p-2 text-center font-mono font-medium ${isTop1 ? 'text-yellow-700 dark:text-yellow-500' : isTop2 ? 'text-slate-600 dark:text-slate-400' : isTop3 ? 'text-amber-700 dark:text-amber-500' : 'text-slate-500 dark:text-slate-400'}`}>{row.points.toLocaleString('vi-VN')}</td>
                          <td className={`p-2 text-center font-mono font-medium ${isTop1 ? 'text-yellow-800 dark:text-yellow-200' : isTop2 ? 'text-slate-800 dark:text-slate-200' : isTop3 ? 'text-amber-900 dark:text-amber-200' : 'dark:text-slate-300'}`}>{row.attendance}</td>
                          <td className={`p-2 text-center font-mono font-bold text-sm ${isTop1 ? 'text-yellow-600 dark:text-yellow-400 drop-shadow-sm' : isTop2 ? 'text-slate-600 dark:text-slate-300 drop-shadow-sm' : isTop3 ? 'text-amber-600 dark:text-amber-500 drop-shadow-sm' : 'text-pitch-600 dark:text-neon-cyan'}`}>{row.totalPoints.toLocaleString('vi-VN')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Badge({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className={`flex items-center text-xs font-bold rounded-lg border overflow-hidden ${color}`}>
      <span className="px-2 py-1 uppercase tracking-wider opacity-80">{label}</span>
      <span className="px-2 py-1 bg-black/10 dark:bg-white/10">{value}</span>
    </div>
  );
}

function GamingMedal({ rank, avatarUrl }: { rank: 1 | 2 | 3, avatarUrl?: string }) {
  const isFirst = rank === 1;
  const colors = {
    1: { 
      light: '#FFDF00', base: '#D4AF37', dark: '#996515', 
      border: '#fff5cc', shadow: 'rgba(250, 204, 21, 0.4)',
      ribbon: 'linear-gradient(to right, #b91c1c 0%, #ef4444 20%, #ef4444 40%, #fcd34d 40%, #fcd34d 60%, #ef4444 60%, #ef4444 80%, #b91c1c 100%)'
    },
    2: { 
      light: '#F5F5F5', base: '#C0C0C0', dark: '#808080', 
      border: '#ffffff', shadow: 'rgba(148, 163, 184, 0.3)',
      ribbon: 'linear-gradient(to right, #1e3a8a 0%, #3b82f6 20%, #3b82f6 40%, #e2e8f0 40%, #e2e8f0 60%, #3b82f6 60%, #3b82f6 80%, #1e3a8a 100%)'
    },
    3: { 
      light: '#E3A869', base: '#CD7F32', dark: '#8B4513', 
      border: '#fcd3b6', shadow: 'rgba(217, 119, 6, 0.3)',
      ribbon: 'linear-gradient(to right, #14532d 0%, #22c55e 20%, #22c55e 40%, #ffedd5 40%, #ffedd5 60%, #22c55e 60%, #22c55e 80%, #14532d 100%)'
    }
  }[rank];

  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ repeat: Infinity, duration: isFirst ? 4 : (rank === 2 ? 5 : 4.5), ease: "easeInOut", delay: rank * 0.2 }}
      className="relative flex flex-col items-center justify-center mb-6 sm:mb-8 z-20 group"
      style={{ perspective: '1000px' }}
    >
      {/* Ribbon */}
      <div 
        className={`absolute ${isFirst ? '-top-[60px] sm:-top-[80px] w-8 h-16 sm:w-12 sm:h-24' : '-top-[40px] sm:-top-[60px] w-6 h-12 sm:w-10 sm:h-20'} z-0`}
        style={{
          background: colors.ribbon,
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%)',
          boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
          transform: 'translateZ(-10px)'
        }}
      />

      {/* Sparkles for Gold */}
      {isFirst && (
        <>
          <motion.div animate={{ scale: [0, 1, 0], rotate: [0, 90, 180], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 2, delay: 0 }} className="absolute -top-4 -left-4 w-4 h-4 sm:w-5 sm:h-5 bg-yellow-200 z-30" style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }} />
          <motion.div animate={{ scale: [0, 1, 0], rotate: [0, 90, 180], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 2, delay: 0.6 }} className="absolute top-8 -right-6 w-4 h-4 sm:w-5 sm:h-5 bg-yellow-100 z-30" style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }} />
          <motion.div animate={{ scale: [0, 1, 0], rotate: [0, 90, 180], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 2, delay: 1.2 }} className="absolute -bottom-2 left-4 w-4 h-4 sm:w-5 sm:h-5 bg-white z-30" style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }} />
        </>
      )}

      {/* Medal Body */}
      <motion.div 
        whileHover={{ rotateX: 15, rotateY: -15, scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`relative rounded-full flex items-center justify-center z-10 cursor-pointer ${isFirst ? 'w-24 h-24 sm:w-36 sm:h-36' : (rank === 2 ? 'w-20 h-20 sm:w-28 sm:h-28' : 'w-16 h-16 sm:w-24 sm:h-24')}`}
        style={{
          background: `linear-gradient(135deg, ${colors.light} 0%, ${colors.base} 50%, ${colors.dark} 100%)`,
          border: `3px solid ${colors.border}`,
          boxShadow: `inset 0 0 0 3px rgba(255, 255, 255, 0.5), inset 0 0 15px rgba(0, 0, 0, 0.2), 0 6px 0 ${colors.dark}, 0 10px 20px ${colors.shadow}`,
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Inner Content */}
        <div 
          className="w-[76%] h-[76%] rounded-full flex flex-col items-center justify-center relative overflow-hidden"
          style={{
            border: '2px dashed rgba(0,0,0,0.15)',
            transform: 'translateZ(12px)',
            background: avatarUrl ? 'transparent' : 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%)',
            textShadow: avatarUrl ? 'none' : '1px 1px 0px rgba(255,255,255,0.4), -1px -1px 0px rgba(0,0,0,0.1)'
          }}
        >
          {avatarUrl && (
            <>
              <img src={avatarUrl} alt="Avatar" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-black/30"></div>
            </>
          )}
          <span className={`relative z-10 ${isFirst ? 'text-4xl sm:text-6xl text-yellow-900' : (rank === 2 ? 'text-3xl sm:text-4xl text-gray-800' : 'text-2xl sm:text-3xl text-orange-950')} font-black mb-0.5 sm:mb-1 drop-shadow-sm ${avatarUrl ? '!text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]' : ''}`}>
            {rank}
          </span>
          <Star className={`relative z-10 ${isFirst ? 'w-4 h-4 sm:w-6 sm:h-6 text-yellow-900' : (rank === 2 ? 'w-3 h-3 sm:w-5 sm:h-5 text-gray-800' : 'w-3 h-3 sm:w-4 sm:h-4 text-orange-950')} opacity-80 ${avatarUrl ? '!text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]' : ''}`} fill="currentColor" />
        </div>
      </motion.div>
    </motion.div>
  );
}

function TopPlayerCard({ player, rank, maxNameLength = 10, className = '' }: { player: any, rank: number, maxNameLength?: number, className?: string }) {
  const isFirst = rank === 1;
  
  const rankStyles = {
    1: 'from-yellow-500/20 to-amber-600/20 border-yellow-400/50 shadow-[0_0_30px_rgba(250,204,21,0.2)]',
    2: 'from-slate-300/20 to-slate-500/20 border-slate-300/50 shadow-[0_0_20px_rgba(148,163,184,0.2)]',
    3: 'from-amber-600/20 to-orange-800/20 border-amber-600/50 shadow-[0_0_20px_rgba(217,119,6,0.2)]'
  };

  const rankTextColors = {
    1: 'text-yellow-500 dark:text-yellow-400',
    2: 'text-slate-500 dark:text-slate-300',
    3: 'text-amber-700 dark:text-amber-500'
  };

  let nameSizeClass = "text-xs sm:text-xl md:text-2xl";
  if (maxNameLength >= 20) {
    nameSizeClass = "text-[8px] sm:text-sm md:text-base";
  } else if (maxNameLength >= 15) {
    nameSizeClass = "text-[9px] sm:text-base md:text-lg";
  } else if (maxNameLength >= 11) {
    nameSizeClass = "text-[10px] sm:text-lg md:text-xl";
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", bounce: 0.4, delay: rank * 0.1 }}
      className={`relative bg-white/80 dark:bg-game-900/80 backdrop-blur-md rounded-3xl border-2 ${isFirst ? 'md:-mt-8 md:mb-8 -mt-4 mb-4 z-10' : 'z-0'} ${rankStyles[rank as keyof typeof rankStyles]} overflow-hidden group ${className}`}
    >
      {/* Glossy overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 pointer-events-none"></div>
      
      <div className="p-3 sm:p-6 flex flex-col items-center text-center relative z-10">
        <GamingMedal rank={rank as 1|2|3} avatarUrl={player.avatar_url} />
        
        <div className="h-8 sm:h-14 flex items-center justify-center w-full mt-2 mb-1">
          <h3 className={`${nameSizeClass} font-display font-black text-slate-800 dark:text-white uppercase tracking-wide w-full px-1 drop-shadow-sm leading-tight line-clamp-2`}>
            {player.name}
          </h3>
        </div>
        <div className="text-[9px] sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 sm:mb-6 bg-slate-100 dark:bg-game-800 px-2 py-1 rounded-md">
          {player.position}
        </div>

        <div className={`text-xl sm:text-5xl font-display font-black mb-3 sm:mb-6 drop-shadow-md ${rankTextColors[rank as keyof typeof rankTextColors]}`}>
          {player.totalPoints.toLocaleString('vi-VN')} <span className="text-[10px] sm:text-xl opacity-70">PTS</span>
        </div>

        <div className="w-full grid grid-cols-3 gap-1 sm:gap-2 bg-slate-50/50 dark:bg-game-950/50 rounded-xl p-2 sm:p-3 border border-slate-200/50 dark:border-game-800/50">
          <div className="flex flex-col items-center">
            <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bàn</span>
            <span className="text-xs sm:text-lg font-mono font-black text-slate-700 dark:text-slate-200">{player.goals}</span>
          </div>
          <div className="flex flex-col items-center border-x border-slate-200/50 dark:border-game-800/50">
            <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kiến</span>
            <span className="text-xs sm:text-lg font-mono font-black text-slate-700 dark:text-slate-200">{player.assists}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cản</span>
            <span className="text-xs sm:text-lg font-mono font-black text-slate-700 dark:text-slate-200">{player.saves}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
