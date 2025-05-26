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
  Divider,
  Paper,
  TextField,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LogoutIcon from "@mui/icons-material/Logout";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BusinessIcon from "@mui/icons-material/Business";
import ListAltIcon from "@mui/icons-material/ListAlt";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import {
  Link as RouterLink,
  useNavigate,
  useLocation,
  Outlet,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import theme from "./theme";

// Componente para listar empresas (apenas para usuário master)
function ListarEmpresas() {
  const [empresas, setEmpresas] = useState<any[]>([]);
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

  const handleEditar = (empresa: any) => {
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
        <Box component="ul" sx={{ listStyle: "none", p: 0 }}>
          {empresas.map((empresa) => (
            <Paper
              key={empresa.id}
              component="li"
              sx={{
                mb: 2,
                p: 2,
                borderRadius: 2,
                boxShadow: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
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
        </Box>
      )}
    </Box>
  );
}

// Componente para cadastro de serviço (apenas para empresas)
function CadastrarServico() {
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    if (!nome.trim() || !valor.trim()) {
      setMsg("Preencha todos os campos.");
      return;
    }

    setLoading(true);
    // Supondo que você tenha o id da empresa no localStorage
    const usuario_id = localStorage.getItem("usuario_id");
    const { error } = await supabase.from("servicos").insert([
      {
        nome,
        valor: parseFloat(valor.replace(",", ".")),
        usuario_id,
      },
    ]);
    setLoading(false);

    if (error) {
      setMsg("Erro ao cadastrar serviço: " + error.message);
    } else {
      setMsg("Serviço cadastrado com sucesso!");
      setNome("");
      setValor("");
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ maxWidth: 400, mx: "auto" }}
    >
      <Typography
        variant="h5"
        sx={{ mb: 2, color: "primary.main", fontWeight: 700 }}
      >
        Cadastrar Serviço
      </Typography>
      <TextField
        label="Nome do serviço"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
        required
      />
      <TextField
        label="Valor do serviço"
        value={valor}
        onChange={(e) => setValor(e.target.value.replace(/[^0-9.,]/g, ""))}
        fullWidth
        sx={{ mb: 2 }}
        required
        inputProps={{ inputMode: "decimal" }}
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disabled={loading}
      >
        {loading ? "Salvando..." : "Cadastrar"}
      </Button>
      {msg && (
        <Typography
          sx={{ mt: 2 }}
          color={msg.includes("sucesso") ? "success.main" : "error"}
        >
          {msg}
        </Typography>
      )}
    </Box>
  );
}

const drawerWidth = 220;
const drawerCollapsedWidth = 64;

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [empresa, setEmpresa] = useState<string>("");
  const [drawerOpen, setDrawerOpen] = useState(false); // Começa contraído

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

  useEffect(() => {
    const nome = localStorage.getItem("usuario_nome");
    if (nome) {
      setEmpresa(nome);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = async () => {
    localStorage.removeItem("usuario_id");
    localStorage.removeItem("usuario_nome");
    localStorage.removeItem("is_master");
    await supabase.auth.signOut();
    navigate("/login");
  };

  const isMaster = localStorage.getItem("is_master") === "true";

  // Itens do menu lateral
  const menuItems = [
    {
      label: "Dashboard",
      icon: <DashboardIcon />,
      to: "/dashboard",
      show: true,
    },
    {
      label: "Cadastrar Serviço",
      icon: <AddCircleOutlineIcon />,
      to: "/dashboard/cadastrar-servico",
      show: !isMaster, // Só para empresas
    },
    {
      label: "Cadastrar Empresa",
      icon: <BusinessIcon />,
      to: "/dashboard/cadastro",
      show: isMaster,
    },
    {
      label: "Listar Empresas",
      icon: <ListAltIcon />,
      to: "/dashboard/listar-empresas",
      show: isMaster,
    },
  ];

  // Verifica se está na rota inicial do dashboard
  const isDashboardHome =
    location.pathname === "/dashboard" || location.pathname === "/dashboard/";

  // Renderiza o conteúdo correto
  let conteudo = null;
  if (location.pathname === "/dashboard/listar-empresas" && isMaster) {
    conteudo = <ListarEmpresas />;
  } else if (
    location.pathname === "/dashboard/cadastrar-servico" &&
    !isMaster
  ) {
    conteudo = <CadastrarServico />;
  } else if (isDashboardHome) {
    conteudo = (
      <>
        <Typography
          variant="h3"
          align="center"
          fontWeight={700}
          sx={{ mb: 2, fontFamily: "Montserrat, Arial" }}
        >
          Bem-vindo{empresa ? `, ${empresa}` : ""} ao seu Dashboard!
        </Typography>
        <Typography
          variant="h6"
          align="center"
          sx={{ mb: 4, color: "rgba(255,255,255,0.85)" }}
        >
          Aqui você poderá gerenciar seus agendamentos, clientes e serviços.
        </Typography>
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

      {/* Drawer (Menu Lateral) */}
      <Box sx={{ display: "flex" }}>
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
            },
          }}
        >
          <Toolbar />
          <Box sx={{ mt: 2, position: "relative", height: "100%" }}>
            <List>
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
                        minHeight: 48,
                        justifyContent: drawerOpen ? "initial" : "center",
                        px: 2.5,
                        color: "white",
                      }}
                      title={!drawerOpen ? item.label : undefined}
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
          <Divider sx={{ bgcolor: "rgba(255,255,255,0.12)", mt: "auto" }} />
        </Drawer>

        {/* Botão de expandir/recolher centralizado verticalmente, FIXO e acima do conteúdo */}
        <IconButton
          onClick={() => setDrawerOpen((prev) => !prev)}
          sx={{
            position: "fixed",
            top: "50%",
            left: drawerOpen ? drawerWidth - 20 : drawerCollapsedWidth - 20,
            transform: "translateY(-50%)",
            bgcolor: "primary.main",
            color: "white",
            border: "none", // Sem borda
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
            bgcolor: "primary.main",
            color: "white",
            py: { xs: 8, md: 12 },
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            flex: 1,
            ml: drawerOpen ? `${drawerWidth}px` : `${drawerCollapsedWidth}px`,
            transition: "margin-left 0.2s",
          }}
        >
          <Container maxWidth="md">{conteudo}</Container>
        </Box>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          bgcolor: "primary.dark",
          color: "white",
          py: 3,
          mt: 0,
          textAlign: "center",
          ml: drawerOpen ? `${drawerWidth}px` : `${drawerCollapsedWidth}px`,
          transition: "margin-left 0.2s",
        }}
      >
        <Container maxWidth="md">
          <Typography variant="body2" sx={{ fontFamily: "Montserrat, Arial" }}>
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
    </ThemeProvider>
  );
}

export default Dashboard;
