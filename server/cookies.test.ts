import { describe, expect, it } from "vitest";
import type { Request } from "express";
import { getSessionCookieOptions } from "./_core/cookies";

function requestWithOrigin(origin?: string) {
  return { headers: origin ? { origin } : {} } as Request;
}

describe("native auth session cookie options", () => {
  it("uses Secure and SameSite=None for public HTTPS Preview", () => {
    expect(getSessionCookieOptions(requestWithOrigin("https://8328-preview.manus.computer"))).toMatchObject({
      httpOnly: true,
      path: "/",
      secure: true,
      sameSite: "none",
    });
  });

  it("keeps plain HTTP localhost development usable without trusting proxy headers", () => {
    const req = { headers: { origin: "http://localhost:3000", "x-forwarded-proto": "https", "x-forwarded-host": "evil.example" } } as unknown as Request;
    expect(getSessionCookieOptions(req)).toMatchObject({ secure: false, sameSite: "lax", httpOnly: true });
  });

  it("fails closed to Secure cookies when the public Origin is absent or invalid", () => {
    expect(getSessionCookieOptions(requestWithOrigin())).toMatchObject({ secure: true, sameSite: "none" });
    expect(getSessionCookieOptions(requestWithOrigin("not a valid origin"))).toMatchObject({ secure: true, sameSite: "none" });
  });
});
