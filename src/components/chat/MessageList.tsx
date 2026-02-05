import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Stack,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchMessages,
  loadMoreMessages,
  searchMessages,
} from "../../store/slices/messagesSlice";
import MessageItem from "./MessageItem";

export default function MessageList() {
  const dispatch = useAppDispatch();
  const { selectedChatId } = useAppSelector((state) => state.ui);
  const { byChatId, loading, hasMore } = useAppSelector(
    (state) => state.messages,
  );

  const messages = selectedChatId ? byChatId[selectedChatId] || [] : [];
  const showLoadMore = selectedChatId ? hasMore[selectedChatId] : false;

  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const previousScrollHeightRef = useRef<number>(0);

  useEffect(() => {
    if (selectedChatId) {
      setSearchTerm("");
      setIsSearching(false);
      dispatch(fetchMessages({ chatId: selectedChatId, limit: 50, offset: 0 }));
    }
  }, [selectedChatId, dispatch]);

  useEffect(() => {
    if (messages.length > 0 && !loading && !isSearching && !isLoadingMore) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, loading, isSearching, isLoadingMore]);

  useEffect(() => {
    if (isLoadingMore && !loading && scrollContainerRef.current) {
      const currentScrollHeight = scrollContainerRef.current.scrollHeight;
      const scrollDiff = currentScrollHeight - previousScrollHeightRef.current;
      scrollContainerRef.current.scrollTop += scrollDiff;
      setIsLoadingMore(false);
    }
  }, [loading, isLoadingMore]);

  const handleSearch = () => {
    if (selectedChatId && searchTerm.trim()) {
      setIsSearching(true);
      dispatch(
        searchMessages({
          chatId: selectedChatId,
          searchTerm: searchTerm.trim(),
          limit: 50,
        }),
      );
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setIsSearching(false);
    if (selectedChatId) {
      dispatch(fetchMessages({ chatId: selectedChatId, limit: 50, offset: 0 }));
    }
  };

  const handleLoadMore = () => {
    if (selectedChatId && scrollContainerRef.current) {
      setIsLoadingMore(true);
      previousScrollHeightRef.current = scrollContainerRef.current.scrollHeight;
      dispatch(
        loadMoreMessages({
          chatId: selectedChatId,
          limit: 50,
          offset: messages.length,
        }),
      );
    }
  };

  if (!selectedChatId) return null;

  if (loading && messages.length === 0) {
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

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            fullWidth
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClearSearch}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={!searchTerm.trim() || loading}
          >
            Search
          </Button>
        </Stack>
        {isSearching && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: "block" }}
          >
            Showing results for "{searchTerm}"
          </Typography>
        )}
      </Box>

      <Box ref={scrollContainerRef} sx={{ flex: 1, overflowY: "auto", p: 2 }}>
        {showLoadMore && !isSearching && (
          <Box sx={{ mb: 2, textAlign: "center" }}>
            <Button
              onClick={handleLoadMore}
              disabled={loading}
              variant="outlined"
              size="small"
            >
              {loading ? <CircularProgress size={20} /> : "Load More"}
            </Button>
          </Box>
        )}

        {messages.length === 0 ? (
          <Typography
            color="text.secondary"
            sx={{ textAlign: "center", mt: 4 }}
          >
            {isSearching ? "No messages found" : "No messages yet"}
          </Typography>
        ) : (
          messages.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))
        )}

        <div ref={bottomRef} />
      </Box>
    </Box>
  );
}
