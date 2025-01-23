import { Note } from "@/lib/models/note";
import { NextResponse } from "next/server";
import type { ApiResponse, NoteType } from "@/types";
import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { title, content, category } = await request.json();

    await connectToDatabase();
    const note = await Note.create({
      title,
      content,
      category,
      userId: session.user.id,
      userEmail: session.user.email,
      createdAt: new Date(),
    });

    return NextResponse.json<ApiResponse<NoteType>>({
      success: true,
      data: note,
    });
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create note",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const notes = await Note.find({ userId: session.user.id }).sort({
      createdAt: -1,
    });

    return NextResponse.json<ApiResponse<NoteType[]>>({
      success: true,
      data: notes,
    });
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch notes",
      },
      { status: 500 }
    );
  }
}
