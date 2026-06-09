import React, { useEffect, useRef, useState } from "react";
import { Bell, Camera, CircleUserRound, Loader2, Shield, User } from "lucide-react";
import { useToastGlobal } from "@/contexts/ToastContext";
import {
  alterarSenha,
  atualizarAvatar,
  atualizarPerfil,
  normalizarPreferencias,
  obterPerfil,
  salvarPreferencias,
  sincronizarUsuarioLocal,
} from "@/services/usuarioService";
import { getUsuarioLogado } from "@/services/auth";
import type { PreferenciasUsuario, Usuario } from "@/types";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3333";

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={checked}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
        checked ? "bg-indigo-600" : "bg-slate-300"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2 text-slate-800">
        <span className="text-indigo-600">{icon}</span>
        <h2 className="text-base font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default function SettingsPage() {
  const toast = useToastGlobal();

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadandoAvatar, setUploadandoAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [preferencias, setPreferencias] = useState<Required<PreferenciasUsuario>>(
    normalizarPreferencias()
  );
  const [preferenciasOriginais, setPreferenciasOriginais] = useState<
    Required<PreferenciasUsuario>
  >(normalizarPreferencias());

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  useEffect(() => {
    const u = getUsuarioLogado();
    if (u) {
      setUsuario(u);
      setNome(u.nome);
      setEmail(u.email);
      const prefs = normalizarPreferencias(u.preferencias);
      setPreferencias(prefs);
      setPreferenciasOriginais(prefs);
    }

    obterPerfil()
      .then((perfil) => {
        sincronizarUsuarioLocal(perfil);
        setUsuario(perfil);
        setNome(perfil.nome);
        setEmail(perfil.email);
        const prefs = normalizarPreferencias(perfil.preferencias);
        setPreferencias(prefs);
        setPreferenciasOriginais(prefs);
      })
      .catch(() => undefined);
  }, []);

  function resolverAvatarUrl(url?: string | null): string | null {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${API_BASE}${url}`;
  }

  const avatarSrc = avatarPreview ?? resolverAvatarUrl(usuario?.foto_url);

  function aplicarUsuarioAtualizado(usuarioAtualizado: Usuario) {
    sincronizarUsuarioLocal(usuarioAtualizado);
    setUsuario(usuarioAtualizado);
    const prefs = normalizarPreferencias(usuarioAtualizado.preferencias);
    setPreferencias(prefs);
    setPreferenciasOriginais(prefs);
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.erro("Selecione uma imagem válida (JPEG, PNG, GIF ou WebP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.erro("A imagem deve ter no máximo 5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setUploadandoAvatar(true);
    try {
      const usuarioAtualizado = await atualizarAvatar(file);
      aplicarUsuarioAtualizado(usuarioAtualizado);
      setAvatarPreview(null);
      toast.sucesso("Foto de perfil atualizada!");
    } catch {
      toast.erro("Erro ao enviar foto. Tente novamente.");
      setAvatarPreview(null);
    } finally {
      setUploadandoAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  }

  function preferenciasMudaram() {
    return JSON.stringify(preferencias) !== JSON.stringify(preferenciasOriginais);
  }

  function senhaFoiPreenchida() {
    return Boolean(senhaAtual || novaSenha || confirmarSenha);
  }

  function alternarPreferencia(chave: keyof PreferenciasUsuario) {
    setPreferencias((prev) => ({ ...prev, [chave]: !prev[chave] }));
  }

  async function handleSalvarConfiguracoes() {
    if (!nome.trim()) {
      toast.erro("O nome não pode ficar vazio.");
      return;
    }

    if (senhaFoiPreenchida()) {
      if (!senhaAtual) {
        toast.erro("Informe sua senha atual.");
        return;
      }
      if (novaSenha.length < 6) {
        toast.erro("A nova senha deve ter pelo menos 6 caracteres.");
        return;
      }
      if (novaSenha !== confirmarSenha) {
        toast.erro("Confirme a nova senha corretamente.");
        return;
      }
    }

    setSalvandoPerfil(true);
    try {
      let usuarioAtualizado = await atualizarPerfil({
        nome: nome.trim(),
        email: email.trim(),
      });

      if (preferenciasMudaram()) {
        const preferenciasAtualizadas = await salvarPreferencias(preferencias);
        usuarioAtualizado = {
          ...usuarioAtualizado,
          preferencias: preferenciasAtualizadas,
        };
      }

      if (senhaFoiPreenchida()) {
        await alterarSenha({
          senha_atual: senhaAtual,
          nova_senha: novaSenha,
        });
        setSenhaAtual("");
        setNovaSenha("");
        setConfirmarSenha("");
      }

      aplicarUsuarioAtualizado(usuarioAtualizado);

      if (preferencias.notif_push && "Notification" in window) {
        Notification.requestPermission().catch(() => undefined);
      }

      toast.sucesso("Configurações salvas com sucesso!");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Erro ao salvar. Tente novamente.";
      toast.erro(msg);
    } finally {
      setSalvandoPerfil(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <main className="mx-auto max-w-3xl px-4 pt-6 md:pt-16 pb-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Configurações</h1>
          <p className="mt-1 text-sm text-slate-500">Gerencie suas preferências</p>
        </div>

        <div className="space-y-5">
          <SectionCard icon={<CircleUserRound size={18} />} title="Perfil">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="flex items-center gap-4">
                <div
                  className="relative h-16 w-16 cursor-pointer group"
                  onClick={() => !uploadandoAvatar && avatarInputRef.current?.click()}
                >
                  <div className="h-16 w-16 rounded-full overflow-hidden bg-slate-200 ring-4 ring-slate-50">
                    {avatarSrc ? (
                      <img
                        src={avatarSrc}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <User size={24} className="text-slate-400" />
                      </div>
                    )}
                  </div>

                  <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {uploadandoAvatar ? (
                      <Loader2 size={18} className="text-white animate-spin" />
                    ) : (
                      <Camera size={18} className="text-white" />
                    )}
                  </div>
                </div>

                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={uploadandoAvatar}
                />

                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadandoAvatar}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {uploadandoAvatar && <Loader2 size={14} className="animate-spin" />}
                  {uploadandoAvatar ? "Enviando..." : "Alterar foto"}
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">Nome</span>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome completo"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@email.com"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </label>
            </div>
          </SectionCard>

          <SectionCard icon={<Bell size={18} />} title="Notificações">
            <div className="space-y-4">
              {[
                [
                  "Notificações da plataforma",
                  "Exibir avisos gerais no centro de notificações",
                  preferencias.notif_plataforma,
                  "notif_plataforma",
                ],
                [
                  "Notificações push",
                  "Notificações no navegador",
                  preferencias.notif_push,
                  "notif_push",
                ],
                [
                  "Atualizações de tarefas",
                  "Quando tarefas são criadas ou atualizadas",
                  preferencias.notif_tarefas,
                  "notif_tarefas",
                ],
                [
                  "Comentários",
                  "Quando alguém comentar em suas tarefas",
                  preferencias.notif_comentarios,
                  "notif_comentarios",
                ],
              ].map(([title, desc, checked, chave]) => (
                <div key={title as string} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{title as string}</p>
                    <p className="text-xs text-slate-400">{desc as string}</p>
                  </div>
                  <Toggle
                    checked={checked as boolean}
                    onChange={() => alternarPreferencia(chave as keyof PreferenciasUsuario)}
                  />
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard icon={<Shield size={18} />} title="Segurança">
            <div className="grid gap-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">Senha atual</span>
                <input
                  type="password"
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  autoComplete="current-password"
                  placeholder=""
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">Nova senha</span>
                <input
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  autoComplete="new-password"
                  placeholder=""
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">Confirmar nova senha</span>
                <input
                  type="password"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  autoComplete="new-password"
                  placeholder=""
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </label>
            </div>
          </SectionCard>

          <div className="flex justify-end pb-4">
            <button
              type="button"
              onClick={handleSalvarConfiguracoes}
              disabled={salvandoPerfil}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {salvandoPerfil && <Loader2 size={16} className="animate-spin" />}
              {salvandoPerfil ? "Salvando..." : "Salvar Configurações"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
