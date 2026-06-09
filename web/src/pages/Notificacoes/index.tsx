import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {Bell, BellOff, Check, CheckCheck, CheckCircle2, CircleAlert, CircleDot, Clock, FolderOpen, Info, Loader2, MessageSquare, MoreVertical, Paperclip, Plus, RefreshCw, Trash2, UserPlus, Zap,} from "lucide-react";
import { ConfirmDeleteModal } from "@/components/Modal/ConfirmDeleteModal";
import { useNotificacoesSistema } from "@/contexts/NotificacoesSistemaContext";
import type { NotificacaoSistema, TipoNotificacao } from "@/types";


function getIconePorTipo(tipo: TipoNotificacao) {
  switch (tipo) {
    case "TAREFA_CRIADA":
      return <Plus size={17} className="text-emerald-500" />;
    case "TAREFA_ATRIBUIDA":
      return <Zap size={17} className="text-indigo-500" />;
    case "TAREFA_ATUALIZADA":
      return <RefreshCw size={17} className="text-blue-500" />;
    case "TAREFA_CONCLUIDA":
      return <CheckCircle2 size={17} className="text-green-500" />;
    case "TAREFA_EXCLUIDA":
      return <Trash2 size={17} className="text-red-500" />;
    case "ANEXO_ADICIONADO":
      return <Paperclip size={17} className="text-amber-500" />;
    case "MEMBRO_ADICIONADO_PROJETO":
      return <UserPlus size={17} className="text-emerald-500" />;
    case "PROJETO_ATUALIZADO":
      return <FolderOpen size={17} className="text-blue-500" />;
    case "COMENTARIO_ADICIONADO":
      return <MessageSquare size={17} className="text-violet-500" />;
    case "PRAZO_24H":
      return <CircleAlert size={17} className="text-red-500" />;
    case "PRAZO_48H":
      return <Clock size={17} className="text-orange-400" />;
    case "TAREFA_MOVIDA":
      return <Check size={17} className="text-emerald-500" />;
    default:
      return <Info size={17} className="text-slate-400" />;
  }
}

function getBgPorTipo(tipo: TipoNotificacao, lida: boolean): string {
  if (lida) return "bg-white border-slate-200";
  switch (tipo) {
    case "PRAZO_24H":
      return "bg-red-50 border-red-200";
    case "PRAZO_48H":
      return "bg-orange-50 border-orange-200";
    case "TAREFA_EXCLUIDA":
      return "bg-red-50 border-red-200";
    case "TAREFA_CONCLUIDA":
      return "bg-green-50 border-green-200";
    case "TAREFA_CRIADA":
    case "MEMBRO_ADICIONADO_PROJETO":
      return "bg-emerald-50 border-emerald-200";
    case "TAREFA_ATRIBUIDA":
    case "TAREFA_MOVIDA":
      return "bg-indigo-50 border-indigo-200";
    case "TAREFA_ATUALIZADA":
      return "bg-blue-50 border-blue-200";
    case "ANEXO_ADICIONADO":
      return "bg-amber-50 border-amber-200";
    default:
      return "bg-[#eeeaff] border-[#b8a9ff]";
  }
}

function getBadgePorTipo(tipo: TipoNotificacao, lida: boolean): string {
  if (lida) return "bg-slate-300";
  switch (tipo) {
    case "PRAZO_24H":
    case "TAREFA_EXCLUIDA":
      return "bg-red-500";
    case "PRAZO_48H":
      return "bg-orange-400";
    case "TAREFA_CONCLUIDA":
      return "bg-green-500";
    case "TAREFA_CRIADA":
    case "MEMBRO_ADICIONADO_PROJETO":
      return "bg-emerald-500";
    case "TAREFA_ATUALIZADA":
      return "bg-blue-500";
    case "ANEXO_ADICIONADO":
      return "bg-amber-500";
    default:
      return "bg-indigo-500";
  }
}

