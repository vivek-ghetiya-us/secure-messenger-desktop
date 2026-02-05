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
