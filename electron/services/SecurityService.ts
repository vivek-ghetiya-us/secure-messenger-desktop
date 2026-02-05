export class SecurityService {
  static encrypt(plaintext: string): string {
    const encoded = Buffer.from(plaintext).toString("base64");
    return `ENC:${encoded}`;
  }

  static decrypt(ciphertext: string): string {
    if (ciphertext.startsWith("ENC:")) {
      const encoded = ciphertext.slice(4);
      return Buffer.from(encoded, "base64").toString("utf-8");
    }
    return ciphertext;
  }

  static sanitizeForLog(data: any): any {
    if (typeof data !== "object" || data === null) {
      return "[REDACTED]";
    }

    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (key === "body" || key === "message" || key === "content") {
        sanitized[key] = `[REDACTED: ${String(value).length} chars]`;
      } else if (typeof value === "object") {
        sanitized[key] = this.sanitizeForLog(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  static generateFingerprint(data: string): string {
    const hash = Buffer.from(data).toString("base64").slice(0, 16);
    return `FP:${hash}`;
  }
}
