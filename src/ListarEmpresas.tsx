import { Box, Typography, Button, Paper, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

interface Empresa {
  id: number;
  nome: string;
  email: string;
  telefone: string;
}

function ListarEmpresas() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEmpresas() {
      setLoading(true);
      const { data, error } = await supabase.from("usuarios").select("*");
      if (!error && data) setEmpresas(data);
      setLoading(false);
    }
    fetchEmpresas();
  }, []);

  const handleExcluir = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir esta empresa?")) return;
    const { error } = await supabase.from("usuarios").delete().eq("id", id);
    if (!error) setEmpresas((prev) => prev.filter((e) => e.id !== id));
    else alert("Erro ao excluir: " + error.message);
  };

  const handleEditar = (empresa: Empresa) => {
    alert("Funcionalidade de edição não implementada neste exemplo.");
    // Aqui você pode abrir um modal ou navegar para uma página de edição
  };

  if (loading) return <Typography>Carregando...</Typography>;

  return (
    <Box>
      <Typography
        variant="h5"
        sx={{ mb: 2, color: "primary.main", fontWeight: 700 }}
      >
        Empresas cadastradas
      </Typography>
      {empresas.length === 0 ? (
        <Typography>Nenhuma empresa cadastrada.</Typography>
      ) : (
        <Stack spacing={2}>
          {empresas.map((empresa) => (
            <Paper
              key={empresa.id}
              sx={{
                p: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderRadius: 2,
              }}
            >
              <Box>
                <Typography fontWeight={600}>{empresa.nome}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {empresa.email} | {empresa.telefone}
                </Typography>
              </Box>
              <Box>
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  sx={{ mr: 1 }}
                  onClick={() => handleEditar(empresa)}
                >
                  Editar
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => handleExcluir(empresa.id)}
                >
                  Excluir
                </Button>
              </Box>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default ListarEmpresas;
