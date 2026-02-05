import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import { Message } from "../../types/message.types";
import { formatTime } from "../../utils/formatters";

interface Props {
  message: Message;
}

function MessageItem({ message }: Props) {
  const isMe = message.sender === "me";

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isMe ? "flex-end" : "flex-start",
        mb: 1.5,
      }}
    >
      <Paper
        elevation={1}
        sx={{
          maxWidth: "70%",
          px: 2,
          py: 1,
          backgroundColor: isMe ? "primary.main" : "background.paper",
          color: isMe ? "primary.contrastText" : "text.primary",
        }}
      >
        {!isMe && (
          <Typography
            variant="caption"
            sx={{ fontWeight: 600, display: "block", mb: 0.5 }}
          >
            {message.sender}
          </Typography>
        )}
        <Typography variant="body1">{message.body}</Typography>
        <Typography
          variant="caption"
          sx={{ display: "block", mt: 0.5, opacity: 0.7, textAlign: "right" }}
        >
          {formatTime(message.ts)}
        </Typography>
      </Paper>
    </Box>
  );
}

export default React.memo(MessageItem);
