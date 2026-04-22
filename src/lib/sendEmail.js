import { Resend } from "resend";
import logger from "./logger.js";
import "dotenv/config";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, html }) {
  const { data, error } = await resend.emails.send({
    from: `"${process.env.RESEND_FROM_NAME}" <${process.env.RESEND_FROM_EMAIL}>`,
    to,
    subject,
    html,
  });

  if (error) {
    logger.error("Failed to send email", {
      to,
      subject,
      error: error.message,
    });
    return null;
  }

  logger.info("Email sent successfully", { to, subject, id: data.id });
  return data;
}
