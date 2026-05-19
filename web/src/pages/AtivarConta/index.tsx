import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, CheckCircle2, UserPlus, ShieldCheck } from "lucide-react";
import api from "@/services/api";

interface DetalhesConvite {
  usuario: {
    id: string;
    nome: string;
    email: string;
    status: string;
  };
  equipeNome: string;
}

export default function AtivarContaPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [carregandoDetalhes, setCarregandoDetalhes] = useState(true);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [detalhes, setDetalhes] = useState<DetalhesConvite | null>(null);

  const [form, setForm] = useState({
    login: "",
    senha: "",
    confirmarSenha: "",
  });

  useEffect(() => {
    async function carregarDadosConvite() {
      if (!token) {
        setErro("Token inválido ou ausente.");
        setCarregandoDetalhes(false);
        return;
      }

      try {
        const response = await api.get(`/auth/convite/${token}`);
        setDetalhes(response.data);
      } catch (error: any) {
        const mensagem =
          error.response?.data?.message ||
          error.message ||
          "Erro ao buscar dados do convite. O link pode ter expirado.";
        setErro(mensagem);
      } finally {
        setCarregandoDetalhes(false);
      }
    }

    carregarDadosConvite();
  }, [token]);

  async function handleAtivar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    const usuarioJaAtivo = detalhes?.usuario?.status === "ATIVO";

    if (!usuarioJaAtivo) {
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
    }

    setCarregando(true);

    try {
      const payload = usuarioJaAtivo
        ? { token }
        : {
            token,
            login: form.login,
            senha: form.senha,
          };

      const response = await api.post("/auth/ativar", payload);

      setSucesso(true);
      localStorage.setItem("flowsense_token", response.data.token);
      localStorage.setItem("flowsense_user", JSON.stringify(response.data.usuario));

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

  // 1. Estado de Sucesso
  if (sucesso) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-[#DDE7F3] p-8 w-full max-w-md text-center shadow-sm">
          <div className="mb-6 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EEF1FF] text-[#5B35F5]">
              <CheckCircle2 size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-[#202A3D] mb-2">
            Convite Aceito!
          </h2>
          <p className="text-sm font-medium text-[#7E8DA6] mb-4">
            Você agora faz parte da equipe <strong>{detalhes?.equipeNome}</strong>. Redirecionando para o painel em breve...
          </p>
        </div>
      </div>
    );
  }

  // 2. Estado de Loading inicial
  if (carregandoDetalhes) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-[#DDE7F3] p-8 w-full max-w-md text-center shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-[#5B35F5]" size={32} />
            <p className="text-sm font-bold text-[#202A3D]">Validando convite...</p>
            <p className="text-xs text-[#7E8DA6]">Aguarde enquanto verificamos os dados no sistema.</p>
          </div>
        </div>
      </div>
    );
  }

  // 3. Estado de Erro no link
  if (erro && !detalhes) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-[#DDE7F3] p-8 w-full max-w-md text-center shadow-sm">
          <div className="mb-4 text-red-500 font-bold text-lg">Convite Inválido</div>
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium leading-6 mb-6">
            {erro}
          </div>
          <button
            onClick={() => navigate("/login")}
            className="w-full h-10 rounded-full bg-[#5B35F5] text-white text-sm font-bold transition hover:bg-[#4D2DE0]"
          >
            Voltar para o Login
          </button>
        </div>
      </div>
    );
  }

  const usuarioJaAtivo = detalhes?.usuario?.status === "ATIVO";

  // 4. Interface principal
  return (
    <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#DDE7F3] p-8 w-full max-w-md shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#EEF1FF] text-[#5B35F5]">
            {usuarioJaAtivo ? <ShieldCheck size={24} /> : <UserPlus size={24} />}
          </div>
          <h1 className="text-2xl font-bold text-[#202A3D] mb-1.5">
            {usuarioJaAtivo ? "Aceitar Convite" : "Ativar Conta"}
          </h1>
          <p className="text-sm font-medium text-[#7E8DA6]">
            {usuarioJaAtivo 
              ? `Junte-se à equipe ${detalhes?.equipeNome}`
              : `Crie suas credenciais para entrar na equipe ${detalhes?.equipeNome}`
            }
          </p>
        </div>

        {erro && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
            {erro}
          </div>
        )}

        <form onSubmit={handleAtivar} className="space-y-4">
          {usuarioJaAtivo ? (
            <div className="rounded-xl border border-[#DDE7F3] bg-[#F8FBFF] p-4 text-center">
              <p className="text-sm font-medium text-[#42516A] leading-6">
                Olá, <strong className="text-[#202A3D]">{detalhes?.usuario?.nome}</strong>!<br />
                Detectamos que você já possui uma conta ativa com o e-mail <span className="font-semibold text-[#5B35F5]">{detalhes?.usuario?.email}</span>.
              </p>
              <p className="mt-3 text-xs text-[#7E8DA6] leading-5">
                Não é necessário criar uma nova senha. Basta clicar no botão abaixo para aceitar o convite e se vincular à nova equipe.
              </p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-bold text-[#202A3D] mb-1.5">
                  Nome de Usuário (Login)
                </label>
                <input
                  type="text"
                  value={form.login}
                  onChange={(e) => setForm({ ...form, login: e.target.value })}
                  placeholder="ex: seu_usuario"
                  className="w-full rounded-xl border border-[#DDE7F3] px-3.5 py-2 text-sm text-[#202A3D] outline-none transition placeholder:text-[#9EB2CC] focus:border-[#5B35F5] focus:ring-2 focus:ring-[#5B35F5]/10"
                  disabled={carregando}
                />
                <p className="text-[11px] font-medium text-[#7E8DA6] mt-1.5 leading-4">
                  Mínimo 3 caracteres. Apenas letras, números e underscore (_).
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#202A3D] mb-1.5">
                  Senha
                </label>
                <input
                  type="password"
                  value={form.senha}
                  onChange={(e) => setForm({ ...form, senha: e.target.value })}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[#DDE7F3] px-3.5 py-2 text-sm text-[#202A3D] outline-none transition placeholder:text-[#9EB2CC] focus:border-[#5B35F5] focus:ring-2 focus:ring-[#5B35F5]/10"
                  disabled={carregando}
                />
                <p className="text-[11px] font-medium text-[#7E8DA6] mt-1.5">
                  Mínimo 6 caracteres
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#202A3D] mb-1.5">
                  Confirmar Senha
                </label>
                <input
                  type="password"
                  value={form.confirmarSenha}
                  onChange={(e) =>
                    setForm({ ...form, confirmarSenha: e.target.value })
                  }
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[#DDE7F3] px-3.5 py-2 text-sm text-[#202A3D] outline-none transition placeholder:text-[#9EB2CC] focus:border-[#5B35F5] focus:ring-2 focus:ring-[#5B35F5]/10"
                  disabled={carregando}
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full mt-6 h-10 flex items-center justify-center gap-2 rounded-full bg-[#5B35F5] text-white text-sm font-bold transition hover:bg-[#4D2DE0] disabled:opacity-50"
          >
            {carregando ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {usuarioJaAtivo ? "Aceitando..." : "Ativando..."}
              </>
            ) : (
              usuarioJaAtivo ? "Aceitar e Entrar" : "Criar Conta e Entrar"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
