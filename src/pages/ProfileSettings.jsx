import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Save, RotateCcw, LogOut, Mic, CheckCircle2, Globe } from 'lucide-react';
import { useAppAuth } from '@/lib/appAuth';

const INDUSTRIES = ['IT / Tech', 'Service', 'Manufacturing', 'Finance', 'Retail', 'Media'];
const LEVELS = ['N1', 'N2', 'N3'];

export default function ProfileSettings() {
  const { user, updateUser, logout } = useAppAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name || '',
    nameJp: user?.nameJp || '',
    industry: user?.industry || 'IT',
    level: user?.level || 'N2',
    sttLang: user?.sttLang || 'ja-JP',
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateUser(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleResetHistory = () => {
    if (window.confirm('練習履歴をリセットしますか？ / Reset all practice history?')) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="space-y-5">
      {/* Profile editor */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm shadow-slate-200/40"
      >
        <div className="flex items-center gap-2 mb-5">
          <User className="w-4 h-4 text-navy" />
          <h3 className="text-sm font-bold text-navy">候補者情報 / Candidate Profile</h3>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-navy-light text-white flex items-center justify-center text-xl font-bold">
            {user?.avatar || 'U'}
          </div>
          <div>
            <p className="text-base font-bold text-navy">{form.nameJp || form.name}</p>
            <p className="text-xs text-slate-400">JLPT {form.level} · {form.industry}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">お名前 (English)</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-sm text-navy focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">お名前 (日本語)</label>
            <input
              value={form.nameJp}
              onChange={(e) => setForm({ ...form, nameJp: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-sm text-navy focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">志望業界 / Target Industry</label>
            <select
              value={form.industry}
              onChange={(e) => setForm({ ...form, industry: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-sm text-navy focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
            >
              {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">日本語レベル / JLPT Level</label>
            <div className="flex gap-2">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  onClick={() => setForm({ ...form, level: l })}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
                    form.level === l ? 'bg-navy text-white' : 'bg-slate-50 text-slate-500 border border-slate-200'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="mt-5 px-5 py-2.5 rounded-xl bg-navy text-white text-sm font-semibold hover:bg-navy-light transition flex items-center gap-2"
        >
          {saved ? <><CheckCircle2 className="w-4 h-4" /> 保存しました</> : <><Save className="w-4 h-4" /> 保存 / Save</>}
        </button>
      </motion.div>

      {/* Audio & STT settings */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm shadow-slate-200/40"
      >
        <div className="flex items-center gap-2 mb-5">
          <Mic className="w-4 h-4 text-navy" />
          <h3 className="text-sm font-bold text-navy">音声・音声認識 / Audio & Speech-to-Text</h3>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> 認識言語 / Recognition Language</label>
          <div className="flex gap-2">
            <button
              onClick={() => setForm({ ...form, sttLang: 'ja-JP' })}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${form.sttLang === 'ja-JP' ? 'bg-navy text-white' : 'bg-slate-50 text-slate-500 border border-slate-200'}`}
            >
              日本語 (ja-JP)
            </button>
            <button
              onClick={() => setForm({ ...form, sttLang: 'en-US' })}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${form.sttLang === 'en-US' ? 'bg-navy text-white' : 'bg-slate-50 text-slate-500 border border-slate-200'}`}
            >
              English (en-US)
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Default: Japanese (ja-JP). Switch if you want to practice in English.</p>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm shadow-slate-200/40"
      >
        <h3 className="text-sm font-bold text-navy mb-4">データ・アカウント / Data & Account</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleResetHistory}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> 履歴をリセット / Reset History
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 py-2.5 rounded-xl bg-crimson text-white text-sm font-semibold hover:bg-crimson-light transition flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" /> ログアウト / Logout
          </button>
        </div>
      </motion.div>
    </div>
  );
}