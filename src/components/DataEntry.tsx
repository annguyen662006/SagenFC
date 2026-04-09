import { useState } from 'react';
import { Player, MatchRecord, PlayerMatchStat } from '../types';
import { Plus, Minus, Save, Trash2, Edit2, X, Check, UserPlus, AlertTriangle, Calendar, Activity, Users } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { motion } from 'motion/react';

interface DataEntryProps {
  players: Player[];
  matches: MatchRecord[];
  onSave: (match: MatchRecord) => void;
  onUpdate: (match: MatchRecord) => void;
  onDelete: (id: string) => void;
}

export function DataEntry({ players, matches, onSave, onUpdate, onDelete }: DataEntryProps) {
  const [editMode, setEditMode] = useState<'none' | 'draft' | string>('none');
  const [draft, setDraft] = useState<MatchRecord | null>(null);

  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [statModal, setStatModal] = useState<{ type: 'goals' | 'assists' | 'saves', action: 'add' | 'remove' } | null>(null);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [deletingMatch, setDeletingMatch] = useState<MatchRecord | null>(null);

  const handleCreateNew = () => {
    setDraft({
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      description: '',
      stats: players.map(p => ({
        playerId: p.id,
        goals: 0,
        assists: 0,
        saves: 0,
        attended: false
      }))
    });
    setEditMode('draft');
  };

  const handleEdit = (match: MatchRecord) => {
    const completeStats = players.map(p => {
      const existing = match.stats.find(s => s.playerId === p.id);
      return existing || { playerId: p.id, goals: 0, assists: 0, saves: 0, attended: false };
    });
    setDraft({ ...match, stats: completeStats });
    setEditMode(match.id);
  };

  const handleSaveAttendance = (date: string, attendedIds: Set<string>) => {
    if (!draft) return;
    setDraft({
      ...draft,
      date,
      stats: draft.stats.map(s => ({
        ...s,
        attended: attendedIds.has(s.playerId),
        goals: attendedIds.has(s.playerId) ? s.goals : 0,
        assists: attendedIds.has(s.playerId) ? s.assists : 0,
        saves: attendedIds.has(s.playerId) ? s.saves : 0,
      }))
    });
    setAttendanceModalOpen(false);
  };

  const handleStatChange = (playerId: string, type: 'goals' | 'assists' | 'saves', action: 'add' | 'remove') => {
    if (!draft) return;
    setDraft({
      ...draft,
      stats: draft.stats.map(s => {
        if (s.playerId === playerId) {
          const current = s[type];
          const newValue = action === 'add' ? current + 1 : Math.max(0, current - 1);
          return { ...s, [type]: newValue };
        }
        return s;
      })
    });
    setStatModal(null);
  };

  const handleConfirmSave = () => {
    if (!draft) return;
    const matchToSave = {
      ...draft,
      stats: draft.stats.filter(s => s.attended || s.goals > 0 || s.assists > 0 || s.saves > 0)
    };
    if (editMode === 'draft') onSave(matchToSave);
    else onUpdate(matchToSave);
    
    setEditMode('none');
    setDraft(null);
    setConfirmSaveOpen(false);
  };

  const handleConfirmDelete = () => {
    if (deletingMatch) {
      onDelete(deletingMatch.id);
      setDeletingMatch(null);
    }
  };

  const getPlayerName = (id: string) => players.find(p => p.id === id)?.name || 'Unknown';

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-game-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-game-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-pitch-500/10 dark:bg-neon-cyan/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-display font-black uppercase tracking-wider text-slate-800 dark:text-white">
            Quản Lý <span className="text-pitch-500 dark:text-neon-cyan">Trận Đấu</span>
          </h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest">Ghi nhận kết quả</p>
        </div>
        {editMode === 'none' && (
          <button 
            onClick={handleCreateNew}
            className="relative z-10 w-full sm:w-auto flex items-center justify-center gap-2 bg-pitch-500 hover:bg-pitch-600 dark:bg-neon-cyan dark:hover:bg-cyan-400 text-white dark:text-game-950 px-6 py-3 rounded-xl font-display font-bold uppercase tracking-wider transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.3)] dark:shadow-[0_0_20px_rgba(0,240,255,0.3)]"
          >
            <Plus size={20} strokeWidth={3} />
            <span>Tạo Trận Mới</span>
          </button>
        )}
      </div>

      {/* Draft / Editing Card */}
      {editMode !== 'none' && draft && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-game-900 rounded-2xl shadow-2xl border-2 border-pitch-500 dark:border-neon-cyan overflow-hidden relative"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pitch-400 to-pitch-600 dark:from-neon-cyan dark:to-blue-500"></div>
          
          <div className="bg-slate-50 dark:bg-game-800/50 p-4 flex justify-between items-center border-b border-slate-200 dark:border-game-800">
            <div className="flex items-center gap-3">
              <Activity className="text-pitch-500 dark:text-neon-cyan animate-pulse" />
              <h3 className="font-display font-bold uppercase tracking-wider text-slate-800 dark:text-white">
                {editMode === 'draft' ? 'Đang tạo trận đấu mới' : 'Đang chỉnh sửa trận đấu'}
              </h3>
            </div>
            <button 
              onClick={() => { setEditMode('none'); setDraft(null); }}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-4 md:p-8">
            {draft.stats.filter(s => s.attended).length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-slate-100 dark:bg-game-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users size={48} className="text-slate-400 dark:text-slate-500" />
                </div>
                <h4 className="text-xl font-display font-bold text-slate-800 dark:text-white mb-2 uppercase">Chưa có đội hình</h4>
                <p className="text-slate-500 dark:text-slate-400 mb-8">Hãy điểm danh các cầu thủ tham gia trận đấu này.</p>
                <button 
                  onClick={() => setAttendanceModalOpen(true)}
                  className="inline-flex items-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-game-950 px-8 py-4 rounded-xl font-display font-bold uppercase tracking-wider hover:scale-105 transition-transform shadow-lg"
                >
                  <UserPlus size={24} />
                  Bắt đầu Điểm danh
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                <div 
                  className="relative overflow-hidden cursor-pointer group bg-slate-900 dark:bg-game-800 rounded-2xl p-6 border border-slate-800 dark:border-game-700 hover:border-pitch-500 dark:hover:border-neon-cyan transition-colors"
                  onClick={() => setAttendanceModalOpen(true)}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-pitch-500/20 dark:bg-neon-cyan/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-pitch-500/30 dark:group-hover:bg-neon-cyan/30 transition-colors"></div>
                  <div className="flex items-center justify-between relative z-10">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">
                        <Calendar size={16} /> Ngày thi đấu
                      </div>
                      <div className="text-2xl md:text-3xl font-display font-black text-white">
                        {format(new Date(draft.date), 'EEEE, dd/MM/yyyy', { locale: vi })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Sĩ số</div>
                      <div className="text-3xl font-display font-black text-pitch-400 dark:text-neon-cyan">
                        {draft.stats.filter(s => s.attended).length}
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-pitch-500/50 dark:group-hover:border-neon-cyan/50 rounded-2xl transition-colors pointer-events-none"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  <StatControl 
                    label="Bàn thắng" 
                    value={draft.stats.reduce((sum, s) => sum + s.goals, 0)} 
                    onAdd={() => setStatModal({ type: 'goals', action: 'add' })} 
                    onRemove={() => setStatModal({ type: 'goals', action: 'remove' })} 
                    color="blue"
                  />
                  <StatControl 
                    label="Kiến tạo" 
                    value={draft.stats.reduce((sum, s) => sum + s.assists, 0)} 
                    onAdd={() => setStatModal({ type: 'assists', action: 'add' })} 
                    onRemove={() => setStatModal({ type: 'assists', action: 'remove' })} 
                    color="purple"
                  />
                  <StatControl 
                    label="Cản phá" 
                    value={draft.stats.reduce((sum, s) => sum + s.saves, 0)} 
                    onAdd={() => setStatModal({ type: 'saves', action: 'add' })} 
                    onRemove={() => setStatModal({ type: 'saves', action: 'remove' })} 
                    color="orange"
                  />
                </div>

                <div className="pt-6">
                  <button 
                    onClick={() => setConfirmSaveOpen(true)}
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-pitch-600 to-pitch-400 dark:from-cyan-600 dark:to-neon-cyan text-white dark:text-game-950 px-4 py-5 rounded-2xl font-display font-black uppercase tracking-widest transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-[0_10px_20px_rgba(16,185,129,0.3)] dark:shadow-[0_10px_20px_rgba(0,240,255,0.2)] text-xl"
                  >
                    <Save size={28} />
                    Lưu Kết Quả Trận Đấu
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* List of Saved Matches */}
      {editMode === 'none' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {matches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((match, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={match.id} 
              className="bg-white dark:bg-game-900 rounded-2xl shadow-sm border border-slate-200 dark:border-game-800 overflow-hidden group hover:border-pitch-500/50 dark:hover:border-neon-cyan/50 transition-colors"
            >
              <div className="p-5 flex justify-between items-center border-b border-slate-100 dark:border-game-800 bg-slate-50 dark:bg-game-800/30">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-pitch-100 dark:bg-neon-cyan/10 text-pitch-600 dark:text-neon-cyan flex items-center justify-center font-display font-black text-xl">
                    {format(new Date(match.date), 'dd')}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                      {format(new Date(match.date), 'MM/yyyy')}
                    </h3>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">
                      {match.stats.filter(s => s.attended).length} Cầu thủ
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleEdit(match)}
                    className="p-2.5 bg-white dark:bg-game-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl shadow-sm transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => setDeletingMatch(match)}
                    className="p-2.5 bg-white dark:bg-game-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl shadow-sm transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="p-5 grid grid-cols-3 gap-4 text-center divide-x divide-slate-100 dark:divide-game-800">
                <StatSummary label="Bàn thắng" value={match.stats.reduce((sum, s) => sum + s.goals, 0)} players={match.stats.filter(s => s.goals > 0).map(s => getPlayerName(s.playerId))} />
                <StatSummary label="Kiến tạo" value={match.stats.reduce((sum, s) => sum + s.assists, 0)} players={match.stats.filter(s => s.assists > 0).map(s => getPlayerName(s.playerId))} />
                <StatSummary label="Cản phá" value={match.stats.reduce((sum, s) => sum + s.saves, 0)} players={match.stats.filter(s => s.saves > 0).map(s => getPlayerName(s.playerId))} />
              </div>
            </motion.div>
          ))}
          {matches.length === 0 && (
            <div className="col-span-full text-center py-16 text-slate-500 dark:text-slate-400 bg-white dark:bg-game-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-game-800">
              <Activity size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-display font-bold uppercase tracking-widest">Chưa có trận đấu nào</p>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {attendanceModalOpen && draft && (
        <AttendanceModal 
          date={draft.date}
          players={players}
          initialAttended={new Set(draft.stats.filter(s => s.attended).map(s => s.playerId))}
          onSave={handleSaveAttendance}
          onClose={() => setAttendanceModalOpen(false)}
        />
      )}

      {statModal && draft && (
        <StatModal
          type={statModal.type}
          action={statModal.action}
          players={players}
          matchStats={draft.stats}
          onSelect={(playerId) => handleStatChange(playerId, statModal.type, statModal.action)}
          onClose={() => setStatModal(null)}
        />
      )}

      {confirmSaveOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-game-900 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200 dark:border-game-800"
          >
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-pitch-100 dark:bg-neon-cyan/10 text-pitch-600 dark:text-neon-cyan rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-12">
                <Save size={40} strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-display font-black text-slate-800 dark:text-white mb-2 uppercase tracking-wider">Lưu trận đấu?</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">
                Dữ liệu sẽ được cập nhật vào bảng xếp hạng tổng.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setConfirmSaveOpen(false)}
                  className="flex-1 py-4 rounded-xl font-display font-bold uppercase tracking-wider bg-slate-100 dark:bg-game-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-game-700 transition-colors"
                >
                  Hủy
                </button>
                <button 
                  onClick={handleConfirmSave}
                  className="flex-1 py-4 rounded-xl font-display font-bold uppercase tracking-wider bg-pitch-500 dark:bg-neon-cyan text-white dark:text-game-950 hover:bg-pitch-600 dark:hover:bg-cyan-400 transition-colors shadow-lg"
                >
                  Đồng ý
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {deletingMatch && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-game-900 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200 dark:border-game-800"
          >
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 -rotate-12">
                <AlertTriangle size={40} strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-display font-black text-slate-800 dark:text-white mb-2 uppercase tracking-wider">Xóa trận đấu?</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">
                Xóa dữ liệu ngày <span className="font-bold text-slate-800 dark:text-white">{format(new Date(deletingMatch.date), 'dd/MM/yyyy')}</span>? Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeletingMatch(null)}
                  className="flex-1 py-4 rounded-xl font-display font-bold uppercase tracking-wider bg-slate-100 dark:bg-game-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-game-700 transition-colors"
                >
                  Hủy
                </button>
                <button 
                  onClick={handleConfirmDelete}
                  className="flex-1 py-4 rounded-xl font-display font-bold uppercase tracking-wider bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg"
                >
                  Xóa
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function StatSummary({ label, value, players }: { label: string, value: number, players: string[] }) {
  return (
    <div className="flex flex-col items-center px-2">
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</div>
      <div className="text-3xl font-display font-black text-slate-800 dark:text-white">{value}</div>
      <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-tight">
        {players.join(', ') || '-'}
      </div>
    </div>
  );
}

function StatControl({ label, value, onAdd, onRemove, color }: { label: string, value: number, onAdd: () => void, onRemove: () => void, color: 'blue' | 'purple' | 'orange' }) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/50 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-900/50 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-900/50 text-orange-600 dark:text-orange-400',
  };

  const btnColors = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/50 text-blue-700 dark:text-blue-300',
    purple: 'bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-800/50 text-purple-700 dark:text-purple-300',
    orange: 'bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-800/50 text-orange-700 dark:text-orange-300',
  };

  return (
    <div className={`flex flex-col items-center rounded-3xl p-4 border-2 ${colorClasses[color]}`}>
      <button 
        onClick={onAdd}
        className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all active:scale-90 shadow-sm ${btnColors[color]}`}
      >
        <Plus size={32} strokeWidth={3} />
      </button>
      
      <div className="my-6 text-center">
        <div className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">{label}</div>
        <div className="text-5xl font-display font-black">{value}</div>
      </div>

      <button 
        onClick={onRemove}
        className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all active:scale-90 shadow-sm ${btnColors[color]}`}
      >
        <Minus size={32} strokeWidth={3} />
      </button>
    </div>
  );
}

