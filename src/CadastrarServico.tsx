import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  Button,
} from "@mui/material";
import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

function CadastrarServico() {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [duracao, setDuracao] = useState("");
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

    // Apenas nome e valor são obrigatórios
    if (!nome.trim() || !valor.trim()) {
      setMsg("Preencha o nome e o valor do serviço.");
      return;
    }

    setLoading(true);
    const usuario_id = localStorage.getItem("usuario_id");
    const { error } = await supabase.from("servicos").insert([
      {
        nome,
        descricao: descricao.trim() || null,
        duracao_minutos: duracao.trim() ? parseInt(duracao, 10) : null,
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
      setDescricao("");
      setDuracao("");
      setValor("");
    }
  };

  // Exibe apenas para empresas (não master)
  const isMaster = localStorage.getItem("is_master") === "true";
  if (isMaster) return null;

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px - 64px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "transparent",
        py: { xs: 8, md: 12 },
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
              label="Descrição"
              fullWidth
              margin="normal"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              multiline
              minRows={2}
              maxRows={4}
            />
            <TextField
              label="Duração (minutos)"
              fullWidth
              margin="normal"
              value={duracao}
              onChange={(e) =>
                setDuracao(e.target.value.replace(/[^0-9]/g, ""))
              }
              inputProps={{ inputMode: "numeric", min: 1 }}
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
                sx={{
                  mt: 2,
                  textAlign: "center",
                  fontFamily: "Montserrat, Arial",
                }}
                color={msg.includes("sucesso") ? "success.main" : "error"}
              >
                {msg}
              </Typography>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default CadastrarServico;
