export const TEST_PASSWORD = process.env.TEST_PASSWORD ?? "Surg3on!Pw-2026-Strong-NotPwned";

export function uniqueEmail(prefix = "pw"): string {
  const stamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}.${stamp}.${random}@example.com`;
}

export const SAMPLE_TEXT =
  "she go to school yesterday and dont like the food because it are cold.";

export const SECOND_SAMPLE_TEXT =
  "i has a appointment tomorrow and need to writes a formal email.";
