import { Box } from "@mui/material";
import LeftPanel from "./LeftPanel";
import RightPanel from "./RightPanel";

export default function MainLayout() {
  return (
    <Box sx={{ height: "92vh", display: "flex", overflow: "hidden" }}>
      <Box
        sx={{
          width: "33%",
          borderRight: 1,
          borderColor: "divider",
          height: "100%",
          overflow: "hidden",
        }}
      >
        <LeftPanel />
      </Box>
      <Box sx={{ flex: 1, height: "100%", overflow: "hidden" }}>
        <RightPanel />
      </Box>
    </Box>
  );
}
