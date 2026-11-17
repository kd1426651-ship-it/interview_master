import React from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Video as VideoIcon, CameraOff, PhoneOff } from 'lucide-react';

export default function CallControls({ muted, camOn, onToggleMute, onToggleCam, onEnd }) {
  return (
    <div className="flex items-center justify-center gap-4">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onToggleMute}
        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition ${
          muted ? 'bg-crimson' : 'bg-white text-navy border border-slate-200'
        }`}
        title={muted ? 'Unmute' : 'Mute'}
      >
        {muted ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5" />}
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onToggleCam}
        className="w-12 h-12 rounded-full bg-white border border-slate-200 text-navy flex items-center justify-center shadow-lg transition"
        title={camOn ? 'Turn camera off' : 'Turn camera on'}
      >
        {camOn ? <VideoIcon className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onEnd}
        className="w-12 h-12 rounded-full bg-crimson text-white flex items-center justify-center shadow-lg shadow-crimson/30 hover:bg-crimson-light transition"
        title="End interview"
      >
        <PhoneOff className="w-5 h-5" />
      </motion.button>
    </div>
  );
}