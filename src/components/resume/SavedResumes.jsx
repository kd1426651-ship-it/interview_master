import React from 'react';
import { FileText, X } from 'lucide-react';

export default function SavedResumes({ items, onLoad, onDelete }) {
  if (!items.length) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 print:hidden">
      <p className="text-xs font-bold text-navy mb-2">保存した履歴書 / Saved resumes</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-1 pl-3 pr-1 py-1.5 rounded-lg bg-slate-50 border border-slate-200"
          >
            <button
              onClick={() => onLoad(item)}
              className="flex items-center gap-1.5 text-[11px] font-medium text-navy hover:text-crimson transition"
            >
              <FileText className="w-3.5 h-3.5" />
              {item.resume?.personal_info?.name || '履歴書'}
              <span className="text-slate-400">
                · {new Date(item.savedAt).toLocaleDateString('ja-JP')}
              </span>
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="p-1 text-slate-300 hover:text-crimson transition"
              aria-label="削除"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}