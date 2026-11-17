import React from 'react';
import { cleanText } from '@/lib/resumeText';

const MIN_QUALIFICATION_ROWS = 6;

function toBullets(value) {
  return String(cleanText(value))
    .split(/\n|、|，|,|・|。/)
    .map((item) => cleanText(item))
    .filter((item) => item.length > 1)
    .slice(0, 6);
}

function BulletBox({ title, items }) {
  return (
    <div className="border border-black border-r-0 flex flex-col">
      <div className="border-b border-black px-2 py-1 text-[10px]">{title}</div>
      <ul className="px-3 py-2 space-y-1 min-h-[108px]">
        {items.map((item, i) => (
          <li key={i} className="flex gap-1 text-[11px] leading-relaxed">
            <span>・</span>
            <span className="break-all">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PreferenceCell({ label, value, right }) {
  return (
    <div
      className={`flex flex-1 border border-black border-t-0 ${right ? '' : 'border-r-0'}`}
    >
      <div className="w-[64px] shrink-0 self-stretch border-r border-black px-1 flex items-center text-[9px] leading-tight">
        {label}
      </div>
      <div className="flex-1 min-w-0 px-2 py-2 text-[11px]">{value || ''}</div>
    </div>
  );
}

export default function ResumeSheetPage2({ data, name, desiredRole }) {
  const qualifications = (data?.qualifications || []).filter((row) => row && row.content);
  const skills = data?.skills_and_hobbies || {};
  const rows = [...qualifications];
  while (rows.length < MIN_QUALIFICATION_ROWS) rows.push(null);

  return (
    <div className="bg-white text-black font-serif p-4 print:p-0 print:break-inside-avoid">
      <div className="flex items-end justify-between border-b border-black pb-1">
        <h2 className="text-[13px] font-bold tracking-[0.35em]">履 歴 書</h2>
        <span className="text-[10px]">{name || ''}</span>
      </div>

      {/* Licenses & qualifications */}
      <div className="border border-black border-t-0">
        <div className="flex h-[24px] border-b border-black items-center">
          <div className="w-[60px] shrink-0 self-stretch border-r border-black flex items-center justify-center text-[10px]">
            年
          </div>
          <div className="w-[45px] shrink-0 self-stretch border-r border-black flex items-center justify-center text-[10px]">
            月
          </div>
          <div className="flex-1 px-2 text-[10px]">免許・資格・コンテスト受賞歴等</div>
        </div>

        {rows.map((row, i) => (
          <div key={i} className="flex h-[26px] border-b border-black items-center">
            <div className="w-[60px] shrink-0 self-stretch border-r border-black flex items-center justify-center text-[11px]">
              {row?.year || ''}
            </div>
            <div className="w-[45px] shrink-0 self-stretch border-r border-black flex items-center justify-center text-[11px]">
              {row?.month || ''}
            </div>
            <div className="flex-1 min-w-0 px-2 text-[11px] truncate">{row?.content || ''}</div>
          </div>
        ))}

        <div className="flex h-[24px] items-center justify-end px-2">
          <span className="text-[11px] tracking-[0.2em]">以上</span>
        </div>
      </div>

      {/* Strengths & hobbies */}
      <div className="grid grid-cols-2">
        <BulletBox title="得意科目もしくは分野" items={toBullets(skills.technical_skills)} />
        <BulletBox title="趣味・特技" items={toBullets(skills.hobbies)} />
      </div>

      {/* Preferences */}
      <div className="flex">
        <PreferenceCell label="希望職種" value={desiredRole} />
        <PreferenceCell label="希望勤務地" value="" right />
      </div>

      {/* Essays */}
      <div className="border border-black border-t-0">
        <div className="border-b border-black px-2 py-1 text-[10px]">自己PR</div>
        <p className="px-4 py-3 text-[11px] leading-[1.9] whitespace-pre-wrap min-h-[180px]">
          {data?.self_pr || ''}
        </p>
      </div>
      <div className="border border-black border-t-0">
        <div className="border-b border-black px-2 py-1 text-[10px]">志望動機</div>
        <p className="px-4 py-3 text-[11px] leading-[1.9] whitespace-pre-wrap min-h-[180px]">
          {data?.motivation || ''}
        </p>
      </div>
    </div>
  );
}