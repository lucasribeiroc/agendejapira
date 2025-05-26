import {
  ThemeProvider,
  CssBaseline,
  Container,
  Box,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Link,
  Paper,
  TextField,
  Stack,
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { supabase } from "./supabaseClient";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import theme from "./theme";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();

  // Defina aqui o e-mail do usuário master
  const MASTER_EMAIL = "lucasr.camargo@live.com";

  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Se for o master, tenta autenticar pelo Supabase Auth
    if (email === MASTER_EMAIL) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });
      if (error) {
        // Veja o erro real no console para debug
        console.log(error);
        alert("E-mail ou senha inválidos.");
        return;
      }
      localStorage.setItem("usuario_nome", "Master");
      localStorage.setItem("is_master", "true");
      navigate("/dashboard");
      return;
    }

    // Se não for master, busca na tabela usuarios
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("email", email)
      .eq("senha", senha) // Em produção, use hash de senha!
      .single();

    if (error || !data) {
      alert("E-mail ou senha inválidos.");
    } else {
      localStorage.setItem("usuario_id", data.id);
      localStorage.setItem("usuario_nome", data.nome);
      localStorage.removeItem("is_master");
      navigate("/dashboard");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Header */}
      <AppBar position="static" color="primary" elevation={2}>
        <Toolbar>
          <CalendarMonthIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Agende Já Pira
          </Typography>
          <Button
            color="inherit"
            startIcon={<LoginIcon />}
            component={RouterLink}
            to="/login"
          >
            Login
          </Button>
          <Button color="inherit" startIcon={<ChatBubbleOutlineIcon />}>
            Contato
          </Button>
        </Toolbar>
      </AppBar>

      {/* Hero Section com formulário */}
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "white",
          py: { xs: 8, md: 12 },
          minHeight: "calc(100vh - 64px - 64px)", // header + footer
          display: "flex",
          alignItems: "center",
        }}
      >
        <Container maxWidth="xs">
          <Paper elevation={4} sx={{ p: { xs: 3, sm: 4 }, borderRadius: 4 }}>
            <Typography
              variant="h4"
              align="center"
              fontWeight={700}
              sx={{
                mb: 2,
                fontFamily: "Montserrat, Arial",
                color: "primary.main",
              }}
            >
              Login
            </Typography>
            <Typography
              variant="body1"
              align="center"
              sx={{ mb: 3, color: "text.secondary" }}
            >
              Entre com sua conta para acessar o sistema.
            </Typography>
            <Box component="form" onSubmit={handleLogin}>
              <TextField
                label="E-mail"
                type="email"
                fullWidth
                required
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{ sx: { borderRadius: 2 } }}
              />
              <TextField
                label="Senha"
                type="password"
                fullWidth
                required
                margin="normal"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                InputProps={{ sx: { borderRadius: 2 } }}
              />
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                fullWidth
                size="large"
                startIcon={<LoginIcon />}
                sx={{ mt: 3, fontWeight: 600, borderRadius: 2 }}
              >
                Entrar
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          bgcolor: "primary.dark",
          color: "white",
          py: 3,
          mt: 0,
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <Typography variant="body2" sx={{ fontFamily: "Montserrat, Arial" }}>
            © {new Date().getFullYear()} Agende Já Pira — Todos os direitos
            reservados.
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            sx={{ mt: 1 }}
          >
            <Link
              href="#"
              color="inherit"
              underline="hover"
              sx={{ display: "flex", alignItems: "center" }}
            >
              <ChatBubbleOutlineIcon sx={{ mr: 0.5 }} fontSize="small" />{" "}
              Contato
            </Link>
            <Link
              component={RouterLink}
              to="/login"
              color="inherit"
              underline="hover"
              sx={{ display: "flex", alignItems: "center" }}
            >
              <LoginIcon sx={{ mr: 0.5 }} fontSize="small" /> Login
            </Link>
          </Stack>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default LoginPage;
