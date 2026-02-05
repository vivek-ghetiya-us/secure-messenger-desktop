import { useEffect, useState } from 'react';
import { List } from 'react-window';
import { Box, CircularProgress, Typography, Button, Stack } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchChats, loadMoreChats, seedDatabase } from '../../store/slices/chatsSlice';
import ChatListItem from './ChatListItem';

export default function ChatList() {
  const dispatch = useAppDispatch();
  const { items, loading, error, hasMore, total } = useAppSelector((state) => state.chats);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    dispatch(fetchChats({ limit: 50, offset: 0 }));
  }, [dispatch]);

  const handleSeed = async () => {
    setIsSeeding(true);
    await dispatch(seedDatabase());
    await dispatch(fetchChats({ limit: 50, offset: 0 }));
    setIsSeeding(false);
  };

  if (loading && items.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (items.length === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: 2, p: 3 }}>
        <Typography color="text.secondary">No chats yet</Typography>
        <Button variant="contained" onClick={handleSeed} disabled={isSeeding}>
          {isSeeding ? <CircularProgress size={24} /> : 'Seed Database'}
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="caption" color="text.secondary">
            {items.length} of {total} chats
          </Typography>
          {hasMore && (
            <Button size="small" onClick={() => dispatch(loadMoreChats({ limit: 50, offset: items.length }))} disabled={loading}>
              Load More
            </Button>
          )}
        </Stack>
      </Box>

      {/* Chat List */}
      <List
        defaultHeight={window.innerHeight - 50}
        rowCount={items.length}
        rowHeight={80}
        overscanCount={5}
        rowComponent={({ index, style }) => <ChatListItem chat={items[index]} style={style} />}
        rowProps={{ chats: items }}
      />
    </Box>
  );
}
