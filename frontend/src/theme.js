import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#16A34A", // PluggI Green
    },
    secondary: {
      main: "#F59E0B", // PluggI Gold
    },
    background: {
      default: "#FAF9F6", // Cream
    },
    text: {
      primary: "#111827", // Dark
    },
  },
  typography: {
    fontFamily: "Roboto, Arial, sans-serif",
    h3: {
      fontWeight: 700,
    },
  },
});

export default theme;