function AttendanceModal({ date: initialDate, players, initialAttended, onSave, onClose }: { 
  date: string, players: Player[], initialAttended: Set<string>, onSave: (date: string, attended: Set<string>) => void, onClose: () => void 
}) {
  const [date, setDate] = useState(initialDate);
  const [attended, setAttended] = useState<Set<string>>(initialAttended);

  const togglePlayer = (id: string) => {
    const next = new Set(attended);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setAttended(next);
  };

  const toggleAll = () => {
    if (attended.size === players.length) setAttended(new Set());
    else setAttended(new Set(players.map(p => p.id)));
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div 
        initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="bg-white dark:bg-game-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-slate-200 dark:border-game-800"
      >
        <div className="p-6 border-b border-slate-100 dark:border-game-800 flex justify-between items-center">
          <h3 className="text-xl font-display font-black uppercase tracking-wider text-slate-800 dark:text-white">Điểm danh</h3>
          <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-game-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-game-700 rounded-full transition-colors">
            <X size={20} strokeWidth={3} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50 dark:bg-game-950/50">
          <div className="mb-8">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Ngày thi đấu</label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border-2 border-slate-200 dark:border-game-700 bg-white dark:bg-game-900 text-slate-900 dark:text-white rounded-xl px-4 py-4 font-display font-bold text-lg focus:outline-none focus:border-pitch-500 dark:focus:border-neon-cyan transition-colors"
            />
          </div>

          <div className="flex justify-between items-center mb-4">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Đội hình ({attended.size}/{players.length})</label>
            <button onClick={toggleAll} className="text-xs font-bold text-pitch-600 dark:text-neon-cyan uppercase tracking-wider hover:underline">
              {attended.size === players.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </button>
          </div>

          <div className="space-y-3">
            {players.map(player => (
              <div 
                key={player.id}
                onClick={() => togglePlayer(player.id)}
                className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all active:scale-[0.98] ${attended.has(player.id) ? 'border-pitch-500 bg-pitch-50 dark:bg-neon-cyan/10 dark:border-neon-cyan' : 'border-slate-200 dark:border-game-800 bg-white dark:bg-game-900 hover:border-slate-300 dark:hover:border-game-700'}`}
              >
                <div className="font-display font-bold text-lg text-slate-800 dark:text-white">{player.name}</div>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${attended.has(player.id) ? 'bg-pitch-500 dark:bg-neon-cyan text-white dark:text-game-950' : 'bg-slate-100 dark:bg-game-800 text-transparent'}`}>
                  <Check size={20} strokeWidth={4} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-game-800 bg-white dark:bg-game-900">
          <button 
            onClick={() => onSave(date, attended)}
            className="w-full bg-pitch-500 dark:bg-neon-cyan text-white dark:text-game-950 py-4 rounded-2xl font-display font-black text-lg uppercase tracking-widest hover:bg-pitch-600 dark:hover:bg-cyan-400 transition-colors shadow-lg"
          >
            Xác nhận
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function StatModal({ type, action, players, matchStats, onSelect, onClose }: {
  type: 'goals' | 'assists' | 'saves', action: 'add' | 'remove', players: Player[], matchStats: PlayerMatchStat[], onSelect: (id: string) => void, onClose: () => void
}) {
  const title = type === 'goals' ? 'Bàn thắng' : type === 'assists' ? 'Kiến tạo' : 'Cản phá';
  const isAdd = action === 'add';
  
  const availablePlayers = isAdd
    ? players.filter(p => matchStats.find(s => s.playerId === p.id)?.attended)
    : players.filter(p => (matchStats.find(s => s.playerId === p.id)?.[type] || 0) > 0);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div 
        initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="bg-white dark:bg-game-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh] border border-slate-200 dark:border-game-800"
      >
        <div className={`p-6 border-b flex justify-between items-center ${isAdd ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/50' : 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/50'}`}>
          <h3 className={`text-xl font-display font-black uppercase tracking-wider ${isAdd ? 'text-blue-700 dark:text-blue-400' : 'text-red-700 dark:text-red-400'}`}>
            {isAdd ? `Thêm ${title}` : `Bớt ${title}`}
          </h3>
          <button onClick={onClose} className="p-2 bg-white/50 dark:bg-black/20 rounded-full hover:bg-white dark:hover:bg-black/40 transition-colors">
            <X size={20} strokeWidth={3} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50 dark:bg-game-950/50">
          {availablePlayers.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-slate-400 dark:text-slate-600 mb-4">
                <Activity size={48} className="mx-auto" />
              </div>
              <p className="font-display font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                {isAdd ? 'Chưa điểm danh' : `Chưa có ${title.toLowerCase()}`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {availablePlayers.map(player => {
                const statValue = matchStats.find(s => s.playerId === player.id)?.[type] || 0;
                return (
                  <button 
                    key={player.id}
                    onClick={() => onSelect(player.id)}
                    className={`flex flex-col items-center p-5 rounded-2xl border-2 transition-all active:scale-95 bg-white dark:bg-game-900 ${isAdd ? 'border-blue-100 dark:border-blue-900/50 hover:border-blue-500 dark:hover:border-blue-400' : 'border-red-100 dark:border-red-900/50 hover:border-red-500 dark:hover:border-red-400'}`}
                  >
                    <span className="font-display font-bold text-lg text-slate-800 dark:text-white mb-1">{player.name}</span>
                    {statValue > 0 && (
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-game-800 px-2 py-1 rounded-md">
                        Đang có: {statValue}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
