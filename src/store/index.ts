import { configureStore } from '@reduxjs/toolkit';
import chatsReducer from './slices/chatsSlice';
import messagesReducer from './slices/messagesSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    chats: chatsReducer,
    messages: messagesReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