function formatarTempo(isoString: string): string {
  const agora = new Date();
  const data = new Date(isoString);
  const diffMs = agora.getTime() - data.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffDias = Math.floor(diffH / 24);

  if (diffMin < 1) return "agora mesmo";
  if (diffMin < 60) return `${diffMin} min atrás`;
  if (diffH < 24) return `${diffH}h atrás`;
  if (diffDias === 1) return "ontem";
  if (diffDias < 7) return `${diffDias} dias atrás`;
  return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

type Grupo = "Hoje" | "Ontem" | "Esta Semana" | "Mais Antigas";

function getGrupo(isoString: string): Grupo {
  const agora = new Date();
  const data = new Date(isoString);
  const diffMs = agora.getTime() - data.getTime();
  const diffDias = Math.floor(diffMs / 86400000);

  if (diffDias < 1) return "Hoje";
  if (diffDias < 2) return "Ontem";
  if (diffDias < 7) return "Esta Semana";
  return "Mais Antigas";
}

const GRUPOS: Grupo[] = ["Hoje", "Ontem", "Esta Semana", "Mais Antigas"];

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
export default function NotificacoesPage() {
  const navigate = useNavigate();
  const {
    notificacoes,
    totalNaoLidas,
    carregando,
    recarregar,
    marcarComoLida,
    marcarComoNaoLida,
    marcarTodasComoLidas,
    deletarNotificacao,
    limparLidas,
  } = useNotificacoesSistema();

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [acaoEmAndamento, setAcaoEmAndamento] = useState<string | null>(null);

  // Fechar menu ao clicar fora
  useEffect(() => {
    if (!openMenuId) return;
    const handler = () => setOpenMenuId(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [openMenuId]);

  // Recarregar ao entrar na página
  useEffect(() => {
    recarregar();
  }, [recarregar]);

  // ── Ações ──────────────────────────────────────────────────────────────────
  async function handleMarcarLida(id: string) {
    setAcaoEmAndamento(id);
    try {
      await marcarComoLida(id);
    } finally {
      setAcaoEmAndamento(null);
      setOpenMenuId(null);
    }
  }

  async function handleMarcarNaoLida(id: string) {
    setAcaoEmAndamento(id);
    try {
      await marcarComoNaoLida(id);
    } finally {
      setAcaoEmAndamento(null);
      setOpenMenuId(null);
    }
  }

  async function handleMarcarTodas() {
    setAcaoEmAndamento("todas");
    try {
      await marcarTodasComoLidas();
    } finally {
      setAcaoEmAndamento(null);
    }
  }

  async function handleDeletar() {
    if (!deleteTargetId) return;
    setAcaoEmAndamento(deleteTargetId);
    try {
      await deletarNotificacao(deleteTargetId);
    } finally {
      setAcaoEmAndamento(null);
      setDeleteTargetId(null);
    }
  }

  async function handleLimparLidas() {
    setAcaoEmAndamento("limpar");
    try {
      await limparLidas();
    } finally {
      setAcaoEmAndamento(null);
    }
  }

  function handleClicarNotificacao(n: NotificacaoSistema) {
    if (n.status === "NAO_LIDA") marcarComoLida(n.id);
    if (n.tarefaId && n.tarefa?.id_projeto) {
      navigate(`/kamban?projeto=${n.tarefa.id_projeto}&tarefa=${n.tarefaId}`);
    } else if (n.projetoId) {
      navigate(`/projetos`);
    }
  }

  // ── Agrupamento ────────────────────────────────────────────────────────────

  const agrupadas: Record<Grupo, NotificacaoSistema[]> = {
    "Hoje": [],
    "Ontem": [],
    "Esta Semana": [],
    "Mais Antigas": [],
  };

  for (const n of notificacoes) {
    agrupadas[getGrupo(n.createdAt)].push(n);
  }

  const deleteTarget = notificacoes.find((n) => n.id === deleteTargetId);
  const temNotificacoes = notificacoes.length > 0;
  const temLidas = notificacoes.some((n) => n.status === "LIDA");


  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-6 md:pt-16 pb-10 min-h-screen bg-slate-50">
      <div className="max-w-[780px]">

        {/* ── Cabeçalho ─────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-7">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Notificações</h1>
            <p className="text-sm text-slate-500 mt-1">
              {carregando && acaoEmAndamento === null ? (
                <span className="inline-flex items-center gap-1.5">
                  <Loader2 size={13} className="animate-spin" />
                  Atualizando...
                </span>
              ) : totalNaoLidas > 0 ? (
                <>
                  <span className="font-semibold text-indigo-600">{totalNaoLidas}</span>{" "}
                  não lida{totalNaoLidas !== 1 ? "s" : ""}
                </>
              ) : (
                "Tudo em dia por aqui ✓"
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Limpar lidas */}
            {temLidas && (
              <button
                onClick={handleLimparLidas}
                disabled={acaoEmAndamento === "limpar"}
                className="inline-flex h-[37px] items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-500 hover:border-red-200 disabled:opacity-50"
              >
                {acaoEmAndamento === "limpar" ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                Limpar lidas
              </button>
            )}

            {/* Marcar todas como lidas */}
            {totalNaoLidas > 0 && (
              <button
                onClick={handleMarcarTodas}
                disabled={acaoEmAndamento === "todas"}
                className="inline-flex h-[37px] items-center gap-2 rounded-full border border-[#DDE7F3] bg-white px-4 text-sm font-semibold text-[#344158] transition hover:bg-slate-50 disabled:opacity-50"
              >
                {acaoEmAndamento === "todas" ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <CheckCheck size={15} />
                )}
                Marcar todas como lidas
              </button>
            )}
          </div>
        </div>

        {/* ── Estado vazio ──────────────────────────────────────────────────── */}
        {!carregando && !temNotificacoes && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <BellOff size={28} className="text-slate-300" />
            </div>
            <h3 className="text-base font-semibold text-slate-700 mb-1">
              Nenhuma notificação
            </h3>
            <p className="text-sm text-slate-400">
              Quando houver novidades, elas aparecerão aqui.
            </p>
          </div>
        )}

        {/* ── Lista agrupada ────────────────────────────────────────────────── */}
        {GRUPOS.map((grupo) => {
          const itens = agrupadas[grupo];
          if (itens.length === 0) return null;

          return (
            <div key={grupo} className="mb-8">
              {/* Título do grupo */}
              <div className="mb-3">
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {grupo}
                </h2>
                <div className="h-px bg-slate-200 mt-2" />
              </div>

              <div className="space-y-2">
                {itens.map((n) => {
                  const lida = n.status === "LIDA";
                  const emAndamento = acaoEmAndamento === n.id;

                  return (
                    <div
                      key={n.id}
                      className={`
                        relative rounded-xl border p-4 flex items-start gap-4
                        transition-all duration-200
                        ${openMenuId === n.id ? "z-10" : ""}
                        ${getBgPorTipo(n.tipo, lida)}
                        ${lida ? "opacity-80" : ""}
                        ${!lida ? "cursor-pointer hover:shadow-sm" : ""}
                      `}
                      onClick={() => !lida && handleClicarNotificacao(n)}
                    >
                      {/* Ícone do tipo */}
                      <div className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                        {getIconePorTipo(n.tipo)}
                      </div>

                      {/* Conteúdo */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-relaxed ${lida ? "text-slate-500" : "text-slate-800 font-medium"}`}>
                          {n.mensagem}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-xs text-slate-400">
                            {formatarTempo(n.createdAt)}
                          </span>
                          {n.projeto && (
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <FolderOpen size={11} />
                              {n.projeto.nome}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Indicador não-lida */}
                      {!lida && (
                        <span
                          className={`absolute top-3.5 right-10 w-2 h-2 rounded-full shrink-0 ${getBadgePorTipo(n.tipo, lida)}`}
                        />
                      )}

                      {/* Spinner de ação */}
                      {emAndamento && (
                        <div className="absolute inset-0 rounded-xl bg-white/60 flex items-center justify-center">
                          <Loader2 size={20} className="animate-spin text-slate-400" />
                        </div>
                      )}

                      {/* Menu de ações */}
                      <div
                        className="relative shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === n.id ? null : n.id);
                          }}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                        >
                          <MoreVertical size={18} />
                        </button>

                        {openMenuId === n.id && (
                          <div
                            className="absolute right-0 top-8 w-[200px] bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1 overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {lida ? (
                              <button
                                onClick={() => handleMarcarNaoLida(n.id)}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                              >
                                <CircleDot size={15} />
                                Marcar como não lida
                              </button>
                            ) : (
                              <button
                                onClick={() => handleMarcarLida(n.id)}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                              >
                                <Check size={15} />
                                Marcar como lida
                              </button>
                            )}

                            {n.tarefaId && (
                              <button
                                onClick={() => {
                                  setOpenMenuId(null);
                                  handleClicarNotificacao(n);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                              >
                                <Zap size={15} />
                                Ver tarefa
                              </button>
                            )}

                            <div className="h-px bg-slate-100 my-1" />

                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                setDeleteTargetId(n.id);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 size={15} />
                              Excluir
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* ── Loading inicial ────────────────────────────────────────────────── */}
        {carregando && notificacoes.length === 0 && (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200 bg-white p-4 flex items-start gap-4 animate-pulse"
              >
                <div className="w-9 h-9 rounded-full bg-slate-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de confirmação de exclusão */}
      <ConfirmDeleteModal
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeletar}
        title="Excluir notificação"
        description={`Tem certeza que deseja excluir esta notificação?`}
        confirmLabel="Excluir"
      />
    </div>
  );
}