/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import BranchSelector from "@/components/BranchSelector";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

const branches = [
  {
    id: "TBD",
    name: "Toyota Bình Dương",
    label: "Binh Duong Showroom",
    location: "Binh Duong Province",
  },
  {
    id: "TMP",
    name: "Toyota Mỹ Phước",
    label: "My Phuoc Showroom",
    location: "My Phuoc District",
  },
];

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

  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.error(`Lỗi full màn hình: ${e.message}`);
      });
    }
  }, []);

  const fireConfetti = useCallback(() => {
    const end = Date.now() + 5 * 1000;
    const colors = ["#F5C842", "#FFFFFF", "#FFE066", "#C9942A"];
    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      handleFullscreen();
      if (e.key === "1") {
        setBranchId("TBD");
        localStorage.setItem("selected_branch_id", "TBD");
      }
      if (e.key === "2") {
        setBranchId("TMP");
        localStorage.setItem("selected_branch_id", "TMP");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("click", handleFullscreen);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("click", handleFullscreen);
    };
  }, [handleFullscreen]);

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
  }, [branchId, fireConfetti]);

  // Tự động bắn pháo hoa mỗi 10 giây
  useEffect(() => {
    const autoConfetti = setInterval(() => {
      fireConfetti();
    }, 10000);
    return () => clearInterval(autoConfetti);
  }, [fireConfetti]);

  if (loading) return <div className="h-screen bg-[#060608]" />;
  if (!branchId) return <BranchSelector onSelect={setBranchId} />;

  const branch = branches.find((b) => b.id === branchId);

  return (
    <>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,900&family=Barlow:wght@100;200;300;400;500;600;700;900&display=swap");

        *,
        *::before,
        *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        :root {
          --gold: #f5c842;
          --gold-dim: #c9942a;
          --off-white: #f0ebe0;
          --muted: rgba(240, 235, 224, 0.52);
          --dim: rgba(240, 235, 224, 0.28);

          /*
           * Dùng vh làm đơn vị chính thay vì vw.
           * vh tỉ lệ theo chiều cao màn hình → chữ to đúng trên TV 4K/1080p
           * clamp(min_px, preferred_vh, max_px) đảm bảo không bao giờ quá nhỏ hoặc quá to
           */
          --fs-brand-name: clamp(24px, 4.2vh, 64px);
          --fs-brand-sub: clamp(10px, 1.5vh, 22px);
          --fs-clock: clamp(40px, 8vh, 110px);
          --fs-clock-sec: clamp(20px, 3.5vh, 50px);
          --fs-clock-date: clamp(11px, 1.5vh, 22px);
          --fs-badge: clamp(11px, 1.5vh, 22px);
          --fs-event: clamp(18px, 3.2vh, 52px);
          --fs-congrats: clamp(13px, 2vh, 30px);
          --fs-name: clamp(64px, 16vh, 240px); /* ← tên khách: lớn nhất */
          --fs-footer: clamp(11px, 1.6vh, 24px);
          --fs-footer-sub: clamp(10px, 1.3vh, 18px);
        }

        /* ── Animations ── */
        @keyframes spin-cw {
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes spin-ccw {
          to {
            transform: rotate(-360deg);
          }
        }
        @keyframes blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.15;
          }
        }
        @keyframes pulse-b {
          0%,
          100% {
            border-color: rgba(245, 200, 66, 0.35);
          }
          50% {
            border-color: rgba(245, 200, 66, 0.9);
          }
        }
        @keyframes p-rise {
          0% {
            transform: translateY(110vh);
            opacity: 0;
          }
          8% {
            opacity: 0.6;
          }
          92% {
            opacity: 0.18;
          }
          100% {
            transform: translateY(-10vh) translateX(28px);
            opacity: 0;
          }
        }
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        .spin-cw {
          animation: spin-cw 22s linear infinite;
        }
        .spin-ccw {
          animation: spin-ccw 15s linear infinite;
        }
        .blink {
          animation: blink 2s ease-in-out infinite;
        }
        .pulse-b {
          animation: pulse-b 3s ease-in-out infinite;
        }

        /* --- CSS Tối ưu --- */

        /* Thay vì lặp lại 20 hạt, chỉ dùng 8 hạt và đơn giản hóa animation */
        .particle {
          position: absolute;
          border-radius: 50%;
          background: var(--gold);
          /* Chỉ dùng opacity và transform để GPU xử lý */
          will-change: transform, opacity;
          animation: p-rise linear infinite;
          opacity: 0;
        }

        @keyframes p-rise {
          0% {
            transform: translateY(105vh);
            opacity: 0;
          }
          20% {
            opacity: 0.4;
          }
          80% {
            opacity: 0.1;
          }
          100% {
            transform: translateY(-5vh);
            opacity: 0;
          }
        }

        /* Xóa bỏ hiệu ứng Shimmer trên text nếu không cần thiết vì nó gây re-paint liên tục */
        .name-gradient-red {
          background: linear-gradient(
            175deg,
            #ffffff 0%,
            #ff0000 50%,
            #330000 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          will-change: filter; /* Tối ưu cho hiệu ứng blur khi chuyển tên */
        }

        /* Shimmer overlay chạy qua tên */
        .shimmer-name {
          background-image: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.25) 50%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: shimmer 5s infinite linear;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* CRT scanline nhẹ */
        .scanline {
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.04) 2px,
            rgba(0, 0, 0, 0.04) 4px
          );
        }
      `}</style>

      <div
        className="fixed inset-0 overflow-hidden text-white"
        style={{
          backgroundColor: "#060608",
          fontFamily: "'Barlow', sans-serif",
        }}
      >
        {/* --- Phần SVG BG Tối ưu --- */}
        <div className="absolute inset-0 z-0">
          <svg
            className="w-full h-full"
            viewBox="0 0 1920 1080"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <radialGradient id="bgG" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#F5C842" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#F5C842" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="1920" height="1080" fill="#060608" />
            <ellipse cx="960" cy="540" rx="720" ry="520" fill="url(#bgG)" />
            {/* Chỉ giữ lại 1 vòng tròn thay vì 3-4 cái */}
            <circle
              cx="960"
              cy="540"
              r="530"
              fill="none"
              stroke="#F5C842"
              strokeWidth="0.5"
              strokeOpacity="0.05"
            />
          </svg>
        </div>

        {/* Vignette */}
        <div
          className="absolute inset-0 z-[2] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 95% 80% at 50% 50%, transparent 38%, #000 100%)",
          }}
        />

        {/* Scanline */}
        <div className="scanline absolute inset-0 z-[3] pointer-events-none" />

        {/* --- Giảm số lượng Particles từ 20 xuống 8 --- */}
        <div className="absolute inset-0 z-[4] pointer-events-none overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                width: "2px",
                height: "2px",
                animationDuration: `${Math.random() * 10 + 15}s`,
                animationDelay: `${Math.random() * 10}s`,
              }}
            />
          ))}
        </div>

        {/* Corner marks */}
        {(
          [
            "top-[3vh] left-[2.5vw] border-t-2 border-l-2",
            "top-[3vh] right-[2.5vw] border-t-2 border-r-2",
            "bottom-[3vh] left-[2.5vw] border-b-2 border-l-2",
            "bottom-[3vh] right-[2.5vw] border-b-2 border-r-2",
          ] as const
        ).map((cls, i) => (
          <div
            key={i}
            className={`absolute z-5 pointer-events-none w-[5vw] h-[5vh] border-[#C9942A]/40 ${cls}`}
          />
        ))}

        {/* ── MAIN FLEX LAYOUT ── */}
        <div className="relative z-10 flex flex-col h-full">
          {/* HEADER */}
          <header
            className="flex items-center justify-between shrink-0"
            style={{
              padding: "2vh 4vw",
              borderBottom: "1px solid rgba(245,200,66,0.13)",
            }}
          >
            {/* Brand */}
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="flex items-center"
              style={{ gap: "2vw" }}
            >
              {/* Logo ring */}
              <div
                className="relative shrink-0"
                style={{
                  width: "clamp(52px,8vh,110px)",
                  height: "clamp(52px,8vh,110px)",
                }}
              >
                <div
                  className="spin-cw absolute rounded-full border border-[#C9942A]/55"
                  style={{ inset: "-3px" }}
                />
                <div
                  className="spin-ccw absolute rounded-full border border-[#F5C842]/20"
                  style={{ inset: "-8px" }}
                />
                <div
                  className="w-full h-full rounded-full flex items-center justify-center overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg,#1A1500,#0A0800)",
                    border: "1px solid rgba(245,200,66,0.35)",
                  }}
                >
                  <img
                    src="./avt.jpg"
                    alt="Toyota"
                    className="rounded-full object-contain"
                    style={{ width: "80%", height: "80%" }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              </div>

              <div className="flex flex-col" style={{ gap: "0.5vh" }}>
                <div
                  className="font-black tracking-[0.3em] text-white"
                  style={{ fontSize: "var(--fs-brand-name)" }}
                >
                  TOYOTA
                </div>
                <div
                  className="font-light tracking-[0.5em] uppercase"
                  style={{ fontSize: "var(--fs-brand-sub)", color: "#F5C842" }}
                >
                  {branch?.label ?? "Vietnam Showroom"}
                </div>
              </div>
            </motion.div>

            {/* Clock */}
            <motion.div
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-end"
            >
              <div
                style={{
                  fontSize: "var(--fs-clock)",
                  fontWeight: 100,
                  lineHeight: 1,
                  color: "#fff",
                  letterSpacing: "-0.02em",
                }}
              >
                {currentTime.toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                <span
                  style={{
                    fontSize: "var(--fs-clock-sec)",
                    color: "#F5C842",
                    marginLeft: "0.25em",
                    fontWeight: 300,
                  }}
                >
                  {currentTime.toLocaleTimeString("vi-VN", {
                    second: "2-digit",
                  })}
                </span>
              </div>
              <div
                className="uppercase tracking-[0.35em] font-light"
                style={{
                  fontSize: "var(--fs-clock-date)",
                  color: "var(--muted)",
                  marginTop: "0.5vh",
                }}
              >
                {currentTime.toLocaleDateString("vi-VN", {
                  weekday: "long",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </div>
            </motion.div>
          </header>

          {/* CENTER */}
          <main
            className="flex-1 flex flex-col items-center justify-center text-center"
            style={{ padding: "1vh 4vw", gap: "1.8vh" }}
          >
            {/* Live badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="pulse-b inline-flex items-center rounded-full"
              style={{
                gap: "1.0vw",
                padding: "0.8vh 2vw",
                border: "1.5px solid rgba(245,200,66,.35)",
              }}
            >
              <div
                className="blink rounded-full shrink-0"
                style={{
                  width: "clamp(6px,1vh,12px)",
                  height: "clamp(6px,1vh,12px)",
                  background: "#F5C842",
                }}
              />
              <span
                className="uppercase font-semibold tracking-[0.5em]"
                style={{ fontSize: "var(--fs-badge)", color: "#F5C842" }}
              >
                Premium Experience · Live
              </span>
            </motion.div>

            {/* "Lễ Bàn Giao Xe" */}
            <div className="flex items-center" style={{ gap: "2.5vw" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "8vw" }}
                transition={{ delay: 0.4, duration: 1 }}
                style={{
                  height: "1.5px",
                  background: "linear-gradient(to right, transparent, #C9942A)",
                  flexShrink: 0,
                }}
              />
              <span
                className="font-extralight uppercase"
                style={{
                  fontSize: "var(--fs-event)",
                  letterSpacing: "0.6em",
                  color: "#F0EBE0",
                  paddingLeft: "0.6em",
                  whiteSpace: "nowrap",
                }}
              >
                Lễ Bàn Giao Xe
              </span>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "8vw" }}
                transition={{ delay: 0.4, duration: 1 }}
                style={{
                  height: "1.5px",
                  background: "linear-gradient(to left, transparent, #C9942A)",
                  flexShrink: 0,
                }}
              />
            </div>

            {/* Congrats */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="uppercase font-light tracking-[0.5em]"
              style={{
                fontSize: "var(--fs-congrats)",
                color: "#F5C842",
                paddingLeft: "0.5em",
              }}
            >
              Chúc mừng quý khách
            </motion.p>

            {/* ── TÊN KHÁCH ── */}
            <AnimatePresence mode="wait">
              <motion.div
                key={name}
                className="relative w-full flex flex-col items-center leading-1.5"
                initial={{ opacity: 0, y: 50, filter: "blur(18px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 1.06, filter: "blur(22px)" }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Glow hào quang phía sau */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(245,200,66,0.18) 0%, transparent 70%)",
                  }}
                />

                {/* Shimmer chạy qua chữ */}
                <div
                  aria-hidden
                  className="shimmer-name absolute w-full text-center pointer-events-none select-none z-10 leading-5"
                  style={{
                    fontFamily: "'Playfair Display',serif",
                    fontWeight: 900,
                    fontStyle: "italic",
                    fontSize: "var(--fs-name)",
                    lineHeight: 1.0,
                  }}
                >
                  {formatName(name)}
                </div>

                {/* Tên chính */}
                <h1
                  className="name-gradient relative z-[5] w-full text-center text-red-500"
                  style={{
                    fontFamily: "'Playfair Display',serif",
                    fontWeight: 900,
                    fontStyle: "italic",
                    fontSize: "var(--fs-name)",
                    lineHeight: 1.0,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {formatName(name)}
                </h1>

                {/* Reflection */}
                {/* <div
                  aria-hidden
                  className="w-full text-center select-none pointer-events-none"
                  style={{
                    fontFamily: "'Playfair Display',serif",
                    fontWeight: 900,
                    fontStyle: "italic",
                    fontSize: "var(--fs-name)",
                    lineHeight: 1.0,
                    color: "#C9942A",
                    opacity: 0.07,
                    transform: "scaleY(-0.42)",
                    filter: "blur(5px)",
                    marginTop: "-0.07em",
                  }}
                >
                  {formatName(name)}
                </div> */}
              </motion.div>
            </AnimatePresence>

            {/* Divider dưới tên */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex items-center"
              style={{ gap: "1.5vw", marginTop: "0.5vh" }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "14vw" }}
                transition={{ delay: 1.1, duration: 1.4 }}
                style={{
                  height: "1.5px",
                  background:
                    "linear-gradient(to right, transparent, #F5C842, transparent)",
                }}
              />
              <div
                style={{
                  width: "clamp(8px,1.1vw,16px)",
                  height: "clamp(8px,1.1vw,16px)",
                  background: "#F5C842",
                  transform: "rotate(45deg)",
                  flexShrink: 0,
                  boxShadow: "0 0 16px #F5C842, 0 0 32px rgba(245,200,66,0.55)",
                }}
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "14vw" }}
                transition={{ delay: 1.1, duration: 1.4 }}
                style={{
                  height: "1.5px",
                  background:
                    "linear-gradient(to left, transparent, #F5C842, transparent)",
                }}
              />
            </motion.div>
          </main>

          {/* FOOTER */}
          <footer
            className="flex items-center justify-between shrink-0"
            style={{
              padding: "2vh 4vw",
              borderTop: "1px solid rgba(245,200,66,0.13)",
            }}
          >
            <div className="flex flex-col" style={{ gap: "0.5vh" }}>
              <span
                className="uppercase font-bold tracking-[0.5em]"
                style={{ fontSize: "var(--fs-footer)", color: "#F5C842" }}
              >
                {branch?.name ?? "TOYOTA VIỆT NAM"}
              </span>
              <p
                className="uppercase font-light tracking-[0.35em]"
                style={{
                  fontSize: "var(--fs-footer-sub)",
                  color: "var(--muted)",
                }}
              >
                Official Delivery Service
              </p>
            </div>

            <div
              className="flex-1 h-[1px]"
              style={{
                margin: "0 3vw",
                background:
                  "linear-gradient(to right, transparent, rgba(245,200,66,0.15), transparent)",
              }}
            />

            <div className="text-right">
              <div
                className="uppercase italic font-light tracking-[0.5em]"
                style={{
                  fontSize: "var(--fs-footer-sub)",
                  color: "var(--muted)",
                }}
              >
                Luxury Experience
              </div>
              <div
                className="tracking-[0.35em] font-light"
                style={{
                  fontSize: "var(--fs-footer-sub)",
                  color: "var(--dim)",
                  marginTop: "0.3vh",
                }}
              >
                {branch?.location ?? "Vietnam"}
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
