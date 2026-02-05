import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { MessagesState, Message } from "../../types/message.types";
import { GetMessagesParams, SearchMessagesParams } from "../../types/ipc.types";
import { ipcService } from "../../services/ipc";

const initialState: MessagesState = {
  byChatId: {},
  loading: false,
  error: null,
  hasMore: {},
};

export const fetchMessages = createAsyncThunk(
  "messages/fetch",
  async (params: GetMessagesParams) => {
    const result = await ipcService.getMessages(params);
    return { chatId: params.chatId, ...result };
  },
);

export const loadMoreMessages = createAsyncThunk(
  "messages/loadMore",
  async (params: GetMessagesParams) => {
    const result = await ipcService.getMessages(params);
    return { chatId: params.chatId, ...result };
  },
);

export const searchMessages = createAsyncThunk(
  "messages/search",
  async (params: SearchMessagesParams) => {
    const result = await ipcService.searchMessages(params);
    return { chatId: params.chatId, ...result };
  },
);

const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    addMessageFromWS: (
      state,
      action: PayloadAction<{ chatId: number; message: Message }>,
    ) => {
      const { chatId, message } = action.payload;
      const existing = state.byChatId[chatId] || [];
      state.byChatId[chatId] = [...existing, message];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchMessages.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchMessages.fulfilled, (state, action) => {
      state.loading = false;
      const { chatId, messages, hasMore } = action.payload;
      state.byChatId[chatId] = messages.reverse();
      state.hasMore[chatId] = hasMore;
    });
    builder.addCase(fetchMessages.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to fetch messages";
    });

    builder.addCase(loadMoreMessages.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(loadMoreMessages.fulfilled, (state, action) => {
      state.loading = false;
      const { chatId, messages, hasMore } = action.payload;
      const existing = state.byChatId[chatId] || [];
      state.byChatId[chatId] = [...messages.reverse(), ...existing];
      state.hasMore[chatId] = hasMore;
    });

    builder.addCase(searchMessages.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(searchMessages.fulfilled, (state, action) => {
      state.loading = false;
      const { chatId, messages, hasMore } = action.payload;
      state.byChatId[chatId] = messages.reverse();
      state.hasMore[chatId] = hasMore;
    });
  },
});

export const { addMessageFromWS } = messagesSlice.actions;
export default messagesSlice.reducer;
