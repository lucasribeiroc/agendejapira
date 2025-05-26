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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

function ListarAgendamento() {
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [empresaFiltro, setEmpresaFiltro] = useState<string>("");
  const usuario_id = localStorage.getItem("usuario_id");
  const isMaster = localStorage.getItem("is_master") === "true";

  // Buscar empresas para filtro (apenas para master)
  useEffect(() => {
    if (isMaster) {
      supabase
        .from("usuarios")
        .select("id, nome")
        .then(({ data }) => setEmpresas(data || []));
    }
  }, [isMaster]);

  // Buscar agendamentos
  useEffect(() => {
    let query = supabase
      .from("agendamentos")
      .select(
        `
        id,
        data_hora,
        observacoes,
        usuario_id,
        clientes:cliente_id (
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

    query.then(({ data }) => setAgendamentos(data || []));
  }, [isMaster, usuario_id, empresaFiltro]);

  const handleExcluir = async (id: string) => {
    if (!window.confirm("Deseja excluir este agendamento?")) return;
    await supabase.from("agendamentos").delete().eq("id", id);
    setAgendamentos((prev) => prev.filter((a) => a.id !== id));
  };

  const handleEditar = (id: string) => {
    window.location.href = `/dashboard/editar-agendamento/${id}`;
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
                  }}
                >
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
                        onClick={() => handleEditar(a.id)}
                        title="Editar"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleExcluir(a.id)}
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
        </Paper>
      </Container>
    </Box>
  );
}

export default ListarAgendamento;
