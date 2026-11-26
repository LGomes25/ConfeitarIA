#  Fase4-Instrucoes-Ajuste.md

## Instruções de Implementação — Ajustes de Fluxo Fase 4

**Projeto:** ConfeitarIA
**Versão:** 1.2
**Data:** 12/11/2026

>
> ⚠️ **Leia primeiro:** Consulte `SDD-Fase4.md` e `Fase4-Instrucoes.md` para o contexto completo. Este documento contém **apenas as alterações e complementos necessários** — não repete o que já está definido nos arquivos originais. Nada das Fases 1, 2 e 3 será alterado.

---

## 1. 🎯 Escopo destas Instruções

Estas instruções complementam e ajustam o que foi definido anteriormente. Aplicar **apenas os pontos abaixo**:
| # | Área                | Ação                                                |
| - | ------------------- | --------------------------------------------------- |
| 1 | 📖 Receita Completa | Adicionar opção de inserir Componentes na receita   |
| 2 | 🏷️ Produto         | Fluxo automático a partir da Receita + novos campos |
| 3 | 💰 Custos e Preços  | Filtrar apenas produtos com receita vinculada       |
| 4 | 🚫 Orçamentos       | Remover do escopo atual — implementação futura      |

## 2. 📖 Receita Completa — Adicionar Componentes

### 2.1 Backend

- ✅ **NÃO criar novas tabelas ou migrações** — a coluna `componente_id` já existe em `itens_receita`
- No serviço de Receita Completa: permitir que `componente_id` seja informado ao adicionar um item
- Ao incluir um componente: seus insumos são carregados e considerados no cálculo de custo da receita
- Regra de validação: o item deve ter **apenas um** preenchido — `insumo_id` OU `componente_id`

### 2.2 Frontend

- Na tela de cadastro/edição de Receita Completa, ao lado de **"+ Adicionar insumo"**, adicionar botão: **"+ Adicionar Componente"**
- Ao clicar: abre um modal com lista de Componentes ativos → seleciona um → confirma
- O componente aparece na lista com ícone diferenciado → pode expandir para visualizar seus insumos
- Itens do componente são **somente leitura** na receita — alteração só no cadastro do componente

---

## 3. 🏷️ Produto — Fluxo Automático e Novos Campos

### 3.1 Backend — Criação Automática

No método de salvamento de Receita Completa, **após confirmação de sucesso**:

Ao salvar Receita Completa:
  → Buscar Produto onde receita_completa_id = Id da receita
  → Se não existir:
      • Criar produto com:
        nome_publico = receita.Nome
        receita_completa_id = receita.Id
        apresentar_ao_publico = false (padrão)
        ativo = true
  → Se existir:
      • Atualizar apenas nome_publico (se não foi alterado manualmente) e dados de vínculo

### 3.2 Modelo de Dados — Novos Campos na Tabela `produtos`

>
> ⚠️ Criar migração **apenas com estes novos campos**:
| Campo                   | Tipo           | Padrão  | Descrição                    |
| ----------------------- | -------------- | ------- | ---------------------------- |
| `sem_lactose`           | `BOOLEAN`      | `false` | Marcação especial            |
| `sem_gluten`            | `BOOLEAN`      | `false` | Marcação especial            |
| `vegano`                | `BOOLEAN`      | `false` | Marcação especial            |
| `especificacao_extra`   | `VARCHAR(100)` | `NULL`  | Campo de texto livre         |
| `apresentar_ao_publico` | `BOOLEAN`      | `false` | Controla exibição na vitrine |

### 3.3 Frontend — Tela de Produto

- Remover botão de "Novo Produto" — criação é automática
- A tela passa a ser de **visualização e edição de dados complementares**:
  - ✅ Exibe nome da receita vinculada (somente leitura)
  - ✅ Nome público — editável
  - ✅ Descrição pública — editável
  - ✅ Lista de insumos da receita → cada um com checkbox **"Ingrediente principal"**
  - ✅ Campo `ingredientes_principais` — preenchimento automático ao salvar, baseado nos checkboxes marcados
  - ✅ Checkboxes: Sem Lactose / Sem Glúten / Vegano
  - ✅ Campo de texto: "Especificações adicionais"
  - ✅ Seleção: "Apresentar ao público" → Sim / Não (padrão = Não)

>
> 💡 **Lógica de geração do texto:** Ao salvar, o sistema percorre os itens com checkbox marcado, concatena os nomes separados por vírgula e salva no campo `ingredientes_principais`.

---

## 4. 💰 Custos e Preços — Filtro de Exibição

- No serviço de relatório: alterar consulta para retornar **apenas produtos onde `receita_completa_id IS NOT NULL`**
- Manter todos os demais campos, cálculos e filtros existentes inalterados

---

## 5. 🚫 O QUE NÃO FAZER — Importante

- ❌ **Não criar** área de orçamentos / bolos decorados — implementação futura
- ❌ **Não permitir** vincular múltiplos componentes diretamente no produto — o fluxo é: Componentes → Receita Completa → Produto
- ❌ **Não modificar** telas, regras ou fluxos das Fases 1, 2 e 3
- ❌ **Não remover** nenhum campo ou funcionalidade existente na Fase 4

---

## 6. ✅ Verificação Final

- Receita Completa aceita insumos avulsos E componentes
- Componentes na receita têm seus insumos visíveis e custo calculado corretamente
- Salvar receita → produto é criado/atualizado automaticamente
- Novos campos de especificação e controle de vitrine funcionam
- Ingredientes principais são gerados corretamente a partir dos checkboxes
- Custos e Preços exibe apenas produtos com receita vinculada
- Nenhuma funcionalidade anterior foi quebrada
