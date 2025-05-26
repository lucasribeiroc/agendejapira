import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  Button,
} from "@mui/material";
import { useState } from "react";
import { supabase } from "./supabaseClient";

function CadastrarCliente() {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState("");
  const [numero, setNumero] = useState(""); // Novo campo
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("");
  const [rg, setRg] = useState("");
  const [cpf, setCpf] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [cepMsg, setCepMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Busca endereço pelo CEP
  const buscarCep = async (cepValue: string) => {
    setCepMsg(null);
    if (cepValue.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepValue}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setEndereco(data.logradouro || "");
        setBairro(data.bairro || "");
        setCidade(data.localidade || "");
        setUf(data.uf || "");
      } else {
        setEndereco("");
        setBairro("");
        setCidade("");
        setUf("");
        setCepMsg("CEP não encontrado. Verifique e tente novamente.");
      }
    } catch {
      setCepMsg("Erro ao buscar o CEP. Tente novamente.");
    }
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setCep(value);
    setCepMsg(null);
    if (value.length === 8) buscarCep(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (!nome.trim() || !telefone.trim() || !email.trim()) {
      setMsg("Preencha nome, telefone e email.");
      return;
    }
    setLoading(true);
    const usuario_id = localStorage.getItem("usuario_id");
    const { error } = await supabase.from("clientes").insert([
      {
        nome,
        telefone,
        email,
        cep,
        endereco,
        numero, // Adiciona o campo número
        bairro,
        cidade,
        uf,
        rg,
        cpf,
        usuario_id,
      },
    ]);
    setLoading(false);
    if (error) setMsg("Erro: " + error.message);
    else {
      setMsg("Cliente cadastrado com sucesso!");
      setNome("");
      setTelefone("");
      setEmail("");
      setCep("");
      setEndereco("");
      setNumero(""); // Limpa o campo número
      setBairro("");
      setCidade("");
      setUf("");
      setRg("");
      setCpf("");
    }
  };

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
            Cadastro de Cliente
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Nome"
              fullWidth
              required
              margin="normal"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
            <TextField
              label="Telefone"
              fullWidth
              required
              margin="normal"
              value={telefone}
              onChange={(e) =>
                setTelefone(e.target.value.replace(/[^0-9]/g, ""))
              }
            />
            <TextField
              label="Email"
              fullWidth
              required
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="CEP"
              fullWidth
              margin="normal"
              value={cep}
              onChange={handleCepChange}
              inputProps={{ maxLength: 8 }}
              error={!!cepMsg}
              helperText={cepMsg}
            />
            <TextField
              label="Endereço"
              fullWidth
              margin="normal"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
            />
            <TextField
              label="Número"
              fullWidth
              margin="normal"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
            />
            <TextField
              label="Bairro"
              fullWidth
              margin="normal"
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
            />
            <TextField
              label="Cidade"
              fullWidth
              margin="normal"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
            />
            <TextField
              label="UF"
              fullWidth
              margin="normal"
              value={uf}
              onChange={(e) => setUf(e.target.value)}
              inputProps={{ maxLength: 2 }}
            />
            <TextField
              label="RG"
              fullWidth
              margin="normal"
              value={rg}
              onChange={(e) => setRg(e.target.value)}
            />
            <TextField
              label="CPF"
              fullWidth
              margin="normal"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
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

export default CadastrarCliente;
