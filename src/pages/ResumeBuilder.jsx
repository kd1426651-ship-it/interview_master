import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Printer, CheckCircle2, FileText } from 'lucide-react';

import { invokeLocalFunction } from '@/lib/aiHelper';
//import { base44 } from '@/api/base44Client';
import { useAppAuth } from '@/lib/appAuth';
import { buildInitialInput, loadSavedResumes, persistResumes } from '@/lib/resumeStore';
import ResumeForm from '@/components/resume/ResumeForm';
import ResumePreview from '@/components/resume/ResumePreview';
import SavedResumes from '@/components/resume/SavedResumes';

export default function ResumeBuilder() {
  const { user } = useAppAuth();
  const [input, setInput] = useState(() => buildInitialInput(user));
  const [resume, setResume] = useState(null);
  const [saved, setSaved] = useState(() => loadSavedResumes());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedFlash, setSavedFlash] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
        const res = await invokeLocalFunction('resumeBuilder', { input });
      //const res = await base44.functions.invoke('resumeBuilder', { input });
      setResume(res.data.resume);
    } catch (e) {
      setError(e?.response?.data?.error || '生成に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!resume) return;
    const item = { id: `${Date.now()}`, savedAt: new Date().toISOString(), input, resume };
    const next = [item, ...saved].slice(0, 20);
    persistResumes(next);
    setSaved(next);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  };

  const handleDeleteSaved = (id) => {
    const next = saved.filter((item) => item.id !== id);
    persistResumes(next);
    setSaved(next);
  };

  const handleLoadSaved = (item) => {
    setInput(item.input);
    setResume(item.resume);
  };

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-navy to-navy-light rounded-2xl p-6 text-white print:hidden"
      >
        <div className="flex items-center gap-2 mb-1">
          <FileText className="w-4 h-4 text-white/70" />
          <p className="text-xs text-white/70">履歴書作成 / Resume Builder</p>
        </div>
        <h2 className="text-xl font-bold">JIS規格の履歴書をAIで作成</h2>
        <p className="text-sm text-white/60 mt-1">
          入力内容から自己PRと志望動機を日本語で作成し、標準の履歴書レイアウトにまとめます。
        </p>

        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={handleSave}
            disabled={!resume}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {savedFlash ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {savedFlash ? '保存しました' : '保存 / Save'}
          </button>
          <button
            onClick={() => window.print()}
            disabled={!resume}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-crimson text-white text-xs font-semibold hover:bg-crimson-light transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Printer className="w-4 h-4" /> 印刷・PDF保存 / Print
          </button>
        </div>
      </motion.div>

      <SavedResumes items={saved} onLoad={handleLoadSaved} onDelete={handleDeleteSaved} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">
        <div className="print:hidden">
          <ResumeForm
            input={input}
            onChange={setInput}
            onGenerate={handleGenerate}
            loading={loading}
            error={error}
          />
        </div>
        <div>
          <ResumePreview
            resume={resume}
            input={input}
            onPhotoChange={(photo) => setInput({ ...input, photo })}
          />
        </div>
      </div>
    </div>
  );
}