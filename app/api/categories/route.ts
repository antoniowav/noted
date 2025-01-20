import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULT_CATEGORIES = ["personal", "work", "ideas", "tasks"];

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { categories: true },
    });

    // Combine default and user categories, remove duplicates
    const allCategories = [
      ...new Set([...DEFAULT_CATEGORIES, ...(user?.categories || [])]),
    ];

    return NextResponse.json({ data: allCategories });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { category } = body;
    const newCategory = category.toLowerCase();

    // Check if category already exists in defaults
    if (DEFAULT_CATEGORIES.includes(newCategory)) {
      return NextResponse.json(
        { error: "Category already exists" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { categories: true },
    });

    const userCategories = user?.categories || [];
    if (userCategories.includes(newCategory)) {
      return NextResponse.json(
        { error: "Category already exists" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        categories: [...userCategories, newCategory],
      },
      select: { categories: true },
    });

    // Return both default and user categories
    const allCategories = [
      ...new Set([...DEFAULT_CATEGORIES, ...updatedUser.categories]),
    ];
    return NextResponse.json({ data: allCategories });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to add category" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { category } = body;

    // Don't allow deletion of default categories
    if (DEFAULT_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: "Cannot delete default category" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { categories: true },
    });

    const updatedCategories = (user?.categories || []).filter(
      (c: string) => c !== category
    );

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { categories: updatedCategories },
      select: { categories: true },
    });

    const allCategories = [
      ...new Set([...DEFAULT_CATEGORIES, ...updatedUser.categories]),
    ];
    return NextResponse.json({ data: allCategories });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
