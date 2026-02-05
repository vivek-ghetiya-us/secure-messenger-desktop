import { useEffect, useState, useRef } from "react";
import { List, type ListImperativeAPI } from "react-window";
import {
  Box,
  CircularProgress,
  Typography,
  Button,
  Stack,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchChats,
  loadMoreChats,
  seedDatabase,
} from "../../store/slices/chatsSlice";
import ChatListItem from "./ChatListItem";

export default function ChatList() {
  const dispatch = useAppDispatch();
  const { items, loading, error, hasMore, total } = useAppSelector(
    (state) => state.chats,
  );
  const [isSeeding, setIsSeeding] = useState(false);
  const [previousCount, setPreviousCount] = useState(0);
  const listRef = useRef<ListImperativeAPI | null>(null);

  useEffect(() => {
    dispatch(fetchChats({ limit: 50, offset: 0 }));
  }, [dispatch]);

  useEffect(() => {
    if (!loading && items.length > previousCount && previousCount > 0) {
      listRef.current?.scrollToRow({
        index: previousCount,
        align: "start",
        behavior: "smooth",
      });
    }
  }, [items.length, loading, previousCount]);

  const handleSeed = async () => {
    setIsSeeding(true);
    await dispatch(seedDatabase());
    await dispatch(fetchChats({ limit: 50, offset: 0 }));
    setIsSeeding(false);
  };

  const handleLoadMore = () => {
    setPreviousCount(items.length);
    dispatch(loadMoreChats({ limit: 50, offset: items.length }));
  };

  if (loading && items.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
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
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          gap: 2,
          p: 3,
        }}
      >
        <Typography color="text.secondary">No chats yet</Typography>
        <Button variant="contained" onClick={handleSeed} disabled={isSeeding}>
          {isSeeding ? <CircularProgress size={24} /> : "Seed Database"}
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ p: 1, borderBottom: 1, borderColor: "divider" }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="caption" color="text.secondary">
            {items.length} of {total} chats
          </Typography>
          {hasMore && (
            <Button size="small" onClick={handleLoadMore} disabled={loading}>
              Load More
            </Button>
          )}
        </Stack>
      </Box>

      <List
        listRef={listRef}
        defaultHeight={window.innerHeight - 100}
        rowCount={items.length}
        rowHeight={80}
        overscanCount={5}
        rowComponent={({ index, style }) => (
          <ChatListItem chat={items[index]} style={style} />
        )}
        rowProps={{}}
      />
    </Box>
  );
}
