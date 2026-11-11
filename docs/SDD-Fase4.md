#  SDD-Fase4 — Receitas, Precificação e Produtos

**Projeto:** ConfeitarIA
**Versão:** 1.1
**Data:** 10/11/2026
**Status:** Ajustado e alinhado com Fases 1, 2 e 3

>
> ⚠️ **IMPORTANTE:** Nenhuma das implementações das Fases 1, 2 e 3 sofrerá alteração. Este documento estende o sistema com novas funcionalidades, mantendo 100% do que já foi construído. ✅

---

## 1. 🎯 OBJETIVO

Implementar o gerenciamento de **Componentes (módulos reutilizáveis)**, **Receitas Completas**, **Produtos**, **Precificação automática** com sugestão de margem e **Vitrine Pública de Produtos**, seguindo os mesmos padrões de modelagem, terminologia e controle de permissões estabelecidos nas fases anteriores.

---

## 2. 👥 CONTROLE DE ACESSO POR PERFIL — ALINHADO COM FASE 2

| Perfil        | Código     | Receitas Completas   | Componentes          | Precificação | Cadastro de Produtos | Relatório Custos | Vitrine Pública  |
| ------------- | ---------- | -------------------- | -------------------- | ------------ | -------------------- | ---------------- | ---------------- |
| Administrador | `Admin`    | ✅                    | ✅                    | ✅            | ✅                    | ✅                | ✅                |
| Gestor        | `Manager`  | ✅                    | ✅                    | ✅            | ✅                    | ✅                | ✅                |
| Equipe        | `Team`     | ✅ Leitura e cadastro            | ✅ Leitura e cadastro           | ❌ Sem acesso | ❌ Sem acesso         | ❌ Sem acesso     | ✅                |
| Cliente       | `Customer` | ❌ Sem acesso         | ❌ Sem acesso         | ❌ Sem acesso | ❌ Sem acesso         | ❌ Sem acesso     | ✅ Apenas leitura |
| Visitante     | —          | ❌ Sem acesso         | ❌ Sem acesso         | ❌ Sem acesso | ❌ Sem acesso         | ❌ Sem acesso     | ✅ Apenas leitura |

> **Regra de Aplicação no Backend:**
>
>
> - Endpoints de Receitas Completas e Componentes: `[Authorize(Roles = "Admin,Manager,Team")]`
> - Endpoints de Precificação, Cadastro de Produtos e Relatório de Custos: `[Authorize(Roles = "Admin,Manager")]`
> - Endpoints de Vitrine Pública: `[AllowAnonymous]` ou `[Authorize]` (acesso livre)
> - No Frontend: rotas protegidas com `<ProtectedRoute perfisPermitidos={["Admin","Manager","Team"]} />` conforme implementado na Fase 3

---

## 3. 📐 MODELO DE DADOS — ENTIDADES

### 3.1 🧩 Tabela: `componentes`

Peça reutilizável que pode fazer parte de vários produtos (ex: Massa de Chocolate, Recheio de Brigadeiro).
| Campo                   | Tipo           | Restrição                 | Descrição                            |
| ----------------------- | -------------- | ------------------------- | ------------------------------------ |
| `id`                    | `SERIAL`       | PK                        | Identificador único                  |
| `nome`                  | `VARCHAR(150)` | NOT NULL                  | Nome do componente                   |
| `descricao`             | `TEXT`         | —                         | Modo de preparo e observações        |
| `tempo_preparo_minutos` | `INT`          | —                         | Tempo estimado de preparo em minutos |
| `ativo`                 | `BOOLEAN`      | DEFAULT true              | Status do cadastro                   |
| `data_criacao`          | `TIMESTAMP`    | DEFAULT CURRENT_TIMESTAMP | Data de criação do registro          |
| `data_ultima_alteracao` | `TIMESTAMP`    | DEFAULT CURRENT_TIMESTAMP | Data da última modificação           |

### 3.2 📖 Tabela: `receitas_completas`

