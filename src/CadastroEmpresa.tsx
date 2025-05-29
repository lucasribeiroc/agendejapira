import {
  ThemeProvider,
  CssBaseline,
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormHelperText,
  IconButton,
} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, ChangeEvent } from "react";
import { supabase } from "./supabaseClient";
import theme from "./theme";

function CadastroEmpresa() {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
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

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLogoError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      setLogoError("O logotipo deve ser JPG ou PNG.");
      setLogoFile(null);
      setLogoPreview(null);
      return;
    }
    const img = new window.Image();
    img.onload = () => {
      if (img.width > 170 || img.height > 50) {
        setLogoError("O logotipo deve ter no máximo 170x50 pixels.");
        setLogoFile(null);
        setLogoPreview(null);
      } else if (img.width !== 170 || img.height !== 50) {
        setLogoError("O logotipo deve ter exatamente 170x50 pixels.");
        setLogoFile(null);
        setLogoPreview(null);
      } else {
        setLogoFile(file);
        setLogoPreview(URL.createObjectURL(file));
      }
    };
    img.onerror = () => {
      setLogoError("Erro ao carregar a imagem.");
      setLogoFile(null);
      setLogoPreview(null);
    };
    img.src = URL.createObjectURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setLogoError(null);
  };

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();

    let logoUrl = null;
    if (logoFile) {
      const fileExt = logoFile.name.split(".").pop();
      const fileName = `${Date.now()}_${nome.replace(/\s/g, "_")}.${fileExt}`;
      const { data, error: uploadError } = await supabase.storage
        .from("logotipos")
        .upload(fileName, logoFile, {
          cacheControl: "3600",
          upsert: false,
        });
      if (uploadError) {
        alert("Erro ao enviar logotipo: " + uploadError.message);
        return;
      }
      logoUrl = data?.path
        ? supabase.storage.from("logotipos").getPublicUrl(data.path).data
            .publicUrl
        : null;
    }

    const { error } = await supabase
      .from("usuarios")
      .insert([{ nome, telefone, email, senha, logotipo: logoUrl }]);
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
          py: { xs: 2, md: 4 },
          minHeight: "100vh",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
        }}
      >
        <Container maxWidth="xs">
          <Paper
            elevation={4}
            sx={{ p: { xs: 3, sm: 4 }, borderRadius: 4, mt: 4 }}
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

              <Box
                sx={{
                  mt: 2,
                  mb: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  bgcolor: "#f5f5f5",
                  borderRadius: 2,
                  border: logoError ? "1px solid #d32f2f" : "1px dashed #aaa",
                  p: 2,
                  position: "relative",
                }}
              >
                <input
                  accept="image/png, image/jpeg"
                  style={{ display: "none" }}
                  id="logo-upload"
                  type="file"
                  onChange={handleLogoChange}
                />
                <label htmlFor="logo-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<PhotoCamera />}
                    sx={{
                      fontWeight: 600,
                      borderRadius: 2,
                      mb: 1,
                      bgcolor: "#fff",
                      color: "primary.main",
                      "&:hover": { bgcolor: "#f0f0f0" },
                    }}
                  >
                    Enviar Logotipo
                  </Button>
                </label>
                <Typography
                  variant="body2"
                  sx={{ color: "#555", mb: 1, textAlign: "center" }}
                >
                  JPG ou PNG, exatamente 170x50 pixels
                </Typography>
                {logoPreview && (
                  <Box
                    sx={{ textAlign: "center", mb: 1, position: "relative" }}
                  >
                    <img
                      src={logoPreview}
                      alt="Prévia do logotipo"
                      style={{
                        width: 170,
                        height: 50,
                        objectFit: "contain",
                        border: "1px solid #ccc",
                        borderRadius: 4,
                        background: "#fff",
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={handleRemoveLogo}
                      sx={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        bgcolor: "#fff",
                        color: "#d32f2f",
                        "&:hover": { bgcolor: "#ffeaea" },
                      }}
                      aria-label="Remover logotipo"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
                {logoError && (
                  <FormHelperText error sx={{ textAlign: "center" }}>
                    {logoError}
                  </FormHelperText>
                )}
              </Box>

              <Button
                type="submit"
                variant="contained"
                color="secondary"
                fullWidth
                size="large"
                sx={{ mt: 2, fontWeight: 600, borderRadius: 2 }}
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
