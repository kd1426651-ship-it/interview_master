import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, AlertCircle, RotateCcw, MessageCircleQuestion } from 'lucide-react';

export default function FeedbackPanel({ feedback, transcript, onNext, onRestart, onFollowUp, isLast }) {
  const score = Math.round(Number(feedback.score) || 0);
  const label = score >= 8 ? '優れた回答 / Excellent' : score >= 6 ? '良好 / Good' : '要改善 / Needs work';
  const tone = score >= 8 ? 'bg-emerald-50 text-emerald-600' : score >= 6 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600';

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* Score */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm shadow-slate-200/40">
        <h3 className="text-sm font-bold text-navy mb-3">評価スコア / Evaluation</h3>
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center ${tone}`}>
            <span className="text-2xl font-bold leading-none">{score}</span>
            <span className="text-[10px] font-medium opacity-70">/ 10</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-navy">{label}</p>
            <div className="h-1.5 w-40 bg-slate-100 rounded-full overflow-hidden mt-2">
              <motion.div
                className="h-full bg-navy rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${score * 10}%` }}
                transition={{ delay: 0.2 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Keigo correction */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm shadow-slate-200/40">
        <h3 className="text-sm font-bold text-navy mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-crimson" /> 敬語・文法修正 / Keigo Correction
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-rose-50/50 rounded-xl p-3 border border-rose-100">
            <p className="text-[11px] font-semibold text-rose-500 mb-1.5">あなたの回答</p>
            <p className="text-sm text-slate-600 leading-relaxed">{transcript}</p>
          </div>
          <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100">
            <p className="text-[11px] font-semibold text-emerald-600 mb-1.5">修正後 (正式な日本語)</p>
            <p className="text-sm text-slate-700 leading-relaxed">{feedback.corrected}</p>
          </div>
        </div>
        {feedback.corrections?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {feedback.corrections.map((c, i) => (
              <span key={i} className="text-[11px] px-2 py-1 rounded-md bg-slate-100 text-slate-600">
                <span className="line-through text-rose-400">{c.from}</span> →{' '}
                <span className="text-emerald-600 font-medium">{c.to}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      {feedback.tips?.length > 0 && (
        <div className="bg-navy rounded-2xl p-5 text-white">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-crimson-light" /> アドバイス / Coaching tips
          </h3>
          <div className="space-y-2">
            {feedback.tips.map((t, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-white/80">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> {t}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Follow-up */}
      {feedback.followUp && (
        <div className="bg-crimson/5 border border-crimson/20 rounded-2xl p-5">
          <p className="text-[11px] font-semibold text-crimson flex items-center gap-1.5">
            <MessageCircleQuestion className="w-4 h-4" /> 深掘り質問 / Follow-up question
          </p>
          <p className="text-sm font-medium text-navy mt-1.5">{feedback.followUp}</p>
          <button
            onClick={onFollowUp}
            className="mt-3 px-4 py-2 rounded-lg bg-crimson text-white text-xs font-semibold hover:bg-crimson-light transition"
          >
            この質問に答える →
          </button>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onRestart}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" /> やり直す
        </button>
        <button
          onClick={onNext}
          className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition ${
            isLast ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-navy hover:bg-navy-light'
          }`}
        >
          {isLast ? '面接完了 →' : '次の質問へ →'}
        </button>
      </div>
    </motion.div>
  );
}