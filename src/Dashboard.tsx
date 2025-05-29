import {
  ThemeProvider,
  CssBaseline,
  Container,
  Box,
  Typography,
  AppBar,
  Toolbar,
  Button,
  Link,
  Stack,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Paper,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LogoutIcon from "@mui/icons-material/Logout";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BusinessIcon from "@mui/icons-material/Business";
import ListAltIcon from "@mui/icons-material/ListAlt";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import EventNoteIcon from "@mui/icons-material/EventNote";
import {
  Link as RouterLink,
  useNavigate,
  useLocation,
  Outlet,
} from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "./supabaseClient";
import theme from "./theme";
import DashboardMasterStats from "./DashboardMasterStats";
import { format, addDays, subDays, isAfter, isBefore } from "date-fns";
import { RealtimeChannel } from "@supabase/supabase-js";

const drawerWidth = 220;
const drawerCollapsedWidth = 64;

// Função para cor do status (usada para o fundo do status)
const statusBgColor = (status: string) => {
  switch (status) {
    case "aberto":
      return "orange";
    case "em_atendimento":
      return "#1976d2";
    case "concluido":
      return "#388e3c";
    case "cancelado":
      return "#d32f2f";
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

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [empresa, setEmpresa] = useState<string>("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  // Agendamentos
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [realtimeChannel, setRealtimeChannel] =
    useState<RealtimeChannel | null>(null);

  // Limites de paginação
  const today = new Date();
  const minDate = subDays(today, 7);
  const maxDate = addDays(today, 7);

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

  const isMaster = localStorage.getItem("is_master") === "true";

  useEffect(() => {
    const nome = localStorage.getItem("usuario_nome");
    if (nome) {
      setEmpresa(nome);
    } else {
      navigate("/login");
    }
    // Busca o logotipo da empresa (apenas para empresas, não master)
    const usuarioId = localStorage.getItem("usuario_id");
    if (usuarioId && !isMaster) {
      supabase
        .from("usuarios")
        .select("logotipo")
        .eq("id", usuarioId)
        .single()
        .then(({ data }) => {
          setLogoUrl(data?.logotipo || null);
        });
    }
  }, [navigate, isMaster]);

  // Buscar agendamentos do dia corrente para empresas (join correto)
  const fetchAgendamentos = useCallback(() => {
    if (isMaster) return;
    const usuarioId = localStorage.getItem("usuario_id");
    if (!usuarioId) return;

    const start = new Date(currentDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(currentDate);
    end.setHours(23, 59, 59, 999);

    supabase
      .from("agendamentos")
      .select(
        `
          *,
          clientes:cliente_id (
            nome
          ),
          servicos:servico_id (
            nome
          )
        `
      )
      .eq("usuario_id", usuarioId)
      .gte("data_hora", start.toISOString())
      .lte("data_hora", end.toISOString())
      .order("data_hora", { ascending: true })
      .then(({ data }) => setAgendamentos(data || []));
  }, [currentDate, isMaster]);

  useEffect(() => {
    fetchAgendamentos();
  }, [fetchAgendamentos]);

  // Realtime: escuta alterações na tabela agendamentos (canal criado só uma vez)
  useEffect(() => {
    if (isMaster) return;
    const usuarioId = localStorage.getItem("usuario_id");
    if (!usuarioId) return;

    const channel = supabase
      .channel("agendamentos_realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "agendamentos",
          filter: `usuario_id=eq.${usuarioId}`,
        },
        () => {
          fetchAgendamentos();
        }
      )
      .subscribe();

    setRealtimeChannel(channel);

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line
  }, [isMaster, fetchAgendamentos]);

  const handleLogout = async () => {
    localStorage.removeItem("usuario_id");
    localStorage.removeItem("usuario_nome");
    localStorage.removeItem("is_master");
    await supabase.auth.signOut();
    navigate("/login");
  };

  // Atualiza dashboard ao clicar no menu
  const handleRefreshDashboard = () => {
    fetchAgendamentos();
  };

  const menuItems = [
    {
      label: "Dashboard",
      icon: <DashboardIcon />,
      to: "/dashboard",
      show: true,
      onClick: handleRefreshDashboard,
    },
    {
      label: "Cadastrar Serviço",
      icon: <AddCircleOutlineIcon />,
      to: "/dashboard/cadastrar-servico",
      show: !isMaster,
    },
    {
      label: "Cadastrar Empresa",
      icon: <BusinessIcon />,
      to: "/dashboard/cadastro",
      show: isMaster,
    },
    {
      label: "Listar Empresas",
      icon: <PeopleAltIcon />,
      to: "/dashboard/listar-empresas",
      show: isMaster,
    },
    {
      label: "Listar Serviços",
      icon: <FactCheckIcon />,
      to: "/dashboard/listar-servicos",
      show: true,
    },
    {
      label: "Cadastrar Cliente",
      icon: <PersonAddAltIcon />,
      to: "/dashboard/cadastrar-cliente",
      show: !isMaster,
    },
    {
      label: "Listar Clientes",
      icon: <ListAltIcon />,
      to: "/dashboard/listar-clientes",
      show: true,
    },
    {
      label: "Novo Agendamento",
      icon: <EventAvailableIcon />,
      to: "/dashboard/agendar",
      show: !isMaster,
    },
    {
      label: isMaster ? "Agendamentos das Empresas" : "Meus Agendamentos",
      icon: <EventNoteIcon />,
      to: "/dashboard/agendamentos",
      show: true,
    },
  ];

  const isDashboardHome =
    location.pathname === "/dashboard" || location.pathname === "/dashboard/";

  const isFormPage = [
    "/dashboard/cadastrar-servico",
    "/dashboard/cadastro",
    "/dashboard/cadastrar-cliente",
  ].some((path) => location.pathname.startsWith(path));

  let conteudo = null;
  if (isDashboardHome) {
    conteudo = isMaster ? (
      <>
        <Typography
          variant="h3"
          align="center"
          fontWeight={700}
          sx={{ mb: 2, fontFamily: "Montserrat, Arial" }}
        >
          Bem-vindo, Master!
        </Typography>
        <Typography
          variant="h6"
          align="center"
          sx={{ mb: 4, color: "rgba(255,255,255,0.85)" }}
        >
          Veja as estatísticas do sistema em tempo real.
        </Typography>
        <DashboardMasterStats />
      </>
    ) : (
      <>
        <Typography
          variant="h4"
          align="center"
          fontWeight={700}
          sx={{ mb: 2, fontFamily: "Montserrat, Arial" }}
        >
          Agendamentos do dia {format(currentDate, "dd/MM/yyyy")}
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <IconButton
            onClick={() => setCurrentDate(subDays(currentDate, 1))}
            disabled={isBefore(subDays(currentDate, 1), minDate)}
            sx={{ mr: 1, color: "white" }}
            color="primary"
          >
            <ChevronLeftIcon />
          </IconButton>
          <Button
            variant="outlined"
            disabled
            sx={{
              minWidth: 120,
              fontWeight: 700,
              color: "white",
              borderColor: "#1976d2",
              backgroundColor: "transparent",
            }}
          >
            {format(currentDate, "dd/MM/yyyy")}
          </Button>
          <IconButton
            onClick={() => setCurrentDate(addDays(currentDate, 1))}
            disabled={isAfter(addDays(currentDate, 1), maxDate)}
            sx={{ ml: 1, color: "white" }}
            color="primary"
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>
        {agendamentos.length === 0 ? (
          <Typography align="center" sx={{ color: "#ccc" }}>
            Nenhum agendamento para este dia.
          </Typography>
        ) : (
          <Box>
            {agendamentos.map((ag) => (
              <Paper
                key={ag.id}
                sx={{
                  mb: 3,
                  p: 2.5,
                  position: "relative",
                  borderRadius: 3,
                  // Gradiente em azul escuro
                  background:
                    "linear-gradient(135deg, #223a5e 60%, #0a2342 100%)",
                  color: "#fff",
                  boxShadow: "0 4px 24px 0 rgba(34, 58, 94, 0.18)",
                  overflow: "hidden",
                  transition: "transform 0.15s, box-shadow 0.15s",
                  "&:hover": {
                    transform: "translateY(-2px) scale(1.01)",
                    boxShadow: "0 8px 32px 0 rgba(34, 58, 94, 0.28)",
                  },
                }}
              >
                {/* Status no topo direito do card */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 18,
                    right: 18,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    zIndex: 2,
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: statusBgColor(ag.status),
                      color: "#fff",
                      px: 2,
                      py: 0.5,
                      borderRadius: 2,
                      fontWeight: 700,
                      fontSize: 15,
                      boxShadow: 2,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      border: "2px solid #fff",
                    }}
                  >
                    {statusLabel(ag.status)}
                  </Box>
                </Box>
                <Box sx={{ position: "relative", zIndex: 1 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                      letterSpacing: 0.5,
                      color: "#fff",
                      textShadow: "0 1px 4px rgba(0,0,0,0.10)",
                    }}
                  >
                    {ag.servicos?.nome || "Serviço não informado"}
                  </Typography>
                  <Typography sx={{ mb: 0.5 }}>
                    <b>Paciente:</b> {ag.clientes?.nome || "Não informado"}
                  </Typography>
                  <Typography sx={{ mb: 0.5 }}>
                    <b>Data:</b> {format(new Date(ag.data_hora), "dd/MM/yyyy")}
                  </Typography>
                  <Typography sx={{ mb: 0.5 }}>
                    <b>Hora:</b> {format(new Date(ag.data_hora), "HH:mm")}
                  </Typography>
                  <Typography sx={{ mb: 0.5 }}>
                    <b>Observações:</b> {ag.observacoes || "Nenhuma"}
                  </Typography>
                </Box>
                {/* Efeito decorativo de fundo */}
                <Box
                  sx={{
                    position: "absolute",
                    right: -60,
                    bottom: -60,
                    width: 160,
                    height: 160,
                    bgcolor: "rgba(255,255,255,0.10)",
                    borderRadius: "50%",
                    zIndex: 0,
                  }}
                />
              </Paper>
            ))}
          </Box>
        )}
      </>
    );
  } else {
    conteudo = <Outlet />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Header */}
      <AppBar
        position="fixed"
        color="primary"
        elevation={2}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <CalendarMonthIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Agende Já Pira
          </Typography>
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Logout
          </Button>
          <Button color="inherit" startIcon={<ChatBubbleOutlineIcon />}>
            Contato
          </Button>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          bgcolor: "primary.main",
        }}
      >
        <Box sx={{ display: "flex", flex: 1, pt: 8 }}>
          {/* Drawer (Menu Lateral) */}
          <Drawer
            variant="permanent"
            open={drawerOpen}
            sx={{
              width: drawerOpen ? drawerWidth : drawerCollapsedWidth,
              flexShrink: 0,
              "& .MuiDrawer-paper": {
                width: drawerOpen ? drawerWidth : drawerCollapsedWidth,
                boxSizing: "border-box",
                bgcolor: "primary.dark",
                color: "white",
                transition: "width 0.2s",
                overflowX: "hidden",
                position: "relative",
                border: "none",
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
              },
            }}
          >
            {/* Toolbar ainda menor para aproximar os botões do topo */}
            <Toolbar sx={{ minHeight: 4, px: 0 }} />
            {/* Logotipo da empresa (apenas para empresas e quando expandido) */}
            {!isMaster && drawerOpen && logoUrl && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  mt: 0.5,
                  mb: 1,
                  px: 2,
                }}
              >
                <Avatar
                  src={logoUrl}
                  alt="Logotipo da empresa"
                  variant="rounded"
                  sx={{
                    width: 120,
                    height: 35,
                    mb: 1,
                    bgcolor: "#fff",
                    border: "1px solid #eee",
                    objectFit: "contain",
                  }}
                  imgProps={{
                    style: { objectFit: "contain", width: 120, height: 35 },
                  }}
                />
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 14,
                    textAlign: "center",
                    wordBreak: "break-word",
                  }}
                >
                  {empresa}
                </Typography>
              </Box>
            )}
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <List sx={{ mt: 0, pt: 0 }}>
                {menuItems
                  .filter((item) => item.show)
                  .map((item) => (
                    <ListItem
                      key={item.label}
                      disablePadding
                      sx={{
                        display: "block",
                      }}
                    >
                      <ListItemButton
                        component={RouterLink}
                        to={item.to}
                        selected={location.pathname === item.to}
                        sx={{
                          minHeight: 36,
                          justifyContent: drawerOpen ? "initial" : "center",
                          px: 2.5,
                          color: "white",
                        }}
                        title={!drawerOpen ? item.label : undefined}
                        onClick={item.onClick}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 0,
                            mr: drawerOpen ? 2 : "auto",
                            justifyContent: "center",
                            color: "white",
                          }}
                        >
                          {item.icon}
                        </ListItemIcon>
                        {drawerOpen && (
                          <ListItemText
                            primary={item.label}
                            sx={{ opacity: drawerOpen ? 1 : 0 }}
                          />
                        )}
                      </ListItemButton>
                    </ListItem>
                  ))}
              </List>
            </Box>
          </Drawer>

          {/* Botão de expandir/recolher */}
          <IconButton
            onClick={() => setDrawerOpen((prev) => !prev)}
            sx={{
              position: "fixed",
              top: "50%",
              left: drawerOpen ? drawerWidth - 20 : drawerCollapsedWidth - 20,
              transform: "translateY(-50%)",
              bgcolor: "primary.main",
              color: "white",
              border: "none",
              boxShadow: 4,
              zIndex: 3000,
              "&:hover": {
                bgcolor: "primary.light",
              },
              transition: "left 0.2s",
            }}
            size="small"
          >
            {drawerOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>

          {/* Conteúdo principal */}
          <Box
            sx={{
              bgcolor: isFormPage ? "#0A1929" : "primary.main",
              color: isFormPage ? "inherit" : "white",
              py: { xs: 2, md: 4 },
              minHeight: "100%",
              display: "flex",
              flexDirection: "column",
              flex: 1,
              width: "100%",
              transition: "margin-left 0.2s",
            }}
          >
            <Container maxWidth="md" sx={{ flex: 1 }}>
              {conteudo}
            </Container>
          </Box>
        </Box>
        {/* Rodapé fixo ao final da tela */}
        <Box
          component="footer"
          sx={{
            bgcolor: "primary.dark",
            color: "white",
            py: 3,
            textAlign: "center",
            width: "100%",
            mt: "auto",
          }}
        >
          <Container maxWidth="md">
            <Typography
              variant="body2"
              sx={{ fontFamily: "Montserrat, Arial" }}
            >
              © {new Date().getFullYear()} Agende Já Pira — Todos os direitos
              reservados.
            </Typography>
            <Stack
              direction="row"
              spacing={2}
              justifyContent="center"
              sx={{ mt: 1 }}
            >
              <Link
                href="#"
                color="inherit"
                underline="hover"
                sx={{ display: "flex", alignItems: "center" }}
              >
                <ChatBubbleOutlineIcon sx={{ mr: 0.5 }} fontSize="small" />{" "}
                Contato
              </Link>
              <Button
                color="inherit"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  textTransform: "none",
                }}
              >
                Logout
              </Button>
            </Stack>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default Dashboard;
