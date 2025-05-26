import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import LoginPage from "./LoginPage";
import Dashboard from "./Dashboard";
import CadastroEmpresa from "./CadastroEmpresa";
import ListarEmpresas from "./ListarEmpresas";
import CadastrarServico from "./CadastrarServico";
import ListarServicos from "./ListarServicos";
import CadastrarCliente from "./CadastrarCliente";
import ListarClientes from "./ListarClientes";
import Agendamento from "./Agendamento";
import ListarAgendamento from "./ListarAgendamento";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Componente para a tela inicial do dashboard (bem-vindo)
function DashboardHome() {
  return null; // O Dashboard já exibe o conteúdo inicial se a rota for /dashboard
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<LoginPage />} />
        {/* Rotas aninhadas do dashboard */}
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<DashboardHome />} />
          <Route path="cadastro" element={<CadastroEmpresa />} />
          <Route path="listar-empresas" element={<ListarEmpresas />} />
          <Route path="cadastrar-servico" element={<CadastrarServico />} />
          <Route path="listar-servicos" element={<ListarServicos />} />
          <Route path="cadastrar-cliente" element={<CadastrarCliente />} />
          <Route path="listar-clientes" element={<ListarClientes />} />
          <Route path="/dashboard/agendar" element={<Agendamento />} />
          <Route
            path="/dashboard/agendamentos"
            element={<ListarAgendamento />}
          />
        </Route>
        {/* Redireciona qualquer rota desconhecida para o dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
