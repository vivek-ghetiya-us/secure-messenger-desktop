export enum IpcChannel {
  GET_CHATS = 'db:get-chats',
  GET_MESSAGES = 'db:get-messages',
  MARK_CHAT_AS_READ = 'db:mark-chat-as-read',
  SEARCH_MESSAGES = 'db:search-messages',
  SEED_DATABASE = 'db:seed-database',
  WS_GET_STATUS = 'ws:get-status',
  WS_SIMULATE_DROP = 'ws:simulate-drop',
}

export interface GetChatsParams {
  limit?: number;
  offset?: number;
}

export interface GetMessagesParams {
  chatId: number;
  limit?: number;
  offset?: number;
}

export interface SearchMessagesParams {
  chatId: number;
  searchTerm: string;
  limit?: number;
  offset?: number;
}

export interface MarkChatAsReadParams {
  chatId: number;
}
