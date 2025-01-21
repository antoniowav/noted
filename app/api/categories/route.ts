import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import type { ApiResponse, CategoryType } from "@/types";
import { Category } from "@/lib/models/category";

const DEFAULT_CATEGORIES = ["personal", "work", "ideas", "tasks"];

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
    const categories = await Category.find({ userId: session.user.id })
      .sort({ name: 1 })
      .lean();

    return NextResponse.json<ApiResponse<string[]>>({
      success: true,
      data: categories.map((cat) => cat.name),
    });
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch categories",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const { category: name } = await request.json();

    // Check if category already exists
    const existingCategory = await Category.findOne({
      userId: session.user.id,
      name,
    });

    if (existingCategory || DEFAULT_CATEGORIES.includes(name)) {
      return NextResponse.json(
        { success: false, error: "Category already exists" },
        { status: 400 }
      );
    }

    // Create the new category
    await Category.create({
      name,
      userId: session.user.id,
    });

    const categories = await Category.find({ userId: session.user.id })
      .sort({ name: 1 })
      .lean();

    return NextResponse.json<ApiResponse<string[]>>({
      success: true,
      data: categories.map((cat) => cat.name),
    });
  } catch (error) {
    console.error("Failed to create category:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create category",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { name } = await request.json();

    if (DEFAULT_CATEGORIES.includes(name)) {
      return NextResponse.json(
        { success: false, error: "Cannot delete default category" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    await Category.deleteOne({ userId: session.user.id, name });

    const categories = await Category.find({ userId: session.user.id }).sort({
      name: 1,
    });

    return NextResponse.json<ApiResponse<CategoryType[]>>({
      success: true,
      data: categories,
    });
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete category",
      },
      { status: 500 }
    );
  }
}
