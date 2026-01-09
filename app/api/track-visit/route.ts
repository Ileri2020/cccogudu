import { prisma } from "@/app/api/dbhandler/db-utils";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { browserId } = await req.json();
    if (!browserId) return NextResponse.json({ error: "Missing browserId" }, { status: 400 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.pageVisit.upsert({
      where: {
        day_browserId: {
          day: today,
          browserId,
        },
      },
      update: {
        count: { increment: 1 },
      },
      create: {
        day: today,
        browserId,
        count: 1,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Track visit error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
