import React from 'react';
import { motion } from 'framer-motion';
import { Video as VideoIcon, AlertCircle } from 'lucide-react';
import InterviewTypeSelector from '@/components/video/InterviewTypeSelector';

const LEVELS = ['N4', 'N3', 'N2', 'N1'];
const FOCUS_OPTIONS = ['志望動機', '敬語', 'コミュニケーション', '職務経験', 'PREP法', '技術スキル', 'シフト・勤務条件', '問題解決', '学業・研究'];

const PRESETS = [
  {
    id: 'conbini',
    label: 'コンビニ・アルバイト',
    sub: 'N2 · シフト対応 & 敬語',
    values: {
      interviewType: 'part_time',
      industryRole: 'コンビニスタッフ',
      japaneseLevel: 'N2',
      focusArea: 'シフト・勤務条件',
      questionCount: 4,
      personaInstruction:
        'Act as a friendly store manager. Ask 3-4 questions focused on available work hours, commute time, customer service attitude, and reason for applying. Use polite, encouraging Japanese at JLPT N2 level.',
    },
  },
  {
    id: 'frontend',
    label: 'IT・フロントエンド',
    sub: 'N1 · 実務経験 & PREP法',
    values: {
      interviewType: 'full_time',
      industryRole: 'Webフロントエンドエンジニア',
      japaneseLevel: 'N1',
      focusArea: 'PREP法',
      questionCount: 4,
      personaInstruction:
        'Act as a strict IT HR Director or Tech Lead. Ask structured questions evaluating past project experience, problem-solving skills, and career goals. Require strict sonkeigo and kenjougo throughout.',
    },
  },
];
const ROLE_SUGGESTIONS = {
  part_time: ['コンビニ', 'カフェ・飲食', 'アパレル', 'ホテル'],
  full_time: ['ITエンジニア', '営業', '一般事務', 'ホテルフロント'],
  university: ['経済学部', '情報工学', '文学部', '国際関係'],
};

export default function InterviewSetup({ survey, onChange, onStart, loading, error }) {
  const ready = survey.interviewType && survey.industryRole.trim();
  const suggestions = ROLE_SUGGESTIONS[survey.interviewType] || [];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-navy mb-2">プリセット / Quick start</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PRESETS.map((p) => {
            const active = survey.personaInstruction === p.values.personaInstruction;
            return (
              <button
                key={p.id}
                onClick={() => onChange({ ...survey, ...p.values })}
                className={`text-left rounded-xl border px-4 py-3 transition ${
                  active
                    ? 'border-crimson bg-crimson/5 ring-1 ring-crimson/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <p className="text-xs font-bold text-navy">{p.label}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{p.sub}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-navy mb-3">面接の種類 / Interview type</h3>
        <InterviewTypeSelector
          selected={survey.interviewType}
          onSelect={(id) => onChange({ ...survey, interviewType: id, industryRole: '', personaInstruction: '' })}
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm shadow-slate-200/40 space-y-4">
        <div>
          <label className="block text-xs font-bold text-navy mb-2">
            志望業界・職種 / Target industry or role <span className="text-crimson">*</span>
          </label>
          <input
            type="text"
            value={survey.industryRole}
            onChange={(e) => onChange({ ...survey, industryRole: e.target.value, personaInstruction: '' })}
            placeholder="例：コンビニ / ITエンジニア / ホテルフロント"
            maxLength={40}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-navy placeholder:text-slate-300 focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
          />
          {suggestions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => onChange({ ...survey, industryRole: s, personaInstruction: '' })}
                  className="text-[11px] px-2 py-1 rounded-md bg-slate-100 text-slate-600 hover:bg-navy hover:text-white transition"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-bold text-navy mb-2">日本語レベル / Japanese level</p>
          <div className="flex flex-wrap gap-2">
            {LEVELS.map((lv) => (
              <button
                key={lv}
                onClick={() => onChange({ ...survey, japaneseLevel: lv, personaInstruction: '' })}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  survey.japaneseLevel === lv
                    ? 'bg-navy text-white border-navy'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                }`}
              >
                {lv}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">質問と評価の言葉遣いがこのレベルに合わせて調整されます。</p>
        </div>

        <div>
          <p className="text-xs font-bold text-navy mb-2">重視したいポイント / Focus area</p>
          <div className="flex flex-wrap gap-2">
            {FOCUS_OPTIONS.map((f) => (
              <button
                key={f}
                onClick={() => onChange({ ...survey, focusArea: f, personaInstruction: '' })}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                  survey.focusArea === f
                    ? 'bg-crimson text-white border-crimson'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-crimson bg-crimson/5 border border-crimson/20 rounded-xl px-3 py-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onStart}
        disabled={!ready || loading}
        className="w-full py-3.5 rounded-xl bg-crimson text-white text-sm font-bold hover:bg-crimson-light transition flex items-center justify-center gap-2 shadow-lg shadow-crimson/20 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
            />
            AI面接官を準備中... / Preparing interviewer
          </>
        ) : (
          <>
            <VideoIcon className="w-5 h-5" /> 面接を開始する / Start Interview
          </>
        )}
      </motion.button>

      {!ready && !loading && (
        <p className="text-center text-[11px] text-slate-400">
          面接の種類と志望業界・職種を入力すると開始できます。
        </p>
      )}
    </div>
  );
}