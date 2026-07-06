export function decryptData(value: string | undefined | null): string {
  if (!value) return "";

  // Temporary fallback:
  // Kung plain token lang naman ang nasa cookie, ibabalik lang niya as-is.
  return value;
}