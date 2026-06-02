import api from "./api";
import type { ListarNotificacoesResponse, NotificacaoSistema } from "@/types";

/**
 * Lista todas as notificações do usuário autenticado.
 */
export async function listarNotificacoes(): Promise<ListarNotificacoesResponse> {
  const response = await api.get<ListarNotificacoesResponse>("/notificacoes");
  return response.data;
}

/**
 * Retorna apenas o número de notificações não-lidas (para o badge).
 */
export async function contarNaoLidas(): Promise<number> {
  const response = await api.get<{ count: number }>("/notificacoes/contagem");
  return response.data.count;
}

/**
 * Marca uma notificação específica como lida.
 */
export async function marcarComoLida(id: string): Promise<NotificacaoSistema> {
  const response = await api.patch<NotificacaoSistema>(`/notificacoes/${id}/ler`);
  return response.data;
}

/**
 * Marca uma notificação específica como não-lida.
 */
export async function marcarComoNaoLida(id: string): Promise<NotificacaoSistema> {
  const response = await api.patch<NotificacaoSistema>(`/notificacoes/${id}/nao-ler`);
  return response.data;
}

/**
 * Marca todas as notificações do usuário como lidas.
 */
export async function marcarTodasComoLidas(): Promise<void> {
  await api.patch("/notificacoes/ler-todas");
}

/**
 * Remove uma notificação específica.
 */
export async function deletarNotificacao(id: string): Promise<void> {
  await api.delete(`/notificacoes/${id}`);
}

/**
 * Remove todas as notificações lidas do usuário.
 */
export async function limparNotificacoesLidas(): Promise<void> {
  await api.delete("/notificacoes/lidas");
}
