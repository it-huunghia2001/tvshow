/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import BranchSelector from "@/components/BranchSelector";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

const formatName = (str: string) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function LuxuryDisplay() {
  const [branchId, setBranchId] = useState<string | null>(null);
  const [name, setName] = useState("SẴN SÀNG TRAO XE");
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fireConfetti = () => {
    const end = Date.now() + 5 * 1000;
    const colors = ["#FFD700", "#FFFFFF", "#DAA520", "#B8860B"];
    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  };

  useEffect(() => {
    const saved = localStorage.getItem("selected_branch_id");
    setBranchId(saved);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!branchId) return;
    fetch(`/api/settings?branch_id=${branchId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.customer_name) setName(data.customer_name);
      });

    const channel = supabase
      .channel(`showroom-${branchId}`)
      .on("broadcast", { event: "car-delivery" }, (payload) => {
        setName(payload.payload.name);
        fireConfetti();
        new Audio("/sounds/celebration.mp3").play().catch(() => {});
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [branchId]);

  if (loading) return <div className="h-screen bg-[#020202]" />;
  if (!branchId) return <BranchSelector onSelect={setBranchId} />;

  return (
    <div className="h-screen w-full bg-[#020202] text-white flex items-center justify-center overflow-hidden font-sans relative">
      {/* --- LAYER 1: LUXURY GEOMETRIC BACKGROUND --- */}
      {/* Dot Grid Layer */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Subtle Scanline Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none z-10" />

      {/* Floating Concentric Circles */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute w-[800px] h-[800px] border border-amber-500/5 rounded-full z-10"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="absolute w-[600px] h-[600px] border border-white/5 rounded-full z-10"
      />

      {/* Background Particles */}
      <div className="absolute inset-0 z-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: "110%", x: `${Math.random() * 100}%`, opacity: 0 }}
            animate={{ y: "-10%", opacity: [0, 0.2, 0] }}
            transition={{
              duration: Math.random() * 15 + 10,
              repeat: Infinity,
              delay: Math.random() * 10,
            }}
            className="absolute w-[2px] h-[2px] bg-amber-400 rounded-full blur-[1px]"
          />
        ))}
      </div>

      {/* --- LAYER 2: DECORATIVE CORNERS --- */}
      <div className="absolute top-10 left-10 w-20 h-20 border-t border-l border-amber-500/20" />
      <div className="absolute top-10 right-10 w-20 h-20 border-t border-r border-amber-500/20" />
      <div className="absolute bottom-10 left-10 w-20 h-20 border-b border-l border-amber-500/20" />
      <div className="absolute bottom-10 right-10 w-20 h-20 border-b border-r border-amber-500/20" />

      {/* --- LAYER 3: TOP HEADER (LOGO & CLOCK) --- */}
      <div className="absolute top-12 w-full px-16 flex justify-between items-center z-30">
        <motion.div
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-6"
        >
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-600 to-amber-900 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative bg-black border border-white/10 p-2 rounded-xl">
              <img
                src="./avt.jpg"
                className="h-16 w-auto object-contain rounded-lg"
                alt="Toyota Logo"
              />
            </div>
          </div>
          <div className="flex flex-col">
            <h2 className="text-2xl font-black tracking-widest text-white/90 m-0 leading-none">
              TOYOTA
            </h2>
            <p className="text-[10px] tracking-[0.5em] text-amber-500/70 uppercase mt-2">
              Binh Duong Showroom
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex flex-col items-end"
        >
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-thin tracking-tighter text-white/90 tabular-nums">
              {currentTime.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span className="text-xl font-light text-amber-500/80 tracking-widest uppercase">
              {currentTime.toLocaleTimeString("vi-VN", { second: "2-digit" })}
            </span>
          </div>
          <div className="text-[11px] tracking-[0.3em] uppercase opacity-40 mt-1 font-medium">
            {currentTime.toLocaleDateString("vi-VN", {
              weekday: "long",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </div>
        </motion.div>
      </div>

      {/* --- LAYER 4: CENTRAL CONTENT --- */}
      <AnimatePresence mode="wait">
        <motion.div
          key={name}
          className="relative z-20 flex flex-col items-center"
        >
          {/* Badge Decoration */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-8 px-6 py-1 border border-amber-500/30 rounded-full backdrop-blur-sm"
          >
            <span className="text-amber-500/80 text-xs tracking-[0.6em] uppercase font-semibold">
              Premium Experience
            </span>
          </motion.div>

          {/* Subtitle with Animated Lines */}
          <div className="flex items-center gap-6 mb-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 60 }}
              className="h-[1px] bg-gradient-to-r from-transparent to-amber-500"
            />
            <span className="text-white/40 text-2xl tracking-[1em] uppercase font-extralight ml-[1em]">
              Lễ Bàn Giao Xe
            </span>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 60 }}
              className="h-[1px] bg-gradient-to-l from-transparent to-amber-500"
            />
          </div>

          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            className="text-amber-200 text-lg uppercase tracking-[1em] mb-12 font-medium"
          >
            Chúc mừng quý khách
          </motion.h3>

          {/* THE NAME - THE MASTERPIECE */}
          <div className="relative">
            <motion.h1
              initial={{ opacity: 0, y: 40, filter: "blur(15px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
              className="text-[10vw] font-[900] italic leading-none relative z-10 tracking-tighter"
            >
              <span className="absolute inset-0 text-transparent bg-clip-text bg-linear-to-r from-transparent via-white/40 to-transparent bg-size-[200%_100%] animate-shimmer px-6">
                {formatName(name)}
              </span>
              <span className="text-transparent bg-clip-text bg-linear-to-b from-white via-amber-200 to-amber-600 drop-shadow-[0_20px_80px_rgba(217,119,6,0.5)] px-8">
                {formatName(name)}
              </span>
            </motion.h1>

            {/* Reflection with stronger blur */}
            <motion.h1
              style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
              className="text-[10vw] font-black italic leading-none absolute top-[80%] left-0 w-full opacity-10 scale-y-[-0.6] blur-md select-none tracking-tighter text-amber-500"
            >
              {formatName(name)}
            </motion.h1>
          </div>

          {/* Decorative Divider */}
          <div className="mt-24 flex items-center gap-4">
            <div className="w-1 h-1 bg-amber-500 rotate-45 shadow-[0_0_10px_#f59e0b]" />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 400 }}
              transition={{ delay: 0.8, duration: 1.5 }}
              className="h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"
            />
            <div className="w-1 h-1 bg-amber-500 rotate-45 shadow-[0_0_10px_#f59e0b]" />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* --- LAYER 5: FOOTER (BRANDING) --- */}
      <div className="absolute bottom-12 w-full px-24 flex justify-between items-center z-30 opacity-50">
        <div className="flex flex-col">
          <span className="text-[10px] tracking-[0.8em] uppercase font-bold text-amber-500 mb-2">
            Heritage & Innovation
          </span>
          <p className="text-sm tracking-[0.3em] font-light">
            TOYOTA QUALITY SERVICE
          </p>
        </div>
        <div className="h-[1px] flex-grow mx-20 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="text-right">
          <span className="text-[10px] tracking-[0.5em] uppercase">
            Est. 2026
          </span>
          <p className="text-[9px] opacity-40 mt-1">
            Nghia Digital Signage System
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        .animate-shimmer {
          animation: shimmer 6s infinite linear;
        }
      `}</style>
    </div>
  );
}
