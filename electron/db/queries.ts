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
    SELECT id, title, lastMessageAt, unreadCount, createdAt, updatedAt
    FROM chats
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

export function getTotalMessagesCount(
  db: Database.Database,
  chatId: number,
): number {
  const stmt = db.prepare(
    "SELECT COUNT(*) as count FROM messages WHERE chatId = ?",
  );
  const result = stmt.get(chatId) as { count: number };
  return result.count;
}

export function getSearchResultsCount(
  db: Database.Database,
  chatId: number,
  searchTerm: string,
): number {
  const stmt = db.prepare(
    "SELECT COUNT(*) as count FROM messages WHERE chatId = ? AND body LIKE ?",
  );
  const result = stmt.get(chatId, `%${searchTerm}%`) as { count: number };
  return result.count;
}

export function getMessages(
  db: Database.Database,
  chatId: number,
  limit: number = 50,
  offset: number = 0,
): Message[] {
  const stmt = db.prepare(`
    SELECT id, chatId, ts, sender, body
    FROM messages
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
  offset: number = 0,
): Message[] {
  const stmt = db.prepare(`
    SELECT id, chatId, ts, sender, body
    FROM messages
    WHERE chatId = ? AND body LIKE ?
    ORDER BY ts DESC
    LIMIT ? OFFSET ?
  `);
  return stmt.all(chatId, `%${searchTerm}%`, limit, offset) as Message[];
}

export function insertMessage(
  db: Database.Database,
  chatId: number,
  sender: string,
  body: string,
  ts: string,
): Message {
  const stmt = db.prepare(`
    INSERT INTO messages (chatId, sender, body, ts)
    VALUES (?, ?, ?, ?)
  `);
  const info = stmt.run(chatId, sender, body, ts);

  // Get the inserted message
  const getStmt = db.prepare("SELECT id, chatId, ts, sender, body FROM messages WHERE id = ?");
  return getStmt.get(info.lastInsertRowid) as Message;
}

export function updateChatOnNewMessage(
  db: Database.Database,
  chatId: number,
  lastMessageAt: string,
  selectedChatId: number | null,
): void {
  // Only increment unread if chat is not currently selected
  const shouldIncrement = selectedChatId !== chatId;

  const stmt = db.prepare(`
    UPDATE chats
    SET lastMessageAt = ?,
        unreadCount = unreadCount + ?,
        updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  stmt.run(lastMessageAt, shouldIncrement ? 1 : 0, chatId);
}
