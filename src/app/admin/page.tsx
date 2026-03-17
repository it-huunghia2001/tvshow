"use client";
import { useState, useEffect } from "react";

// Định nghĩa mã bảo vệ riêng cho từng chi nhánh
const branches = [
  { id: "TBD", name: "Toyota Bình Dương", passcode: "2026" },
  { id: "TMP", name: "Toyota Mỹ Phước", passcode: "7979" },
];

export default function AdminPage() {
  const [selectedBranch, setSelectedBranch] = useState("TBD");
  const [passcode, setPasscode] = useState(""); // Lưu passcode người dùng nhập
  const [customerName, setCustomerName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Reset thông báo và passcode khi đổi chi nhánh
  useEffect(() => {
    setMessage({ type: "", text: "" });
    setPasscode("");

    fetch(`/api/settings?branch_id=${selectedBranch}`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setCustomerName(data.customer_name);
          setImageUrl(data.image_url);
        }
      });
  }, [selectedBranch]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    // BƯỚC KIỂM TRA PASSCODE
    const currentBranch = branches.find((b) => b.id === selectedBranch);
    if (passcode !== currentBranch?.passcode) {
      setMessage({
        type: "error",
        text: "❌ Mã bảo vệ không chính xác. Vui lòng kiểm tra lại!",
      });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/settings/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchId: selectedBranch,
          name: customerName,
          imageUrl: imageUrl,
        }),
      });

      if (res.ok) {
        setMessage({
          type: "success",
          text: "✅ Đã cập nhật màn hình thành công!",
        });
        setPasscode(""); // Xóa passcode sau khi cập nhật thành công cho bảo mật
      } else {
        setMessage({ type: "error", text: "Có lỗi xảy ra khi cập nhật." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Lỗi kết nối server." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-10 font-sans text-slate-200">
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/10">
        <div className="bg-gradient-to-br from-red-600 to-red-800 p-8 text-white text-center">
          <h1 className="text-xl font-black uppercase tracking-[0.2em]">
            Showroom Control
          </h1>
          <p className="text-[10px] opacity-60 mt-1 uppercase tracking-widest">
            Toyota Management System
          </p>
        </div>

        <form onSubmit={handleUpdate} className="p-8 space-y-6 bg-white">
          {/* Chọn chi nhánh */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Chi nhánh
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-semibold focus:ring-2 focus:ring-red-500 outline-none transition"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* NHẬP PASSCODE - QUAN TRỌNG */}
          <div>
            <label className="block text-xs font-bold text-red-500 uppercase tracking-wider mb-2">
              Mã bảo vệ (Passcode)
            </label>
            <input
              type="password"
              inputMode="numeric"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="••••"
              className="w-full p-3 bg-red-50 border border-red-100 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition text-center text-2xl tracking-[0.5em] text-red-600 font-bold"
              required
            />
          </div>

          <hr className="border-gray-100" />

          {/* Nhập tên khách */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Tên khách hàng
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="NGUYỄN VĂN A"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition text-lg font-bold uppercase text-gray-700"
              required
            />
          </div>

          {/* Thông báo */}
          {message.text && (
            <div
              className={`p-4 rounded-xl text-sm font-bold text-center animate-pulse ${
                message.type === "success"
                  ? "bg-green-50 text-green-600"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-2xl text-white font-black text-sm tracking-widest transition-all shadow-lg active:scale-95 ${
              loading
                ? "bg-gray-300"
                : "bg-slate-900 hover:bg-black shadow-slate-200"
            }`}
          >
            {loading ? "ĐANG XỬ LÝ..." : "GỬI LỆNH CẬP NHẬT"}
          </button>
        </form>
      </div>
    </div>
  );
}
