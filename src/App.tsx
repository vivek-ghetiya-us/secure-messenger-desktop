import { Provider } from "react-redux";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { store } from "./store";
import { theme } from "./theme/theme";
import MainLayout from "./components/layout/MainLayout";
import "./App.css";

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <MainLayout />
      </ThemeProvider>
    </Provider>
  );
}

export default App;
