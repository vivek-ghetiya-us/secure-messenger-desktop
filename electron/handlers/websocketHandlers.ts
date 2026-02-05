import { ipcMain, BrowserWindow } from 'electron';
import Database from 'better-sqlite3';
import { WebSocketClient } from '../websocket/client';
import { MessageSimulatorServer } from '../websocket/server';
import { insertMessage, updateChatOnNewMessage } from '../db/queries';

export function registerWebSocketHandlers(
  db: Database.Database,
  wsClient: WebSocketClient,
  wsServer: MessageSimulatorServer,
  win: BrowserWindow
) {
  ipcMain.handle('ws:get-status', () => ({ status: wsClient.getState() }));

  ipcMain.handle('ws:simulate-drop', () => {
    wsServer.simulateDisconnect();
    return { success: true };
  });

  wsClient.on('stateChange', (state) => {
    win.webContents.send('ws:state-changed', { state });
  });

  wsClient.on('message', (event) => {
    if (event.type !== 'new-message') return;

    const { chatId, ts, sender, body } = event.data;
    try {
      const message = insertMessage(db, chatId, sender, body, ts);
      updateChatOnNewMessage(db, chatId, ts, null);
      win.webContents.send('ws:message-received', { message, chatId });
    } catch (error) {
      // Log error without exposing message content
      console.error('[WS] Error processing message:', {
        chatId,
        sender,
        ts,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}
