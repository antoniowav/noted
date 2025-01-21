import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ApiResponse } from "@/types";

const DEFAULT_CATEGORIES = ["personal", "work", "ideas", "tasks"];

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const notes = await prisma.note.findMany({
      where: { userId: session.user.id },
      select: { category: true },
      distinct: ["category"],
    });

    const userCategories = notes
      .map((note) => note.category)
      .filter((category): category is string => category !== null);

    const uniqueCategories = [
      ...new Set([...DEFAULT_CATEGORIES, ...userCategories]),
    ];

    return NextResponse.json<ApiResponse<string[]>>({
      success: true,
      data: uniqueCategories,
    });
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
