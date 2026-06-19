/**
 * FastAPI returns `detail` as a plain string for most errors, but as an array
 * of {loc, msg, type} objects for validation errors (422). This helper
 * normalises both shapes to a human-readable string.
 */
export function extractDetail(detail: unknown, fallback: string): string {
  if (!detail) return fallback;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const msgs = detail
      .map((d) =>
        typeof d === "object" && d !== null && "msg" in d
          ? String((d as { msg: unknown }).msg)
          : String(d)
      )
      .filter(Boolean);
    return msgs.join(", ") || fallback;
  }
  return fallback;
}
