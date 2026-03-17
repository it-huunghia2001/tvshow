import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const branchId = searchParams.get("branch_id");

  if (!branchId)
    return NextResponse.json({ error: "Missing Branch ID" }, { status: 400 });

  try {
    let data = await prisma.settings.findUnique({
      where: { branch_id: branchId },
    });

    // Nếu chi nhánh chưa có trong DB, tạo mặc định luôn cho tiện
    if (!data) {
      data = await prisma.settings.create({
        data: {
          branch_id: branchId,
          customer_name: "Chào mừng quý khách",
        },
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
