/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useEffect } from "react";

const branches = [
  { id: "TBD", name: "Toyota Bình Dương", passcode: "2026" },
  { id: "TMP", name: "Toyota Mỹ Phước", passcode: "7979" },
];

<style jsx global>{`
  @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,700;1,900&family=Barlow:wght@100;300;400;700;900&display=swap");
`}</style>;

// Bảng màu nền phong phú hơn, mô phỏng các màu sơn xe thực tế
const THEMES = [
  {
    id: "luxury-dark",
    name: "Deep Black",
    color: "#000000",
    secondary: "#1a1a1a",
  },
  {
    id: "toyota-red",
    name: "Emotional Red",
    color: "#ed1c24",
    secondary: "#8b0000",
  },
  {
    id: "pearl-white",
    name: "White Pearl",
    color: "#f9f9f9",
    secondary: "#d1d1d1",
  },
  {
    id: "silver-met",
    name: "Silver Metallic",
    color: "#8e9294",
    secondary: "#4b4d4e",
  },
  {
    id: "bronze-met",
    name: "Bronze Mica",
    color: "#7b614b",
    secondary: "#3e3126",
  },
  {
    id: "modern-blue",
    name: "Nebula Blue",
    color: "#003366",
    secondary: "#001a33",
  },
];

export default function AdminPage() {
  const [selectedBranch, setSelectedBranch] = useState("TBD");
  const [passcode, setPasscode] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [themeId, setThemeId] = useState("luxury-dark");
  const [fontSize, setFontSize] = useState(15);
  const [textColor, setTextColor] = useState("#F5C842");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    setMessage({ type: "", text: "" });
    fetch(`/api/settings?branch_id=${selectedBranch}`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setCustomerName(data.customer_name || "");
          setThemeId(data.theme_id || "luxury-dark");
          setFontSize(data.font_size || 15);
          setTextColor(data.text_color || "#F5C842");
        }
      });
  }, [selectedBranch]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentBranch = branches.find((b) => b.id === selectedBranch);
    if (passcode !== currentBranch?.passcode) {
      setMessage({ type: "error", text: "❌ Mã bảo vệ không chính xác!" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/settings/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchId: selectedBranch,
          name: customerName,
          theme_id: themeId,
          font_size: fontSize,
          text_color: textColor,
        }),
      });

      if (res.ok) {
        setMessage({
          type: "success",
          text: "🚀 Đã đồng bộ lên TV thành công!",
        });
        setPasscode("");
      } else {
        setMessage({ type: "error", text: "Lỗi cập nhật server." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Lỗi kết nối." });
    } finally {
      setLoading(false);
    }
  };

  const currentTheme = THEMES.find((t) => t.id === themeId) || THEMES[0];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-4 md:p-10 font-sans selection:bg-red-500/30">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/50 p-6 rounded-3xl border border-white/5 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-600 rounded-2xl shadow-[0_0_20px_rgba(220,38,38,0.3)]">
              <img
                src="/avt.jpg"
                className="w-8 h-8 object-contain brightness-0 invert"
                alt="logo"
              />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white uppercase">
                Control Panel
              </h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em]">
                Toyota Delivery System v2.0
              </p>
            </div>
          </div>
          <div className="flex gap-2 bg-black/40 p-1 rounded-2xl border border-white/5">
            {branches.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBranch(b.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedBranch === b.id ? "bg-red-600 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
              >
                {b.id}
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* CỘT TRÁI: FORM CẤU HÌNH */}
          <div className="lg:col-span-7 space-y-6">
            <form
              onSubmit={handleUpdate}
              className="bg-slate-900/50 p-6 md:p-8 rounded-[2rem] border border-white/5 space-y-8 shadow-2xl"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>{" "}
                    Chi nhánh đang chọn
                  </label>
                  <div className="w-full p-4 bg-black/40 border border-white/10 rounded-2xl text-white font-bold">
                    {branches.find((b) => b.id === selectedBranch)?.name}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-red-400 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>{" "}
                    Mã xác nhận cập nhật
                  </label>
                  <input
                    type="password"
                    placeholder="Nhập mã 4 số"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="w-full p-4 bg-red-500/5 border border-red-500/20 rounded-2xl text-red-500 text-center text-xl font-black placeholder:text-red-900/30 outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Họ tên khách hàng (In hoa)
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) =>
                    setCustomerName(e.target.value.toUpperCase())
                  }
                  placeholder="NGUYỄN VĂN A"
                  className="w-full p-6 bg-black/40 border border-white/10 rounded-2xl text-2xl font-black text-white placeholder:text-slate-800 outline-none focus:border-blue-500 transition-all shadow-inner"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Chọn chủ đề màu sắc (Theme)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setThemeId(t.id)}
                      className={`group relative p-4 rounded-2xl border transition-all duration-300 overflow-hidden ${themeId === t.id ? "border-red-500 ring-2 ring-red-500/20" : "border-white/5 hover:border-white/20"}`}
                    >
                      <div
                        className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity"
                        style={{
                          background: `linear-gradient(45deg, ${t.color}, ${t.secondary})`,
                        }}
                      ></div>
                      <div className="relative flex flex-col items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-full shadow-lg"
                          style={{ backgroundColor: t.color }}
                        ></div>
                        <span
                          className={`text-[10px] font-black uppercase tracking-tighter ${themeId === t.id ? "text-white" : "text-slate-500"}`}
                        >
                          {t.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-black/40 rounded-3xl border border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Màu chữ hiển thị
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-14 h-14 rounded-xl cursor-pointer bg-transparent border-none outline-none"
                    />
                    <div className="flex-1">
                      <div className="text-xs font-mono text-slate-400 uppercase">
                        {textColor}
                      </div>
                      <div className="text-[10px] text-slate-600 uppercase font-bold">
                        Màu Hex Code
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex justify-between">
                    Kích cỡ chữ <span>{fontSize}vh</span>
                  </label>
                  <input
                    type="range"
                    min="8"
                    max="25"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                  />
                </div>
              </div>

              {message.text && (
                <div
                  className={`p-4 rounded-2xl text-sm font-bold text-center animate-bounce ${message.type === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}
                >
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full py-6 bg-red-600 hover:bg-red-500 disabled:bg-slate-800 text-white rounded-[1.5rem] font-black tracking-[0.3em] transition-all overflow-hidden shadow-[0_20px_50px_-10px_rgba(220,38,38,0.5)] active:scale-95"
              >
                <span className="relative z-10 uppercase">
                  {loading ? "Đang xử lý..." : "Gửi lệnh cập nhật"}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </button>
            </form>
          </div>

          {/* CỘT PHẢI: PREVIEW THÔNG MINH */}
          {/* CỘT PHẢI: PREVIEW THÔNG MINH */}
          <div className="lg:col-span-5 space-y-6">
            <div className="sticky top-10 space-y-6">
              <div className="bg-slate-900 rounded-[2rem] border border-white/5 p-2 shadow-2xl overflow-hidden">
                {/* Container mô phỏng tỉ lệ 16:9 của TV */}
                <div className="bg-black rounded-[1.5rem] aspect-video relative overflow-hidden group shadow-inner">
                  {/* --- BẮT ĐẦU GIAO DIỆN TV MÔ PHỎNG --- */}
                  <div
                    className="absolute inset-0 transition-all duration-700 flex flex-col"
                    style={{
                      background:
                        THEMES.find((t) => t.id === themeId)?.secondary ||
                        "#000",
                      backgroundImage: `radial-gradient(circle at center, ${THEMES.find((t) => t.id === themeId)?.secondary} 0%, ${THEMES.find((t) => t.id === themeId)?.color} 100%)`,
                      color: "#fff",
                      fontFamily: "'Barlow', sans-serif",
                      transform: "scale(0.35)", // Scale nhỏ lại để vừa khung preview
                      width: "285.7%", // Bù lại tỉ lệ scale (100 / 0.35)
                      height: "285.7%",
                      left: "-92.8%",
                      top: "-92.8%",
                    }}
                  >
                    {/* Lớp hạt (Particles) mô phỏng */}
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />

                    {/* Header TV */}
                    <header className="p-12 flex justify-between items-start">
                      <div className="flex items-center gap-6">
                        <div className="bg-white p-4 rounded-xl w-20 h-20 flex items-center justify-center">
                          <img
                            src="/avt.jpg"
                            alt="logo"
                            className="w-full object-contain"
                          />
                        </div>
                        <div>
                          <h2 className="text-5xl font-black tracking-[0.3em] m-0">
                            TOYOTA
                          </h2>
                          <p className="text-xl tracking-[0.5em] opacity-50 uppercase m-0">
                            {branches.find((b) => b.id === selectedBranch)
                              ?.id === "TBD"
                              ? "Binh Duong Showroom"
                              : "My Phuoc Showroom"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-7xl font-black tabular-nums">
                          14:30
                        </div>
                        <div className="text-lg opacity-40 tracking-widest uppercase">
                          Thứ Năm, 14 Tháng 5, 2026
                        </div>
                      </div>
                    </header>

                    {/* Main TV */}
                    <main className="flex-1 flex flex-col items-center justify-center text-center -mt-20">
                      <div className="mb-10 px-10 py-2 rounded-full border border-white/20 bg-black/20 backdrop-blur-md">
                        <span
                          className="text-xl font-black uppercase tracking-[1em]"
                          style={{ color: textColor }}
                        >
                          Lễ Bàn Giao Xe
                        </span>
                      </div>

                      <h3 className="text-4xl font-thin uppercase tracking-[0.8em] mb-10 opacity-50">
                        Trân trọng chúc mừng
                      </h3>

                      <h1
                        style={{
                          fontFamily: "'Playfair Display', serif",
                          fontSize: `${fontSize}vh`,
                          color: textColor,
                          textShadow: `0 20px 80px ${textColor}44`,
                        }}
                        className="italic font-black leading-tight uppercase px-20"
                      >
                        {customerName || "Tên Khách Hàng"}
                      </h1>
                    </main>

                    {/* Footer TV */}
                    <footer className="p-12 flex justify-between items-end opacity-40">
                      <div className="text-xl tracking-widest font-light">
                        © {branches.find((b) => b.id === selectedBranch)?.name}
                      </div>
                      <div className="text-right border-r-4 border-red-600 pr-6">
                        <div className="font-bold italic tracking-widest uppercase text-sm">
                          Quality - Service - Care
                        </div>
                      </div>
                    </footer>
                  </div>
                  {/* --- KẾT THÚC GIAO DIỆN TV MÔ PHỎNG --- */}

                  {/* Lớp kính phản chiếu (Glassmorphism effect) */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
                </div>

                <div className="p-4 bg-slate-900/80 text-center border-t border-white/5">
                  <div className="flex items-center justify-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
                      Live Showroom Preview Mode
                    </span>
                  </div>
                </div>
              </div>

              {/* Panel gợi ý màu sắc nhanh */}
              <div className="grid grid-cols-3 gap-2">
                {["#F5C842", "#FFFFFF", "#FF4D4D"].map((color) => (
                  <button
                    key={color}
                    onClick={() => setTextColor(color)}
                    className="h-1 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors"
                    style={{
                      borderBottom:
                        textColor === color ? `2px solid ${color}` : "none",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
