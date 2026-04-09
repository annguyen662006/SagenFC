import React, { useState, useRef } from 'react';
import { Player } from '../types';
import { Plus, Trash2, Edit2, X, AlertTriangle, Users, Camera, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { resizeImage } from '../lib/imageUtils';

interface PlayersProps {
  players: Player[];
  onAddPlayer: (player: Player) => void;
  onUpdatePlayer: (player: Player) => void;
  onDeletePlayer: (id: string) => void;
}

export function Players({ players, onAddPlayer, onUpdatePlayer, onDeletePlayer }: PlayersProps) {
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [deletingPlayer, setDeletingPlayer] = useState<Player | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const resized = await resizeImage(file, 100);
        setAvatarFile(resized);
        setAvatarPreview(URL.createObjectURL(resized));
      } catch (error) {
        console.error("Error resizing image:", error);
      }
    }
  };

  const uploadAvatar = async (playerId: string): Promise<string | undefined> => {
    if (!avatarFile) return undefined;
    
    const fileExt = 'jpg';
    const fileName = `${playerId}-${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage.from('sf_avatars').upload(fileName, avatarFile);
    if (error) {
      console.error("Error uploading avatar:", error);
      return undefined;
    }
    
    if (data) {
      const { data: publicUrlData } = supabase.storage.from('sf_avatars').getPublicUrl(fileName);
      return publicUrlData.publicUrl;
    }
    return undefined;
  };

  const deleteAvatar = async (url: string) => {
    if (!url) return;
    try {
      const fileName = url.split('/').pop();
      if (fileName) {
        const { error } = await supabase.storage.from('sf_avatars').remove([fileName]);
        if (error) console.error("Error deleting avatar:", error);
      }
    } catch (error) {
      console.error("Error deleting avatar:", error);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setIsUploading(true);
    const playerId = crypto.randomUUID();
    const avatar_url = await uploadAvatar(playerId);
    
    onAddPlayer({
      id: playerId,
      name: name.trim(),
      position: position.trim() || 'Unknown',
      avatar_url
    });
    
    setName('');
    setPosition('');
    setAvatarFile(null);
    setAvatarPreview(null);
    setIsAddingPlayer(false);
    setIsUploading(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlayer || !editingPlayer.name.trim()) return;
    
    setIsUploading(true);
    let avatar_url = editingPlayer.avatar_url;
    
    if (avatarFile) {
      if (editingPlayer.avatar_url) {
        await deleteAvatar(editingPlayer.avatar_url);
      }
      const newUrl = await uploadAvatar(editingPlayer.id);
      if (newUrl) avatar_url = newUrl;
    }
    
    onUpdatePlayer({
      ...editingPlayer,
      name: editingPlayer.name.trim(),
      position: editingPlayer.position.trim() || 'Unknown',
      avatar_url
    });
    
    setEditingPlayer(null);
    setAvatarFile(null);
    setAvatarPreview(null);
    setIsUploading(false);
  };

  const openAddModal = () => {
    setName('');
    setPosition('');
    setAvatarFile(null);
    setAvatarPreview(null);
    setIsAddingPlayer(true);
  };

  const openEditModal = (player: Player) => {
    setEditingPlayer(player);
    setAvatarFile(null);
    setAvatarPreview(player.avatar_url || null);
  };

  const confirmDelete = async () => {
    if (deletingPlayer) {
      setIsDeleting(true);
      if (deletingPlayer.avatar_url) {
        await deleteAvatar(deletingPlayer.avatar_url);
      }
      onDeletePlayer(deletingPlayer.id);
      setDeletingPlayer(null);
      setIsDeleting(false);
    }
  };

  const getPositionTheme = (pos: string) => {
    const p = pos.toUpperCase();
    if (p.includes('GK')) return {
      border: 'border-yellow-200 dark:border-yellow-900/50 hover:border-yellow-500 dark:hover:border-yellow-500',
      bg: 'bg-yellow-50/50 dark:bg-yellow-900/10',
      badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      corner: 'bg-yellow-100 dark:bg-yellow-900/20 group-hover:bg-yellow-200 dark:group-hover:bg-yellow-900/40'
    };
    if (p.includes('CB') || p.includes('LB') || p.includes('RB') || p.includes('DEF')) return {
      border: 'border-blue-200 dark:border-blue-900/50 hover:border-blue-500 dark:hover:border-blue-500',
      bg: 'bg-blue-50/50 dark:bg-blue-900/10',
      badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      corner: 'bg-blue-100 dark:bg-blue-900/20 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/40'
    };
    if (p.includes('CM') || p.includes('CDM') || p.includes('CAM') || p.includes('LM') || p.includes('RM') || p.includes('MID')) return {
      border: 'border-emerald-200 dark:border-emerald-900/50 hover:border-emerald-500 dark:hover:border-emerald-500',
      bg: 'bg-emerald-50/50 dark:bg-emerald-900/10',
      badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      corner: 'bg-emerald-100 dark:bg-emerald-900/20 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/40'
    };
    if (p.includes('ST') || p.includes('CF') || p.includes('LW') || p.includes('RW') || p.includes('ATT')) return {
      border: 'border-red-200 dark:border-red-900/50 hover:border-red-500 dark:hover:border-red-500',
      bg: 'bg-red-50/50 dark:bg-red-900/10',
      badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      corner: 'bg-red-100 dark:bg-red-900/20 group-hover:bg-red-200 dark:group-hover:bg-red-900/40'
    };
    return {
      border: 'border-slate-200 dark:border-game-800 hover:border-slate-400 dark:hover:border-slate-600',
      bg: 'bg-white dark:bg-game-900',
      badge: 'bg-slate-100 text-slate-600 dark:bg-game-800 dark:text-slate-300',
      corner: 'bg-slate-100 dark:bg-game-800 group-hover:bg-slate-200 dark:group-hover:bg-game-700'
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-game-900 rounded-2xl shadow-sm border border-slate-200 dark:border-game-800 p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pitch-500/10 dark:bg-neon-cyan/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Users className="text-pitch-500 dark:text-neon-cyan" size={28} />
            <h2 className="text-2xl md:text-3xl font-display font-black uppercase tracking-wider text-slate-800 dark:text-white">
              Đội Hình <span className="text-pitch-500 dark:text-neon-cyan">Thi Đấu</span>
            </h2>
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            Quản lý danh sách cầu thủ
          </p>
        </div>
        <button 
          onClick={openAddModal}
          className="relative z-10 w-full sm:w-auto flex items-center justify-center gap-2 bg-pitch-500 hover:bg-pitch-600 dark:bg-neon-cyan dark:hover:bg-cyan-400 text-white dark:text-game-950 px-6 py-3 rounded-xl font-display font-bold uppercase tracking-wider transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.3)] dark:shadow-[0_0_20px_rgba(0,240,255,0.3)]"
        >
          <Plus size={20} strokeWidth={3} />
          <span>Thêm Cầu Thủ</span>
        </button>
      </div>

      {/* Players Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {players.map((player, idx) => {
          const theme = getPositionTheme(player.position);
          return (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              key={player.id} 
              className={`${theme.bg} rounded-2xl border-2 ${theme.border} p-3 sm:p-5 flex flex-col relative overflow-hidden group transition-colors aspect-[2/1] sm:aspect-auto`}
            >
              <div className={`absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 rounded-bl-full -z-10 transition-colors ${theme.corner}`}></div>
              
              <div className="flex justify-between items-start mb-2 sm:mb-4">
                <div className={`${theme.badge} px-2 py-1 sm:px-3 sm:py-1 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-widest`}>
                  {player.position}
                </div>
                <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => openEditModal(player)}
                    className="p-1 sm:p-1.5 text-blue-500 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                  >
                    <Edit2 size={14} className="sm:w-4 sm:h-4" />
                  </button>
                  <button 
                    onClick={() => setDeletingPlayer(player)}
                    className="p-1 sm:p-1.5 text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-md transition-colors"
                  >
                    <Trash2 size={14} className="sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
              
              <div className="mt-auto flex items-center gap-3">
                {player.avatar_url ? (
                  <img src={player.avatar_url} alt={player.name} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-white dark:border-game-800 shadow-sm shrink-0" />
                ) : (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-200 dark:bg-game-800 flex items-center justify-center border-2 border-white dark:border-game-900 shadow-sm shrink-0">
                    <Users size={16} className="text-slate-400 dark:text-slate-500" />
                  </div>
                )}
                <h3 className="text-sm sm:text-xl font-display font-bold text-slate-800 dark:text-white truncate" title={player.name}>
                  {player.name}
                </h3>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add Player Modal */}
      {isAddingPlayer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-game-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 dark:border-game-800"
          >
            <div className="p-6 border-b border-slate-100 dark:border-game-800 flex justify-between items-center bg-slate-50 dark:bg-game-950/50">
              <h3 className="text-xl font-display font-black uppercase tracking-wider text-slate-800 dark:text-white">Thêm cầu thủ mới</h3>
              <button onClick={() => setIsAddingPlayer(false)} className="p-2 bg-slate-200 dark:bg-game-800 text-slate-500 hover:bg-slate-300 dark:hover:bg-game-700 rounded-full transition-colors">
                <X size={20} strokeWidth={3} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-6">
              <div className="flex flex-col items-center mb-6">
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-24 h-24 rounded-full bg-slate-100 dark:bg-game-800 border-2 border-dashed border-slate-300 dark:border-game-700 flex items-center justify-center cursor-pointer hover:border-pitch-500 dark:hover:border-neon-cyan transition-colors overflow-hidden group"
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera size={32} className="text-slate-400 group-hover:text-pitch-500 dark:group-hover:text-neon-cyan transition-colors" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={24} className="text-white" />
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-widest font-bold">Ảnh đại diện (Tùy chọn)</p>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Tên cầu thủ</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nhập tên..."
                    className="w-full border-2 border-slate-200 dark:border-game-700 bg-slate-50 dark:bg-game-950 text-slate-900 dark:text-white rounded-xl px-4 py-3 font-display font-bold focus:outline-none focus:border-pitch-500 dark:focus:border-neon-cyan transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Vị trí</label>
                  <input 
                    type="text" 
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="VD: ST, CM, CB..."
                    className="w-full border-2 border-slate-200 dark:border-game-700 bg-slate-50 dark:bg-game-950 text-slate-900 dark:text-white rounded-xl px-4 py-3 font-display font-bold focus:outline-none focus:border-pitch-500 dark:focus:border-neon-cyan transition-colors"
                  />
                </div>
              </div>
              <div className="mt-8 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsAddingPlayer(false)}
                  disabled={isUploading}
                  className="flex-1 py-4 rounded-xl font-display font-bold uppercase tracking-wider bg-slate-100 dark:bg-game-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-game-700 transition-colors disabled:opacity-50"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 py-4 rounded-xl font-display font-bold uppercase tracking-wider bg-pitch-500 dark:bg-neon-cyan text-white dark:text-game-950 hover:bg-pitch-600 dark:hover:bg-cyan-400 transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isUploading ? <Loader2 size={20} className="animate-spin" /> : 'Thêm cầu thủ'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Player Modal */}
      {editingPlayer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-game-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 dark:border-game-800"
          >
            <div className="p-6 border-b border-slate-100 dark:border-game-800 flex justify-between items-center bg-slate-50 dark:bg-game-950/50">
              <h3 className="text-xl font-display font-black uppercase tracking-wider text-slate-800 dark:text-white">Sửa thông tin</h3>
              <button onClick={() => setEditingPlayer(null)} className="p-2 bg-slate-200 dark:bg-game-800 text-slate-500 hover:bg-slate-300 dark:hover:bg-game-700 rounded-full transition-colors">
                <X size={20} strokeWidth={3} />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6">
              <div className="flex flex-col items-center mb-6">
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-24 h-24 rounded-full bg-slate-100 dark:bg-game-800 border-2 border-dashed border-slate-300 dark:border-game-700 flex items-center justify-center cursor-pointer hover:border-pitch-500 dark:hover:border-neon-cyan transition-colors overflow-hidden group"
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera size={32} className="text-slate-400 group-hover:text-pitch-500 dark:group-hover:text-neon-cyan transition-colors" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={24} className="text-white" />
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-widest font-bold">Ảnh đại diện (Tùy chọn)</p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Tên cầu thủ</label>
                  <input 
                    type="text" 
                    value={editingPlayer.name}
                    onChange={(e) => setEditingPlayer({ ...editingPlayer, name: e.target.value })}
                    className="w-full border-2 border-slate-200 dark:border-game-700 bg-slate-50 dark:bg-game-950 text-slate-900 dark:text-white rounded-xl px-4 py-3 font-display font-bold focus:outline-none focus:border-pitch-500 dark:focus:border-neon-cyan transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Vị trí</label>
                  <input 
                    type="text" 
                    value={editingPlayer.position}
                    onChange={(e) => setEditingPlayer({ ...editingPlayer, position: e.target.value })}
                    className="w-full border-2 border-slate-200 dark:border-game-700 bg-slate-50 dark:bg-game-950 text-slate-900 dark:text-white rounded-xl px-4 py-3 font-display font-bold focus:outline-none focus:border-pitch-500 dark:focus:border-neon-cyan transition-colors"
                  />
                </div>
              </div>
              <div className="mt-8 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setEditingPlayer(null)}
                  disabled={isUploading}
                  className="flex-1 py-4 rounded-xl font-display font-bold uppercase tracking-wider bg-slate-100 dark:bg-game-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-game-700 transition-colors disabled:opacity-50"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 py-4 rounded-xl font-display font-bold uppercase tracking-wider bg-pitch-500 dark:bg-neon-cyan text-white dark:text-game-950 hover:bg-pitch-600 dark:hover:bg-cyan-400 transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isUploading ? <Loader2 size={20} className="animate-spin" /> : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingPlayer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-game-900 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200 dark:border-game-800"
          >
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 -rotate-12">
                <AlertTriangle size={40} strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-display font-black text-slate-800 dark:text-white mb-2 uppercase tracking-wider">Xóa cầu thủ?</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">
                Bạn có chắc chắn muốn xóa <span className="font-bold text-slate-800 dark:text-white">{deletingPlayer.name}</span> khỏi đội hình?
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeletingPlayer(null)}
                  className="flex-1 py-4 rounded-xl font-display font-bold uppercase tracking-wider bg-slate-100 dark:bg-game-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-game-700 transition-colors"
                >
                  Hủy
                </button>
                <button 
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 py-4 rounded-xl font-display font-bold uppercase tracking-wider bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? <Loader2 size={20} className="animate-spin" /> : 'Xóa'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
