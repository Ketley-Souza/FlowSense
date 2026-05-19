import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, UserPlus, Users } from "lucide-react";
import { useEquipesStore } from "@/store/useEquipesStore";
import { useToastGlobal } from "@/contexts/ToastContext";
import type { CargoConvite, Equipe, UsuarioEquipe } from "@/types";
import type { StatusFiltro } from "./components/types";

import { TeamHeader } from "./components/TeamHeader";
import { TeamSwitcher } from "./components/TeamSwitcher";
import { TeamInsights } from "./components/TeamInsights";
import { MembersToolbar } from "./components/MembersToolbar";
import { MembersList } from "./components/MembersList";
import { ActivitySnapshot } from "./components/ActivitySnapshot";

import { ModalConvidarMembro } from "./ModalConvidarMembro";
import { ModalEditarEquipe } from "./ModalEditarEquipe";
import { ModalCriarEquipe } from "./ModalCriarEquipe";
import { ModalConfirmarDeletar } from "./ModalConfirmarDeletar";

/** Skeleton que espelha a geometria exata de um MemberRow */
function MemberRowSkeleton() {
  return (
    <div className="flex items-center gap-3 border-t border-slate-100 px-5 py-3">
      <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-slate-100" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 w-36 animate-pulse rounded bg-slate-100" />
        <div className="h-3 w-48 animate-pulse rounded bg-slate-100" />
      </div>
      <div className="hidden h-5 w-16 animate-pulse rounded bg-slate-100 lg:block" />
      <div className="hidden h-5 w-14 animate-pulse rounded bg-slate-100 lg:block" />
      <div className="hidden h-5 w-24 animate-pulse rounded bg-slate-100 lg:block" />
    </div>
  );
}