Produto único e fechado que é vendido diretamente, sem combinação com outros.
| Campo                   | Tipo           | Restrição                 | Descrição                         |
| ----------------------- | -------------- | ------------------------- | --------------------------------- |
| `id`                    | `SERIAL`       | PK                        | Identificador único               |
| `nome`                  | `VARCHAR(150)` | NOT NULL                  | Nome da receita                   |
| `descricao`             | `TEXT`         | —                         | Modo de preparo e observações     |
| `tempo_preparo_minutos` | `INT`          | —                         | Tempo total de preparo em minutos |
| `rendimento`            | `VARCHAR(100)` | —                         | Ex: "1 forma de 20cm"             |
| `ativo`                 | `BOOLEAN`      | DEFAULT true              | Status do cadastro                |
| `data_criacao`          | `TIMESTAMP`    | DEFAULT CURRENT_TIMESTAMP | Data de criação do registro       |
| `data_ultima_alteracao` | `TIMESTAMP`    | DEFAULT CURRENT_TIMESTAMP | Data da última modificação        |

### 3.3 📋 Tabela: `itens_receita`

Tabela de ligação — relaciona insumos com quantidades a uma Receita Completa ou Componente.
| Campo                     | Tipo            | Restrição                                                                       | Descrição                                          |
| ------------------------- | --------------- | ------------------------------------------------------------------------------- | -------------------------------------------------- |
| `id`                      | `SERIAL`        | PK                                                                              | Identificador único                                |
| `receita_completa_id`     | `INT`           | FK → `receitas_completas(id)` ON DELETE CASCADE                                 | Preenchido se for receita direta                   |
| `componente_id`           | `INT`           | FK → `componentes(id)` ON DELETE CASCADE                                        | Preenchido se for componente                       |
| `insumo_id`               | `INT`           | FK → `insumos(id)` ON DELETE RESTRICT                                           | Vínculo com insumo (Fase 1)                        |
| `quantidade`              | `DECIMAL(12,4)` | NOT NULL                                                                        | Quantidade utilizada do insumo                     |
| `valor_unitario_no_custo` | `DECIMAL(12,6)` | NOT NULL                                                                        | Cópia do último valor unitário de compra do insumo |
| `custo_item`              | `DECIMAL(12,6)` | NOT NULL GENERATED ALWAYS AS (`quantidade` \* `valor_unitario_no_custo`) STORED | Custo total do item                                |
| `data_criacao`            | `TIMESTAMP`     | DEFAULT CURRENT_TIMESTAMP                                                       | Data de criação do registro                        |
| `data_ultima_alteracao`   | `TIMESTAMP`     | DEFAULT CURRENT_TIMESTAMP                                                       | Data da última modificação                         |

> **Regra:** Apenas um dos campos `receita_completa_id` ou `componente_id` pode estar preenchido. Validação aplicada via `CHECK` constraint ou lógica de aplicação.

### 3.4 🏷️ Tabela: `produtos`

O que é apresentado na vitrine e comercializado. Pode ser montado a partir de uma Receita Completa ou combinando vários Componentes.
| Campo                     | Tipo           | Restrição                 | Descrição                                       |
| ------------------------- | -------------- | ------------------------- | ----------------------------------------------- |
| `id`                      | `SERIAL`       | PK                        | Identificador único                             |
| `nome_publico`            | `VARCHAR(200)` | NOT NULL                  | Nome exibido para o cliente                     |
| `descricao_publica`       | `TEXT`         | —                         | Descrição curta para vitrine pública            |
| `ingredientes_principais` | `TEXT`         | —                         | Versão amigável dos ingredientes para o cliente |
| `categoria_produto_id`    | `INT`          | —                         | Reservado para implementação futura             |
| `ativo`                   | `BOOLEAN`      | DEFAULT true              | Controla exibição na vitrine pública            |
| `data_criacao`            | `TIMESTAMP`    | DEFAULT CURRENT_TIMESTAMP | Data de criação do registro                     |
| `data_ultima_alteracao`   | `TIMESTAMP`    | DEFAULT CURRENT_TIMESTAMP | Data da última modificação                      |

### 3.5 🧩 Tabela: `produto_componentes`

Define a composição de um produto por meio de componentes ou receitas completas.
| Campo                   | Tipo        | Restrição                                        | Descrição                   |
| ----------------------- | ----------- | ------------------------------------------------ | --------------------------- |
| `id`                    | `SERIAL`    | PK                                               | Identificador único         |
| `produto_id`            | `INT`       | FK → `produtos(id)` ON DELETE CASCADE            | Referência ao produto       |
| `componente_id`         | `INT`       | FK → `componentes(id)` ON DELETE RESTRICT        | Componente utilizado        |
| `receita_completa_id`   | `INT`       | FK → `receitas_completas(id)` ON DELETE RESTRICT | Receita completa utilizada  |
| `ordem`                 | `INT`       | NOT NULL                                         | Ordem de exibição/montagem  |
| `data_criacao`          | `TIMESTAMP` | DEFAULT CURRENT_TIMESTAMP                        | Data de criação do registro |
| `data_ultima_alteracao` | `TIMESTAMP` | DEFAULT CURRENT_TIMESTAMP                        | Data da última modificação  |

