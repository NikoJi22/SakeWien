import nodemailer from "nodemailer";

type EmailPayload = {
  subject: string;
  lines: string[];
  /** Overrides RESTAURANT_EMAIL when set (e.g. order PDF notifications). */
  to?: string;
  attachments?: Array<{ filename: string; content: Buffer; contentType?: string }>;
};

/** SMTP_HOST / SMTP_USER / SMTP_PASS or recipient missing */
export class MailerConfigError extends Error {
  readonly code = "smtp_not_configured" as const;
  constructor(message: string) {
    super(message);
    this.name = "MailerConfigError";
  }
}

/** Transporter accepted the message config but sending failed (network, auth, provider). */
export class MailerSendError extends Error {
  readonly code = "smtp_send_failed" as const;
  constructor(
    message: string,
    public readonly causeError?: unknown
  ) {
    super(message);
    this.name = "MailerSendError";
  }
}

export async function sendMail(payload: EmailPayload) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = payload.to ?? process.env.RESTAURANT_EMAIL;

  if (!host || !user || !pass || !to) {
    console.error("[mailer] SMTP not configured — cannot send mail", {
      hasHost: !!host,
      hasUser: !!user,
      hasPass: !!pass,
      hasTo: !!to,
      explicitRecipient: !!payload.to
    });
    throw new MailerConfigError("SMTP host, user, password and recipient are required.");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });

  try {
    await transporter.sendMail({
      from: `"Sake Website" <${user}>`,
      to,
      subject: payload.subject,
      text: payload.lines.join("\n"),
      attachments: payload.attachments
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[mailer] sendMail failed — SMTP transport or provider error:", msg, err);
    throw new MailerSendError("Failed to send email via SMTP.", err);
  }
}
