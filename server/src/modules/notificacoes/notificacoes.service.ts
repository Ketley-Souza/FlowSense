import { TipoNotificacao } from "@prisma/client";
import prisma from "../../lib/prisma";

// ============================================
// TIPOS
// ============================================

export interface CriarNotificacaoInput {
  id_usuario: string;
  mensagem: string;
  tipo?: TipoNotificacao;
  tarefaId?: string | null;
  projetoId?: string | null;
}

// ============================================
// FUNÇÕES UTILITÁRIAS (usadas internamente pelos outros serviços)
// ============================================

/**
 * Cria uma única notificação para um usuário.
 * Aplica deduplicação de 5 minutos: não envia se o mesmo tipo+tarefa+projeto
 * já foi enviado para o mesmo usuário nos últimos 5 minutos.
 */
export async function criarNotificacao(input: CriarNotificacaoInput) {
  const janela = new Date(Date.now() - 5 * 60 * 1000);

  const recente = await prisma.notificacao.findFirst({
    where: {
      id_usuario: input.id_usuario,
      tipo: input.tipo ?? "GERAL",
      tarefaId: input.tarefaId ?? null,
      projetoId: input.projetoId ?? null,
      createdAt: { gte: janela },
    },
  });

  if (recente) return recente; // já enviada recentemente, não duplicar

  return prisma.notificacao.create({
    data: {
      mensagem: input.mensagem,
      tipo: input.tipo ?? "GERAL",
      id_usuario: input.id_usuario,
      tarefaId: input.tarefaId ?? null,
      projetoId: input.projetoId ?? null,
    },
  });
}

/**
 * Cria notificações em lote para múltiplos usuários.
 * Ignora o próprio usuário que gerou o evento (autorId).
 * Ignora duplicatas: não envia se o mesmo tipo+tarefa+projeto já foi enviado
 * para o mesmo usuário nos últimos 5 minutos.
 */
export async function notificarMembros(
  ids: string[],
  mensagem: string,
  tipo: TipoNotificacao,
  tarefaId?: string | null,
  projetoId?: string | null,
  autorId?: string // usuário que gerou o evento — não será notificado
) {
  const destinatarios = [...new Set(ids)].filter(
    (id) => id && id !== autorId
  );

  if (destinatarios.length === 0) return;

  // Janela anti-duplicata: 5 minutos
  const janela = new Date(Date.now() - 5 * 60 * 1000);

  // Buscar notificações recentes do mesmo tipo+tarefa+projeto para esses usuários
  const recentes = await prisma.notificacao.findMany({
    where: {
      tipo,
      id_usuario: { in: destinatarios },
      tarefaId: tarefaId ?? null,
      projetoId: projetoId ?? null,
      createdAt: { gte: janela },
    },
    select: { id_usuario: true },
  });

  const jaNotificados = new Set(recentes.map((n) => n.id_usuario));
  const destinatariosFiltrados = destinatarios.filter((id) => !jaNotificados.has(id));

  if (destinatariosFiltrados.length === 0) return;

  await prisma.notificacao.createMany({
    data: destinatariosFiltrados.map((id_usuario) => ({
      id_usuario,
      mensagem,
      tipo,
      tarefaId: tarefaId ?? null,
      projetoId: projetoId ?? null,
    })),
    skipDuplicates: false,
  });
}

/**
 * Cria notificações para TODOS os destinatários, incluindo o próprio autor.
 * Usar para: tarefa atribuída (o responsável deve ser notificado mesmo que tenha criado a tarefa).
 * Também aplica deduplicação de 5 minutos.
 */
export async function notificarTodos(
  ids: string[],
  mensagem: string,
  tipo: TipoNotificacao,
  tarefaId?: string | null,
  projetoId?: string | null
) {
  const destinatarios = [...new Set(ids)].filter(Boolean);

  if (destinatarios.length === 0) return;

  // Janela anti-duplicata: 5 minutos
  const janela = new Date(Date.now() - 5 * 60 * 1000);

  const recentes = await prisma.notificacao.findMany({
    where: {
      tipo,
      id_usuario: { in: destinatarios },
      tarefaId: tarefaId ?? null,
      projetoId: projetoId ?? null,
      createdAt: { gte: janela },
    },
    select: { id_usuario: true },
  });

  const jaNotificados = new Set(recentes.map((n) => n.id_usuario));
  const destinatariosFiltrados = destinatarios.filter((id) => !jaNotificados.has(id));

  if (destinatariosFiltrados.length === 0) return;

  await prisma.notificacao.createMany({
    data: destinatariosFiltrados.map((id_usuario) => ({
      id_usuario,
      mensagem,
      tipo,
      tarefaId: tarefaId ?? null,
      projetoId: projetoId ?? null,
    })),
    skipDuplicates: false,
  });
}

