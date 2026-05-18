# FlowSense — Levantamento Técnico Completo

> Gerado em: 2026-05-14 | Versão analisada: código atual em `c:\PI-2026\Portif-lio\FlowSense`

---

## 1. Visão Geral

**FlowSense** é uma plataforma de gestão de projetos colaborativa. Possui:
- **Backend** REST em **Fastify + TypeScript**, com Prisma ORM sobre PostgreSQL.
- **Frontend** SPA em **React + TypeScript + Vite**, com Zustand para estado e Tailwind CSS para estilos.
- Comunicação via **HTTP REST** (sem WebSockets, sem GraphQL).
- Autenticação por **JWT** armazenado em `localStorage`.

---

## 2. Estrutura Real do Projeto

```
FlowSense/
├── server/                  # Backend Node.js
│   ├── prisma/
│   │   ├── schema.prisma    # Definição do banco
│   │   └── migrations/
│   ├── src/
│   │   ├── server.ts        # Ponto de entrada + registro de plugins
│   │   ├── lib/
│   │   │   ├── prisma.ts    # Singleton do PrismaClient (com pool pg)
│   │   │   └── mailer.ts    # Envio de e-mail via Nodemailer
│   │   ├── middlewares/
│   │   │   └── auth.middleware.ts  # jwtVerify via @fastify/jwt
│   │   ├── types/
│   │   │   └── fastify.d.ts # Extensão de tipos: request.user
│   │   └── modules/
│   │       ├── auth/        # routes + service
│   │       ├── equipes/     # routes + service
│   │       ├── projetos/    # routes + service
│   │       ├── tarefas/     # routes + service
│   │       └── usuarios/    # routes + service
│   └── .env                 # DATABASE_URL, SMTP, JWT, FRONTEND_URL
│
└── web/                     # Frontend React
    ├── src/
    │   ├── App.tsx           # Raiz — apenas renderiza AppRoutes
    │   ├── main.tsx          # ReactDOM.render
    │   ├── index.css         # CSS global mínimo
    │   ├── routes/
    │   │   ├── AppRoutes.tsx # BrowserRouter + todas as rotas
    │   │   └── PrivateRoute.tsx # Guard simples por token
    │   ├── services/
    │   │   ├── api.ts        # Instância Axios + interceptors
    │   │   ├── auth.ts       # login/logout/register/getUsuarioLogado
    │   │   ├── projetoService.ts
    │   │   └── tarefaService.ts
    │   ├── store/
    │   │   ├── types.ts      # Interfaces centralizadas (Projeto, Tarefa, Usuario)
    │   │   ├── useEquipesStore.ts
    │   │   ├── useProjetosStore.ts
    │   │   ├── useTarefasStore.ts
    │   │   └── useUsuariosStore.ts  # Arquivo quase vazio / legado
    │   ├── types/
    │   │   └── equipe.ts     # Tipos específicos de equipe (duplicata parcial)
    │   ├── contexts/         # VAZIO — pasta criada mas não usada
    │   ├── utils/            # index.tsx vazio
    │   ├── components/
    │   │   ├── Layout/       # Sidebar + Outlet
    │   │   ├── Sidebar/      # Navegação lateral
    │   │   └── Modal/        # BaseModal reutilizável
    │   └── pages/
    │       ├── Login/
    │       ├── Cadastro/
    │       ├── AtivarConta/
    │       ├── Dashboard/
    │       ├── Projetos/     # Projects.tsx + CreateProjectModal + EditProjectModal
    │       ├── Kamban/       # index.tsx + CreateTaskModal + EditTaskModal
    │       ├── Equipe/       # index.tsx (572 linhas — página grande)
    │       ├── Notificacoes/
    │       └── Configuracoes/
    └── package.json
```

---

## 3. Stack Utilizada

