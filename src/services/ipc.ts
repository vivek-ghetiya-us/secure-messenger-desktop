import { IpcChannel, GetChatsParams, GetMessagesParams, SearchMessagesParams } from '../types/ipc.types';
import { Chat } from '../types/chat.types';
import { Message } from '../types/message.types';

interface GetChatsResponse {
  chats: Chat[];
  total: number;
  hasMore: boolean;
}

export const ipcService = {
  async getChats(params?: GetChatsParams): Promise<GetChatsResponse> {
    return window.ipcRenderer.invoke(IpcChannel.GET_CHATS, params);
  },

  async getMessages(params: GetMessagesParams): Promise<Message[]> {
    return window.ipcRenderer.invoke(IpcChannel.GET_MESSAGES, params);
  },

  async searchMessages(params: SearchMessagesParams): Promise<Message[]> {
    return window.ipcRenderer.invoke(IpcChannel.SEARCH_MESSAGES, params);
  },

  async markChatAsRead(chatId: number): Promise<void> {
    return window.ipcRenderer.invoke(IpcChannel.MARK_CHAT_AS_READ, chatId);
  },

  async seedDatabase(): Promise<void> {
    return window.ipcRenderer.invoke(IpcChannel.SEED_DATABASE);
  },
};