> **Regra:** Um produto pode ter vários componentes/receitas associados. Apenas um dos campos `componente_id` ou `receita_completa_id` é preenchido por linha.

### 3.6 ➕ Tabela: `itens_extras_produto`

Itens adicionais ao produto que não fazem parte de nenhuma receita ou componente.
| Campo                   | Tipo            | Restrição                                                              | Descrição                                   |
| ----------------------- | --------------- | ---------------------------------------------------------------------- | ------------------------------------------- |
| `id`                    | `SERIAL`        | PK                                                                     | Identificador único                         |
| `produto_id`            | `INT`           | FK → `produtos(id)` ON DELETE CASCADE                                  | Referência ao produto                       |
| `insumo_id`             | `INT`           | FK → `insumos(id)` ON DELETE RESTRICT                                  | Se for insumo cadastrado                    |
| `descricao_item`        | `VARCHAR(200)`  | —                                                                      | Texto livre para item genérico              |
| `quantidade`            | `DECIMAL(12,4)` | —                                                                      | Aplicável apenas para insumos cadastrados   |
| `valor_unitario`        | `DECIMAL(12,6)` | NOT NULL                                                               | Automático (insumo) ou manual (texto livre) |
| `custo_item`            | `DECIMAL(12,6)` | NOT NULL GENERATED ALWAYS AS (`quantidade` \* `valor_unitario`) STORED | Custo total do item extra                   |
| `data_criacao`          | `TIMESTAMP`     | DEFAULT CURRENT_TIMESTAMP                                              | Data de criação do registro                 |
| `data_ultima_alteracao` | `TIMESTAMP`     | DEFAULT CURRENT_TIMESTAMP                                              | Data da última modificação                  |

> **Regra:** Ou `insumo_id` é preenchido, ou `descricao_item` + `valor_unitario` é preenchido — nunca ambos. Validação via lógica de aplicação.

### 3.7 💰 Tabela: `precificacoes`

Dados de custo, margem e preço de venda — uma por produto (relação 1:1).
| Campo                        | Tipo            | Restrição                                    | Descrição                                                           |
| ---------------------------- | --------------- | -------------------------------------------- | ------------------------------------------------------------------- |
| `id`                         | `SERIAL`        | PK                                           | Identificador único                                                 |
| `produto_id`                 | `INT`           | FK → `produtos(id)` UNIQUE ON DELETE CASCADE | Relação 1:1 com Produto                                             |
| `custo_total_insumos`        | `DECIMAL(12,2)` | NOT NULL                                     | Soma de todos os insumos + itens extras                             |
| `tempo_mao_obra_minutos`     | `INT`           | —                                            | Tempo total de mão de obra, opcional                                |
| `valor_hora_mao_obra`        | `DECIMAL(10,2)` | —                                            | Valor por hora de mão de obra, opcional                             |
| `custo_mao_de_obra`          | `DECIMAL(12,2)` | —                                            | Calculado: (`tempo_mao_obra_minutos` / 60) \* `valor_hora_mao_obra` |
| `custo_total_anterior`       | `DECIMAL(12,2)` | —                                            | Valor do custo na última atualização de preço                       |
| `custo_total`                | `DECIMAL(12,2)` | NOT NULL                                     | `custo_total_insumos` + `custo_mao_de_obra`                         |
| `variacao_custo_percentual`  | `DECIMAL(5,2)`  | —                                            | Variação percentual em relação ao custo anterior                    |
| `alerta_variacao_preco`      | `BOOLEAN`       | DEFAULT false                                | true se variação ≥ 5%                                               |
| `margem_sugerida_percentual` | `DECIMAL(5,2)`  | NOT NULL DEFAULT 100.00                      | Margem padrão de 100%                                               |
| `preco_sugerido`             | `DECIMAL(10,2)` | NOT NULL                                     | `custo_total` \* (1 + `margem_sugerida_percentual` / 100)           |
| `preco_venda_final`          | `DECIMAL(10,2)` | NOT NULL                                     | Inicialmente = `preco_sugerido` — editável                          |
| `lucro_bruto`                | `DECIMAL(10,2)` | NOT NULL                                     | `preco_venda_final` - `custo_total`                                 |
| `margem_real_sobre_custo`    | `DECIMAL(5,2)`  | NOT NULL                                     | (`lucro_bruto` / `custo_total`) \* 100                              |
| `margem_real_sobre_venda`    | `DECIMAL(5,2)`  | NOT NULL                                     | (`lucro_bruto` / `preco_venda_final`) \* 100                        |
| `data_ultima_atualizacao`    | `TIMESTAMP`     | DEFAULT CURRENT_TIMESTAMP                    | Atualizado a cada alteração                                         |

