/**
 * NotificacoesSistemaContext
 *
 * Gerencia as notificações persistentes do banco de dados:
 * - Polling a cada 30s para manter a contagem atualizada
 * - Expõe lista completa, contagem de não-lidas e ações (marcar, deletar)
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import type { NotificacaoSistema } from "@/types";
import * as notificacaoService from "@/services/notificacaoService";
import { getUsuarioLogado } from "@/services/auth";

interface NotificacoesSistemaContextType {
  notificacoes: NotificacaoSistema[];
  totalNaoLidas: number;
  carregando: boolean;
  recarregar: () => Promise<void>;
  marcarComoLida: (id: string) => Promise<void>;
  marcarComoNaoLida: (id: string) => Promise<void>;
  marcarTodasComoLidas: () => Promise<void>;
  deletarNotificacao: (id: string) => Promise<void>;
  limparLidas: () => Promise<void>;
}

const NotificacoesSistemaContext = createContext<
  NotificacoesSistemaContextType | undefined
>(undefined);

const POLLING_INTERVAL_MS = 10_000; // 10 segundos

export function NotificacoesSistemaProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notificacoes, setNotificacoes] = useState<NotificacaoSistema[]>([]);
  const [totalNaoLidas, setTotalNaoLidas] = useState(0);
  const [carregando, setCarregando] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const recarregar = useCallback(async () => {
    // Só busca se há um usuário logado
    const usuario = getUsuarioLogado();
    if (!usuario) return;

    try {
      setCarregando(true);
      const dados = await notificacaoService.listarNotificacoes();
      setNotificacoes(dados.notificacoes);
      setTotalNaoLidas(dados.totalNaoLidas);
    } catch {
      // Silencia erros de polling — não interrompe a UX
    } finally {
      setCarregando(false);
    }
  }, []);

  // Polling automático a cada 10 segundos + recarregar ao voltar à aba
  useEffect(() => {
    recarregar();

    intervalRef.current = setInterval(recarregar, POLLING_INTERVAL_MS);

    // Recarregar imediatamente quando o usuário volta à aba
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        recarregar();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [recarregar]);

  const marcarComoLida = useCallback(async (id: string) => {
    await notificacaoService.marcarComoLida(id);
    setNotificacoes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: "LIDA" as const } : n))
    );
    setTotalNaoLidas((prev) => Math.max(0, prev - 1));
  }, []);

  const marcarComoNaoLida = useCallback(async (id: string) => {
    await notificacaoService.marcarComoNaoLida(id);
    setNotificacoes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: "NAO_LIDA" as const } : n))
    );
    setTotalNaoLidas((prev) => prev + 1);
  }, []);

  const marcarTodasComoLidas = useCallback(async () => {
    await notificacaoService.marcarTodasComoLidas();
    setNotificacoes((prev) => prev.map((n) => ({ ...n, status: "LIDA" as const })));
    setTotalNaoLidas(0);
  }, []);

  const deletarNotificacao = useCallback(async (id: string) => {
    const notificacao = notificacoes.find((n) => n.id === id);
    await notificacaoService.deletarNotificacao(id);
    setNotificacoes((prev) => prev.filter((n) => n.id !== id));
    if (notificacao?.status === "NAO_LIDA") {
      setTotalNaoLidas((prev) => Math.max(0, prev - 1));
    }
  }, [notificacoes]);

  const limparLidas = useCallback(async () => {
    await notificacaoService.limparNotificacoesLidas();
    setNotificacoes((prev) => prev.filter((n) => n.status === "NAO_LIDA"));
  }, []);

  return (
    <NotificacoesSistemaContext.Provider
      value={{
        notificacoes,
        totalNaoLidas,
        carregando,
        recarregar,
        marcarComoLida,
        marcarComoNaoLida,
        marcarTodasComoLidas,
        deletarNotificacao,
        limparLidas,
      }}
    >
      {children}
    </NotificacoesSistemaContext.Provider>
  );
}

export function useNotificacoesSistema() {
  const context = useContext(NotificacoesSistemaContext);
  if (!context) {
    throw new Error(
      "useNotificacoesSistema deve ser usado dentro de NotificacoesSistemaProvider"
    );
  }
  return context;
}