// ============================================
// FUNÇÕES DE LEITURA / GESTÃO (expostas via API)
// ============================================

/**
 * Lista todas as notificações do usuário autenticado,
 * ordenadas da mais recente para a mais antiga.
 */
export async function listarNotificacoes(usuarioId: string) {
  const [notificacoes, totalNaoLidas] = await Promise.all([
    prisma.notificacao.findMany({
      where: { id_usuario: usuarioId },
      orderBy: { createdAt: "desc" },
      include: {
        tarefa: { select: { id: true, titulo: true, id_projeto: true } },
        projeto: { select: { id: true, nome: true } },
      },
      take: 100, // limite de segurança
    }),
    prisma.notificacao.count({
      where: { id_usuario: usuarioId, status: "NAO_LIDA" },
    }),
  ]);

  return { notificacoes, totalNaoLidas };
}

/**
 * Retorna apenas o contador de notificações não-lidas (para o badge).
 */
export async function contarNaoLidas(usuarioId: string): Promise<number> {
  return prisma.notificacao.count({
    where: { id_usuario: usuarioId, status: "NAO_LIDA" },
  });
}

/**
 * Marca uma notificação específica como lida.
 */
export async function marcarComoLida(notificacaoId: string, usuarioId: string) {
  const notificacao = await prisma.notificacao.findUnique({
    where: { id: notificacaoId },
  });

  if (!notificacao || notificacao.id_usuario !== usuarioId) {
    const error = new Error("Notificação não encontrada.");
    (error as NodeJS.ErrnoException).code = "NOT_FOUND";
    throw error;
  }

  return prisma.notificacao.update({
    where: { id: notificacaoId },
    data: { status: "LIDA" },
  });
}

/**
 * Marca uma notificação específica como NÃO-lida.
 */
export async function marcarComoNaoLida(notificacaoId: string, usuarioId: string) {
  const notificacao = await prisma.notificacao.findUnique({
    where: { id: notificacaoId },
  });

  if (!notificacao || notificacao.id_usuario !== usuarioId) {
    const error = new Error("Notificação não encontrada.");
    (error as NodeJS.ErrnoException).code = "NOT_FOUND";
    throw error;
  }

  return prisma.notificacao.update({
    where: { id: notificacaoId },
    data: { status: "NAO_LIDA" },
  });
}

/**
 * Marca todas as notificações do usuário como lidas.
 */
export async function marcarTodasComoLidas(usuarioId: string) {
  await prisma.notificacao.updateMany({
    where: { id_usuario: usuarioId, status: "NAO_LIDA" },
    data: { status: "LIDA" },
  });
}

/**
 * Deleta uma notificação do usuário.
 */
export async function deletarNotificacao(notificacaoId: string, usuarioId: string) {
  const notificacao = await prisma.notificacao.findUnique({
    where: { id: notificacaoId },
  });

  if (!notificacao || notificacao.id_usuario !== usuarioId) {
    const error = new Error("Notificação não encontrada.");
    (error as NodeJS.ErrnoException).code = "NOT_FOUND";
    throw error;
  }

  await prisma.notificacao.delete({ where: { id: notificacaoId } });
}

/**
 * Deleta todas as notificações lidas do usuário.
 */
export async function limparNotificacoesLidas(usuarioId: string) {
  await prisma.notificacao.deleteMany({
    where: { id_usuario: usuarioId, status: "LIDA" },
  });
}

// ============================================
// JOB DE PRAZOS (chamado pelo agendador)
// ============================================

