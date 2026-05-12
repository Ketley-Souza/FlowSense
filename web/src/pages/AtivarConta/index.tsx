import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/services/api";

export default function AtivarContaPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [form, setForm] = useState({
    login: "",
    senha: "",
    confirmarSenha: "",
  });

  useEffect(() => {
    if (!token) {
      setErro("Token inválido");
    }
  }, [token]);

  async function handleAtivar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (!form.login || !form.senha || !form.confirmarSenha) {
      setErro("Preencha todos os campos");
      return;
    }

    if (form.senha !== form.confirmarSenha) {
      setErro("As senhas não conferem");
      return;
    }

    if (form.senha.length < 6) {
      setErro("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    setCarregando(true);

    try {
      const response = await api.post("/auth/ativar", {
        token,
        login: form.login,
        senha: form.senha,
      });

      setSucesso(true);
      localStorage.setItem("flowsense_token", response.data.token);

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error: any) {
      const mensagem =
        error.response?.data?.message ||
        error.message ||
        "Erro ao ativar conta";
      setErro(mensagem);
    } finally {
      setCarregando(false);
    }
  }

  if (sucesso) {
    return (
      <div className="min-h-screen bg-linear-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="mb-6">
            <div className="inline-block w-16 h-16 bg-green-100 rounded-full items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Conta Ativada com Sucesso!
          </h2>
          <p className="text-slate-600 mb-4">
            Sua conta foi ativada. Você será redirecionado para o dashboard em
            breve...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Ativar Conta
          </h1>
          <p className="text-slate-600">
            Defina suas credenciais para ativar sua conta
          </p>
        </div>

        {erro && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {erro}
          </div>
        )}

        <form onSubmit={handleAtivar} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nome de Usuário (Login)
            </label>
            <input
              type="text"
              value={form.login}
              onChange={(e) => setForm({ ...form, login: e.target.value })}
              placeholder="seu_usuario"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={carregando}
            />
            <p className="text-xs text-slate-500 mt-1">
              Mínimo 3 caracteres. Apenas letras, números e underscore.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Senha
            </label>
            <input
              type="password"
              value={form.senha}
              onChange={(e) => setForm({ ...form, senha: e.target.value })}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={carregando}
            />
            <p className="text-xs text-slate-500 mt-1">
              Mínimo 6 caracteres
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Confirmar Senha
            </label>
            <input
              type="password"
              value={form.confirmarSenha}
              onChange={(e) =>
                setForm({ ...form, confirmarSenha: e.target.value })
              }
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={carregando}
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full mt-6 py-3 rounded-lg bg-linear-to-r from-indigo-600 to-blue-600 text-white font-medium hover:opacity-95 disabled:opacity-50 transition-opacity"
          >
            {carregando ? "Ativando..." : "Ativar Conta"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-4">
          Após ativar, você será redirecionado para fazer login
        </p>
      </div>
    </div>
  );
}
