import React, { useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';
import { readPhotoFile } from '@/lib/resumePhoto';

export default function PhotoUpload({ photo, onChange }) {
  const inputRef = useRef(null);
  const [error, setError] = useState('');

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    try {
      onChange(await readPhotoFile(file));
    } catch (err) {
      setError('画像を読み込めませんでした。別のファイルをお試しください。');
    }
  };

  return (
    <div className="pt-1">
      <label className="block text-[11px] font-medium text-slate-500 mb-1.5">
        証明写真 / ID Photo（30mm × 40mm）
      </label>
      <div className="flex items-center gap-3">
        <div className="w-[45px] h-[60px] shrink-0 rounded-md border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center">
          {photo ? (
            <img src={photo} alt="証明写真" className="w-full h-full object-cover" />
          ) : (
            <Camera className="w-4 h-4 text-slate-300" />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-navy hover:bg-slate-50 transition flex items-center gap-1.5"
          >
            <Camera className="w-3.5 h-3.5" /> 写真を選択 / Upload
          </button>
          {photo && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-crimson hover:bg-crimson/5 transition flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" /> 削除 / Remove
            </button>
          )}
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      {error && <p className="text-[11px] text-crimson mt-2">{error}</p>}
    </div>
  );
}