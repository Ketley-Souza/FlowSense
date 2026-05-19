import prisma from "../../lib/prisma";

export async function getDashboardData(usuarioId: string, projetoId?: string) {
  const hoje = new Date();
  const em3Dias = new Date(hoje);
  em3Dias.setDate(hoje.getDate() + 3);

  const em7DiasAtras = new Date(hoje);
  em7DiasAtras.setDate(hoje.getDate() - 6);

  // Filtro base: projetos do usuário
  const projetoFiltro = projetoId
    ? { id_projeto: projetoId }
    : {
        projeto: {
          membros: { some: { id_usuario: usuarioId } },
        },
      };

  const [
    totalProjetos,
    tarefasAggregate,
    tarefasAtrasadas,
    tarefasProximas,
    projetosRecentes,
    produtividadeSemanal,
    membrosDistinct,
    distribuicaoPrioridade,
    historicoRecente,
  ] = await Promise.all([
    // 1. Total de projetos do usuário
    prisma.projeto.count({
      where: {
        membros: { some: { id_usuario: usuarioId } },
        ...(projetoId ? { id: projetoId } : {}),
      },
    }),

    // 2. Agregações de tarefas
    prisma.tarefa.aggregate({
      where: projetoFiltro,
      _count: { id: true },
      _avg: { progresso: true },
    }),

    // 3. Tarefas atrasadas
    prisma.tarefa.findMany({
      where: {
        ...projetoFiltro,
        data_fim: { lt: hoje },
        progresso: { lt: 100 },
      },
      select: {
        id: true,
        titulo: true,
        data_fim: true,
        prioridade: true,
        progresso: true,
        projeto: { select: { id: true, nome: true } },
        responsavel: { select: { id: true, nome: true, foto_url: true } },
      },
      orderBy: { data_fim: "asc" },
      take: 5,
    }),

    // 4. Tarefas próximas do vencimento
    prisma.tarefa.findMany({
      where: {
        ...projetoFiltro,
        data_fim: { gte: hoje, lte: em3Dias },
        progresso: { lt: 100 },
      },
      select: {
        id: true,
        titulo: true,
        data_fim: true,
        prioridade: true,
        progresso: true,
        projeto: { select: { id: true, nome: true } },
        responsavel: { select: { id: true, nome: true, foto_url: true } },
      },
      orderBy: { data_fim: "asc" },
      take: 5,
    }),

    // 5. Projetos recentes com progresso calculado
    prisma.projeto.findMany({
      where: {
        membros: { some: { id_usuario: usuarioId } },
        ...(projetoId ? { id: projetoId } : {}),
      },
      select: {
        id: true,
        nome: true,
        descricao: true,
        cor: true,
        data_fim: true,
        updatedAt: true,
        membros: {
          select: {
            cargo: true,
            usuario: { select: { id: true, nome: true, foto_url: true } },
          },
        },
        _count: { select: { tarefas: true } },
        tarefas: { select: { progresso: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 4,
    }),

    // 6. Produtividade semanal: tarefas concluídas por dia nos últimos 7 dias
    prisma.tarefa.groupBy({
      by: ["updatedAt"],
      where: {
        ...projetoFiltro,
        progresso: { gte: 100 },
        updatedAt: { gte: em7DiasAtras },
      },
      _count: { id: true },
    }),

    // 7. Total de membros únicos
    prisma.projetoMembro.findMany({
      where: {
        projeto: {
          membros: { some: { id_usuario: usuarioId } },
          ...(projetoId ? { id: projetoId } : {}),
        },
      },
      select: { id_usuario: true },
      distinct: ["id_usuario"],
    }),

    // 8. Distribuição por prioridade
    prisma.tarefa.groupBy({
      by: ["prioridade"],
      where: projetoFiltro,
      _count: { id: true },
    }),

    // 9. Histórico de atividades recentes
    prisma.historicoTarefa.findMany({
      where: {
        tarefa: projetoFiltro,
      },
      select: {
        id: true,
        campo_alterado: true,
        valor_novo: true,
        createdAt: true,
        usuario: { select: { id: true, nome: true, foto_url: true } },
        tarefa: { select: { id: true, titulo: true, id_projeto: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  // Calcular tarefas concluídas e em progresso
  const totalTarefas = tarefasAggregate._count.id;
  const progresso = Math.round(tarefasAggregate._avg.progresso ?? 0);

  // Tarefas concluídas (progresso >= 100) — via contagem direta
  const tarefasConcluidas = await prisma.tarefa.count({
    where: { ...projetoFiltro, progresso: { gte: 100 } },
  });
  const tarefasEmProgresso = await prisma.tarefa.count({
    where: { ...projetoFiltro, progresso: { gt: 0, lt: 100 } },
  });

  // Calcular progresso real por projeto
  const projetosComProgresso = projetosRecentes.map((p) => {
    const total = p.tarefas.length;
    const concluidas = p.tarefas.filter((t) => t.progresso >= 100).length;
    const percentual = total > 0 ? Math.round((concluidas / total) * 100) : 0;
    return {
      id: p.id,
      nome: p.nome,
      descricao: p.descricao,
      cor: p.cor ?? "#6366f1",
      data_fim: p.data_fim,
      totalTarefas: p._count.tarefas,
      tarefasConcluidas: concluidas,
      progresso: percentual,
      membros: p.membros.slice(0, 4).map((m) => m.usuario),
    };
  });

  // Agregar produtividade semanal por dia
  const mapaSemanaDias: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(hoje);
    d.setDate(hoje.getDate() - i);
    const key = d.toISOString().split("T")[0];
    mapaSemanaDias[key] = 0;
  }
  produtividadeSemanal.forEach((item) => {
    const key = new Date(item.updatedAt).toISOString().split("T")[0];
    if (key in mapaSemanaDias) {
      mapaSemanaDias[key] += item._count.id;
    }
  });
  const semana = Object.entries(mapaSemanaDias).map(([data, concluidas]) => ({
    data,
    concluidas,
  }));

  const taxaConclusao =
    totalTarefas > 0 ? Math.round((tarefasConcluidas / totalTarefas) * 100) : 0;

  // Distribuição de prioridade
  const prioridades: Record<string, number> = { BAIXA: 0, MEDIA: 0, ALTA: 0 };
  distribuicaoPrioridade.forEach((d) => {
    prioridades[d.prioridade] = d._count.id;
  });

  return {
    resumo: {
      totalProjetos,
      totalTarefas,
      tarefasConcluidas,
      tarefasEmProgresso,
      tarefasAtrasadas: tarefasAtrasadas.length,
      tarefasProximas: tarefasProximas.length,
      totalMembros: membrosDistinct.length,
      progressoGeral: progresso,
      taxaConclusao,
    },
    projetosRecentes: projetosComProgresso,
    tarefasAtrasadas,
    tarefasProximas,
    produtividade: {
      semana,
      taxaConclusao,
    },
    distribuicaoPrioridade: prioridades,
    atividadesRecentes: historicoRecente,
  };
}
