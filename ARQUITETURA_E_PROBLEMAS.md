# FlowSense - Análise de Problemas e Arquitetura

## 📋 Resumo Executivo

O FlowSense é uma plataforma de gestão de projetos colaborativa. Atualmente, há falhas críticas na lógica de permissões e relacionamentos entre usuários, equipes e projetos. Este documento detalha os problemas, a arquitetura esperada e as soluções.

---

## 🔴 Problemas Identificados

### Problema 1: Adicionar Membros em Equipes Diferentes

**Situação Atual:**
- Usuário foi adicionado a uma "Equipe de Colaboração" como MEMBRO
- Quando tenta adicionar membros, só consegue adicionar na equipe em que foi convidado
- Não consegue adicionar membros em outras equipes (mesmo que seja ADMIN)

**Impacto:**
- Usuário ADMIN não consegue gerenciar sua própria equipe
- Restrição de permissões aplicada incorretamente
- Impossível expandir equipes

**Root Cause:**
- Verificação de permissões está correta (`verificar se é ADMIN/GERENTE`)
- Problema: Usuário criou uma equipe mas **não está como ADMIN dela**, está apenas como MEMBRO da equipe colaborativa

---

### Problema 2: Falta de Equipe Pessoal

**Situação Atual:**
- Não existe conceito de "equipe pessoal" para cada usuário
- Usuário precisa ser adicionado como ADMIN em todas as equipes que quer gerenciar
- Falta diferenciação entre equipe própria e colaborativa

**Impacto:**
- Sem estrutura base para cada usuário
- Impossível ter um espaço "pessoal" vs "colaborativo"
- Confusão de papéis

**Root Cause:**
- Ao registrar usuário, não é criada equipe pessoal automaticamente
- Schema não tem flag para distinguir "equipe pessoal"

---

### Problema 3: Falta de Editar/Deletar Equipes

**Situação Atual:**
- Não existem rotas para editar ou deletar equipes
- Usuário não consegue gerenciar equipes que criou
- Sem UI para estas operações

**Impacto:**
- Impossível corrigir nome/descrição de equipe
- Impossível remover equipes antigas
- Funcionalidade incompleta

**Root Cause:**
- Rotas não implementadas (`PATCH /equipes/:id`, `DELETE /equipes/:id`)
- Serviços não existem

---

### Problema 4: Atribuição de Projetos Limitada

**Situação Atual:**
- Ao criar projeto, pode-se atribuir membros na criação
- Não há forma de listar e atribuir membros já existentes na conta
- Sistema limita a membros da equipe, não da conta

**Impacto:**
- Não consegue atribuir projeto a vários membros já cadastrados
- Necessário recrear projeto para adicionar membros
- Fluxo de trabalho quebrado

**Root Cause:**
- Função `listarMembrosDisponiveis` não existe
- Frontend não tem UI para seleção múltipla de membros
- Backend não diferencia "membros da conta" vs "membros da equipe"

---

## 🏗️ Arquitetura Esperada

### Modelo de Dados (Relacionamentos)

```
┌─────────────────┐
│     USUARIO     │
├─────────────────┤
│ id              │
│ nome            │
│ email           │
│ ...             │
└────────┬────────┘
         │
         │ 1:N
         ↓
┌──────────────────────┐
│   USUARIO_EQUIPE     │ ← Relacionamento de associação
├──────────────────────┤
│ usuario_id           │
│ equipe_id            │
│ cargo (ADMIN/MEMBRO) │ ← Define permissões
│ status               │
└────────┬─────────────┘
         │
         │ N:1
         ↓
┌──────────────────┐
│      EQUIPE      │
├──────────────────┤
│ id               │
│ nome             │
│ dono_id          │
│ eh_pessoal: bool │ ← NOVO: Flag para equipe pessoal
└────────┬─────────┘
         │
         │ 1:N
         ↓
┌──────────────────────┐
│      PROJETO         │
├──────────────────────┤
│ id                   │
│ nome                 │
│ equipe_id (opcional) │
└────────┬─────────────┘
         │
         │ 1:N
         ↓
┌──────────────────────┐
│   PROJETO_MEMBRO     │
├──────────────────────┤
│ projeto_id           │
│ usuario_id           │
│ cargo                │
└──────────────────────┘
```

### Fluxo de Permissões

#### 1. **Criar Equipe**
```
Usuário → Cria Equipe → Sistema cria UsuarioEquipe com cargo ADMIN
```

#### 2. **Adicionar Membro à Equipe**
```
Verificar: usuário_atual.cargo em [ADMIN, GERENTE]?
  ✓ SIM → Permitir convite
  ✗ NÃO → Rejeitar com 403 FORBIDDEN
```

