import { ipcMain } from 'electron';
import Database from 'better-sqlite3';
import { getMessages, searchMessages, getTotalMessagesCount, getSearchResultsCount } from '../db/queries';

interface GetMessagesParams {
  chatId: number;
  limit?: number;
  offset?: number;
}

interface SearchMessagesParams {
  chatId: number;
  searchTerm: string;
  limit?: number;
  offset?: number;
}

export function registerMessageHandlers(db: Database.Database) {
  ipcMain.handle('db:get-messages', async (_, params: GetMessagesParams) => {
    try {
      const { chatId, limit = 50, offset = 0 } = params;
      const messages = getMessages(db, chatId, limit, offset);
      const total = getTotalMessagesCount(db, chatId);
      return {
        messages,
        total,
        hasMore: offset + messages.length < total
      };
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  });

  ipcMain.handle('db:search-messages', async (_, params: SearchMessagesParams) => {
    try {
      const { chatId, searchTerm, limit = 50, offset = 0 } = params;
      const messages = searchMessages(db, chatId, searchTerm, limit, offset);
      const total = getSearchResultsCount(db, chatId, searchTerm);
      return {
        messages,
        total,
        hasMore: offset + messages.length < total
      };
    } catch (error) {
      console.error('Error searching messages:', error);
      throw error;
    }
  });
}
