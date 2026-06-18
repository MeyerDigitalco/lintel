import * as FileSystem from "expo-file-system";
import { supabase } from "@/lib/supabase";

// Decode base64 (no external dep) -> Uint8Array for Supabase storage upload.
function base64ToBytes(b64: string): Uint8Array {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const lookup = new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) lookup[chars.charCodeAt(i)] = i;
  let bufferLength = b64.length * 0.75;
  if (b64[b64.length - 1] === "=") bufferLength--;
  if (b64[b64.length - 2] === "=") bufferLength--;
  const bytes = new Uint8Array(bufferLength);
  let p = 0;
  for (let i = 0; i < b64.length; i += 4) {
    const e1 = lookup[b64.charCodeAt(i)];
    const e2 = lookup[b64.charCodeAt(i + 1)];
    const e3 = lookup[b64.charCodeAt(i + 2)];
    const e4 = lookup[b64.charCodeAt(i + 3)];
    bytes[p++] = (e1 << 2) | (e2 >> 4);
    if (b64[i + 2] !== "=") bytes[p++] = ((e2 & 15) << 4) | (e3 >> 2);
    if (b64[i + 3] !== "=") bytes[p++] = ((e3 & 3) << 6) | (e4 & 63);
  }
  return bytes;
}

/** Upload a local file (file:// uri) to a Supabase storage bucket path. */
export async function uploadLocalFile(
  bucket: string,
  path: string,
  uri: string,
  contentType = "image/jpeg"
): Promise<void> {
  const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
  const bytes = base64ToBytes(base64);
  const { error } = await supabase.storage.from(bucket).upload(path, bytes, { contentType, upsert: true });
  if (error) throw new Error(error.message);
}

export function fileExt(uri: string): string {
  const m = uri.split("?")[0].match(/\.(\w+)$/);
  return (m?.[1] ?? "jpg").toLowerCase();
}
