import crypto from 'node:crypto';

export class SecurityService {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly IV_LENGTH = 16;
  private static readonly AUTH_TAG_LENGTH = 16;
  private static readonly KEY_LENGTH = 32;

  // For now, use a fixed key (will be configurable later)
  private static encryptionKey: Buffer = crypto.randomBytes(32);

  static encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(this.IV_LENGTH);
    const cipher = crypto.createCipheriv(this.ALGORITHM, this.encryptionKey, iv);

    let ciphertext = cipher.update(plaintext, 'utf8');
    ciphertext = Buffer.concat([ciphertext, cipher.final()]);
    const authTag = cipher.getAuthTag();

    return `ENC_V1:${iv.toString('base64')}:${ciphertext.toString('base64')}:${authTag.toString('base64')}`;
  }

  static decrypt(encrypted: string): string {
    // Handle legacy plaintext
    if (!encrypted.startsWith('ENC_V1:')) {
      return encrypted;
    }

    const parts = encrypted.split(':');
    if (parts.length !== 4) {
      throw new Error('Invalid encrypted message format');
    }

    const [, ivB64, ciphertextB64, authTagB64] = parts;
    const iv = Buffer.from(ivB64, 'base64');
    const ciphertext = Buffer.from(ciphertextB64, 'base64');
    const authTag = Buffer.from(authTagB64, 'base64');

    const decipher = crypto.createDecipheriv(this.ALGORITHM, this.encryptionKey, iv);
    decipher.setAuthTag(authTag);

    let plaintext = decipher.update(ciphertext);
    plaintext = Buffer.concat([plaintext, decipher.final()]);

    return plaintext.toString('utf8');
  }

  static isEncrypted(text: string): boolean {
    return text.startsWith('ENC_V1:');
  }

  static sanitizeForLog(data: any): any {
    if (typeof data !== "object" || data === null) {
      return "[REDACTED]";
    }

    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (key === "body" || key === "message" || key === "content") {
        const strVal = String(value);
        sanitized[key] = `[REDACTED: ${strVal.length} chars]`;
      } else if (typeof value === "object" && value !== null) {
        sanitized[key] = this.sanitizeForLog(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  static generateFingerprint(data: string): string {
    const hash = crypto.createHash('sha256').update(data).digest('hex');
    return `FP:${hash.slice(0, 16)}`;
  }
}
