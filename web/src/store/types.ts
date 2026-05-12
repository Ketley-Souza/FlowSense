// ============================================
// TIPOS CENTRALIZADOS DO STORE
// ============================================

// ============ PROJETOS ============
export interface Projeto {
  id: string;
  nome: string;
  descricao?: string;
  data_inicio?: string;
  data_fim?: string;
  cor?: string;
  membros: Array<{
    id_usuario: string;
    cargo: "GERENTE" | "MEMBRO";
    usuario: {
      id: string;
      nome: string;
      email: string;
      foto_url?: string;
    };
  }>;
  colunas: Array<{
    id: string;
    nome: string;
    ordem: number;
  }>;
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

// ============ TAREFAS ============
export interface Tarefa {
  id: string;
  titulo: string;
  descricao?: string;
  prioridade: "BAIXA" | "MEDIA" | "ALTA";
  progresso: number;
  id_responsavel: string;
  id_coluna?: string;
  id_projeto: string;
  responsavel: {
    id: string;
    nome: string;
    foto_url?: string;
  };
  coluna?: {
    id: string;
    nome: string;
  };
  projeto: {
    id: string;
    nome: string;
  };
  membros: Array<{
    usuario: {
      id: string;
      nome: string;
      foto_url?: string;
    };
  }>;
  tags: any[];
  subtarefas: any[];
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

// ============ EQUIPE ============
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  login?: string;
  foto_url?: string;
}
