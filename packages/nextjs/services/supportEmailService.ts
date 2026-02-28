import { Resend } from "resend";

const DEFAULT_TO = "sebejaz99@gmail.com";
const DEFAULT_FROM = "Pipette Support <onboarding@resend.dev>";

export async function sendSupportNotification(
  senderEmail: string,
  body: string,
): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY is not set" };
  }

  const to = process.env.SUPPORT_TO_EMAIL?.trim() || DEFAULT_TO;
  const from = process.env.SUPPORT_FROM_EMAIL?.trim() || DEFAULT_FROM;

  const resend = new Resend(apiKey);
  const subject = `Pipette support: message from ${senderEmail}`;
  const html = `
    <p><strong>From:</strong> ${escapeHtml(senderEmail)}</p>
    <p><strong>Message:</strong></p>
    <pre style="white-space: pre-wrap; font-family: inherit; background: #f5f5f5; padding: 1rem; border-radius: 0.5rem;">${escapeHtml(body)}</pre>
  `;

  try {
    const { error } = await resend.emails.send({ from, to, subject, html });
    if (error) {
      console.error("Resend error:", error);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Support email send error:", message);
    return { ok: false, error: message };
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
