export interface Message {
  id: number;
  chatId: number;
  ts: string;
  sender: string;
  body: string;
}

export interface MessagesState {
  byChatId: Record<number, Message[]>;
  loading: boolean;
  error: string | null;
  hasMore: Record<number, boolean>;
}
