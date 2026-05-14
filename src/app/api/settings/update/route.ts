/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Khởi tạo Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Nhận các biến mới từ Admin Page
    const { branchId, name, theme_id, font_size, text_color } = body;

    // 1. Kiểm tra đầu vào tối thiểu
    if (!branchId) {
      return NextResponse.json(
        { error: "Mã chi nhánh (branchId) là bắt buộc" },
        { status: 400 },
      );
    }

    // 2. Upsert vào Database (Đồng bộ các cột mới)
    // Lưu ý: Nếu database chưa có các cột này, bạn phải chạy 'npx prisma db push' trước.
    const result = await prisma.settings.upsert({
      where: { branch_id: branchId },
      update: {
        customer_name: name || "Chào mừng quý khách",
        theme_id: theme_id || "luxury-dark",
        font_size: font_size || 15,
        text_color: text_color || "#F5C842",
        updated_at: new Date(),
      },
      create: {
        branch_id: branchId,
        customer_name: name || "Chào mừng quý khách",
        theme_id: theme_id || "luxury-dark",
        font_size: font_size || 15,
        text_color: text_color || "#F5C842",
        updated_at: new Date(),
      },
    });

    // 3. Bắn Realtime qua Supabase Broadcast cho TV nhận lệnh ngay lập tức
    const channel = supabase.channel(`showroom-${branchId}`);

    // Gửi payload đầy đủ các thuộc tính để TV thay đổi giao diện động
    const sendResponse = await channel.send({
      type: "broadcast",
      event: "car-delivery",
      payload: {
        customer_name: result.customer_name,
        theme_id: result.theme_id,
        font_size: result.font_size,
        text_color: result.text_color,
        timestamp: new Date().toISOString(),
      },
    });

    if (sendResponse !== "ok") {
      console.warn(`[Supabase Broadcast] Thất bại: ${sendResponse}`);
    }

    // 4. Trả về kết quả
    return NextResponse.json({
      success: true,
      message: "Đã cập nhật Database và đồng bộ TV thành công",
      data: result,
    });
  } catch (error: any) {
    console.error("--- API UPDATE ERROR ---");
    console.error(error);

    return NextResponse.json(
      { error: "Lỗi Server: " + (error.message || "Unknown error") },
      { status: 500 },
    );
  }
}
