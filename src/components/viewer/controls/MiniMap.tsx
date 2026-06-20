"use client";

import { motion } from "framer-motion";

const BODY_REGIONS = [
  { label: "Cabeça", y: 8, height: 12 },
  { label: "Pescoço", y: 20, height: 5 },
  { label: "Tórax", y: 25, height: 20 },
  { label: "Abdômen", y: 45, height: 15 },
  { label: "Pelve", y: 60, height: 10 },
  { label: "Membros", y: 70, height: 30 },
];

export function MiniMap() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className="absolute bottom-6 left-4 z-20 hud-panel w-16 hidden sm:block"
    >
      <p className="text-white/30 text-[9px] uppercase tracking-wider mb-2">Mapa</p>
      <div className="relative w-full" style={{ height: 100 }}>
        {/* Simplified body outline */}
        <svg viewBox="0 0 40 100" className="w-full h-full" fill="none">
          {/* Head */}
          <circle cx="20" cy="8" r="6" stroke="#3b82f6" strokeWidth="1" fill="#3b82f610" />
          {/* Neck */}
          <rect x="17" y="14" width="6" height="4" rx="1" stroke="#3b82f6" strokeWidth="0.8" fill="#3b82f610" />
          {/* Torso */}
          <rect x="11" y="18" width="18" height="22" rx="2" stroke="#3b82f6" strokeWidth="1" fill="#3b82f610" />
          {/* Pelvis */}
          <rect x="12" y="40" width="16" height="10" rx="1" stroke="#3b82f6" strokeWidth="0.8" fill="#3b82f610" />
          {/* Left leg */}
          <rect x="12" y="50" width="6" height="28" rx="1" stroke="#3b82f6" strokeWidth="0.8" fill="#3b82f610" />
          {/* Right leg */}
          <rect x="22" y="50" width="6" height="28" rx="1" stroke="#3b82f6" strokeWidth="0.8" fill="#3b82f610" />
          {/* Left arm */}
          <rect x="4" y="18" width="5" height="22" rx="1" stroke="#3b82f6" strokeWidth="0.8" fill="#3b82f610" />
          {/* Right arm */}
          <rect x="31" y="18" width="5" height="22" rx="1" stroke="#3b82f6" strokeWidth="0.8" fill="#3b82f610" />
        </svg>
      </div>
    </motion.div>
  );
}
