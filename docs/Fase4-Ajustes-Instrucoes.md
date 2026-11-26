## Instruções de Implementação — Ajustes de UX Fase 4

**Projeto:** ConfeitarIA
**Versão:** 1.0
**Data:** 16/11/2026

>
> 📚 **Consulte antes de começar:**
>
>
> - `/docs/SDD-Fase4.md` — Especificação original da Fase 4
> - `/docs/SDD-Fase4 - Ajuste e revisão.md` — Fluxo de negócio revisado
> - `/docs/SDD-Fase4-Ajustes de UX e Fluxo.md` — Documento de especificação
> - `README.md` — Visão geral e estrutura do projeto
>
>
> ⚠️ **REGRA DE OURO:** Nenhum arquivo, rota ou funcionalidade das Fases 1, 2 e 3 deve ser modificado. Apenas adicione e altere o que está explicitamente descrito aqui. **Crie migration para qualquer alteração de estrutura de banco de dados. Teste tudo antes de finalizar.**

---

## 1. Backend — Alterações

### 1.1 Migração — Novos Campos na Tabela `produtos`

```
dotnet ef migrations add Fase4_Ajustes_Produtos_Caracteristicas
```

Aplicar os campos conforme SDD-Fase4-Ajustes.md, seção 4.4.

### 1.2 Serviços e DTOs

- Atualizar DTO de Produto para incluir os novos campos
- Atualizar serviço de listagem para aplicar os novos filtros (Origem, Tipo, Alerta)
- Atualizar lógica de composição: distinguir produto de receita vs personalizado na montagem da tabela de ingredientes
- Atualizar permissões nos endpoints: Editar e Precificação → `[Authorize(Roles = "Admin,Manager")]`

---

## 2. Frontend — Alterações por Tela

### 2.1 🧩 Componentes e 📖 Receitas — Custo em Tempo Real

- Adicionar elemento de exibição do total calculado
- Criar função de cálculo que executa a cada alteração na lista de itens
- Aplicar na tela de cadastro **e** de edição

### 2.2 🏷️ Produtos — Listagem

- Adicionar botão **"+ Novo Produto"**
- Atualizar cabeçalhos da tabela: "Receita" → "Origem"; adicionar coluna "Tipo"; centralizar "Ações"
- Implementar filtros: Origem, Tipo, Alerta de Custo — aplicar na consulta

### 2.3 🏷️ Criar/Editar Produto

- Reorganizar campos na ordem definida
- Implementar lógica de Origem (somente leitura)
- Implementar dropdown Tipo de Produto com valores definidos
- Agrupar características especiais em bloco visual organizado
- Tabela de ingredientes: colunas corretas; campos travados quando origem ≠ Personalizado
- Botões "+ Adicionar Receita Completa" e "+ Adicionar Componente" — visíveis apenas na criação
- Bloco Itens Extras — tipo de item, seleção, quantidade, adicionar, remover

### 2.4 👁️ Detalhes do Produto

- Remover bloco Itens Extras
- Atualizar título e texto informativo da composição
- Remover colunas Valor Unitário e Custo da tabela
- Ocultar botões Editar e Precificação para perfil Team
- Exibir características especiais de forma organizada abaixo da descrição

### 2.5 🍰 Vitrine Pública

- Incluir exibição das características especiais (Sem Lactose, Sem Glúten, Vegano, Especificações) abaixo da descrição do produto

---

## 3. ✅ Verificação Antes de Concluir

- Migration criada, aplicada e sem perda de dados
- Fases 1, 2 e 3 funcionam inalteradas
- Custo em tempo real funciona em cadastro e edição
- Filtros novos funcionam corretamente
- Mesma tela cria e edita produtos
- Origem exibida corretamente
- Ingredientes travados para produtos de receita
- Botões de adicionar aparecem apenas quando devem
- Itens Extras disponíveis em criar e editar
- Detalhes não mostra valores de custo nem Itens Extras
- Botões corretos visíveis por perfil
- Características aparecem em detalhes e vitrine pública
- `README.md` está atualizado

>
> ⚠️ **FINAL:** Após tudo implementado e testado, confirme que o sistema está estável e funcionando corretamente em todas as telas. Então atualize o `README.md` se necessário e considere esta fase concluída.
