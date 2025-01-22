import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email"; // implement this using Resend or similar

export async function GET() {
  try {
    const notes = await db
      .collection("notes")
      .find({
        "reminder.date": { $lte: new Date() },
        "reminder.sent": false,
      })
      .toArray();

    for (const note of notes) {
      await sendEmail({
        to: note.userEmail,
        subject: `Reminder: ${note.title}`,
        text: `Here's your reminder for: ${note.title}\n\n${note.content}`,
      });

      await db
        .collection("notes")
        .updateOne({ _id: note._id }, { $set: { "reminder.sent": true } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 });
  }
}
