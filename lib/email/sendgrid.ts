import "server-only";

/**
 * SendGrid transactional + scheduled email wrapper.
 *
 * Used for compliance/quarterly reminders and account email. Sends from a
 * verified domain with SPF/DKIM configured. We call the REST API directly to
 * avoid pulling in the full @sendgrid/mail dependency for the scaffold.
 */

export interface EmailAttachment {
  /** Base64-encoded file content. */
  content: string;
  filename: string;
  type: string;
  disposition?: "attachment" | "inline";
}

interface SendEmailArgs {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: EmailAttachment[];
}

export async function sendEmail({ to, subject, html, text, attachments }: SendEmailArgs) {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    // In dev without a key, log instead of throwing so flows still work.
    console.warn("[sendgrid] SENDGRID_API_KEY not set, skipping send:", subject);
    return { skipped: true };
  }

  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: {
        email: process.env.SENDGRID_FROM_EMAIL ?? "hello@lintelsquared.com",
        name: process.env.SENDGRID_FROM_NAME ?? "Lintel Squared",
      },
      subject,
      content: [
        ...(text ? [{ type: "text/plain", value: text }] : []),
        { type: "text/html", value: html },
      ],
      ...(attachments?.length
        ? {
            attachments: attachments.map((a) => ({
              content: a.content,
              filename: a.filename,
              type: a.type,
              disposition: a.disposition ?? "attachment",
            })),
          }
        : {}),
    }),
  });

  if (!res.ok) {
    throw new Error(`SendGrid send failed: ${res.status} ${await res.text()}`);
  }
  return { skipped: false };
}
