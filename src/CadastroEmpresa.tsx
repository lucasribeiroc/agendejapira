import {
  ThemeProvider,
  CssBaseline,
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import theme from "./theme";

function CadastroEmpresa() {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();

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

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from("usuarios")
      .insert([{ nome, telefone, email, senha }]);
    if (error) {
      alert("Erro ao cadastrar: " + error.message);
    } else {
      alert("Empresa cadastrada com sucesso!");
      navigate("/dashboard");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "white",
          py: { xs: 8, md: 12 },
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
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
              Cadastro de Empresa
            </Typography>
            <Box component="form" onSubmit={handleCadastro}>
              <TextField
                label="Nome da Empresa"
                fullWidth
                required
                margin="normal"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
              <TextField
                label="Telefone"
                fullWidth
                margin="normal"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
              />
              <TextField
                label="E-mail"
                type="email"
                fullWidth
                required
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                label="Senha"
                type="password"
                fullWidth
                required
                margin="normal"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                fullWidth
                size="large"
                sx={{ mt: 3, fontWeight: 600, borderRadius: 2 }}
              >
                Cadastrar
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default CadastroEmpresa;
