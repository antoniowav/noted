import { connectToDatabase } from "@/lib/mongodb";
import { Note } from "@/lib/models/note";
import { NextResponse } from "next/server";
import type { ApiResponse, NoteType } from "@/types";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const note = await Note.findByIdAndUpdate(
      params.id,
      { ...body, updatedAt: new Date() },
      { new: true }
    );

    if (!note) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Note not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<NoteType>>({
      success: true,
      data: note,
    });
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update note",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const note = await Note.findByIdAndDelete(params.id);

    if (!note) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Note not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<null>>({
      success: true,
    });
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete note",
      },
      { status: 500 }
    );
  }
}
