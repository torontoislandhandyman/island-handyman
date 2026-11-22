import { describe, expect, it } from "vitest";
import { toPublicUser } from "./_core/password-auth";
import { createOpaqueToken, hashOpaqueToken, hashPassword, verifyPassword } from "./_core/passwords";

describe("native password authentication primitives", () => {
  it("stores salted scrypt hashes and verifies only the correct password", async () => {
    const password = "Harbour-side repairs 2026";
    const first = await hashPassword(password);
    const second = await hashPassword(password);

    expect(first).toMatch(/^scrypt\$16384\$8\$1\$/);
    expect(first).not.toBe(password);
    expect(first).not.toBe(second);
    await expect(verifyPassword(password, first)).resolves.toBe(true);
    await expect(verifyPassword("a different phrase", first)).resolves.toBe(false);
    await expect(verifyPassword(password, "not-a-valid-hash")).resolves.toBe(false);
  });

  it("uses random opaque tokens whose stored representation is a SHA-256 digest", () => {
    const first = createOpaqueToken();
    const second = createOpaqueToken();

    expect(first).toHaveLength(43);
    expect(first).not.toBe(second);
    expect(hashOpaqueToken(first)).toMatch(/^[0-9a-f]{64}$/);
    expect(hashOpaqueToken(first)).not.toBe(first);
  });

  it("does not expose credentials or internal OAuth identifiers in the public user object", () => {
    const user = toPublicUser({
      id: 7,
      openId: "local_example",
      name: "Private Client",
      email: "client@example.com",
      passwordHash: "scrypt$private-hash",
      loginMethod: "password",
      role: "user",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      lastSignedIn: new Date("2026-01-02T00:00:00.000Z"),
    });

    expect(user).toMatchObject({ id: 7, email: "client@example.com", role: "user" });
    expect(user).not.toHaveProperty("passwordHash");
    expect(user).not.toHaveProperty("openId");
  });
});
