import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { ObjectId } from "mongodb";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { date } = await req.json();

    await db.collection("notes").updateOne(
      { _id: new ObjectId(params.id), userId: session.user.id },
      {
        $set: {
          reminder: {
            date: new Date(date),
            sent: false,
          },
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 });
  }
}
