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
