import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic, Clock, MessageSquare, CheckCircle2, ArrowRight, TrendingUp, Award } from 'lucide-react';
import { useAppAuth } from '@/lib/appAuth';

function ScoreRing({ score }) {
  const radius = 52;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="relative w-36 h-36">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#E8ECF1" strokeWidth="10" />
        <motion.circle
          cx="60" cy="60" r={radius} fill="none" stroke="#1B2A4A" strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-navy">{score}</span>
        <span className="text-[11px] text-slate-400 font-medium">就活準備度</span>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm shadow-slate-200/40"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-navy">{value}</p>
      <p className="text-xs font-medium text-slate-600 mt-0.5">{label}</p>
      <p className="text-[11px] text-slate-400">{sub}</p>
    </motion.div>
  );
}

export default function Dashboard() {
  const { user } = useAppAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-navy to-navy-light rounded-2xl p-6 text-white"
      >
        <p className="text-sm text-white/70">おかえりなさい</p>
        <h2 className="text-xl font-bold mt-0.5">{user?.nameJp}さん、今日も頑張りましょう</h2>
        <p className="text-sm text-white/60 mt-1">Let's continue your interview preparation journey.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm shadow-slate-200/40 flex flex-col items-center"
        >
          <p className="text-sm font-semibold text-navy mb-1">候補者準備度スコア</p>
          <p className="text-[11px] text-slate-400 mb-4">Candidate Readiness Score</p>
          <ScoreRing score={78} />
          <div className="flex items-center gap-1.5 mt-3 text-xs text-emerald-600 font-medium">
            <TrendingUp className="w-3.5 h-3.5" /> +6% from last week
          </div>
        </motion.div>

        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatCard icon={MessageSquare} label="面接完了" sub="Interviews Completed" value="12" color="bg-blue-50 text-blue-600" />
          <StatCard icon={Award} label="敬語正答率" sub="Keigo Accuracy Rate" value="84%" color="bg-emerald-50 text-emerald-600" />
          <StatCard icon={Clock} label="練習時間" sub="Total Practice Time" value="3.5h" color="bg-amber-50 text-amber-600" />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm shadow-slate-200/40"
      >
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-crimson/10 flex items-center justify-center">
              <Mic className="w-6 h-6 text-crimson" />
            </div>
            <div>
              <h3 className="text-base font-bold text-navy">AI面接を今すぐ開始</h3>
              <p className="text-sm text-slate-500 mt-0.5">Start an AI voice interview session right now.</p>
              <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> 5 questions · ~10 min · ja-JP
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/interview')}
            className="px-5 py-2.5 rounded-xl bg-navy text-white text-sm font-semibold hover:bg-navy-light transition flex items-center gap-2"
          >
            面接開始 <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm shadow-slate-200/40"
        >
          <h3 className="text-sm font-bold text-navy mb-3">最近の練習 / Recent Activity</h3>
          <div className="space-y-2.5">
            {[
              { q: '自己紹介をお願いします', score: 8, date: '2 days ago' },
              { q: '志望動機を教えてください', score: 7, date: '4 days ago' },
              { q: ' strengths and weaknesses', score: 6, date: '1 week ago' },
            ].map((r, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <p className="text-sm text-slate-600 truncate pr-2">{r.q}</p>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${r.score >= 8 ? 'bg-emerald-50 text-emerald-600' : r.score >= 6 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>{r.score}/10</span>
                  <span className="text-[11px] text-slate-400">{r.date}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm shadow-slate-200/40"
        >
          <h3 className="text-sm font-bold text-navy mb-3">おすすめ / Recommendations</h3>
          <div className="space-y-2.5">
            {[
              'Keigo: practice 謙譲語 (kenjōgo) for self-introduction',
              'Bowing: review 30° keirei before entering the room',
              'Structuring: use PREP framework for answers',
            ].map((t, i) => (
              <div key={i} className="flex items-start gap-2.5 py-1.5">
                <div className="w-5 h-5 rounded-full bg-navy/10 text-navy text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</div>
                <p className="text-sm text-slate-600">{t}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}