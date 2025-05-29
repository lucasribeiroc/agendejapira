import {
  Typography,
  Card,
  CardContent,
  CardActions,
  CardHeader,
  Grid,
  Container,
  IconButton,
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

interface Empresa {
  id: number;
  nome: string;
  email: string;
  telefone: string;
}

function ListarEmpresas() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal de edição
  const [editOpen, setEditOpen] = useState(false);
  const [editEmpresa, setEditEmpresa] = useState<Empresa | null>(null);
  const [editFields, setEditFields] = useState({
    nome: "",
    email: "",
    telefone: "",
  });

  // Modal de confirmação de edição
  const [confirmEditOpen, setConfirmEditOpen] = useState(false);

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
    setEditEmpresa(empresa);
    setEditFields({
      nome: empresa.nome,
      email: empresa.email,
      telefone: empresa.telefone,
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
    if (!editEmpresa) return;
    const { nome, email, telefone } = editFields;
    const { error } = await supabase
      .from("usuarios")
      .update({
        nome,
        email,
        telefone,
      })
      .eq("id", editEmpresa.id);
    if (!error) {
      setEmpresas((prev) =>
        prev.map((e) =>
          e.id === editEmpresa.id ? { ...e, nome, email, telefone } : e
        )
      );
      setEditOpen(false);
      setEditEmpresa(null);
      setConfirmEditOpen(false);
    } else {
      alert("Erro ao atualizar: " + error.message);
      setConfirmEditOpen(false);
    }
  };

  const handleEditCancel = () => {
    setEditOpen(false);
    setEditEmpresa(null);
  };

  if (loading) return <Typography>Carregando...</Typography>;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
      <Typography
        variant="h5"
        align="center"
        sx={{ mb: 3, color: "white", fontWeight: 700 }}
      >
        Empresas cadastradas
      </Typography>
      {empresas.length === 0 ? (
        <Typography align="center" color="white">
          Nenhuma empresa cadastrada.
        </Typography>
      ) : (
        <Grid container spacing={4} justifyContent="center">
          {empresas.map((empresa) => (
            <Grid
              item
              xs={12}
              md={6}
              key={empresa.id}
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
                      {empresa.nome}
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
                    {empresa.email}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#222" }}>
                    {empresa.telefone}
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
                    aria-label="Editar empresa"
                    title="Editar empresa"
                    onClick={() => handleEditar(empresa)}
                  >
                    <EditIcon fontSize="medium" />
                  </IconButton>
                  <IconButton
                    color="error"
                    aria-label="Excluir empresa"
                    title="Excluir empresa"
                    onClick={() => handleExcluir(empresa.id)}
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
        <DialogTitle>Editar Empresa</DialogTitle>
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
            label="Email"
            name="email"
            value={editFields.email}
            onChange={handleEditFieldChange}
            fullWidth
          />
          <TextField
            label="Telefone"
            name="telefone"
            value={editFields.telefone}
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
            Tem certeza que deseja salvar as alterações desta empresa?
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

export default ListarEmpresas;
