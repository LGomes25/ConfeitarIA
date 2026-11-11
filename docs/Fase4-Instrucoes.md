# 📝 Instruções de Implementação — Fase 4

## Receitas, Precificação e Produtos

**Projeto:** ConfeitarIA
**Fase:** 4
**Data:** 10/11/2026
**Base:** Estrutura existente preservada — Fases 1, 2 e 3 inalteradas

---

## 1. Objetivo

Implementar o gerenciamento de **Componentes**, **Receitas Completas**, **Produtos**, **Precificação automática** e **Vitrine de Produtos**, sem alterar o funcionamento das Fases 1, 2 e 3. Nada do que já funciona deve ser alterado ou quebrado.

---

## 2. Princípios de Implementação

### 2.1 Respeitar o Existente

>
> ✅ **Não modifique arquivos ou funcionalidades das Fases 1, 2 e 3.**

- `InsumosController`, `ComprasController` → inalterados
- Autenticação, perfis e notificações → inalterados
- Páginas públicas e layout → inalterados
- Apenas **adicione** novos arquivos, rotas e componentes conforme abaixo

### 2.2 Separação de Perfis e Permissões

| Área                    | Admin / Manager | Team                 | Customer / Visitante |
| ----------------------- | --------------- | -------------------- | -------------------- |
| 🧩 Componentes          | ✅ CRUD completo | ✅ Leitura e cadastro | ❌ Sem acesso         |
| 📖 Receitas Completas   | ✅ CRUD completo | ✅ Leitura e cadastro | ❌ Sem acesso         |
| 🏷️ Produtos (Cadastro) | ✅ CRUD completo | ❌ Sem acesso         | ❌ Sem acesso         |
| 💰 Precificação         | ✅ Completo      | ❌ Sem acesso         | ❌ Sem acesso         |
| 📊 Relatório de Custos  | ✅ Completo      | ❌ Sem acesso         | ❌ Sem acesso         |
| 🍰 Vitrine de Produtos  | ✅ Visualização  | ✅ Visualização       | ✅ Apenas leitura     |

> **Aplicar no Backend:**
>
>
> - Componentes e Receitas: `[Authorize(Roles = "Admin,Manager,Team")]`
> - Produtos, Precificação e Relatórios: `[Authorize(Roles = "Admin,Manager")]`
> - Vitrine Pública: `[AllowAnonymous]`

---

## 3. Backend — Novos Arquivos e Migração

### 3.1 Camadas Envolvidas

| Camada                 | O que criar                                                                                                                             |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Domain/Entities        | `Componente.cs`, `ReceitaCompleta.cs`, `ItemReceita.cs`, `Produto.cs`, `ProdutoComponente.cs`, `ItemExtraProduto.cs`, `Precificacao.cs` |
| Application/DTOs       | DTOs de leitura, criação e atualização para cada entidade                                                                               |
| Application/Services   | Serviços com regras de negócio e cálculos de custo                                                                                      |
| Persistence/Migrations | Migração das novas tabelas                                                                                                              |
| API/Controllers        | `ComponentesController`, `ReceitasCompletasController`, `ProdutosController`, `PrecificacaoController`, `RelatoriosController`          |

### 3.2 Migração do Banco

1. Gerar migração: `dotnet ef migrations add Fase4_ReceitasPrecificacaoProdutos`
2. Verificar o script gerado — tabelas novas apenas, sem alterar tabelas existentes
3. Aplicar: `dotnet ef database update`
4. Confirmar que `insumos`, `registros_compra` e tabelas de usuário permanecem intactas

### 3.3 Regras de Cálculo — Implementar nos Serviços

**Cálculo do Custo do Produto:**
custo_total_insumos =
    Σ (itens_receita de todos os componentes vinculados)
  + Σ (itens_receita da receita_completa vinculada)
  + Σ (itens_extras_produto)

custo_total = custo_total_insumos + (custo_mao_de_obra se informado)

**Regra de Preço Sugerido:**
preco_sugerido = custo_total × 2  // margem padrão 100%
preco_venda_final = preco_sugerido  // valor inicial — editável

**Regra de Alerta de Variação:**

- Ao atualizar preço de um insumo → recalcular custo de todos os produtos afetados
- Se `ABS(novo_custo - custo_anterior) / custo_anterior × 100 ≥ 5` → `alerta_variacao_preco = true`
- Alerta desativa ao salvar preço de venda final

---

## 4. Frontend — Estrutura e Novos Arquivos

### 4.1 Estrutura de Pastas

frontend/src/
├── types/
│   ├── componente.types.ts
│   ├── receitaCompleta.types.ts
│   ├── produto.types.ts
│   ├── precificacao.types.ts
│   ├── itemExtraProduto.types.ts
│   └── analiseCusto.types.ts
├── components/
│   ├── receitas/
│   │   ├── ComponenteForm.tsx
│   │   ├── ComponenteLista.tsx
│   │   ├── ReceitaCompletaForm.tsx
│   │   ├── ReceitaCompletaLista.tsx
│   │   └── ItemReceitaEditor.tsx
│   ├── produtos/
│   │   ├── ProdutoForm.tsx
│   │   ├── ProdutoLista.tsx
│   │   ├── MontagemProduto.tsx
│   │   ├── ItensExtrasEditor.tsx
│   │   └── ComposicaoCusto.tsx
│   ├── precificacao/
│   │   ├── PrecificacaoCard.tsx
│   │   ├── AnaliseImpacto.tsx
│   │   └── AlertaVariacao.tsx
│   ├── relatorios/
│   │   └── RelatorioCustosEPrecos.tsx
│   └── vitrine/
│       ├── VitrineProdutos.tsx
│       └── ProdutoCardPublico.tsx
├── pages/
│   ├── receitas/
│   │   ├── componentes/Lista.tsx
│   │   ├── componentes/Novo.tsx
│   │   ├── completas/Lista.tsx
│   │   └── completas/Novo.tsx
│   ├── admin/
│   │   ├── produtos/Lista.tsx
│   │   ├── produtos/Novo.tsx
│   │   └── produtos/[id].tsx
│   └── relatorios/CustosEPreços.tsx
├── hooks/
│   ├── usePrecificacao.ts
│   └── useComposicaoCusto.ts
└── routes.ts  ← apenas adicionar novas rotas

