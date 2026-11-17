import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Briefcase, Building2, GraduationCap } from 'lucide-react';
import { INTERVIEW_TYPES } from '@/lib/interviewPersonas';

const ICONS = { part_time: Briefcase, full_time: Building2, university: GraduationCap };

export default function InterviewTypeSelector({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {INTERVIEW_TYPES.map((t, i) => {
        const Icon = ICONS[t.id] || Briefcase;
        const active = selected === t.id;
        return (
          <motion.button
            key={t.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => onSelect(t.id)}
            className={`text-left rounded-2xl border p-5 transition shadow-sm ${
              active
                ? 'border-navy bg-navy/5 ring-2 ring-navy/20'
                : 'border-slate-100 bg-white hover:border-slate-200 shadow-slate-200/40'
            }`}
          >
            <div className={`w-11 h-11 rounded-xl ${t.accent} flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-navy">{t.nameJp}</p>
              {active && <CheckCircle2 className="w-4 h-4 text-navy" />}
            </div>
            <p className="text-[11px] text-slate-400">{t.nameEn}</p>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">{t.desc}</p>
            <div className="flex flex-wrap gap-1 mt-3">
              {t.focus.map((f) => (
                <span key={f} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">{f}</span>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-2">AI面接官: {t.tone} · {t.questions.length}問</p>
          </motion.button>
        );
      })}
    </div>
  );
}