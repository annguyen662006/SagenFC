import { motion } from 'motion/react';
import { MatchRecord } from '../types';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Activity, ShieldHalf } from 'lucide-react';

interface MatchesProps {
  matches: MatchRecord[];
}

export function Matches({ matches }: MatchesProps) {
  const sortedMatches = [...matches].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6 lg:max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-game-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-game-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-pitch-500/10 dark:bg-neon-cyan/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 w-full text-center sm:text-left">
          <h2 className="text-2xl font-display font-black uppercase tracking-wider text-slate-800 dark:text-white">
            Lịch Sử <span className="text-pitch-500 dark:text-neon-cyan">Trận Đấu</span>
          </h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest">
            {matches.length} Trận đã đá
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {sortedMatches.map((match, idx) => {
          const isWin = (match.home_score ?? 0) > (match.away_score ?? 0);
          const isDraw = (match.home_score ?? 0) === (match.away_score ?? 0);
          const isLoss = (match.home_score ?? 0) < (match.away_score ?? 0);

          let resultBg = 'bg-slate-100 dark:bg-game-800 text-slate-600 dark:text-slate-300';
          if (match.home_score !== undefined && match.away_score !== undefined) {
             if (isWin) resultBg = 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
             if (isDraw) resultBg = 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
             if (isLoss) resultBg = 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
          }

          return (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={match.id} 
              className="bg-white dark:bg-game-900 rounded-2xl shadow-lg border border-slate-200 dark:border-game-800 overflow-hidden relative group"
            >
              {/* Match Header with Date */}
              <div className="bg-slate-50 dark:bg-game-950 p-4 border-b border-slate-100 dark:border-game-800 flex justify-center items-center">
                <div className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">
                  {format(new Date(match.date), 'EEEE, dd/MM/yyyy', { locale: vi })}
                </div>
              </div>

              {/* Scoreboard Area */}
              <div className="p-4 sm:p-6 md:p-8 flex flex-row items-center justify-between gap-1 sm:gap-4 md:gap-8 relative overflow-hidden">
                
                {/* Home Team (SAGEN FC) - Always left */}
                <div className="flex items-center justify-end gap-2 sm:gap-4 flex-1 min-w-0">
                  <h3 className="text-[10px] sm:text-base md:text-xl lg:text-2xl font-display font-black uppercase text-slate-800 dark:text-white text-right truncate">SAGEN FC</h3>
                  <div className="w-8 h-8 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 shrink-0 rounded-full bg-slate-100 dark:bg-game-800 flex items-center justify-center p-1 sm:p-2 shadow-inner border border-slate-200 dark:border-game-700">
                    <img src="https://raw.githubusercontent.com/annguyen662006/Storage/refs/heads/main/sagenfc/pictures/logo-sagenfc.png" alt="Sagen FC" className="w-full h-full object-contain drop-shadow-md" crossOrigin="anonymous" />
                  </div>
                </div>

                {/* Score */}
                <div className="flex flex-col items-center shrink-0">
                  {match.home_score !== undefined && match.away_score !== undefined ? (
                    <div className="flex items-center justify-center gap-1 sm:gap-3 md:gap-6">
                      <div className={`text-xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-black w-6 sm:w-14 md:w-20 lg:w-24 text-center ${isWin ? 'text-emerald-500' : 'text-slate-700 dark:text-white'}`}>
                        {match.home_score}
                      </div>
                      <div className="text-slate-300 dark:text-game-700 text-lg sm:text-3xl md:text-4xl font-black mb-0.5 sm:mb-1.5">:</div>
                      <div className={`text-xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-black w-6 sm:w-14 md:w-20 lg:w-24 text-center ${isLoss ? 'text-red-500' : 'text-slate-700 dark:text-white'}`}>
                        {match.away_score}
                      </div>
                    </div>
                  ) : (
                    <div className="text-[8px] sm:text-xs md:text-sm lg:text-base font-bold text-slate-400 dark:text-slate-500 px-1 sm:px-4 py-1 uppercase tracking-widest text-center whitespace-nowrap">Chưa cập nhật tỷ số</div>
                  )}
                  
                  {match.home_score !== undefined && match.away_score !== undefined && (
                    <div className={`mt-1 sm:mt-2 md:mt-3 px-2 sm:px-4 py-0.5 sm:py-1 rounded-full text-[7px] sm:text-[10px] md:text-xs font-bold uppercase tracking-widest border ${resultBg} whitespace-nowrap`}>
                      {isWin ? 'Chiến thắng' : isDraw ? 'Hòa' : 'Thất bại'}
                    </div>
                  )}
                </div>

                {/* Away Team - Always right */}
                <div className="flex items-center justify-start gap-2 sm:gap-4 flex-1 min-w-0">
                  <div className="w-8 h-8 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 shrink-0 rounded-full bg-slate-100 dark:bg-game-800 flex items-center justify-center overflow-hidden shadow-inner border border-slate-200 dark:border-game-700 p-0.5 sm:p-1">
                    {match.opponent_logo ? (
                      <img src={match.opponent_logo} alt={match.opponent} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <ShieldHalf className="text-slate-300 dark:text-game-600 w-4 h-4 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-14 lg:h-14" />
                    )}
                  </div>
                  <h3 className="text-[10px] sm:text-base md:text-xl lg:text-2xl font-display font-black uppercase text-slate-800 dark:text-white text-left truncate">
                    {match.opponent || 'Ẩn danh'}
                  </h3>
                </div>

              </div>

              {/* Match Stats summary */}
              <div className="bg-slate-50 dark:bg-game-950/50 p-4 border-t border-slate-100 dark:border-game-800 flex justify-around">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Cầu thủ tham gia</span>
                  <span className="text-xl font-display font-black text-slate-700 dark:text-slate-200">{match.stats.filter(s => s.attended).length}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Ghi bàn / Kiến tạo</span>
                  <span className="text-xl font-display font-black text-slate-700 dark:text-slate-200">
                    {match.stats.reduce((sum, s) => sum + s.goals, 0)} / {match.stats.reduce((sum, s) => sum + s.assists, 0)}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}

        {sortedMatches.length === 0 && (
          <div className="text-center py-20 text-slate-500 dark:text-slate-400 bg-white dark:bg-game-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-game-800">
            <Activity size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-display font-bold uppercase tracking-widest">Chưa có trận đấu nào</p>
          </div>
        )}
      </div>
    </div>
  );
}