### Backend
| Camada | Tecnologia |
|---|---|
| Runtime | Node.js + TypeScript (tsx watch em dev) |
| Framework HTTP | Fastify 5.x |
| ORM | Prisma 7.x |
| Banco | PostgreSQL (via adapter `@prisma/adapter-pg` + `pg` pool) |
| Autenticação | `@fastify/jwt` (HS256, expiração configurável) |
| Validação | Zod 4.x |
| E-mail | Nodemailer (SMTP Gmail configurado) |
| Hashing | bcryptjs |
| Logging | pino-pretty |
| CORS | `@fastify/cors` |

### Frontend
| Camada | Tecnologia |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| Estilização | Tailwind CSS 4 (via PostCSS) |
| Roteamento | React Router DOM 7 |
| Estado global | Zustand 5 |
| HTTP Client | Axios 1.x |
| Ícones | lucide-react |
| Auth externa | firebase (instalado, mas uso não verificado nas páginas lidas) |

---

## 4. Banco de Dados — Mapa de Modelos

```
Usuario
  ├── id, nome, email (unique), login (unique), senha, foto_url
  ├── perfil: ADMIN | GERENTE | USUARIO
  ├── status: ATIVO | PENDENTE | DESATIVADO
  ├── → UsuarioEquipe[] (membros em equipes)
  ├── → Equipe[] "DonoEquipe" (equipes que criou)
  ├── → ProjetoMembro[]
  ├── → Tarefa[] "ResponsavelPelaTarefa"
  ├── → TarefaMembro[]
  ├── → Comentario[]
  ├── → Notificacao[]
  ├── → HistoricoTarefa[]
  └── → TokenAtivacao[]

Equipe
  ├── id, nome, descricao, dono_id, eh_pessoal: Boolean
  ├── → Usuario "DonoEquipe"
  ├── → UsuarioEquipe[]
  ├── → Projeto[]
  └── → TokenAtivacao[]

UsuarioEquipe (tabela de associação)
  ├── usuario_id, equipe_id  ← unique juntos
  ├── cargo: ADMIN | GERENTE | MEMBRO (CargoEquipe)
  ├── status: ATIVO | PENDENTE | DESATIVADO
  └── ativado_em: DateTime?

TokenAtivacao
  ├── usuario_id, equipe_id, token (hash sha256), tipo: CONVITE_EQUIPE | RESETAR_SENHA
  ├── utilizado: Boolean, expira_em, utilizado_em
  └── validade: 7 dias

Projeto
  ├── id, nome, descricao, data_inicio, data_fim, cor (#hex), equipe_id?
  ├── → Equipe? (opcional — projeto pode existir sem equipe)
  ├── → ProjetoMembro[]
  ├── → ColunaKanban[]
  ├── → Tarefa[]
  └── → Tag[]

ProjetoMembro (tabela de associação)
  ├── id_projeto + id_usuario ← PK composta
  └── cargo: GERENTE | MEMBRO (Cargo)

ColunaKanban
  ├── id, nome, ordem, id_projeto
  └── → Tarefa[]
  (3 colunas padrão criadas ao criar projeto: "A Fazer", "Em Progresso", "Concluído")

Tarefa
  ├── id, titulo, descricao, prioridade (BAIXA|MEDIA|ALTA), progresso (0-100)
  ├── data_inicio, data_fim, prazo, ordem
  ├── id_responsavel, id_coluna?, id_projeto
  ├── → Subtarefa[], TarefaMembro[], TarefaTag[]
  ├── → Comentario[], Notificacao[], HistoricoTarefa[]
  └── → Anexo[]

Outros modelos: Subtarefa, Tag, TarefaTag, Anexo, Comentario, Notificacao, HistoricoTarefa
```

---

## 5. Rotas da API (Backend)

