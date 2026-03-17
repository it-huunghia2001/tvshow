/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Khởi tạo Supabase - Nên dùng Service Role Key trên Server để ổn định nhất
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, branchId, imageUrl } = body;

    // 1. Kiểm tra đầu vào
    if (!branchId) {
      return NextResponse.json(
        { error: "Mã chi nhánh (branchId) là bắt buộc" },
        { status: 400 },
      );
    }

    // 2. Upsert vào bảng settings (tên model viết thường theo schema của bạn)
    // Vì cột updated_at của bạn không có mặc định, ta sẽ truyền thủ công ở đây cho chắc
    const result = await prisma.settings.upsert({
      where: { branch_id: branchId },
      update: {
        customer_name: name || "Chào mừng quý khách",
        image_url: imageUrl,
        updated_at: new Date(),
      },
      create: {
        branch_id: branchId,
        customer_name: name || "Chào mừng quý khách",
        image_url:
          imageUrl ||
          "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200",
        updated_at: new Date(),
      },
    });

    // 3. Bắn Realtime qua Supabase Broadcast
    // Sử dụng await để đảm bảo tin nhắn được gửi đi trước khi đóng kết nối API
    const channel = supabase.channel(`showroom-${branchId}`);
    const sendResponse = await channel.send({
      type: "broadcast",
      event: "car-delivery",
      payload: {
        name: result.customer_name,
        image_url: result.image_url,
        timestamp: new Date().toISOString(),
      },
    });

    if (sendResponse !== "ok") {
      console.warn(`[Supabase] Gửi tín hiệu thất bại: ${sendResponse}`);
    }

    // 4. Trả về kết quả thành công
    return NextResponse.json({
      success: true,
      message: "Cập nhật dữ liệu và gửi tín hiệu Realtime thành công",
      data: result,
    });
  } catch (error: any) {
    console.error("--- API UPDATE ERROR ---");
    console.error(error);

    // Bắt lỗi cụ thể của Prisma
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Lỗi trùng lặp branch_id" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Lỗi Server: " + (error.message || "Unknown error") },
      { status: 500 },
    );
  }
}
