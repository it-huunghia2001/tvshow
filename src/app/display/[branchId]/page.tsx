"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export default function LuxuryDisplay() {
  const { branchId } = useParams();
  const [name, setName] = useState("SẴN SÀNG TRAO XE");

  const fireConfetti = () => {
    const end = Date.now() + 5 * 1000;
    const colors = ["#FFD700", "#FFFFFF", "#C0C0C0"]; // Vàng, Trắng, Bạc

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  };

  useEffect(() => {
    const channel = supabase
      .channel(`showroom-${branchId}`)
      .on("broadcast", { event: "car-delivery" }, (payload) => {
        setName(payload.payload.name);
        fireConfetti();
        // Bạn có thể thêm file audio vào folder public và phát ở đây
        const audio = new Audio("/sounds/celebration.mp3");
        audio
          .play()
          .catch((e) => console.log("Chờ tương tác người dùng để phát nhạc"));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [branchId]);

  return (
    <div className="h-screen w-full bg-[#050505] flex items-center justify-center overflow-hidden font-sans">
      {/* Hiệu ứng đèn sân khấu */}
      <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-amber-500/10 to-transparent blur-[120px]" />

      <AnimatePresence mode="wait">
        <motion.div
          key={name}
          initial={{ opacity: 0, y: 100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 1.1 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 text-center"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 1 }}
            className="text-amber-500 tracking-[0.8em] text-xl uppercase mb-8 font-light"
          >
            Lễ Bàn Giao Xe
          </motion.p>

          <h1 className="text-[12vw] font-serif font-black italic leading-none drop-shadow-[0_10px_30px_rgba(217,119,6,0.5)]">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-400 to-amber-700">
              {name}
            </span>
          </h1>

          <div className="mt-12 flex items-center justify-center gap-4">
            <div className="h-[1px] w-24 bg-gradient-to-r from-transparent to-amber-500" />
            <div className="w-3 h-3 rotate-45 border border-amber-500" />
            <div className="h-[1px] w-24 bg-gradient-to-l from-transparent to-amber-500" />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Decorative Brand Overlay */}
      <div className="absolute bottom-12 w-full flex justify-between px-20 text-white/10 text-sm tracking-[0.3em] uppercase italic">
        <span>Showroom {branchId}</span>
        <span>Toyota Binh Duong</span>
      </div>
    </div>
  );
}
