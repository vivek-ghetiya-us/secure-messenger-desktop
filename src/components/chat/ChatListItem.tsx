import React from "react";
import {
  ListItemButton,
  ListItemText,
  Badge,
  Box,
  Typography,
} from "@mui/material";
import { Chat } from "../../types/chat.types";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { selectChat } from "../../store/slices/uiSlice";
import { markAsRead } from "../../store/slices/chatsSlice";
import { formatRelativeTime } from "../../utils/formatters";

interface Props {
  chat: Chat;
  style?: React.CSSProperties;
}

function ChatListItem({ chat, style }: Props) {
  const dispatch = useAppDispatch();
  const selectedChatId = useAppSelector((state) => state.ui.selectedChatId);
  const isSelected = selectedChatId === chat.id;

  const handleClick = () => {
    dispatch(selectChat(chat.id));
    if (chat.unreadCount > 0) {
      dispatch(markAsRead(chat.id));
    }
  };

  return (
    <ListItemButton
      selected={isSelected}
      onClick={handleClick}
      style={style}
      sx={{ px: 2, py: 1.5 }}
    >
      <ListItemText
        primary={
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: isSelected ? 600 : 400 }}
            >
              {chat.title}
            </Typography>
            {chat.unreadCount > 0 && (
              <Badge badgeContent={chat.unreadCount} color="primary" />
            )}
          </Box>
        }
        secondary={
          <Typography variant="caption" color="text.secondary">
            {formatRelativeTime(chat.lastMessageAt)}
          </Typography>
        }
      />
    </ListItemButton>
  );
}

export default React.memo(ChatListItem);
