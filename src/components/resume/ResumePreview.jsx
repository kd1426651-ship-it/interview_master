import React from 'react';
import { FileText } from 'lucide-react';
import ResumeSheetPage1 from '@/components/resume/ResumeSheetPage1';
import ResumeSheetPage2 from '@/components/resume/ResumeSheetPage2';

// Supports the two-page structure and older saved single-sheet resumes.
function normalize(resume) {
  if (resume?.page1_left && resume?.page2_right) return resume;

  const legacy = resume || {};
  const history = [
    ...(legacy.education_history || []).map((row) => ({ ...row, type: '学歴', content: row.content || row.detail })),
    ...(legacy.work_history || []).map((row) => ({ ...row, type: '職歴', content: row.content || row.detail })),
  ];

  return {
    page1_left: {
      personal_info: legacy.personal_info || {},
      education_and_work: history,
    },
    page2_right: {
      qualifications: legacy.qualifications || [],
      skills_and_hobbies: {
        technical_skills: legacy.special_skills || '',
        hobbies: legacy.hobbies || '',
      },
      self_pr: legacy.self_pr || '',
      motivation: legacy.motivation || '',
    },
  };
}

export default function ResumePreview({ resume, input, onPhotoChange }) {
  if (!resume) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center">
        <div className="w-12 h-12 rounded-xl bg-slate-50 mx-auto flex items-center justify-center mb-3">
          <FileText className="w-6 h-6 text-slate-300" />
        </div>
        <p className="text-sm font-semibold text-navy">履歴書はまだ生成されていません</p>
        <p className="text-xs text-slate-400 mt-1">
          左のフォームを入力して「履歴書を生成する」を押してください。
        </p>
      </div>
    );
  }

  const data = normalize(resume);
  const name = data.page1_left.personal_info.name;

  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold text-slate-500 mb-2 print:hidden">
        プレビュー / 見開き2ページ — 印刷するとA3横1枚に出力されます
      </p>
      <div className="overflow-x-auto pb-2 pr-6 print:overflow-visible print:pb-0 print:pr-0">
        <div className="grid grid-cols-2 gap-6 min-w-[1100px] items-start print:min-w-0 print:gap-[6mm]">
          <ResumeSheetPage1
            data={data.page1_left}
            photo={input?.photo || ''}
            onPhotoChange={onPhotoChange}
          />
          <ResumeSheetPage2
            data={data.page2_right}
            name={name}
            desiredRole={input?.desiredRole || ''}
          />
        </div>
      </div>
    </div>
  );
}