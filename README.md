# Secure Messenger Desktop

## Initial Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository** (if not already done):

   ```bash
   git clone <repository-url>
   cd secure-messenger-desktop
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Install required dependencies**:
   ```bash
   npm install better-sqlite3 ws @mui/material @emotion/react @emotion/styled
   ```

### Development

Run the development server:

```bash
npm run dev
```

This will start both the Vite development server and the Electron application with hot module replacement (HMR).

### Building

To build the application for production:

```bash
npm run build
```

### Project Stack

- **Frontend**: React + TypeScript + Vite
- **Desktop**: Electron
- **Database**: better-sqlite3
- **Real-time Communication**: WebSocket (ws)
- **UI Framework**: Material-UI (MUI)

## Environment Variables

Copy `.env.sample` to `.env` and configure the following variables:

- `NODE_ENV` - Environment mode (development/production)
- `VITE_APP_NAME` - Application name
- `DB_PATH` - Database file path (optional, uses default if not set)
- `VITE_WS_SERVER_URL` - WebSocket server URL
- `ENCRYPTION_KEY` - Message encryption key (change in production!)
- `JWT_SECRET` - JWT token secret (change in production!)

## Database Configuration

### Database Schema

The application uses SQLite database with the following schema:

**Chats Table:**

- `id` - Primary key (auto-increment)
- `title` - Chat title
- `lastMessageAt` - Timestamp of last message
- `unreadCount` - Number of unread messages
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

**Messages Table:**

- `id` - Primary key (auto-increment)
- `chatId` - Foreign key to chats table
- `ts` - Message timestamp
- `sender` - Message sender identifier
- `body` - Message content

### Database Location

The SQLite database is stored in the user's application data directory:

- **Windows**: `%APPDATA%\secure-messenger-desktop\secure-messenger.sqlite`
- **macOS**: `~/Library/Application Support/secure-messenger-desktop/secure-messenger.sqlite`
- **Linux**: `~/.config/secure-messenger-desktop/secure-messenger.sqlite`

The database uses WAL (Write-Ahead Logging) mode for better performance and concurrency.

## Security Architecture

### Overview

This application demonstrates secure coding practices with placeholder encryption. In a production environment, these placeholders would be replaced with real cryptographic implementations.

### SecurityService Module

The `SecurityService` module provides a clear boundary for encryption/decryption operations:

**Location:**
- Frontend: `src/services/SecurityService.ts`
- Backend: `electron/services/SecurityService.ts`

**Functions:**
- `encrypt(plaintext)` - Encrypts message content (currently Base64 placeholder)
- `decrypt(ciphertext)` - Decrypts message content
- `sanitizeForLog(data)` - Removes sensitive data before logging
- `hash(data)` - Generates message fingerprint for verification

### Production Encryption Implementation

#### Where Encryption Would Happen

1. **Message Creation (Frontend)**
   ```typescript
   // Before sending to backend
   const encryptedBody = SecurityService.encrypt(messageBody, recipientPublicKey);
   ```

2. **Message Storage (Backend)**
   ```typescript
   // Before storing in database
   const encryptedMessage = SecurityService.encrypt(message.body);
   db.prepare('INSERT INTO messages (body) VALUES (?)').run(encryptedMessage);
   ```

3. **Message Retrieval (Backend → Frontend)**
   ```typescript
   // Decrypt when displaying to user
   const plaintext = SecurityService.decrypt(encryptedBody, userPrivateKey);
   ```

#### Recommended Encryption Approach

**End-to-End Encryption (E2EE):**

1. **Key Management**
   - Use public-key cryptography (X25519 for key exchange)
   - Store private keys in OS secure storage:
     - Windows: Credential Manager (`electron-store` with encryption)
     - macOS: Keychain Access
     - Linux: Secret Service API (libsecret)
   - Never store private keys in plaintext

2. **Message Encryption**
   - Algorithm: **XChaCha20-Poly1305** (authenticated encryption)
   - Library: **libsodium** (via `sodium-native` or `tweetnacl`)
   - Each message gets unique nonce (never reuse)
   - Include sender signature for authenticity

3. **Key Derivation**
   - Use **Argon2id** for password-based key derivation
   - Salt each user's password uniquely
   - Use high iteration count (OWASP recommendations)

#### Example Production Code

```typescript
import sodium from 'sodium-native';

class ProductionSecurityService {
  static encrypt(plaintext: string, recipientPublicKey: Buffer): {
    ciphertext: Buffer;
    nonce: Buffer;
  } {
    const nonce = Buffer.allocUnsafe(sodium.crypto_box_NONCEBYTES);
    sodium.randombytes_buf(nonce);

    const message = Buffer.from(plaintext, 'utf8');
    const ciphertext = Buffer.allocUnsafe(
      message.length + sodium.crypto_box_MACBYTES
    );

    sodium.crypto_box_easy(
      ciphertext,
      message,
      nonce,
      recipientPublicKey,
      senderPrivateKey
    );

    return { ciphertext, nonce };
  }

  static decrypt(ciphertext: Buffer, nonce: Buffer, senderPublicKey: Buffer): string {
    const plaintext = Buffer.allocUnsafe(
      ciphertext.length - sodium.crypto_box_MACBYTES
    );

    if (!sodium.crypto_box_open_easy(
      plaintext,
      ciphertext,
      nonce,
      senderPublicKey,
      recipientPrivateKey
    )) {
      throw new Error('Decryption failed - invalid signature or key');
    }

    return plaintext.toString('utf8');
  }
}
```

### Preventing Information Leaks

#### 1. Logging Security

**Current Implementation:**
- Message bodies are **never logged** to console
- Error logs use `SecurityService.sanitizeForLog()` to remove sensitive fields
- Only metadata is logged (chatId, sender, timestamp, message length)

**Example Safe Logging:**
```typescript
// ❌ UNSAFE - Never do this
console.log('Message received:', message);

