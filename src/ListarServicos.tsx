import {
  Typography,
  Card,
  CardContent,
  CardActions,
  CardHeader,
  Grid,
  Container,
  IconButton,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

interface Servico {
  id: string;
  nome: string;
  valor: number;
  descricao: string;
  duracao_minutos: number;
  usuario_id: string;
  usuarios?: { nome: string } | null;
}

function ListarServicos() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [empresaFiltro, setEmpresaFiltro] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const usuario_id = localStorage.getItem("usuario_id");
  const isMaster = localStorage.getItem("is_master") === "true";

  useEffect(() => {
    async function fetchServicos() {
      setLoading(true);

      let query = supabase.from("servicos").select(`
          id,
          nome,
          valor,
          descricao,
          duracao_minutos,
          usuario_id,
          usuarios:usuario_id (
            nome
          )
        `);

      if (!isMaster && usuario_id) {
        query = query.eq("usuario_id", usuario_id);
      } else if (isMaster && empresaFiltro) {
        query = query.eq("usuario_id", empresaFiltro);
      }

      const { data, error } = await query;
      if (!error && data) {
        setServicos(data);
      }
      setLoading(false);
    }
    fetchServicos();
  }, [isMaster, usuario_id, empresaFiltro]);

  // Buscar empresas para filtro (apenas para master)
  useEffect(() => {
    if (isMaster) {
      supabase
        .from("usuarios")
        .select("id, nome")
        .then(({ data }) => setEmpresas(data || []));
    }
  }, [isMaster]);

  const handleExcluir = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este serviço?")) return;
    const { error } = await supabase.from("servicos").delete().eq("id", id);
    if (!error) setServicos((prev) => prev.filter((s) => s.id !== id));
    else alert("Erro ao excluir: " + error.message);
  };

  const handleEditar = (servico: Servico) => {
    alert("Funcionalidade de edição não implementada neste exemplo.");
  };

  if (loading) return <Typography>Carregando...</Typography>;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
      <Typography
        variant="h5"
        align="center"
        sx={{ mb: 3, color: "white", fontWeight: 700 }}
      >
        Serviços cadastrados
      </Typography>
      {isMaster && (
        <FormControl
          fullWidth
          sx={{
            mb: 3,
            bgcolor: "#fff",
            borderRadius: 2,
          }}
        >
          <InputLabel>Filtrar por Empresa</InputLabel>
          <Select
            value={empresaFiltro}
            label="Filtrar por Empresa"
            onChange={(e) => setEmpresaFiltro(e.target.value)}
            sx={{
              bgcolor: "#fff",
              borderRadius: 2,
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  bgcolor: "#fff",
                },
              },
            }}
          >
            <MenuItem value="">Todas</MenuItem>
            {empresas.map((emp) => (
              <MenuItem key={emp.id} value={emp.id}>
                {emp.nome}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      {servicos.length === 0 ? (
        <Typography align="center" color="white">
          Nenhum serviço cadastrado.
        </Typography>
      ) : (
        <Grid container spacing={4}>
          {servicos.map((servico) => (
            <Grid item xs={12} md={6} key={servico.id}>
              <Card
                elevation={4}
                sx={{
                  borderRadius: 3,
                  minWidth: 340,
                  maxWidth: 600,
                  margin: "0 auto",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: "100%",
                }}
              >
                <CardHeader
                  title={
                    <Typography
                      variant="h6"
                      sx={{
                        color: "#0A1929",
                        fontWeight: 700,
                        textAlign: "center",
                        fontSize: "1.2rem",
                        letterSpacing: 0.5,
                      }}
                    >
                      {servico.nome}
                    </Typography>
                  }
                  sx={{
                    bgcolor: "rgba(10, 25, 41, 0.08)",
                    p: 2,
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                  }}
                />
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: 1,
                    textAlign: "center",
                    px: 3,
                    py: 2,
                  }}
                >
                  <Typography variant="body2" sx={{ color: "#222", mb: 1 }}>
                    Valor:{" "}
                    <strong>
                      {servico.valor?.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </strong>
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#222", mb: 1 }}>
                    Descrição: <strong>{servico.descricao}</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#222", mb: 1 }}>
                    Duração: <strong>{servico.duracao_minutos} min</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#222" }}>
                    Empresa:{" "}
                    <strong>
                      {servico.usuarios?.nome || "Não encontrado"}
                    </strong>
                  </Typography>
                </CardContent>
                <CardActions
                  sx={{
                    justifyContent: "center",
                    width: "100%",
                    borderTop: "1px solid #eee",
                    py: 1,
                  }}
                >
                  <IconButton
                    color="primary"
                    aria-label="Editar serviço"
                    title="Editar serviço"
                    onClick={() => handleEditar(servico)}
                  >
                    <EditIcon fontSize="medium" />
                  </IconButton>
                  <IconButton
                    color="error"
                    aria-label="Excluir serviço"
                    title="Excluir serviço"
                    onClick={() => handleExcluir(servico.id)}
                  >
                    <DeleteIcon fontSize="medium" />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

export default ListarServicos;
