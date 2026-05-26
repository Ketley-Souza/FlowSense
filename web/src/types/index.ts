/**
 * Arquivo centralizado de tipos da aplicação
 * Evita duplicação de interfaces e mantém consistência
 */

// ============================================
// USUARIO
// ============================================
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  login: string;
  foto_url?: string | null;
  perfil?: "ADMIN" | "GERENTE" | "USUARIO";
  status?: "ATIVO" | "PENDENTE" | "DESATIVADO";
  createdAt?: string;
  updatedAt?: string;
}

// ============================================
// EQUIPE
// ============================================
export type CargoType = "ADMIN" | "GERENTE" | "MEMBRO";
export type CargoConvite = "GERENTE" | "MEMBRO";
export type StatusMembro = "ATIVO" | "PENDENTE" | "DESATIVADO";
export type StatusFiltro = "TODOS" | StatusMembro;

export interface UsuarioEquipe {
  id?: string;
  usuario_id: string;
  equipe_id: string;
  cargo: CargoType;
  status: StatusMembro;
  ativado_em?: string;
  usuario: Usuario;
}

export interface Equipe {
  id: string;
  nome: string;
  descricao?: string;
  dono_id: string;
  eh_pessoal?: boolean;
  usuarios?: UsuarioEquipe[];
  createdAt?: string;
  updatedAt?: string;
}

// ============================================
// PROJETO
// ============================================
export interface ProjetoMembro {
  id_projeto: string;
  id_usuario: string;
  cargo: "GERENTE" | "MEMBRO";
  usuario: {
    id: string;
    nome: string;
    email: string;
    foto_url?: string;
  };
}

export interface ColunaKanban {
  id: string;
  nome: string;
  ordem: number;
  id_projeto?: string;
}

export interface AnexoProjeto {
  id: string;
  nome: string;
  url: string;
  tipo: string;
  tamanho?: number | null;
  id_projeto: string;
  createdAt: string;
}

