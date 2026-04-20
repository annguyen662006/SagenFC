import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AppUser } from '../types';
import { UserPlus, Shield, Clock, Calendar, Search, ShieldCheck, UserX, UserCheck, Trash2, User } from 'lucide-react';

export function AdminPanel() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUsername, setNewUsername] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'user'>('user');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('sf_users')
        .select('id, username, role, status, last_login, total_time, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data as AppUser[]);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError('Lỗi khi tải danh sách người dùng: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;
    
    setCreating(true);
    setError('');
    setSuccessMsg('');

    try {
      const { data, error } = await supabase.rpc('sf_create_user', {
        p_username: newUsername.trim(),
        p_password: '123456@',
        p_role: newRole
      });

      if (error) throw error;

      if (data && data.success) {
        setSuccessMsg(`Đã tạo tài khoản "${newUsername.trim()}" thành công với mật khẩu mặc định.`);
        setNewUsername('');
        fetchUsers();
      } else {
        setError(data?.message || 'Không thể tạo tài khoản');
      }
    } catch (err: any) {
      console.error('Error creating user:', err);
      setError('Lỗi khi tạo tài khoản: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const { data, error } = await supabase.rpc('sf_update_user_status', {
        p_id: id,
        p_status: newStatus
      });
      if (error) throw error;
      if (data && data.success) {
        setUsers(users.map(u => u.id === id ? { ...u, status: newStatus as any } : u));
      } else {
        alert(data?.message || 'Không thể cập nhật trạng thái');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi hệ thống');
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Chưa đăng nhập';
    return new Date(dateStr).toLocaleString('vi-VN');
  };

  const formatTime = (seconds?: number) => {
    if (!seconds) return '0 phút';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}p`;
    return `${mins} phút`;
  };

  return (
    <div className="space-y-8">
      {error && <div className="p-4 bg-red-100 text-red-800 rounded-xl font-bold">{error}</div>}
      {successMsg && <div className="p-4 bg-emerald-100 text-emerald-800 rounded-xl font-bold">{successMsg}</div>}

      <div className="bg-white dark:bg-game-900 rounded-3xl p-6 md:p-8 shadow-xl border border-slate-200 dark:border-game-800">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-pitch-600 dark:text-neon-cyan" />
          <h2 className="text-2xl font-display font-black uppercase tracking-wider text-slate-800 dark:text-white">Tạo Tài Khoản Mới</h2>
        </div>
        
        <form onSubmit={handleCreateUser} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full relative">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Tên đăng nhập mới</label>
            <input 
              type="text" 
              value={newUsername}
              onChange={e => setNewUsername(e.target.value)}
              className="w-full bg-slate-50 dark:bg-game-950 border border-slate-300 dark:border-game-700 rounded-xl px-4 py-3 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-pitch-500 transition-all font-mono"
              placeholder="VD: nguyenvan_a"
              autoCapitalize="none"
              required
            />
          </div>
          <div className="w-full md:w-48 relative">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Vai trò</label>
            <select
              value={newRole}
              onChange={e => setNewRole(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-game-950 border border-slate-300 dark:border-game-700 rounded-xl px-4 py-3 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-pitch-500 transition-all font-bold"
            >
              <option value="user">Người dùng</option>
              <option value="admin">Quản trị viên</option>
            </select>
          </div>
          <button 
            type="submit"
            disabled={creating}
            className="w-full md:w-auto bg-gradient-to-r from-pitch-600 to-emerald-500 text-white rounded-xl px-6 py-3 font-bold uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <UserPlus size={18} />
            {creating ? 'Đang tạo...' : 'Tạo mới'}
          </button>
        </form>
        <p className="text-xs text-slate-500 mt-4 italic">* Tài khoản mới tạo sẽ có mật khẩu mặc định là: <strong className="text-slate-700 dark:text-slate-300">123456@</strong></p>
      </div>

      <div className="bg-white dark:bg-game-900 rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-game-800">
        <div className="p-6 md:p-8 border-b border-slate-200 dark:border-game-800 flex items-center gap-3">
          <Search className="w-6 h-6 text-slate-400" />
          <h2 className="text-xl font-display font-black uppercase tracking-wider text-slate-800 dark:text-white">Danh sách tài khoản</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-game-950/50 text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest border-b border-slate-200 dark:border-game-800">
                <th className="p-4 sm:p-6">Tên đăng nhập</th>
                <th className="p-4 sm:p-6 text-center">Vai trò</th>
                <th className="p-4 sm:p-6 text-center">Trạng thái</th>
                <th className="p-4 sm:p-6 text-center">Lần cuối ID</th>
                <th className="p-4 sm:p-6 text-center">Tổng thời gian</th>
                <th className="p-4 sm:p-6 text-center">Ngày tạo</th>
                <th className="p-4 sm:p-6 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-game-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">Đang tải dữ liệu...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">Chưa có tài khoản nào.</td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-game-800/10 transition-colors">
                    <td className="p-4 sm:p-6 font-bold text-slate-800 dark:text-white font-mono">{user.username}</td>
                    <td className="p-4 sm:p-6 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${user.role === 'admin' ? 'bg-pitch-100 text-pitch-700 dark:bg-neon-cyan/20 dark:text-neon-cyan' : 'bg-slate-100 text-slate-500 dark:bg-game-800 dark:text-slate-400'}`}>
                        {user.role === 'admin' ? <ShieldCheck size={14} /> : <User size={14} />}
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 sm:p-6 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${user.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'}`}>
                        {user.status === 'active' ? 'Hoạt động' : 'Bị khóa'}
                      </span>
                    </td>
                    <td className="p-4 sm:p-6 text-center">
                      <div className="flex flex-col items-center text-sm text-slate-500 dark:text-slate-400 font-mono">
                        <Clock size={14} className="mb-1" />
                        {formatDate(user.last_login)}
                      </div>
                    </td>
                    <td className="p-4 sm:p-6 text-center font-mono text-sm font-bold text-slate-600 dark:text-slate-300">
                      {formatTime(user.total_time)}
                    </td>
                    <td className="p-4 sm:p-6 text-center">
                      <div className="flex flex-col items-center text-sm text-slate-500 dark:text-slate-400 font-mono">
                        <Calendar size={14} className="mb-1" />
                        {new Date(user.created_at).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="p-4 sm:p-6 text-center">
                      <button 
                        onClick={() => toggleStatus(user.id, user.status)}
                        className={`p-2 rounded-xl border transition-all ${user.status === 'active' ? 'border-red-200 text-red-500 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/30' : 'border-emerald-200 text-emerald-500 hover:bg-emerald-50 dark:border-emerald-900/50 dark:hover:bg-emerald-900/30'}`}
                        title={user.status === 'active' ? 'Khóa tài khoản' : 'Kích hoạt lại'}
                      >
                        {user.status === 'active' ? <UserX size={18} /> : <UserCheck size={18} />}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