## 4. 🔗 REGRAS DE CÁLCULO E NEGÓCIO

### 4.1 Cálculo do Custo Total do Produto

custo_total_insumos =
    Σ (todos os itens_receita de todos os componentes vinculados ao produto)
  + Σ (todos os itens_receita da receita_completa vinculada ao produto)
  + Σ (itens_extras_produto do produto)

custo_total = custo_total_insumos + (custo_mao_de_obra se informado)
> ✅ **Transparência:** Todos os insumos de componentes são desmembrados e listados individualmente no custo do produto. Nunca ficam como valor fechado.

### 4.2 Regra de Alerta de Variação de Preço

- Quando um registro de compra é atualizado ou inserido na Fase 1, o sistema identifica todos os produtos que usam aquele insumo
- Para cada produto afetado:
  - Salva o `custo_total` atual em `custo_total_anterior`
  - Recalcula o novo `custo_total`
  - Calcula `variacao_custo_percentual = ((novo_custo - custo_anterior) / custo_anterior) * 100`
  - Se `ABS(variacao_custo_percentual) >= 5` → marca `alerta_variacao_preco = true` ⚠️
- O alerta é desativado quando o usuário atualiza o `preco_venda_final` do produto

### 4.3 Regra de Sugestão de Preço

- `margem_sugerida_percentual` padrão = **100%**
- `preco_sugerido = custo_total × 2`
- O valor é copiado para `preco_venda_final` na criação
- Usuário com permissão (`Admin` ou `Manager`) pode alterar livremente o `preco_venda_final`
- Ao alterar o preço final, `lucro_bruto`, `margem_real_sobre_custo` e `margem_real_sobre_venda` são recalculados automaticamente

### 4.4 Análise de Impacto — Regra 80/20 (Pareto)

Na tela de precificação e no relatório:

- São exibidos **TODOS** os insumos com quantidade, valor unitário e custo do item
- Uma seção destacada mostra os itens que representam aproximadamente 80% do custo total
- Os demais itens são agrupados visualmente como "Demais insumos"
- Sempre há opção de expandir para visualização completa

---

## 5. 📑 FUNCIONALIDADES E ENDPOINTS

### 5.1 🧩 Componentes

| Método | Rota                             | Perfil               | Descrição                   |
| ------ | -------------------------------- | -------------------- | --------------------------- |
| GET    | `/api/componentes`               | `Admin,Manager,Team` | Listar todos ativos         |
| GET    | `/api/componentes/inativos`      | `Admin,Manager,Team` | Listar inativos             |
| GET    | `/api/componentes/{id}`          | `Admin,Manager,Team` | Visualizar detalhes + itens |
| POST   | `/api/componentes`               | `Admin,Manager,Team` | Criar novo                  |
| PUT    | `/api/componentes/{id}`          | `Admin,Manager,Team` | Editar                      |
| PATCH  | `/api/componentes/{id}/inativar` | `Admin,Manager,Team` | Inativar                    |
| POST   | `/api/componentes/{id}/itens`    | `Admin,Manager,Team` | Adicionar insumo            |
| PUT    | `/api/componentes/itens/{id}`    | `Admin,Manager,Team` | Editar insumo               |
| DELETE | `/api/componentes/itens/{id}`    | `Admin,Manager,Team` | Remover insumo              |

### 5.2 📖 Receitas Completas