### Auth (público)
| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/register` | Registra usuário + cria equipe pessoal |
| POST | `/auth/login` | Login por email ou login + retorna JWT |
| POST | `/auth/ativar` | Ativa conta de convidado via token |

### Equipes (autenticado)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/equipes` | Lista equipes do usuário logado |
| POST | `/equipes` | Cria nova equipe (usuário vira ADMIN) |
| PATCH | `/equipes/:id` | Edita nome/descrição (somente dono) |
| DELETE | `/equipes/:id` | Deleta equipe (somente dono, não pessoais) |
| POST | `/equipes/:id/convidar` | Convida membro por e-mail |
| GET | `/equipes/:id/membros` | Lista membros da equipe |
| GET | `/membros-disponiveis` | Lista todos os membros das equipes do usuário |

### Projetos (autenticado)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/projetos` | Lista projetos onde o usuário é membro |
| GET | `/projetos/:id` | Detalha projeto (verifica acesso) |
| POST | `/projetos` | Cria projeto (criador vira GERENTE, colunas Kanban padrão) |
| PATCH | `/projetos/:id` | Edita projeto (somente GERENTE) |
| DELETE | `/projetos/:id` | Deleta projeto (somente GERENTE) |
| POST | `/projetos/:id/membros` | Adiciona membro (somente GERENTE) |
| DELETE | `/projetos/:id/membros/:userId` | Remove membro (somente GERENTE) |
| PATCH | `/projetos/:id/membros/:userId` | Atualiza cargo de membro (somente GERENTE) |

### Tarefas (autenticado)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/tarefas` | Lista todas as tarefas do usuário |
| GET | `/projetos/:id/tarefas` | Lista tarefas de um projeto |
| POST | `/tarefas` | Cria tarefa (verificação de membro do projeto) |
| PATCH | `/tarefas/:id` | Edita tarefa (qualquer membro do projeto) |
| DELETE | `/tarefas/:id` | Deleta tarefa (somente responsável ou ADMIN global) |

### Usuários (autenticado)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/usuarios` | Lista todos os usuários do sistema (sem filtro) |
| POST | `/usuarios` | Cria usuário sem senha (obsoleto / legado) |

### Saúde
| Método | Rota | Descrição |
|---|---|---|
| GET | `/health` | Status da API |

---

## 6. Fluxo de Autenticação

```
REGISTRO NORMAL
  POST /auth/register
  → Cria Usuario (status ATIVO)
  → Cria Equipe pessoal (eh_pessoal=true, cargo=ADMIN)
  → Retorna usuário (sem JWT — usuário precisa fazer login)

LOGIN
  POST /auth/login (identificador = email ou login)
  → Valida senha com bcrypt
  → Assina JWT: { sub: usuario.id, perfil }
  → Frontend salva token em localStorage["flowsense_token"]
  → Frontend salva usuário em localStorage["flowsense_user"]

CONVITE DE MEMBRO
  POST /equipes/:id/convidar
  → Verifica se solicitante é ADMIN ou GERENTE da equipe
  → Cria/reutiliza Usuario com status PENDENTE
  → Cria UsuarioEquipe com status PENDENTE
  → Gera TokenAtivacao (sha256, 7 dias)
  → Envia e-mail com link /ativar/:token

ATIVAÇÃO DE CONTA
  POST /auth/ativar (token, login, senha)
  → Valida token (não utilizado, não expirado)
  → Atualiza Usuario (status ATIVO, define login e senha com hash)
  → Atualiza UsuarioEquipe (status ATIVO)
  → Marca token como utilizado
  → Retorna JWT (login automático)

PROTEÇÃO DE ROTAS
  Middleware autenticarMiddleware:
    → request.jwtVerify() via @fastify/jwt
    → Popula request.user = { sub, perfil }
    → Aplicado via addHook("preHandler") em todos os módulos exceto auth
```

---

## 7. Fluxo de Dados — Frontend

