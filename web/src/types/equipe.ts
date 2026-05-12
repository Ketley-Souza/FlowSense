export type CargoType = "ADMIN" | "GERENTE" | "MEMBRO";
export type StatusMembro = "ATIVO" | "PENDENTE" | "DESATIVADO";

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  login?: string;
  foto_url?: string;
}

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
  criado_em?: string;
  atualizado_em?: string;
  createdAt?: string;
  updatedAt?: string;
  usuarios?: UsuarioEquipe[];
}

export interface Member extends UsuarioEquipe {
  color: string;
}
