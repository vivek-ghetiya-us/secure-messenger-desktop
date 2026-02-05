import { Box } from "@mui/material";
import LeftPanel from "./LeftPanel";
import RightPanel from "./RightPanel";

export default function MainLayout() {
  return (
    <Box sx={{ flex: 1, display: "flex", overflow: "hidden" }}>
      <Box
        sx={{
          width: "33%",
          borderRight: 1,
          borderColor: "divider",
          height: "100%",
          overflow: "auto",
        }}
      >
        <LeftPanel />
      </Box>
      <Box sx={{ flex: 1, height: "100%", overflow: "auto" }}>
        <RightPanel />
      </Box>
    </Box>
  );
}
