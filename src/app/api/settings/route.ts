import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const branch_id = searchParams.get("branch_id");

  if (!branch_id)
    return NextResponse.json({ error: "Missing branch_id" }, { status: 400 });

  const data = await prisma.settings.findUnique({
    where: { branch_id },
  });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { branch_id, ...updateData } = body;

  const updated = await prisma.settings.upsert({
    where: { branch_id },
    update: updateData,
    create: { branch_id, ...updateData },
  });

  return NextResponse.json(updated);
}