```
main.tsx → App.tsx → AppRoutes.tsx
  ↓
BrowserRouter
  ├── /login          → Login.tsx    → auth.ts → POST /auth/login
  ├── /register       → Register.tsx → auth.ts → POST /auth/register
  ├── /ativar/:token  → AtivarConta  → api → POST /auth/ativar
  └── PrivateRoute (verifica localStorage token)
       └── Layout (Sidebar + Outlet)
            ├── /dashboard     → Dashboard/index.tsx   → useProjetosStore
            ├── /projetos      → Projetos/Projects.tsx → useProjetosStore
            ├── /kamban        → Kamban/index.tsx       → useTarefasStore + useProjetosStore
            ├── /equipe        → Equipe/index.tsx       → useEquipesStore
            ├── /notificacoes  → Notificacoes/index.tsx
            └── /configuracoes → Configuracoes/index.tsx

Padrão de comunicação nas stores Zustand:
  Page → Store.action() → Service.método() → api.get/post/patch/delete() → Backend
```

---

## 8. Mapa das Stores (Estado Global)

### `useEquipesStore`
- Estado: `equipes[]`, `equipeAtiva`, `carregando`, `erro`, `membrosDisponiveis[]`
- Ações: `listar`, `criar`, `definirAtiva`, `atualizar`, `deletar`, `convidarMembro`, `listarMembros`, `listarMembrosDisponiveis`
- Usa: `api` diretamente (sem service separado)

### `useProjetosStore`
- Estado: `projetos[]`, `projetoAtual`, `carregando`, `erro`
- Ações: `listar`, `obter`, `criar`, `atualizar`, `deletar`, `adicionarMembro`, `removerMembro`, `definirProjetoAtivo`, `limpar`
- Usa: `projetoService` (camada de service intermediária)

### `useTarefasStore`
- Estado: `tarefas[]`, `carregando`, `erro`
- Ações: `listar`, `criar`, `atualizar`, `deletar`, `limpar`
- Usa: `tarefaService` (camada de service intermediária)

### `useUsuariosStore`
- Estado: vazio
- É um arquivo quase morto — importa `useEquipeStore` (que não existe: **bug de import quebrado**)

---

## 9. Problemas Arquiteturais Identificados

### 🔴 Críticos

**P1 — Import quebrado em `useUsuariosStore.ts`**
```ts
import { useEquipeStore } from "./useEquipeStore"; // arquivo NÃO existe
```
O arquivo correto é `useEquipesStore`. Qualquer página que importar `useUsuariosStore` vai quebrar em runtime.

**P2 — `ativarConta` duplicada com lógica inconsistente**
Existe em dois lugares com implementações diferentes:
- `auth.service.ts` → usa `bcrypt.hash` + retorna JWT real ✅
- `equipes.service.ts` → usa `Buffer.from(JSON.stringify(...)).toString("base64")` → **JWT falso!** ❌
A função em `equipes.service.ts` nunca é chamada via rota (a rota `/auth/ativar` usa corretamente a de `auth.service.ts`), mas é um código perigoso e confuso.

**P3 — `GET /usuarios` expõe todos os usuários sem filtro**
`listarUsuarios()` retorna todos os usuários do sistema para qualquer usuário autenticado. Quebra isolamento de dados.

**P4 — `baseURL` hardcoded em `api.ts`**
```ts
baseURL: "http://localhost:3333"
```
Não usa variável de ambiente. Em produção, vai falhar.

**P5 — Senha real de Gmail no `.env` commitado**
O `.env` contém credenciais SMTP do Gmail. Esse arquivo não deveria estar no repositório.

---

### 🟡 Importantes

**P6 — Inconsistência de tipagem: duas definições de `Usuario`**
- `web/src/types/equipe.ts` → define `Usuario`
- `web/src/store/types.ts` → define `Usuario` diferente
- `web/src/services/auth.ts` → define mais uma interface `Usuario`
Três definições diferentes do mesmo conceito, sem unificação.

**P7 — `useEquipesStore` usa `any[]` em vários lugares**
```ts
membrosDisponiveis: any[];
usuarios?: any[];
```
Perde todo o benefício do TypeScript.

