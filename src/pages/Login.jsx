import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic, Lock, User, Sparkles, ArrowRight } from 'lucide-react';
import { useAppAuth, DEMO_USER } from '@/lib/appAuth';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAppAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleDemoLogin = () => {
    login(DEMO_USER);
    navigate('/');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('ユーザー名とパスワードを入力してください。');
      return;
    }
    login({ ...DEMO_USER, name: username.trim() });
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6F7F9] px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-navy flex items-center justify-center shadow-lg shadow-navy/20 mb-4">
            <Mic className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-navy tracking-tight">面接マスター</h1>
          <p className="text-sm text-slate-500 mt-1">
            AI Interview practice with live keigo detection, captions, and instant evaluation.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8">
          <div className="mb-6 text-center">
            <h2 className="text-lg font-semibold text-navy">ようこそ</h2>
            <p className="text-sm text-slate-500 mt-1">Sign in to begin your practice session</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">ユーザー名 / Username</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Yamada Taro"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-sm text-navy placeholder:text-slate-300 focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">パスワード / Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-sm text-navy placeholder:text-slate-300 focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 transition"
                />
              </div>
            </div>

            {error && <p className="text-xs text-crimson">{error}</p>}

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-navy text-white text-sm font-semibold hover:bg-navy-light transition flex items-center justify-center gap-2"
            >
              サインイン <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px flex-1 bg-slate-100" />
            <span className="text-xs text-slate-400">または / or</span>
            <div className="h-px flex-1 bg-slate-100" />
          </div>

          <button
            onClick={handleDemoLogin}
            className="w-full py-2.5 rounded-lg bg-crimson text-white text-sm font-semibold hover:bg-crimson-light transition flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> デモログイン (Demo Login)
          </button>
          <p className="text-[11px] text-slate-400 text-center mt-3">
            Demo candidate: Yamada Taro · JLPT N2 Level
          </p>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          © 2026 面接マスター · 面接対策プラットフォーム
        </p>
      </motion.div>
    </div>
  );
}