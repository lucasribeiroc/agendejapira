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
import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import theme from "./theme";

function CadastrarServico() {
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

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
    setMsg(null);

    if (!nome.trim() || !valor.trim()) {
      setMsg("Preencha todos os campos.");
      return;
    }

    setLoading(true);
    const usuario_id = localStorage.getItem("usuario_id");
    const { error } = await supabase.from("servicos").insert([
      {
        nome,
        valor: parseFloat(valor.replace(",", ".")),
        usuario_id,
      },
    ]);
    setLoading(false);

    if (error) {
      setMsg("Erro ao cadastrar serviço: " + error.message);
    } else {
      setMsg("Serviço cadastrado com sucesso!");
      setNome("");
      setValor("");
    }
  };

  // Exibe apenas para empresas (não master)
  const isMaster = localStorage.getItem("is_master") === "true";
  if (isMaster) return null;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          bgcolor: "#fff",
          py: { xs: 8, md: 12 },
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Container maxWidth="xs">
          <Paper
            elevation={4}
            sx={{ p: { xs: 3, sm: 4 }, borderRadius: 4, bgcolor: "#fff" }}
          >
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
              Cadastro de Serviço
            </Typography>
            <Box component="form" onSubmit={handleCadastro}>
              <TextField
                label="Nome do serviço"
                fullWidth
                required
                margin="normal"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
              <TextField
                label="Valor do serviço"
                fullWidth
                required
                margin="normal"
                value={valor}
                onChange={(e) =>
                  setValor(e.target.value.replace(/[^0-9.,]/g, ""))
                }
                inputProps={{ inputMode: "decimal" }}
              />
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                fullWidth
                size="large"
                sx={{ mt: 3, fontWeight: 600, borderRadius: 2 }}
                disabled={loading}
              >
                {loading ? "Salvando..." : "Cadastrar"}
              </Button>
              {msg && (
                <Typography
                  sx={{ mt: 2, textAlign: "center" }}
                  color={msg.includes("sucesso") ? "success.main" : "error"}
                >
                  {msg}
                </Typography>
              )}
            </Box>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default CadastrarServico;