/**
 * Verifica tarefas com prazo próximo e envia notificações.
 * Deve ser chamado periodicamente pelo agendador (ex: a cada hora).
 * Possui deduplicação: não reenvia PRAZO_24H/PRAZO_48H se já enviado
 * para o mesmo par (usuário, tarefa) nas últimas 25 horas.
 */
export async function verificarPrazosProximos() {
  const agora = new Date();

  // Janela de 24h a partir de agora
  const inicio24h = new Date(agora);
  const fim24h = new Date(agora.getTime() + 24 * 60 * 60 * 1000);

  // Janela de 48h (após as 24h)
  const inicio48h = new Date(fim24h);
  const fim48h = new Date(agora.getTime() + 48 * 60 * 60 * 1000);

  // Janela de deduplicação: últimas 25h (evita reenvio por reinício do servidor)
  const limiteDedup = new Date(agora.getTime() - 25 * 60 * 60 * 1000);

  // Buscar notificações PRAZO_24H e PRAZO_48H já enviadas nas últimas 25h
  const jaEnviadas = await prisma.notificacao.findMany({
    where: {
      tipo: { in: ["PRAZO_24H", "PRAZO_48H"] },
      createdAt: { gte: limiteDedup },
    },
    select: { id_usuario: true, tarefaId: true, tipo: true },
  });

  // Criar um Set de chaves "tipo:tarefaId:id_usuario" para lookup O(1)
  const enviadas = new Set(
    jaEnviadas
      .filter((n) => n.tarefaId)
      .map((n) => `${n.tipo}:${n.tarefaId}:${n.id_usuario}`)
  );

  // Buscar tarefas com prazo em ~24h
  const tarefas24h = await prisma.tarefa.findMany({
    where: {
      prazo: { gte: inicio24h, lt: fim24h },
    },
    include: {
      membros: { select: { id_usuario: true } },
      projeto: { select: { nome: true } },
    },
  });

  // Buscar tarefas com prazo em ~48h
  const tarefas48h = await prisma.tarefa.findMany({
    where: {
      prazo: { gte: inicio48h, lt: fim48h },
    },
    include: {
      membros: { select: { id_usuario: true } },
      projeto: { select: { nome: true } },
    },
  });

  const notificacoesPrazo: Array<{
    id_usuario: string;
    mensagem: string;
    tipo: TipoNotificacao;
    tarefaId: string;
    projetoId: string;
  }> = [];

  for (const tarefa of tarefas24h) {
    const destinatarios = [
      tarefa.id_responsavel,
      ...tarefa.membros.map((m) => m.id_usuario),
    ];
    const unicos = [...new Set(destinatarios)];

    for (const id_usuario of unicos) {
      const chave = `PRAZO_24H:${tarefa.id}:${id_usuario}`;
      if (enviadas.has(chave)) continue; // já notificado recentemente

      notificacoesPrazo.push({
        id_usuario,
        mensagem: `Prazo em 24h: "${tarefa.titulo}" (${tarefa.projeto.nome})`,
        tipo: "PRAZO_24H",
        tarefaId: tarefa.id,
        projetoId: tarefa.id_projeto,
      });
    }
  }

  for (const tarefa of tarefas48h) {
    const destinatarios = [
      tarefa.id_responsavel,
      ...tarefa.membros.map((m) => m.id_usuario),
    ];
    const unicos = [...new Set(destinatarios)];

    for (const id_usuario of unicos) {
      const chave = `PRAZO_48H:${tarefa.id}:${id_usuario}`;
      if (enviadas.has(chave)) continue; // já notificado recentemente

      notificacoesPrazo.push({
        id_usuario,
        mensagem: `Prazo em 48h: "${tarefa.titulo}" (${tarefa.projeto.nome})`,
        tipo: "PRAZO_48H",
        tarefaId: tarefa.id,
        projetoId: tarefa.id_projeto,
      });
    }
  }

  if (notificacoesPrazo.length > 0) {
    await prisma.notificacao.createMany({
      data: notificacoesPrazo,
      skipDuplicates: false,
    });

    console.log(
      `[Agendador] ${notificacoesPrazo.length} notificações de prazo criadas.`
    );
  } else {
    console.log("[Agendador] Nenhuma tarefa com prazo próximo encontrada (ou já notificadas).");
  }
}
