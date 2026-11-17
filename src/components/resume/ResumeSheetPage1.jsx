import React, { useRef } from 'react';
import { cleanText } from '@/lib/resumeText';
import { readPhotoFile } from '@/lib/resumePhoto';

const MIN_ROWS = 14;

function formatDob(raw) {
  const value = String(raw || '').trim();
  const digits = value.replace(/[^\d]/g, '');
  if (digits.length < 8) return value;
  const y = Number(digits.slice(0, 4));
  const m = Number(digits.slice(4, 6));
  const d = Number(digits.slice(6, 8));
  const birth = new Date(y, m - 1, d);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) age -= 1;
  const valid = !Number.isNaN(birth.getTime()) && age >= 0 && age < 120;
  return `${y}年${m}月${d}日生${valid ? `（満 ${age} 歳）` : ''}`;
}

function withPostal(address) {
  const value = String(address || '').trim();
  if (!value) return '';
  return value.startsWith('〒') ? value : `〒 ${value}`;
}

function Label({ children }) {
  return (
    <div className="w-[76px] shrink-0 self-stretch border-r border-black px-1 flex items-center text-[9px] leading-tight">
      {children}
    </div>
  );
}

function buildRows(entries) {
  const education = entries.filter((row) => row.type === '学歴');
  const work = entries.filter((row) => row.type === '職歴');
  const rows = [{ kind: 'section', label: '学 歴' }];

  if (education.length) {
    education.forEach((row) => rows.push({ kind: 'entry', ...row }));
  } else {
    rows.push({ kind: 'empty' });
  }

  rows.push({ kind: 'section', label: '職 歴' });
  if (work.length) {
    work.forEach((row) => rows.push({ kind: 'entry', ...row }));
  } else {
    rows.push({ kind: 'empty' });
  }

  rows.push({ kind: 'end' });
  while (rows.length < MIN_ROWS) rows.push({ kind: 'empty' });
  return rows;
}

function PhotoFrame({ photo, onPhotoChange }) {
  const inputRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !onPhotoChange) return;
    try {
      onPhotoChange(await readPhotoFile(file));
    } catch (err) {
      // unreadable file — keep the current placeholder
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        title="クリックして写真を選択"
        className={`w-[113px] h-[151px] overflow-hidden bg-white flex items-center justify-center border border-black ${
          photo ? 'border-solid' : 'border-dashed'
        } print:cursor-default`}
      >
        {photo ? (
          <img src={photo} alt="証明写真" className="w-full h-full object-cover" />
        ) : (
          <span className="text-[10px] text-center leading-relaxed">
            写真を
            <br />
            貼る位置
          </span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden print:hidden"
      />
    </>
  );
}

export default function ResumeSheetPage1({ data, photo, onPhotoChange }) {
  const info = data?.personal_info || {};
  const rows = buildRows(data?.education_and_work || []);
  const today = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return (
    <div className="bg-white text-black font-serif p-4 print:p-0 print:break-inside-avoid">
      <div className="flex items-start justify-between mb-2">
        <h2 className="text-[24px] font-bold tracking-[0.5em]">履 歴 書</h2>
        <p className="text-[11px] mt-3">{today} 現在</p>
      </div>

      {/* Profile block */}
      <div className="flex border border-black">
        <div className="flex-1 min-w-0">
          <div className="flex h-[30px] border-b border-black items-center">
            <Label>フリガナ</Label>
            <div className="flex-1 min-w-0 px-2 text-[10px] break-all">{cleanText(info.furigana)}</div>
          </div>
          <div className="flex h-[48px] border-b border-black items-center">
            <Label>氏 名</Label>
            <div className="flex-1 min-w-0 px-2 text-[20px] font-bold tracking-[0.12em] break-all">
              {cleanText(info.name)}
            </div>
          </div>
          <div className="flex h-[30px] border-b border-black items-center">
            <Label>生年月日</Label>
            <div className="flex-1 min-w-0 px-2 text-[11px] border-r border-black">{formatDob(cleanText(info.dob))}</div>
            <div className="w-[34px] shrink-0 border-r border-black text-[8px] text-center">性別</div>
            <div className="w-[42px] shrink-0 text-[11px] text-center">{cleanText(info.gender)}</div>
          </div>
          <div className="flex min-h-[56px]">
            <Label>現住所</Label>
            <div className="flex-1 min-w-0 px-2 py-1 text-[11px] leading-relaxed break-all">
              {withPostal(cleanText(info.address))}
            </div>
          </div>
        </div>

        <div className="w-[25%] shrink-0 border-l border-black p-2 flex items-start justify-center">
          <PhotoFrame photo={photo} onPhotoChange={onPhotoChange} />
        </div>
      </div>

      {/* Contact block */}
      <div className="flex border border-black border-t-0">
        <div className="flex-1 min-w-0 border-r border-black">
          <div className="flex h-[28px] border-b border-black items-center">
            <div className="w-[76px] shrink-0 self-stretch border-r border-black px-1 flex items-center text-[9px]">
              E-mail
            </div>
            <div className="flex-1 min-w-0 px-2 text-[10px] break-all">{cleanText(info.email)}</div>
          </div>
          <div className="flex h-[34px] items-center">
            <div className="w-[76px] shrink-0 self-stretch border-r border-black px-1 flex items-center text-[8px] leading-tight">
              連絡先
              <br />
              （現住所以外）
            </div>
            <div className="flex-1 min-w-0" />
          </div>
        </div>
        <div className="w-[38%] shrink-0">
          <div className="px-1 py-0.5 border-b border-black text-[9px]">電話番号</div>
          <div className="px-2 py-2 text-[13px] tracking-wider">{cleanText(info.phone)}</div>
        </div>
      </div>

      {/* Education & work history */}
      <div className="border border-black border-t-0">
        <div className="flex h-[24px] border-b border-black items-center">
          <div className="w-[60px] shrink-0 self-stretch border-r border-black flex items-center justify-center text-[10px]">
            年
          </div>
          <div className="w-[45px] shrink-0 self-stretch border-r border-black flex items-center justify-center text-[10px]">
            月
          </div>
          <div className="flex-1 px-2 text-[10px]">学歴・職歴</div>
        </div>

        {rows.map((row, i) => {
          if (row.kind === 'section') {
            return (
              <div
                key={i}
                className="flex h-[26px] border-b border-black last:border-b-0 items-center justify-center"
              >
                <span className="text-[11px] tracking-[0.3em]">{row.label}</span>
              </div>
            );
          }
          if (row.kind === 'end') {
            return (
              <div
                key={i}
                className="flex h-[26px] border-b border-black last:border-b-0 items-center justify-end px-2"
              >
                <span className="text-[11px] tracking-[0.2em]">以上</span>
              </div>
            );
          }
          return (
            <div key={i} className="flex h-[26px] border-b border-black last:border-b-0 items-center">
              <div className="w-[60px] shrink-0 self-stretch border-r border-black flex items-center justify-center text-[11px]">
                {row.year || ''}
              </div>
              <div className="w-[45px] shrink-0 self-stretch border-r border-black flex items-center justify-center text-[11px]">
                {row.month || ''}
              </div>
              <div className="flex-1 min-w-0 px-2 text-[11px] truncate">{row.content || ''}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}