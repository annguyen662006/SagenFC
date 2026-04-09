import { useMemo, useState } from 'react';
import { Player, MatchRecord } from '../types';
import { Trophy, Medal, Star, Maximize2, X, RotateCw } from 'lucide-react';
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
          {top3[1] && <TopPlayerCard player={top3[1]} rank={2} className="flex-1 max-w-[33%]" />}
          {top3[0] && <TopPlayerCard player={top3[0]} rank={1} className="flex-1 max-w-[33%]" />}
          {top3[2] && <TopPlayerCard player={top3[2]} rank={3} className="flex-1 max-w-[33%]" />}
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
                    {stats.map((row, index) => (
                      <tr key={row.id} className="even:bg-slate-50/50 odd:bg-white dark:even:bg-game-800/30 dark:odd:bg-game-900 hover:bg-slate-100 dark:hover:bg-game-800/80 transition-colors group">
                        <td className="p-2 text-center font-display font-bold text-slate-400 dark:text-slate-500">{index + 1}</td>
                        <td className="p-2">
                          <div className="font-bold text-slate-800 dark:text-slate-100 truncate max-w-[120px]">{row.name}</div>
                          <div className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">{row.position}</div>
                        </td>
                        <td className="p-2 text-center font-mono font-medium dark:text-slate-300">{row.goals}</td>
                        <td className="p-2 text-center font-mono font-medium dark:text-slate-300">{row.assists}</td>
                        <td className="p-2 text-center font-mono font-medium dark:text-slate-300">{row.saves}</td>
                        <td className="p-2 text-center font-mono font-medium text-slate-500 dark:text-slate-400">{row.points.toLocaleString('vi-VN')}</td>
                        <td className="p-2 text-center font-mono font-medium dark:text-slate-300">{row.attendance}</td>
                        <td className="p-2 text-center font-mono font-bold text-sm text-pitch-600 dark:text-neon-cyan">{row.totalPoints.toLocaleString('vi-VN')}</td>
                      </tr>
                    ))}
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

function TopPlayerCard({ player, rank, className = '' }: { player: any, rank: number, className?: string }) {
  const isFirst = rank === 1;
  
  const rankColors = {
    1: 'from-yellow-400 to-amber-600 border-yellow-400/50 shadow-[0_0_30px_rgba(250,204,21,0.3)]',
    2: 'from-slate-300 to-slate-500 border-slate-300/50',
    3: 'from-amber-600 to-orange-800 border-amber-600/50'
  };

  const rankTextColors = {
    1: 'text-yellow-500',
    2: 'text-slate-400',
    3: 'text-amber-600'
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1 }}
      className={`relative bg-white dark:bg-game-900 rounded-2xl border-2 ${isFirst ? 'md:-mt-4 md:mb-4 -mt-2 mb-2' : ''} ${rankColors[rank as keyof typeof rankColors]} overflow-hidden group ${className}`}
    >
      <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${rankColors[rank as keyof typeof rankColors]}`}></div>
      
      <div className="p-2 sm:p-6 flex flex-col items-center text-center relative z-10">
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 opacity-20 group-hover:opacity-40 transition-opacity">
          {rank === 1 ? <Trophy className="w-6 h-6 sm:w-12 sm:h-12 text-yellow-500" /> : <Medal className={`w-6 h-6 sm:w-12 sm:h-12 ${rankTextColors[rank as keyof typeof rankTextColors]}`} />}
        </div>

        <div className={`text-2xl sm:text-5xl font-display font-black mb-1 sm:mb-2 ${rankTextColors[rank as keyof typeof rankTextColors]}`}>
          #{rank}
        </div>
        
        <h3 className="text-xs sm:text-2xl font-display font-bold text-slate-800 dark:text-white uppercase tracking-wide truncate w-full px-1">
          {player.name}
        </h3>
        <div className="text-[8px] sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 sm:mb-6">
          {player.position}
        </div>

        <div className="text-lg sm:text-4xl font-display font-black text-pitch-600 dark:text-neon-cyan mb-2 sm:mb-6 drop-shadow-sm dark:text-glow-cyan">
          {player.totalPoints.toLocaleString('vi-VN')} <span className="text-[8px] sm:text-lg text-slate-400">PTS</span>
        </div>

        <div className="w-full grid grid-cols-3 gap-1 sm:gap-2 border-t border-slate-100 dark:border-game-800 pt-2 sm:pt-4">
          <div className="flex flex-col items-center">
            <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bàn</span>
            <span className="text-xs sm:text-lg font-mono font-bold dark:text-slate-200">{player.goals}</span>
          </div>
          <div className="flex flex-col items-center border-x border-slate-100 dark:border-game-800">
            <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kiến</span>
            <span className="text-xs sm:text-lg font-mono font-bold dark:text-slate-200">{player.assists}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cản</span>
            <span className="text-xs sm:text-lg font-mono font-bold dark:text-slate-200">{player.saves}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
