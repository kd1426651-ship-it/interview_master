import React from 'react';
import { Plus, X } from 'lucide-react';

const INPUT_CLASS =
  'px-2.5 py-2 rounded-lg border border-slate-200 bg-slate-50/50 text-sm text-navy placeholder:text-slate-300 focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10';

export default function EntryList({ title, hint, items, onChange, addLabel }) {
  const update = (index, key, value) => {
    onChange(items.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
  };

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <p className="text-[11px] font-bold text-navy">{title}</p>
        {hint && <span className="text-[10px] text-slate-400">{hint}</span>}
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <input
              value={item.year || ''}
              onChange={(e) => update(i, 'year', e.target.value)}
              placeholder="2024"
              inputMode="numeric"
              maxLength={4}
              className={`${INPUT_CLASS} w-16`}
            />
            <input
              value={item.month || ''}
              onChange={(e) => update(i, 'month', e.target.value)}
              placeholder="04"
              inputMode="numeric"
              maxLength={2}
              className={`${INPUT_CLASS} w-12`}
            />
            <input
              value={item.detail || ''}
              onChange={(e) => update(i, 'detail', e.target.value)}
              placeholder="○○高等学校 入学"
              maxLength={80}
              className={`${INPUT_CLASS} flex-1 min-w-0`}
            />
            <button
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              className="p-1.5 text-slate-300 hover:text-crimson transition shrink-0"
              aria-label="削除"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={() => onChange([...items, { year: '', month: '', detail: '' }])}
        className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-navy hover:text-crimson transition"
      >
        <Plus className="w-3.5 h-3.5" /> {addLabel}
      </button>
    </div>
  );
}