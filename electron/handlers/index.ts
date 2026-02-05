import Database from 'better-sqlite3';
import { BrowserWindow } from 'electron';
import { registerChatHandlers } from './chatHandlers';
import { registerMessageHandlers } from './messageHandlers';
import { registerWebSocketHandlers } from './websocketHandlers';
import { WebSocketClient } from '../websocket/client';
import { MessageSimulatorServer } from '../websocket/server';

export function registerAllHandlers(
  db: Database.Database,
  wsClient?: WebSocketClient,
  wsServer?: MessageSimulatorServer,
  win?: BrowserWindow
) {
  registerChatHandlers(db);
  registerMessageHandlers(db);

  if (wsClient && wsServer && win) {
    registerWebSocketHandlers(db, wsClient, wsServer, win);
  }

  console.log('All IPC handlers registered');
}
