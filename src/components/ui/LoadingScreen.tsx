"use client";

import { motion } from "framer-motion";

export function LoadingScreen() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050a14] z-50">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
          <span className="text-white text-3xl font-bold font-space">M</span>
        </div>

        <div className="text-center">
          <p className="text-white font-bold text-xl font-space">MEDATLAS 3D</p>
          <p className="text-white/30 text-sm mt-0.5">Carregando anatomia...</p>
        </div>

        {/* Progress bar */}
        <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden mt-2">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
          />
        </div>

        {/* Scanning effect */}
        <div className="relative w-32 h-32 mt-4">
          <svg viewBox="0 0 100 120" className="w-full h-full" fill="none">
            <circle cx="50" cy="15" r="10" stroke="#1e3a5f" strokeWidth="1.5" />
            <rect x="35" y="25" width="30" height="40" rx="4" stroke="#1e3a5f" strokeWidth="1.5" />
            <rect x="37" y="65" width="12" height="30" rx="2" stroke="#1e3a5f" strokeWidth="1.5" />
            <rect x="51" y="65" width="12" height="30" rx="2" stroke="#1e3a5f" strokeWidth="1.5" />
            <rect x="20" y="28" width="12" height="32" rx="2" stroke="#1e3a5f" strokeWidth="1.5" />
            <rect x="68" y="28" width="12" height="32" rx="2" stroke="#1e3a5f" strokeWidth="1.5" />
          </svg>
          <motion.div
            className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-80"
            initial={{ top: "0%" }}
            animate={{ top: "100%" }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </motion.div>
    </div>
  );
}