**P8 — `equipes.service.ts` tem função `ativarConta` nunca chamada por rota**
A função existe, nunca é exposta como rota. Código morto com lógica incorreta.

**P9 — `listarUsuariosParaAdicionar()` em `projetos.service.ts` nunca é chamada por rota**
Função implementada no service mas sem rota correspondente. Funcionalidade incompleta.

**P10 — Kanban usa `alert()` para erros**
```ts
alert(err instanceof Error ? err.message : "Erro ao criar tarefa");
```
`alert()` nativo em vez de sistema de notificação consistente.

**P11 — Equipe/index.tsx tem 572 linhas com tudo misturado**
- Estado local de UI
- Lógica de negócio (handlers)
- 4 modais inline (não usam o `BaseModal` existente)
- Renderização condicional complexa
Componente monolítico que precisa ser decomposto.

**P12 — Kanban não suporta drag-and-drop**
O board Kanban é read-only para mover tarefas entre colunas. Mover tarefas entre colunas requer editar manualmente a tarefa.

**P13 — `convidarMembro` permite cargo `ADMIN` no frontend mas o schema bloqueia**
O select no modal de convite tem a opção "Admin", mas `convidarMembroSchema` só aceita `"GERENTE" | "MEMBRO"`. O Zod vai rejeitar a requisição se "ADMIN" for selecionado, deve ser apenas gerente.

**P14 — `PrivateRoute` só verifica existência do token, não validade**
```ts
return isAutenticado() ? <Outlet /> : <Navigate to="/login" />
```
`isAutenticado()` apenas checa se a string existe no localStorage. Token expirado passa pela guard.

**P15 — `firebase` instalado mas sem uso aparente nas páginas analisadas**
Dependência de ~500KB sem uso claro. Pode ser legado de uma tentativa anterior de auth via Firebase.

---

### 🟢 Menores / Organização

**P16 — `contexts/` vazio, `utils/index.tsx` vazio, `store/index.tsx` vazio**
Pastas e arquivos criados como placeholder sem conteúdo, conteudo organizado erronealemnte segundo extruturação.

**P17 — Padrão inconsistente de acesso à API entre stores**
- `useEquipesStore` → chama `api` diretamente
- `useProjetosStore` / `useTarefasStore` → usam um service intermediário
Duas abordagens para o mesmo problema.

**P18 — `criarProjeto` não está vinculado a uma equipe**
O endpoint `POST /projetos` não associa o projeto a nenhuma equipe. `equipe_id` é opcional no schema, mas nunca é passado pelo frontend.

**P19 — Erro de código de status em `criarProjeto`**
```ts
(error as NodeJS.ErrnoException).code = "BAD_REQUEST";
```
O `handleServiceError` nos routes não trata `BAD_REQUEST`, então cai no bloco 500.

---

## 10. O Que Está Bem Estruturado

| Ponto positivo | Detalhe |
|---|---|
| Módulos isolados no backend | Cada módulo tem seu próprio `routes.ts` + `service.ts` |
| `handleServiceError` centralizado | Evita duplicação de tratamento de erro nas routes (exceto em `auth.routes.ts`) |
| Prisma com pool de conexões | `lib/prisma.ts` usa `@prisma/adapter-pg` com pool configurado |
| Criação automática de equipe pessoal | `auth.service.ts` cria a equipe ao registrar (com try/catch para não falhar o registro) |
| Validação com Zod | Todos os inputs passam por schemas Zod antes de chegar ao banco |
| `BaseModal` reutilizável | Existe um componente modal base — porém subutilizado |
| Cascade configurado no Prisma | `onDelete: Cascade` na maioria das relações garante integridade |
| Tipos centralizados em `store/types.ts` | Boa intenção de centralizar (apesar de não estar completo) |
| Proteção de equipe pessoal | `deletarEquipe` impede deleção de equipes com `eh_pessoal=true` |
| `listarMembrosDisponiveis` implementado | Backend e store já têm a função — falta uso no frontend |

