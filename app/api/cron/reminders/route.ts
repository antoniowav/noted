import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import nodemailer from "nodemailer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const CRON_SECRET = process.env.CRON_SECRET;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
  try {
    if (!CRON_SECRET || !EMAIL_USER || !EMAIL_PASS) {
      console.error("Missing environment variables");
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
      // Send an email notification
      const mailOptions = {
        from: `"Note Reminder" <${EMAIL_USER}>`,
        to: session.user.email || "",
        subject: "Reminder: You have a note due",
        text: `Hi, you have a reminder for your note titled "${note.title}". Content: ${note.content}`,
      };

      await transporter.sendMail(mailOptions);

      // Mark the reminder as sent
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
