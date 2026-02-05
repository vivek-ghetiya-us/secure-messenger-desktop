import WebSocket, { WebSocketServer } from 'ws';
import Database from 'better-sqlite3';

const SENDERS = ['Alice Johnson', 'Bob Smith', 'Charlie Davis', 'Diana Miller', 'Eve Wilson', 'Frank Brown', 'Grace Lee', 'Henry Taylor'];
const MESSAGES = ['Hey, how are you?', 'Did you see the latest update?', 'Let\'s schedule a meeting', 'Thanks for the information!', 'I\'ll get back to you soon', 'That sounds great!', 'Can you send me the details?', 'Perfect, let\'s do it', 'I agree with your suggestion', 'Looking forward to it'];

function random<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export class MessageSimulatorServer {
  wss: WebSocketServer;
  chatIds: number[] = [];
  timer?: NodeJS.Timeout;

  constructor(db: Database.Database, port: number = 8080) {
    // Load chat IDs
    const rows = db.prepare('SELECT id FROM chats').all() as Array<{ id: number }>;
    this.chatIds = rows.map(r => r.id);
    console.log(`[WS Server] Loaded ${this.chatIds.length} chat IDs`);

    // Start server
    this.wss = new WebSocketServer({ port });
    this.wss.on('connection', (ws) => {
      console.log('[WS Server] Client connected');

      ws.on('ping', () => ws.pong());
      ws.on('close', () => {
        console.log('[WS Server] Client disconnected');
        if (this.timer) clearTimeout(this.timer);
      });

      // Send random messages
      this.sendRandomMessages(ws);
    });

    console.log('[WS Server] Started on ws://localhost:8080');
  }

  sendRandomMessages(ws: WebSocket) {
    if (!this.chatIds.length || ws.readyState !== WebSocket.OPEN) return;

    const message = {
      chatId: random(this.chatIds),
      ts: new Date().toISOString(),
      sender: random(SENDERS),
      body: random(MESSAGES)
    };

    ws.send(JSON.stringify({ type: 'new-message', data: message }));

    // Next message in 1-3 seconds
    const delay = 1000 + Math.random() * 2000; // Random delay between 1-3 seconds
    this.timer = setTimeout(() => this.sendRandomMessages(ws), delay);
  }

  simulateDisconnect() {
    console.log('[WS Server] Simulating disconnect');
    this.wss.clients.forEach(c => c.close());
  }

  close() {
    if (this.timer) clearTimeout(this.timer);
    this.wss.close();
    console.log('[WS Server] Closed');
  }
}
