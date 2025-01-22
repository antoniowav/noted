import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import nodemailer from "nodemailer";

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
  try {
    if (!CRON_SECRET || !EMAIL_USER || !EMAIL_PASS) {
      console.error("Missing environment variables");
      return new NextResponse("Server configuration error", { status: 500 });
    }

    const authHeader = req.headers.get("Authorization");
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const notes = await db
      .collection("notes")
      .aggregate([
        {
          $match: {
            "reminder.date": { $lte: new Date() },
            "reminder.sent": false,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
      ])
      .toArray();

    for (const note of notes) {
      const mailOptions = {
        from: `"Note Reminder" <${EMAIL_USER}>`,
        to: note.user.email,
        subject: `Reminder: ${note.title}`,
        text: `Hi, you have a reminder for your note titled "${note.title}". Content: ${note.content}`,
      };

      await transporter.sendMail(mailOptions);
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
