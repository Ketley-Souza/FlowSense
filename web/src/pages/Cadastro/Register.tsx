import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Camera, Loader2, User } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { registrarComFormData } from "@/services/auth";

export default function Register() {
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [login, setLogin] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const fotoInputRef = useRef<HTMLInputElement>(null);

  function handleFotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErro("Selecione uma imagem válida (JPEG, PNG, GIF ou WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErro("A imagem deve ter no máximo 5 MB.");
      return;
    }

    setFotoFile(file);
    setErro(null);

    const reader = new FileReader();
    reader.onload = (ev) => setFotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);

    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setCarregando(true);

    try {
      const formData = new FormData();
      formData.append("nome", nome);
      formData.append("email", email);
      formData.append("login", login);
      formData.append("senha", senha);
      if (fotoFile) {
        formData.append("foto", fotoFile);
      }

      await registrarComFormData(formData);
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
            Comece com a sua equipe
          </h1>

          <p className="max-w-[380px] text-sm leading-[1.7] opacity-90">
            Crie sua conta para organizar projetos, acompanhar entregas e colaborar
            com mais clareza desde o primeiro acesso.
          </p>

          <div className="mt-10 flex items-center gap-2 text-sm opacity-90">
            <span aria-hidden="true">-</span>
            <span>Seu fluxo de trabalho começa aqui</span>
          </div>
        </div>

        {/* DIREITA */}
        <div className="flex w-1/2 items-center justify-center bg-white md:bg-[#f9fafb] max-md:w-full max-md:px-5 max-md:py-6">
          <div className="w-[75%] max-md:w-full max-md:max-w-md">

            <h2 className="mb-1 text-[26px] font-semibold">
              Criar conta
            </h2>

            <p className="mb-4 text-[13px] text-gray-500">
              Preencha os dados abaixo para começar
            </p>

            <div className="mb-4 flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
              <button
                type="button"
                onClick={() => fotoInputRef.current?.click()}
                className="group relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 outline-none transition hover:border-slate-300 focus-visible:ring-2 focus-visible:ring-slate-300"
                aria-label={fotoPreview ? "Trocar foto de perfil" : "Adicionar foto de perfil"}
              >
                {fotoPreview ? (
                  <img
                    src={fotoPreview}
                    alt="Preview da foto de perfil"
                    className="h-full w-full object-cover object-center"
                  />
                ) : (
                  <User size={24} className="text-slate-400" />
                )}

                <span className="absolute inset-0 grid place-items-center bg-slate-900/45 text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                  <Camera size={18} />
                </span>
              </button>

              <div className="min-w-0 flex-1 text-left">
                <p className="text-[12.5px] font-medium text-gray-800">
                  Foto de perfil
                </p>
                {fotoFile && (
                  <p className="mt-1 truncate text-xs text-gray-500">
                    {fotoFile.name}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => fotoInputRef.current?.click()}
                  className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-[#6c2bd9] outline-none transition hover:text-[#5120b2] focus-visible:rounded focus-visible:ring-2 focus-visible:ring-[#6c2bd9]/20"
                >
                  <Camera size={13} />
                  {fotoPreview ? "Trocar foto" : "Adicionar foto"}
                </button>
              </div>

              <input
                ref={fotoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={handleFotoChange}
              />
            </div>

            <form onSubmit={handleSubmit}>
              {/* ERRO */}
              {erro && (
                <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-left text-sm text-red-600">
                  {erro}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
                <div>
                  <label className="block text-[12.5px] text-gray-700">
                    Nome completo
                  </label>
                  <input
                    type="text"
                    placeholder="Seu nome completo"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                    className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm outline-none focus:border-[#6c2bd9] focus:ring-2 focus:ring-[#6c2bd9]/10"
                  />
                </div>

                <div>
                  <label className="block text-[12.5px] text-gray-700">
                    Usuário
                  </label>
                  <input
                    type="text"
                    placeholder="usuario123"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    required
                    className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm outline-none focus:border-[#6c2bd9] focus:ring-2 focus:ring-[#6c2bd9]/10"
                  />
                </div>
              </div>

              <label className="mt-3 block text-[12.5px] text-gray-700">
                Email
              </label>
              <input
                type="email"
                placeholder="nome@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm outline-none focus:border-[#6c2bd9] focus:ring-2 focus:ring-[#6c2bd9]/10"
              />

              <div className="mt-3 grid grid-cols-2 gap-3 max-sm:grid-cols-1">
                <div>
                  <label className="block text-[12.5px] text-gray-700">
                    Senha
                  </label>
                  <input
                    type="password"
                    placeholder="Mín. 6 caracteres"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                    className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm outline-none focus:border-[#6c2bd9] focus:ring-2 focus:ring-[#6c2bd9]/10"
                  />
                </div>

                <div>
                  <label className="block text-[12.5px] text-gray-700">
                    Confirmar senha
                  </label>
                  <input
                    type="password"
                    placeholder="Repita a senha"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    required
                    className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm outline-none focus:border-[#6c2bd9] focus:ring-2 focus:ring-[#6c2bd9]/10"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={carregando}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#5f5bff] to-[#6c2bd9] py-3 text-sm text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {carregando && <Loader2 size={16} className="animate-spin" />}
                {carregando ? "Criando conta..." : "Criar conta"}
              </button>
            </form>

            <p className="mt-4 text-center text-[13px] text-gray-500">
              Já tem uma conta?{" "}
              <Link to="/login" className="font-medium text-[#6c2bd9]">
                Entrar
              </Link>
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}
