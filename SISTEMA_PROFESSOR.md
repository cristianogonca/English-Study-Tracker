# 👨‍🏫 Sistema Professor - Documentação

## 📊 Visão Geral

Sistema que permite professores editarem o cronograma e guia de estudos de seus alunos.

### Funcionamento:
1. **Cada aluno tem seu próprio cronograma e guia** (isolados no banco)
2. **Professor acessa painel** → Seleciona aluno → Edita cronograma/guia
3. **Aluno acessa** → Vê conteúdo atualizado pelo professor

---

## 🗄️ PASSO 1: Executar SQL no Supabase

### No Supabase Dashboard:
1. Acesse: **SQL Editor**
2. Cole o conteúdo de: `supabase_add_roles_and_guia.sql`
3. Execute

### O que o SQL faz:
✅ Adiciona coluna `role` na tabela `users` (aluno | professor | admin)
✅ Cria tabela `guia_estudos` (12 meses editáveis)
✅ Adiciona RLS policies (aluno vê só o seu, professor vê todos)
✅ Atualiza policy do `cronograma` (professor pode editar qualquer)
✅ Cria view `professor_alunos_view` (lista de alunos)

---

## 👥 PASSO 2: Definir Usuário como Professor

### No Supabase Dashboard:
1. Vá em **Table Editor** → `users`
2. Encontre seu usuário de teste
3. Edite: `role` → `professor`
4. Save

**OU via SQL:**
```sql
UPDATE users 
SET role = 'professor' 
WHERE email = 'seu-email@exemplo.com';
```

---

## 🎨 PASSO 3: Criar Páginas do Professor

### Estrutura de rotas:
```
/professor             → Lista de alunos
/professor/aluno/:id   → Detalhes do aluno
/professor/cronograma/:id → Editar cronograma (365 dias)
/professor/guia/:id    → Editar guia (12 meses)
```

### Componentes necessários:

#### 1. `/professor` - Lista de Alunos
```tsx
- Tabela com lista de alunos
- Colunas: Nome, Email, Data Início, Progresso, Ações
- Botões: Ver Cronograma | Ver Guia
```

#### 2. `/professor/cronograma/:id` - Editor de Cronograma
```tsx
- Tabela com 365 dias do aluno
- Colunas editáveis: Título Semana, Tarefas, Tempo
- Filtros: Por mês, semana, fase
- Botão: Salvar Alterações
```

#### 3. `/professor/guia/:id` - Editor de Guia
```tsx
- Abas ou acordeão: 12 meses
- Para cada mês:
  - Título (input)
  - Objetivos (textarea ou lista)
  - Gramática (textarea ou lista)
  - Vocabulário (textarea ou lista)
  - Listening (textarea ou lista)
  - Speaking (textarea ou lista)
  - Reading (textarea ou lista)
  - Writing (textarea ou lista)
  - Check Final (textarea ou lista)
- Botão: Salvar Mês
```

---

## 🔐 PASSO 4: Atualizar AuthService

### Adicionar `role` na sessão:

**Em `SupabaseAuthService.ts`:**
```typescript
// No login/getUsuarioAtual, incluir role:
const { data: userData } = await supabase
  .from('users')
  .select('id, nome, email, role')
  .eq('id', user.id)
  .single();

// Salvar na sessão:
localStorage.setItem('sessao_auth', JSON.stringify({
  usuarioId: userData.id,
  email: userData.email,
  nome: userData.nome,
  role: userData.role  // ← NOVO
}));
```

---

## 🛣️ PASSO 5: Proteger Rotas do Professor

### Em `App.tsx`:
```tsx
// Verificar se é professor antes de acessar rotas /professor
const sessao = JSON.parse(localStorage.getItem('sessao_auth') || '{}');
const isProfessor = sessao.role === 'professor' || sessao.role === 'admin';

<Route 
  path="/professor/*" 
  element={
    isProfessor 
      ? <ProfessorRoutes /> 
      : <Navigate to="/dashboard" replace />
  } 
/>
```

---

## 📝 PASSO 6: Criar Service para Professor

### `SupabaseProfessorService.ts`:

