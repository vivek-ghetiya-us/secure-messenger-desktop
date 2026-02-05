import { Provider } from "react-redux";
import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import { store } from "./store";
import { theme } from "./theme/theme";
import MainLayout from "./components/layout/MainLayout";
import Header from "./components/layout/Header";
import { useWebSocket } from "./hooks/useWebSocket";
import "./App.css";

function AppContent() {
  useWebSocket();

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <MainLayout />
    </Box>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppContent />
      </ThemeProvider>
    </Provider>
  );
}

export default App;
