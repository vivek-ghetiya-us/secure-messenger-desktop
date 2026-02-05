// Frontend stub - main process handles actual encryption
export class SecurityService {
  static encrypt(plaintext: string, _recipientPublicKey?: string): string {
    // Stub: encryption handled by main process
    return plaintext;
  }

  static decrypt(ciphertext: string, _privateKey?: string): string {
    // Stub: decryption handled by main process
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
