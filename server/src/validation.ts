const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

export function cleanText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength) return null;
  return trimmed;
}

export function cleanOptionalText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (trimmed.length > maxLength) return "";
  return trimmed;
}

export function cleanUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!/^https?:\/\/.+/i.test(trimmed)) return null;
  if (trimmed.length > 2048) return null;
  return trimmed;
}

export const SINGLE_EMOJI_RE =
  /^(?:[\p{Extended_Pictographic}\p{Emoji_Presentation}]|[\p{Regional_Indicator}]{2}|[\d#*]\uFE0F\u20E3)\p{Emoji_Modifier}?(?:\u200D[\p{Extended_Pictographic}\p{Emoji_Presentation}]\p{Emoji_Modifier}?)*[\uFE0F\u20E3]*$/u;

export function cleanEmoji(value: unknown, fallback: string): string | null {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  if (!SINGLE_EMOJI_RE.test(trimmed)) return null;
  return trimmed;
}

export function cleanDirection(value: unknown): "up" | "down" | null {
  return value === "up" || value === "down" ? value : null;
}
