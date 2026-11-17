import React from 'react';

export default function ResumeField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  maxLength,
  className = '',
}) {
  return (
    <div className={className}>
      <label className="block text-[11px] font-medium text-slate-500 mb-1">{label}</label>
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/50 text-sm text-navy placeholder:text-slate-300 focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
      />
    </div>
  );
}