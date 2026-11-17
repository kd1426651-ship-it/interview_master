import React from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';
import PersonalFields from '@/components/resume/PersonalFields';
import PhotoUpload from '@/components/resume/PhotoUpload';
import EntryList from '@/components/resume/EntryList';
import ResumeField from '@/components/resume/ResumeField';

function Area({ label, hint, value, onChange, rows = 3, placeholder }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <label className="text-[11px] font-medium text-slate-500">{label}</label>
        {hint && <span className="text-[10px] text-slate-400">{hint}</span>}
      </div>
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/50 text-sm text-navy placeholder:text-slate-300 focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 resize-y"
      />
    </div>
  );
}

function Section({ title, sub, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm shadow-slate-200/40 space-y-3">
      <div>
        <p className="text-sm font-bold text-navy">{title}</p>
        {sub && <p className="text-[11px] text-slate-400">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

export default function ResumeForm({ input, onChange, onGenerate, loading, error }) {
  const set = (patch) => onChange({ ...input, ...patch });

  return (
    <div className="space-y-4">
      <Section title="基本情報" sub="Personal information">
        <PersonalFields personal={input.personal} onChange={(personal) => set({ personal })} />
        <PhotoUpload photo={input.photo} onChange={(photo) => set({ photo })} />
      </Section>

      <Section title="学歴・職歴・資格" sub="Chronological order — year and month">
        <EntryList
          title="学歴"
          hint="○○高等学校 入学 / 卒業"
          items={input.education}
          onChange={(education) => set({ education })}
          addLabel="学歴を追加"
        />
        <EntryList
          title="職歴"
          hint="○○株式会社 入社 / 退職"
          items={input.work}
          onChange={(work) => set({ work })}
          addLabel="職歴を追加"
        />
        <EntryList
          title="免許・資格"
          hint="日本語能力試験 JLPT N2 合格"
          items={input.qualifications}
          onChange={(qualifications) => set({ qualifications })}
          addLabel="資格を追加"
        />
      </Section>

      <Section title="自己PR・志望動機の素材" sub="AI writes these in polite Japanese (PREP structure)">
        <ResumeField
          label="志望職種・業界 / Desired role"
          value={input.desiredRole}
          onChange={(desiredRole) => set({ desiredRole })}
          placeholder="例：Webエンジニア"
          maxLength={60}
        />
        <Area
          label="技術・スキル / Technical skills"
          value={input.skills}
          onChange={(skills) => set({ skills })}
          placeholder="例：JavaScript, React, SQL — 実務3年"
        />
        <Area
          label="強み・実績 / Key strengths"
          value={input.strengths}
          onChange={(strengths) => set({ strengths })}
          placeholder="例：チーム開発でリリースを3回主導しました"
        />
        <Area
          label="趣味・特技 / Hobbies"
          value={input.hobbies}
          onChange={(hobbies) => set({ hobbies })}
          rows={2}
        />
        <Area
          label="志望動機（素材） / Motivation"
          value={input.motivation}
          onChange={(motivation) => set({ motivation })}
          placeholder="例：御社のグローバルな開発環境に惹かれました"
        />
      </Section>

      {error && (
        <div className="flex items-center gap-2 text-xs text-crimson bg-crimson/5 border border-crimson/20 rounded-xl px-3 py-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <button
        onClick={onGenerate}
        disabled={loading || !input.personal.name.trim()}
        className="w-full py-3.5 rounded-xl bg-crimson text-white text-sm font-bold hover:bg-crimson-light transition flex items-center justify-center gap-2 shadow-lg shadow-crimson/20 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            履歴書を生成中... / Generating
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" /> 履歴書を生成する / Generate
          </>
        )}
      </button>
    </div>
  );
}