#### 3. **Editar/Deletar Equipe**
```
Verificar: usuário_atual == dono_equipe OU cargo == ADMIN?
  ✓ SIM → Permitir operação
  ✗ NÃO → Rejeitar com 403 FORBIDDEN
```

#### 4. **Atribuir Membro a Projeto**
```
Verificar: usuário_atual é GERENTE do projeto?
  ✓ SIM → Permitir
       → Listar apenas membros que o usuário tem acesso
       → Priorizar: equipe pessoal + equipes colaborativas
  ✗ NÃO → Rejeitar com 403 FORBIDDEN
```

---

## 📊 Estrutura de Equipes

### Equipe Pessoal (Nova)
```javascript
{
  id: "uuid",
  nome: "${usuario.nome} - Pessoal",
  descricao: "Equipe pessoal",
  dono_id: "usuario_id",
  eh_pessoal: true,        // ← NOVO
  usuarios: [
    {
      usuario_id: "usuario_id",
      cargo: "ADMIN",
      status: "ATIVO"
    }
  ]
}
```

### Equipe Colaborativa (Existente)
```javascript
{
  id: "uuid",
  nome: "Design Team",
  descricao: "Equipe de Design",
  dono_id: "usuario_criador_id",
  eh_pessoal: false,        // ← NOVO
  usuarios: [
    { usuario_id: "admin_id", cargo: "ADMIN", ... },
    { usuario_id: "membro_id", cargo: "MEMBRO", ... },
    { usuario_id: "novo_usuario_id", cargo: "GERENTE", ... }
  ]
}
```

---

## 🛠️ Soluções Propostas

### Solução 1: Criar Equipe Pessoal ao Registrar

**Passo 1:** Atualizar Schema
```prisma
model Equipe {
  ...
  eh_pessoal Boolean @default(false)
}
```

**Passo 2:** Atualizar Serviço de Autenticação
```typescript
// src/modules/auth/auth.service.ts
async function registrarUsuario(...) {
  // 1. Criar usuário
  const usuario = await prisma.usuario.create({ ... })
  
  // 2. Criar equipe pessoal automaticamente
  const equipePessoal = await prisma.equipe.create({
    data: {
      nome: `${usuario.nome} - Pessoal`,
      dono_id: usuario.id,
      eh_pessoal: true,
      usuarios: {
        create: {
          usuario_id: usuario.id,
          cargo: "ADMIN",
          status: "ATIVO",
          ativado_em: new Date()
        }
      }
    }
  })
  
  return usuario
}
```

---

### Solução 2: Rotas de Editar/Deletar Equipes

**Passo 1:** Adicionar Serviços
```typescript
// src/modules/equipes/equipes.service.ts

export async function atualizarEquipe(
  usuarioId: string,
  equipeId: string,
  data: { nome?: string; descricao?: string }
): Promise<Equipe> {
  // Verificar se é dono ou admin
  const equipe = await prisma.equipe.findUnique({ where: { id: equipeId } })
  
  if (!equipe || (equipe.dono_id !== usuarioId)) {
    throw new Error("Sem permissão")
  }
  
  return prisma.equipe.update({
    where: { id: equipeId },
    data: { nome: data.nome, descricao: data.descricao }
  })
}

export async function deletarEquipe(
  usuarioId: string,
  equipeId: string
): Promise<void> {
  // Mesma verificação
  // Não deletar equipes pessoais
  // Deletar em cascata: projetos, membros, etc
}
```

**Passo 2:** Adicionar Rotas
```typescript
fastify.patch("/equipes/:id", ...)
fastify.delete("/equipes/:id", ...)
```

---

### Solução 3: Listar Membros Disponíveis

**Objetivo:** Ao atribuir projeto, listar todos os usuários que o usuário atual conhece

**Lógica:**
1. Membros da equipe pessoal
2. Membros de equipes colaborativas onde está
3. Usuários que já convidou para projetos

**Passo 1:** Adicionar Rota
```typescript
// GET /membros-disponiveis
fastify.get("/membros-disponiveis", async (request, reply) => {
  const membros = await listarMembrosDisponiveis(request.user.sub)
  return reply.send(membros)
})
```

**Passo 2:** Implementar Serviço
```typescript
export async function listarMembrosDisponiveis(usuarioId: string) {
  // Buscar todas as equipes do usuário
  const equipes = await prisma.usuarioEquipe.findMany({
    where: { usuario_id: usuarioId },
    include: { equipe: { include: { usuarios: { include: { usuario: true } } } } }
  })
  
  // Extrair membros únicos
  const membrosSet = new Set()
  for (const eq of equipes) {
    for (const ue of eq.equipe.usuarios) {
      if (ue.usuario_id !== usuarioId) {
        membrosSet.add(JSON.stringify(ue.usuario))
      }
    }
  }
  
  return Array.from(membrosSet).map(m => JSON.parse(m))
}
```

