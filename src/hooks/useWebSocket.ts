import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  setConnectionStatus,
  getConnectionStatus,
} from "../store/slices/connectionSlice";
import { addMessageFromWS } from "../store/slices/messagesSlice";
import { updateChatFromWS } from "../store/slices/chatsSlice";

export function useWebSocket() {
  const dispatch = useAppDispatch();
  const selectedChatId = useAppSelector((state) => state.ui.selectedChatId);

  useEffect(() => {
    if (!window.ipcRenderer) return;

    dispatch(getConnectionStatus());

    const onStateChange = (_: any, data: { state: string }) => {
      dispatch(setConnectionStatus(data.state as any));
    };

    const onMessage = (_: any, data: { message: any; chatId: number }) => {
      dispatch(addMessageFromWS(data));
      dispatch(
        updateChatFromWS({
          chatId: data.chatId,
          lastMessageAt: data.message.ts,
          unreadCount: selectedChatId === data.chatId ? 0 : 1,
        }),
      );
    };

    window.ipcRenderer.on("ws:state-changed", onStateChange);
    window.ipcRenderer.on("ws:message-received", onMessage);

    return () => {
      window.ipcRenderer.off("ws:state-changed", onStateChange);
      window.ipcRenderer.off("ws:message-received", onMessage);
    };
  }, [dispatch, selectedChatId]);
}
