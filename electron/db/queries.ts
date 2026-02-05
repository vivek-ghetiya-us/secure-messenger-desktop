import Database from "better-sqlite3";

export interface Chat {
  id: number;
  title: string;
  lastMessageAt: string;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: number;
  chatId: number;
  ts: string;
  sender: string;
  body: string;
}

export function getChats(
  db: Database.Database,
  limit: number = 50,
  offset: number = 0,
): Chat[] {
  const stmt = db.prepare(`
    SELECT * FROM chats
    ORDER BY lastMessageAt DESC
    LIMIT ? OFFSET ?
  `);
  return stmt.all(limit, offset) as Chat[];
}

export function getTotalChatsCount(db: Database.Database): number {
  const stmt = db.prepare("SELECT COUNT(*) as count FROM chats");
  const result = stmt.get() as { count: number };
  return result.count;
}

export function getMessages(
  db: Database.Database,
  chatId: number,
  limit: number = 50,
  offset: number = 0,
): Message[] {
  const stmt = db.prepare(`
    SELECT * FROM messages
    WHERE chatId = ?
    ORDER BY ts DESC
    LIMIT ? OFFSET ?
  `);
  return stmt.all(chatId, limit, offset) as Message[];
}

export function markChatAsRead(db: Database.Database, chatId: number): void {
  const stmt = db.prepare(`
    UPDATE chats
    SET unreadCount = 0,
        updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  stmt.run(chatId);
}

export function searchMessages(
  db: Database.Database,
  chatId: number,
  searchTerm: string,
  limit: number = 50,
): Message[] {
  const stmt = db.prepare(`
    SELECT * FROM messages
    WHERE chatId = ? AND body LIKE ?
    ORDER BY ts DESC
    LIMIT ?
  `);
  return stmt.all(chatId, `%${searchTerm}%`, limit) as Message[];
}
