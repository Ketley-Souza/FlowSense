import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login/Login";
import Register from "./pages/Login/Register";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* redireciona a home pra login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* página de login */}
        <Route path="/login" element={<Login />} />

        {/* ✅ ADICIONA ISSO */}
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;