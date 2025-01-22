import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { ObjectId } from "mongodb";
import type { ApiResponse } from "@/types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { date } = await request.json();

    await db.collection("notes").updateOne(
      { _id: new ObjectId(id), userId: session.user.id },
      {
        $set: {
          reminder: {
            date: new Date(date),
            sent: false,
          },
        },
      }
    );

    return NextResponse.json<ApiResponse>({ success: true });
  } catch (error) {
    console.error("Reminder error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to set reminder" },
      { status: 500 }
    );
  }
}
