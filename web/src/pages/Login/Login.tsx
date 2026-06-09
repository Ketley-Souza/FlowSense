import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
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
    <div className="fixed inset-0 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-[#f5f7ff] px-4 py-6 max-md:items-start max-md:px-3 max-md:pb-3 max-md:pt-20">
      <div className="pointer-events-none absolute inset-0 overflow-hidden max-md:hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_20%,rgba(95,91,255,0.22),transparent_30%),radial-gradient(circle_at_84%_18%,rgba(108,43,217,0.20),transparent_26%),linear-gradient(135deg,#f8f9ff_0%,#eef2ff_48%,#f7f1ff_100%)]" />
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-[#5f5bff]/25 blur-3xl" />
        <div className="absolute bottom-[-120px] right-[-80px] h-96 w-96 rounded-full bg-[#6c2bd9]/20 blur-3xl" />
        <div className="absolute right-[18%] top-[18%] h-32 w-32 rounded-full border border-white/70 bg-white/20 blur-sm" />
      </div>
      <div className="relative flex h-[620px] w-[1100px] max-w-[calc(100vw-32px)] overflow-hidden rounded-2xl shadow-[0_20px_50px_rgba(44,36,112,0.14)] max-md:min-h-[calc(100vh-5.75rem)] max-md:w-full max-md:max-w-none max-md:rounded-2xl max-md:border max-md:border-slate-200 max-md:shadow-[0_16px_40px_rgba(15,23,42,0.12)]">

        {/* ESQUERDA */}
        <div className="flex w-1/2 flex-col justify-center bg-gradient-to-br from-[#5f5bff] to-[#6c2bd9] px-[70px] py-[80px] text-white max-md:hidden">
          <h1 className="mb-5 text-[36px] font-semibold">
            Bem-vindo de volta!
          </h1>

          <p className="max-w-[380px] text-sm leading-[1.7] opacity-90">
            Acesse sua conta e continue sua jornada conosco.
            Gerencie seus projetos, conecte-se com sua equipe e alcance seus objetivos.
          </p>

          <div className="mt-10 flex items-center gap-2 text-sm opacity-90">
            <span aria-hidden="true">-</span>
            <span>Seu sucesso começa aqui</span>
          </div>
        </div>

        {/* DIREITA */}
        <div className="flex w-1/2 items-center justify-center bg-white md:bg-[#f9fafb] max-md:w-full max-md:px-5 max-md:py-8">
          <div className="w-[75%] max-md:w-full max-md:max-w-md">

            <h2 className="mb-1 text-[26px] font-semibold">
              Entrar
            </h2>

            <p className="mb-6 text-[13px] text-gray-500">
              Entre na sua conta para continuar
            </p>

            <form onSubmit={handleSubmit}>
              {/* ERRO */}
              {erro && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {erro}
                </div>
              )}

              {/* EMAIL OU USERNAME */}
              <label className="mt-4 block text-[12.5px] text-gray-700">
                Email ou usuário
              </label>
              <input
                type="text"
                placeholder="seu@email.com ou usuario123"
                value={identificador}
                onChange={(e) => setIdentificador(e.target.value)}
                required
                className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm outline-none focus:border-[#6c2bd9] focus:ring-2 focus:ring-[#6c2bd9]/10"
              />

              {/* SENHA */}
              <label className="mt-4 block text-[12.5px] text-gray-700">
                Senha
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm outline-none focus:border-[#6c2bd9] focus:ring-2 focus:ring-[#6c2bd9]/10"
              />

              <a
                href="#"
                className="mt-2 block text-right text-xs text-[#6c2bd9]"
              >
                Esqueceu a senha?
              </a>

              {/* BOTÃO LOGIN */}
              <button
                type="submit"
                disabled={carregando}
                className="mt-5 w-full rounded-lg bg-gradient-to-r from-[#5f5bff] to-[#6c2bd9] py-3 text-sm text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {carregando ? "Entrando..." : "Entrar"}
              </button>
            </form>

            {/* DIVISOR */}
            <div className="my-5 flex items-center text-xs text-gray-400">
              <div className="h-px flex-1 bg-gray-200"></div>
              <div className="h-px flex-1 bg-gray-200"></div>
            </div>

            

            {/* FINAL */}
            <p className="mt-5 text-center text-[13px] text-gray-500">
              Não tem uma conta?{" "}
              <Link to="/register" className="font-medium text-[#6c2bd9]">
                Criar conta
              </Link>
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}