---

## 11. Alem disso é preciso (sem prioridade de execução)

### Frontend
1. **Unificar tipos**: criar um único `src/types/index.ts` exportando todas as interfaces
2. **Decompor `Equipe/index.tsx`**: usar o BaseModal componente.
3. **Criar sistema de toast/notificação**: substituir `alert()` e mensagens inline
4. **Usar `BaseModal`** nos modais inline da página de Equipe
5. **Adicionar variável de ambiente** `VITE_API_URL` no frontend
6. **Validar JWT** no `PrivateRoute` (decodificar e verificar expiração)
7. **Remover `firebase`** se não for usado
8. **Reorganizar arquivos vazios**: `contexts/`, `utils/`, `store/index.tsx`, colocar coisas que deveriam estar neles ou apagar.

### Backend
1. **Unificar `handleServiceError`** em um único middleware/helper compartilhado (está duplicado em 4 arquivos de routes)
2. **Remover `ativarConta` de `equipes.service.ts`** (código morto com implementação incorreta)*nao tirar oq for fundamental*
3. **Adicionar filtro em `GET /usuarios`**: retornar apenas usuários relacionados ao solicitante
4. **Tratar `BAD_REQUEST`** no `handleServiceError`
5. **Adicionar rota `GET /projetos/:id/membros-disponiveis`** para frontend de atribuição de projeto
6. **Validar `JWT_SECRET`** no startup em vez de usar fallback inseguro

### Banco
1. **Vincular projetos a equipes** no fluxo de criação
2. **Considerar campo `updatedAt` em `UsuarioEquipe`** para auditoria

---

## 12. Riscos ao Modificar Partes Específicas

| Área | Risco | Cuidado |
|---|---|---|
| `schema.prisma` | Qualquer mudança requer migração — pode quebrar dados em produção | Sempre usar `prisma migrate dev` em dev e `deploy` em prod |
| `auth.service.ts` → `registrar` | Criação de equipe pessoal está em try/catch silencioso | Se falhar, usuário fica sem equipe pessoal sem saber |
| `equipes.service.ts` → `convidarMembro` | Cria usuário com senha vazia se e-mail não existir | Usuários PENDENTE sem senha ficam no banco |
| `PrivateRoute` | Qualquer mudança afeta todas as rotas privadas | Testar todos os fluxos de sessão |
| `useEquipesStore` | É usado diretamente pela página mais complexa (Equipe/index.tsx) | Mudanças na interface quebram 572 linhas de UI |
| `Projeto.equipe_id` opcional | Remover a opcionalidade quebraria projetos existentes sem equipe | Migração com `default` necessária |

---

## 13. Prioridades de Refatoração Sugeridas

### P1 — Imediato (bugs reais)
- [ ] Corrigir import quebrado em `useUsuariosStore.ts`
- [ ] Remover / isolar `ativarConta` duplicada em `equipes.service.ts`
- [ ] Remover hardcode `http://localhost:3333` do `api.ts`

### P2 — Alta (segurança e consistência)
- [ ] Remover `.env` do controle de versão / revogar credenciais expostas
- [ ] Filtrar `GET /usuarios` para retornar apenas usuários do contexto
- [ ] Corrigir modal de convite: remover opção "ADMIN" do select

### P3 — Média (qualidade de código)
- [ ] Unificar definições de `Usuario` em um único arquivo de tipos
- [ ] Extrair modais de `Equipe/index.tsx` em componentes separados
- [ ] Adicionar tratamento de `BAD_REQUEST` no `handleServiceError`
- [ ] Substituir `alert()` do Kanban por sistema de notificação

### P4 — Baixa (débito técnico)
- [ ] Remover arquivos e pastas vazias
- [ ] Unificar padrão de acesso à API (service vs api direto nas stores)
- [ ] Remover dependência `firebase` se não utilizada
- [ ] Tipar os `any[]` nas stores