| Método | Rota                                    | Perfil               | Descrição                   |
| ------ | --------------------------------------- | -------------------- | --------------------------- |
| GET    | `/api/receitas-completas`               | `Admin,Manager,Team` | Listar todos ativos         |
| GET    | `/api/receitas-completas/inativos`      | `Admin,Manager,Team` | Listar inativos             |
| GET    | `/api/receitas-completas/{id}`          | `Admin,Manager,Team` | Visualizar detalhes + itens |
| POST   | `/api/receitas-completas`               | `Admin,Manager,Team` | Criar nova                  |
| PUT    | `/api/receitas-completas/{id}`          | `Admin,Manager,Team` | Editar                      |
| PATCH  | `/api/receitas-completas/{id}/inativar` | `Admin,Manager,Team` | Inativar                    |
| POST   | `/api/receitas-completas/{id}/itens`    | `Admin,Manager,Team` | Adicionar insumo            |
| PUT    | `/api/receitas-completas/itens/{id}`    | `Admin,Manager,Team` | Editar insumo               |
| DELETE | `/api/receitas-completas/itens/{id}`    | `Admin,Manager,Team` | Remover insumo              |

### 5.3 🏷️ Produtos

| Método | Rota                              | Perfil               | Descrição                           |
| ------ | --------------------------------- | -------------------- | ----------------------------------- |
| GET    | `/api/produtos`                   | `Admin,Manager,Team` | Listar todos                        |
| GET    | `/api/produtos/ativos`            | Público              | Listar apenas ativos (para vitrine) |
| GET    | `/api/produtos/{id}`              | `Admin,Manager,Team` | Detalhes completos + composição     |
| GET    | `/api/produtos/{id}/publico`      | Público              | Dados públicos apenas               |
| POST   | `/api/produtos`                   | `Admin,Manager`      | Criar novo                          |
| PUT    | `/api/produtos/{id}`              | `Admin,Manager`      | Editar dados públicos               |
| PATCH  | `/api/produtos/{id}/inativar`     | `Admin,Manager`      | Inativar                            |
| POST   | `/api/produtos/{id}/componentes`  | `Admin,Manager`      | Adicionar componente/receita        |
| PUT    | `/api/produtos/componentes/{id}`  | `Admin,Manager`      | Alterar ordem/componente            |
| DELETE | `/api/produtos/componentes/{id}`  | `Admin,Manager`      | Remover da composição               |
| POST   | `/api/produtos/{id}/itens-extras` | `Admin,Manager`      | Adicionar item extra                |
| PUT    | `/api/produtos/itens-extras/{id}` | `Admin,Manager`      | Editar item extra                   |
| DELETE | `/api/produtos/itens-extras/{id}` | `Admin,Manager`      | Remover item extra                  |

### 5.4 💰 Precificação

| Método | Rota                                  | Perfil          | Descrição                         |
| ------ | ------------------------------------- | --------------- | --------------------------------- |
| GET    | `/api/produtos/{id}/precificacao`     | `Admin,Manager` | Dados completos de custo e preço  |
| PUT    | `/api/produtos/{id}/precificacao`     | `Admin,Manager` | Atualizar preço final + MO        |
| GET    | `/api/produtos/{id}/composicao-custo` | `Admin,Manager` | Lista completa de insumos + 80/20 |

### 5.5 📊 Relatório de Custos e Preços

| Método | Rota                                       | Perfil          | Descrição                  |
| ------ | ------------------------------------------ | --------------- | -------------------------- |
| GET    | `/api/relatorios/custos-e-precos`          | `Admin,Manager` | Lista completa com filtros |
| GET    | `/api/relatorios/custos-e-precos/exportar` | `Admin,Manager` | Exportação para planilha   |

### 5.6 🍰 Vitrine Pública

- **Reutiliza a estrutura de página** criada na Fase 3 — `/produtos`
- Busca os produtos ativos via `GET /api/produtos/ativos`
- Exibe apenas: `nome_publico`, `descricao_publica`, `ingredientes_principais`
- Sem dados de custo, precificação ou modo de preparo

---

## 6. ✅ CRITÉRIOS DE ACEITE

### 6.1 🔒 Permissões e Controle de Acesso

- Usuário com perfil **`Team`** consegue listar, visualizar, criar, editar e inativar Receitas Completas e Componentes, mas **não visualiza** a aba de Precificação nem tem acesso ao relatório de Custos e Preços
- Usuário com perfil **`Customer`** ou visitante não logado acessa a vitrine de produtos e vê apenas os dados públicos (nome, descrição pública, ingredientes principais) — sem qualquer informação de custo, preço interno ou modo de preparo
- Usuário com perfil **`Admin`** e **`Manager`** tem acesso completo a todas as funcionalidades, incluindo precificação e relatórios
- Tentativa de acesso direto via API a rotas de precificação por usuário sem permissão retorna **HTTP 403 Forbidden**
- A aba de Precificação e o Relatório de Custos não aparecem no menu para perfis sem permissão