---

### Solução 4: UI para Gerenciar Equipes

**Componentes a Adicionar:**
```typescript
// Botão Editar
<button onClick={() => abrirModalEditar(equipe)}>
  ✏️ Editar
</button>

// Botão Deletar (com confirmação)
<button onClick={() => confirmarDeletar(equipe)}>
  🗑️ Deletar
</button>

// Modal de Edição
<Modal>
  <input value={nome} onChange={setNome} />
  <input value={descricao} onChange={setDescricao} />
  <button onClick={salvar}>Salvar</button>
</Modal>
```

---

### Solução 5: UI para Atribuir Membros a Projetos

**Componentes a Adicionar:**
```typescript
// Seletor múltiplo de membros
<Select
  isMulti={true}
  options={membrosDisponiveis}
  onChange={setMembrosAtribuidos}
  placeholder="Selecione membros..."
/>

// Ao criar/editar projeto
const projeto = await criarProjeto({
  nome,
  descricao,
  membros: membrosAtribuidos.map(m => ({ id_usuario: m.id }))
})
```

---

## 📈 Diagrama de Fluxo

### Fluxo: Registrar → Criar Equipe Pessoal → Convidar → Atribuir a Projeto

```
1. REGISTRAR USUÁRIO
   └─ Sistema cria equipe pessoal automaticamente (eh_pessoal=true)
      └─ Usuário é ADMIN da equipe pessoal

2. CRIAR PROJETO
   └─ Projeto pode ter membros da equipe pessoal
      └─ Criador é GERENTE do projeto

3. CONVIDAR MEMBRO
   └─ Verificar se é ADMIN/GERENTE da equipe
      └─ Sistema envia email
         └─ Membro ativa conta
            └─ Agora aparece em "membros disponíveis"

4. ATRIBUIR A PROJETO
   └─ Listar membros disponíveis
      └─ Usuário seleciona múltiplos
         └─ Adicionar ProjetoMembro para cada um

5. GERENCIAR EQUIPE
   └─ Editar nome/descrição (somente ADMIN/dono)
   └─ Deletar equipe (somente dono, não pessoais)
   └─ Remover membros (somente ADMIN/GERENTE)
```

---

## ✅ Checklist de Implementação

### Backend
- [ ] Adicionar coluna `eh_pessoal` ao schema de Equipe
- [ ] Executar migração Prisma
- [ ] Criar equipe pessoal ao registrar usuário
- [ ] Implementar `atualizarEquipe()`
- [ ] Implementar `deletarEquipe()`
- [ ] Implementar `listarMembrosDisponiveis()`
- [ ] Adicionar rotas PATCH e DELETE para equipes
- [ ] Adicionar rota GET para membros disponíveis

### Frontend
- [ ] Adicionar botões Editar/Deletar em EquipePage
- [ ] Criar Modal de edição de equipe
- [ ] Implementar confirmação de deleção
- [ ] Atualizar form de criar projeto com seletor múltiplo
- [ ] Atualizar store de equipes com funções novas
- [ ] Testar fluxo completo

---

## 🎯 Prioridade de Implementação

1. **CRÍTICO (P1):**
   - Criar equipe pessoal ao registrar
   - Rotas de editar/deletar equipes

2. **ALTA (P2):**
   - Listar membros disponíveis
   - UI para gerenciar equipes

3. **MÉDIA (P3):**
   - UI para atribuir membros a projetos
   - Testes e validação

---

## 📝 Notas Importantes

1. **Equipe Pessoal**: Nunca deve ser deletável pelo usuário (apenas por admin)
2. **Permissões**: Sempre verificar ADMIN/GERENTE antes de operações
3. **Cascata**: Ao deletar equipe, verificar projetos vinculados
4. **Email**: Enviar notificação ao adicionar a projeto
5. **UI/UX**: Deixar claro qual é a equipe pessoal vs colaborativa

---

## 🔗 Referências

- **Schema Prisma**: `server/prisma/schema.prisma`
- **Serviço de Equipes**: `server/src/modules/equipes/equipes.service.ts`
- **Rotas de Equipes**: `server/src/modules/equipes/equipes.routes.ts`
- **Serviço de Projetos**: `server/src/modules/projetos/projetos.service.ts`
- **Frontend Equipes**: `web/src/pages/Equipe/index.tsx`
- **Store de Equipes**: `web/src/store/useEquipesStore.ts`

