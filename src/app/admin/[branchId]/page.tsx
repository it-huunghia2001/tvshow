"use client";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function AdminControl() {
  const { branchId } = useParams();
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleSend = async () => {
    if (!name) return;
    setStatus("loading");

    // Rung điện thoại nhẹ (chỉ Android hỗ trợ tốt)
    if (navigator.vibrate) navigator.vibrate(50);

    const res = await fetch("/api/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, branchId }),
    });

    if (res.ok) {
      setStatus("success");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans">
      <div className="max-w-md mx-auto mt-20 bg-[#111] rounded-[2.5rem] p-8 border border-white/5 shadow-2xl">
        <header className="mb-12 text-center">
          <div className="w-16 h-1 bg-amber-600 mx-auto mb-6 rounded-full" />
          <h2 className="text-2xl font-bold tracking-tight">
            Showroom Control
          </h2>
          <p className="text-white/40 text-xs uppercase mt-2 tracking-widest">
            {branchId} Unit
          </p>
        </header>

        <div className="space-y-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Nhập tên khách hàng..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border-b border-white/10 p-4 text-2xl font-medium outline-none focus:border-amber-500 transition-colors text-center"
            />
          </div>

          <button
            onClick={handleSend}
            disabled={status === "loading"}
            className={`w-full py-6 rounded-2xl text-black font-black text-xl transition-all active:scale-95 ${
              status === "success"
                ? "bg-green-500"
                : "bg-gradient-to-r from-amber-600 to-amber-400"
            }`}
          >
            {status === "loading"
              ? "ĐANG GỬI..."
              : status === "success"
                ? "ĐÃ HIỂN THỊ ✓"
                : "KÍCH HOẠT LỄ TRAO XE"}
          </button>
        </div>
      </div>
    </div>
  );
}
