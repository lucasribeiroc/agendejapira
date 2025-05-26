import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { supabase } from "./supabaseClient";

function ListarClientes() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [empresaFiltro, setEmpresaFiltro] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    id?: string;
  }>({ open: false });

  const isMaster = localStorage.getItem("is_master") === "true";
  const usuario_id = localStorage.getItem("usuario_id");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      let query = supabase
        .from("clientes")
        .select("*, usuarios:usuario_id (nome)");
      if (!isMaster) {
        query = query.eq("usuario_id", usuario_id);
      }
      const { data, error } = await query;
      if (!error) setClientes(data || []);
      setLoading(false);
    };

    fetchData();
  }, [isMaster, usuario_id, empresaFiltro]);

  // Para master, buscar empresas para filtro
  useEffect(() => {
    if (isMaster) {
      supabase
        .from("usuarios")
        .select("id, nome")
        .then(({ data }) => setEmpresas(data || []));
    }
  }, [isMaster]);

  // Filtro para master
  const clientesFiltrados =
    isMaster && empresaFiltro
      ? clientes.filter((c) => c.usuario_id === empresaFiltro)
      : clientes;

  // Agrupar clientes por empresa (para master)
  const agrupados = isMaster
    ? clientesFiltrados.reduce((acc, cli) => {
        const empresa = cli.usuarios?.nome || "Sem empresa";
        if (!acc[empresa]) acc[empresa] = [];
        acc[empresa].push(cli);
        return acc;
      }, {} as Record<string, any[]>)
    : { "Meus Clientes": clientesFiltrados };

  // Excluir cliente
  const handleDelete = async (id: string) => {
    setLoading(true);
    await supabase.from("clientes").delete().eq("id", id);
    setClientes((prev) => prev.filter((c) => c.id !== id));
    setLoading(false);
    setConfirmDialog({ open: false });
  };

  // Editar cliente (implemente a navegação para tela de edição se desejar)
  const handleEdit = (id: string) => {
    window.location.href = `/dashboard/editar-cliente/${id}`;
  };

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} align="center" sx={{ mb: 3 }}>
        Lista de Clientes
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
      {loading ? (
        <Typography align="center">Carregando...</Typography>
      ) : (
        Object.entries(agrupados).map(([empresa, lista]) => (
          <Box key={empresa} sx={{ mb: 4 }}>
            {isMaster && (
              <Typography variant="h6" sx={{ mb: 2, color: "primary.main" }}>
                {empresa}
              </Typography>
            )}
            <Grid
              container
              spacing={2}
              justifyContent={lista.length <= 2 ? "center" : "flex-start"}
            >
              {lista.length === 0 && (
                <Typography sx={{ ml: 2 }}>
                  Nenhum cliente encontrado.
                </Typography>
              )}
              {lista.map((cli) => (
                <Grid item xs={12} sm={6} md={4} key={cli.id}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      display: "flex",
                      flexDirection: "column",
                      height: 380,
                      minHeight: 380,
                      maxHeight: 380,
                      justifyContent: "space-between",
                      width: 340,
                      maxWidth: 340,
                      mx: "auto",
                    }}
                  >
                    <CardHeader
                      title={cli.nome}
                      titleTypographyProps={{
                        fontWeight: 700,
                        fontSize: 20,
                        align: "left",
                      }}
                      sx={{
                        bgcolor: "#f5faff",
                        color: "primary.main",
                        pb: 1,
                        pt: 2,
                        minHeight: 60,
                        textAlign: "left",
                      }}
                    />
                    <CardContent
                      sx={{
                        flex: 1,
                        minHeight: 220,
                        maxHeight: 220,
                        overflow: "hidden",
                      }}
                    >
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        <b>Telefone:</b> {cli.telefone}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        <b>Email:</b> {cli.email}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        <b>Endereço:</b> {cli.endereco}
                        {cli.numero && `, Nº ${cli.numero}`}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        <b>Bairro:</b> {cli.bairro}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        <b>Cidade:</b> {cli.cidade} - {cli.uf}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        <b>CEP:</b> {cli.cep}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        <b>RG:</b> {cli.rg ?? "-"}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        <b>CPF:</b> {cli.cpf ?? "-"}
                      </Typography>
                    </CardContent>
                    <CardActions
                      sx={{
                        justifyContent: "flex-end",
                        bgcolor: "#f5f5f5",
                        minHeight: 56,
                      }}
                    >
                      <IconButton
                        color="primary"
                        onClick={() => handleEdit(cli.id)}
                        title="Editar"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() =>
                          setConfirmDialog({ open: true, id: cli.id })
                        }
                        title="Excluir"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))
      )}

      {/* Dialog de confirmação de exclusão */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false })}
      >
        <DialogTitle>Excluir Cliente</DialogTitle>
        <DialogContent>
          Tem certeza que deseja excluir este cliente? Esta ação não pode ser
          desfeita.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false })}>
            Cancelar
          </Button>
          <Button
            color="error"
            onClick={() => handleDelete(confirmDialog.id!)}
            variant="contained"
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ListarClientes;
