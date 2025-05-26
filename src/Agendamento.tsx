import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

function Agendamento() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [servicos, setServicos] = useState<any[]>([]);
  const [clienteId, setClienteId] = useState("");
  const [servicoId, setServicoId] = useState("");
  const [dataHora, setDataHora] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [openCliente, setOpenCliente] = useState(false);
  const [openServico, setOpenServico] = useState(false);

  // Campos para cadastro rápido de cliente/serviço
  const [novoCliente, setNovoCliente] = useState({ nome: "", telefone: "" });
  const [novoServico, setNovoServico] = useState({ nome: "", valor: "" });

  const usuario_id = localStorage.getItem("usuario_id");
  const isMaster = localStorage.getItem("is_master") === "true";
  if (isMaster) return null;

  // Buscar clientes e serviços da empresa
  useEffect(() => {
    supabase
      .from("clientes")
      .select("id, nome, telefone, email")
      .eq("usuario_id", usuario_id)
      .then(({ data }) => setClientes(data || []));
    supabase
      .from("servicos")
      .select("id, nome, valor, duracao_minutos")
      .eq("usuario_id", usuario_id)
      .then(({ data }) => setServicos(data || []));
  }, [usuario_id]);

  // Cadastro rápido de cliente
  const handleNovoCliente = async () => {
    if (!novoCliente.nome.trim()) return;
    const { data, error } = await supabase
      .from("clientes")
      .insert([
        { nome: novoCliente.nome, telefone: novoCliente.telefone, usuario_id },
      ])
      .select();
    if (!error && data && data[0]) {
      setClientes((prev) => [...prev, data[0]]);
      setClienteId(data[0].id);
      setOpenCliente(false);
      setNovoCliente({ nome: "", telefone: "" });
    }
  };

  // Cadastro rápido de serviço
  const handleNovoServico = async () => {
    if (!novoServico.nome.trim() || !novoServico.valor.trim()) return;
    const { data, error } = await supabase
      .from("servicos")
      .insert([
        {
          nome: novoServico.nome,
          valor: parseFloat(novoServico.valor.replace(",", ".")),
          usuario_id,
        },
      ])
      .select();
    if (!error && data && data[0]) {
      setServicos((prev) => [...prev, data[0]]);
      setServicoId(data[0].id);
      setOpenServico(false);
      setNovoServico({ nome: "", valor: "" });
    }
  };

  // Cadastrar agendamento
  const handleAgendar = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (!clienteId || !servicoId || !dataHora) {
      setMsg("Preencha todos os campos obrigatórios.");
      return;
    }
    const { error } = await supabase.from("agendamentos").insert([
      {
        cliente_id: clienteId,
        servico_id: servicoId,
        data_hora: dataHora,
        observacoes,
        usuario_id,
      },
    ]);
    if (error) setMsg("Erro ao agendar: " + error.message);
    else {
      setMsg("Agendamento realizado com sucesso!");
      setClienteId("");
      setServicoId("");
      setDataHora("");
      setObservacoes("");
    }
  };

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="sm">
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography
            variant="h5"
            fontWeight={700}
            align="center"
            sx={{ mb: 2 }}
          >
            Novo Agendamento
          </Typography>
          <Box component="form" onSubmit={handleAgendar}>
            <TextField
              label="Data e Hora"
              type="datetime-local"
              fullWidth
              required
              margin="normal"
              value={dataHora}
              onChange={(e) => setDataHora(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              select
              label="Cliente"
              fullWidth
              required
              margin="normal"
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              SelectProps={{
                native: false,
              }}
            >
              {clientes.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.nome} {c.telefone ? `- ${c.telefone}` : ""}
                </MenuItem>
              ))}
              <MenuItem value="" disabled>
                ————————————————
              </MenuItem>
              <MenuItem value="" onClick={() => setOpenCliente(true)}>
                + Cadastrar novo cliente
              </MenuItem>
            </TextField>
            <TextField
              select
              label="Serviço"
              fullWidth
              required
              margin="normal"
              value={servicoId}
              onChange={(e) => setServicoId(e.target.value)}
              SelectProps={{
                native: false,
              }}
            >
              {servicos.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.nome} {s.valor ? `- R$ ${s.valor}` : ""}
                </MenuItem>
              ))}
              <MenuItem value="" disabled>
                ————————————————
              </MenuItem>
              <MenuItem value="" onClick={() => setOpenServico(true)}>
                + Cadastrar novo serviço
              </MenuItem>
            </TextField>
            <TextField
              label="Observações"
              fullWidth
              margin="normal"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              multiline
              minRows={2}
              maxRows={4}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2, fontWeight: 600, borderRadius: 2 }}
            >
              Agendar
            </Button>
            {msg && (
              <Typography
                sx={{ mt: 2, textAlign: "center" }}
                color={msg.includes("sucesso") ? "success.main" : "error"}
              >
                {msg}
              </Typography>
            )}
          </Box>
        </Paper>
      </Container>

      {/* Dialog para novo cliente */}
      <Dialog open={openCliente} onClose={() => setOpenCliente(false)}>
        <DialogTitle>Novo Cliente</DialogTitle>
        <DialogContent>
          <TextField
            label="Nome"
            fullWidth
            margin="normal"
            value={novoCliente.nome}
            onChange={(e) =>
              setNovoCliente({ ...novoCliente, nome: e.target.value })
            }
          />
          <TextField
            label="Telefone"
            fullWidth
            margin="normal"
            value={novoCliente.telefone}
            onChange={(e) =>
              setNovoCliente({ ...novoCliente, telefone: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCliente(false)}>Cancelar</Button>
          <Button onClick={handleNovoCliente} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para novo serviço */}
      <Dialog open={openServico} onClose={() => setOpenServico(false)}>
        <DialogTitle>Novo Serviço</DialogTitle>
        <DialogContent>
          <TextField
            label="Nome"
            fullWidth
            margin="normal"
            value={novoServico.nome}
            onChange={(e) =>
              setNovoServico({ ...novoServico, nome: e.target.value })
            }
          />
          <TextField
            label="Valor"
            fullWidth
            margin="normal"
            value={novoServico.valor}
            onChange={(e) =>
              setNovoServico({
                ...novoServico,
                valor: e.target.value.replace(/[^0-9.,]/g, ""),
              })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenServico(false)}>Cancelar</Button>
          <Button onClick={handleNovoServico} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Agendamento;
