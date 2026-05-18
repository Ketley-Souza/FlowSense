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
  tags?: any[];
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
// TAREFA
// ============================================
export interface TarefaMembro {
  usuario: Usuario;
}

export interface Tarefa {
  id: string;
  titulo: string;
  descricao?: string;
  prioridade: "BAIXA" | "MEDIA" | "ALTA";
  progresso: number;
  id_responsavel?: string;
  id_coluna?: string;
  id_projeto: string;
  responsavel?: Usuario;
  coluna?: ColunaKanban;
  projeto: Projeto;
  membros?: TarefaMembro[];
  tags?: any[];
  subtarefas?: any[];
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
  id_coluna?: string;
  id_projeto: string;
}

export interface AtualizarTarefaPayload {
  titulo?: string;
  descricao?: string;
  prioridade?: "BAIXA" | "MEDIA" | "ALTA";
  progresso?: number;
  id_responsavel?: string;
  id_coluna?: string;
}

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