export interface Projeto {
  id: string;
  nome: string;
  descricao?: string;
  data_inicio?: string;
  data_fim?: string;
  cor?: string;
  equipe_id?: string;
  membros?: ProjetoMembro[];
  colunas?: ColunaKanban[];
  tags?: Tag[];
  tarefas?: Tarefa[];
  anexos?: AnexoProjeto[];
  _count?: {
    tarefas: number;
    colunas: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CriarProjetoPayload {
  nome: string;
  descricao?: string;
  data_inicio?: string;
  data_fim?: string;
  cor?: string;
  equipe_id?: string;
  membros?: Array<{
    id_usuario: string;
    cargo?: "GERENTE" | "MEMBRO";
  }>;
}

export interface AtualizarProjetoPayload {
  nome?: string;
  descricao?: string;
  data_inicio?: string;
  data_fim?: string;
  cor?: string;
}

// ============================================
// TAREFA - SUBTAREFA
// ============================================
export interface Subtarefa {
  id: string;
  titulo: string;
  concluida: boolean;
  ordem: number;
  id_tarefa: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TarefaMembro {
  id_tarefa?: string;
  id_usuario?: string;
  usuario: Usuario;
  createdAt?: string;
}

export interface Tag {
  id: string;
  nome: string;
  cor: string; // hex color, ex: #FF5733
  id_projeto: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TarefaTag {
  id_tarefa?: string;
  id_tag?: string;
  tag: Tag;
  createdAt?: string;
}

export interface Comentario {
  id: string;
  texto: string;
  id_usuario: string;
  id_tarefa: string;
  usuario?: Usuario;
  createdAt: string;
  updatedAt?: string;
}

export interface Anexo {
  id: string;
  nome: string;
  url: string;
  tipo: string;
  id_tarefa: string;
  createdAt: string;
  updatedAt?: string;
}

export interface HistoricoTarefa {
  id: string;
  campo_alterado: string;
  valor_antigo?: string | null;
  valor_novo?: string | null;
  id_usuario: string;
  id_tarefa: string;
  usuario?: Usuario;
  createdAt: string;
}

export interface Tarefa {
  id: string;
  titulo: string;
  descricao?: string;
  prioridade: "BAIXA" | "MEDIA" | "ALTA";
  progresso: number;
  data_inicio?: string;
  data_fim?: string;
  prazo?: string;
  ordem?: number;
  id_responsavel?: string;
  id_coluna?: string;
  id_projeto: string;
  responsavel?: Usuario;
  coluna?: ColunaKanban;
  projeto: Projeto;
  membros?: TarefaMembro[];
  tags?: TarefaTag[];
  subtarefas?: Subtarefa[];
  comentarios?: Comentario[];
  anexos?: Anexo[];
  historicos?: HistoricoTarefa[];
  _count?: {
    comentarios: number;
    anexos: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CriarTarefaPayload {
  titulo: string;
  descricao?: string;
  prioridade?: "BAIXA" | "MEDIA" | "ALTA";
  data_inicio?: string;
  data_fim?: string;
  prazo?: string;
  id_coluna?: string;
  id_projeto: string;
  id_responsavel?: string;
  id_membros?: string[];
  subtarefas?: Array<{
    titulo: string;
    concluida?: boolean;
    ordem?: number;
  }>;
  tags?: Array<{
    id?: string;
    nome: string;
    cor?: string;
  }>;
}

export interface AtualizarTarefaPayload {
  titulo?: string;
  descricao?: string;
  prioridade?: "BAIXA" | "MEDIA" | "ALTA";
  progresso?: number;
  data_inicio?: string;
  data_fim?: string;
  prazo?: string;
  id_responsavel?: string;
  id_coluna?: string;
  id_membros?: string[];
  subtarefas?: Array<{
    id?: string;
    titulo: string;
    concluida?: boolean;
    ordem?: number;
  }>;
  tags?: Array<{
    id?: string;
    nome: string;
    cor?: string;
  }>;
}

export interface CriarComentarioPayload {
  texto: string;
}

export interface CriarAnexoPayload {
  nome: string;
  url: string;
  tipo?: string;
}

// ============================================
// API RESPONSES
// ============================================

// ============================================
// API RESPONSES
// ============================================
export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

export interface RegisterResponse {
  message: string;
  usuario: Usuario;
}

// ============================================
// DASHBOARD
// ============================================
export interface DashboardResumo {
  totalProjetos: number;
  totalTarefas: number;
  tarefasConcluidas: number;
  tarefasEmProgresso: number;
  tarefasAtrasadas: number;
  tarefasProximas: number;
  totalMembros: number;
  progressoGeral: number;
  taxaConclusao: number;
}

export interface DashboardProjeto {
  id: string;
  nome: string;
  descricao?: string | null;
  cor: string;
  data_fim?: Date | null;
  totalTarefas: number;
  tarefasConcluidas: number;
  progresso: number;
  membros: Array<{ id: string; nome: string; foto_url?: string | null }>;
}

export interface DashboardTarefa {
  id: string;
  titulo: string;
  data_fim?: Date | null;
  prioridade: "BAIXA" | "MEDIA" | "ALTA";
  progresso: number;
  projeto: { id: string; nome: string };
  responsavel: { id: string; nome: string; foto_url?: string | null };
}

export interface DashboardAtividade {
  id: string;
  campo_alterado: string;
  valor_novo?: string | null;
  createdAt: string;
  usuario: { id: string; nome: string; foto_url?: string | null };
  tarefa: { id: string; titulo: string; id_projeto: string };
}

export interface DashboardData {
  resumo: DashboardResumo;
  projetosRecentes: DashboardProjeto[];
  tarefasAtrasadas: DashboardTarefa[];
  tarefasProximas: DashboardTarefa[];
  produtividade: {
    semana: Array<{ data: string; concluidas: number }>;
    taxaConclusao: number;
  };
  distribuicaoPrioridade: { BAIXA: number; MEDIA: number; ALTA: number };
  atividadesRecentes: DashboardAtividade[];
}