export default function EquipePage() {
  /* ─── Store ─────────────────────────────────────────────────────────── */
  const {
    equipes,
    equipeAtiva,
    listar,
    listarMembros,
    convidarMembro,
    atualizar,
    deletar,
    carregando,
    erro,
    definirAtiva,
    criar,
  } = useEquipesStore();

  const toast = useToastGlobal();

  /* ─── Estado local ───────────────────────────────────────────────────── */
  const [membros, setMembros] = useState<UsuarioEquipe[]>([]);
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<StatusFiltro>("TODOS");
  const [modalAberto, setModalAberto] = useState<
    "convidar" | "criar" | "editar" | "confirmar-deletar" | null
  >(null);
  const [carregandoMembros, setCarregandoMembros] = useState(false);
  const [enviando, setEnviando] = useState(false);

  /* ─── Helpers ────────────────────────────────────────────────────────── */
  function resetFiltros() {
    setBusca("");
    setStatusFiltro("TODOS");
  }

  async function recarregarMembrosAtual() {
    if (!equipeAtiva?.id) return;
    setCarregandoMembros(true);
    try {
      const data = await listarMembros(equipeAtiva.id);
      setMembros(data || []);
    } catch {
      setMembros([]);
    } finally {
      setCarregandoMembros(false);
    }
  }

  /* ─── Effects ────────────────────────────────────────────────────────── */
  useEffect(() => {
    listar();
  }, [listar]);

  useEffect(() => {
    const equipeId = equipeAtiva?.id;
    let cancelado = false;
    if (!equipeId) return;

    Promise.resolve().then(async () => {
      if (cancelado) return;
      setCarregandoMembros(true);
      try {
        const data = await listarMembros(equipeId);
        if (!cancelado) setMembros(data || []);
      } catch {
        if (!cancelado) setMembros([]);
      } finally {
        if (!cancelado) setCarregandoMembros(false);
      }
    });

    return () => {
      cancelado = true;
    };
  }, [equipeAtiva?.id, listarMembros]);

  /* ─── Handlers ───────────────────────────────────────────────────────── */
  function handleDefinirAtiva(equipe: Equipe) {
    resetFiltros();
    definirAtiva(equipe);
  }

  async function handleConvidar(nome: string, email: string, cargo: CargoConvite) {
    if (!equipeAtiva) return;
    setEnviando(true);
    try {
      await convidarMembro(equipeAtiva.id, { nome, email, cargo });
      toast.sucesso("Convite enviado com sucesso!");
      setModalAberto(null);
      await recarregarMembrosAtual();
    } catch (e) {
      toast.erro(e instanceof Error ? e.message : "Erro ao convidar");
    } finally {
      setEnviando(false);
    }
  }

  async function handleCriarEquipe(nome: string) {
    setEnviando(true);
    try {
      const nova = await criar({ nome });
      toast.sucesso("Equipe criada!");
      resetFiltros();
      definirAtiva(nova);
      setModalAberto(null);
    } catch (e) {
      toast.erro(e instanceof Error ? e.message : "Erro ao criar equipe");
    } finally {
      setEnviando(false);
    }
  }

  async function handleEditarEquipe(nome: string, descricao: string) {
    if (!equipeAtiva) return;
    setEnviando(true);
    try {
      const atualizada = await atualizar(equipeAtiva.id, { nome, descricao });
      toast.sucesso("Equipe atualizada!");
      definirAtiva(atualizada);
      setModalAberto(null);
    } catch (e) {
      toast.erro(e instanceof Error ? e.message : "Erro ao atualizar");
    } finally {
      setEnviando(false);
    }
  }

  async function handleDeletarEquipe() {
    if (!equipeAtiva) return;
    setEnviando(true);
    try {
      await deletar(equipeAtiva.id);
      toast.sucesso("Equipe excluída.");
      setModalAberto(null);
      const proxima = equipes.find((eq) => eq.id !== equipeAtiva.id);
      if (proxima) {
        resetFiltros();
        definirAtiva(proxima);
      }
    } catch (e) {
      toast.erro(e instanceof Error ? e.message : "Erro ao deletar");
    } finally {
      setEnviando(false);
    }
  }

  /* ─── Dados derivados ────────────────────────────────────────────────── */
  const totais = useMemo(() => {
    const ativos = membros.filter((m) => m.status === "ATIVO").length;
    const pendentes = membros.filter((m) => m.status === "PENDENTE").length;
    const gestores = membros.filter((m) =>
      ["ADMIN", "GERENTE"].includes(m.cargo)
    ).length;
    return { ativos, pendentes, gestores };
  }, [membros]);

  const membrosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return membros.filter((m) => {
      const correspondeBusca =
        !termo ||
        m.usuario.nome.toLowerCase().includes(termo) ||
        m.usuario.email.toLowerCase().includes(termo);
      const correspondeStatus =
        statusFiltro === "TODOS" || m.status === statusFiltro;
      return correspondeBusca && correspondeStatus;
    });
  }, [busca, membros, statusFiltro]);

  const membrosAtivos = membrosFiltrados.filter((m) => m.status !== "PENDENTE");
  const membrosPendentes = membrosFiltrados.filter((m) => m.status === "PENDENTE");

  /* ─── Render: loading inicial ────────────────────────────────────────── */
  if (carregando && equipes.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-slate-400" size={24} />
        <p className="text-sm text-slate-400">Carregando equipes…</p>
      </div>
    );
  }

  /* ─── Render: sem equipes ────────────────────────────────────────────── */
  if (!carregando && equipes.length === 0) {
    return (
      <div className="px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="mx-auto w-full max-w-7xl">
          <header className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              FlowSense
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Equipe
            </h1>
            <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
              Crie seu primeiro espaço para organizar colaboração, permissões e
              produtividade em torno dos projetos.
            </p>
          </header>

          <div className="rounded-lg border border-slate-200 bg-white px-6 py-14 text-center shadow-sm shadow-slate-200/40">
            <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950 text-white">
              <Users size={22} />
            </div>
            <h2 className="text-base font-semibold text-slate-950">
              Nenhuma equipe criada
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Comece com uma equipe enxuta e convide as pessoas certas quando o
              fluxo estiver pronto.
            </p>
            <button
              id="create-first-team"
              onClick={() => setModalAberto("criar")}
              className="mt-6 inline-flex h-9 items-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Plus size={15} />
              Criar primeira equipe
            </button>
          </div>
        </div>

        <ModalCriarEquipe
          isOpen={modalAberto === "criar"}
          onClose={() => setModalAberto(null)}
          onSubmit={handleCriarEquipe}
          enviando={enviando}
        />
      </div>
    );
  }

  /* ─── Render: main ───────────────────────────────────────────────────── */
  return (
    <div className="px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 sm:gap-6">
        {/* ── Page header ── */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              FlowSense
            </p>
            <h1 className="mt-1.5 text-3xl font-semibold tracking-tight text-slate-950">
              Equipe
            </h1>
            <p className="mt-1.5 max-w-lg text-sm leading-6 text-slate-500">
              Gerencie colaboração, permissões e sinais operacionais com clareza.
            </p>
          </div>

          {/* TeamSwitcher com "Nova equipe" integrado */}
          <div className="shrink-0">
            <TeamSwitcher
              equipes={equipes}
              equipeAtiva={equipeAtiva}
              onSelect={handleDefinirAtiva}
              onNova={() => setModalAberto("criar")}
            />
          </div>
        </header>

        {/* ── Conteúdo principal ── */}
        {equipeAtiva && (
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_296px]">
            {/* Painel esquerdo */}
            <main className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
              <TeamHeader
                equipe={equipeAtiva}
                totalMembros={membros.length}
                totalAtivos={totais.ativos}
                totalPendentes={totais.pendentes}
                onInvite={() => setModalAberto("convidar")}
                onEdit={() => setModalAberto("editar")}
                onDelete={() => setModalAberto("confirmar-deletar")}
              />

              <TeamInsights
                totalMembros={membros.length}
                totalAtivos={totais.ativos}
                totalPendentes={totais.pendentes}
                totalGestores={totais.gestores}
              />

              {/* Erro inline */}
              {erro && (
                <div className="mx-5 mt-4 rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {erro}
                </div>
              )}

              <MembersToolbar
                busca={busca}
                statusFiltro={statusFiltro}
                totalResultados={membrosFiltrados.length}
                onBuscaChange={setBusca}
                onStatusChange={setStatusFiltro}
              />

              {/* Lista ou skeleton */}
              {carregandoMembros ? (
                <div className="border-t border-slate-100">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <MemberRowSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <MembersList
                  membrosAtivos={membrosAtivos}
                  membrosPendentes={membrosPendentes}
                  busca={busca}
                  onClearBusca={() => setBusca("")}
                  onInvite={() => setModalAberto("convidar")}
                />
              )}
            </main>

            {/* Sidebar */}
            <ActivitySnapshot
              membros={membros}
              totalPendentes={totais.pendentes}
              equipe={equipeAtiva}
            />
          </div>
        )}
      </div>

      {/* ── FAB mobile ── */}
      {equipeAtiva && (
        <button
          id="fab-invite"
          onClick={() => setModalAberto("convidar")}
          className="fixed bottom-5 right-5 z-30 inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 text-white shadow-xl shadow-slate-950/20 transition hover:bg-slate-800 sm:hidden"
          title="Convidar membro"
          aria-label="Convidar membro"
        >
          <UserPlus size={20} />
        </button>
      )}

      {/* ── Modais ── */}
      <ModalConvidarMembro
        isOpen={modalAberto === "convidar"}
        onClose={() => setModalAberto(null)}
        onSubmit={handleConvidar}
        enviando={enviando}
      />
      <ModalCriarEquipe
        isOpen={modalAberto === "criar"}
        onClose={() => setModalAberto(null)}
        onSubmit={handleCriarEquipe}
        enviando={enviando}
      />
      <ModalEditarEquipe
        isOpen={modalAberto === "editar"}
        onClose={() => setModalAberto(null)}
        onSubmit={handleEditarEquipe}
        nomeInicial={equipeAtiva?.nome ?? ""}
        descricaoInicial={equipeAtiva?.descricao ?? ""}
        enviando={enviando}
      />
      <ModalConfirmarDeletar
        isOpen={modalAberto === "confirmar-deletar"}
        onClose={() => setModalAberto(null)}
        onConfirm={handleDeletarEquipe}
        equipeName={equipeAtiva?.nome ?? ""}
        enviando={enviando}
      />
    </div>
  );
}
