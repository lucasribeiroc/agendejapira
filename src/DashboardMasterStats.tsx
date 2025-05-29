import { useEffect, useState } from "react";
import { Box, Paper, Typography, Grid } from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { supabase } from "./supabaseClient";

export default function DashboardMasterStats() {
  const [stats, setStats] = useState({
    empresas: 0,
    clientes: 0,
    servicos: 0,
    agendamentos: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      const [
        { count: empresas },
        { count: clientes },
        { count: servicos },
        { count: agendamentos },
      ] = await Promise.all([
        supabase.from("usuarios").select("id", { count: "exact", head: true }),
        supabase.from("clientes").select("id", { count: "exact", head: true }),
        supabase.from("servicos").select("id", { count: "exact", head: true }),
        supabase
          .from("agendamentos")
          .select("id", { count: "exact", head: true }),
      ]);
      setStats({
        empresas: empresas || 0,
        clientes: clientes || 0,
        servicos: servicos || 0,
        agendamentos: agendamentos || 0,
      });
    }
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  // Dados para os cards pequenos (adicionando ponto inicial para a linha aparecer)
  const smallCardsData = [
    [
      { name: "0", total: 0 },
      { name: "Empresas", total: stats.empresas },
    ],
    [
      { name: "0", total: 0 },
      { name: "Clientes", total: stats.clientes },
    ],
    [
      { name: "0", total: 0 },
      { name: "Serviços", total: stats.servicos },
    ],
  ];
  const smallCards = [
    { name: "Empresas", total: stats.empresas },
    { name: "Clientes", total: stats.clientes },
    { name: "Serviços", total: stats.servicos },
  ];

  // Dados para o gráfico grande de agendamentos (adicionando ponto inicial)
  const agendamentoData = [
    { name: "0", total: 0 },
    { name: "Agendamentos", total: stats.agendamentos },
  ];

  // Cálculo do valor arrecadado mensal
  const mensalidade = 39.9;
  const valorArrecadado = stats.empresas * mensalidade;

  return (
    <Box sx={{ mt: 4, maxWidth: 1200, mx: "auto" }}>
      {/* Linha dos cards pequenos */}
      <Grid container spacing={3} sx={{ width: "100%", margin: 0 }}>
        {smallCards.map((item, idx) => (
          <Grid
            item
            xs={12}
            sm={4}
            md={4}
            key={item.name}
            sx={{ display: "flex" }}
          >
            <Paper
              sx={{
                flex: 1,
                p: 2,
                borderRadius: 2,
                bgcolor: "primary.main",
                border: "2px solid #fff",
                color: "#fff",
                boxShadow: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: 0,
              }}
            >
              <Typography
                variant="h6"
                align="center"
                fontWeight={700}
                sx={{ mb: 2, color: "#fff" }}
              >
                {item.name} cadastrados
              </Typography>
              <ResponsiveContainer width="100%" height={90}>
                <LineChart data={smallCardsData[idx]}>
                  <CartesianGrid
                    stroke="#fff"
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#fff"
                    tick={{ fill: "#fff", fontWeight: 500, fontSize: 12 }}
                    axisLine={{ stroke: "#fff" }}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    stroke="#fff"
                    tick={{ fill: "#fff", fontWeight: 500, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#222",
                      border: "1px solid #fff",
                      color: "#fff",
                      fontSize: 13,
                    }}
                    labelStyle={{ color: "#fff" }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#fff"
                    strokeWidth={1.5}
                    dot={{ r: 2, fill: "#fff" }}
                    activeDot={{ r: 4, fill: "#fff" }}
                    strokeOpacity={1}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
              <Typography
                variant="h4"
                align="center"
                fontWeight={700}
                sx={{ mt: 2, color: "#fff", fontSize: 32 }}
              >
                {item.total}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Linha do gráfico grande, em outro box pai, ocupando toda a largura e alinhado */}
      <Box sx={{ mt: 3, width: "100%", pr: 2 }}>
        <Paper
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: "primary.main",
            border: "2px solid #fff",
            color: "#fff",
            boxShadow: 4,
            width: "100%",
            maxWidth: 1200,
            mx: "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h6"
            align="center"
            fontWeight={700}
            sx={{ mb: 2, color: "#fff" }}
          >
            Agendamentos cadastrados
          </Typography>
          <ResponsiveContainer width="100%" height={90}>
            <LineChart data={agendamentoData}>
              <CartesianGrid
                stroke="#fff"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                stroke="#fff"
                tick={{ fill: "#fff", fontWeight: 500, fontSize: 16 }}
                axisLine={{ stroke: "#fff" }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                stroke="#fff"
                tick={{ fill: "#fff", fontWeight: 500, fontSize: 16 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#222",
                  border: "1px solid #fff",
                  color: "#fff",
                  fontSize: 16,
                }}
                labelStyle={{ color: "#fff" }}
                itemStyle={{ color: "#fff" }}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#fff"
                strokeWidth={2}
                dot={{ r: 4, fill: "#fff" }}
                activeDot={{ r: 6, fill: "#fff" }}
                strokeOpacity={1}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
          <Typography
            variant="h3"
            align="center"
            fontWeight={700}
            sx={{ mt: 2, color: "#fff" }}
          >
            {stats.agendamentos}
          </Typography>
        </Paper>
      </Box>

      {/* Dado financeiro abaixo do gráfico grande */}
      <Box sx={{ mt: 3, width: "100%", pr: 2 }}>
        <Paper
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: "#207c4a", // verde mais escuro
            border: "2px solid #fff",
            color: "#fff",
            boxShadow: 4,
            width: "100%",
            maxWidth: 1200,
            mx: "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h6"
            align="center"
            fontWeight={700}
            sx={{ mb: 1, color: "#fff" }}
          >
            Valor arrecadado mensal
          </Typography>
          <Typography
            variant="h3"
            align="center"
            fontWeight={700}
            sx={{ color: "#fff" }}
          >
            {valorArrecadado.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
              minimumFractionDigits: 2,
            })}
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}
