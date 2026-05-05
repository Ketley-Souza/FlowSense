import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "@/services/auth";

export default function Login() {
  const navigate = useNavigate();

  const [identificador, setIdentificador] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    try {
      await login(identificador, senha);
      navigate("/dashboard");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Erro ao entrar. Verifique suas credenciais.";
      setErro(msg);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center font-sans">
      <div className="w-[1100px] h-[620px] flex rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.08)]">

        {/* ESQUERDA */}
        <div className="w-1/2 bg-gradient-to-br from-[#5f5bff] to-[#6c2bd9] text-white px-[70px] py-[80px] flex flex-col justify-center">
          <h1 className="text-[36px] font-semibold mb-5">
            Bem-vindo de volta!
          </h1>

          <p className="text-sm leading-[1.7] opacity-90 max-w-[380px]">
            Acesse sua conta e continue sua jornada conosco.
            Gerencie seus projetos, conecte-se com sua equipe e alcance seus objetivos.
          </p>

          <div className="mt-10 flex items-center gap-2 text-sm opacity-90">
            <span>→</span>
            <span>Seu sucesso começa aqui</span>
          </div>
        </div>

        {/* DIREITA */}
        <div className="w-1/2 bg-[#f9fafb] flex items-center justify-center">
          <div className="w-[75%]">

            <h2 className="text-[26px] font-semibold mb-1">
              Entrar
            </h2>

            <p className="text-[13px] text-gray-500 mb-6">
              Entre na sua conta para continuar
            </p>

            <form onSubmit={handleSubmit}>
              {/* ERRO */}
              {erro && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                  {erro}
                </div>
              )}

              {/* EMAIL OU USERNAME */}
              <label className="text-[12.5px] text-gray-700 mt-4 block">
                Email ou usuário
              </label>
              <input
                type="text"
                placeholder="seu@email.com ou usuario123"
                value={identificador}
                onChange={(e) => setIdentificador(e.target.value)}
                required
                className="w-full mt-1.5 px-3 py-3 rounded-lg border border-gray-300 text-sm bg-white focus:border-[#6c2bd9] focus:ring-2 focus:ring-[#6c2bd9]/10 outline-none"
              />

              {/* SENHA */}
              <label className="text-[12.5px] text-gray-700 mt-4 block">
                Senha
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                className="w-full mt-1.5 px-3 py-3 rounded-lg border border-gray-300 text-sm bg-white focus:border-[#6c2bd9] focus:ring-2 focus:ring-[#6c2bd9]/10 outline-none"
              />

              <a
                href="#"
                className="block text-right mt-2 text-xs text-[#6c2bd9]"
              >
                Esqueceu a senha?
              </a>

              {/* BOTÃO LOGIN */}
              <button
                type="submit"
                disabled={carregando}
                className="w-full mt-5 py-3 rounded-lg bg-gradient-to-r from-[#5f5bff] to-[#6c2bd9] text-white text-sm hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {carregando ? "Entrando..." : "Entrar"}
              </button>
            </form>

            {/* DIVISOR */}
            <div className="flex items-center my-5 text-xs text-gray-400">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="mx-2">ou continue com</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* GOOGLE */}
            <button className="w-full py-3 border border-gray-300 rounded-lg bg-white flex items-center justify-center gap-2 hover:bg-gray-100">
              <img
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
                alt="google"
                className="w-[18px]"
              />
              <span>Entrar com Google</span>
            </button>

            {/* FINAL */}
            <p className="text-center mt-5 text-[13px] text-gray-500">
              Não tem uma conta?{" "}
              <a href="/register" className="text-[#6c2bd9] font-medium">
                Criar conta
              </a>
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}