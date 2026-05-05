import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { registrar } from "@/services/auth";

export default function Register() {
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [login, setLogin] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);

    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setCarregando(true);

    try {
      await registrar({ nome, email, login, senha });
      navigate("/login");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Erro ao criar conta. Tente novamente.";
      setErro(msg);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="h-screen bg-gradient-to-r from-[#cfd5df] to-[#e4e7ec] flex items-center justify-center">

      <div className="bg-white w-[350px] p-8 rounded-xl shadow-[0_5px_20px_rgba(0,0,0,0.1)] text-center">

        <h2 className="text-xl font-semibold mb-1">
          Crie sua conta
        </h2>

        <p className="text-sm text-gray-500 mb-5">
          Preencha os dados abaixo para começar
        </p>

        {/* AVATAR */}
        <div className="mb-5">
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mx-auto text-2xl relative">
            <span></span>
            <button className="absolute bottom-0 right-0 bg-[#5a4bff] text-white rounded-full w-7 h-7 flex items-center justify-center text-xs hover:opacity-90">
              +
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Clique no ícone para adicionar foto
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">

          {/* ERRO */}
          {erro && (
            <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-left">
              {erro}
            </div>
          )}

          <input
            type="text"
            placeholder="Seu nome completo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#5a4bff] focus:ring-2 focus:ring-[#5a4bff]/10 outline-none"
          />

          <input
            type="text"
            placeholder="usuario123"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#5a4bff] focus:ring-2 focus:ring-[#5a4bff]/10 outline-none"
          />

          <input
            type="email"
            placeholder="nome@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#5a4bff] focus:ring-2 focus:ring-[#5a4bff]/10 outline-none"
          />

          <input
            type="password"
            placeholder="Senha (mín. 6 caracteres)"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#5a4bff] focus:ring-2 focus:ring-[#5a4bff]/10 outline-none"
          />

          <input
            type="password"
            placeholder="Confirmar senha"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#5a4bff] focus:ring-2 focus:ring-[#5a4bff]/10 outline-none"
          />

          <button
            type="submit"
            disabled={carregando}
            className="w-full mt-3 py-3 bg-[#5a4bff] text-white rounded-lg text-sm hover:bg-[#4838d1] disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {carregando ? "Criando conta..." : "Criar conta"}
          </button>

        </form>

        <p className="mt-4 text-sm text-gray-500">
          Já tem uma conta?{" "}
          <a href="/login" className="text-[#5a4bff] font-medium">
            Entrar
          </a>
        </p>

      </div>
    </div>
  );
}