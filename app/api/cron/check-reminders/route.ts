import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Add a secret key to verify cron-job.org requests
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(req: Request) {
  try {
    if (!CRON_SECRET) {
      console.error("Missing CRON_SECRET environment variable");
      return new NextResponse("Server configuration error", { status: 500 });
    }

    // Verify the request is from cron-job.org
    const authHeader = req.headers.get("Authorization");
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const notes = await db
      .collection("notes")
      .find({
        "reminder.date": { $lte: new Date() },
        "reminder.sent": false,
      })
      .toArray();

    for (const note of notes) {
      await db
        .collection("notes")
        .updateOne({ _id: note._id }, { $set: { "reminder.sent": true } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Check reminders error:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
