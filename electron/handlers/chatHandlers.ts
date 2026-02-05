import { ipcMain } from "electron";
import Database from "better-sqlite3";
import { getChats, markChatAsRead, getTotalChatsCount } from "../db/queries";
import { seedDatabase } from "../db/seed";

interface GetChatsParams {
  limit?: number;
  offset?: number;
}

export function registerChatHandlers(db: Database.Database) {
  ipcMain.handle("db:get-chats", async (_, params?: GetChatsParams) => {
    try {
      const { limit = 50, offset = 0 } = params || {};
      const chats = getChats(db, limit, offset);
      const total = getTotalChatsCount(db);
      return { chats, total, hasMore: offset + chats.length < total };
    } catch (error) {
      console.error("Error fetching chats:", error);
      throw error;
    }
  });

  ipcMain.handle("db:mark-chat-as-read", async (_, chatId: number) => {
    try {
      markChatAsRead(db, chatId);
      return { success: true };
    } catch (error) {
      console.error("Error marking chat as read:", error);
      throw error;
    }
  });

  ipcMain.handle("db:seed-database", async () => {
    try {
      seedDatabase();
      return { success: true };
    } catch (error) {
      console.error("Error seeding database:", error);
      throw error;
    }
  });
}