// ✅ SAFE - Sanitized logging
console.error('Error processing message:', {
  chatId: message.chatId,
  sender: message.sender,
  bodyLength: message.body.length,
  // body intentionally omitted
});
```

**Production Recommendations:**
- Use structured logging (e.g., Winston, Pino)
- Configure log levels (never log decrypted content in production)
- Rotate logs regularly and encrypt archived logs
- Implement log scrubbing for accidental sensitive data exposure

#### 2. Crash Dumps & Memory

**Risks:**
- Decrypted messages in memory during display
- Crash dumps may contain plaintext
- DevTools memory inspector can reveal secrets

**Mitigation Strategies:**

1. **Minimize Plaintext Lifetime**
   ```typescript
   // Decrypt only when needed, clear immediately after
   const plaintext = SecurityService.decrypt(ciphertext);
   displayMessage(plaintext);
   // Clear from memory
   plaintext = null;
   ```

2. **Disable Crash Reporting for Sensitive Data**
   ```typescript
   // In main.ts
   app.on('web-contents-created', (_, contents) => {
     contents.on('crashed', (event) => {
       // Don't send crash dumps to external services
       event.preventDefault();
       // Log sanitized error only
       console.error('Renderer crashed:', { timestamp: Date.now() });
     });
   });
   ```

3. **Disable DevTools in Production**
   ```typescript
   // In electron main.ts
   if (process.env.NODE_ENV === 'production') {
     win.webContents.on('devtools-opened', () => {
       win.webContents.closeDevTools();
     });
   }
   ```

4. **Memory Protection**
   ```typescript
   // Use secure buffers that zero memory on deallocation
   import { SecureBuffer } from 'secure-buffer'; // Example library

   const sensitiveData = new SecureBuffer(plaintext);
   // Use data...
   sensitiveData.clear(); // Zeros memory
   ```

#### 3. Database Security

**Current State:**
- Messages stored in plaintext SQLite database
- Database file has OS-level permissions

**Production Requirements:**

1. **Encrypt Database at Rest**
   - Use SQLCipher (encrypted SQLite)
   - Derive database key from user's master password
   - Key never stored, derived on each app launch

2. **Example SQLCipher Integration**
   ```typescript
   import Database from '@journeyapps/sqlcipher';

   const db = new Database(dbPath);
   const key = deriveKeyFromPassword(userPassword);
   db.pragma(`key='${key}'`);
   db.pragma('cipher_page_size=4096');
   ```

3. **Secure Database Deletion**
   ```typescript
   // Before deleting database, overwrite with random data
   import { randomBytes } from 'crypto';
   import { writeFileSync, unlinkSync } from 'fs';

   function secureDelete(filePath: string) {
     const size = statSync(filePath).size;
     writeFileSync(filePath, randomBytes(size)); // Overwrite
     unlinkSync(filePath); // Delete
   }
   ```

#### 4. IPC Communication Security

**Current Implementation:**
- Context isolation enabled (`contextIsolation: true`)
- Node integration disabled (`nodeIntegration: false`)
- Preload script exposes only specific IPC channels

**Security Boundaries:**
```
┌─────────────────────────────────────────┐
│ Renderer Process (Untrusted)           │
│ - React UI                              │
│ - No direct Node.js access             │
└──────────────┬──────────────────────────┘
               │ IPC Bridge (preload.ts)
               │ - Whitelist channels only
┌──────────────▼──────────────────────────┐
│ Main Process (Trusted)                  │
│ - Full Node.js access                   │
│ - Database operations                   │
│ - Encryption keys                       │
└─────────────────────────────────────────┘
```

**Validation:**
```typescript
// In IPC handlers, always validate input
ipcMain.handle('db:get-messages', async (_, params) => {
  // Validate chatId is a number
  if (typeof params.chatId !== 'number' || params.chatId < 1) {
    throw new Error('Invalid chatId');
  }
  // Proceed with query...
});
```

### Security Checklist for Production

- [ ] Replace placeholder encryption with real cryptography (libsodium)
- [ ] Implement end-to-end encryption with key exchange
- [ ] Store encryption keys in OS secure storage
- [ ] Encrypt database at rest (SQLCipher)
- [ ] Disable DevTools in production builds
- [ ] Configure crash reporting to exclude sensitive data
- [ ] Implement secure memory handling for plaintext messages
- [ ] Set up structured logging with sensitive data filtering
- [ ] Add rate limiting for IPC handlers
- [ ] Implement certificate pinning for WebSocket connections
- [ ] Add integrity checks for application updates
- [ ] Enable code signing for application binaries
- [ ] Implement secure key derivation (Argon2id)
- [ ] Add forward secrecy (Double Ratchet algorithm)
- [ ] Regular security audits and penetration testing

### Resources

- [OWASP Electron Security Guidelines](https://owasp.org/www-community/vulnerabilities/Electron_Security)
- [libsodium Documentation](https://doc.libsodium.org/)
- [Signal Protocol (Double Ratchet)](https://signal.org/docs/)
- [SQLCipher](https://www.zetetic.net/sqlcipher/)
- [Electron Security Best Practices](https://www.electronjs.org/docs/latest/tutorial/security)
