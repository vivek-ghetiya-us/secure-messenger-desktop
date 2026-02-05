import { ipcMain } from 'electron';
import Database from 'better-sqlite3';
import { getMessages, searchMessages } from '../db/queries';

interface GetMessagesParams {
  chatId: number;
  limit?: number;
  offset?: number;
}

interface SearchMessagesParams {
  chatId: number;
  searchTerm: string;
  limit?: number;
}

export function registerMessageHandlers(db: Database.Database) {
  ipcMain.handle('db:get-messages', async (_, params: GetMessagesParams) => {
    try {
      const { chatId, limit = 50, offset = 0 } = params;
      return getMessages(db, chatId, limit, offset);
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  });

  ipcMain.handle('db:search-messages', async (_, params: SearchMessagesParams) => {
    try {
      const { chatId, searchTerm, limit = 50 } = params;
      return searchMessages(db, chatId, searchTerm, limit);
    } catch (error) {
      console.error('Error searching messages:', error);
      throw error;
    }
  });
}
