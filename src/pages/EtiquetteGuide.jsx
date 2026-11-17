import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, DoorOpen, User, ArrowDown, Armchair, Info } from 'lucide-react';

function Accordion({ title, subtitle, icon: Icon, children, defaultOpen }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm shadow-slate-200/40 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-5 hover:bg-slate-50/50 transition"
      >
        <div className="w-11 h-11 rounded-xl bg-navy/10 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-navy" />
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-bold text-navy">{title}</p>
          <p className="text-[11px] text-slate-400">{subtitle}</p>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-5 h-5 text-slate-400" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="px-5 pb-5 pt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BowVisualizer({ angle }) {
  return (
    <div className="relative h-44 bg-slate-50 rounded-xl overflow-hidden flex items-end justify-center pb-6">
      {/* floor */}
      <div className="absolute bottom-5 left-0 right-0 h-px bg-slate-200" />
      {/* person */}
      <motion.div
        className="origin-bottom"
        animate={{ rotate: `-${angle}` }}
        transition={{ type: 'spring', stiffness: 120, damping: 14 }}
        style={{ transformOrigin: 'bottom center' }}
      >
        {/* head */}
        <div className="w-10 h-10 rounded-full bg-navy mx-auto" />
        {/* body */}
        <div className="w-3 h-20 bg-navy mx-auto -mt-1 rounded-full" />
      </motion.div>
      {/* angle label */}
      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-navy">
        {angle}°
      </div>
      <div className="absolute bottom-1.5 left-3 text-[10px] text-slate-400">side view</div>
    </div>
  );
}

export default function EtiquetteGuide() {
  const [bowAngle, setBowAngle] = useState(30);

  const bowTypes = [
    { angle: 15, jp: '会釈', en: 'Eshaku', desc: 'Casual greeting · 15° · ~1 second', color: 'bg-blue-50 text-blue-600 border-blue-100' },
    { angle: 30, jp: '敬礼', en: 'Keirei', desc: 'Standard interview bow · 30° · 2-3 seconds', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { angle: 45, jp: '最敬礼', en: 'Saikeirei', desc: 'Deep apology / gratitude · 45° · 3+ seconds', color: 'bg-crimson/5 text-crimson border-crimson/10' },
  ];

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-navy rounded-2xl p-5 text-white"
      >
        <h2 className="text-base font-bold">日本の面接マナー</h2>
        <p className="text-sm text-white/70 mt-0.5">Master the essential etiquette for Japanese job interviews.</p>
      </motion.div>

      {/* Door Entry */}
      <Accordion title="入室の作法" subtitle="Door Entry: The 3-Knock Rule" icon={DoorOpen} defaultOpen>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-navy text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</div>
            <div>
              <p className="text-sm font-semibold text-navy">3回ノック (3 knocks)</p>
              <p className="text-sm text-slate-500">Knock 3 times firmly, then wait.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-navy text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</div>
            <div>
              <p className="text-sm font-semibold text-navy">「失礼します」</p>
              <p className="text-sm text-slate-500">Say "Shitsurei shimasu" as you open the door. Enter, then close it quietly.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-navy text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</div>
            <div>
              <p className="text-sm font-semibold text-navy">面接官の方へお辞儀</p>
              <p className="text-sm text-slate-500">Turn to the interviewers and bow at 30° (keirei). Do not sit until invited.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 mt-2">
            <Info className="w-3.5 h-3.5 shrink-0" /> Never enter before knocking, and never turn your back to the door while closing it.
          </div>
        </div>
      </Accordion>

      {/* Bowing */}
      <Accordion title="お辞儀 (Ojigi)" subtitle="Bowing: 15° / 30° / 45° Angles" icon={ArrowDown}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BowVisualizer angle={bowAngle} />
            <div className="space-y-2">
              {bowTypes.map((b) => (
                <button
                  key={b.angle}
                  onClick={() => setBowAngle(b.angle)}
                  className={`w-full text-left p-3 rounded-xl border transition ${
                    bowAngle === b.angle ? b.color : 'bg-slate-50 border-slate-100 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">{b.jp} · {b.en}</span>
                    <span className="text-xs font-bold">{b.angle}°</span>
                  </div>
                  <p className="text-[11px] mt-0.5 opacity-80">{b.desc}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
            <Info className="w-3.5 h-3.5 shrink-0" /> For interviews, use 30° keirei. Bow slowly — speed reads as insincerity.
          </div>
        </div>
      </Accordion>

      {/* Seating */}
      <Accordion title="席次のマナー" subtitle="Seating: Kamiza vs Shimoza" icon={Armchair}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-navy rounded-xl p-4 text-white">
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4" />
                <span className="text-sm font-bold">上座 (Kamiza)</span>
              </div>
              <p className="text-xs text-white/70">Seat of honor · furthest from the door. Reserved for interviewers / superiors.</p>
            </div>
            <div className="bg-slate-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-bold text-slate-600">下座 (Shimoza)</span>
              </div>
              <p className="text-xs text-slate-500">Seat closest to the door. Where you, the candidate, should sit.</p>
            </div>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-navy mb-2">Room layout (top-down view)</p>
            <div className="relative h-32 bg-white border border-slate-200 rounded-lg overflow-hidden">
              {/* door */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-crimson" />
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] text-crimson font-medium">Door</span>
              {/* kamiza */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-md bg-navy text-white text-[10px] font-medium">上座 Kamiza</div>
              {/* shimoza */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-md bg-slate-200 text-slate-600 text-[10px] font-medium">下座 Shimoza</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
            <Info className="w-3.5 h-3.5 shrink-0" /> Wait to be told "どうぞお掛けください" before sitting. Keep your back straight, hands on lap.
          </div>
        </div>
      </Accordion>
    </div>
  );
}