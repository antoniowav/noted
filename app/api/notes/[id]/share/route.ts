/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectToDatabase } from "@/lib/mongodb";
import { Note } from "@/lib/models/note";
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import type { ApiResponse } from "@/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  _request: Request,
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
    await connectToDatabase();
    const note = await Note.findById(id);

    if (!note) {
      return NextResponse.json(
        { success: false, error: "Note not found" },
        { status: 404 }
      );
    }

    if (note.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const shareId = nanoid(10);
    await Note.findByIdAndUpdate(id, {
      $set: { shared: true, shareId },
    });

    return NextResponse.json<ApiResponse<{ shareId: string }>>({
      success: true,
      data: { shareId },
    });
  } catch (error) {
    console.error("Share error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to share note" },
      { status: 500 }
    );
  }
}
