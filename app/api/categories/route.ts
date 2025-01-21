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

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { category } = await request.json();
    const newCategory = category.toLowerCase();

    // Check if category already exists in defaults
    if (DEFAULT_CATEGORIES.includes(newCategory)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Category already exists" },
        { status: 400 }
      );
    }

    // Check if category exists in user's notes
    const existingNote = await prisma.note.findFirst({
      where: {
        userId: session.user.id,
        category: newCategory,
      },
    });

    if (existingNote) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Category already exists" },
        { status: 400 }
      );
    }

    // Create a note with the new category
    await prisma.note.create({
      data: {
        title: "New Category",
        content: "Category created",
        category: newCategory,
        userId: session.user.id,
      },
    });

    // Get updated categories
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
    console.error("Failed to add category:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Failed to add category" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { category } = await request.json();

    // Don't allow deletion of default categories
    if (DEFAULT_CATEGORIES.includes(category)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Cannot delete default category" },
        { status: 400 }
      );
    }

    // Update all notes with this category to have no category
    await prisma.note.updateMany({
      where: {
        userId: session.user.id,
        category,
      },
      data: {
        category: null,
      },
    });

    // Get updated categories
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
    console.error("Failed to delete category:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