---

### 6.2 🧩 Cadastro e Gestão de Componentes

- Consigo cadastrar um Componente informando: nome, descrição, tempo de preparo e status ativo
- Consigo adicionar múltiplos insumos a um Componente, informando a quantidade de cada um
- Ao salvar, o sistema copia automaticamente o **valor unitário da última compra** de cada insumo e calcula o custo do item
- Consigo editar os dados de um Componente e seus itens de insumo
- Consigo inativar um Componente sem excluí-lo do histórico
- As datas de criação e última alteração são preenchidas automaticamente

---

### 6.3 📖 Cadastro e Gestão de Receitas Completas

- Consigo cadastrar uma Receita Completa informando: nome, descrição, tempo de preparo e rendimento
- Consigo adicionar múltiplos insumos com quantidades à receita
- O custo de cada item é calculado automaticamente com base no valor de compra mais recente do insumo
- Consigo editar e inativar receitas sem perda de histórico
- As datas de criação e última alteração são preenchidas automaticamente

---

### 6.4 🏷️ Montagem de Produtos

- Consigo criar um Produto vinculando a **uma Receita Completa** diretamente
- Consigo criar um Produto combinando **um ou mais Componentes**, definindo a ordem de montagem
- Consigo adicionar **Itens Extras** de dois tipos: insumos já cadastrados no sistema OU itens de texto livre com valor unitário manual
- Itens extras de texto livre entram no cálculo do custo total sem exigir vínculo com o cadastro de insumos
- A composição do produto pode ser visualizada e alterada a qualquer momento

---

### 6.5 💰 Cálculo de Custos e Precificação

- O **Custo Total de Insumos** é calculado somando todos os insumos de todos os componentes/receitas do produto + itens extras
- Posso informar tempo de mão de obra e valor da hora — o custo é calculado e adicionado ao custo total; se deixar em branco, é ignorado sem erros
- O sistema **sempre sugere** preço com margem de 100% sobre o custo total
- O preço sugerido pode ser alterado livremente pelo usuário; ao alterar, lucro bruto, margem sobre custo e margem sobre venda são recalculados instantaneamente
- Visualizo a **lista completa** de todos os insumos, quantidades e custos unitários que compõem o produto
- A análise de impacto destaca os itens que representam aproximadamente 80% do custo total, sem ocultar os demais itens que podem ser visualizados em lista expandida

---

### 6.6 ⚠️ Alerta de Variação de Preço

- Ao atualizar o preço de compra de um insumo, todos os produtos que o utilizam têm seu custo recalculado automaticamente
- Se a variação do custo total for **≥ 5%** para cima ou para baixo, o produto recebe um **alerta visível** na listagem e na tela de precificação
- O alerta mostra a variação percentual e o custo anterior vs. atual
- O alerta é automaticamente removido quando o usuário revisa e salva o preço de venda final do produto

---

### 6.7 📊 Relatório de Custos e Preços

- O relatório lista todos os produtos ativos com: nome, custo total, preço sugerido, preço final, margem real e status de alerta
- Consigo filtrar produtos com alerta de variação ativo
- Consigo filtrar produtos com margem abaixo ou acima da sugerida
- Clicar em um produto no relatório leva à tela de precificação com a composição detalhada

---

### 6.8 🍰 Vitrine Pública de Produtos

- A vitrine exibe apenas produtos marcados como ativos
- São exibidos: nome público, descrição pública e ingredientes principais
- **Não aparecem** preços de venda, custos, margens, modo de preparo ou lista detalhada de insumos
- A página é acessível sem login e mantém o layout responsivo existente

---

### 6.9 🔒 Integridade com Implementações Anteriores

- Nenhuma funcionalidade das Fases 1, 2 e 3 sofre alteração ou quebra com a implementação da Fase 4
- Insumos e histórico de compras continuam funcionando exatamente como antes
- Autenticação, login, perfis e recuperação de senha permanecem inalterados
- Navegação pública, páginas e layout existentes continuam funcionando sem modificações
