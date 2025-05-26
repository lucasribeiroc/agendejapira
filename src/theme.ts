import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#0a1929", // azul escuro
      dark: "#06121a",
      contrastText: "#fff",
    },
    secondary: {
      main: "#1976d2", // azul claro
      contrastText: "#fff",
    },
    background: {
      default: "#0a1929",
      paper: "#fff",
    },
    text: {
      primary: "#222",
      secondary: "#555",
    },
  },
  typography: {
    fontFamily: "Montserrat, Arial, sans-serif",
  },
});

export default theme;
