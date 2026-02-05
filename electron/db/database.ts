import { app } from "electron";
import path from "node:path";
import Database from "better-sqlite3";

class AppDatabase {
  dbPath: string;
  db: Database.Database;

  constructor() {
    this.dbPath = path.join(app.getPath("userData"), "secure-messenger.sqlite");
    this.db = new Database(this.dbPath);
    this.db.pragma("journal_mode = WAL");
    this.setUpDataBase();
  }

  setUpDataBase() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS chats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        lastMessageAt DATETIME NOT NULL,
        unreadCount INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chatId INTEGER NOT NULL,
        ts DATETIME DEFAULT CURRENT_TIMESTAMP,
        sender TEXT NOT NULL,
        body TEXT NOT NULL,
        FOREIGN KEY (chatId) REFERENCES chats(id) ON DELETE CASCADE
      );

      -- Performance indexes
      CREATE INDEX IF NOT EXISTS idx_messages_chatid_ts ON messages(chatId, ts DESC);
      CREATE INDEX IF NOT EXISTS idx_messages_body ON messages(body);
      CREATE INDEX IF NOT EXISTS idx_chats_lastmessageat ON chats(lastMessageAt DESC);
    `);
    console.log(`Database initialized at ${this.dbPath}`);
  }
}

export default AppDatabase;
