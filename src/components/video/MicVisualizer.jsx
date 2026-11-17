import React from 'react';
import { motion } from 'framer-motion';

export default function MicVisualizer({ active, bars = 16 }) {
  if (!active) return null;
  return (
    <div className="flex items-center gap-1 h-8 justify-center">
      {Array.from({ length: bars }).map((_, i) => (
        <motion.span
          key={i}
          className="w-1 bg-white rounded-full"
          animate={{ height: [4, 10 + (i % 4) * 7, 4] }}
          transition={{ duration: 0.5 + (i % 5) * 0.08, repeat: Infinity, delay: i * 0.04 }}
        />
      ))}
    </div>
  );
}