import { configureStore } from '@reduxjs/toolkit';
import chatsReducer from './slices/chatsSlice';
import messagesReducer from './slices/messagesSlice';
import uiReducer from './slices/uiSlice';
import connectionReducer from './slices/connectionSlice';

export const store = configureStore({
  reducer: {
    chats: chatsReducer,
    messages: messagesReducer,
    ui: uiReducer,
    connection: connectionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
