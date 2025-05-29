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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
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

  // Modal de edição
  const [editOpen, setEditOpen] = useState(false);
  const [editServico, setEditServico] = useState<Servico | null>(null);
  const [editFields, setEditFields] = useState({
    nome: "",
    valor: "",
    descricao: "",
    duracao_minutos: "",
  });

  // Modal de confirmação de edição
  const [confirmEditOpen, setConfirmEditOpen] = useState(false);

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
    setEditServico(servico);
    setEditFields({
      nome: servico.nome,
      valor: String(servico.valor),
      descricao: servico.descricao,
      duracao_minutos: String(servico.duracao_minutos),
    });
    setEditOpen(true);
  };

  const handleEditFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditFields((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Ao clicar em salvar, abre o modal de confirmação
  const handleEditSave = () => {
    setConfirmEditOpen(true);
  };

  // Confirma a edição e salva no banco
  const handleConfirmEdit = async () => {
    if (!editServico) return;
    const { nome, valor, descricao, duracao_minutos } = editFields;
    const { error } = await supabase
      .from("servicos")
      .update({
        nome,
        valor: Number(valor),
        descricao,
        duracao_minutos: Number(duracao_minutos),
      })
      .eq("id", editServico.id);
    if (!error) {
      setServicos((prev) =>
        prev.map((s) =>
          s.id === editServico.id
            ? {
                ...s,
                nome,
                valor: Number(valor),
                descricao,
                duracao_minutos: Number(duracao_minutos),
              }
            : s
        )
      );
      setEditOpen(false);
      setEditServico(null);
      setConfirmEditOpen(false);
    } else {
      alert("Erro ao atualizar: " + error.message);
      setConfirmEditOpen(false);
    }
  };

  const handleEditCancel = () => {
    setEditOpen(false);
    setEditServico(null);
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
        <Grid container spacing={4} justifyContent="center">
          {servicos.map((servico) => (
            <Grid
              item
              xs={12}
              md={6}
              key={servico.id}
              sx={{ display: "flex", justifyContent: "center" }}
            >
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

      {/* Modal de edição */}
      <Dialog
        open={editOpen}
        onClose={handleEditCancel}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Editar Serviço</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          <TextField
            label="Nome"
            name="nome"
            value={editFields.nome}
            onChange={handleEditFieldChange}
            fullWidth
          />
          <TextField
            label="Valor"
            name="valor"
            type="number"
            value={editFields.valor}
            onChange={handleEditFieldChange}
            fullWidth
          />
          <TextField
            label="Descrição"
            name="descricao"
            value={editFields.descricao}
            onChange={handleEditFieldChange}
            fullWidth
          />
          <TextField
            label="Duração (minutos)"
            name="duracao_minutos"
            type="number"
            value={editFields.duracao_minutos}
            onChange={handleEditFieldChange}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditCancel} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleEditSave} color="primary" variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de confirmação de edição */}
      <Dialog
        open={confirmEditOpen}
        onClose={() => setConfirmEditOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirmar Alteração</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja salvar as alterações deste serviço?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmEditOpen(false)} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmEdit}
            color="primary"
            variant="contained"
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default ListarServicos;
