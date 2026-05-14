"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

const THEMES: Record<string, string> = {
  "luxury-dark": "radial-gradient(circle at center, #1a1a1a 0%, #000 100%)",
  "toyota-red": "linear-gradient(135deg, #ed1c24 0%, #4a0000 100%)",
  "modern-blue": "linear-gradient(135deg, #003366 0%, #000b1a 100%)",
};

export default function TVDisplay() {
  const [branchId, setBranchId] = useState<string | null>("TBD");
  const [config, setConfig] = useState({
    customer_name: "SẴN SÀNG TRAO XE",
    theme_id: "luxury-dark",
    font_size: 15,
    text_color: "#F5C842",
  });

  const fireConfetti = useCallback(() => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: [config.text_color, "#ffffff"],
    });
  }, [config.text_color]);

  useEffect(() => {
    // 1. Load cấu hình ban đầu
    fetch(`/api/settings?branch_id=${branchId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data) setConfig(data);
      });

    // 2. Lắng nghe thay đổi Realtime
    const channel = supabase
      .channel(`showroom-${branchId}`)
      .on("broadcast", { event: "car-delivery" }, (payload) => {
        setConfig(payload.payload);
        fireConfetti();
        new Audio("/sounds/celebration.mp3").play().catch(() => {});
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [branchId, fireConfetti]);

  return (
    <div
      className="h-screen w-full flex items-center justify-center overflow-hidden transition-all duration-1000"
      style={{ background: THEMES[config.theme_id] || THEMES["luxury-dark"] }}
    >
      {/* Hiệu ứng hạt bụi bay cho sang trọng */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />

      <AnimatePresence mode="wait">
        <motion.div
          key={config.customer_name}
          initial={{ opacity: 0, scale: 0.9, filter: "blur(20px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
          transition={{ duration: 1 }}
          className="text-center z-10"
        >
          <p className="text-white/60 uppercase tracking-[1em] mb-4 text-2xl font-light">
            Chúc mừng quý khách
          </p>

          <h1
            className="font-black italic drop-shadow-2xl"
            style={{
              fontSize: `${config.font_size}vh`,
              color: config.text_color,
              lineHeight: 1.1,
            }}
          >
            {config.customer_name.toUpperCase()}
          </h1>

          <div className="mt-10 flex items-center justify-center gap-4">
            <div className="h-[1px] w-40 bg-gradient-to-r from-transparent to-white/40" />
            <div className="w-2 h-2 rotate-45 bg-white/60" />
            <div className="h-[1px] w-40 bg-gradient-to-l from-transparent to-white/40" />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
