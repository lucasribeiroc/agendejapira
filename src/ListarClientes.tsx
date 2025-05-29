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
  TextField,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { supabase } from "./supabaseClient";

function ListarClientes() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [empresaFiltro, setEmpresaFiltro] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Modal de edição
  const [editOpen, setEditOpen] = useState(false);
  const [editCliente, setEditCliente] = useState<any | null>(null);
  const [editFields, setEditFields] = useState({
    nome: "",
    telefone: "",
    email: "",
    endereco: "",
    numero: "",
    bairro: "",
    cidade: "",
    uf: "",
    cep: "",
    rg: "",
    cpf: "",
  });

  // Modal de confirmação de edição
  const [confirmEditOpen, setConfirmEditOpen] = useState(false);

  // Modal de confirmação de exclusão
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

  // Editar cliente
  const handleEdit = (cli: any) => {
    setEditCliente(cli);
    setEditFields({
      nome: cli.nome || "",
      telefone: cli.telefone || "",
      email: cli.email || "",
      endereco: cli.endereco || "",
      numero: cli.numero || "",
      bairro: cli.bairro || "",
      cidade: cli.cidade || "",
      uf: cli.uf || "",
      cep: cli.cep || "",
      rg: cli.rg || "",
      cpf: cli.cpf || "",
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
    if (!editCliente) return;
    const {
      nome,
      telefone,
      email,
      endereco,
      numero,
      bairro,
      cidade,
      uf,
      cep,
      rg,
      cpf,
    } = editFields;
    const { error } = await supabase
      .from("clientes")
      .update({
        nome,
        telefone,
        email,
        endereco,
        numero,
        bairro,
        cidade,
        uf,
        cep,
        rg,
        cpf,
      })
      .eq("id", editCliente.id);
    if (!error) {
      setClientes((prev) =>
        prev.map((c) =>
          c.id === editCliente.id
            ? {
                ...c,
                nome,
                telefone,
                email,
                endereco,
                numero,
                bairro,
                cidade,
                uf,
                cep,
                rg,
                cpf,
              }
            : c
        )
      );
      setEditOpen(false);
      setEditCliente(null);
      setConfirmEditOpen(false);
    } else {
      alert("Erro ao atualizar: " + error.message);
      setConfirmEditOpen(false);
    }
  };

  const handleEditCancel = () => {
    setEditOpen(false);
    setEditCliente(null);
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
                        onClick={() => handleEdit(cli)}
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

      {/* Modal de edição */}
      <Dialog
        open={editOpen}
        onClose={handleEditCancel}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Editar Cliente</DialogTitle>
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
            label="Telefone"
            name="telefone"
            value={editFields.telefone}
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
            label="Endereço"
            name="endereco"
            value={editFields.endereco}
            onChange={handleEditFieldChange}
            fullWidth
          />
          <TextField
            label="Número"
            name="numero"
            value={editFields.numero}
            onChange={handleEditFieldChange}
            fullWidth
          />
          <TextField
            label="Bairro"
            name="bairro"
            value={editFields.bairro}
            onChange={handleEditFieldChange}
            fullWidth
          />
          <TextField
            label="Cidade"
            name="cidade"
            value={editFields.cidade}
            onChange={handleEditFieldChange}
            fullWidth
          />
          <TextField
            label="UF"
            name="uf"
            value={editFields.uf}
            onChange={handleEditFieldChange}
            fullWidth
          />
          <TextField
            label="CEP"
            name="cep"
            value={editFields.cep}
            onChange={handleEditFieldChange}
            fullWidth
          />
          <TextField
            label="RG"
            name="rg"
            value={editFields.rg}
            onChange={handleEditFieldChange}
            fullWidth
          />
          <TextField
            label="CPF"
            name="cpf"
            value={editFields.cpf}
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
            Tem certeza que deseja salvar as alterações deste cliente?
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
    </Box>
  );
}

export default ListarClientes;
