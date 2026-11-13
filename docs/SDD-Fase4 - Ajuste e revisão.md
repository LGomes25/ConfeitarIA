# SDD-Fase4 — Ajuste e Revisão

## Receitas, Precificação e Produtos — Fluxo Revisado

**Projeto:** ConfeitarIA
**Versão:** 1.2 — Ajuste de Fluxo
**Data:** 12/11/2026

>
> ⚠️ **IMPORTANTE:** Nada das Fases 1, 2 e 3 será alterado. Apenas ajustes pontuais na Fase 4 conforme abaixo. Leia também os arquivos originais `SDD-Fase4.md` e `Fase4-Instrucoes.md` para manter consistência total.

---

## 1. 🎯 Principais Alterações em Relação à Versão Anterior
| Item                    | Antes                                      | Agora                                                       |
| ----------------------- | ------------------------------------------ | ----------------------------------------------------------- |
| Receita Completa        | Apenas insumos avulsos                     | ✅ Insumos + Componentes podem ser adicionados               |
| Produto                 | Cadastro manual separado                   | ✅ Gerado automaticamente ao salvar uma Receita Completa     |
| Vínculo Produto         | Pode receber Receita OU vários Componentes | ✅ Apenas uma Receita Completa por produto                   |
| Ingredientes Principais | Campo de texto livre                       | ✅ Gerado automaticamente com checkboxes na lista de insumos |
| Marcas especiais        | —                                          | ✅ Sem Lactose, Sem Glúten, Vegano, Outro                    |
| Vitrine Pública         | Ativo/Inativo                              | ✅ "Apresentar ao público": Sim/Não — padrão = Não           |
| Custos e Preços         | Lista genérica                             | ✅ Apenas Produtos vinculados a Receitas                     |
| Orçamentos              | Previsto                                   | ✅ Removido — implementação futura                           |

## 2. 📖 Receita Completa — Adição de Componentes

### 2.1 Ajuste de Tela

Mantém todos os campos existentes. Acrescenta:

- Botão **"+ Adicionar Componente"** ao lado de "+ Adicionar insumo"
- Seletor de componente → ao confirmar, ele é incluído na lista
- Item de componente aparece agrupado → pode expandir para ver seus insumos
- Insumos do componente são **desdobrados no cálculo de custo** da receita

### 2.2 Modelo de Dados — Sem alteração de tabela

A tabela `itens_receita` já suporta ambos:

- `insumo_id` → para insumos avulsos
- `componente_id` → para componentes inteiros

>
> ✅ Nenhuma migração nova necessária — apenas liberar a opção na interface

---

## 3. 🏷️ Produto — Fluxo Automático e Dados Públicos

### 3.1 Criação Automática

>
> Ao salvar uma **Receita Completa**, o sistema verifica:
>
>
> - Se já existe um produto vinculado a ela → apenas atualiza
> - Se não existe → **cria automaticamente** um produto vinculado
> - Nome público inicial = nome da receita → usuário pode alterar depois

### 3.2 Campos da Tela de Produto

| Campo                   | Tipo        | Descrição                                   |
| ----------------------- | ----------- | ------------------------------------------- |
| Receita vinculada       | Texto       | Somente leitura — nome da receita de origem |
| Nome público            | Texto\*     | Nome que aparece na vitrine                 |
| Descrição pública       | Texto longo | Apresentação do produto                     |
| Ingredientes Principais | Texto longo | ✅ Gerado automaticamente — ver 3.3          |
| Sem Lactose             | Checkbox    | Marcação especial                           |
| Sem Glúten              | Checkbox    | Marcação especial                           |
| Vegano                  | Checkbox    | Marcação especial                           |
| Outro                   | Texto curto | Outras características (ex: "Sem açúcar")   |
| Apresentar ao público   | Select      | Sim / Não → Padrão: Não                     |

### 3.3 Seleção de Ingredientes Principais

- Sistema carrega **todos os insumos** da receita (incluindo os desdobrados de componentes)
- Cada linha tem um checkbox: **"Ingrediente principal"**
- Ao salvar: sistema concatena os nomes dos itens marcados → preenche automaticamente o campo `Ingredientes Principais`
- Exemplo: "Farinha de trigo, Açúcar, Ovos, Manteiga"

### 3.4 Regra de Vitrine

- Vitrine pública (`/produtos`) exibe **apenas** produtos com "Apresentar ao público = Sim"
- Produtos marcados como "Não" existem no sistema mas são invisíveis ao público

---

## 4. 💰 Custos e Preços

- Lista mostra **apenas produtos vinculados a receitas** (produtos sem receita não aparecem)
- Cada linha: Nome público → Custo total → Preço sugerido → Preço final → Margem → Alerta → Ação "Precificar"
- Clicar em Precificar abre tela de detalhes com composição completa e análise 80/20

---

## 5. 📝 Orçamentos — Removido do Escopo Atual

>
> Área de orçamentos para bolos decorados será implementada em **fase futura**. Nada referente a isso deve ser criado agora.

---

## ✅ Critérios de Aceite — Atualizados

- Em Receita Completa, consigo adicionar tanto insumos quanto componentes
- Componentes adicionados na receita têm seus insumos desdobrados no custo total
- Ao salvar receita completa, produto é criado/atualizado automaticamente
- Nome público pode ser diferente do nome da receita
- Visualizo todos os insumos da receita com checkbox "Ingrediente principal"
- Campo "Ingredientes Principais" é preenchido automaticamente com os itens marcados
- Marcas especiais disponíveis: Sem Lactose, Sem Glúten, Vegano, Outro
- "Apresentar ao público" vem como Não por padrão — só aparece na vitrine se alterado para Sim
- Custos e Preços lista apenas produtos com receita vinculada
- Fases 1, 2 e 3 continuam funcionando sem alterações
