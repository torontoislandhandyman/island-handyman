import type { CookieOptions, Request } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function firstHeaderValue(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value?.split(",")[0])?.trim();
}

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  // Use the browser's Origin scheme. Preview can rebase Host and the socket to
  // an internal HTTP hop; forwarded headers are not trusted as user input.
  const rawOrigin = firstHeaderValue(req.headers.origin);
  let secure = true;
  try {
    if (rawOrigin) {
      const origin = new URL(rawOrigin);
      const isLocalHttp = origin.protocol === "http:" && LOCAL_HOSTS.has(origin.hostname.toLowerCase());
      secure = !isLocalHttp;
    }
  } catch {
    // Fail closed: an unknown/malformed origin keeps Secure enabled.
  }

  return {
    httpOnly: true,
    path: "/",
    sameSite: secure ? "none" : "lax",
    secure,
  };
}
