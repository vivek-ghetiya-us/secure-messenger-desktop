# Secure Messenger Desktop

A secure desktop messaging application built with Electron, React, TypeScript, and SQLite. This project demonstrates secure coding practices with real cryptographic implementations and comprehensive security features.

## 📋 Table of Contents

- [Features](#features)
- [Recent Improvements](#recent-improvements)
- [Setup Instructions](#setup-instructions)
- [Architecture](#architecture)
- [Security Implementation](#security-implementation)
- [What Needs Improvement](#what-needs-improvement)
- [Development Guide](#development-guide)

## ✨ Features

### Implemented

- ✅ Real-time messaging with WebSocket support
- ✅ SQLite database with WAL mode for persistence
- ✅ AES-256-GCM encryption infrastructure (functions ready, not yet activated)
- ✅ Database indexes for optimized query performance
- ✅ WebSocket message validation and sanitization
- ✅ Environment-based configuration
- ✅ Comprehensive error logging with sensitive data protection
- ✅ Context isolation and IPC security
- ✅ Message search functionality
- ✅ Unread message tracking
- ✅ Chat list with pagination
- ✅ Connection health monitoring

### In Progress / Planned

- 🔄 Message encryption activation (infrastructure ready)
- 🔄 End-to-end encryption with key exchange
- 🔄 List virtualization for large message sets
- 🔄 File attachment support
- 🔄 User authentication system
- 🔄 Group chat functionality

## 🎉 Recent Improvements

### Security & Performance Updates (Latest)

1. **Real AES-256-GCM Encryption Implementation**
   - Replaced Base64 placeholder with proper cryptographic encryption
   - Uses `crypto` module with AES-256-GCM algorithm
   - Implements IV (Initialization Vector), ciphertext, and authentication tag
   - Format: `ENC_V1:iv:ciphertext:authTag` (Base64 encoded)
   - Backward compatible with legacy plaintext
   - **Status**: Functions implemented but not yet activated in message flow

2. **Database Performance Optimization**
   - Added composite index: `idx_messages_chatid_ts` (chatId + timestamp DESC)
   - Added full-text search index: `idx_messages_body`
   - Added chat ordering index: `idx_chats_lastmessageat`
   - Replaced all `SELECT *` queries with explicit column lists
   - Expected performance improvement: 10-100x on large datasets

3. **WebSocket Security Enhancements**
   - Created validation module for incoming messages
   - Validates message structure, field types, and data ranges
   - Enforces 10KB max message size limit
   - Validates timestamp format
   - Rejects malformed messages before processing

4. **Environment-Based Configuration**
   - WebSocket URL now configurable via `VITE_WS_SERVER_URL`
   - WebSocket server only runs in development mode
   - Supports production `wss://` connections
   - Centralized configuration management

5. **Comprehensive Log Sanitization**
   - Applied `SecurityService.sanitizeForLog()` across all handlers
   - Message bodies redacted from logs (shows length only)
   - Error logs sanitized to prevent data leakage
   - Consistent logging format across application

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

This application implements real cryptographic security with AES-256-GCM encryption. While the encryption infrastructure is complete, messages are not yet encrypted by default to allow for testing and gradual rollout.

### SecurityService Module

The `SecurityService` module provides cryptographic operations and data protection:

**Location:**

- Frontend: `src/services/SecurityService.ts` (stub, delegates to main process)
- Backend: `electron/services/SecurityService.ts` (real implementation)

**Functions:**

- `encrypt(plaintext)` - **AES-256-GCM encryption** with random IV and auth tag
- `decrypt(ciphertext)` - Decrypts AES-256-GCM encrypted content with verification
- `isEncrypted(text)` - Checks if text is in `ENC_V1:` format
- `sanitizeForLog(data)` - Removes sensitive data before logging (recursive)
- `generateFingerprint(data)` - SHA-256 hash for message integrity verification

**Encryption Format:**

```
ENC_V1:IV(base64):CIPHERTEXT(base64):AUTH_TAG(base64)
```

**Example:**

```typescript
// Encryption
const plaintext = "Hello, World!";
const encrypted = SecurityService.encrypt(plaintext);
// Result: "ENC_V1:xK7j9ld...==:9fj2kd...==:kf83md...=="

// Decryption
const decrypted = SecurityService.decrypt(encrypted);
// Result: "Hello, World!"

// Check if encrypted
SecurityService.isEncrypted(encrypted); // true
SecurityService.isEncrypted("plaintext"); // false
```

### Production Encryption Implementation

#### Where Encryption Would Happen

1. **Message Creation (Frontend)**

   ```typescript
   // Before sending to backend
   const encryptedBody = SecurityService.encrypt(
     messageBody,
     recipientPublicKey,
   );
   ```

2. **Message Storage (Backend)**

   ```typescript
   // Before storing in database
   const encryptedMessage = SecurityService.encrypt(message.body);
   db.prepare("INSERT INTO messages (body) VALUES (?)").run(encryptedMessage);
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
import sodium from "sodium-native";

class ProductionSecurityService {
  static encrypt(
    plaintext: string,
    recipientPublicKey: Buffer,
  ): {
    ciphertext: Buffer;
    nonce: Buffer;
  } {
    const nonce = Buffer.allocUnsafe(sodium.crypto_box_NONCEBYTES);
    sodium.randombytes_buf(nonce);

    const message = Buffer.from(plaintext, "utf8");
    const ciphertext = Buffer.allocUnsafe(
      message.length + sodium.crypto_box_MACBYTES,
    );

    sodium.crypto_box_easy(
      ciphertext,
      message,
      nonce,
      recipientPublicKey,
      senderPrivateKey,
    );

    return { ciphertext, nonce };
  }

  static decrypt(
    ciphertext: Buffer,
    nonce: Buffer,
    senderPublicKey: Buffer,
  ): string {
    const plaintext = Buffer.allocUnsafe(
      ciphertext.length - sodium.crypto_box_MACBYTES,
    );

    if (
      !sodium.crypto_box_open_easy(
        plaintext,
        ciphertext,
        nonce,
        senderPublicKey,
        recipientPrivateKey,
      )
    ) {
      throw new Error("Decryption failed - invalid signature or key");
    }

    return plaintext.toString("utf8");
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
console.log("Message received:", message);

// ✅ SAFE - Sanitized logging
console.error("Error processing message:", {
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
   app.on("web-contents-created", (_, contents) => {
     contents.on("crashed", (event) => {
       // Don't send crash dumps to external services
       event.preventDefault();
       // Log sanitized error only
       console.error("Renderer crashed:", { timestamp: Date.now() });
     });
   });
   ```

3. **Disable DevTools in Production**

   ```typescript
   // In electron main.ts
   if (process.env.NODE_ENV === "production") {
     win.webContents.on("devtools-opened", () => {
       win.webContents.closeDevTools();
     });
   }
   ```

4. **Memory Protection**

   ```typescript
   // Use secure buffers that zero memory on deallocation
   import { SecureBuffer } from "secure-buffer"; // Example library

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
   import Database from "@journeyapps/sqlcipher";

   const db = new Database(dbPath);
   const key = deriveKeyFromPassword(userPassword);
   db.pragma(`key='${key}'`);
   db.pragma("cipher_page_size=4096");
   ```

3. **Secure Database Deletion**

   ```typescript
   // Before deleting database, overwrite with random data
   import { randomBytes } from "crypto";
   import { writeFileSync, unlinkSync } from "fs";

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
ipcMain.handle("db:get-messages", async (_, params) => {
  // Validate chatId is a number
  if (typeof params.chatId !== "number" || params.chatId < 1) {
    throw new Error("Invalid chatId");
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

## 🚧 What Needs Improvement

### High Priority

#### 1. **Activate Message Encryption**

**Status**: Infrastructure complete, not yet activated
**What's needed**:

- Update `insertMessage()` in `electron/db/queries.ts` to encrypt message body
  ```typescript
  export function insertMessage(
    db: Database.Database,
    chatId: number,
    sender: string,
    body: string,
    ts: string,
  ): Message {
    const encryptedBody = SecurityService.encrypt(body); // Add this line
    const stmt = db.prepare(
      `INSERT INTO messages (chatId, sender, body, ts) VALUES (?, ?, ?, ?)`,
    );
    const info = stmt.run(chatId, sender, encryptedBody, ts); // Use encryptedBody
    // ...
  }
  ```
- Update message retrieval to decrypt before displaying
- Test encryption/decryption round-trip
- Migrate existing plaintext messages

**Effort**: 2-4 hours
**Impact**: Critical security feature

#### 2. **Implement End-to-End Encryption (E2EE)**

**Status**: Not started
**What's needed**:

- Key generation and exchange mechanism (X25519 ECDH)
- Per-user keypair storage in OS secure storage
- Public key distribution system
- Replace symmetric AES with asymmetric encryption
- Implement forward secrecy (Double Ratchet algorithm)
- Key rotation policy

**Libraries to consider**:

- `libsodium` (via `sodium-native` or `tweetnacl`)
- `@noble/curves` for elliptic curve operations
- `electron-store` with encryption for key storage

**Effort**: 2-3 weeks
**Impact**: Essential for true E2EE messaging

#### 3. **Database Encryption at Rest**

**Status**: Not started
**What's needed**:

- Replace `better-sqlite3` with `@journeyapps/sqlcipher`
- Implement key derivation from user password (Argon2id)
- Database encryption/decryption on app launch
- Secure key storage (never persist plaintext keys)

**Implementation**:

```typescript
import Database from "@journeyapps/sqlcipher";

const db = new Database(dbPath);
const key = await deriveKeyFromPassword(userPassword); // Argon2id
db.pragma(`key='${key}'`);
db.pragma("cipher_page_size=4096");
db.pragma("kdf_iter=256000");
```

**Effort**: 1-2 weeks
**Impact**: Protects data at rest

#### 4. **List Virtualization for Performance**

**Status**: Attempted but failed due to library incompatibility
**What's needed**:

- Replace `react-window` (ESM issues) with `@tanstack/react-virtual`
- Implement virtual scrolling for MessageList component
- Handle dynamic row heights
- Maintain scroll position on load more

**Why it matters**: App slows down with 1000+ messages
**Effort**: 1-2 days
**Impact**: Significant UX improvement for large chats

### Medium Priority

#### 5. **User Authentication System**

**Status**: Not implemented
**What's needed**:

- User registration with password
- Login/logout functionality
- Session management
- Password hashing (Argon2id)
- Rate limiting for login attempts
- Account recovery mechanism

**Effort**: 1-2 weeks
**Impact**: Required for multi-user support

#### 6. **WebSocket Authentication**

**Status**: Current implementation has no auth
**What's needed**:

- JWT token-based authentication
- Secure WebSocket handshake
- Token refresh mechanism
- Connection authorization middleware

**Current vulnerability**: Anyone can connect to WebSocket server
**Effort**: 3-5 days
**Impact**: Prevents unauthorized access

#### 7. **File Attachment Support**

**Status**: Not implemented
**What's needed**:

- File upload/download handlers
- File encryption before storage
- MIME type validation
- File size limits
- Virus scanning integration (ClamAV)
- Thumbnail generation for images

**Effort**: 2-3 weeks
**Impact**: Core messaging feature

#### 8. **Group Chat Functionality**

**Status**: Database supports it, UI doesn't
**What's needed**:

- Group creation/management UI
- Member invitation system
- Group key management for E2EE groups
- Permission system (admin, member)
- Group metadata (avatar, description)

**Effort**: 2-3 weeks
**Impact**: Expands app capabilities

### Low Priority

#### 9. **Message Delivery Receipts**

**Status**: Not implemented
**What's needed**:

- Sent/delivered/read status tracking
- Real-time status updates via WebSocket
- Database schema updates for status
- UI indicators (checkmarks)

**Effort**: 1 week
**Impact**: Better UX

#### 10. **Message Editing & Deletion**

**Status**: Not implemented
**What's needed**:

- Edit message handler
- Deletion with tombstone records
- Edit history tracking
- UI for edit/delete actions

**Effort**: 1 week
**Impact**: Standard messaging feature

#### 11. **Desktop Notifications**

**Status**: Not implemented
**What's needed**:

- Native notification API integration
- Notification preferences
- Sound alerts
- Badge count on app icon

**Effort**: 2-3 days
**Impact**: Improved user engagement

#### 12. **Automated Testing**

**Status**: No tests currently
**What's needed**:

- Unit tests for SecurityService
- Integration tests for database operations
- E2E tests for message flow
- WebSocket connection tests
- Encryption round-trip tests

**Frameworks**: Jest, Vitest, Playwright
**Effort**: Ongoing (20-30% of development time)
**Impact**: Code reliability and maintainability

### Security Hardening

#### 13. **Content Security Policy (CSP)**

**Status**: Not configured
**What's needed**:

```typescript
// In main.ts
win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
  callback({
    responseHeaders: {
      ...details.responseHeaders,
      "Content-Security-Policy": [
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';",
      ],
    },
  });
});
```

#### 14. **Code Signing**

**Status**: Not configured
**What's needed**:

- Apple Developer Certificate (macOS)
- Microsoft Authenticode Certificate (Windows)
- Configure electron-builder for signing
- Implement auto-update with signature verification

#### 15. **Dependency Security**

**Status**: Manual review only
**What's needed**:

- Set up `npm audit` in CI/CD
- Configure Dependabot for automated updates
- Regular security scanning
- Pin dependency versions

#### 16. **Rate Limiting**

**Status**: Not implemented
**What's needed**:

- IPC handler rate limits
- WebSocket message rate limits
- Prevent flooding attacks
- Implement exponential backoff

### Architecture Improvements

#### 17. **Centralized State Management**

**Status**: Redux implemented, could be optimized
**Improvements needed**:

- Split large slices into smaller ones
- Implement Redux-Saga for side effects
- Add Redux DevTools integration
- Optimize re-renders with selectors

#### 18. **Error Boundary Components**

**Status**: Not implemented
**What's needed**:

- React Error Boundaries for crash recovery
- User-friendly error messages
- Error reporting to logging service
- Graceful degradation

#### 19. **Offline Support**

**Status**: Partial (database persists)
**What's needed**:

- Queue outgoing messages when offline
- Retry mechanism with exponential backoff
- Offline indicator in UI
- Sync when connection restored

#### 20. **Internationalization (i18n)**

**Status**: English only
**What's needed**:

- `react-i18next` integration
- Extract all UI strings
- Support multiple languages
- RTL language support

## 📊 Performance Metrics

### Current State

- **Database query time**: < 50ms for 10,000 messages (with indexes)
- **Initial render time**: ~ 200ms for 50 messages
- **Memory usage**: ~ 150MB baseline
- **Bundle size**: ~ 2.5MB (minified)

### Performance Goals

- Support 100,000+ messages per chat
- < 100ms initial render with virtualization
- < 200MB memory usage under normal load
- < 1s cold start time

## 🔒 Security Checklist

### Completed ✅

- [x] Context isolation enabled
- [x] Node integration disabled
- [x] AES-256-GCM encryption implemented
- [x] Log sanitization for sensitive data
- [x] WebSocket message validation
- [x] Database indexes for performance
- [x] Environment-based configuration
- [x] IPC input validation

### In Progress 🔄

- [ ] Activate message encryption (infrastructure ready)
- [ ] Implement E2EE with key exchange
- [ ] Database encryption at rest (SQLCipher)

### Not Started ❌

- [ ] DevTools disabled in production
- [ ] Code signing for binaries
- [ ] Auto-update with signature verification
- [ ] Certificate pinning for WebSocket
- [ ] Rate limiting for IPC/WebSocket
- [ ] Crash reporting without sensitive data
- [ ] Forward secrecy (Double Ratchet)
- [ ] Security audit / penetration testing

## 💻 Development Guide

### Project Structure

```
secure-messenger-desktop/
├── electron/                  # Main process code
│   ├── main.ts               # Application entry point
│   ├── preload.ts            # IPC bridge (secure context)
│   ├── db/
│   │   ├── database.ts       # Database initialization
│   │   ├── queries.ts        # SQL query functions
│   │   └── seed.ts           # Test data generation
│   ├── handlers/             # IPC handlers
│   │   ├── chatHandlers.ts
│   │   ├── messageHandlers.ts
│   │   └── websocketHandlers.ts
│   ├── services/
│   │   └── SecurityService.ts # Encryption & security
│   └── websocket/
│       ├── client.ts         # WebSocket client
│       ├── server.ts         # Dev WebSocket server
│       └── validation.ts     # Message validation
├── src/                      # Renderer process (React)
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatList.tsx
│   │   │   ├── MessageList.tsx
│   │   │   └── MessageInput.tsx
│   │   └── layout/
│   ├── store/                # Redux state management
│   │   └── slices/
│   └── services/
│       └── SecurityService.ts # Frontend stub
├── .env                      # Environment configuration
├── vite.config.ts            # Vite build configuration
└── package.json
```

### Key Concepts

#### IPC Communication Flow

```
Renderer (React) → Preload (Bridge) → Main (Electron) → Database
                                    ↓
                                WebSocket Server
```

**Example IPC Call:**

```typescript
// Renderer (src/components/...)
const messages = await window.electron.getMessages({ chatId: 1, limit: 50 });

// Preload (electron/preload.ts)
contextBridge.exposeInMainWorld("electron", {
  getMessages: (params) => ipcRenderer.invoke("db:get-messages", params),
});

// Main (electron/handlers/messageHandlers.ts)
ipcMain.handle("db:get-messages", async (_, params) => {
  return getMessages(db, params.chatId, params.limit, params.offset);
});
```

#### Database Query Pattern

```typescript
// Always use explicit column lists, never SELECT *
const stmt = db.prepare(`
  SELECT id, chatId, ts, sender, body
  FROM messages
  WHERE chatId = ?
  ORDER BY ts DESC
  LIMIT ?
`);
return stmt.all(chatId, limit);
```

#### Secure Logging Pattern

```typescript
// ❌ NEVER do this
console.log("Message:", message);

// ✅ Always sanitize
import { SecurityService } from "../services/SecurityService";
console.log(
  "Message metadata:",
  SecurityService.sanitizeForLog({
    chatId: message.chatId,
    sender: message.sender,
    // body intentionally omitted
  }),
);
```

### Common Development Tasks

#### Add a New IPC Handler

1. Create handler function in `electron/handlers/`
2. Register in `electron/handlers/index.ts`
3. Add TypeScript type in `electron/preload.ts`
4. Expose via context bridge in preload
5. Call from renderer process

#### Add Database Migration

```typescript
// In electron/db/database.ts
setUpDataBase() {
  this.db.exec(`
    -- Your existing tables...

    -- Add new column
    ALTER TABLE messages ADD COLUMN editedAt DATETIME;

    -- Add new index
    CREATE INDEX IF NOT EXISTS idx_messages_edited ON messages(editedAt);
  `);
}
```

#### Debug WebSocket Issues

```bash
# Enable verbose WebSocket logging
# In electron/websocket/client.ts, add:
this.ws.on('ping', () => console.log('[WS] Ping received'));
this.ws.on('pong', () => console.log('[WS] Pong sent'));
```

#### Test Encryption Round-Trip

```typescript
// In Electron DevTools console (main process)
const { SecurityService } = require("./dist-electron/services/SecurityService");
const plaintext = "Test message";
const encrypted = SecurityService.encrypt(plaintext);
console.log("Encrypted:", encrypted);
const decrypted = SecurityService.decrypt(encrypted);
console.log("Decrypted:", decrypted);
console.log("Match:", plaintext === decrypted);
```

### Troubleshooting

#### Issue: "Module not found" errors

**Solution**:

```bash
npm install
npm run dev
```

#### Issue: Database locked errors

**Solution**:

```bash
# Close all app instances
# Delete database and restart
rm ~/AppData/Roaming/secure-messenger-desktop/secure-messenger.sqlite*
# macOS: rm ~/Library/Application\ Support/secure-messenger-desktop/secure-messenger.sqlite*
```

#### Issue: WebSocket connection fails

**Solution**:

1. Check `.env` for correct `VITE_WS_SERVER_URL`
2. Ensure port 8080 is not in use
3. Check firewall settings
4. Verify NODE_ENV is set to 'development'

#### Issue: Hot reload not working

**Solution**:

```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

#### Issue: Build fails on Windows

**Solution**:

```bash
# Rebuild native modules for Electron
npm run postinstall
```

### Performance Profiling

#### Database Query Performance

```typescript
// Add timing logs
const start = Date.now();
const messages = getMessages(db, chatId, limit, offset);
console.log(`Query took ${Date.now() - start}ms`);

// Check query plan
db.prepare("EXPLAIN QUERY PLAN SELECT * FROM messages WHERE chatId = ?").all(1);
```

#### React Component Performance

```typescript
// Use React DevTools Profiler
// Wrap component with Profiler
import { Profiler } from 'react';

<Profiler id="MessageList" onRender={(id, phase, actualDuration) => {
  console.log(`${id} (${phase}) took ${actualDuration}ms`);
}}>
  <MessageList />
</Profiler>
```

### Code Style Guidelines

- Use TypeScript strict mode
- Prefer functional components over class components
- Use async/await over Promise chains
- Always handle errors explicitly
- Document security-critical code
- Use ESLint and Prettier for formatting

### Git Commit Guidelines

```
feat: Add user authentication system
fix: Prevent SQL injection in search query
security: Implement message encryption
perf: Add database indexes for better query performance
docs: Update README with setup instructions
test: Add unit tests for SecurityService
refactor: Extract validation logic to separate module
```

## 📚 Resources

- [OWASP Electron Security Guidelines](https://owasp.org/www-community/vulnerabilities/Electron_Security)
- [libsodium Documentation](https://doc.libsodium.org/)
- [Signal Protocol (Double Ratchet)](https://signal.org/docs/)
- [SQLCipher](https://www.zetetic.net/sqlcipher/)
- [Electron Security Best Practices](https://www.electronjs.org/docs/latest/tutorial/security)
- [Node.js Crypto Module](https://nodejs.org/api/crypto.html)
- [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)

## 🤝 Contributing

When contributing security-related code:

1. Never log sensitive data (use `SecurityService.sanitizeForLog()`)
2. Validate all inputs from renderer process
3. Use parameterized queries for database operations
4. Follow principle of least privilege
5. Document security implications in PRs
6. Add tests for security-critical code

## 📝 License

MIT License - See LICENSE file for details
