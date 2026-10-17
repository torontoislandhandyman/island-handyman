import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import type { ScryptOptions } from "node:crypto";
import { PASSWORD_MIN_LENGTH } from "@shared/const";

export { PASSWORD_MIN_LENGTH };
export const PASSWORD_MAX_LENGTH = 128;
const KEY_LENGTH = 64;
const SCRYPT_N = 16_384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SCRYPT_OPTIONS: ScryptOptions = { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P, maxmem: 64 * 1024 * 1024 };

function deriveKey(password: string, salt: Buffer, options: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(password, salt, KEY_LENGTH, options, (error, result) => {
      if (error) reject(error);
      else resolve(result as Buffer);
    });
  });
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isPasswordLengthValid(password: string): boolean {
  return password.length >= PASSWORD_MIN_LENGTH && password.length <= PASSWORD_MAX_LENGTH;
}

export async function hashPassword(password: string): Promise<string> {
  if (!isPasswordLengthValid(password)) {
    throw new Error(`Password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters.`);
  }
  const salt = randomBytes(16);
  const derived = await deriveKey(password, salt, SCRYPT_OPTIONS);
  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt.toString("hex")}$${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  try {
    const [algorithm, nRaw, rRaw, pRaw, saltHex, keyHex, ...extra] = encoded.split("$");
    const n = Number(nRaw);
    const r = Number(rRaw);
    const p = Number(pRaw);
    if (
      algorithm !== "scrypt" || extra.length > 0 || !Number.isInteger(n) || !Number.isInteger(r) || !Number.isInteger(p) ||
      n < 16_384 || n > 262_144 || r < 1 || r > 16 || p < 1 || p > 4 ||
      !/^[0-9a-f]{32}$/.test(saltHex ?? "") || !/^[0-9a-f]{128}$/.test(keyHex ?? "")
    ) return false;

    const expected = Buffer.from(keyHex, "hex");
    const actual = await deriveKey(password, Buffer.from(saltHex, "hex"), { N: n, r, p, maxmem: 64 * 1024 * 1024 });
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

export function createOpaqueToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashOpaqueToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}
