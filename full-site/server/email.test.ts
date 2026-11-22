import { describe, expect, it, vi } from "vitest";
import { sendEmail } from "./email";

describe("optional email delivery", () => {
  it("skips delivery safely when email credentials are absent", async () => {
    const originalKey = process.env.RESEND_API_KEY;
    const originalFrom = process.env.EMAIL_FROM;
    delete process.env.RESEND_API_KEY;
    delete process.env.EMAIL_FROM;
    await expect(sendEmail({ to: "customer@example.com", subject: "Test", text: "Test" })).resolves.toBe(false);
    if (originalKey === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = originalKey;
    if (originalFrom === undefined) delete process.env.EMAIL_FROM; else process.env.EMAIL_FROM = originalFrom;
  });

  it("sends a configured email request through the Resend API", async () => {
    const originalKey = process.env.RESEND_API_KEY;
    const originalFrom = process.env.EMAIL_FROM;
    process.env.RESEND_API_KEY = "test-key";
    process.env.EMAIL_FROM = "Island Handyman <noreply@example.com>";
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}", { status: 200 }));
    await expect(sendEmail({ to: "customer@example.com", subject: "Test", text: "Test" })).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledWith("https://api.resend.com/emails", expect.objectContaining({ method: "POST" }));
    fetchMock.mockRestore();
    if (originalKey === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = originalKey;
    if (originalFrom === undefined) delete process.env.EMAIL_FROM; else process.env.EMAIL_FROM = originalFrom;
  });
});
