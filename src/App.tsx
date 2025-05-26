import {
  ThemeProvider,
  CssBaseline,
  Container,
  Box,
  Typography,
  Button,
  Stack,
  Card,
  AppBar,
  Toolbar,
  Link,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import LoginIcon from "@mui/icons-material/Login";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import TouchAppIcon from "@mui/icons-material/TouchApp";
import SecurityIcon from "@mui/icons-material/Security";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { Link as RouterLink } from "react-router-dom";
import { useEffect } from "react";
import theme from "./theme";

function App() {
  // Carrega a fonte Montserrat do Google Fonts
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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Header */}
      <AppBar position="static" color="primary" elevation={2}>
        <Toolbar>
          <CalendarMonthIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Agende Já Pira
          </Typography>
          <Button
            color="inherit"
            startIcon={<LoginIcon />}
            component={RouterLink}
            to="/login"
          >
            Login
          </Button>
          <Button color="inherit" startIcon={<ChatBubbleOutlineIcon />}>
            Contato
          </Button>
        </Toolbar>
      </AppBar>

      {/* Hero Section - Azul escuro */}
      <Box
        sx={{ bgcolor: "primary.main", color: "white", py: { xs: 8, md: 12 } }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                sx={{ fontWeight: 700, fontFamily: "Montserrat, Arial" }}
                gutterBottom
              >
                Agende Já Pira
              </Typography>
              <Typography
                variant="h5"
                sx={{ mb: 2, fontFamily: "Montserrat, Arial" }}
              >
                O agendador perfeito para pequenos negócios!
              </Typography>
              <Typography
                variant="body1"
                sx={{ mb: 4, color: "rgba(255,255,255,0.85)" }}
              >
                Organize seus horários, clientes e serviços de forma simples,
                rápida e eficiente. Ideal para manicures, barbeiros, dentistas e
                qualquer profissional que precisa de praticidade no dia a dia.
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  startIcon={<LoginIcon />}
                  sx={{ fontWeight: 600 }}
                  component={RouterLink}
                  to="/login"
                >
                  Login
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  size="large"
                  startIcon={<ChatBubbleOutlineIcon />}
                  sx={{
                    fontWeight: 600,
                    bgcolor: "white",
                    color: "primary.main",
                    borderColor: "secondary.main",
                    "&:hover": { bgcolor: "secondary.light" },
                  }}
                >
                  Fale Conosco
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Imagem full width fora do Container */}
      <Box
        sx={{
          width: "100%",
          height: { xs: 220, sm: 320, md: 420 },
          overflow: "hidden",
          borderRadius: 0,
          boxShadow: 0,
          m: 0,
          p: 0,
        }}
      >
        <img
          src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1600&q=80"
          alt="Calendário representando agendamento de horários"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            borderRadius: 0,
            margin: 0,
            padding: 0,
          }}
        />
      </Box>

      {/* Seção branca - Por que escolher */}
      <Box sx={{ bgcolor: "#fff", py: { xs: 8, md: 10 } }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            color="primary"
            align="center"
            sx={{ fontWeight: 700, mb: 6, fontFamily: "Montserrat, Arial" }}
          >
            Por que escolher o Agende Já Pira?
          </Typography>
          <Grid
            container
            spacing={4}
            alignItems="stretch"
            justifyContent="center"
            sx={{ minHeight: 380 }}
          >
            {[
              {
                icon: <TouchAppIcon color="primary" sx={{ fontSize: 48 }} />,
                title: "Simples e Intuitivo",
                desc: "Interface fácil de usar, sem complicações. Você gerencia tudo em poucos cliques.",
              },
              {
                icon: <PeopleAltIcon color="primary" sx={{ fontSize: 48 }} />,
                title: "Controle Total",
                desc: "Cadastre clientes, agendamentos e serviços de forma personalizada para sua empresa.",
              },
              {
                icon: <SecurityIcon color="primary" sx={{ fontSize: 48 }} />,
                title: "Seguro e Online",
                desc: "Seus dados ficam salvos na nuvem, com acesso seguro e disponível de qualquer lugar.",
              },
            ].map((item, idx) => (
              <Grid
                item
                xs={12}
                md={4}
                key={idx}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Card
                  elevation={3}
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    bgcolor: "#f5f7fa",
                    borderRadius: 4,
                    border: "1.5px solid #e3e8ee",
                    minHeight: 340,
                    maxWidth: 350,
                    width: "100%",
                    mx: "auto",
                  }}
                >
                  <Box sx={{ mt: 3, mb: 2 }}>{item.icon}</Box>
                  <Typography
                    variant="h5"
                    color="primary"
                    sx={{
                      fontWeight: 700,
                      fontFamily: "Montserrat, Arial",
                      mb: 1,
                    }}
                    gutterBottom
                    align="center"
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    align="center"
                    sx={{ flexGrow: 1, fontSize: 18, px: 2 }}
                  >
                    {item.desc}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    size="medium"
                    fullWidth
                    startIcon={<ChatBubbleOutlineIcon />}
                    sx={{ mt: 3, fontWeight: 600, mb: 2, maxWidth: 200 }}
                  >
                    Fale Conosco
                  </Button>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Seção azul escuro - CTA final */}
      <Box
        sx={{ bgcolor: "primary.main", color: "white", py: { xs: 8, md: 10 } }}
      >
        <Container maxWidth="md" sx={{ textAlign: "center" }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, fontFamily: "Montserrat, Arial" }}
            gutterBottom
          >
            Pronto para transformar sua rotina?
          </Typography>
          <Typography
            variant="h6"
            sx={{ mb: 4, color: "rgba(255,255,255,0.85)" }}
          >
            Experimente o Agende Já Pira e veja como é fácil organizar seu
            negócio!
          </Typography>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="center"
          >
            <Button
              variant="contained"
              color="secondary"
              size="large"
              startIcon={<LoginIcon />}
              sx={{ fontWeight: 600 }}
              component={RouterLink}
              to="/login"
            >
              Login
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              size="large"
              startIcon={<ChatBubbleOutlineIcon />}
              sx={{
                fontWeight: 600,
                bgcolor: "white",
                color: "primary.main",
                borderColor: "secondary.main",
                "&:hover": { bgcolor: "secondary.light" },
              }}
            >
              Fale Conosco
            </Button>
          </Stack>
        </Container>
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
            <Link
              component={RouterLink}
              to="/login"
              color="inherit"
              underline="hover"
              sx={{ display: "flex", alignItems: "center" }}
            >
              <LoginIcon sx={{ mr: 0.5 }} fontSize="small" /> Login
            </Link>
          </Stack>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
