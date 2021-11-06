import { createHash } from "crypto";

export function encrypt(str: string) {
  return createHash('sha256').update(str).digest('hex');
}