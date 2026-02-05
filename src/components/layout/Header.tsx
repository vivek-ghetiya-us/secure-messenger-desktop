import { Box, Chip, Button } from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { seedDatabase } from "../../store/slices/chatsSlice";
import { simulateConnectionDrop } from "../../store/slices/connectionSlice";

export default function Header() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.connection.status);
  const loading = useAppSelector((state) => state.chats.loading);

  const statusConfig = {
    connected: {
      label: "Online",
      color: "success" as const,
      iconColor: "#4caf50",
    },
    reconnecting: {
      label: "Connecting...",
      color: "warning" as const,
      iconColor: "#ff9800",
    },
    offline: {
      label: "Offline",
      color: "error" as const,
      iconColor: "#f44336",
    },
  };

  const config = statusConfig[status];

  return (
    <Box
      sx={{
        p: 1.5,
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        Secure Messenger Desktop
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Chip
          icon={<CircleIcon sx={{ fontSize: 12, color: config.iconColor }} />}
          label={config.label}
          color={config.color}
          size="small"
        />
        <Button
          variant="outlined"
          size="small"
          onClick={() => dispatch(simulateConnectionDrop())}
          color="error"
        >
          Simulate Drop
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={() => dispatch(seedDatabase())}
          disabled={loading}
        >
          Seed Database
        </Button>
      </Box>
    </Box>
  );
}