```typescript
export class SupabaseProfessorService {
  
  // Listar alunos
  async listarAlunos(): Promise<AlunoView[]> {
    const { data, error } = await supabase
      .from('professor_alunos_view')
      .select('*')
      .order('nome');
    
    if (error) throw error;
    return data || [];
  }

  // Buscar cronograma do aluno
  async buscarCronogramaAluno(userId: string): Promise<DiaEstudo[]> {
    const { data, error } = await supabase
      .from('cronograma')
      .select('*')
      .eq('user_id', userId)
      .order('diaNumero');
    
    if (error) throw error;
    return data || [];
  }

  // Atualizar dia do cronograma
  async atualizarDiaCronograma(diaId: string, updates: Partial<DiaEstudo>) {
    const { error } = await supabase
      .from('cronograma')
      .update(updates)
      .eq('id', diaId);
    
    if (error) throw error;
  }

  // Buscar guia do aluno
  async buscarGuiaAluno(userId: string): Promise<GuiaEstudosMes[]> {
    const { data, error } = await supabase
      .from('guia_estudos')
      .select('*')
      .eq('user_id', userId)
      .order('mes');
    
    if (error) throw error;
    return data || [];
  }

  // Atualizar mês do guia
  async atualizarMesGuia(userId: string, mes: number, dados: Partial<GuiaEstudosMes>) {
    const { error } = await supabase
      .from('guia_estudos')
      .upsert({
        user_id: userId,
        mes,
        ...dados
      }, {
        onConflict: 'user_id,mes'
      });
    
    if (error) throw error;
  }
}
```

---

## 🎯 PASSO 7: Inicializar Guia do Aluno no Setup

### Quando aluno criar perfil, popular `guia_estudos`:

**Em `SupabaseStudyService.ts` → `salvarConfiguracao()`:**

```typescript
// Após salvar user_config, criar guia inicial
await this.criarGuiaInicial(userId);

async criarGuiaInicial(userId: string) {
  const guiaInicial = [
    { mes: 1, titulo: "Fundamentos Absolutos", objetivos: [...], ... },
    { mes: 2, titulo: "Construção de Frases", objetivos: [...], ... },
    // ... até mês 12
  ];

  for (const mes of guiaInicial) {
    await supabase.from('guia_estudos').insert({
      user_id: userId,
      ...mes
    });
  }
}
```

---

## ✅ Checklist de Implementação

### Banco de Dados:
- [ ] Executar `supabase_add_roles_and_guia.sql`
- [ ] Definir pelo menos 1 usuário como `professor`
- [ ] Verificar RLS policies funcionando

### Backend/Services:
- [ ] Atualizar `SupabaseAuthService` para incluir `role`
- [ ] Criar `SupabaseProfessorService`
- [ ] Adicionar função `criarGuiaInicial()` no Setup

### Frontend:
- [ ] Página `/professor` (lista de alunos)
- [ ] Página `/professor/cronograma/:id` (editor)
- [ ] Página `/professor/guia/:id` (editor)
- [ ] Proteger rotas (verificar role)
- [ ] Adicionar link "Painel Professor" no Navigation (se role=professor)

### Testes:
- [ ] Professor consegue listar alunos
- [ ] Professor consegue editar cronograma de aluno
- [ ] Professor consegue editar guia de aluno
- [ ] Aluno vê mudanças do professor
- [ ] Aluno NÃO consegue acessar painel professor

---

## 🚀 Próximos Passos

**Posso começar por:**

1. **Criar `SupabaseProfessorService.ts`** (funções CRUD)
2. **Página `/professor`** (lista de alunos com tabela)
3. **Página `/professor/guia/:id`** (editor de 12 meses)
4. **Página `/professor/cronograma/:id`** (tabela de 365 dias)

**Qual você quer que eu faça primeiro?**

---

## 💡 Ideias Futuras

- 📊 Dashboard professor (métricas de todos alunos)
- 📧 Sistema de mensagens professor ↔ aluno
- 📝 Professor deixar comentários no cronograma
- 🎯 Templates de planos (básico, intermediário, intensivo)
- 📈 Relatório de progresso por aluno
- 🔔 Notificações quando aluno completa fase

---

**Status:** ✅ SQL Pronto | ⬜ Services | ⬜ UI Professor | ⬜ Testes
