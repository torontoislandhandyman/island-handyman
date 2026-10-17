function readEnvironment(...keys: string[]) {
  return keys.map((key) => process.env[key]).find((value): value is string => Boolean(value?.trim())) ?? "";
}

export const ENV = {
  databaseUrl: readEnvironment("DATABASE_URL", "DRIZZLE_DATABASE_URL"),
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  ownerEmail: process.env.OWNER_EMAIL ?? "",
  emailFrom: process.env.EMAIL_FROM ?? "",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
};
