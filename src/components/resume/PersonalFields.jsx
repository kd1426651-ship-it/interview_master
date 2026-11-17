import React from 'react';
import ResumeField from '@/components/resume/ResumeField';

const GENDERS = ['男性', '女性', 'その他'];

export default function PersonalFields({ personal, onChange }) {
  const set = (key) => (value) => onChange({ ...personal, [key]: value });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <ResumeField
        label="氏名 / Name"
        value={personal.name}
        onChange={set('name')}
        placeholder="山田 太郎"
        maxLength={60}
      />
      <ResumeField
        label="ふりがな / Furigana"
        value={personal.furigana}
        onChange={set('furigana')}
        placeholder="やまだ たろう"
        maxLength={60}
      />
      <ResumeField
        label="生年月日 / Date of birth"
        type="date"
        value={personal.dob}
        onChange={set('dob')}
      />
      <div>
        <label className="block text-[11px] font-medium text-slate-500 mb-1">性別 / Gender</label>
        <select
          value={personal.gender || ''}
          onChange={(e) => set('gender')(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/50 text-sm text-navy focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
        >
          <option value="">選択してください</option>
          {GENDERS.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>
      <ResumeField
        label="現住所 / Address"
        value={personal.address}
        onChange={set('address')}
        placeholder="東京都新宿区西新宿1-1-1"
        maxLength={120}
        className="sm:col-span-2"
      />
      <ResumeField
        label="電話番号 / Phone"
        value={personal.phone}
        onChange={set('phone')}
        placeholder="090-0000-0000"
        maxLength={30}
      />
      <ResumeField
        label="Email"
        type="email"
        value={personal.email}
        onChange={set('email')}
        placeholder="you@example.com"
        maxLength={80}
      />
    </div>
  );
}