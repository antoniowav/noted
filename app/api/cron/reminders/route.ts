import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import nodemailer from "nodemailer";

const CRON_SECRET = process.env.CRON_SECRET;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

export async function GET(req: Request) {
  try {
    console.log("Starting reminder check...");

    // Verify environment variables
    if (!CRON_SECRET || !EMAIL_USER || !EMAIL_PASS) {
      console.error("Missing environment variables");
      console.log("CRON_SECRET:", !!CRON_SECRET);
      console.log("EMAIL_USER:", !!EMAIL_USER);
      console.log("EMAIL_PASS:", !!EMAIL_PASS);
      return new NextResponse("Server configuration error", { status: 500 });
    }

    // Verify Authorization header
    const authHeader = req.headers.get("Authorization");
    console.log("Authorization header:", authHeader);
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      console.error("Invalid Authorization Header");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch notes with due reminders
    const now = new Date();
    console.log("Current time (UTC):", now.toISOString());

    const notes = await db
      .collection("notes")
      .find({
        "reminder.date": { $lte: now },
        "reminder.sent": false,
      })
      .toArray();

    console.log("Query criteria:", {
      currentTime: now.toISOString(),
      reminderDateLessThanOrEqual: true,
      reminderSentFalse: true,
    });
    console.log(
      "Found notes:",
      notes.map((note) => ({
        id: note._id,
        title: note.title,
        reminderDate: note.reminder.date,
        sent: note.reminder.sent,
      }))
    );

    for (const note of notes) {
      console.log(`Processing note: ${note.title}, ID: ${note._id}`);

      try {
        const mailOptions = {
          from: `"Note Reminder" <${EMAIL_USER}>`,
          to: "toni.piattelli@gmail.com", // Hardcoded email for debugging
          subject: `Reminder: ${note.title}`,
          text: `Hi, you have a reminder for your note titled "${note.title}". Content: ${note.content}`,
        };

        console.log("Sending email with options:", mailOptions);

        // Send the email
        await transporter.sendMail(mailOptions);
        console.log(`Email successfully sent to: toni.piattelli@gmail.com`);

        // Update the reminder status
        await db
          .collection("notes")
          .updateOne({ _id: note._id }, { $set: { "reminder.sent": true } });
        console.log(`Reminder status updated for note ID: ${note._id}`);
      } catch (err) {
        console.error(`Failed to send email for note ID: ${note._id}`, err);
      }
    }

    console.log("Reminder check completed successfully.");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Check reminders error:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
