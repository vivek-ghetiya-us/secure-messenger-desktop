import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { MessagesState } from '../../types/message.types';
import { GetMessagesParams, SearchMessagesParams } from '../../types/ipc.types';
import { ipcService } from '../../services/ipc';

const initialState: MessagesState = {
  byChatId: {},
  loading: false,
  error: null,
  hasMore: {},
};

// Fetch messages for a chat
export const fetchMessages = createAsyncThunk('messages/fetch', async (params: GetMessagesParams) => {
  const messages = await ipcService.getMessages(params);
  return { chatId: params.chatId, messages };
});

// Load older messages
export const loadMoreMessages = createAsyncThunk('messages/loadMore', async (params: GetMessagesParams) => {
  const messages = await ipcService.getMessages(params);
  return { chatId: params.chatId, messages };
});

// Search messages
export const searchMessages = createAsyncThunk('messages/search', async (params: SearchMessagesParams) => {
  const messages = await ipcService.searchMessages(params);
  return { chatId: params.chatId, messages };
});

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch messages
    builder.addCase(fetchMessages.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchMessages.fulfilled, (state, action) => {
      state.loading = false;
      const { chatId, messages } = action.payload;
      state.byChatId[chatId] = messages;
      state.hasMore[chatId] = messages.length === 50;
    });
    builder.addCase(fetchMessages.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch messages';
    });

    // Load more messages
    builder.addCase(loadMoreMessages.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(loadMoreMessages.fulfilled, (state, action) => {
      state.loading = false;
      const { chatId, messages } = action.payload;
      const existing = state.byChatId[chatId] || [];
      state.byChatId[chatId] = [...messages, ...existing];
      state.hasMore[chatId] = messages.length === 50;
    });

    // Search messages
    builder.addCase(searchMessages.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(searchMessages.fulfilled, (state, action) => {
      state.loading = false;
      const { chatId, messages } = action.payload;
      state.byChatId[chatId] = messages;
      state.hasMore[chatId] = false; // Disable load more during search
    });
  },
});

export default messagesSlice.reducer;
