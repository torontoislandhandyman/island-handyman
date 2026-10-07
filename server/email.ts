export type EmailPayload = { to: string; subject: string; text: string };

/**
 * Optional transactional email adapter. Configure RESEND_API_KEY, EMAIL_FROM,
 * and (for owner alerts) OWNER_EMAIL in the deployment environment. When the
 * key is absent, the app remains fully functional and logs a safe notice.
 */
export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from || !payload.to) {
    console.info("[Email] Not configured; skipped email delivery.");
    return false;
  }
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [payload.to], subject: payload.subject, text: payload.text }),
    });
    if (!response.ok) {
      console.warn(`[Email] Delivery failed (${response.status}).`);
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Email] Delivery error:", error);
    return false;
  }
}

export function ownerEmail() {
  return process.env.OWNER_EMAIL || "";
}
