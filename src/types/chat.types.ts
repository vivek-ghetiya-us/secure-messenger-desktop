export interface Chat {
  id: number;
  title: string;
  lastMessageAt: string;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatsState {
  items: Chat[];
  loading: boolean;
  error: string | null;
}
