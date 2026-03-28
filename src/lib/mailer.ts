import nodemailer from "nodemailer";

type EmailPayload = {
  subject: string;
  lines: string[];
};

export async function sendMail(payload: EmailPayload) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = process.env.RESTAURANT_EMAIL;

  if (!host || !user || !pass || !to) {
    throw new Error("Missing SMTP environment variables.");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });

  await transporter.sendMail({
    from: `"Sake Website" <${user}>`,
    to,
    subject: payload.subject,
    text: payload.lines.join("\n")
  });
}
