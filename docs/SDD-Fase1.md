# SDD — Especificação de Detalhamento
## Fase 1: Controle de Insumos e Evolução de Preços

**Versão:** 1.0
**Data:** 01/11/2026
**Status:** Escopo fechado — em desenvolvimento

---

## 1. Objetivo da Fase

Estabelecer o módulo de gestão de insumos com registro de compras, histórico de preços e visualização de variação de custos. Resolve a dor principal: **ausência de histórico de evolução de preços em planilhas**.

---

## 2. Modelo de Dados

### 2.1 Tabela: `insumos`

| Campo | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | SERIAL | PK | Identificador único |
| `nome` | VARCHAR(200) | NOT NULL, UNIQUE | Nome do insumo |
| `unidade_medida` | VARCHAR(20) | NOT NULL | Unidade de medida (g, kg, ml, l, un, m, min, etc.) |
| `ativo` | BOOLEAN | DEFAULT true | Status do cadastro |
| `data_criacao` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Data de criação do registro |

### 2.2 Tabela: `registros_compra`

| Campo | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | SERIAL | PK | Identificador único |
| `insumo_id` | INT | FK → insumos(id) ON DELETE RESTRICT | Vínculo com o insumo |
| `data_compra` | DATE | NOT NULL | Data da aquisição |
| `quantidade` | DECIMAL(12,4) | NOT NULL | Quantidade comprada |
| `valor_total` | DECIMAL(10,2) | NOT NULL | Valor total pago |
| `valor_unitario` | DECIMAL(12,6) | GENERATED ALWAYS AS (valor_total / quantidade) STORED | Calculado automaticamente |
| `fornecedor` | VARCHAR(200) | — | Nome do fornecedor (opcional) |
| `data_criacao` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Data de criação do registro |

### 2.3 Índices
- `idx_registros_insumo` ON registros_compra(insumo_id)
- `idx_registros_data` ON registros_compra(data_compra)

---

## 3. Regras de Negócio

### 3.1 Cadastro de Insumos
- R1.01 — Nome do insumo é obrigatório e não pode repetir
- R1.02 — Unidade de medida é obrigatória
- R1.03 — Exclusão física não é permitida; desativação via `ativo = false`
- R1.04 — Insumo inativo não aparece em listagens padrão
- R1.05 — Insumo inativo não aceita novos registros de compra
- R1.06 — Histórico de insumo inativo permanece acessível e preservado

### 3.2 Registro de Compras
- R2.01 — `valor_unitario` é calculado pelo banco de dados = `valor_total / quantidade`
- R2.02 — Usuário não informa valor unitário manualmente
- R2.03 — Data da compra é obrigatória
- R2.04 — Não é permitido registrar compra para insumo inativo
- R2.05 — Excluir um registro de compra não remove o insumo
- R2.06 — Após exclusão de registro, o valor unitário atual passa a ser do registro mais recente restante

### 3.3 Visualização e Gráfico
- R3.01 — Último registro = entrada com `data_compra` mais recente
- R3.02 — Gráfico exibe registros dos últimos 12 meses
- R3.03 — Eixo X = data da compra; Eixo Y = valor unitário
- R3.04 — Valor unitário atual do insumo = valor do último registro
- R3.05 — Filtro padrão lista apenas insumos ativos; opção para exibir inativos

### 3.4 Importação de Dados
- R4.01 — Cada linha da planilha gera: insumo (se novo) + registro de compra
- R4.02 — Se insumo já existe, apenas cria novo registro de compra
- R4.03 — Valor unitário da planilha é conferido com cálculo `valor_total / quantidade`
- R4.04 — Importação é executada uma vez; dados futuros via sistema

---

## 4. Funcionalidades — Detalhamento

| ID | Funcionalidade | Entrada | Saída |
|---|---|---|---|
| F1.1 | Cadastrar insumo | Nome, unidade de medida | Insumo criado |
| F1.2 | Editar insumo | Dados do insumo | Registro atualizado |
| F1.3 | Listar insumos | Filtro (ativo/inativo/todos) | Lista paginada |
| F1.4 | Visualizar insumo | ID do insumo | Dados + último registro + gráfico |
| F1.5 | Inativar insumo | ID do insumo | Status alterado |
| F2.1 | Registrar compra | Insumo, data, quantidade, valor total, fornecedor | Registro criado |
| F2.2 | Listar compras | ID do insumo | Histórico ordenado por data |
| F3.1 | Exibir último registro | ID do insumo | Data, quantidade, valor unitário |
| F3.2 | Exibir gráfico | ID do insumo | Variação de preço — últimos 12 meses |
| F4.1 | Importar planilha | Arquivo .xlsx | Relatório de importação |

---

## 5. Requisitos Não-Funcionais
- RNF1 — Resposta em menos de 2 segundos
- RNF2 — Interface responsiva (celular e desktop)
- RNF3 — Validação de dados antes de persistir
- RNF4 — Tratamento de erros com mensagens claras
- RNF5 — Código organizado por camadas, com separação de responsabilidades

---

## 6. Glossário
| Termo | Significado |
|---|---|
| Insumo | Matéria-prima, embalagem ou material consumido na produção |
| Registro de Compra | Entrada individual de aquisição de um insumo |
| Valor Unitário | Custo por unidade de medida — calculado automaticamente |
| Inativação | Desativação lógica sem exclusão de dados |
| Variação de Preço | Diferença percentual ou absoluta entre registros sequenciais |

---

## 7. Acompanhamento
- **Início da Fase 1:** A definir
- **Conclusão prevista:** A definir
- **Responsável:** Cliente + Assistência técnica
- **Alterações no escopo desta fase:** Devem ser registradas em documento de aditivo
