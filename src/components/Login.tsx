import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { AppUser } from '../types';
import { Lock, User } from 'lucide-react';
import { motion } from 'motion/react';

export function Login({ onLogin }: { onLogin: (user: AppUser) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !password) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('sf_login_user', {
        p_username: username,
        p_password: password
      });

      if (error) throw error;

      if (data && data.success) {
        onLogin(data.user);
      } else {
        setError(data?.message || 'Đăng nhập thất bại');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Có lỗi xảy ra khi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-game-900 rounded-3xl shadow-xl dark:shadow-2xl border border-slate-200 dark:border-game-800 p-8"
      >
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-pitch-100 dark:bg-game-800 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-pitch-600 dark:text-neon-cyan" />
          </div>
          <h2 className="text-2xl font-display font-black text-slate-800 dark:text-white uppercase tracking-wide">
            Đăng nhập hệ thống
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Khu vực dành cho Ban Quản Trị và Quản lý Đội bóng
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 text-sm rounded flex items-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
              Tên đăng nhập
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-game-700 rounded-xl bg-slate-50 dark:bg-game-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-pitch-500 dark:focus:ring-neon-cyan focus:border-transparent transition-all outline-none"
                placeholder="Nhập username"
                autoCapitalize="none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
              Mật khẩu
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-game-700 rounded-xl bg-slate-50 dark:bg-game-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-pitch-500 dark:focus:ring-neon-cyan focus:border-transparent transition-all outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3.5 px-4 rounded-xl shadow-lg border border-transparent text-sm font-bold uppercase tracking-wider text-white bg-gradient-to-r from-pitch-600 to-emerald-500 hover:from-pitch-500 hover:to-emerald-400 dark:from-neon-cyan dark:to-blue-500 dark:hover:from-[#00F0FF] dark:hover:to-[#3b82f6] dark:text-game-950 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pitch-500 dark:focus:ring-neon-cyan transition-all disabled:opacity-70"
          >
            {loading ? 'Đang xác thực...' : 'Đăng nhập'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
