import { ipcMain, BrowserWindow } from 'electron';
import Database from 'better-sqlite3';
import { WebSocketClient } from '../websocket/client';
import { MessageSimulatorServer } from '../websocket/server';
import { insertMessage, updateChatOnNewMessage } from '../db/queries';
import { validateWebSocketMessage } from '../websocket/validation';
import { SecurityService } from '../services/SecurityService';

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
    // Validate message structure
    if (!validateWebSocketMessage(event)) {
      console.error('[WS] Invalid message structure:', SecurityService.sanitizeForLog(event));
      return;
    }

    const { chatId, ts, sender, body } = event.data;

    try {
      const message = insertMessage(db, chatId, sender, body, ts);
      updateChatOnNewMessage(db, chatId, ts, null);
      win.webContents.send('ws:message-received', { message, chatId });

      console.log('[WS] Message processed:', SecurityService.sanitizeForLog({ chatId, sender, ts }));
    } catch (error) {
      console.error('[WS] Error processing message:', SecurityService.sanitizeForLog({
        chatId,
        sender,
        ts,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  });
}
