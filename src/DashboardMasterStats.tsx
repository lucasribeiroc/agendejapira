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

  const data = [
    { name: "Empresas", total: stats.empresas },
    { name: "Clientes", total: stats.clientes },
    { name: "Serviços", total: stats.servicos },
    { name: "Agendamentos", total: stats.agendamentos },
  ];

  return (
    <Box sx={{ mt: 4 }}>
      <Grid container spacing={3}>
        {data.map((item) => (
          <Grid item xs={12} md={6} key={item.name}>
            <Paper
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "primary.main",
                border: "2px solid #fff",
                color: "#fff",
                boxShadow: 4,
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
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={[item]}>
                  <CartesianGrid stroke="#fff" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    stroke="#fff"
                    tick={{ fill: "#fff", fontWeight: 700 }}
                    axisLine={{ stroke: "#fff" }}
                    tickLine={{ stroke: "#fff" }}
                  />
                  <YAxis
                    allowDecimals={false}
                    stroke="#fff"
                    tick={{ fill: "#fff", fontWeight: 700 }}
                    axisLine={{ stroke: "#fff" }}
                    tickLine={{ stroke: "#fff" }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#222",
                      border: "1px solid #fff",
                      color: "#fff",
                    }}
                    labelStyle={{ color: "#fff" }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#fff"
                    strokeWidth={3}
                    dot={{ r: 7, fill: "#fff" }}
                    activeDot={{ r: 10, fill: "#fff" }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <Typography
                variant="h4"
                align="center"
                fontWeight={700}
                sx={{ mt: 2, color: "#fff" }}
              >
                {item.total}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
