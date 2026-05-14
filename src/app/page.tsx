/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/purity */
/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import BranchSelector from "@/components/BranchSelector";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

const branches = [
  { id: "TBD", name: "Toyota Bình Dương", label: "Binh Duong Showroom" },
  { id: "TMP", name: "Toyota Mỹ Phước", label: "My Phuoc Showroom" },
];

const THEMES: Record<
  string,
  { bg: string; secondary: string; isDark: boolean }
> = {
  "luxury-dark": {
    bg: "radial-gradient(circle at center, #1a1a1a 0%, #000000 100%)",
    secondary: "#ffffff",
    isDark: true,
  },
  "toyota-red": {
    bg: "radial-gradient(circle at center, #8b0000 0%, #2a0000 100%)",
    secondary: "#ffffff",
    isDark: true,
  },
  "pearl-white": {
    bg: "radial-gradient(circle at center, #ffffff 0%, #d1d1d1 100%)",
    secondary: "#1a1a1a",
    isDark: false,
  },
  "silver-met": {
    bg: "radial-gradient(circle at center, #4b4d4e 0%, #1a1c1d 100%)",
    secondary: "#ffffff",
    isDark: true,
  },
  "bronze-met": {
    bg: "radial-gradient(circle at center, #5d4a3a 0%, #1e160e 100%)",
    secondary: "#ffffff",
    isDark: true,
  },
  "modern-blue": {
    bg: "radial-gradient(circle at center, #001a33 0%, #000810 100%)",
    secondary: "#ffffff",
    isDark: true,
  },
};

