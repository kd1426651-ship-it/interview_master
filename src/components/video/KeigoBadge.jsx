import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BadgeCheck } from 'lucide-react';

export const KEIGO_PHRASES = [
  'ございます',
  'ありがとうございます',
  'いたします',
  'いたしました',
  'いただきます',
  'させていただきます',
  '申し上げます',
  '存じます',
  'お願いいたします',
  '失礼いたします',
  'よろしくお願いします',
  '御座います',
  'さん (polite suffix)',
];

export function detectKeigo(text) {
  return KEIGO_PHRASES.filter((p) => text.includes(p.replace(' (polite suffix)', '')));
}

export default function KeigoBadge({ detected, count, active }) {
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (detected) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 1200);
      return () => clearTimeout(t);
    }
  }, [detected]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className={`absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm transition-colors ${
            flash ? 'bg-emerald-500' : 'bg-navy/80'
          }`}
        >
          <BadgeCheck className="w-4 h-4 text-white" />
          <div className="leading-tight">
            <p className="text-[10px] font-semibold text-white/70">敬語検出 / Keigo Detector</p>
            <p className="text-xs font-bold text-white">
              {detected ? `「${detected}」 detected!` : 'Listening for keigo...'}
            </p>
          </div>
          {count > 0 && (
            <span className="text-[10px] font-bold bg-white/20 text-white px-1.5 py-0.5 rounded-md">
              {count}
            </span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}