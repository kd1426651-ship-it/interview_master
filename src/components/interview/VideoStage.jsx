import React from 'react';
import { motion } from 'framer-motion';
import { Bot, CameraOff, AlertCircle } from 'lucide-react';
import KeigoBadge from '@/components/video/KeigoBadge';
import MicVisualizer from '@/components/video/MicVisualizer';

export default function VideoStage({ videoRef, camOn, camError, muted, keigoHit, keigoCount, personaName, accent }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-navy-dark rounded-2xl overflow-hidden aspect-video shadow-xl shadow-navy/20"
    >
      <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${!camOn ? 'opacity-0' : ''}`} />
      {!camOn && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          {camError ? (
            <>
              <AlertCircle className="w-10 h-10 text-amber-400 mb-3" />
              <p className="text-sm text-white/80">{camError}</p>
            </>
          ) : (
            <>
              <CameraOff className="w-10 h-10 text-white/30 mb-3" />
              <p className="text-sm text-white/50">カメラはオフです / Camera off</p>
            </>
          )}
        </div>
      )}

      <KeigoBadge detected={keigoHit} count={keigoCount} active={!muted} />

      <div className="absolute bottom-3 right-3 w-28 sm:w-36 rounded-xl overflow-hidden border-2 border-white/20 shadow-lg">
        <div className={`aspect-video ${accent} flex items-center justify-center`}>
          <Bot className="w-8 h-8 text-white/80" />
        </div>
        <p className="bg-navy/80 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-1 truncate">{personaName}</p>
      </div>

      <div className="absolute top-3 right-3">
        <div className="bg-navy/80 backdrop-blur-sm rounded-lg px-3 py-2">
          <MicVisualizer active={!muted} bars={12} />
          {muted && <p className="text-[10px] text-white/60 text-center">ミュート中 / Muted</p>}
        </div>
      </div>
    </motion.div>
  );
}