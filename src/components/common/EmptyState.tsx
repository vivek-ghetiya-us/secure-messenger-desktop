import { Box, Typography } from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

interface EmptyStateProps {
  message: string;
}

export default function EmptyState({ message }: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        p: 3,
      }}
    >
      <ChatBubbleOutlineIcon
        sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }}
      />
      <Typography variant="h6" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}
