import {
  Box,
  Container,
  Typography,
  Paper,
  IconButton,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

function ListarAgendamento() {
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [empresaFiltro, setEmpresaFiltro] = useState<string>("");
  const [clientes, setClientes] = useState<any[]>([]);
  const [servicos, setServicos] = useState<any[]>([]);
  const usuario_id = localStorage.getItem("usuario_id");
  const isMaster = localStorage.getItem("is_master") === "true";

  // Modal de confirmação de exclusão
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    id?: string;
  }>({ open: false });

  // Modal de edição
  const [editOpen, setEditOpen] = useState(false);
  const [editAgendamento, setEditAgendamento] = useState<any | null>(null);
  const [editFields, setEditFields] = useState({
    data_hora: "",
    observacoes: "",
    cliente_id: "",
    servico_id: "",
    status: "aberto",
  });
  const [confirmEditOpen, setConfirmEditOpen] = useState(false);

  // Buscar empresas (para filtro master)
  useEffect(() => {
    if (isMaster) {
      supabase
        .from("usuarios")
        .select("id, nome")
        .then(({ data }) => setEmpresas(data || []));
    }
  }, [isMaster]);

  // Buscar clientes e serviços para edição
  useEffect(() => {
    let filtroUsuario = isMaster ? empresaFiltro || usuario_id : usuario_id;

    if (filtroUsuario) {
      supabase
        .from("clientes")
        .select("id, nome")
        .eq("usuario_id", filtroUsuario)
        .then(({ data }) => setClientes(data || []));
      supabase
        .from("servicos")
        .select("id, nome")
        .eq("usuario_id", filtroUsuario)
        .then(({ data }) => setServicos(data || []));
    }
  }, [isMaster, usuario_id, empresaFiltro, editOpen]);

  // Buscar agendamentos
  const fetchAgendamentos = async () => {
    let query = supabase
      .from("agendamentos")
      .select(
        `
        id,
        data_hora,
        observacoes,
        usuario_id,
        cliente_id,
        servico_id,
        status,
        clientes:cliente_id (
          id,
          nome,
          telefone,
          email,
          endereco,
          numero,
          bairro,
          cidade,
          uf,
          cep
        ),
        servicos:servico_id (
          id,
          nome,
          valor,
          duracao_minutos
        )
      `
      )
      .order("data_hora", { ascending: true });

    if (isMaster) {
      if (empresaFiltro) {
        query = query.eq("usuario_id", empresaFiltro);
      }
    } else {
      query = query.eq("usuario_id", usuario_id);
    }

    const { data } = await query;
    setAgendamentos(data || []);
  };

  useEffect(() => {
    fetchAgendamentos();
    // eslint-disable-next-line
  }, [isMaster, usuario_id, empresaFiltro]);

  const handleExcluir = async (id: string) => {
    await supabase.from("agendamentos").delete().eq("id", id);
    await fetchAgendamentos();
    setConfirmDialog({ open: false });
  };

  // Abrir modal de edição
  const handleEditar = (agendamento: any) => {
    setEditAgendamento(agendamento);
    setEditFields({
      data_hora: agendamento.data_hora
        ? agendamento.data_hora.slice(0, 16)
        : "",
      observacoes: agendamento.observacoes || "",
      cliente_id: agendamento.cliente_id || "",
      servico_id: agendamento.servico_id || "",
      status: agendamento.status || "aberto",
    });
    setEditOpen(true);
  };

  const handleEditFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    setEditFields((prev) => ({
      ...prev,
      [name as string]: value,
    }));
  };

  // Ao clicar em salvar, abre o modal de confirmação
  const handleEditSave = () => {
    setConfirmEditOpen(true);
  };

  // Confirma a edição e salva no banco
  const handleConfirmEdit = async () => {
    if (!editAgendamento) return;
    const { data_hora, observacoes, cliente_id, servico_id, status } =
      editFields;
    const { error } = await supabase
      .from("agendamentos")
      .update({
        data_hora,
        observacoes,
        cliente_id,
        servico_id,
        status,
      })
      .eq("id", editAgendamento.id);
    if (!error) {
      await fetchAgendamentos();
      setEditOpen(false);
      setEditAgendamento(null);
      setConfirmEditOpen(false);
    } else {
      alert("Erro ao atualizar: " + error.message);
      setConfirmEditOpen(false);
    }
  };

  const handleEditCancel = () => {
    setEditOpen(false);
    setEditAgendamento(null);
  };

  // Alterar status direto na listagem
  const handleStatusChange = async (id: string, status: string) => {
    await supabase.from("agendamentos").update({ status }).eq("id", id);
    await fetchAgendamentos();
  };

  // Função para cor do status
  const statusColor = (status: string) => {
    switch (status) {
      case "aberto":
        return "orange";
      case "em_atendimento":
        return "blue";
      case "concluido":
        return "green";
      case "cancelado":
        return "red";
      default:
        return "grey";
    }
  };

  // Função para label do status
  const statusLabel = (status: string) => {
    switch (status) {
      case "aberto":
        return "Aberto";
      case "em_atendimento":
        return "Em atendimento";
      case "concluido":
        return "Concluído";
      case "cancelado":
        return "Cancelado";
      default:
        return status;
    }
  };

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="md">
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography
            variant="h5"
            fontWeight={700}
            align="center"
            sx={{ mb: 2 }}
          >
            {isMaster ? "Agendamentos das Empresas" : "Meus Agendamentos"}
          </Typography>

          {/* Filtro para master */}
          {isMaster && (
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Filtrar por Empresa</InputLabel>
              <Select
                value={empresaFiltro}
                label="Filtrar por Empresa"
                onChange={(e) => setEmpresaFiltro(e.target.value)}
                sx={{ bgcolor: "#fff", borderRadius: 2 }}
                MenuProps={{
                  PaperProps: {
                    sx: { bgcolor: "#fff" },
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

          {agendamentos.length === 0 ? (
            <Typography align="center" sx={{ mt: 4 }}>
              Nenhum agendamento encontrado.
            </Typography>
          ) : (
            <Stack spacing={3}>
              {agendamentos.map((a) => (
                <Paper
                  key={a.id}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "#f8fafc",
                    boxShadow: 1,
                    position: "relative",
                  }}
                >
                  {/* Status no topo direito */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 16,
                      right: 16,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <span
                      style={{
                        color: statusColor(a.status),
                        fontWeight: 700,
                        fontSize: 16,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
                    >
                      {statusLabel(a.status)}
                    </span>
                    {(isMaster || true) && (
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={a.status || "aberto"}
                          label="Status"
                          onChange={(e) =>
                            handleStatusChange(a.id, e.target.value)
                          }
                        >
                          <MenuItem value="aberto">Aberto</MenuItem>
                          <MenuItem value="em_atendimento">
                            Em atendimento
                          </MenuItem>
                          <MenuItem value="concluido">Concluído</MenuItem>
                          <MenuItem value="cancelado">Cancelado</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      justifyContent: "space-between",
                      alignItems: { sm: "center" },
                      gap: 2,
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      {/* ...dados do agendamento... */}
                      <Typography
                        variant="subtitle2"
                        color="primary"
                        fontWeight={700}
                      >
                        Data/Hora:
                      </Typography>
                      <Typography>
                        {new Date(a.data_hora).toLocaleString("pt-BR")}
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        color="primary"
                        sx={{ mt: 1 }}
                        fontWeight={700}
                      >
                        Cliente:
                      </Typography>
                      <Typography>
                        <b>{a.clientes?.nome}</b>
                        <br />
                        <small>
                          {a.clientes?.telefone}
                          {a.clientes?.email ? ` | ${a.clientes.email}` : ""}
                        </small>
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        color="primary"
                        sx={{ mt: 1 }}
                        fontWeight={700}
                      >
                        Serviço:
                      </Typography>
                      <Typography>
                        {a.servicos?.nome}
                        <br />
                        <small>
                          {a.servicos?.duracao_minutos
                            ? `${a.servicos.duracao_minutos} min`
                            : ""}
                        </small>
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        color="primary"
                        sx={{ mt: 1 }}
                        fontWeight={700}
                      >
                        Valor:
                      </Typography>
                      <Typography>
                        {a.servicos?.valor
                          ? `R$ ${Number(a.servicos.valor).toLocaleString(
                              "pt-BR",
                              { minimumFractionDigits: 2 }
                            )}`
                          : ""}
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        color="primary"
                        sx={{ mt: 1 }}
                        fontWeight={700}
                      >
                        Endereço:
                      </Typography>
                      <Typography>
                        {a.clientes?.endereco
                          ? `${a.clientes.endereco}${
                              a.clientes.numero
                                ? ", Nº " + a.clientes.numero
                                : ""
                            }, ${a.clientes.bairro}, ${a.clientes.cidade} - ${
                              a.clientes.uf
                            }, CEP: ${a.clientes.cep}`
                          : "-"}
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        color="primary"
                        sx={{ mt: 1 }}
                        fontWeight={700}
                      >
                        Observações:
                      </Typography>
                      <Typography>{a.observacoes || "-"}</Typography>
                    </Box>
                    <Box sx={{ minWidth: 100, textAlign: "center" }}>
                      <IconButton
                        color="primary"
                        onClick={() => handleEditar(a)}
                        title="Editar"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() =>
                          setConfirmDialog({ open: true, id: a.id })
                        }
                        title="Excluir"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Stack>
          )}

          {/* Dialog de confirmação de exclusão */}
          <Dialog
            open={confirmDialog.open}
            onClose={() => setConfirmDialog({ open: false })}
          >
            <DialogTitle>Excluir Agendamento</DialogTitle>
            <DialogContent>
              Tem certeza que deseja excluir este agendamento? Esta ação não
              pode ser desfeita.
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setConfirmDialog({ open: false })}>
                Cancelar
              </Button>
              <Button
                color="error"
                onClick={() => handleExcluir(confirmDialog.id!)}
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
            <DialogTitle>Editar Agendamento</DialogTitle>
            <DialogContent
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
            >
              <TextField
                label="Data/Hora"
                name="data_hora"
                type="datetime-local"
                value={editFields.data_hora}
                onChange={handleEditFieldChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <FormControl fullWidth>
                <InputLabel>Cliente</InputLabel>
                <Select
                  name="cliente_id"
                  value={editFields.cliente_id}
                  label="Cliente"
                  onChange={handleEditFieldChange}
                >
                  {clientes.map((cli) => (
                    <MenuItem key={cli.id} value={cli.id}>
                      {cli.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Serviço</InputLabel>
                <Select
                  name="servico_id"
                  value={editFields.servico_id}
                  label="Serviço"
                  onChange={handleEditFieldChange}
                >
                  {servicos.map((serv) => (
                    <MenuItem key={serv.id} value={serv.id}>
                      {serv.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={editFields.status}
                  label="Status"
                  onChange={handleEditFieldChange}
                >
                  <MenuItem value="aberto">Aberto</MenuItem>
                  <MenuItem value="em_atendimento">Em atendimento</MenuItem>
                  <MenuItem value="concluido">Concluído</MenuItem>
                  <MenuItem value="cancelado">Cancelado</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Observações"
                name="observacoes"
                value={editFields.observacoes}
                onChange={handleEditFieldChange}
                fullWidth
                multiline
                minRows={2}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleEditCancel} color="inherit">
                Cancelar
              </Button>
              <Button
                onClick={handleEditSave}
                color="primary"
                variant="contained"
              >
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
                Tem certeza que deseja salvar as alterações deste agendamento?
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
        </Paper>
      </Container>
    </Box>
  );
}

export default ListarAgendamento;
