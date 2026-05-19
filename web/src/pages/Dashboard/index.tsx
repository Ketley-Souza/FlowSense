import { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  AlertTriangle, Clock, CheckCircle2, FolderKanban,
  Users, TrendingUp, Zap, Calendar, ChevronRight,
  RefreshCw, Filter,
} from "lucide-react";
import { useProjetosStore } from "@/store/useProjetosStore";
import { dashboardService } from "@/services/dashboardService";
import { StatCard } from "@/components/ui/StatCard";
import { SkeletonStat } from "@/components/ui/SkeletonCard";
import { EmptyState } from "@/components/ui/EmptyState";
import type { DashboardData } from "@/types";
import { useNavigate } from "react-router-dom";

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatDate(d: string | Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function diasAtraso(d: string | Date | null | undefined) {
  if (!d) return 0;
  return Math.ceil((Date.now() - new Date(d).getTime()) / 86400000);
}

function getInitials(nome: string) {
  return nome.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

function formatDia(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
}

const PRIORIDADE_COR: Record<string, string> = {
  ALTA: "bg-red-100 text-red-600",
  MEDIA: "bg-amber-100 text-amber-700",
  BAIXA: "bg-indigo-100 text-indigo-600",
};

const PRIORIDADE_LABEL: Record<string, string> = {
  ALTA: "Alta", MEDIA: "Média", BAIXA: "Baixa",
};

const PIE_COLORS = ["#6366f1", "#f59e0b", "#ef4444"];

// ─── Subcomponentes ───────────────────────────────────────────────────────────

function AvatarStack({ membros }: { membros: Array<{ id: string; nome: string; foto_url?: string | null }> }) {
  return (
    <div className="flex -space-x-2">
      {membros.slice(0, 4).map((m) => (
        <div
          key={m.id}
          title={m.nome}
          className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white"
          style={{ backgroundColor: `hsl(${m.id.charCodeAt(0) * 17 % 360}, 65%, 55%)` }}
        >
          {getInitials(m.nome)}
        </div>
      ))}
      {membros.length > 4 && (
        <div className="w-7 h-7 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600">
          +{membros.length - 4}
        </div>
      )}
    </div>
  );
}

function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">{children}</h2>
      {action}
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function DashboardPage() {
  const navigate = useNavigate();
  const { projetos, projetoAtual, listar, definirProjetoAtivo, carregando: carregandoProjetos } = useProjetosStore();

  const [data, setData] = useState<DashboardData | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [filtrandoProjeto, setFiltrandoProjeto] = useState(false);

  // Carrega projetos ao montar
  useEffect(() => { listar(); }, [listar]);

  // Carrega métricas da dashboard
  const carregarDashboard = useCallback(async (projetoId?: string) => {
    setCarregando(true);
    setErro(null);
    try {
      const d = await dashboardService.obter(projetoId);
      setData(d);
    } catch {
      setErro("Não foi possível carregar os dados do dashboard.");
    } finally {
      setCarregando(false);
    }
  }, []);

  // Recarrega quando projetoAtual muda (se filtro por projeto ativo)
  useEffect(() => {
    carregarDashboard(filtrandoProjeto ? projetoAtual?.id : undefined);
  }, [carregarDashboard, filtrandoProjeto, projetoAtual?.id]);

  const toggleFiltroProjeto = () => {
    const novo = !filtrandoProjeto;
    setFiltrandoProjeto(novo);
  };

  // ─── Skeleton ───────────────────────────────────────────────────────────────
  if (carregando && !data) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="mb-8 h-8 w-48 bg-slate-200 rounded-full animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <SkeletonStat key={i} />)}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 h-64 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // ─── Erro ───────────────────────────────────────────────────────────────────
  if (erro) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <EmptyState
          icon={<AlertTriangle size={24} />}
          title="Erro ao carregar dashboard"
          description={erro}
          action={
            <button
              onClick={() => carregarDashboard(filtrandoProjeto ? projetoAtual?.id : undefined)}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
            >
              <RefreshCw size={14} /> Tentar novamente
            </button>
          }
        />
      </div>
    );
  }

  const r = data?.resumo;
  const semana = (data?.produtividade.semana ?? []).map((d) => ({
    ...d, dia: formatDia(d.data),
  }));
  const distPrioridade = [
    { name: "Baixa", value: data?.distribuicaoPrioridade.BAIXA ?? 0 },
    { name: "Média", value: data?.distribuicaoPrioridade.MEDIA ?? 0 },
    { name: "Alta",  value: data?.distribuicaoPrioridade.ALTA  ?? 0 },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 min-h-screen">

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {filtrandoProjeto && projetoAtual
              ? `Métricas de "${projetoAtual.nome}"`
              : "Visão geral de todos os projetos"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Seletor de projeto ativo */}
          {projetos.length > 0 && (
            <select
              value={projetoAtual?.id ?? ""}
              onChange={(e) => {
                const p = projetos.find((x) => x.id === e.target.value) ?? null;
                definirProjetoAtivo(p);
              }}
              disabled={carregandoProjetos}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:border-slate-300 transition"
            >
              {projetos.map((p) => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          )}

          {/* Toggle filtro por projeto */}
          <button
            onClick={toggleFiltroProjeto}
            title={filtrandoProjeto ? "Ver todos os projetos" : "Filtrar por projeto ativo"}
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition ${
              filtrandoProjeto
                ? "border-indigo-600 bg-indigo-600 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Filter size={14} />
            {filtrandoProjeto ? "Projeto ativo" : "Todos"}
          </button>

          {/* Refresh */}
          <button
            onClick={() => carregarDashboard(filtrandoProjeto ? projetoAtual?.id : undefined)}
            disabled={carregando}
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50 transition disabled:opacity-40"
            title="Atualizar"
          >
            <RefreshCw size={16} className={carregando ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* ── STAT CARDS ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Projetos"
          value={r?.totalProjetos ?? 0}
          icon={<FolderKanban size={20} />}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
          sub={`${r?.totalTarefas ?? 0} tarefas no total`}
        />
        <StatCard
          label="Concluídas"
          value={r?.tarefasConcluidas ?? 0}
          icon={<CheckCircle2 size={20} />}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          sub={`${r?.taxaConclusao ?? 0}% taxa de conclusão`}
        />
        <StatCard
          label="Em progresso"
          value={r?.tarefasEmProgresso ?? 0}
          icon={<TrendingUp size={20} />}
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
          sub={`${r?.progressoGeral ?? 0}% progresso médio`}
        />
        <StatCard
          label="Atrasadas"
          value={r?.tarefasAtrasadas ?? 0}
          icon={<AlertTriangle size={20} />}
          iconBg={r?.tarefasAtrasadas ? "bg-red-50" : "bg-slate-50"}
          iconColor={r?.tarefasAtrasadas ? "text-red-500" : "text-slate-400"}
          sub={r?.tarefasProximas ? `${r.tarefasProximas} vencem em 3 dias` : "Nenhum prazo próximo"}
        />
      </div>

      {/* ── LINHA 1: Gráfico semanal + Distribuição + Membros ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Produtividade Semanal */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-5">
          <SectionTitle action={
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              <Zap size={11} /> Últimos 7 dias
            </span>
          }>
            Produtividade Semanal
          </SectionTitle>
          {semana.every((s) => s.concluidas === 0) ? (
            <EmptyState icon={<TrendingUp size={22} />} title="Sem conclusões esta semana" description="Tarefas concluídas aparecerão aqui." />
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={semana} barSize={28}>
                <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} width={24} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }}
                  cursor={{ fill: "#f1f5f9" }}
                  formatter={(v: unknown) => [v as number, "Concluídas"]}
                />
                <Bar dataKey="concluidas" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Distribuição por prioridade */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <SectionTitle>Por Prioridade</SectionTitle>
          {distPrioridade.every((d) => d.value === 0) ? (
            <EmptyState icon={<Filter size={22} />} title="Sem tarefas" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={distPrioridade} cx="50%" cy="45%" innerRadius={52} outerRadius={78} paddingAngle={3} dataKey="value">
                  {distPrioridade.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="mt-3 space-y-2">
            {distPrioridade.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i] }} />
                  <span className="text-slate-600">{d.name}</span>
                </div>
                <span className="font-semibold text-slate-800">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── LINHA 2: Projetos recentes + Tarefas em risco ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Projetos recentes */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <SectionTitle action={
            <button onClick={() => navigate("/projetos")} className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1">
              Ver todos <ChevronRight size={12} />
            </button>
          }>
            Projetos Recentes
          </SectionTitle>

          {!data?.projetosRecentes.length ? (
            <EmptyState icon={<FolderKanban size={22} />} title="Nenhum projeto ainda" action={
              <button onClick={() => navigate("/projetos")} className="text-sm font-semibold text-indigo-600 hover:underline">Criar projeto</button>
            } />
          ) : (
            <div className="space-y-4">
              {data.projetosRecentes.map((p) => (
                <div key={p.id} className="flex items-center gap-4 group">
                  <div
                    className="w-2 h-10 rounded-full shrink-0"
                    style={{ background: p.cor ?? "#6366f1" }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-slate-800 truncate">{p.nome}</p>
                      <span className="text-xs text-slate-500 shrink-0 ml-2">{p.progresso}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${p.progresso}%`, background: p.cor ?? "#6366f1" }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs text-slate-400">{p.tarefasConcluidas}/{p.totalTarefas} tarefas</span>
                      <AvatarStack membros={p.membros} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tarefas em risco (atrasadas + próximas) */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <SectionTitle action={
            <button onClick={() => navigate("/kamban")} className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1">
              Ver kanban <ChevronRight size={12} />
            </button>
          }>
            Tarefas em Risco
          </SectionTitle>

          {!data?.tarefasAtrasadas.length && !data?.tarefasProximas.length ? (
            <EmptyState
              icon={<CheckCircle2 size={22} />}
              title="Tudo em dia!"
              description="Nenhuma tarefa atrasada ou com prazo próximo."
            />
          ) : (
            <div className="space-y-2">
              {(data?.tarefasAtrasadas ?? []).slice(0, 3).map((t) => (
                <div key={t.id} className="flex items-start gap-3 p-3 rounded-xl bg-red-50 border border-red-100">
                  <AlertTriangle size={14} className="text-red-500 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{t.titulo}</p>
                    <p className="text-xs text-red-500 font-medium mt-0.5">
                      Atrasada {diasAtraso(t.data_fim)} dias · {t.projeto.nome}
                    </p>
                  </div>
                  <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${PRIORIDADE_COR[t.prioridade]}`}>
                    {PRIORIDADE_LABEL[t.prioridade]}
                  </span>
                </div>
              ))}
              {(data?.tarefasProximas ?? []).slice(0, 3).map((t) => (
                <div key={t.id} className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
                  <Clock size={14} className="text-amber-500 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{t.titulo}</p>
                    <p className="text-xs text-amber-600 font-medium mt-0.5">
                      Vence {formatDate(t.data_fim)} · {t.projeto.nome}
                    </p>
                  </div>
                  <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${PRIORIDADE_COR[t.prioridade]}`}>
                    {PRIORIDADE_LABEL[t.prioridade]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── LINHA 3: Atividade recente + Mini-stats ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Atividades recentes */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-5">
          <SectionTitle>Atividade Recente</SectionTitle>
          {!data?.atividadesRecentes.length ? (
            <EmptyState icon={<Calendar size={22} />} title="Sem atividade recente" description="Mudanças em tarefas aparecerão aqui." />
          ) : (
            <div className="space-y-3">
              {data.atividadesRecentes.slice(0, 7).map((a) => (
                <div key={a.id} className="flex items-start gap-3 group">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ backgroundColor: `hsl(${a.usuario.id.charCodeAt(0) * 17 % 360}, 65%, 55%)` }}
                  >
                    {getInitials(a.usuario.nome)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700">
                      <span className="font-semibold">{a.usuario.nome}</span>
                      {" "}{descreveAtividade(a.campo_alterado, a.valor_novo)}{" "}
                      <span className="font-medium text-slate-900">{a.tarefa.titulo}</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(a.createdAt).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mini-stats de saúde */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <SectionTitle>Saúde do Projeto</SectionTitle>
          <div className="space-y-5">
            {/* Taxa de conclusão */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-medium text-slate-600">Taxa de conclusão</span>
                <span className="font-bold text-slate-900">{r?.taxaConclusao ?? 0}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500 transition-all duration-700" style={{ width: `${r?.taxaConclusao ?? 0}%` }} />
              </div>
            </div>

            {/* Progresso médio */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-medium text-slate-600">Progresso médio</span>
                <span className="font-bold text-slate-900">{r?.progressoGeral ?? 0}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-indigo-500 transition-all duration-700" style={{ width: `${r?.progressoGeral ?? 0}%` }} />
              </div>
            </div>

            {/* Membros */}
            <div className="flex items-center justify-between py-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-slate-400" />
                <span className="text-sm text-slate-600">Membros ativos</span>
              </div>
              <span className="text-sm font-bold text-slate-900">{r?.totalMembros ?? 0}</span>
            </div>

            {/* Score de saúde */}
            <div className="rounded-xl p-4 text-center" style={{
              background: healthScoreBg(healthScore(r)),
            }}>
              <p className="text-xs font-semibold text-slate-500 mb-1">Score de saúde</p>
              <p className="text-3xl font-black" style={{ color: healthScoreColor(healthScore(r)) }}>
                {healthScore(r)}
              </p>
              <p className="text-xs font-medium mt-1" style={{ color: healthScoreColor(healthScore(r)) }}>
                {healthScoreLabel(healthScore(r))}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers extras ───────────────────────────────────────────────────────────

function descreveAtividade(campo: string, valor: string | null | undefined) {
  const mapa: Record<string, string> = {
    prioridade: "alterou a prioridade de",
    progresso: "atualizou o progresso de",
    id_coluna: "moveu",
    titulo: "renomeou",
    descricao: "editou a descrição de",
    data_fim: "alterou o prazo de",
  };
  return mapa[campo] ?? "modificou";
}

function healthScore(r: { tarefasAtrasadas: number; taxaConclusao: number; totalTarefas: number } | undefined) {
  if (!r || r.totalTarefas === 0) return "—";
  const penalidade = Math.min(r.tarefasAtrasadas * 5, 40);
  const score = Math.max(0, Math.round(r.taxaConclusao - penalidade));
  return score;
}

function healthScoreLabel(score: number | string) {
  if (score === "—") return "Sem dados";
  const n = score as number;
  if (n >= 80) return "Excelente";
  if (n >= 60) return "Bom";
  if (n >= 40) return "Atenção";
  return "Crítico";
}

function healthScoreColor(score: number | string) {
  if (score === "—") return "#94a3b8";
  const n = score as number;
  if (n >= 80) return "#10b981";
  if (n >= 60) return "#6366f1";
  if (n >= 40) return "#f59e0b";
  return "#ef4444";
}

function healthScoreBg(score: number | string) {
  if (score === "—") return "#f8fafc";
  const n = score as number;
  if (n >= 80) return "#ecfdf5";
  if (n >= 60) return "#eef2ff";
  if (n >= 40) return "#fffbeb";
  return "#fef2f2";
}