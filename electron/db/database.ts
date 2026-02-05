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
    `);
    console.log(`Database initialized at ${this.dbPath}`);
  }
}

export default AppDatabase;
