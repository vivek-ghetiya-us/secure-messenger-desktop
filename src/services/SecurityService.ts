export class SecurityService {
  static encrypt(plaintext: string, _recipientPublicKey?: string): string {
    const encoded = Buffer.from(plaintext).toString("base64");
    return `ENC:${encoded}`;
  }

  static decrypt(ciphertext: string, _privateKey?: string): string {
    if (ciphertext.startsWith("ENC:")) {
      const encoded = ciphertext.slice(4);
      return Buffer.from(encoded, "base64").toString("utf-8");
    }
    return ciphertext;
  }

  static sanitizeForLog(message: { body?: string; [key: string]: any }): any {
    const { body, ...metadata } = message;
    return {
      ...metadata,
      bodyLength: body?.length || 0,
    };
  }

  static hash(data: string): string {
    return `HASH:${Buffer.from(data).toString("base64").slice(0, 16)}`;
  }
}
