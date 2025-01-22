import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailProps {
  to: string;
  subject: string;
  text: string;
}

export async function sendEmail({ to, subject, text }: EmailProps) {
  try {
    await resend.emails.send({
      from: "hello@antoniopiattelli.com",
      to,
      subject,
      text,
    });
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}
