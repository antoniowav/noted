import { connectToDatabase } from "@/lib/mongodb";
import { Note } from "@/lib/models/note";
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import type { ApiResponse } from "@/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const note = await Note.findById(params.id);

    if (!note) {
      return NextResponse.json(
        { success: false, error: "Note not found" },
        { status: 404 }
      );
    }

    const shareId = nanoid(10);
    await Note.findByIdAndUpdate(params.id, {
      $set: { shared: true, shareId },
    });

    return NextResponse.json<ApiResponse<{ shareId: string }>>({
      success: true,
      data: { shareId },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to share note",
      },
      { status: 500 }
    );
  }
}