### 4.2 Atualização do Menu e Rotas

**Atualizar apenas adicionando — não remover nem alterar links existentes:**
// No menu lateral — visível conforme perfil
{perfil === 'Admin' || perfil === 'Manager' || perfil === 'Team' && (
  <>
    <Link to="/receitas/componentes">🧩 Componentes</Link>
    <Link to="/receitas/completas">📖 Receitas</Link>
  </>
)}
{(perfil === 'Admin' || perfil === 'Manager') && (
  <>
    <Link to="/admin/produtos">🏷️ Produtos</Link>
    <Link to="/relatorios/custos-e-precos">📊 Custos e Preços</Link>
  </>
)}

// Rotas em App.tsx
<Route element={<ProtectedRoute perfisPermitidos={["Admin","Manager","Team"]} />}>
  <Route path="/receitas/componentes" element={<ComponenteLista />} />
  <Route path="/receitas/componentes/novo" element={<ComponenteForm />} />
  <Route path="/receitas/completas" element={<ReceitaCompletaLista />} />
  <Route path="/receitas/completas/novo" element={<ReceitaCompletaForm />} />
</Route>

<Route element={<ProtectedRoute perfisPermitidos={["Admin","Manager"]} />}>
  <Route path="/admin/produtos" element={<ProdutoLista />} />
  <Route path="/admin/produtos/novo" element={<ProdutoForm />} />
  <Route path="/admin/produtos/:id" element={<ProdutoDetalhe />} />
  <Route path="/relatorios/custos-e-precos" element={<RelatorioCustosEPrecos />} />
</Route>

// Rota pública — já existe em Fase 3, atualizar conteúdo
<Route path="/produtos" element={<PaginaProdutos />} />

### 4.3 Comportamento — Vitrine de Produtos

- `/produtos` já existe na Fase 3 — **substituir** o componente `AvisoConstrucao` pelo componente `VitrineProdutos`
- Buscar dados em: `GET /api/produtos/ativos`
- Exibir apenas: `nome_publico`, `descricao_publica`, `ingredientes_principais`
- Sem preços, custos ou dados internos

### 4.4 Mensagens ao Usuário

| Situação                        | Mensagem                                                                           |
| ------------------------------- | ---------------------------------------------------------------------------------- |
| Componente/receita criado       | ✅ "Cadastro realizado com sucesso!"                                                |
| Preço alterado com alerta ativo | ⚠️ "Atenção: o custo deste produto variou mais de 5%. Revise o preço de venda."    |
| Sem permissão para precificação | 🔒 "Acesso restrito: apenas Administradores e Gestores podem precificar produtos." |
| Item removido da composição     | ✅ "Item removido. Custo recalculado automaticamente."                              |

## 5. Fluxos Principais

### 🧩 Criar Componente → Usar em Produto

1. Cadastra componente com nome e modo de preparo
2. Adiciona insumos com quantidades → sistema copia valores de compra mais recentes
3. Cria produto → seleciona um ou mais componentes
4. Sistema soma todos os insumos → exibe custo total
5. Preço sugerido aparece automaticamente → usuário confirma ou altera → salva ✅

### 📖 Criar Produto com Receita Completa

1. Cadastra receita completa com insumos
2. Cria produto → vincula à receita completa
3. Adiciona itens extras se necessário
4. Precificação calcula automaticamente → preço sugerido disponível ✅

### ⚠️ Atualização de Preço de Insumo

1. Atualiza registro de compra de um insumo existente (Fase 1 — inalterado)
2. Sistema identifica todos os produtos afetados
3. Para cada produto afetado → recalcula custo → se variação ≥ 5% → mostra alerta ⚠️
4. Usuário acessa produto → vê alerta → ajusta preço final → alerta desaparece ✅

---

## 6. Pontos de Verificação Antes de Concluir

- Fases 1, 2 e 3 funcionam exatamente como antes — sem alterações ou quebras
- Team acessa receitas/componentes mas não vê aba de precificação
- Customer e visitantes veem apenas vitrine pública em `/produtos`
- Preço sugerido = custo × 2 e é editável
- Alterar preço final recalcula lucro e margens automaticamente
- Atualizar preço de insumo dispara recálculo e alerta quando ≥ 5%
- Componentes mostram insumos individuais no custo do produto — nunca como valor fechado
- Itens extras de texto livre entram no custo sem exigir cadastro de insumo
- Relatório lista todos os produtos com filtros de alerta e margem
- Nenhum arquivo existente foi removido ou renomeado
- Sem erros no console do navegador
- Migração aplicada sem perder dados anteriores

---

*ConfeitarIA — Fase 4: Receitas, Custos e Produtos no Ar*
