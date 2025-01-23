import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ObjectId } from "mongodb";

export async function POST() {
  try {
    // First, drop the unique index on shareId
    try {
      await db.collection("notes").dropIndex("shareId_1");
    } catch (e) {
      // Index might not exist, ignore error
      console.log("No index to drop");
    }

    // Get all users with their notes
    const users = await db.collection("users").find({}).toArray();
    let updatedCount = 0;

    for (const user of users) {
      if (!user.email) continue;

      // Update all notes for this user
      const result = await db
        .collection("notes")
        .updateMany(
          { userId: new ObjectId(user.id) },
          { $set: { userEmail: user.email } }
        );

      updatedCount += result.modifiedCount;
    }

    return NextResponse.json({
      success: true,
      updatedCount,
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to migrate notes" },
      { status: 500 }
    );
  }
}