export default function LuxuryDisplay() {
  const [branchId, setBranchId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [config, setConfig] = useState({
    name: "WELCOME",
    themeId: "luxury-dark",
    fontSize: 15,
    textColor: "#F5C842",
  });

  // Hàm kích hoạt Toàn màn hình
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(
          `Error attempting to enable full-screen mode: ${err.message}`,
        );
      });
      setIsFullscreen(true);
    } else {
      // Nếu muốn bấm lần nữa để thoát thì dùng dòng dưới, nếu không thì thôi
      // document.exitFullscreen();
      // setIsFullscreen(false);
    }
  }, []);

  // Lắng nghe sự kiện phím hoặc click chuột để vào fullscreen
  useEffect(() => {
    const handleInteraction = () => {
      if (!isFullscreen) toggleFullscreen();
    };

    window.addEventListener("click", handleInteraction);
    window.addEventListener("keydown", handleInteraction);

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, [isFullscreen, toggleFullscreen]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fireConfetti = useCallback((color: string) => {
    const count = 200;
    const defaults = { origin: { y: 0.7 }, zIndex: 1000 };
    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
        colors: [color, "#ffffff", "#FFD700"],
      });
    }
    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  }, []);

  useEffect(() => {
    if (!branchId) return;
    fetch(`/api/settings?branch_id=${branchId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setConfig({
            name: data.customer_name,
            themeId: data.theme_id || "luxury-dark",
            fontSize: data.font_size || 15,
            textColor: data.text_color || "#F5C842",
          });
        }
      });

    const channel = supabase
      .channel(`showroom-${branchId}`)
      .on("broadcast", { event: "car-delivery" }, (payload) => {
        const p = payload.payload;
        setConfig({
          name: p.customer_name,
          themeId: p.theme_id,
          fontSize: p.font_size,
          textColor: p.text_color,
        });
        fireConfetti(p.text_color || "#F5C842");
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [branchId, fireConfetti]);

  useEffect(() => {
    const saved = localStorage.getItem("selected_branch_id");
    if (saved) setBranchId(saved);
    setLoading(false);
  }, []);

  const activeTheme = useMemo(
    () => THEMES[config.themeId] || THEMES["luxury-dark"],
    [config.themeId],
  );

  if (loading) return <div className="h-screen bg-black" />;
  if (!branchId) return <BranchSelector onSelect={setBranchId} />;

  const branch = branches.find((b) => b.id === branchId);

  return (
    <>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,700;1,900&family=Barlow:wght@100;300;400;700;900&display=swap");

        :root {
          --logo-size: clamp(60px, 6vw, 100px);
          --brand-size: clamp(28px, 3.5vw, 56px);
          --branch-size: clamp(10px, 1vw, 16px);
          --clock-size: clamp(48px, 7vw, 112px);
          --date-size: clamp(10px, 1vw, 15px);
          --badge-size: clamp(9px, 0.9vw, 13px);
          --subtitle-size: clamp(18px, 2.8vw, 44px);
          --footer-label-size: clamp(9px, 0.85vw, 13px);
          --footer-brand-size: clamp(13px, 1.4vw, 22px);
          --header-padding: clamp(16px, 3.5vw, 64px);
          --logo-gap: clamp(12px, 2vw, 40px);
          --logo-radius: clamp(10px, 1.5vw, 16px);
        }

        .particle {
          position: absolute;
          background: ${config.textColor};
          border-radius: 50%;
          opacity: 0.15;
          animation: float 20s infinite linear;
          pointer-events: none;
        }
        @keyframes float {
          0% {
            transform: translateY(110vh) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 0.3;
          }
          90% {
            opacity: 0.3;
          }
          100% {
            transform: translateY(-10vh) scale(1.5);
            opacity: 0;
          }
        }
        .vignette {
          box-shadow: ${activeTheme.isDark
            ? "inset 0 0 200px rgba(0, 0, 0, 0.8)"
            : "inset 0 0 200px rgba(0, 0, 0, 0.1)"};
        }

        /* Ẩn con trỏ chuột sau vài giây để giao diện Cinematic hơn */
        .cursor-none-auto {
          cursor: none;
        }
      `}</style>

      <div
        onClick={toggleFullscreen} // Bấm vào bất kỳ đâu cũng kích hoạt
        className="fixed inset-0 flex flex-col transition-all duration-1000 overflow-hidden cursor-pointer"
        style={{
          background: activeTheme.bg,
          color: activeTheme.secondary,
          fontFamily: "'Barlow', sans-serif",
        }}
      >
        {/* Hướng dẫn nhỏ chỉ hiện khi chưa fullscreen - mờ nhạt để không ảnh hưởng thẩm mỹ */}
        {!isFullscreen && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 opacity-20 text-[10px] uppercase tracking-widest">
            Click to enter Fullscreen mode
          </div>
        )}

        <div className="absolute inset-0 vignette pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />

        {/* Các hạt trôi nổi */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 6 + 2}px`,
                height: `${Math.random() * 6 + 2}px`,
                animationDelay: `${Math.random() * 15}s`,
                animationDuration: `${15 + Math.random() * 10}s`,
              }}
            />
          ))}
        </div>

        {/* HEADER */}
        <header
          className="relative z-20 flex items-center justify-between"
          style={{ padding: "var(--header-padding)" }}
        >
          <div className="flex items-center" style={{ gap: "var(--logo-gap)" }}>
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="relative flex-shrink-0"
            >
              <div
                className={`flex items-center justify-center shadow-2xl ${activeTheme.isDark ? "bg-white" : "bg-gray-100"}`}
                style={{
                  width: "var(--logo-size)",
                  height: "var(--logo-size)",
                  borderRadius: "var(--logo-radius)",
                  padding: "calc(var(--logo-size) * 0.2)",
                }}
              >
                <img
                  src="/avt.jpg"
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div
                className={`absolute -inset-2 border animate-pulse ${activeTheme.isDark ? "border-white/10" : "border-black/5"}`}
                style={{ borderRadius: "var(--logo-radius)" }}
              />
            </motion.div>

            <div style={{ lineHeight: 1 }}>
              <h2
                className="font-black tracking-[0.3em]"
                style={{ fontSize: "var(--brand-size)", marginBottom: "0.3em" }}
              >
                TOYOTA
              </h2>
              <div className="flex items-center gap-3 opacity-50">
                <span
                  className={`h-px w-6 ${activeTheme.isDark ? "bg-white" : "bg-black"}`}
                />
                <p
                  className="uppercase tracking-[0.6em] font-light"
                  style={{ fontSize: "var(--branch-size)" }}
                >
                  {branch?.label}
                </p>
              </div>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <div
              className="font-black tracking-tighter opacity-90 tabular-nums"
              style={{ fontSize: "var(--clock-size)", lineHeight: 1 }}
            >
              {currentTime.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
            <div
              className="uppercase tracking-[0.4em] opacity-40 font-medium"
              style={{ fontSize: "var(--date-size)", marginTop: "0.4em" }}
            >
              {new Intl.DateTimeFormat("vi-VN", { dateStyle: "full" }).format(
                currentTime,
              )}
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-10 -mt-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`mb-12 px-10 py-3 rounded-full border backdrop-blur-md shadow-2xl ${activeTheme.isDark ? "border-white/10 bg-black/20" : "border-black/10 bg-white/40"}`}
          >
            <span
              className="font-black uppercase tracking-[1.5em]"
              style={{ color: config.textColor, fontSize: "var(--badge-size)" }}
            >
              Lễ Bàn Giao Xe
            </span>
          </motion.div>

          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            className="font-thin uppercase tracking-[0.8em] mb-12"
            style={{ fontSize: "var(--subtitle-size)" }}
          >
            Trân trọng chúc mừng
          </motion.h3>

          <AnimatePresence mode="wait">
            <motion.div
              key={config.name}
              initial={{ y: 80, opacity: 0, filter: "blur(30px)", scale: 0.9 }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)", scale: 1 }}
              exit={{ y: -80, opacity: 0, filter: "blur(30px)", scale: 1.1 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <h1
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: `${config.fontSize}vh`,
                  color: config.textColor,
                  textShadow: activeTheme.isDark
                    ? `0 20px 100px ${config.textColor}44`
                    : `0 10px 40px ${config.textColor}22`,
                }}
                className="italic font-black leading-[1.1] drop-shadow-2xl px-20"
              >
                {config.name.toUpperCase()}
              </h1>
            </motion.div>
          </AnimatePresence>
        </main>

        {/* FOOTER */}
        <footer
          className="flex justify-between items-end"
          style={{ padding: "var(--header-padding)" }}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5em" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
              <span
                className="opacity-30 font-bold uppercase tracking-[0.3em]"
                style={{ fontSize: "var(--footer-label-size)" }}
              >
                Official Delivery System
              </span>
            </div>
            <p
              className="opacity-40 tracking-[0.2em] font-light"
              style={{ fontSize: "var(--footer-brand-size)" }}
            >
              © {branch?.name}
            </p>
          </div>

          <div className="flex flex-col items-end gap-1 border-r-2 border-red-600 pr-6">
            <span
              className="opacity-60 font-black italic uppercase tracking-[0.5em]"
              style={{ fontSize: "var(--footer-label-size)" }}
            >
              Quality - Service - Care
            </span>
            <span
              className="opacity-30 uppercase tracking-[0.2em]"
              style={{ fontSize: "calc(var(--footer-label-size) * 0.85)" }}
            >
              The Ultimate Driving Experience
            </span>
          </div>
        </footer>
      </div>
    </>
  );
}
