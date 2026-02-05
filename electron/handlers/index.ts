import Database from 'better-sqlite3';
import { registerChatHandlers } from './chatHandlers';
import { registerMessageHandlers } from './messageHandlers';

export function registerAllHandlers(db: Database.Database) {
  registerChatHandlers(db);
  registerMessageHandlers(db);
  console.log('All IPC handlers registered');
}
