import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "@/routes/PrivateRoute";

import Login from "@/pages/Login/Login";
import Register from "@/pages/Cadastro/Register";

import Dashboard from "@/pages/Dashboard";
import Kamban from "@/pages/Kamban";
import Projetos from "@/pages/Projetos";
import Equipe from "@/pages/Equipe";
import Configuracoes from "@/pages/Configuracoes";
import Notificacoes from "@/pages/Notificacoes";

import Layout from "@/components/Layout";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Privadas */}
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>

            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/kamban" element={<Kamban />} />
            <Route path="/projetos" element={<Projetos />} />
            <Route path="/notificacoes" element={<Notificacoes />} />
            <Route path="/equipe" element={<Equipe />} />
            <Route path="/configuracoes" element={<Configuracoes />} />

          </Route>
        </Route>

        {/* Redirecionamentos */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />

      </Routes>
    </BrowserRouter>
  );
}