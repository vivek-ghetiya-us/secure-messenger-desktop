import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ChatsState } from '../../types/chat.types';
import { ipcService } from '../../services/ipc';

const initialState: ChatsState & { hasMore: boolean; total: number } = {
  items: [],
  loading: false,
  error: null,
  hasMore: false,
  total: 0,
};

// Fetch chats with pagination
export const fetchChats = createAsyncThunk('chats/fetch', async (params?: { limit?: number; offset?: number }) => {
  return await ipcService.getChats(params);
});

// Load more chats
export const loadMoreChats = createAsyncThunk('chats/loadMore', async (params: { limit: number; offset: number }) => {
  return await ipcService.getChats(params);
});

// Mark chat as read
export const markAsRead = createAsyncThunk('chats/markAsRead', async (chatId: number) => {
  await ipcService.markChatAsRead(chatId);
  return chatId;
});

// Seed database
export const seedDatabase = createAsyncThunk('chats/seed', async () => {
  await ipcService.seedDatabase();
});

const chatsSlice = createSlice({
  name: 'chats',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch chats
    builder.addCase(fetchChats.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchChats.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload.chats;
      state.hasMore = action.payload.hasMore;
      state.total = action.payload.total;
    });
    builder.addCase(fetchChats.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch chats';
    });

    // Load more chats
    builder.addCase(loadMoreChats.fulfilled, (state, action) => {
      state.items.push(...action.payload.chats);
      state.hasMore = action.payload.hasMore;
      state.total = action.payload.total;
    });

    // Mark as read
    builder.addCase(markAsRead.fulfilled, (state, action) => {
      const chat = state.items.find((c) => c.id === action.payload);
      if (chat) chat.unreadCount = 0;
    });

    // Seed database
    builder.addCase(seedDatabase.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(seedDatabase.fulfilled, (state) => {
      state.loading = false;
    });
  },
});

export default chatsSlice.reducer;
